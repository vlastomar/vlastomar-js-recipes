import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';

export default function FavoriteRecipes() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadFavorites() {
      setLoading(true);
      setError('');

      try {
        const {
          data: favorites,
          error: favoritesError
        } = await supabase
          .from('recipe_favorites')
          .select('recipe_id')
          .eq('user_id', user.id);

        if (favoritesError) {
          throw favoritesError;
        }

        const ids = (favorites ?? []).map(
          item => item.recipe_id
        );

        if (ids.length === 0) {
          if (active) {
            setRecipes([]);
          }

          return;
        }

        const { data, error } = await supabase
          .from('recipes')
          .select(
            'id, title, description, image_url, cooking_minutes, created_at'
          )
          .in('id', ids)
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

    loadFavorites();

    return () => {
      active = false;
    };
  }, [user?.id]);

  function removeFromList(recipeId) {
    setRecipes(previous =>
      previous.filter(
        recipe => recipe.id !== recipeId
      )
    );
  }

  return (
    <main className="content recipe-page">
      <span className="eyebrow">
        Твоята колекция
      </span>

      <h1>Любими рецепти</h1>

      <p className="recipe-intro">
        Всички рецепти, които си запазил.
      </p>

      {loading && (
        <p>Зареждане на любимите...</p>
      )}

      {error && (
        <p
          className="recipe-error"
          role="alert"
        >
          Грешка: {error}
        </p>
      )}

      {!loading &&
        !error &&
        recipes.length === 0 && (
          <div className="my-recipes-empty">
            <h2>
              Все още нямаш любими рецепти
            </h2>

            <p>
              Разгледай каталога и запази
              рецепти, които ти харесват.
            </p>

            <Link
              className="button"
              to="/recipes"
            >
              Разгледай рецепти
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
                onFavoriteRemoved={removeFromList}
              />
            ))}
          </div>
        )}
    </main>
  );
}