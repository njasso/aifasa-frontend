// Le module 'api' est importé pour les communications avec le backend.
import api from './api';

// Cette fonction gère l'upload d'un fichier (comme un PDF) vers Cloudinary.
// Il est essentiel de configurer les options pour conserver l'extension du fichier.
const uploadFileToCloudinary = async (file) => {
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
 * @param {object} data Données du membre à créer, incluant potentiellement des fichiers.
 * @returns {Promise<object>} Le membre créé.
 * @throws {Error} Lance une erreur si l'appel API échoue.
 */
export const createMember = async (data) => {
  try {
    let memberDataToSubmit = { ...data };
    
    // Si un fichier de CV est présent, nous l'uploadons d'abord.
    if (data.cvFile) {
      const cvUrl = await uploadFileToCloudinary(data.cvFile);
      memberDataToSubmit.cv_url = cvUrl;
      delete memberDataToSubmit.cvFile; // Supprime le fichier brut pour ne pas l'envoyer au backend.
    }
    
    // Le backend reçoit l'URL du CV au lieu du fichier brut.
    const response = await api.post('/members', memberDataToSubmit);
    return response.data;
  } catch (error) {
    console.error('Failed to create member:', error);
    throw error;
  }
};

/**
 * Met à jour un membre existant.
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
      const cvUrl = await uploadFileToCloudinary(data.cvFile);
      memberDataToSubmit.cv_url = cvUrl;
      delete memberDataToSubmit.cvFile;
    }

    // Le backend reçoit l'URL du CV au lieu du fichier brut.
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
