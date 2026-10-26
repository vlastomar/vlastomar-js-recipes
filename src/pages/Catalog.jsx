import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RecipeCard from '../components/RecipeCard';

export default function Catalog() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [maxMinutes, setMaxMinutes] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let active = true;

    async function loadRecipes() {
      setLoading(true);
      setError('');

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(
            'id, title, description, cooking_minutes, image_url, created_at'
          )
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

    loadRecipes();

    return () => {
      active = false;
    };
  }, []);

  const filteredRecipes = recipes
    .filter(recipe => {
      const query = search
        .trim()
        .toLocaleLowerCase('bg-BG');

      const title = (recipe.title ?? '')
        .toLocaleLowerCase('bg-BG');

      const description = (recipe.description ?? '')
        .toLocaleLowerCase('bg-BG');

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query);

      const matchesTime =
        maxMinutes === 'all' ||
        (
          recipe.cooking_minutes != null &&
          Number(recipe.cooking_minutes) <=
            Number(maxMinutes)
        );

      return matchesSearch && matchesTime;
    })
    .sort((a, b) => {
      if (sortBy === 'fastest') {
        const timeA =
          a.cooking_minutes ?? Infinity;

        const timeB =
          b.cooking_minutes ?? Infinity;

        return timeA - timeB;
      }

      const dateA = new Date(
        a.created_at
      ).getTime();

      const dateB = new Date(
        b.created_at
      ).getTime();

      return sortBy === 'oldest'
        ? dateA - dateB
        : dateB - dateA;
    });

  function clearFilters() {
    setSearch('');
    setMaxMinutes('all');
    setSortBy('newest');
  }

  return (
    <main className="content recipe-page">
      <span className="eyebrow">
        Вкусни идеи за всеки ден
      </span>

      <h1>Каталог с рецепти</h1>

      <p className="recipe-intro">
        Разгледай предложенията на общността.
      </p>

      <Link
        className="button"
        to="/recipes/create"
      >
        + Добави рецепта
      </Link>

      <section className="recipe-filters">
        <h2>Намери своята рецепта</h2>

        <div className="recipe-filters-grid">
          <div className="recipe-filter-field">
            <label htmlFor="recipe-search">
              Търси рецепта
            </label>

            <input
              id="recipe-search"
              type="search"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Например: салата, супа, пиле..."
            />
          </div>

          <div className="recipe-filter-field">
            <label htmlFor="recipe-time-filter">
              Време за приготвяне
            </label>

            <select
              id="recipe-time-filter"
              value={maxMinutes}
              onChange={event =>
                setMaxMinutes(event.target.value)
              }
            >
              <option value="all">
                Всички рецепти
              </option>

              <option value="15">
                До 15 минути
              </option>

              <option value="30">
                До 30 минути
              </option>

              <option value="60">
                До 60 минути
              </option>
            </select>
          </div>

          <div className="recipe-filter-field">
            <label htmlFor="recipe-sort">
              Подреди по
            </label>

            <select
              id="recipe-sort"
              value={sortBy}
              onChange={event =>
                setSortBy(event.target.value)
              }
            >
              <option value="newest">
                Най-нови
              </option>

              <option value="oldest">
                Най-стари
              </option>

              <option value="fastest">
                Най-бързи
              </option>
            </select>
          </div>
        </div>

        <div className="recipe-filter-bottom">
          <p>
            Намерени рецепти:{' '}
            <strong>
              {loading
                ? '...'
                : filteredRecipes.length}
            </strong>
          </p>

          <button
            type="button"
            className="recipe-clear-filters"
            onClick={clearFilters}
          >
            Изчисти филтрите
          </button>
        </div>
      </section>

      {loading && (
        <p>Зареждане на рецептите...</p>
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
        filteredRecipes.length === 0 && (
          <div className="recipe-no-results">
            <h2>Няма намерени рецепти</h2>

            <p>
              Опитай с друга дума или
              промени филтрите.
            </p>

            <button
              type="button"
              className="button"
              onClick={clearFilters}
            >
              Покажи всички рецепти
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        filteredRecipes.length > 0 && (
          <div className="recipe-grid">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
              />
            ))}
          </div>
        )}
    </main>
  );
}