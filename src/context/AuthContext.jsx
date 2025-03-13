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
        console.log("Initializing auth...");

        // First check for Supabase session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting Supabase session:", sessionError);
        }

        if (session) {
          console.log(
            "Found existing Supabase session for:",
            session.user.email
          );

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
              console.log("Got user profile from API");
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
          console.log("No active session found");
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
      console.log(
        "Auth state changed:",
        event,
        session ? `for user: ${session.user.email}` : "no session"
      );

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log("User signed in or token refreshed");
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
        console.log("User signed out");
        setUser(null);
      } else if (event === "INITIAL_SESSION") {
        // This event fires when Supabase first loads and checks for an existing session
        console.log(
          "Initial session check:",
          session ? `Session found for ${session.user.email}` : "No session"
        );
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
      // First sign up with Supabase directly
      const { data: supabaseData, error: supabaseError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
            },
          },
        });

      if (supabaseError) {
        console.error("Supabase signup error:", supabaseError);
        return { data: null, error: supabaseError };
      }

      // Then register with our API
      const response = await api.post("/api/users/register", data);

      // Set user from Supabase session
      if (supabaseData.session) {
        setUser(supabaseData.user);
      }

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  };

  // Sign in
  const signIn = async (data) => {
    try {
      console.log("Signing in with:", data.email);

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

      console.log("Supabase signin successful, session established");

      // Then login with our API to set the HTTP-only cookie
      const response = await api.post("/api/users/login", data, {
        headers: {
          // Include the Supabase token in the API request
          Authorization: `Bearer ${supabaseData.session.access_token}`,
        },
      });

      console.log("API login successful");

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
      console.log("Signing out...");

      // First sign out from our API
      await api.post("/api/users/logout");
      console.log("API logout successful");

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signout error:", error);
      } else {
        console.log("Supabase signout successful");
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
      console.log("Refreshing auth session...");
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Session refresh error:", error);
        return { error };
      }

      if (data.session) {
        console.log(
          "Session refreshed successfully for:",
          data.session.user.email
        );
        setUser(data.session.user);
        return { data, error: null };
      } else {
        console.log("No session after refresh");
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
