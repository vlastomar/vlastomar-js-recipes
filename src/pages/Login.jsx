import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');
    setSaving(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

      if (error) throw error;

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRecovery() {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError(
        'Първо въведи имейла си.'
      );
      return;
    }

    setSending(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`
          }
        );

      if (error) throw error;

      setMessage(
        'Ако адресът е регистриран, ще получиш имейл за нова парола.'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="content">
      <h1>Вход</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">
            Имейл
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">
            Парола
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={event =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p role="alert">{error}</p>
        )}

        {message && (
          <p role="status">{message}</p>
        )}

        <button
          className="button"
          type="submit"
          disabled={saving}
        >
          {saving
            ? 'Влизане...'
            : 'Вход'}
        </button>
      </form>

      <p>
        Нямаш профил?{' '}
        <Link to="/register">
          Регистрация
        </Link>
      </p>

      <button
        type="button"
        onClick={handleRecovery}
        disabled={sending}
      >
        {sending
          ? 'Изпращане...'
          : 'Забравена парола?'}
      </button>
    </main>
  );
}
