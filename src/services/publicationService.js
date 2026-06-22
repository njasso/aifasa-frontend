// src/services/publicationService.js
import api from './api';

// Récupérer toutes les publications
export const getPublications = async () => {
  try {
    const response = await api.get('/publications');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des publications:', error);
    throw error;
  }
};

// Récupérer une publication par ID
export const getPublicationById = async (id) => {
  try {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement de la publication:', error);
    throw error;
  }
};

// Créer une publication
export const createPublication = async (formData) => {
  try {
    const response = await api.post('/publications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la publication:', error);
    throw error;
  }
};

// Mettre à jour une publication
export const updatePublication = async (id, formData) => {
  try {
    const response = await api.put(`/publications/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la publication:', error);
    throw error;
  }
};

// Supprimer une publication
export const deletePublication = async (id) => {
  try {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la publication:', error);
    throw error;
  }
};