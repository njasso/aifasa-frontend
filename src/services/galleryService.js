import api from './api';

// Récupère toutes les images
export const getImages = async () => {
  try {
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
    const response = await api.post('/gallery', data, {
      headers: {
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
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
