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
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const navigate = useNavigate();

  // On mount, if token exists, fetch user info
  useEffect(() => {
    if (token) {
      axiosInstance
        .get('/auth/user')
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          // invalid token -> clear
          setUser(null);
          setToken(null);
          localStorage.removeItem('access_token');
        });
    }
  }, [token]);

  const login = async (email, password) => {
    const resp = await axiosInstance.post(
      '/auth/login',
      new URLSearchParams({ username: email, password })
    );
    const { access_token } = resp.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);

    // Fetch and set user
    const userResp = await axiosInstance.get('/auth/user');
    setUser(userResp.data);
    navigate('/'); // redirect home
  };

  const signup = async (name, email, password) => {
    await axiosInstance.post('/auth/signup', { name, email, password });
    // After signup, auto‐login
    await login(email, password);
  };

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

export function useAuth() {
  return useContext(AuthContext);
}
