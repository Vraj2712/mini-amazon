// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Initialize token from localStorage (if present)
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const navigate = useNavigate();

  // Whenever `token` changes (including on first mount), try fetching /auth/user
  useEffect(() => {
    if (!token) return; // No token → skip
    axiosInstance
      .get('/auth/user')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        // If token is invalid/expired or the request fails, clear everything
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
      });
  }, [token]);

  // login(): calls /auth/login, stores the access_token, then fetches /auth/user
  const login = async (email, password) => {
    // FastAPI’s /auth/login expects form-encoded "username" + "password"
    const resp = await axiosInstance.post(
      '/auth/login',
      new URLSearchParams({ username: email, password })
    );

    const { access_token } = resp.data; // { access_token: "...", token_type: "bearer" }
    localStorage.setItem('access_token', access_token);
    setToken(access_token);

    // Now that we have a valid token, fetch user info and store it
    const userResp = await axiosInstance.get('/auth/user');
    setUser(userResp.data);

    // Redirect home
    navigate('/');
  };

  // signup(): calls /auth/signup to register, then automatically logs in
  const signup = async (name, email, password) => {
    await axiosInstance.post('/auth/signup', { name, email, password });
    // Immediately log in with the same credentials
    await login(email, password);
  };

  // logout(): clear token & user, redirect to /login
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access AuthContext from any component
export function useAuth() {
  return useContext(AuthContext);
}
