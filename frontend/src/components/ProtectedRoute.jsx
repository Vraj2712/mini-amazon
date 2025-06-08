// src/components/ProtectedRoute.jsx
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !user.is_admin) {
    // Logged in but not an admin
    return <Navigate to="/" replace />;
  }
  return children;
}
