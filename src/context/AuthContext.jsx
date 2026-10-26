import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error(error.message);
        }

        setUser(data?.session?.user ?? null);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);

        if (active) {
          setLoading(false);
        }
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}