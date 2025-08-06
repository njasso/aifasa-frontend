import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiEdit2, FiTrash2, FiPlus, FiSearch, FiPhone, FiMail,FiUpload, FiMapPin } from 'react-icons/fi';

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
    fileName: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterProfession, setFilterProfession] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

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
    setFileError('');
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.sex.trim() || !formData.role.trim() || !formData.profession.trim()) {
      alert('Veuillez remplir au moins les champs obligatoires : Prénom, Nom, Sexe, Rôle, Profession.');
      return;
    }

    if (formData.profilePicture && formData.profilePicture.size > 5 * 1024 * 1024) {
      setFileError('La photo de profil ne doit pas dépasser 5MB');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      }

      if (editingId) {
        const updatedMember = await updateMember(editingId, data);
        setMembers(members.map(m => m.id === editingId ? updatedMember : m));
        setEditingId(null);
        alert('Membre mis à jour avec succès !');
      } else {
        const newMember = await createMember(data);
        setMembers([newMember, ...members]);
        alert('Membre ajouté avec succès !');
      }
      
      setFormData({
        firstName: '', lastName: '', sex: '', location: '', address: '',
        contact: '', profession: '', employmentStructure: '', companyOrProject: '',
        activities: '', role: '', profilePicture: null, fileName: ''
      });
      e.target.reset();
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le membre:', error);
      alert(`Échec de l'opération: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setFormData({
        ...formData,
        profilePicture: file,
        fileName: file.name
      });
      setFileError('');
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
      profilePicture: null,
      fileName: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
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
                <label className={`block w-full border ${fileError ? 'border-red-500' : 'border-gray-200'} p-3 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}>
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${formData.fileName ? 'text-gray-800' : 'text-gray-500'}`}>
                      {formData.fileName || "Choisir un fichier..."}
                    </span>
                    <FiUpload className="text-emerald-600" />
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
                <p className="mt-1 text-xs text-gray-500">Max. 5MB (JPEG, PNG)</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-md flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Mise à jour...' : 'Enregistrement...'}
                  </>
                ) : (
                  editingId ? 'Mettre à jour' : 'Ajouter Membre'
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      firstName: '', lastName: '', sex: '', location: '', address: '',
                      contact: '', profession: '', employmentStructure: '', companyOrProject: '',
                      activities: '', role: '', profilePicture: null, fileName: ''
                    });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-md"
                >
                  Annuler
                </button>
              )}
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
                      onDelete={handleDelete} 
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
                      onDelete={handleDelete} 
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
                      onDelete={handleDelete} 
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