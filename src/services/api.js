import axios from 'axios';

// La variable d'environnement est utilisée pour l'URL de base.
// Le préfixe '/api' est ajouté ici pour s'assurer que la route est toujours correcte.
const API_URL = process.env.REACT_APP_API_BASE_URL 
  ? `${process.env.REACT_APP_API_BASE_URL}/api` 
  : 'http://localhost:5000/api';

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
