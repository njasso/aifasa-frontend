import axios from 'axios';

// Correction: le nom de la variable d'environnement a été mis à jour
// pour correspondre à celui configuré sur Netlify.
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default api;