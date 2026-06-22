// src/services/userService.js
import api from './api';

// Récupérer tous les utilisateurs (admin uniquement)
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'utilisateur:', error);
    throw error;
  }
};

// Créer un utilisateur (admin uniquement)
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};

// Mettre à jour un utilisateur (admin uniquement)
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

// Supprimer un utilisateur (admin uniquement)
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

// Réinitialiser le mot de passe d'un utilisateur
export const resetUserPassword = async (id, newPassword) => {
  try {
    const response = await api.post(`/admin/users/${id}/reset-password`, { password: newPassword });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    throw error;
  }
};

// Changer le rôle d'un utilisateur
export const changeUserRole = async (id, role) => {
  try {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de rôle:', error);
    throw error;
  }
};