// src/contexts/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/products" className="hover:underline">
            Products
          </Link>

          {user ? (
            <>
              <Link to="/cart" className="hover:underline">
                Cart
              </Link>
              <Link to="/orders" className="hover:underline">
                My Orders
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span>Hello, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/signup" className="hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
