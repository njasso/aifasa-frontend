// services/galleryService.js
import api from './api';

// Récupérer tous les médias
export const getMedia = async () => {
  try {
    const response = await api.get('/gallery');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des médias:', error);
    throw error;
  }
};

// Créer un média
export const createMedia = async (formData) => {
  try {
    const response = await api.post('/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du média:', error);
    throw error;
  }
};

// Supprimer un média
export const deleteMedia = async (id) => {
  try {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    throw error;
  }
};