import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiEdit2, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin, FiFileText, FiXCircle } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Modal = ({ message, onConfirm, onCancel, showConfirm = true, showCancel = true, isError = false }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
        {isError && <FiXCircle className="mx-auto text-red-500 text-4xl mb-4" />}
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
    photoFile: null,
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

    if (formData.photoFile && formData.photoFile.size > 5 * 1024 * 1024) {
      setProfilePictureError('La photo de profil ne doit pas dépasser 5MB');
      return;
    }

    if (formData.cvFile && formData.cvFile.size > 10 * 1024 * 1024) {
      setCvFileError('Le fichier CV ne doit pas dépasser 10MB');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        sex: formData.sex,
        location: formData.location,
        address: formData.address,
        contact: formData.contact,
        profession: formData.profession,
        employment_structure: formData.employmentStructure,
        company_or_project: formData.companyOrProject,
        activities: formData.activities,
        role: formData.role,
      };

      // Correction : Assurez-vous d'utiliser 'profilePicture' si c'est ce que le service attend.
      if (formData.photoFile) {
        dataToSubmit.profilePicture = formData.photoFile; 
      }
      if (formData.cvFile) {
        dataToSubmit.cvFile = formData.cvFile;
      }

      let result;
      if (editingId) {
        result = await updateMember(editingId, dataToSubmit);
        setMembers(members.map(m => m.id === editingId ? result : m));
        setEditingId(null);
        setModalState({
          isOpen: true,
          message: 'Membre mis à jour avec succès !',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false
        });
      } else {
        result = await createMember(dataToSubmit);
        setMembers([result, ...members]);
        setModalState({
          isOpen: true,
          message: 'Membre ajouté avec succès !',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false
        });
      }
      
      setFormData({
        firstName: '', lastName: '', sex: '', location: '', address: '',
        contact: '', profession: '', employmentStructure: '', companyOrProject: '',
        activities: '', role: '', photoFile: null, profilePictureFileName: '',
        cvFile: null, cvFileName: ''
      });
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
        setProfilePictureError('La photo de profil ne doit pas dépasser 5MB');
        return;
      }
      setFormData({
        ...formData,
        photoFile: file,
        profilePictureFileName: file.name
      });
      setProfilePictureError('');
    } else {
      setFormData({ ...formData, photoFile: null, profilePictureFileName: '' });
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
      photoFile: null,
      profilePictureFileName: member.photo_url ? 'Fichier existant' : '',
      cvFile: null,
      cvFileName: member.cv_url ? 'Fichier existant' : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (member.profession || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.employment_structure || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.company_or_project || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.activities || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === 'all' || (member.role || '').toLowerCase() === filterRole.toLowerCase();
      const matchesProfession = filterProfession === 'all' || (member.profession || '').toLowerCase() === filterProfession.toLowerCase();

      return matchesSearch && matchesRole && matchesProfession;
    });
  }, [members, searchTerm, filterRole, filterProfession]);

  const executiveBureau = useMemo(() => filteredMembers.filter(m => m.role === 'Bureau Exécutif'), [filteredMembers]);
  const adhocCommittee = useMemo(() => filteredMembers.filter(m => m.role === 'Comité Adhoc'), [filteredMembers]);
  const regularMembers = useMemo(() => filteredMembers.filter(m => m.role === 'Membre'), [filteredMembers]);

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
          'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(99, 102, 241, 0.7)',
          'rgba(239, 68, 68, 0.7)', 'rgba(107, 114, 128, 0.7)', 'rgba(139, 92, 246, 0.7)',
          'rgba(6, 182, 212, 0.7)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)', 'rgba(245, 158, 11, 1)', 'rgba(99, 102, 241, 1)',
          'rgba(239, 68, 68, 1)', 'rgba(107, 114, 128, 1)', 'rgba(139, 92, 246, 1)',
          'rgba(6, 182, 212, 1)'
        ],
        borderWidth: 1,
      }]
    };
  }, [members]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
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

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-emerald-800 flex items-center"
      >
        <FiUsers className="mr-3" />
        Gestion des Membres
      </motion.h1>

      {user?.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            {editingId ? (
              <>
                <FiEdit2 className="mr-2 text-emerald-600" />
                Modifier les informations du Membre
              </>
            ) : (
              <>
                <FiPlus className="mr-2 text-emerald-600" />
                Ajouter un Nouveau Membre
              </>
            )}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input type="text" placeholder="Ex: Jean" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" placeholder="Ex: Dupont" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                <select value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" required >
                  <option value="">Sélectionner...</option>
                  {sexOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Ex: Yaoundé" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input type="text" placeholder="Ex: Rue 123, Quartier" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Téléphone ou Email" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
                <select value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" required >
                  <option value="">Sélectionner...</option>
                  {professionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Structure d'emploi</label>
                <input type="text" placeholder="Ex: Entreprise, Ministère" value={formData.employmentStructure} onChange={(e) => setFormData({ ...formData, employmentStructure: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise/Projet</label>
                <input type="text" placeholder="Ex: Projet XYZ" value={formData.companyOrProject} onChange={(e) => setFormData({ ...formData, companyOrProject: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activités</label>
                <input type="text" placeholder="Séparées par des virgules" value={formData.activities} onChange={(e) => setFormData({ ...formData, activities: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" required >
                  <option value="">Sélectionner...</option>
                  {rolesOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-between border border-gray-200 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="truncate text-gray-500">
                      {formData.profilePictureFileName || 'Cliquez pour uploader'}
                    </span>
                    <FiUpload className="text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </div>
                {profilePictureError && <p className="mt-1 text-red-500 text-sm">{profilePictureError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier CV</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleCvFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-between border border-gray-200 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="truncate text-gray-500">
                      {formData.cvFileName || 'Cliquez pour uploader'}
                    </span>
                    <FiFileText className="text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </div>
                {cvFileError && <p className="mt-1 text-red-500 text-sm">{cvFileError}</p>}
              </div>
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`flex-grow px-6 py-3 rounded-lg text-white font-semibold transition-colors shadow-md ${isSubmitting ? 'bg-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde en cours...
                  </div>
                ) : editingId ? (
                  'Mettre à jour le membre'
                ) : (
                  'Ajouter le membre'
                )}
              </motion.button>
              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      firstName: '', lastName: '', sex: '', location: '', address: '',
                      contact: '', profession: '', employmentStructure: '', companyOrProject: '',
                      activities: '', role: '', photoFile: null, profilePictureFileName: '',
                      cvFile: null, cvFileName: ''
                    });
                  }}
                  className="px-6 py-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
                >
                  Annuler
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-lg">Chargement des membres...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-200 p-2 rounded-lg w-full md:w-48 bg-white"
              >
                <option value="all">Tous les rôles</option>
                {rolesOptions.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                value={filterProfession}
                onChange={(e) => setFilterProfession(e.target.value)}
                className="border border-gray-200 p-2 rounded-lg w-full md:w-48 bg-white"
              >
                <option value="all">Toutes les professions</option>
                {professionOptions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Répartition par Sexe</h3>
              <div className="h-64 flex items-center justify-center">
                {members.length > 0 ? (
                  <Pie data={genderData} options={{ maintainAspectRatio: false, responsive: true }} />
                ) : (
                  <p className="text-gray-500">Pas de données</p>
                )}
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Membres par Profession</h3>
              <div className="h-64 flex items-center justify-center">
                {members.length > 0 ? (
                  <Bar data={professionChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                ) : (
                  <p className="text-gray-500">Pas de données</p>
                )}
              </div>
            </div>
          </div>

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
