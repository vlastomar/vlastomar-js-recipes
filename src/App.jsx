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
import MyRecipes from './pages/MyRecipes';
import RecipeComments from './components/RecipeComments';
import RecipeDetails from './pages/RecipeDetails';
import RecipeForm from './components/RecipeForm';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import Register from './pages/Register';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';


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

