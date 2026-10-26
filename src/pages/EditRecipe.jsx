import React, { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import RecipeForm from '../components/RecipeForm';
import Loading from '../components/Loading';
import {
  emptyRecipe,
  validateRecipe
} from '../lib/recipeForm';

export default function EditRecipe() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyRecipe);
  const [found, setFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadRecipe() {
      setLoading(true);
      setError('');
      setFound(false);

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!active) return;

        if (!data) {
          throw new Error(
            'Рецептата не е намерена или не е твоя.'
          );
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          ingredients: data.ingredients || '',
          instructions: data.instructions || '',
          cooking_minutes: String(
            data.cooking_minutes ?? ''
          ),
          image_url: data.image_url || ''
        });

        setFound(true);
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
  }, [id, user.id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!found) return;

    setError('');
    setSaving(true);

    try {
      const values = validateRecipe(form);

      const { data, error } = await supabase
        .from('recipes')
        .update(values)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select('id')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          'Нямаш право да редактираш рецептата.'
        );
      }

      navigate(`/recipes/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <main className="content recipe-page">
      <Link
        className="recipe-back"
        to={`/recipes/${id}`}
      >
        ← Към рецептата
      </Link>

      <h1>Редактирай рецепта</h1>

      {!found && error && (
        <p
          role="alert"
          className="recipe-error"
        >
          {error}
        </p>
      )}

      {found && (
        <RecipeForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
          buttonText="Запази промените"
        />
      )}
    </main>
  );
}