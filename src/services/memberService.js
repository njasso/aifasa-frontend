// Le module 'api' est importé pour les communications avec le backend.
import api from './api';

/**
 * Récupère la liste de tous les membres depuis l'API.
 * @returns {Promise<Array>} Une promesse qui résout en un tableau d'objets membres.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const getMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw error;
  }
};

/**
 * Crée un nouveau membre avec les données fournies.
 * Gère l'envoi des fichiers de CV et de photo de profil au backend.
 * @param {object} data Données du membre à créer, incluant potentiellement des fichiers.
 * @returns {Promise<object>} Le membre créé.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const createMember = async (data) => {
  try {
    const formData = new FormData();
    // Ajout de tous les champs de données non-fichiers
    for (const key in data) {
      if (key !== 'photoFile' && key !== 'cvFile') {
        formData.append(key, data[key]);
      }
    }
    // Ajout des fichiers de photo et de CV si ils existent
    if (data.photoFile) {
      formData.append('profilePicture', data.photoFile);
    }
    if (data.cvFile) {
      formData.append('cv', data.cvFile);
    }

    // Le backend reçoit le FormData avec les fichiers et les champs textuels.
    const response = await api.post('/members', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
    throw error;
  }
};

/**
 * Met à jour un membre existant.
 * Gère l'envoi des fichiers de CV et de photo de profil au backend.
 * @param {string|number} id Identifiant du membre.
 * @param {object} data Données mises à jour, incluant potentiellement des fichiers.
 * @returns {Promise<object>} Le membre mis à jour.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const updateMember = async (id, data) => {
  try {
    const formData = new FormData();
    // Ajout des champs existants et des nouveaux champs textuels
    for (const key in data) {
      if (key !== 'photoFile' && key !== 'cvFile') {
        formData.append(key, data[key]);
      }
    }
    // Ajout des fichiers de photo et de CV si ils existent
    if (data.photoFile) {
      formData.append('profilePicture', data.photoFile);
    }
    if (data.cvFile) {
      formData.append('cv', data.cvFile);
    }
    
    // Le backend reçoit le FormData avec les fichiers et les champs textuels.
    const response = await api.put(`/members/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update member:', error);
    throw error;
  }
};

/**
 * Supprime un membre par son identifiant.
 * @param {string|number} id Identifiant du membre à supprimer.
 * @returns {Promise<object>} Réponse de l'API après suppression.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete member:', error);
    throw error;
  }
};
