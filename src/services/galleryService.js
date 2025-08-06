import axios from 'axios';

const API_URL = 'http://localhost:5000/api/gallery'; // Adaptez l'URL si nécessaire

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      // Pour les requêtes avec fichier (FormData), le Content-Type est géré automatiquement par Axios
      // quand vous passez un objet FormData comme corps de requête.
      // Donc, pas besoin de le spécifier manuellement ici pour createImage.
    }
  };
};

export const getImages = async () => {
  try {
    // La route GET /gallery pourrait aussi nécessiter une authentification si elle est protégée
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const createImage = async (data) => {
  try {
    // Axios gère automatiquement 'Content-Type': 'multipart/form-data' quand 'data' est une instance de FormData.
    // Il suffit de passer les headers d'authentification.
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
};

export const deleteImage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
