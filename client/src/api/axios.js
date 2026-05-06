// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  // Configurado para usar exclusivamente localhost
  baseURL: 'http://localhost:3000',
});

// Agrega el token y el bypass de localtunnel automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypass localtunnel warning screen for API requests
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

export default api;