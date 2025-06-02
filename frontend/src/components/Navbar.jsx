// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // Count total quantity in cart
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "#222",
        color: "white",
        padding: "0.5rem 1rem",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>
        <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>
          Cart ({cartCount})
        </Link>
        {user && (
          <Link
            to="/orders"
            style={{ color: "white", textDecoration: "none" }}
          >
            My Orders
          </Link>
        )}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {user ? (
          <>
            <Link
              to="/"
              style={{ color: "white", textDecoration: "none" }}
            >
              Hello, {user.name}
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid white",
                color: "white",
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{ color: "white", textDecoration: "none" }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{ color: "white", textDecoration: "none" }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
