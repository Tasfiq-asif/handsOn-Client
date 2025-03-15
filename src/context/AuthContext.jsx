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
    const initializeAuth = async () => {
      try {
        // First check for Supabase session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting Supabase session:", sessionError);
        }

        if (session) {
          // Set basic user info from Supabase session
          setUser(session.user);

          // Try to get additional user data from our API
          try {
            // Make sure to include the token in this request
            const response = await api.get("/api/users/profile", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (response.data && response.data.user) {
              // Merge Supabase user with profile data
              setUser((prevUser) => ({
                ...prevUser,
                ...response.data.user,
              }));
            }
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // Even if profile fetch fails, we still have the basic user from Supabase
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          setUser(session.user);

          // Try to get additional user data
          try {
            const response = await api.get("/api/users/profile", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (response.data && response.data.user) {
              setUser((prevUser) => ({
                ...prevUser,
                ...response.data.user,
              }));
            }
          } catch (error) {
            console.error("Error fetching user profile after sign in:", error);
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "INITIAL_SESSION") {
        // This event fires when Supabase first loads and checks for an existing session
        if (session && !user) {
          setUser(session.user);
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up
  const signUp = async (data) => {
    try {
      const { email, password, fullName } = data;

      // Simplest possible signup approach
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      console.log("User signed up successfully:", authData);

      // Save user profile data to profiles table
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            user_id: authData.user.id,
            full_name: fullName,
            username: email.split("@")[0], // Default username based on email
            created_at: new Date(),
          },
        ]);

        if (profileError) {
          console.error("Error saving profile:", profileError);
        }
      }

      // Sign in the user immediately after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Error signing in after signup:", signInError);
        throw signInError;
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error("Error in signUp:", error.message);
      return { user: null, error };
    }
  };

  // Sign in
  const signIn = async (data) => {
    try {
      // First sign in with Supabase directly to get a session
      const { data: supabaseData, error: supabaseError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (supabaseError) {
        console.error("Supabase signin error:", supabaseError);
        return { data: null, error: supabaseError };
      }

      // Then login with our API to set the HTTP-only cookie
      const response = await api.post("/api/users/login", data, {
        headers: {
          // Include the Supabase token in the API request
          Authorization: `Bearer ${supabaseData.session.access_token}`,
        },
      });

      // Set user from Supabase session
      setUser(supabaseData.user);

      return { data: response.data, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { data: null, error: error.response?.data || error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // First sign out from our API
      await api.post("/api/users/logout");

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signout error:", error);
      }

      setUser(null);
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: error.message };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Session refresh error:", error);
        return { error };
      }

      if (data.session) {
        setUser(data.session.user);
        return { data, error: null };
      } else {
        return { data: null, error: "No session" };
      }
    } catch (error) {
      console.error("Session refresh exception:", error);
      return { error: error.message };
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    refreshSession,
    user,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
