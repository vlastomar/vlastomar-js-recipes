import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [
    confirmPassword,
    setConfirmPassword
  ] = useState('');

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const query = new URLSearchParams(
      window.location.search
    );

    const hash = new URLSearchParams(
      window.location.hash.slice(1)
    );

    const recoveryLink =
      query.get('type') === 'recovery' ||
      hash.get('type') === 'recovery' ||
      query.has('code') ||
      query.has('token_hash');

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        if (
          event === 'PASSWORD_RECOVERY'
        ) {
          setReady(true);
          setChecking(false);
        } else if (
          event === 'SIGNED_IN' &&
          recoveryLink &&
          session
        ) {
          setReady(true);
          setChecking(false);
        }
      }
    );

    async function checkLink() {
      try {
        if (
          query.has('error') ||
          hash.has('error')
        ) {
          throw new Error(
            query.get('error_description') ||
            hash.get('error_description') ||
            'Невалиден или изтекъл линк.'
          );
        }

        if (
          query.has('token_hash')
        ) {
          const { error } =
            await supabase.auth.verifyOtp({
              token_hash:
                query.get('token_hash'),
              type: 'recovery'
            });

          if (error) throw error;

          if (active) {
            setReady(true);
          }
        } else if (recoveryLink) {
          const { data, error } =
            await supabase.auth.getSession();

          if (error) throw error;

          if (
            active &&
            data.session
          ) {
            setReady(true);
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    checkLink();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 8) {
      setError(
        'Паролата трябва да има поне 8 символа.'
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        'Паролите не съвпадат.'
      );
      return;
    }

    setSaving(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password
        });

      if (error) throw error;

      await supabase.auth.signOut();

      setReady(false);

      setMessage(
        'Паролата е сменена. Вече можеш да влезеш.'
      );

      window.history.replaceState(
        {},
        '',
        '/reset-password'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content">
      <h1>Нова парола</h1>

      {checking && (
        <p>
          Проверка на линка...
        </p>
      )}

      {!checking &&
        !ready &&
        !message && (
          <p>
            Отвори линка за възстановяване
            от имейла си.
          </p>
        )}

      {ready && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password">
              Нова парола
            </label>

            <input
              id="new-password"
              type="password"
              minLength={8}
              value={password}
              onChange={event =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label htmlFor="repeat-password">
              Повтори паролата
            </label>

            <input
              id="repeat-password"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={event =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <button
            className="button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Запазване...'
              : 'Смени паролата'}
          </button>
        </form>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      {message && (
        <p role="status">
          {message}{' '}
          <Link to="/login">
            Към вход
          </Link>
        </p>
      )}
    </main>
  );
}
