import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import RecipeForm from '../components/RecipeForm';
import {
  emptyRecipe,
  validateRecipe
} from '../lib/recipeForm';

export default function CreateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyRecipe);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSaving(true);

    try {
      const values = validateRecipe(form);

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          ...values,
          owner_id: user.id
        })
        .select('id')
        .single();

      if (error) throw error;

      navigate(`/recipes/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content recipe-page">
      <Link
        className="recipe-back"
        to="/recipes"
      >
        ← Към рецептите
      </Link>

      <h1>Добави рецепта</h1>

      <p className="recipe-intro">
        Сподели любимо ястие с общността.
      </p>

      <RecipeForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
        buttonText="Публикувай рецепта"
      />
    </main>
  );
}