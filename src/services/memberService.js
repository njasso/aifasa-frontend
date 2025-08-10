// Le module 'api' est importé pour les communications avec le backend.
import api from './api';

/**
 * Gère l'upload d'un fichier non-image (comme un PDF) vers Cloudinary.
 * @param {File} file - Le fichier à uploader.
 * @returns {Promise<string>} L'URL du fichier sur Cloudinary.
 */
const uploadRawFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // Remplacez 'votre_upload_preset' par le preset d'upload de votre compte Cloudinary.
  formData.append('upload_preset', 'votre_upload_preset');
  // Le type 'raw' est utilisé pour les fichiers non-médias (comme les PDF).
  formData.append('resource_type', 'raw');

  // Ces paramètres sont CRUCIAUX pour que le nom de fichier d'origine soit conservé.
  formData.append('use_filename', true);
  formData.append('unique_filename', false);

  // Remplacez 'votre_cloud_name' par votre nom de cloud Cloudinary.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/votre_cloud_name/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  // Retourne l'URL sécurisée du fichier, qui inclut maintenant l'extension.
  return data.secure_url;
};

/**
 * Gère l'upload d'une image vers Cloudinary.
 * @param {File} file - L'image à uploader.
 * @returns {Promise<string>} L'URL de l'image sur Cloudinary.
 */
const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'votre_upload_preset');
  formData.append('resource_type', 'image'); // Type 'image' pour les photos

  // Remplacez 'votre_cloud_name' par votre nom de cloud Cloudinary.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/votre_cloud_name/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
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
    console.error('Failed to fetch members:', error);
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
    
    // Si un fichier de CV est présent, nous l'uploadons d'abord.
    if (data.cvFile) {
      const cvUrl = await uploadRawFileToCloudinary(data.cvFile);
      memberDataToSubmit.cv_url = cvUrl;
      delete memberDataToSubmit.cvFile;
    }
    
    // Si un fichier de photo de profil est présent, nous l'uploadons.
    if (data.photoFile) {
      const photoUrl = await uploadImageToCloudinary(data.photoFile);
      memberDataToSubmit.photo_url = photoUrl;
      delete memberDataToSubmit.photoFile;
    }

    // Le backend reçoit l'URL du CV et de la photo au lieu des fichiers bruts.
    const response = await api.post('/members', memberDataToSubmit);
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
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

    // Si un nouveau fichier de CV est fourni, nous l'uploadons.
    if (data.cvFile && typeof data.cvFile !== 'string') {
      const cvUrl = await uploadRawFileToCloudinary(data.cvFile);
      memberDataToSubmit.cv_url = cvUrl;
      delete memberDataToSubmit.cvFile;
    }
    
    // Si un nouveau fichier de photo de profil est fourni, nous l'uploadons.
    if (data.photoFile && typeof data.photoFile !== 'string') {
      const photoUrl = await uploadImageToCloudinary(data.photoFile);
      memberDataToSubmit.photo_url = photoUrl;
      delete memberDataToSubmit.photoFile;
    }

    // Le backend reçoit l'URL du CV et de la photo au lieu des fichiers bruts.
    const response = await api.put(`/members/${id}`, memberDataToSubmit);
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
