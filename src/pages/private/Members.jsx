// src/pages/private/Members.jsx — v2 optimisée
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMembers, createMember, updateMember, deleteMember, getLinkedAccountEmail } from '../../services/memberService';
import MemberCard from '../../components/MemberCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiUsers, FiPlus, FiSearch, FiPhone, FiUpload, FiMapPin,
  FiFileText, FiX, FiCheckCircle, FiAlertCircle, FiBarChart2,
  FiBriefcase, FiGrid, FiUserPlus, FiEdit2, FiTrash2,
  FiFilter, FiChevronDown, FiPrinter, FiDownload
} from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PIE_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: '600' }, padding: 10 } },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
    onClick={onCancel}>
    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
      className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-gray-100"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-red-50 rounded-xl"><FiAlertCircle className="w-5 h-5 text-red-600" /></div>
        <h4 className="font-bold text-gray-900">Confirmer la suppression</h4>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors">
          Annuler
        </button>
        <button onClick={onConfirm}
          className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl font-bold shadow-sm transition-colors">
          Supprimer
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Badge = ({ children, color = 'gray' }) => {
  const c = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c[color] || c.gray}`}>{children}</span>;
};

const StatBox = ({ label, value, sub, color = 'bg-emerald-50 text-emerald-900', icon }) => (
  <motion.div whileHover={{ y: -2 }} className={`${color} rounded-2xl p-5 flex flex-col gap-1`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wide opacity-60">{label}</span>
      {icon && <span className="text-xl">{icon}</span>}
    </div>
    <span className="text-3xl font-black">{value}</span>
    {sub && <span className="text-xs opacity-60">{sub}</span>}
  </motion.div>
);

// ─── Formulaire ───────────────────────────────────────────────────
const FORM_DEFAULT = {
  first_name: '', last_name: '', phone_number: '', role: 'member',
  sex: '', location: '', address: '', contact: '', profession: '',
  employment_structure: '', company_or_project: '', activities: '',
  user_email: '',
  photoFile: null, profilePictureFileName: '', cvFile: null, cvFileName: ''
};

const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 outline-none text-sm transition-colors bg-white';
const LABEL = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5';

// ─── Page principale ──────────────────────────────────────────────
const Members = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSex, setFilterSex] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(FORM_DEFAULT);
  const [formSection, setFormSection] = useState(0); // 0=identité, 1=pro, 2=fichiers

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const triggerAlert = useCallback((message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      triggerAlert('Erreur lors du chargement des membres.', 'error');
    } finally { setLoading(false); }
  }, [triggerAlert]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'photo' && file.size > 5 * 1024 * 1024) {
      triggerAlert('La photo ne doit pas dépasser 5 Mo.', 'error'); return;
    }
    if (type === 'cv' && file.size > 10 * 1024 * 1024) {
      triggerAlert('Le CV ne doit pas dépasser 10 Mo.', 'error'); return;
    }
    setFormData(prev => ({
      ...prev,
      [type === 'photo' ? 'photoFile' : 'cvFile']: file,
      [type === 'photo' ? 'profilePictureFileName' : 'cvFileName']: file.name
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      triggerAlert('Prénom et nom sont obligatoires.', 'error'); return;
    }
    setIsSubmitting(true);
    try {
      const dataToSend = { ...formData };
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
      triggerAlert(error.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleEdit = async member => {
    setEditingMemberId(member.id);
    setFormData({
      first_name: member.first_name || '', last_name: member.last_name || '',
      phone_number: member.phone_number || '', role: member.role || 'member',
      sex: member.sex || '', location: member.location || '', address: member.address || '',
      contact: member.contact || '', profession: member.profession || '',
      employment_structure: member.employment_structure || '',
      company_or_project: member.company_or_project || '', activities: member.activities || '',
      user_email: '', // pré-rempli juste en dessous une fois récupéré
      photoFile: null, profilePictureFileName: member.photo_url ? 'Photo existante' : '',
      cvFile: null, cvFileName: member.cv_url ? 'CV existant' : ''
    });
    setFormSection(0);
    setIsFormOpen(true);

    // Récupère l'email actuellement lié (silencieux si erreur, ex: droits)
    try {
      const linkedEmail = await getLinkedAccountEmail(member.id);
      if (linkedEmail) {
        setFormData(prev => ({ ...prev, user_email: linkedEmail }));
      }
    } catch (e) {
      console.error('Impossible de récupérer le compte lié:', e);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMember(memberToDelete);
      setMembers(prev => prev.filter(m => m.id !== memberToDelete));
      triggerAlert('Membre supprimé.', 'success');
    } catch { triggerAlert('Erreur lors de la suppression.', 'error'); }
    finally { setShowDeleteModal(false); setMemberToDelete(null); }
  };

  const resetForm = () => {
    setFormData(FORM_DEFAULT); setEditingMemberId(null);
    setIsFormOpen(false); setFormSection(0);
  };

  // Filtrage
  const filtered = useMemo(() => members.filter(m => {
    const s = `${m.first_name||''} ${m.last_name||''} ${m.profession||''} ${m.location||''} ${m.contact||''}`.toLowerCase();
    const matchSearch = s.includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' ? true
      : filterRole === 'bureau' ? m.role === 'Bureau Exécutif'
      : m.role !== 'Bureau Exécutif';
    const matchSex = filterSex === 'all' ? true : m.sex === filterSex;
    return matchSearch && matchRole && matchSex;
  }), [members, searchTerm, filterRole, filterSex]);

  const bureau = useMemo(() => filtered.filter(m => m.role === 'Bureau Exécutif'), [filtered]);
  const regular = useMemo(() => filtered.filter(m => m.role !== 'Bureau Exécutif'), [filtered]);

  // Stats
  const stats = useMemo(() => {
    const professions = {}, genders = { Homme: 0, Femme: 0 }, locs = {};
    members.forEach(m => {
      if (m.profession) professions[m.profession] = (professions[m.profession] || 0) + 1;
      if (m.sex && genders[m.sex] !== undefined) genders[m.sex]++;
      if (m.location) locs[m.location] = (locs[m.location] || 0) + 1;
    });
    const topLoc = Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      professions: {
        labels: Object.keys(professions),
        datasets: [{ data: Object.values(professions),
          backgroundColor: ['#047857','#0369a1','#b45309','#7c3aed','#0891b2','#be185d'],
          borderWidth: 0 }]
      },
      genders: {
        labels: ['Hommes', 'Femmes'],
        datasets: [{ data: [genders.Homme, genders.Femme],
          backgroundColor: ['#3b82f6','#ec4899'], borderWidth: 0 }]
      },
      locs: {
        labels: topLoc.map(([l]) => l),
        datasets: [{ label: 'Membres', data: topLoc.map(([,v]) => v),
          backgroundColor: '#059669', borderRadius: 6, borderSkipped: false }]
      }
    };
  }, [members]);

  const FORM_SECTIONS = ['Identité', 'Professionnel', 'Fichiers'];

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-emerald-200">

      {/* ─── HEADER ───────────────────────────────────────────── */}
      <header className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <img src="/images/logo.png" alt="AIFASA 17"
                className="h-14 w-14 rounded-full object-contain bg-white/10 p-1.5 border border-white/20 shadow-lg"
                onError={e => e.target.style.display = 'none'} />
              <div>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/20 uppercase tracking-wider">
                  Annuaire · AIFASA 17
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Gestion des Membres</h1>
                <p className="text-emerald-100/70 text-sm mt-0.5 font-light">
                  {members.length} membres enregistrés
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowStats(v => !v)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
                <FiBarChart2 size={15} /> {showStats ? 'Masquer' : 'Statistiques'}
              </button>
              {isAdmin && (
                <button onClick={() => { setIsFormOpen(true); setFormSection(0); }}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                  <FiPlus size={16} /> Ajouter un membre
                </button>
              )}
            </div>
          </div>

          {/* KPIs inline */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: 'Total', val: members.length, icon: '👥', col: 'bg-white/10 text-white' },
              { label: 'Bureau Exécutif', val: members.filter(m => m.role === 'Bureau Exécutif').length, icon: '🏛️', col: 'bg-white/10 text-white' },
              { label: 'Hommes', val: members.filter(m => m.sex === 'Homme').length, icon: '', col: 'bg-white/10 text-white' },
              { label: 'Femmes', val: members.filter(m => m.sex === 'Femme').length, icon: '', col: 'bg-white/10 text-white' },
            ].map((k, i) => (
              <div key={i} className={`${k.col} backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3`}>
                <span className="text-lg">{k.icon}</span>
                <div>
                  <div className="text-xs opacity-60 font-semibold">{k.label}</div>
                  <div className="text-xl font-black">{k.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── STATS ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStats && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                    <FiBriefcase className="text-emerald-600" /> Professions
                  </p>
                  <div className="h-44"><Pie data={stats.professions} options={PIE_OPTS} /></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                    <FiUsers className="text-blue-600" /> Répartition par sexe
                  </p>
                  <div className="h-44"><Pie data={stats.genders} options={PIE_OPTS} /></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                    <FiMapPin className="text-amber-600" /> Top localisations
                  </p>
                  <div className="h-44">
                    <Bar data={stats.locs} options={{
                      ...PIE_OPTS,
                      plugins: { legend: { display: false } },
                      scales: { y: { grid: { display: false } }, x: { grid: { display: false } } }
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── BARRE RECHERCHE + FILTRES ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row gap-3 items-center">
          {/* Recherche */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Rechercher par nom, profession, localisation…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-sm bg-gray-50 focus:bg-white transition-colors" />
          </div>

          {/* Filtres rôle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {[['all','Tous',FiUsers], ['bureau','Bureau',FiGrid], ['regular','Membres',FiUser]].map(([id, label, Icon]) => (
              <button key={id} onClick={() => setFilterRole(id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  filterRole === id ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {/* Filtre sexe */}
          <select value={filterSex} onChange={e => setFilterSex(e.target.value)}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none text-gray-600">
            <option value="all">Tous sexes</option>
            <option value="Homme">Hommes</option>
            <option value="Femme">Femmes</option>
          </select>

          {/* Vue grid/list */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400'}`}>
              <FiGrid size={14} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400'}`}>
              <FiUsers size={14} />
            </button>
          </div>

          {/* Résultats */}
          <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
            {filtered.length} / {members.length}
          </span>
        </div>
      </section>

      {/* ─── LISTE ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-700 border-t-transparent mb-4" />
            <p className="text-sm text-gray-500 font-medium">Chargement des membres…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto mt-4">
            <FiUsers className="mx-auto text-5xl text-gray-200 mb-3" />
            <h3 className="font-bold text-gray-700">Aucun membre trouvé</h3>
            <p className="text-xs text-gray-400 mt-1">Modifiez vos critères de recherche.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Bureau Exécutif */}
            {bureau.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl"><FiGrid size={15} /></div>
                  <h2 className="text-base font-black text-emerald-950">Bureau Exécutif</h2>
                  <span className="ml-auto text-[11px] font-bold bg-emerald-800 text-white px-2.5 py-0.5 rounded-full">
                    {bureau.length}
                  </span>
                </div>
                <div className={view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
                  : 'space-y-2'}>
                  {bureau.map(m => (
                    <MemberCard key={m.id} member={m} userRole={user?.role}
                      onEdit={handleEdit}
                      onDelete={() => { setMemberToDelete(m.id); setShowDeleteModal(true); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Membres */}
            {regular.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-gray-100 text-gray-700 rounded-xl"><FiUsers size={15} /></div>
                  <h2 className="text-base font-black text-gray-900">Membres de l'Association</h2>
                  <span className="ml-auto text-[11px] font-bold bg-gray-600 text-white px-2.5 py-0.5 rounded-full">
                    {regular.length}
                  </span>
                </div>
                <div className={view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
                  : 'space-y-2'}>
                  {regular.map(m => (
                    <MemberCard key={m.id} member={m} userRole={user?.role}
                      onEdit={handleEdit}
                      onDelete={() => { setMemberToDelete(m.id); setShowDeleteModal(true); }} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </section>

      {/* ─── TOAST ALERT ─────────────────────────────────────── */}
      <div className="fixed top-5 right-5 z-50 max-w-sm w-full px-4 pointer-events-none">
        <AnimatePresence>
          {alert.message && (
            <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border pointer-events-auto ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
              {alert.type === 'error'
                ? <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                : <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
              <p className="text-sm font-semibold">{alert.message}</p>
              <button onClick={() => setAlert({ message: '', type: '' })} className="ml-auto opacity-50 hover:opacity-100">
                <FiX size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── FORMULAIRE MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {isFormOpen && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={resetForm}>
            <motion.div initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header modal */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white flex-shrink-0 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <img src="/images/logo.png" alt="AIFASA 17" className="h-8 w-8 object-contain"
                    onError={e => e.target.style.display = 'none'} />
                  <span className="font-black text-emerald-900 text-base">
                    {editingMemberId ? 'Modifier le membre' : 'Nouveau membre'}
                  </span>
                </div>
                <button onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              {/* Steps navigation */}
              <div className="px-6 pt-4 flex gap-2 flex-shrink-0">
                {FORM_SECTIONS.map((s, i) => (
                  <button key={i} onClick={() => setFormSection(i)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      formSection === i
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {i + 1}. {s}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5">

                {/* Section 0 — Identité */}
                {formSection === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>Prénom *</label>
                        <input type="text" value={formData.first_name}
                          onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                          className={INPUT} required />
                      </div>
                      <div>
                        <label className={LABEL}>Nom *</label>
                        <input type="text" value={formData.last_name}
                          onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                          className={INPUT} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>Sexe</label>
                        <select value={formData.sex}
                          onChange={e => setFormData({ ...formData, sex: e.target.value })}
                          className={INPUT}>
                          <option value="">—</option>
                          <option>Homme</option>
                          <option>Femme</option>
                        </select>
                      </div>
                      <div>
                        <label className={LABEL}>Rôle</label>
                        <select value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                          className={INPUT}>
                          <option value="member">Membre</option>
                          <option value="Bureau Exécutif">Bureau Exécutif</option>
                          <option value="treasurer">Trésorier</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}>Téléphone</label>
                        <input type="text" value={formData.phone_number}
                          onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                          className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}>Contact (WhatsApp…)</label>
                        <input type="text" value={formData.contact}
                          onChange={e => setFormData({ ...formData, contact: e.target.value })}
                          className={INPUT} />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Localisation</label>
                      <input type="text" value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Yaoundé, Douala…"
                        className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Adresse complète</label>
                      <input type="text" value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className={INPUT} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <label className={LABEL}>
                        Compte de connexion lié (email) — espace "Mon Profil"
                      </label>
                      <input type="email" value={formData.user_email}
                        onChange={e => setFormData({ ...formData, user_email: e.target.value })}
                        placeholder="laisser vide pour ne pas modifier le lien existant"
                        className={INPUT} />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Doit correspondre à un compte déjà créé dans "Utilisateurs". Pré-rempli
                        automatiquement si un lien existe déjà. Laisser vide = ne pas modifier le lien.
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 1 — Professionnel */}
                {formSection === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className={LABEL}>Profession / Titre</label>
                      <input type="text" value={formData.profession}
                        onChange={e => setFormData({ ...formData, profession: e.target.value })}
                        placeholder="Ingénieur Agronome, Forestier…"
                        className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Structure d'emploi</label>
                      <input type="text" value={formData.employment_structure}
                        onChange={e => setFormData({ ...formData, employment_structure: e.target.value })}
                        placeholder="Ministère, ONG, Privé…"
                        className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Entreprise / Projet</label>
                      <input type="text" value={formData.company_or_project}
                        onChange={e => setFormData({ ...formData, company_or_project: e.target.value })}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Activités principales</label>
                      <textarea value={formData.activities} rows={3}
                        onChange={e => setFormData({ ...formData, activities: e.target.value })}
                        placeholder="Description des activités professionnelles…"
                        className={`${INPUT} resize-none`} />
                    </div>
                  </div>
                )}

                {/* Section 2 — Fichiers */}
                {formSection === 2 && (
                  <div className="space-y-5">
                    {/* Photo */}
                    <div>
                      <label className={LABEL}>Photo de profil</label>
                      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-8 cursor-pointer transition-colors bg-gray-50 hover:bg-emerald-50/30">
                        {formData.profilePictureFileName ? (
                          <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                            <FiCheckCircle size={18} /> {formData.profilePictureFileName}
                          </div>
                        ) : (
                          <>
                            <FiUpload className="w-8 h-8 text-gray-300" />
                            <span className="text-sm text-gray-500">Cliquer pour choisir une photo</span>
                            <span className="text-xs text-gray-400">JPEG, PNG — max 5 Mo</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => handleFileChange(e, 'photo')} />
                      </label>
                    </div>

                    {/* CV */}
                    <div>
                      <label className={LABEL}>CV (PDF)</label>
                      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-8 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50/30">
                        {formData.cvFileName ? (
                          <div className="flex items-center gap-2 text-sm text-blue-700 font-semibold">
                            <FiCheckCircle size={18} /> {formData.cvFileName}
                          </div>
                        ) : (
                          <>
                            <FiFileText className="w-8 h-8 text-gray-300" />
                            <span className="text-sm text-gray-500">Cliquer pour joindre un CV</span>
                            <span className="text-xs text-gray-400">PDF — max 10 Mo</span>
                          </>
                        )}
                        <input type="file" accept=".pdf" className="hidden"
                          onChange={e => handleFileChange(e, 'cv')} />
                      </label>
                    </div>
                  </div>
                )}
              </form>

              {/* Footer modal */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
                <div className="flex gap-2">
                  {formSection > 0 && (
                    <button type="button" onClick={() => setFormSection(s => s - 1)}
                      className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 font-semibold transition-colors">
                      ← Précédent
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={resetForm}
                    className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl font-semibold transition-colors">
                    Annuler
                  </button>
                  {formSection < 2 ? (
                    <button type="button" onClick={() => setFormSection(s => s + 1)}
                      className="px-5 py-2 text-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-sm transition-colors">
                      Suivant →
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                      className="px-5 py-2 text-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-sm disabled:opacity-40 flex items-center gap-2 transition-colors">
                      {isSubmitting ? (
                        <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Enregistrement…</>
                      ) : editingMemberId ? '✓ Mettre à jour' : '✓ Ajouter le membre'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CONFIRM DELETE ───────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmModal
            message="Cette action est irréversible. Toutes les données liées à ce membre seront supprimées définitivement."
            onConfirm={handleDelete}
            onCancel={() => { setShowDeleteModal(false); setMemberToDelete(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Members;