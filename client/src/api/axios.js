// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  // Cambiado de localhost a tu IP local para permitir acceso desde otros dispositivos (celular, otra PC)
  baseURL: 'http://192.168.1.52:3000',
});

// Agrega el token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;