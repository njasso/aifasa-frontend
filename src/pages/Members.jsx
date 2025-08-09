import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiEdit2, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin, FiFileText } from 'react-icons/fi';

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
    profilePictureFileName: '', // Changed to be more specific
    cvFile: null, // New state for the CV file
    cvFileName: '' // New state for the CV file name
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterProfession, setFilterProfession] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState(''); // Changed to be more specific
  const [cvFileError, setCvFileError] = useState(''); // New state for CV file error

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
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfilePictureError('');
    setCvFileError('');
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.sex.trim() || !formData.role.trim() || !formData.profession.trim()) {
      // NOTE: The original code uses `alert()`, which should be replaced by a custom modal for a better user experience.
      alert('Veuillez remplir au moins les champs obligatoires : Prénom, Nom, Sexe, Rôle, Profession.');
      return;
    }

    if (formData.profilePicture && formData.profilePicture.size > 5 * 1024 * 1024) {
      setProfilePictureError('La photo de profil ne doit pas dépasser 5MB');
      return;
    }

    // New check for CV file size
    if (formData.cvFile && formData.cvFile.size > 10 * 1024 * 1024) {
      setCvFileError('Le fichier CV ne doit pas dépasser 10MB');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          // Gérer les fichiers spécifiquement
          if (key === 'profilePicture' && formData[key]) {
            data.append('profilePicture', formData[key]); 
          } else if (key === 'cvFile' && formData[key]) {
            data.append('cv', formData[key]); 
          } else if (key !== 'profilePictureFileName' && key !== 'cvFileName') {
            data.append(key, formData[key]);
          }
        }
      }

      if (editingId) {
        // Assume updateMember can handle FormData
        const updatedMember = await updateMember(editingId, data);
        setMembers(members.map(m => m.id === editingId ? updatedMember : m));
        setEditingId(null);
        alert('Membre mis à jour avec succès !');
      } else {
        // Assume createMember can handle FormData
        const newMember = await createMember(data);
        setMembers([newMember, ...members]);
        alert('Membre ajouté avec succès !');
      }
      
      // Reset form data and errors
      setFormData({
        firstName: '', lastName: '', sex: '', location: '', address: '',
        contact: '', profession: '', employmentStructure: '', companyOrProject: '',
        activities: '', role: '', profilePicture: null, profilePictureFileName: '',
        cvFile: null, cvFileName: ''
      });
      setProfilePictureError('');
      setCvFileError('');
      // Note: e.target.reset() might not work as expected with state-controlled inputs.
      // Resetting the state with setFormData should be sufficient.
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le membre:', error);
      alert(`Échec de l'opération: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for profile picture file change
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
  
  // New handler for CV file change
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
      // Reset file inputs when editing
      profilePicture: null,
      profilePictureFileName: '',
      cvFile: null,
      cvFileName: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    // NOTE: The original code uses `window.confirm()`, which should be replaced by a custom modal for a better user experience.
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.')) {
      try {
        await deleteMember(id);
        setMembers(members.filter(m => m.id !== id));
        alert('Membre supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error);
        alert('Échec de la suppression du membre. Veuillez vérifier la console.');
      }
    }
  };

  // Memoized filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          (member.profession || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.contact || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === 'all' || (member.role || '').toLowerCase() === filterRole.toLowerCase();
      const matchesProfession = filterProfession === 'all' || (member.profession || '').toLowerCase() === filterProfession.toLowerCase();

      return matchesSearch && matchesRole && matchesProfession;
    });
  }, [members, searchTerm, filterRole, filterProfession]);

  // Group members by role
  const executiveBureau = useMemo(() => filteredMembers.filter(m => m.role === 'Bureau Exécutif'), [filteredMembers]);
  const adhocCommittee = useMemo(() => filteredMembers.filter(m => m.role === 'Comité Adhoc'), [filteredMembers]);
  const regularMembers = useMemo(() => filteredMembers.filter(m => m.role === 'Membre'), [filteredMembers]);

  // Chart data
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
      {/* Titre principal avec animation */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-emerald-800 flex items-center"
      >
        <FiUsers className="mr-3" />
        Gestion des Membres
      </motion.h1>

      {/* Formulaire d'ajout/édition */}
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
                <input
                  type="text"
                  placeholder="Ex: Jean"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  placeholder="Ex: Dupont"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  required
                >
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
                  <input
                    type="text"
                    placeholder="Ex: Yaoundé"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  placeholder="Ex: Rue 123, Quartier"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Téléphone ou Email"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
                <select
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {professionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Structure d'emploi</label>
                <input
                  type="text"
                  placeholder="Ex: Entreprise, Ministère"
                  value={formData.employmentStructure}
                  onChange={(e) => setFormData({ ...formData, employmentStructure: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise/Projet</label>
                <input
                  type="text"
                  placeholder="Ex: Projet XYZ"
                  value={formData.companyOrProject}
                  onChange={(e) => setFormData({ ...formData, companyOrProject: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activités</label>
                <input
                  type="text"
                  placeholder="Séparées par des virgules"
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {rolesOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de Profil</label>
                <label className={`block w-full border ${profilePictureError ? 'border-red-500' : 'border-gray-200'} p-3 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}>
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${formData.profilePictureFileName ? 'text-gray-800' : 'text-gray-500'}`}>
                      {formData.profilePictureFileName || 'Choisir un fichier...'}
                    </span>
                    <FiUpload className="text-gray-500 ml-2" />
                  </div>
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
                {profilePictureError && <p className="text-red-500 text-sm mt-1">{profilePictureError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier CV</label>
                <label className={`block w-full border ${cvFileError ? 'border-red-500' : 'border-gray-200'} p-3 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}>
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${formData.cvFileName ? 'text-gray-800' : 'text-gray-500'}`}>
                      {formData.cvFileName || 'Choisir un fichier...'}
                    </span>
                    <FiFileText className="text-gray-500 ml-2" />
                  </div>
                  <input
                    type="file"
                    name="cvFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvFileChange}
                    className="hidden"
                  />
                </label>
                {cvFileError && <p className="text-red-500 text-sm mt-1">{cvFileError}</p>}
              </div>
              
            </div>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opération en cours...
                </>
              ) : editingId ? (
                'Mettre à jour le membre'
              ) : (
                'Ajouter le membre'
              )}
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* Barre de recherche et de filtres */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, profession, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex space-x-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-700 shadow-sm"
          >
            <option value="all">Tous les rôles</option>
            {rolesOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            value={filterProfession}
            onChange={(e) => setFilterProfession(e.target.value)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-700 shadow-sm"
          >
            <option value="all">Toutes les professions</option>
            {professionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Affichage des membres */}
      {loading ? (
        <p className="text-center text-gray-500">Chargement des membres...</p>
      ) : (
        <div className="space-y-10">
          {executiveBureau.length > 0 && (
            <div>
              <motion.h2
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center"
              >
                <FiUsers className="mr-2" />
                Bureau Exécutif
                <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {executiveBureau.length} membre{executiveBureau.length > 1 ? 's' : ''}
                </span>
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {executiveBureau.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={fadeIn}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MemberCard 
                      member={member} 
                      onDelete={handleDelete} 
                      userRole={user?.role} 
                      onEdit={handleEdit} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {adhocCommittee.length > 0 && (
            <div>
              <motion.h2
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center"
              >
                <FiUsers className="mr-2" />
                Comité Adhoc
                <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {adhocCommittee.length} membre{adhocCommittee.length > 1 ? 's' : ''}
                </span>
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {adhocCommittee.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={fadeIn}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MemberCard 
                      member={member} 
                      onDelete={handleDelete} 
                      userRole={user?.role} 
                      onEdit={handleEdit} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {regularMembers.length > 0 && (
            <div>
              <motion.h2
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl font-bold mb-6 text-emerald-800 border-b-2 pb-2 border-emerald-600 flex items-center"
              >
                <FiUser className="mr-2" />
                Membres
                <span className="ml-auto text-sm font-normal bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {regularMembers.length} membre{regularMembers.length > 1 ? 's' : ''}
                </span>
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={fadeIn}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MemberCard 
                      member={member} 
                      onDelete={handleDelete} 
                      userRole={user?.role} 
                      onEdit={handleEdit} 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
