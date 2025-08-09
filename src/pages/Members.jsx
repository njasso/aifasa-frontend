import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiPlus, FiSearch, FiUpload, FiXCircle } from 'react-icons/fi';

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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

const Members = () => {
  const { user } = useAuth();
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
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterProfession, setFilterProfession] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState('');
  const [cvFileError, setCvFileError] = useState('');

  // État pour la gestion des modals (confirmation, succès, erreur)
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null,
    showConfirm: true,
    showCancel: true,
    isError: false,
  });

  const [memberToDeleteId, setMemberToDeleteId] = useState(null);

  // Options pour les menus déroulants
  const rolesOptions = ['Bureau Exécutif', 'Comité Adhoc', 'Membre'];
  const sexOptions = ['Homme', 'Femme'];
  const professionOptions = [
    'Ingénieur Agronome',
    'Ingénieur des Eaux et Forêts',
    'Ingénieur Génie Rural',
    'Ingénieur Économie Agricole',
    'Ingénieur Halieute',
    'Autre'
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await getMembers();
        setMembers(data);
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
        setModalState({
          isOpen: true,
          message: 'Erreur lors du chargement des membres.',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false,
          isError: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleOpenDeleteModal = (id) => {
    const memberName = members.find(m => m.id === id)?.first_name + ' ' + members.find(m => m.id === id)?.last_name;
    setMemberToDeleteId(id);
    setModalState({
      isOpen: true,
      message: `Êtes-vous sûr de vouloir supprimer ${memberName} ? Cette action est irréversible.`,
      onConfirm: confirmDelete,
      onCancel: () => setModalState({ isOpen: false }),
      showConfirm: true,
      showCancel: true,
      isError: false,
    });
  };

  const confirmDelete = async () => {
    if (!memberToDeleteId) return;

    setModalState({ ...modalState, isOpen: false });
    
    try {
      await deleteMember(memberToDeleteId);
      setMembers(members.filter(m => m.id !== memberToDeleteId));
      setModalState({
        isOpen: true,
        message: 'Membre supprimé avec succès !',
        onConfirm: () => setModalState({ isOpen: false }),
        onCancel: null,
        showCancel: false,
        isError: false,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      setModalState({
        isOpen: true,
        message: 'Échec de la suppression du membre. Veuillez vérifier la console.',
        onConfirm: () => setModalState({ isOpen: false }),
        onCancel: null,
        showCancel: false,
        isError: true,
      });
    } finally {
      setMemberToDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfilePictureError('');
    setCvFileError('');
    
    // Validation des champs obligatoires
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.sex.trim() || !formData.role.trim() || !formData.profession.trim()) {
      setModalState({
        isOpen: true,
        message: 'Veuillez remplir au moins les champs obligatoires : Prénom, Nom, Sexe, Rôle, Profession.',
        onConfirm: () => setModalState({ isOpen: false }),
        onCancel: null,
        showCancel: false,
        isError: true,
      });
      return;
    }

    // Validation de la taille des fichiers
    if (formData.profilePicture && formData.profilePicture.size > 5 * 1024 * 1024) {
      setProfilePictureError('La photo de profil ne doit pas dépasser 5MB');
      return;
    }
    if (formData.cvFile && formData.cvFile.size > 10 * 1024 * 1024) {
      setCvFileError('Le fichier CV ne doit pas dépasser 10MB');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      // Ajout des champs de texte
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('sex', formData.sex);
      data.append('location', formData.location);
      data.append('address', formData.address);
      data.append('contact', formData.contact);
      data.append('profession', formData.profession);
      data.append('employmentStructure', formData.employmentStructure);
      data.append('companyOrProject', formData.companyOrProject);
      data.append('activities', formData.activities);
      data.append('role', formData.role);

      // Ajout conditionnel des fichiers
      // IMPORTANT : le nom du champ doit correspondre à celui attendu par votre backend (ex: 'profilePicture', 'cv').
      if (formData.profilePicture) {
        data.append('profilePicture', formData.profilePicture);
      }
      if (formData.cvFile) {
        data.append('cv', formData.cvFile);
      }

      let newMember;
      if (editingId) {
        newMember = await updateMember(editingId, data);
        setMembers(members.map(m => m.id === editingId ? newMember : m));
        setEditingId(null);
        setModalState({
          isOpen: true,
          message: 'Membre mis à jour avec succès !',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false
        });
      } else {
        newMember = await createMember(data);
        setMembers([newMember, ...members]);
        setModalState({
          isOpen: true,
          message: 'Membre ajouté avec succès !',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false
        });
      }
      
      // Réinitialisation du formulaire
      setFormData({
        firstName: '', lastName: '', sex: '', location: '', address: '',
        contact: '', profession: '', employmentStructure: '', companyOrProject: '',
        activities: '', role: '', profilePicture: null, profilePictureFileName: '',
        cvFile: null, cvFileName: ''
      });
      setProfilePictureError('');
      setCvFileError('');
      // Réinitialisation du champ de fichier HTML
      e.target.reset();
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le membre:', error);
      setModalState({
        isOpen: true,
        message: `Échec de l'opération: ${error.message || 'Erreur inconnue'}`,
        onConfirm: () => setModalState({ isOpen: false }),
        onCancel: null,
        showCancel: false,
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfilePictureError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setFormData({
        ...formData,
        profilePicture: file,
        profilePictureFileName: file.name
      });
      setProfilePictureError('');
    } else {
      setFormData({ ...formData, profilePicture: null, profilePictureFileName: '' });
    }
  };
  
  const handleCvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setCvFileError('Le fichier CV ne doit pas dépasser 10MB');
        return;
      }
      setFormData({
        ...formData,
        cvFile: file,
        cvFileName: file.name
      });
      setCvFileError('');
    } else {
      setFormData({ ...formData, cvFile: null, cvFileName: '' });
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    // Assurez-vous que les champs 'company_or_project', 'employment_structure', etc.,
    // sont correctement mappés depuis l'objet membre retourné par le backend.
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (member.profession || '').toLowerCase().includes(searchTerm.toLowerCase()) || (member.location || '').toLowerCase().includes(searchTerm.toLowerCase()) || (member.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) || (member.address || '').toLowerCase().includes(searchTerm.toLowerCase()) || (member.employment_structure || '').toLowerCase().includes(searchTerm.toLowerCase()) || (member.company_or_project || '').toLowerCase().includes(searchTerm.toLowerCase()) || (member.activities || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || (member.role || '').toLowerCase() === filterRole.toLowerCase();
      const matchesProfession = filterProfession === 'all' || (member.profession || '').toLowerCase() === filterProfession.toLowerCase();
      return matchesSearch && matchesRole && matchesProfession;
    });
  }, [members, searchTerm, filterRole, filterProfession]);

  const executiveBureau = useMemo(() => filteredMembers.filter(m => m.role === 'Bureau Exécutif'), [filteredMembers]);
  const adhocCommittee = useMemo(() => filteredMembers.filter(m => m.role === 'Comité Adhoc'), [filteredMembers]);
  const regularMembers = useMemo(() => filteredMembers.filter(m => m.role === 'Membre'), [filteredMembers]);

  // Données de graphique - Rôle
  const roleData = useMemo(() => {
    const roleCounts = {
      'Bureau Exécutif': 0,
      'Comité Adhoc': 0,
      'Membre': 0
    };
    members.forEach(member => {
      if (roleCounts.hasOwnProperty(member.role)) {
        roleCounts[member.role]++;
      }
    });

    return {
      labels: Object.keys(roleCounts),
      datasets: [
        {
          label: 'Nombre par Rôle',
          data: Object.values(roleCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [members]);

  // Données de graphique - Sexe
  const genderData = useMemo(() => ({
    labels: ['Hommes', 'Femmes'],
    datasets: [{
      data: [
        members.filter(m => m.sex === 'Homme').length,
        members.filter(m => m.sex === 'Femme').length,
      ],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'],
      borderColor: ['rgba(59, 130, 246, 1)', 'rgba(236, 72, 153, 1)'],
      borderWidth: 1,
    }]
  }), [members]);

  // Données de graphique - Profession
  const professionChartData = useMemo(() => {
    const professionCounts = members.reduce((acc, member) => {
      if (member.profession) {
        acc[member.profession] = (acc[member.profession] || 0) + 1;
      }
      return acc;
    }, {});
    return {
      labels: Object.keys(professionCounts),
      datasets: [{
        label: 'Nombre par Profession',
        data: Object.values(professionCounts),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(107, 114, 128, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(6, 182, 212, 0.7)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(6, 182, 212, 1)'
        ],
        borderWidth: 1,
      }]
    };
  }, [members]);

  // Rendu de la page
  if (loading) return <p className="text-center text-xl mt-10">Chargement des membres...</p>;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Modal pour les messages et confirmations */}
      {modalState.isOpen && (
        <Modal
          message={modalState.message}
          onConfirm={modalState.onConfirm}
          onCancel={modalState.onCancel}
          showConfirm={modalState.showConfirm}
          showCancel={modalState.showCancel}
          isError={modalState.isError}
        />
      )}

      <h1 className="text-4xl font-extrabold mb-8 text-center text-emerald-800">Gestion des Membres</h1>

      {user?.role === 'admin' && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => { setEditingId(null); setFormData({
              firstName: '', lastName: '', sex: '', location: '', address: '',
              contact: '', profession: '', employmentStructure: '', companyOrProject: '',
              activities: '', role: '', profilePicture: null, profilePictureFileName: '',
              cvFile: null, cvFileName: ''
            }); }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105 flex items-center"
          >
            <FiPlus className="mr-2" /> {editingId ? 'Modifier' : 'Ajouter'} un membre
          </button>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      { (user?.role === 'admin' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600">{editingId ? 'Modifier un membre' : 'Ajouter un nouveau membre'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Champs de formulaire */}
            <div>
              <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-2">Prénom</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-2">Nom de famille</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label htmlFor="sex" className="block text-gray-700 font-semibold mb-2">Sexe</label>
              <select id="sex" name="sex" value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                <option value="">Sélectionnez le sexe</option>
                {sexOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="contact" className="block text-gray-700 font-semibold mb-2">Contact</label>
              <input type="text" id="contact" name="contact" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
            <div>
              <label htmlFor="profession" className="block text-gray-700 font-semibold mb-2">Profession</label>
              <select id="profession" name="profession" value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                <option value="">Sélectionnez une profession</option>
                {professionOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="employmentStructure" className="block text-gray-700 font-semibold mb-2">Structure d'emploi</label>
              <input type="text" id="employmentStructure" name="employmentStructure" value={formData.employmentStructure} onChange={(e) => setFormData({...formData, employmentStructure: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="companyOrProject" className="block text-gray-700 font-semibold mb-2">Entreprise/Projet</label>
              <input type="text" id="companyOrProject" name="companyOrProject" value={formData.companyOrProject} onChange={(e) => setFormData({...formData, companyOrProject: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">Rôle</label>
              <select id="role" name="role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
                <option value="">Sélectionnez un rôle</option>
                {rolesOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">Localisation</label>
              <input type="text" id="location" name="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-gray-700 font-semibold mb-2">Adresse</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="activities" className="block text-gray-700 font-semibold mb-2">Activités</label>
              <textarea id="activities" name="activities" value={formData.activities} onChange={(e) => setFormData({...formData, activities: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" rows="3"></textarea>
            </div>
            {/* Champs de fichier */}
            <div className="md:col-span-1">
              <label htmlFor="profilePicture" className="block text-gray-700 font-semibold mb-2 flex items-center">
                <FiUpload className="mr-2" /> Photo de profil
              </label>
              <input type="file" id="profilePicture" name="profilePicture" onChange={handleProfilePictureChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              {profilePictureError && <p className="text-red-500 text-sm mt-1">{profilePictureError}</p>}
            </div>
            <div className="md:col-span-1">
              <label htmlFor="cvFile" className="block text-gray-700 font-semibold mb-2 flex items-center">
                <FiUpload className="mr-2" /> CV du membre
              </label>
              <input type="file" id="cvFile" name="cvFile" onChange={handleCvFileChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              {cvFileError && <p className="text-red-500 text-sm mt-1">{cvFileError}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105 disabled:bg-gray-400">
                {isSubmitting ? 'Envoi en cours...' : editingId ? 'Enregistrer les modifications' : 'Ajouter le membre'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Barre de recherche et filtres */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, profession, localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-400" />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="all">Tous les rôles</option>
              {rolesOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-400" />
            </div>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="all">Toutes les professions</option>
              {professionOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Section des Statistiques */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-emerald-800 flex items-center">
          <FiUser className="mr-2" />
          Statistiques des Membres
        </h2>
        
        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Répartition Hommes / Femmes</h3>
              <div className="mx-auto w-3/4 md:w-full max-w-sm">
                <Pie 
                  data={genderData} 
                  options={{ 
                    responsive: true, 
                    plugins: { 
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    } 
                  }} 
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Membres par Profession</h3>
              <div className="mx-auto w-full max-w-md">
                <Bar 
                  data={professionChartData} 
                  options={{ 
                    responsive: true, 
                    plugins: { 
                      legend: { display: false },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FiUser className="mx-auto text-4xl text-gray-400 mb-3" />
            <p className="text-gray-600">Aucune donnée de membre pour les statistiques</p>
          </div>
        )}
      </motion.div>

      {/* Affichage des membres */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Chargement des membres...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl shadow border border-gray-100"
        >
          <FiSearch className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun membre trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || filterRole !== 'all' || filterProfession !== 'all' 
              ? "Essayez de modifier vos critères de recherche ou de filtre."
              : "Aucun membre n'a été enregistré pour le moment."}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {/* Bureau Exécutif */}
          {executiveBureau.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
                <FiUser className="mr-2" />
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

          {/* Comité Adhoc */}
          {adhocCommittee.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center">
                <FiUser className="mr-2" />
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

          {/* Membres */}
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
        </motion.div>
      )}
    </div>
  );
};

export default Members;
