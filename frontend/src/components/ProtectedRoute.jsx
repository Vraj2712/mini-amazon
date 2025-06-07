// import this at top
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuth();

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If this route is adminOnly but user isn’t admin, kick back home
  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // OK!
  return children;
}
