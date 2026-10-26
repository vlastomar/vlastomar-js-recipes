import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="hero">
      <span className="eyebrow">
        Добре дошли в RecipeShare
      </span>

      <h1>
        Открий следващата си любима рецепта
      </h1>

      <p>
        Място за вкусни идеи и споделени
        кулинарни приключения.
      </p>

      <Link className="button" to="/recipes">
        Разгледай рецепти →
      </Link>
    </main>
  );
}