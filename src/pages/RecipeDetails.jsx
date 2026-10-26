import React, { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import RecipeImage from '../components/RecipeImage';
import FavoriteButton from '../components/FavoriteButton';
import RecipeComments from '../components/RecipeComments';

export default function RecipeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadRecipe() {
      setLoading(true);
      setError('');
      setRecipe(null);

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(
            'id, owner_id, title, description, ingredients, instructions, cooking_minutes, image_url'
          )
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (active) {
          setRecipe(data);
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

    loadRecipe();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleDelete() {
    if (
      !recipe ||
      !user ||
      recipe.owner_id !== user.id
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Сигурен ли си, че искаш да изтриеш тази рецепта?'
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id)
        .eq('owner_id', user.id)
        .select('id')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          'Рецептата не беше изтрита.'
        );
      }

      navigate('/my-recipes');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const isOwner = Boolean(
    user &&
    recipe &&
    recipe.owner_id === user.id
  );

  return (
    <main className="content recipe-page recipe-details">
      <Link
        className="recipe-back"
        to="/recipes"
      >
        ← Към всички рецепти
      </Link>

      {loading && (
        <p>Зареждане...</p>
      )}

      {error && (
        <p
          role="alert"
          className="recipe-error"
        >
          {error}
        </p>
      )}

      {!loading &&
        !recipe &&
        !error && (
          <p>
            Рецептата не е намерена.
          </p>
        )}

      {!loading && recipe && (
        <article>
          <h1>{recipe.title}</h1>

          {isOwner && (
            <div className="recipe-actions">
              <Link
                className="button"
                to={`/recipes/${recipe.id}/edit`}
              >
                Редактирай
              </Link>

              <button
                className="button"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Изтриване...'
                  : 'Изтрий'}
              </button>
            </div>
          )}

          <p className="recipe-intro">
            {recipe.description}
          </p>

          <div className="recipe-detail-photo">
            <RecipeImage
              url={recipe.image_url}
              title={recipe.title}
            />
          </div>

          <FavoriteButton
            recipeId={recipe.id}
          />

          <p className="recipe-time">
            ⏱ Време за приготвяне:{' '}
            {recipe.cooking_minutes ?? '—'} минути
          </p>

          <section className="recipe-detail-section">
            <h2>
              Необходими продукти
            </h2>

            <p className="recipe-multiline">
              {recipe.ingredients ||
                'Няма добавени продукти.'}
            </p>
          </section>

          <section className="recipe-detail-section">
            <h2>
              Начин на приготвяне
            </h2>

            <p className="recipe-multiline">
              {recipe.instructions ||
                'Няма добавени инструкции.'}
            </p>
          </section>

          <RecipeComments
            recipeId={recipe.id}
          />
        </article>
      )}
    </main>
  );
}