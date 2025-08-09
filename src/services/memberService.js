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
 * Utilise 'multipart/form-data' pour gérer les fichiers (ex : photo).
 * @param {FormData|object} data Données du membre à créer.
 * @returns {Promise<object>} Le membre créé.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const createMember = async (data) => {
  try {
    const response = await api.post('/members', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
    throw error;
  }
};

/**
 * Met à jour un membre existant.
 * Utilise 'multipart/form-data' pour gérer les fichiers (ex : photo).
 * @param {string|number} id Identifiant du membre.
 * @param {FormData|object} data Données mises à jour.
 * @returns {Promise<object>} Le membre mis à jour.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const updateMember = async (id, data) => {
  try {
    const response = await api.put(`/members/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
