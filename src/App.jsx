import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';
import Header from './components/Header';
import Home from './pages/Home';
import RecipeImage from './components/RecipeImage';
import FavoriteButton from './components/FavoriteButton';
import RecipeCard from './components/RecipeCard';
import Catalog from './pages/Catalog';
import FavoriteRecipes from './pages/FavoriteRecipes';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user
    ? children
    : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user
    ? <Navigate to="/" replace />
    : children;
}















// ==========================================
// MY RECIPES
// ==========================================

function MyRecipes() {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadMyRecipes() {
      setLoading(true);
      setError('');

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select(
            'id, title, description, image_url, cooking_minutes, created_at'
          )
          .eq('owner_id', user.id)
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

    loadMyRecipes();

    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <main className="content recipe-page">
      <span className="eyebrow">
        Лична колекция
      </span>

      <h1>Моите рецепти</h1>

      <p className="recipe-intro">
        Управлявай рецептите,
        които си публикувал.
      </p>

      <Link
        className="button"
        to="/recipes/create"
      >
        + Добави нова рецепта
      </Link>

      {loading && (
        <p>Зареждане на твоите рецепти...</p>
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
        recipes.length === 0 && (
          <div className="my-recipes-empty">
            <h2>
              Все още нямаш рецепти
            </h2>

            <p>
              Публикувай първата си рецепта,
              за да се появи тук.
            </p>

            <Link
              className="button"
              to="/recipes/create"
            >
              Създай рецепта
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
                showEdit
              />
            ))}
          </div>
        )}
    </main>
  );
}

// ==========================================
// COMMENTS
// ==========================================

function RecipeComments({ recipeId }) {
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

// ==========================================
// RECIPE DETAILS
// ==========================================

function RecipeDetails() {
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

// ==========================================
// RECIPE FORM
// ==========================================

function RecipeForm({
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

function emptyRecipe() {
  return {
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cooking_minutes: '30',
    image_url: ''
  };
}

function validateRecipe(form) {
  if (
    !form.title.trim() ||
    !form.ingredients.trim() ||
    !form.instructions.trim()
  ) {
    throw new Error(
      'Попълни заглавие, продукти и инструкции.'
    );
  }

  const minutes = Number(
    form.cooking_minutes
  );

  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 10000
  ) {
    throw new Error(
      'Въведи валидно време за приготвяне.'
    );
  }

  if (form.image_url.trim()) {
    try {
      const url = new URL(
        form.image_url.trim()
      );

      if (
        !['http:', 'https:'].includes(
          url.protocol
        )
      ) {
        throw new Error(
          'Невалиден протокол'
        );
      }
    } catch {
      throw new Error(
        'Въведи валиден URL на снимка.'
      );
    }
  }

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    ingredients: form.ingredients.trim(),
    instructions: form.instructions.trim(),
    cooking_minutes: minutes,
    image_url:
      form.image_url.trim() || null
  };
}

// ==========================================
// CREATE RECIPE
// ==========================================

function CreateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(
    emptyRecipe
  );

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

      navigate(
        `/recipes/${data.id}`
      );
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
        Сподели любимо ястие
        с общността.
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

// ==========================================
// EDIT RECIPE
// ==========================================

function EditRecipe() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(
    emptyRecipe
  );

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

      navigate(
        `/recipes/${id}`
      );
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

// ==========================================
// REGISTER
// ==========================================

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [
    confirmPassword,
    setConfirmPassword
  ] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 6) {
      setError(
        'Паролата трябва да има поне 6 символа.'
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        'Паролите не съвпадат.'
      );
      return;
    }

    setSaving(true);

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo:
              window.location.origin
          }
        });

      if (error) throw error;

      if (data.session) {
        navigate('/');
      } else {
        setMessage(
          'Провери имейла си за потвърждение.'
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content">
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-email">
            Имейл
          </label>

          <input
            id="register-email"
            type="email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="register-password">
            Парола
          </label>

          <input
            id="register-password"
            type="password"
            value={password}
            onChange={event =>
              setPassword(event.target.value)
            }
            minLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password">
            Потвърди паролата
          </label>

          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={event =>
              setConfirmPassword(
                event.target.value
              )
            }
            required
          />
        </div>

        {error && (
          <p role="alert">{error}</p>
        )}

        {message && (
          <p role="status">{message}</p>
        )}

        <button
          className="button"
          type="submit"
          disabled={saving}
        >
          {saving
            ? 'Регистриране...'
            : 'Регистрация'}
        </button>
      </form>

      <p>
        Имаш профил?{' '}
        <Link to="/login">
          Вход
        </Link>
      </p>
    </main>
  );
}

// ==========================================
// LOGIN
// ==========================================

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');
    setSaving(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

      if (error) throw error;

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRecovery() {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError(
        'Първо въведи имейла си.'
      );
      return;
    }

    setSending(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`
          }
        );

      if (error) throw error;

      setMessage(
        'Ако адресът е регистриран, ще получиш имейл за нова парола.'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="content">
      <h1>Вход</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email">
            Имейл
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">
            Парола
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={event =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p role="alert">{error}</p>
        )}

        {message && (
          <p role="status">{message}</p>
        )}

        <button
          className="button"
          type="submit"
          disabled={saving}
        >
          {saving
            ? 'Влизане...'
            : 'Вход'}
        </button>
      </form>

      <p>
        Нямаш профил?{' '}
        <Link to="/register">
          Регистрация
        </Link>
      </p>

      <button
        type="button"
        onClick={handleRecovery}
        disabled={sending}
      >
        {sending
          ? 'Изпращане...'
          : 'Забравена парола?'}
      </button>
    </main>
  );
}

// ==========================================
// RESET PASSWORD
// ==========================================

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [
    confirmPassword,
    setConfirmPassword
  ] = useState('');

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const query = new URLSearchParams(
      window.location.search
    );

    const hash = new URLSearchParams(
      window.location.hash.slice(1)
    );

    const recoveryLink =
      query.get('type') === 'recovery' ||
      hash.get('type') === 'recovery' ||
      query.has('code') ||
      query.has('token_hash');

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        if (
          event === 'PASSWORD_RECOVERY'
        ) {
          setReady(true);
          setChecking(false);
        } else if (
          event === 'SIGNED_IN' &&
          recoveryLink &&
          session
        ) {
          setReady(true);
          setChecking(false);
        }
      }
    );

    async function checkLink() {
      try {
        if (
          query.has('error') ||
          hash.has('error')
        ) {
          throw new Error(
            query.get('error_description') ||
            hash.get('error_description') ||
            'Невалиден или изтекъл линк.'
          );
        }

        if (
          query.has('token_hash')
        ) {
          const { error } =
            await supabase.auth.verifyOtp({
              token_hash:
                query.get('token_hash'),
              type: 'recovery'
            });

          if (error) throw error;

          if (active) {
            setReady(true);
          }
        } else if (recoveryLink) {
          const { data, error } =
            await supabase.auth.getSession();

          if (error) throw error;

          if (
            active &&
            data.session
          ) {
            setReady(true);
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    checkLink();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 8) {
      setError(
        'Паролата трябва да има поне 8 символа.'
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        'Паролите не съвпадат.'
      );
      return;
    }

    setSaving(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password
        });

      if (error) throw error;

      await supabase.auth.signOut();

      setReady(false);

      setMessage(
        'Паролата е сменена. Вече можеш да влезеш.'
      );

      window.history.replaceState(
        {},
        '',
        '/reset-password'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content">
      <h1>Нова парола</h1>

      {checking && (
        <p>
          Проверка на линка...
        </p>
      )}

      {!checking &&
        !ready &&
        !message && (
          <p>
            Отвори линка за възстановяване
            от имейла си.
          </p>
        )}

      {ready && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password">
              Нова парола
            </label>

            <input
              id="new-password"
              type="password"
              minLength={8}
              value={password}
              onChange={event =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label htmlFor="repeat-password">
              Повтори паролата
            </label>

            <input
              id="repeat-password"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={event =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
            />
          </div>

          <button
            className="button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Запазване...'
              : 'Смени паролата'}
          </button>
        </form>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      {message && (
        <p role="status">
          {message}{' '}
          <Link to="/login">
            Към вход
          </Link>
        </p>
      )}
    </main>
  );
}

// ==========================================
// PROFILE
// ==========================================

function Profile() {
  const { user } = useAuth();

  return (
    <main className="content">
      <h1>Моят профил</h1>

      <p>
        Имейл: {user?.email}
      </p>

      <div className="recipe-actions">
        <Link
          className="button"
          to="/my-recipes"
        >
          Моите рецепти
        </Link>

        <Link
          className="button"
          to="/favorites"
        >
          ♥ Любими рецепти
        </Link>

        <Link
          className="button"
          to="/recipes/create"
        >
          + Добави рецепта
        </Link>
      </div>
    </main>
  );
}

// ==========================================
// ROUTES
// ==========================================

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/recipes"
          element={<Catalog />}
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoriteRecipes />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-recipes"
          element={
            <PrivateRoute>
              <MyRecipes />
            </PrivateRoute>
          }
        />

        <Route
          path="/recipes/create"
          element={
            <PrivateRoute>
              <CreateRecipe />
            </PrivateRoute>
          }
        />

        <Route
          path="/recipes/:id/edit"
          element={
            <PrivateRoute>
              <EditRecipe />
            </PrivateRoute>
          }
        />

        <Route
          path="/recipes/:id"
          element={<RecipeDetails />}
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            <main className="content">
              <h1>
                404 - Страницата не е намерена
              </h1>

              <Link to="/">
                Към началото
              </Link>
            </main>
          }
        />
      </Routes>

      <footer>
        RecipeShare · React Exam Project
      </footer>
    </>
  );
}

