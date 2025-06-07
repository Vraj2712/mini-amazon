// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // total items in cart
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // style active vs inactive links
  const linkClasses = ({ isActive }) =>
    isActive
      ? "text-white underline"
      : "text-gray-300 hover:text-white";

  return (
    <nav className="bg-gray-900 p-4 flex justify-between items-center">
      <ul className="flex space-x-6">
        <li>
          <NavLink to="/" className={linkClasses}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/cart" className={linkClasses}>
            Cart ({cartCount})
          </NavLink>
        </li>
        {user && (
          <li>
            <NavLink to="/orders" className={linkClasses}>
              My Orders
            </NavLink>
          </li>
        )}
        {user && (
          <li>
            <NavLink to="/profile" className={linkClasses}>
              Profile
            </NavLink>
          </li>
        )}
        {user?.is_admin && (
          <li>
            <NavLink to="/admin" className={linkClasses}>
              Admin
            </NavLink>
          </li>
        )}
      </ul>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-gray-100">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 border border-gray-300 rounded text-gray-300 hover:border-white hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClasses}>
              Login
            </NavLink>
            <NavLink to="/signup" className={linkClasses}>
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
