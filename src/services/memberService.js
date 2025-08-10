// Import du module 'api' pour les communications avec le backend.
import api from './api';

// ***************************************************************
// REMARQUE IMPORTANTE :
// Remplacez ces chaînes par les variables d'environnement de votre projet
// pour des raisons de sécurité. Par exemple :
// const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
// const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
// ***************************************************************
const CLOUDINARY_CLOUD_NAME = 'votre_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = 'votre_upload_preset';

/**
 * Gère l'upload générique d'un fichier vers Cloudinary.
 * @param {File} file - Le fichier à uploader.
 * @param {'image' | 'raw'} resourceType - Le type de ressource ('image' pour les photos, 'raw' pour les fichiers non-médias).
 * @returns {Promise<string>} L'URL sécurisée du fichier sur Cloudinary.
 * @throws {Error} Lance une erreur si l'upload échoue.
 */
const uploadToCloudinary = async (file, resourceType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('resource_type', resourceType);

  // Ces paramètres sont CRUCIAUX pour les uploads 'raw' afin de conserver le nom de fichier d'origine.
  if (resourceType === 'raw') {
    formData.append('use_filename', true);
    formData.append('unique_filename', false);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `L'upload Cloudinary a échoué avec le statut ${response.status}`);
    }

    const data = await response.json();
    // Retourne l'URL sécurisée du fichier.
    return data.secure_url;
  } catch (error) {
    console.error(`Échec de l'upload du fichier de type '${resourceType}' vers Cloudinary :`, error);
    throw error;
  }
};

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
    console.error('Échec de la récupération des membres :', error);
    throw error;
  }
};

/**
 * Crée un nouveau membre avec les données fournies.
 * Gère l'upload des fichiers de CV et de photo de profil vers Cloudinary.
 * @param {object} data Données du membre à créer, incluant potentiellement des fichiers.
 * @returns {Promise<object>} Le membre créé.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const createMember = async (data) => {
  try {
    let memberDataToSubmit = { ...data };

    if (data.cvFile) {
      memberDataToSubmit.cv_url = await uploadToCloudinary(data.cvFile, 'raw');
      delete memberDataToSubmit.cvFile;
    }

    if (data.photoFile) {
      memberDataToSubmit.photo_url = await uploadToCloudinary(data.photoFile, 'image');
      delete memberDataToSubmit.photoFile;
    }

    const response = await api.post('/members', memberDataToSubmit);
    return response.data;
  } catch (error) {
    console.error('Échec de la création du membre :', error);
    throw error;
  }
};

/**
 * Met à jour un membre existant.
 * Gère l'upload des fichiers de CV et de photo de profil vers Cloudinary.
 * @param {string|number} id Identifiant du membre.
 * @param {object} data Données mises à jour, incluant potentiellement des fichiers.
 * @returns {Promise<object>} Le membre mis à jour.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const updateMember = async (id, data) => {
  try {
    let memberDataToSubmit = { ...data };

    // Si un nouveau fichier de CV est fourni (pas juste une URL string)
    if (data.cvFile && typeof data.cvFile !== 'string') {
      memberDataToSubmit.cv_url = await uploadToCloudinary(data.cvFile, 'raw');
      delete memberDataToSubmit.cvFile;
    }

    // Si un nouveau fichier de photo est fourni (pas juste une URL string)
    if (data.photoFile && typeof data.photoFile !== 'string') {
      memberDataToSubmit.photo_url = await uploadToCloudinary(data.photoFile, 'image');
      delete memberDataToSubmit.photoFile;
    }

    const response = await api.put(`/members/${id}`, memberDataToSubmit);
    return response.data;
  } catch (error) {
    console.error('Échec de la mise à jour du membre :', error);
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
    console.error('Échec de la suppression du membre :', error);
    throw error;
  }
};
