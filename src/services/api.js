// services/api.js
import axios from 'axios';

// ============================================
// CONFIGURATION DE L'API
// ============================================

const API_URL = process.env.REACT_APP_API_BASE_URL 
  ? `${process.env.REACT_APP_API_BASE_URL}/api`
  : 'http://localhost:5000/api';

const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log(`🔗 API URL: ${API_URL}`);
}

// Création de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============================================
// INTERCEPTEURS
// ============================================

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ Pour FormData, supprimer Content-Type
    if (config.data && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // ✅ Logs uniquement en développement
    if (isDevelopment) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Erreur ${error.response.status}:`, error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ Pas de réponse du serveur:', error.request);
    } else {
      console.error('❌ Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVICES D'AUTHENTIFICATION
// ============================================

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('❌ Erreur login:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur getCurrentUser:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
};

export const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || null;
  } catch {
    return null;
  }
};

export default api;