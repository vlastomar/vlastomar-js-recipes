import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [
    confirmPassword,
    setConfirmPassword
  ] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 6) {
      setError(
        'Паролата трябва да има поне 6 символа.'
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
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo:
              window.location.origin
          }
        });

      if (error) throw error;

      if (data.session) {
        navigate('/');
      } else {
        setMessage(
          'Провери имейла си за потвърждение.'
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content">
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-email">
            Имейл
          </label>

          <input
            id="register-email"
            type="email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="register-password">
            Парола
          </label>

          <input
            id="register-password"
            type="password"
            value={password}
            onChange={event =>
              setPassword(event.target.value)
            }
            minLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password">
            Потвърди паролата
          </label>

          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={event =>
              setConfirmPassword(
                event.target.value
              )
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
            ? 'Регистриране...'
            : 'Регистрация'}
        </button>
      </form>

      <p>
        Имаш профил?{' '}
        <Link to="/login">
          Вход
        </Link>
      </p>
    </main>
  );
}