import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth Pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ResetPassword from "../pages/ResetPassword";
import GoogleAuthCallback from "../pages/GoogleAuthCallback";
import AuthCallback from "../pages/AuthCallback";
import Dashboard from "../pages/dashboard/Dashboard";

const AuthRoutes = [
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="signup" path="/signup" element={<Signup />} />,
  <Route
    key="reset-password"
    path="/reset-password"
    element={<ResetPassword />}
  />,
  <Route
    key="google-callback"
    path="/auth/google/callback"
    element={<GoogleAuthCallback />}
  />,
  <Route
    key="auth-callback"
    path="/auth/callback"
    element={<AuthCallback />}
  />,
  <Route
    key="dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />,
];

export default AuthRoutes;
