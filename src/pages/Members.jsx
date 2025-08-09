import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import MemberCard from '../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiEdit2, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin, FiFileText, FiXCircle } from 'react-icons/fi';
import { useForm } from 'react-hook-form'; // Ajouté pour la gestion des formulaires

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
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterProfession, setFilterProfession] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Utilisation de useForm pour la gestion du formulaire
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
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
      cvFile: null,
      is_new_member: false,
      last_annual_inscription_date: '',
      has_paid_adhesion: false,
      social_contribution_status: {},
      tontine_status: {},
      ag_absence_count: 0
    }
  });

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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    // Ajout des champs de texte
    Object.keys(data).forEach(key => {
      if (key !== 'profilePicture' && key !== 'cvFile') {
        // Gérer les champs complexes si nécessaire (pas dans cet exemple simple)
        if (typeof data[key] === 'object' && data[key] !== null) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    // Ajout des fichiers
    if (data.profilePicture && data.profilePicture.length > 0) {
      formData.append('profilePicture', data.profilePicture[0]);
    }
    // CORRECTION : Utiliser le nom de champ 'cv' pour correspondre au backend
    if (data.cvFile && data.cvFile.length > 0) {
      formData.append('cv', data.cvFile[0]);
    }

    try {
      if (editingId) {
        const updatedMember = await updateMember(editingId, formData);
        setMembers(members.map(m => m.id === editingId ? updatedMember : m));
        setEditingId(null);
        setModalState({
          isOpen: true,
          message: 'Membre mis à jour avec succès !',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false
        });
      } else {
        const newMember = await createMember(formData);
        setMembers([newMember, ...members]);
        setModalState({
          isOpen: true,
          message: 'Membre ajouté avec succès !',
          onConfirm: () => setModalState({ isOpen: false }),
          onCancel: null,
          showCancel: false
        });
      }
      
      reset(); // Réinitialise le formulaire
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
  
  const handleEdit = (member) => {
    setEditingId(member.id);
    reset({
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
      is_new_member: member.is_new_member || false,
      last_annual_inscription_date: member.last_annual_inscription_date || '',
      has_paid_adhesion: member.has_paid_adhesion || false,
      ag_absence_count: member.ag_absence_count || 0
    });
    // Scroll vers le formulaire
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-semibold text-emerald-800">Chargement des membres...</div>;
  }

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

      {/* Titre principal avec animation */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-emerald-800 flex items-center" 
      >
        <FiUsers className="mr-3" /> Gestion des Membres
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
                <FiEdit2 className="mr-2 text-emerald-600" /> Modifier les informations du Membre
              </>
            ) : (
              <>
                <FiPlus className="mr-2 text-emerald-600" /> Ajouter un Nouveau Membre
              </>
            )}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  placeholder="Ex: Jean"
                  {...register('firstName', { required: 'Le prénom est requis' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  placeholder="Ex: Dupont"
                  {...register('lastName', { required: 'Le nom est requis' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                <select
                  {...register('sex', { required: 'Le sexe est requis' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {sexOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
                <input
                  type="text"
                  placeholder="Ex: Douala"
                  {...register('location', { required: 'Le lieu est requis' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input
                  type="text"
                  placeholder="Ex: BP 1234, Douala"
                  {...register('address', { required: 'L\'adresse est requise' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                <input
                  type="text"
                  placeholder="Ex: +237 6xx-xx-xx-xx"
                  {...register('contact', { required: 'Le contact est requis' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
                <select
                  {...register('profession', { required: 'La profession est requise' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {professionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Structure d'emploi</label>
                <input
                  type="text"
                  placeholder="Ex: Secteur Public"
                  {...register('employmentStructure')}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise ou Projet</label>
                <input
                  type="text"
                  placeholder="Ex: Projet HIMO"
                  {...register('companyOrProject')}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activités</label>
                <input
                  type="text"
                  placeholder="Ex: Agriculture urbaine"
                  {...register('activities')}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  {...register('role', { required: 'Le rôle est requis' })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {rolesOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                <input
                  type="file"
                  {...register('profilePicture', {
                    validate: {
                      fileSize: files => !files[0] || files[0].size <= 5 * 1024 * 1024 || 'La photo de profil ne doit pas dépasser 5MB'
                    }
                  })}
                  accept="image/*"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 w-full"
                />
                {errors.profilePicture && <p className="text-red-500 text-sm mt-1">{errors.profilePicture.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier CV</label>
                <input
                  type="file"
                  {...register('cvFile', {
                    validate: {
                      fileSize: files => !files[0] || files[0].size <= 10 * 1024 * 1024 || 'Le fichier CV ne doit pas dépasser 10MB'
                    }
                  })}
                  accept=".pdf,.doc,.docx"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 w-full"
                />
                {errors.cvFile && <p className="text-red-500 text-sm mt-1">{errors.cvFile.message}</p>}
              </div>
              {/* Nouveaux champs pour l'admin */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau membre ?</label>
                <input type="checkbox" {...register('is_new_member')} className="form-checkbox h-5 w-5 text-emerald-600 rounded" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date dernière inscription</label>
                <input type="date" {...register('last_annual_inscription_date')} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adhésion payée ?</label>
                <input type="checkbox" {...register('has_paid_adhesion')} className="form-checkbox h-5 w-5 text-emerald-600 rounded" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'absences AG</label>
                <input type="number" {...register('ag_absence_count', { valueAsNumber: true })} className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              {/* Les champs social_contribution_status et tontine_status ne sont pas gérés ici pour le moment */}
            </div>

            <div className="flex justify-end space-x-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); reset(); }}
                  className="px-6 py-2 rounded-lg text-red-600 border border-red-600 hover:bg-red-50 transition-colors"
                >
                  Annuler la modification
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white font-bold transition-colors ${
                  isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? 'Envoi en cours...' : (editingId ? 'Sauvegarder les modifications' : 'Ajouter')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Barre de recherche et de filtre */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.4 }} 
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100 flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full md:w-auto p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Tous les rôles</option>
            {rolesOptions.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterProfession}
            onChange={(e) => setFilterProfession(e.target.value)}
            className="w-full md:w-auto p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Toutes les professions</option>
            {professionOptions.map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Statistiques (Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <motion.div variants={fadeIn} transition={{ duration: 0.5 }} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Répartition par sexe</h2>
          <div className="h-64 flex items-center justify-center">
            {members.length > 0 ? (
              <Pie data={genderData} />
            ) : (
              <p className="text-gray-500">Aucune donnée disponible.</p>
            )}
          </div>
        </motion.div>
        <motion.div variants={fadeIn} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Membres par profession</h2>
          <div className="h-64 flex items-center justify-center">
            {members.length > 0 ? (
              <Bar data={professionChartData} />
            ) : (
              <p className="text-gray-500">Aucune donnée disponible.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sections des membres */}
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
                  onDelete={handleOpenDeleteModal} 
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
                  onDelete={handleOpenDeleteModal} 
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
                  onDelete={handleOpenDeleteModal} 
                  userRole={user?.role} 
                  onEdit={handleEdit} 
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
