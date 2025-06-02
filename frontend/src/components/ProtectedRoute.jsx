// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If not logged in, redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the protected page
  return children;
}
