import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up
  const signUp = async (data) => {
    try {
      // Ensure path is correct with /api prefix
      const response = await api.post("/api/users/register", data);

      // Get updated session from Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData.session?.user ?? null);

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  };

  // Sign in
  const signIn = async (data) => {
    try {
      // Ensure path is correct with /api prefix
      const response = await api.post("/api/users/login", data);

      // Force a refresh of the Supabase session
      await supabase.auth.refreshSession();

      // Get updated session from Supabase
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        return { data: null, error: "Authentication failed" };
      }

      // Set user state with the data from our API response for immediate UI updates
      setUser(sessionData.session?.user ?? response.data.user ?? null);

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Ensure path is correct with /api prefix
      await api.post("/api/users/logout");
      await supabase.auth.signOut();
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: error.message };
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
