// src/api.js
import axios from "axios";

// 🔑 VITE_API_URL défini dans ton .env (ex: https://africanut-backend-production.up.railway.app)
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

// Création d'une instance Axios
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token JWT si dispo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Authentification ---
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data; // { token, user }
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// --- Exemple d’autres appels API ---
// Récupérer la liste des utilisateurs
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// Récupérer les examens
export const getExams = async () => {
  const response = await api.get("/exams");
  return response.data;
};

// Export de l’instance pour usage direct si besoin
export default api;
