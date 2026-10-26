import React from 'react';

export default function RecipeForm({
  form,
  setForm,
  onSubmit,
  saving,
  error,
  buttonText
}) {
  function change(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  return (
    <form
      className="recipe-create-form"
      onSubmit={onSubmit}
    >
      <div>
        <label htmlFor="recipe-title">
          Заглавие *
        </label>

        <input
          id="recipe-title"
          name="title"
          value={form.title}
          onChange={change}
          maxLength={120}
          required
        />
      </div>

      <div>
        <label htmlFor="recipe-description">
          Описание
        </label>

        <textarea
          id="recipe-description"
          name="description"
          value={form.description}
          onChange={change}
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="recipe-ingredients">
          Продукти *
        </label>

        <textarea
          id="recipe-ingredients"
          name="ingredients"
          value={form.ingredients}
          onChange={change}
          rows={5}
          required
        />
      </div>

      <div>
        <label htmlFor="recipe-instructions">
          Начин на приготвяне *
        </label>

        <textarea
          id="recipe-instructions"
          name="instructions"
          value={form.instructions}
          onChange={change}
          rows={7}
          required
        />
      </div>

      <div>
        <label htmlFor="recipe-minutes">
          Време (минути) *
        </label>

        <input
          id="recipe-minutes"
          name="cooking_minutes"
          type="number"
          min="1"
          max="10000"
          step="1"
          value={form.cooking_minutes}
          onChange={change}
          required
        />
      </div>

      <div>
        <label htmlFor="recipe-image">
          URL на снимка
        </label>

        <input
          id="recipe-image"
          name="image_url"
          type="url"
          value={form.image_url}
          onChange={change}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="recipe-error"
        >
          {error}
        </p>
      )}

      <button
        className="button"
        type="submit"
        disabled={saving}
      >
        {saving
          ? 'Запазване...'
          : buttonText}
      </button>
    </form>
  );
}