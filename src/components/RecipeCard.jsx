import React from 'react';
import { Link } from 'react-router-dom';
import RecipeImage from './RecipeImage';
import FavoriteButton from './FavoriteButton';

export default function RecipeCard({
  recipe,
  showEdit = false,
  onFavoriteRemoved
}) {
  return (
    <article className="recipe-card">
      <RecipeImage
        url={recipe.image_url}
        title={recipe.title}
      />

      <div className="recipe-card-body">
        <h2>{recipe.title}</h2>

        <p>
          {recipe.description ||
            'Вкусна домашна рецепта.'}
        </p>

        <p>
          ⏱ {recipe.cooking_minutes ?? '—'} мин.
        </p>

        <FavoriteButton
          recipeId={recipe.id}
          onRemoved={onFavoriteRemoved}
        />

        <div className="my-recipe-buttons">
          <Link
            className="recipe-link"
            to={`/recipes/${recipe.id}`}
          >
            Виж рецептата →
          </Link>

          {showEdit && (
            <Link
              className="recipe-link"
              to={`/recipes/${recipe.id}/edit`}
            >
              Редактирай
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}