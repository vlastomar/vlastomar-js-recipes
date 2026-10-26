import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function RecipeComments({ recipeId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadComments() {
      setLoading(true);
      setError('');

      try {
        const { data, error } = await supabase
          .from('recipe_comments')
          .select(
            'id, user_id, content, created_at'
          )
          .eq('recipe_id', recipeId)
          .order('created_at', {
            ascending: false
          });

        if (error) throw error;

        if (active) {
          setComments(data ?? []);
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

    loadComments();

    return () => {
      active = false;
    };
  }, [recipeId]);

  async function refreshComments() {
    const { data, error } = await supabase
      .from('recipe_comments')
      .select(
        'id, user_id, content, created_at'
      )
      .eq('recipe_id', recipeId)
      .order('created_at', {
        ascending: false
      });

    if (error) throw error;

    setComments(data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) return;

    const text = content.trim();

    if (
      text.length < 1 ||
      text.length > 1000
    ) {
      setError(
        'Коментарът трябва да е между 1 и 1000 символа.'
      );
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('recipe_comments')
        .insert({
          recipe_id: recipeId,
          user_id: user.id,
          content: text
        });

      if (error) throw error;

      setContent('');
      await refreshComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(comment) {
    if (
      !user ||
      comment.user_id !== user.id
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Сигурен ли си, че искаш да изтриеш коментара?'
    );

    if (!confirmed) return;

    setDeletingId(comment.id);
    setError('');

    try {
      const { data, error } = await supabase
        .from('recipe_comments')
        .delete()
        .eq('id', comment.id)
        .eq('user_id', user.id)
        .select('id')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          'Коментарът не беше изтрит.'
        );
      }

      setComments(previous =>
        previous.filter(
          item => item.id !== comment.id
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="recipe-comments">
      <h2>
        Коментари ({comments.length})
      </h2>

      {error && (
        <p
          className="recipe-error"
          role="alert"
        >
          Грешка: {error}
        </p>
      )}

      {user ? (
        <form
          className="comment-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="comment-content">
            Напиши коментар
          </label>

          <textarea
            id="comment-content"
            value={content}
            onChange={event =>
              setContent(event.target.value)
            }
            rows={4}
            maxLength={1000}
            placeholder="Какво мислиш за рецептата?"
            required
          />

          <button
            className="button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Публикуване...'
              : 'Публикувай коментар'}
          </button>
        </form>
      ) : (
        <p>
          За да коментираш, трябва да{' '}
          <Link to="/login">
            влезеш в профила си
          </Link>.
        </p>
      )}

      {loading ? (
        <p>
          Зареждане на коментарите...
        </p>
      ) : comments.length === 0 ? (
        <p>
          Все още няма коментари.
          Бъди първият!
        </p>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <article
              className="comment-card"
              key={comment.id}
            >
              <div className="comment-meta">
                <strong>
                  {comment.user_id === user?.id
                    ? 'Ти'
                    : `Потребител ${comment.user_id.slice(0, 8)}`}
                </strong>

                <time>
                  {new Date(
                    comment.created_at
                  ).toLocaleString('bg-BG')}
                </time>
              </div>

              <p>{comment.content}</p>

              {user?.id ===
                comment.user_id && (
                  <button
                    type="button"
                    className="comment-delete"
                    disabled={
                      deletingId === comment.id
                    }
                    onClick={() =>
                      handleDelete(comment)
                    }
                  >
                    {deletingId === comment.id
                      ? 'Изтриване...'
                      : 'Изтрий коментара'}
                  </button>
                )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}