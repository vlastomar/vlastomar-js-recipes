import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

export default function MyRecipes() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadMyRecipes() {
      setLoading(true);
      setError('');

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(
            'id, title, description, image_url, cooking_minutes, created_at'
          )
          .eq('owner_id', user.id)
          .order('created_at', {
            ascending: false
          });

        if (error) throw error;

        if (active) {
          setRecipes(data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMyRecipes();

    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <main className="content recipe-page">
      <span className="eyebrow">
        Лична колекция
      </span>

      <h1>Моите рецепти</h1>

      <p className="recipe-intro">
        Управлявай рецептите,
        които си публикувал.
      </p>

      <Link
        className="button"
        to="/recipes/create"
      >
        + Добави нова рецепта
      </Link>

      {loading && (
        <p>Зареждане на твоите рецепти...</p>
      )}

      {error && (
        <p
          role="alert"
          className="recipe-error"
        >
          Грешка: {error}
        </p>
      )}

      {!loading &&
        !error &&
        recipes.length === 0 && (
          <div className="my-recipes-empty">
            <h2>
              Все още нямаш рецепти
            </h2>

            <p>
              Публикувай първата си рецепта,
              за да се появи тук.
            </p>

            <Link
              className="button"
              to="/recipes/create"
            >
              Създай рецепта
            </Link>
          </div>
        )}

      {!loading &&
        !error &&
        recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showEdit
              />
            ))}
          </div>
        )}
    </main>
  );
}