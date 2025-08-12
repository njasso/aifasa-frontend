import api from './api';

// Récupère tous les médias (images et vidéos)
export const getMedia = async () => {
  try {
    const response = await api.get('/gallery');
    return response.data;
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
};

// Crée un nouveau média
export const createMedia = async (data) => {
  try {
    const response = await api.post('/gallery', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating media:', error);
    throw error;
  }
};

// Supprime un média par son ID
export const deleteMedia = async (id) => {
  try {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};
