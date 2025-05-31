// src/api/axiosInstance.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI backend

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT automatically if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
