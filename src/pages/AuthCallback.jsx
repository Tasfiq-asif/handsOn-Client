import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        console.log("Auth callback component mounted");

        // Get the session that was created by the OAuth redirect
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setError("Authentication failed. Please try again.");
          return;
        }

        if (!data.session) {
          console.error("No session found");
          setError("No session found. Please try logging in again.");
          return;
        }

        console.log("Session found:", data.session.user.email);

        // Now send the session to our server to set the cookie
        try {
          const serverResponse = await api.post("/api/users/google-login", {
            session: data.session,
          });

          console.log(
            "Server response after OAuth login:",
            serverResponse.data
          );

          // Update the user state
          setUser(data.session.user);

          // Redirect to dashboard
          navigate("/dashboard");
        } catch (serverError) {
          console.error("Server error during OAuth auth:", serverError);
          setError("Error setting up your session. Please try again.");
        }
      } catch (e) {
        console.error("Unexpected error during OAuth auth:", e);
        setError("An unexpected error occurred. Please try again.");
      }
    };

    handleAuthRedirect();
  }, [navigate, setUser]);

  // Show a loading state or error
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg max-w-md w-full">
        {error ? (
          <div className="text-red-500 text-center mb-4">{error}</div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
            <p className="text-center text-gray-600">
              Completing your sign-in...
            </p>
          </>
        )}

        {error && (
          <button
            onClick={() => navigate("/login")}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
