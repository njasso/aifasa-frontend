// src/pages/private/Members.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember } from '../../services/memberService';
import MemberCard from '../../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiUsers, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin, 
  FiFileText, FiX, FiCheckCircle, FiAlertCircle, FiBarChart2, 
  FiBriefcase, FiGrid, FiUserPlus, FiEdit2, FiTrash2
} from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: '600' }, padding: 15 } },
  },
};

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-xs"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 text-red-600 mb-3">
        <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
        <h4 className="font-bold text-gray-900 text-base">Suppression de membre</h4>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-5">{message}</p>
      <div className="flex justify-end space-x-2 text-xs font-bold">
        <button onClick={onCancel} className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">
          Confirmer la suppression
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Members = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showStats, setShowStats] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'member',
    sex: '',
    location: '',
    address: '',
    contact: '',
    profession: '',
    employment_structure: '',
    company_or_project: '',
    activities: '',
    photoFile: null,
    profilePictureFileName: '',
    cvFile: null,
    cvFileName: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const triggerAlert = useCallback((message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      triggerAlert('Erreur lors du chargement des membres.', 'error');
    } finally {
      setLoading(false);
    }
  }, [triggerAlert]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ✅ handleFileChange
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    console.log(`📎 handleFileChange - ${type}:`, file ? file.name : 'Aucun fichier sélectionné');
    
    if (file) {
      if (type === 'photo' && file.size > 5 * 1024 * 1024) {
        triggerAlert('La photo ne doit pas dépasser 5 Mo.', 'error');
        return;
      }
      if (type === 'cv' && file.size > 10 * 1024 * 1024) {
        triggerAlert('Le CV ne doit pas dépasser 10 Mo.', 'error');
        return;
      }
      console.log(`✅ ${type} sélectionné:`, file.name, `(${file.size} bytes)`);
      setFormData(prev => ({ 
        ...prev, 
        [type === 'photo' ? 'photoFile' : 'cvFile']: file,
        [type === 'photo' ? 'profilePictureFileName' : 'cvFileName']: file.name
      }));
    }
  };

  // ✅ handleSubmit avec dataToSend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      triggerAlert('Les nom et prénom sont obligatoires.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Créer l'objet dataToSend avec TOUS les champs
      const dataToSend = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number || '',
        role: formData.role || 'member',
        sex: formData.sex || '',
        location: formData.location || '',
        address: formData.address || '',
        contact: formData.contact || '',
        profession: formData.profession || '',
        employment_structure: formData.employment_structure || '',
        company_or_project: formData.company_or_project || '',
        activities: formData.activities || '',
        photoFile: formData.photoFile || null,
        cvFile: formData.cvFile || null
      };

      console.log('📦 dataToSend:', {
        ...dataToSend,
        photoFile: dataToSend.photoFile ? dataToSend.photoFile.name : 'Aucun',
        cvFile: dataToSend.cvFile ? dataToSend.cvFile.name : 'Aucun'
      });

      let result;
      if (editingMemberId) {
        result = await updateMember(editingMemberId, dataToSend);
        setMembers(prev => prev.map(m => m.id === editingMemberId ? result : m));
        triggerAlert('Membre mis à jour avec succès.', 'success');
      } else {
        result = await createMember(dataToSend);
        setMembers(prev => [result, ...prev]);
        triggerAlert('Nouveau membre ajouté avec succès.', 'success');
      }

      resetForm();
    } catch (error) {
      console.error('❌ Erreur:', error);
      triggerAlert(error.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMemberId(member.id);
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      phone_number: member.phone_number || '',
      role: member.role || 'member',
      sex: member.sex || '',
      location: member.location || '',
      address: member.address || '',
      contact: member.contact || '',
      profession: member.profession || '',
      employment_structure: member.employment_structure || '',
      company_or_project: member.company_or_project || '',
      activities: member.activities || '',
      photoFile: null,
      profilePictureFileName: member.photo_url ? 'Image existante' : '',
      cvFile: null,
      cvFileName: member.cv_url ? 'CV existant' : ''
    });
    setIsFormOpen(true);
  };

  const handleOpenDeleteModal = (id) => {
    const member = members.find(m => m.id === id);
    setMemberToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMember(memberToDelete);
      setMembers(prev => prev.filter(m => m.id !== memberToDelete));
      triggerAlert('Membre supprimé avec succès.', 'success');
    } catch (error) {
      console.error(error);
      triggerAlert('Erreur lors de la suppression.', 'error');
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      phone_number: '',
      role: 'member',
      sex: '',
      location: '',
      address: '',
      contact: '',
      profession: '',
      employment_structure: '',
      company_or_project: '',
      activities: '',
      photoFile: null,
      profilePictureFileName: '',
      cvFile: null,
      cvFileName: ''
    });
    setEditingMemberId(null);
    setIsFormOpen(false);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const searchString = `${m.first_name || ''} ${m.last_name || ''} ${m.profession || ''} ${m.location || ''} ${m.contact || ''}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      
      if (filterRole === 'bureau') return matchesSearch && m.role === 'Bureau Exécutif';
      if (filterRole === 'regular') return matchesSearch && m.role !== 'Bureau Exécutif';
      return matchesSearch;
    });
  }, [members, searchTerm, filterRole]);

  const bureauMembers = useMemo(() => filteredMembers.filter(m => m.role === 'Bureau Exécutif'), [filteredMembers]);
  const regularMembers = useMemo(() => filteredMembers.filter(m => m.role !== 'Bureau Exécutif'), [filteredMembers]);

  const statsData = useMemo(() => {
    const professions = {};
    const genders = { Homme: 0, Femme: 0 };
    const roles = {};

    members.forEach(m => {
      if (m.profession) {
        professions[m.profession] = (professions[m.profession] || 0) + 1;
      }
      if (m.sex && genders[m.sex] !== undefined) {
        genders[m.sex]++;
      }
      if (m.role) {
        roles[m.role] = (roles[m.role] || 0) + 1;
      }
    });

    return {
      professions: {
        labels: Object.keys(professions),
        datasets: [{
          data: Object.values(professions),
          backgroundColor: ['#047857', '#0369a1', '#b45309', '#6b7280', '#7c3aed', '#0891b2'],
          borderWidth: 0
        }]
      },
      genders: {
        labels: ['Homme', 'Femme'],
        datasets: [{
          data: [genders.Homme, genders.Femme],
          backgroundColor: ['#3b82f6', '#ec4899'],
          borderWidth: 0
        }]
      },
      roles: {
        labels: Object.keys(roles),
        datasets: [{
          data: Object.values(roles),
          backgroundColor: ['#8b5cf6', '#10b981', '#6b7280'],
          borderWidth: 0
        }]
      }
    };
  }, [members]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-emerald-800 selection:text-white">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white py-12 px-4 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-block text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/20 mb-2 uppercase tracking-wider">
              Annuaire des Membres
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Gestion des Membres</h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-xl font-light">
              Gérez l'ensemble des membres de l'AIFASA 17
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all"
            >
              <FiBarChart2 className="w-4 h-4" /> {showStats ? "Masquer les stats" : "Voir les statistiques"}
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <FiPlus className="w-4 h-4" /> Ajouter un membre
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Alertes */}
      <div className="fixed top-5 right-5 z-50 max-w-sm w-full px-4">
        <AnimatePresence>
          {alert.message && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md ${
                alert.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {alert.type === 'error' ? <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /> : <FiCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
              <p className="text-xs font-semibold">{alert.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistiques */}
      <AnimatePresence>
        {showStats && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="container mx-auto max-w-7xl px-4 pt-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="text-center md:text-left flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Effectif total</p>
                <h3 className="text-4xl font-black text-emerald-950 mt-1">{members.length}</h3>
                <p className="text-xs text-gray-400 mt-1">Membres de l'AIFASA 17</p>
              </div>
              <div className="h-44 relative">
                <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><FiBriefcase className="text-emerald-600" /> Professions</p>
                <div className="w-full h-36"><Pie data={statsData.professions} options={chartOptions} /></div>
              </div>
              <div className="h-44 relative">
                <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><FiMapPin className="text-emerald-600" /> Répartition par sexe</p>
                <div className="w-full h-36"><Pie data={statsData.genders} options={chartOptions} /></div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Recherche et Filtrage */}
      <section className="container mx-auto max-w-7xl px-4 py-6">
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, profession, localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg w-full focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm outline-none"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-lg w-full sm:w-auto flex-shrink-0">
            {[
              { id: 'all', label: 'Tous', icon: FiUsers },
              { id: 'bureau', label: 'Bureau', icon: FiGrid },
              { id: 'regular', label: 'Membres', icon: FiUser }
            ].map(btn => (
              <button
                key={btn.id} onClick={() => setFilterRole(btn.id)}
                className={`text-xs font-bold px-3 py-2 rounded-md flex items-center gap-1 w-full sm:w-auto justify-center transition-all ${
                  filterRole === btn.id ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <btn.icon className="w-3.5 h-3.5" /> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des membres */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-700 border-t-transparent mb-3"></div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Chargement des membres...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 max-w-lg mx-auto shadow-sm p-8">
            <FiUsers className="mx-auto text-4xl text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-700">Aucun membre trouvé</h3>
            <p className="text-xs text-gray-400 mt-1">Aucun membre ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Bureau Exécutif */}
            {bureauMembers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                  <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-md"><FiGrid className="w-4 h-4" /></span>
                  Bureau Exécutif
                  <span className="ml-auto text-[11px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded-full">{bureauMembers.length} membres</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bureauMembers.map(member => (
                    <MemberCard 
                      key={member.id} member={member} userRole={user?.role}
                      onEdit={handleEdit} onDelete={() => handleOpenDeleteModal(member.id)} 
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Membres */}
            {regularMembers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                  <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-md"><FiUsers className="w-4 h-4" /></span>
                  Membres de l'Association
                  <span className="ml-auto text-[11px] font-bold bg-gray-500 text-white px-2 py-0.5 rounded-full">{regularMembers.length} membres</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {regularMembers.map(member => (
                    <MemberCard 
                      key={member.id} member={member} userRole={user?.role}
                      onEdit={handleEdit} onDelete={() => handleOpenDeleteModal(member.id)} 
                    />
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        )}
      </section>

      {/* Formulaire d'ajout/édition */}
      <AnimatePresence>
        {isFormOpen && isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={resetForm}
          >
            <motion.div 
              initial={{ scale: 0.97, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 10 }}
              className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <FiUserPlus className="w-4 h-4" />
                  <span className="text-base">{editingMemberId ? 'Modifier le membre' : 'Ajouter un membre'}</span>
                </div>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1"><FiX className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prénom *</label>
                    <input
                      type="text" value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom *</label>
                    <input
                      type="text" value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact</label>
                    <input
                      type="text" value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Téléphone</label>
                    <input
                      type="text" value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sexe</label>
                    <select
                      value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg bg-white font-medium text-gray-700 outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rôle</label>
                    <select
                      value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg bg-white font-medium text-gray-700 outline-none"
                    >
                      <option value="member">Membre</option>
                      <option value="Bureau Exécutif">Bureau Exécutif</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Localisation</label>
                    <input
                      type="text" value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Profession</label>
                    <input
                      type="text" value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse</label>
                  <input
                    type="text" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Structure d'emploi</label>
                  <input
                    type="text" value={formData.employment_structure}
                    onChange={(e) => setFormData({ ...formData, employment_structure: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entreprise / Projet</label>
                  <input
                    type="text" value={formData.company_or_project}
                    onChange={(e) => setFormData({ ...formData, company_or_project: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Activités</label>
                  <input
                    type="text" value={formData.activities}
                    onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Photo de profil */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Photo de profil</label>
                  <div className="flex items-center gap-4">
                    {formData.profilePictureFileName && (
                      <div className="text-xs text-gray-600">{formData.profilePictureFileName}</div>
                    )}
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <FiUpload className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formData.profilePictureFileName ? 'Changer la photo' : 'Ajouter une photo'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* CV */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CV (PDF)</label>
                  <div className="flex items-center gap-4">
                    {formData.cvFileName && (
                      <div className="text-xs text-gray-600">{formData.cvFileName}</div>
                    )}
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <FiFileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formData.cvFileName ? 'Changer le CV' : 'Ajouter un CV'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'cv')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 font-semibold">
                    Annuler
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-40 shadow-sm">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                        <span>Traitement...</span>
                      </>
                    ) : (editingMemberId ? 'Mettre à jour' : 'Ajouter le membre')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation de suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            message="Êtes-vous sûr de vouloir supprimer ce membre définitivement ?"
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Members;