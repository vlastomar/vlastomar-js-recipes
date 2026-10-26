import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

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
      setLoading(false);
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
          <p className="recipe-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="button"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Влизане...' : 'Вход'}
        </button>
      </form>

      <p>
        <Link to="/forgot-password">
          Забравена парола?
        </Link>
      </p>

      <p>
        Нямаш профил?{' '}
        <Link to="/register">
          Регистрирай се
        </Link>
      </p>
    </main>
  );
}