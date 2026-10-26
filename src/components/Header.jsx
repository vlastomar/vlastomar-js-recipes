import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');

  async function handleLogout() {
    setError('');

    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <header>
      <Link className="logo" to="/">
        ♨ RecipeShare
      </Link>

      <nav>
        <Link to="/">Начало</Link>
        <Link to="/recipes">Рецепти</Link>
        <Link to="/recipes/create">
          Добави рецепта
        </Link>

        {user ? (
          <>
            <Link to="/my-recipes">
              Моите рецепти
            </Link>

            <Link to="/favorites">
              ♥ Любими
            </Link>

            <Link to="/profile">
              Моят профил
            </Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              Изход
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">
              Регистрация
            </Link>
          </>
        )}
      </nav>

      {error && (
        <p role="alert" className="recipe-error">
          {error}
        </p>
      )}
    </header>
  );
}