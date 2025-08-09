import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiPlus, FiSearch, FiUpload, FiXCircle, FiPhone, FiMapPin, FiFileText } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Définition de dépendances factices pour rendre le code autonome.
// Dans votre projet, ces dépendances seraient importées de fichiers séparés.
const useAuth = () => ({
  user: { role: 'admin' } // Simuler un utilisateur admin connecté
});

const memberService = {
  getMembers: () => new Promise(resolve => {
    // Données fictives pour simuler un appel API
    const mockMembers = [
      { id: '1', first_name: 'Jean', last_name: 'Dupont', sex: 'Homme', contact: '0612345678', role: 'Bureau Exécutif', profession: 'Ingénieur Agronome', profile_picture_url: 'https://placehold.co/100x100' },
      { id: '2', first_name: 'Marie', last_name: 'Curie', sex: 'Femme', contact: '0712345678', role: 'Comité Adhoc', profession: 'Ingénieur des Eaux et Forêts', profile_picture_url: 'https://placehold.co/100x100' },
      { id: '3', first_name: 'Pierre', last_name: 'Martin', sex: 'Homme', contact: '0698765432', role: 'Membre', profession: 'Ingénieur Génie Rural', profile_picture_url: 'https://placehold.co/100x100' },
      { id: '4', first_name: 'Sophie', last_name: 'Dubois', sex: 'Femme', contact: '0798765432', role: 'Membre', profession: 'Ingénieur Agronome', profile_picture_url: 'https://placehold.co/100x100' },
    ];
    setTimeout(() => resolve(mockMembers), 500);
  }),
  createMember: (formData) => new Promise(resolve => {
    console.log('Création de membre avec les données:', Object.fromEntries(formData));
    setTimeout(() => resolve({ id: Date.now().toString(), ...Object.fromEntries(formData) }), 500);
  }),
  updateMember: (id, formData) => new Promise(resolve => {
    console.log('Mise à jour de membre', id, 'avec les données:', Object.fromEntries(formData));
    setTimeout(() => resolve({ id, ...Object.fromEntries(formData) }), 500);
  }),
  deleteMember: (id) => new Promise(resolve => {
    console.log('Suppression de membre', id);
    setTimeout(() => resolve(), 500);
  }),
};

// Composant de carte de membre (MemberCard) simplifié pour la démonstration
const MemberCard = ({ member, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
      <img src={member.profile_picture_url || 'https://placehold.co/100x100'} alt={member.first_name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-emerald-300" />
      <h3 className="text-xl font-bold text-gray-800">{member.first_name} {member.last_name}</h3>
      <p className="text-sm text-gray-500 mb-2">{member.role}</p>
      <div className="mt-auto pt-4 flex gap-2">
        <button onClick={() => onEdit(member)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-200 transition">Éditer</button>
        <button onClick={() => onDelete(member.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold hover:bg-red-200 transition">Supprimer</button>
      </div>
    </div>
  );
};

// Composant Modal pour remplacer les alertes natives
const Modal = ({ message, onConfirm, onCancel, showConfirm = true, showCancel = true, isError = false }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
        {isError && (
          <FiXCircle className="mx-auto text-red-500 text-4xl mb-4" />
        )}
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <div className="flex gap-4 justify-center">
          {showConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 ${isError ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-lg transition-colors`}
            >
              {isError ? 'Fermer' : 'Confirmer'}
            </button>
          )}
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Définition des animations de carte pour Framer Motion
const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const Members = () => {
  // Contexte d'authentification pour obtenir les informations de l'utilisateur
  const { user } = useAuth();
  
  // États locaux
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sex: '',
    location: '',
    address: '',
    contact: '',
    profession: '',
    employmentStructure: '',
    companyOrProject: '',
    activities: '',
    role: '',
    profilePicture: null,
    profilePictureFileName: '',
    cvFile: null,
    cvFileName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDeleteId, setMemberToDeleteId] = useState(null);

  // Fonction pour charger les membres depuis le backend
  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des membres :", err);
      setError("Impossible de charger les membres.");
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les membres au montage du composant
  useEffect(() => {
    loadMembers();
  }, []);

  // Utilisation de useMemo pour séparer les admins et les membres réguliers
  // Cela évite de refaire le calcul à chaque rendu si les membres n'ont pas changé.
  const { admins, executiveBureau, adhocCommittee, regularMembers } = useMemo(() => {
    const admins = members.filter(member => member.role === 'admin');
    const executiveBureau = members.filter(member => member.role === 'Bureau Exécutif');
    const adhocCommittee = members.filter(member => member.role === 'Comité Adhoc');
    const regularMembers = members.filter(member => member.role === 'Membre');
    return { admins, executiveBureau, adhocCommittee, regularMembers };
  }, [members]);

  // Utilisation de useMemo pour filtrer les membres
  const filteredMembers = useMemo(() => {
    const allMembers = [...executiveBureau, ...adhocCommittee, ...regularMembers];
    if (!searchQuery) return allMembers;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allMembers.filter(member =>
      (member.first_name && member.first_name.toLowerCase().includes(lowerCaseQuery)) ||
      (member.last_name && member.last_name.toLowerCase().includes(lowerCaseQuery)) ||
      (member.contact && member.contact.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchQuery, executiveBureau, adhocCommittee, regularMembers]);

  // Fonctions de gestion de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour gérer les changements de fichiers (photo de profil et CV)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
        [`${name}FileName`]: files[0].name
      }));
    }
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construction de l'objet FormData pour envoyer les données et les fichiers
    const dataToSend = new FormData();
    for (const key in formData) {
      // Les clés de fichiers sont traitées séparément
      if (key !== 'profilePicture' && key !== 'cvFile') {
        dataToSend.append(key, formData[key]);
      }
    }
    // Ajout des fichiers s'ils existent
    if (formData.profilePicture) {
        dataToSend.append('profilePicture', formData.profilePicture);
    }
    if (formData.cvFile) {
        dataToSend.append('cv', formData.cvFile);
    }

    try {
      if (isEditMode) {
        await memberService.updateMember(currentMemberId, dataToSend);
        console.log("Membre mis à jour avec succès!");
      } else {
        await memberService.createMember(dataToSend);
        console.log("Membre ajouté avec succès!");
      }
      resetForm();
      loadMembers(); // Recharger les membres pour voir les changements
      setIsFormOpen(false);
    } catch (err) {
      console.error("Erreur lors de l'opération :", err);
      setError("Erreur lors de l'opération. Veuillez réessayer.");
    }
  };

  // Fonction pour préparer le formulaire en mode édition
  const handleEdit = (member) => {
    setFormData({
      firstName: member.first_name || '',
      lastName: member.last_name || '',
      sex: member.sex || '',
      location: member.location || '',
      address: member.address || '',
      contact: member.contact || '',
      profession: member.profession || '',
      employmentStructure: member.employment_structure || '',
      companyOrProject: member.company_or_project || '',
      activities: member.activities || '',
      role: member.role || '',
      profilePicture: null, // Les fichiers ne sont pas pré-remplis
      profilePictureFileName: '', // Réinitialiser le nom du fichier pour l'upload
      cvFile: null, // Les fichiers ne sont pas pré-remplis
      cvFileName: '' // Réinitialiser le nom du fichier pour l'upload
    });
    setCurrentMemberId(member.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Fonction pour ouvrir la modale de confirmation de suppression
  const handleOpenDeleteModal = (id) => {
    setMemberToDeleteId(id);
    setShowDeleteModal(true);
  };

  // Fonction de suppression d'un membre
  const handleDelete = async () => {
    try {
      await memberService.deleteMember(memberToDeleteId);
      console.log("Membre supprimé avec succès!");
      loadMembers();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError("Erreur lors de la suppression. Veuillez réessayer.");
    } finally {
      setShowDeleteModal(false);
      setMemberToDeleteId(null);
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      sex: '',
      location: '',
      address: '',
      contact: '',
      profession: '',
      employmentStructure: '',
      companyOrProject: '',
      activities: '',
      role: '',
      profilePicture: null,
      profilePictureFileName: '',
      cvFile: null,
      cvFileName: ''
    });
    setIsEditMode(false);
    setCurrentMemberId(null);
  };


  // Rendu de la page
  if (loading) return <p className="text-center text-xl mt-10">Chargement des membres...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-emerald-800">Gestion des Membres</h1>

      {user?.role === 'admin' && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => { setIsFormOpen(true); resetForm(); }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105 flex items-center"
          >
            <FiPlus className="mr-2" /> Ajouter un membre
          </button>
        </div>
      )}

      {/* Modals */}
      {showDeleteModal && (
        <Modal
          message="Êtes-vous sûr de vouloir supprimer ce membre ?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-800">{isEditMode ? "Modifier un membre" : "Ajouter un membre"}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-800">
                <FiXCircle className="text-3xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Champ de nom */}
              <div>
                <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-2">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              {/* Champ de nom de famille */}
              <div>
                <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-2">Nom de famille</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              {/* Champ de sexe */}
              <div>
                <label htmlFor="sex" className="block text-gray-700 font-semibold mb-2">Sexe</label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Sélectionnez le sexe</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>
              {/* Champ de profession */}
              <div>
                <label htmlFor="profession" className="block text-gray-700 font-semibold mb-2">Profession</label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {/* Champ de structure d'emploi */}
              <div>
                <label htmlFor="employmentStructure" className="block text-gray-700 font-semibold mb-2">Structure d'emploi</label>
                <input
                  type="text"
                  id="employmentStructure"
                  name="employmentStructure"
                  value={formData.employmentStructure}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {/* Champ d'entreprise/projet */}
              <div>
                <label htmlFor="companyOrProject" className="block text-gray-700 font-semibold mb-2">Entreprise/Projet</label>
                <input
                  type="text"
                  id="companyOrProject"
                  name="companyOrProject"
                  value={formData.companyOrProject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {/* Champ de contact */}
              <div>
                <label htmlFor="contact" className="block text-gray-700 font-semibold mb-2">Contact</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              {/* Champ de rôle */}
              <div>
                <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">Rôle</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Sélectionnez un rôle</option>
                  <option value="admin">Administrateur</option>
                  <option value="Bureau Exécutif">Bureau Exécutif</option>
                  <option value="Comité Adhoc">Comité Adhoc</option>
                  <option value="Membre">Membre</option>
                </select>
              </div>
              {/* Champ d'adresse */}
              <div>
                <label htmlFor="address" className="block text-gray-700 font-semibold mb-2">Adresse</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {/* Champ de localisation */}
              <div>
                <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">Localisation</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {/* Champ d'activités */}
              <div className="md:col-span-2">
                <label htmlFor="activities" className="block text-gray-700 font-semibold mb-2">Activités</label>
                <textarea
                  id="activities"
                  name="activities"
                  value={formData.activities}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                ></textarea>
              </div>
              {/* Champ de photo de profil */}
              <div className="md:col-span-2">
                <label htmlFor="profilePicture" className="block text-gray-700 font-semibold mb-2 flex items-center">
                  <FiUpload className="mr-2" /> Photo de profil
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
              {/* Champ de CV */}
              <div className="md:col-span-2">
                <label htmlFor="cvFile" className="block text-gray-700 font-semibold mb-2 flex items-center">
                  <FiUpload className="mr-2" /> CV du membre
                </label>
                <input
                  type="file"
                  id="cvFile"
                  name="cvFile"
                  onChange={handleFileChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {/* Bouton de soumission */}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
                >
                  {isEditMode ? "Enregistrer les modifications" : "Ajouter le membre"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un membre par nom ou contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Affichage des membres filtrés ou des listes séparées */}
      {searchQuery ? (
        // Affichage d'une seule liste si une recherche est en cours
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
            <FiUsers className="mr-2" />
            Résultats de la recherche
            <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MemberCard
                  member={member}
                  onDelete={() => handleOpenDeleteModal(member.id)}
                  userRole={user?.role}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        // Affichage des listes séparées si aucune recherche n'est en cours
        <>
          {/* Rôle - Bureau Exécutif */}
          {executiveBureau.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
                <FiUsers className="mr-2" />
                Bureau Exécutif
                <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {executiveBureau.length} membre{executiveBureau.length > 1 ? 's' : ''}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {executiveBureau.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MemberCard
                      member={member}
                      onDelete={() => handleOpenDeleteModal(member.id)}
                      userRole={user?.role}
                      onEdit={handleEdit}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Rôle - Comité Adhoc */}
          {adhocCommittee.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
                <FiUsers className="mr-2" />
                Comité Adhoc
                <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {adhocCommittee.length} membre{adhocCommittee.length > 1 ? 's' : ''}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {adhocCommittee.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MemberCard
                      member={member}
                      onDelete={() => handleOpenDeleteModal(member.id)}
                      userRole={user?.role}
                      onEdit={handleEdit}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Rôle - Membres */}
          {regularMembers.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
                <FiUser className="mr-2" />
                Membres
                <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {regularMembers.length} membre{regularMembers.length > 1 ? 's' : ''}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={fadeIn}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MemberCard
                      member={member}
                      onDelete={() => handleOpenDeleteModal(member.id)}
                      userRole={user?.role}
                      onEdit={handleEdit}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Members;
