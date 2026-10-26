import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function FavoriteButton({
  recipeId,
  onRemoved
}) {
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function checkFavorite() {
      setLoading(true);
      setIsFavorite(false);
      setError('');

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('recipe_favorites')
          .select('recipe_id')
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
          .maybeSingle();

        if (error) throw error;

        if (active) {
          setIsFavorite(Boolean(data));
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

    checkFavorite();

    return () => {
      active = false;
    };
  }, [recipeId, user?.id]);

  async function toggleFavorite() {
    if (!user || saving || loading) return;

    setSaving(true);
    setError('');

    try {
      if (isFavorite) {
        const { data, error } = await supabase
          .from('recipe_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
          .select('recipe_id');

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error(
            'Рецептата не беше премахната от любимите.'
          );
        }

        setIsFavorite(false);

        if (onRemoved) {
          onRemoved(recipeId);
        }
      } else {
        const { error } = await supabase
          .from('recipe_favorites')
          .upsert(
            {
              user_id: user.id,
              recipe_id: recipeId
            },
            {
              onConflict: 'user_id,recipe_id'
            }
          );

        if (error) throw error;

        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <Link
        className="favorite-button"
        to="/login"
      >
        ♡ Влез, за да запазиш
      </Link>
    );
  }

  return (
    <div className="favorite-control">
      <button
        type="button"
        className={
          isFavorite
            ? 'favorite-button is-favorite'
            : 'favorite-button'
        }
        onClick={toggleFavorite}
        disabled={loading || saving}
        aria-pressed={isFavorite}
      >
        {loading || saving
          ? 'Зареждане...'
          : isFavorite
            ? '♥ В любими'
            : '♡ Добави в любими'}
      </button>

      {error && (
        <small
          className="recipe-error"
          role="alert"
        >
          {error}
        </small>
      )}
    </div>
  );
}