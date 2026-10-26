import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
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