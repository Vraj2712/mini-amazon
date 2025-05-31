// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <div>
        <Link to="/" className="font-bold text-xl">
          Mini Amazon
        </Link>
      </div>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        {user && <Link to="/cart">Cart ({items.length})</Link>}
        {user && <Link to="/orders">Orders</Link>}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Signup</Link>}
        {user && (
          <button onClick={handleLogout} className="underline">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
