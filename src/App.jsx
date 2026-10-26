import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';
import Header from './components/Header';
import Home from './pages/Home';
import RecipeImage from './components/RecipeImage';
import FavoriteButton from './components/FavoriteButton';
import RecipeCard from './components/RecipeCard';
import Catalog from './pages/Catalog';
import FavoriteRecipes from './pages/FavoriteRecipes';
import MyRecipes from './pages/MyRecipes';
import RecipeComments from './components/RecipeComments';
import RecipeDetails from './pages/RecipeDetails';
import RecipeForm from './components/RecipeForm';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import Register from './pages/Register';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user
    ? children
    : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user
    ? <Navigate to="/" replace />
    : children;
}




























// ==========================================
// RESET PASSWORD
// ==========================================

function ResetPassword() {
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

// ==========================================
// PROFILE
// ==========================================

function Profile() {
  const { user } = useAuth();

  return (
    <main className="content">
      <h1>Моят профил</h1>

      <p>
        Имейл: {user?.email}
      </p>

      <div className="recipe-actions">
        <Link
          className="button"
          to="/my-recipes"
        >
          Моите рецепти
        </Link>

        <Link
          className="button"
          to="/favorites"
        >
          ♥ Любими рецепти
        </Link>

        <Link
          className="button"
          to="/recipes/create"
        >
          + Добави рецепта
        </Link>
      </div>
    </main>
  );
}

// ==========================================
// ROUTES
// ==========================================

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/recipes"
          element={<Catalog />}
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoriteRecipes />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-recipes"
          element={
            <PrivateRoute>
              <MyRecipes />
            </PrivateRoute>
          }
        />

        <Route
          path="/recipes/create"
          element={
            <PrivateRoute>
              <CreateRecipe />
            </PrivateRoute>
          }
        />

        <Route
          path="/recipes/:id/edit"
          element={
            <PrivateRoute>
              <EditRecipe />
            </PrivateRoute>
          }
        />

        <Route
          path="/recipes/:id"
          element={<RecipeDetails />}
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            <main className="content">
              <h1>
                404 - Страницата не е намерена
              </h1>

              <Link to="/">
                Към началото
              </Link>
            </main>
          }
        />
      </Routes>

      <footer>
        RecipeShare · React Exam Project
      </footer>
    </>
  );
}

