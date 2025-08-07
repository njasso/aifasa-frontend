import api from './api';
import axios from 'axios'; // L'importation d'axios est nécessaire si vous utilisez le code tel quel.
// Cependant, il est préférable d'utiliser l'instance 'api' préconfigurée pour
// s'assurer que les en-têtes et l'URL de base sont corrects.

// Récupère toutes les images
export const getImages = async () => {
  try {
    // Utilise l'instance 'api' corrigée pour que l'URL de base (Render) soit correcte.
    const response = await api.get('/gallery');
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

// Crée une nouvelle image
export const createImage = async (data) => {
  try {
    // Utilise l'instance 'api' corrigée
    const response = await api.post('/gallery', data, {
      headers: {
        // Axios gère automatiquement le Content-Type pour FormData,
        // nous n'avons donc besoin de spécifier que les autres en-têtes.
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
};

// Supprime une image par son ID
export const deleteImage = async (id) => {
  try {
    // Utilise l'instance 'api' corrigée
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
