// src/pages/private/Projects.jsx — v4 Production complète avec corrections
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getProjects, createProject, updateProject, deleteProject
} from '../../services/projectService';
import { getMembers } from '../../services/memberService';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

// ─── Constantes & helpers ─────────────────────────────────────────
const fmt  = n  => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
const pct  = n  => `${(n || 0).toFixed(1)}%`;
const INP  = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors bg-white';
const LBL  = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5';
const PROJECT_TYPES = ['Investissement Associatif', 'Investissement Partenarial'];
const STATUS_OPTIONS = ['actif', 'en_cours', 'suspendu', 'terminé'];

// ─── Composants utilitaires ───────────────────────────────────────
const Badge = ({ children, color = 'gray', size = 'sm' }) => {
  const c = {
    gray: 'bg-gray-100 text-gray-700', green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-800', purple: 'bg-purple-100 text-purple-700',
    brown: 'bg-amber-50 text-amber-900 border border-amber-200',
  };
  const s = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-0.5';
  return <span className={`font-bold rounded-full ${s} ${c[color] || c.gray}`}>{children}</span>;
};

const Toast = ({ msg, type, onClose }) => {
  const s = { success: 'bg-green-50 border-green-300 text-green-800', error: 'bg-red-50 border-red-300 text-red-700' };
  return (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm mb-4 font-medium ${s[type] || s.success}`}>
          <span>{msg}</span>
          <button onClick={onClose} className="ml-3 opacity-50 hover:opacity-100 text-base leading-none">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Accordion = ({ title, icon, children, defaultOpen = false, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          {icon && <span>{icon}</span>}{title}
          {badge && <Badge color="green" size="xs">{badge}</Badge>}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Slideshow photos de suivi ────────────────────────────────────
const PhotoSlideshow = ({ photos }) => {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  if (!photos?.length) return (
    <div className="flex items-center justify-center h-36 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <p className="text-xs text-gray-400">📷 Aucune photo</p>
    </div>
  );
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);
  return (
    <>
      <div className="relative rounded-xl overflow-hidden group h-44">
        <AnimatePresence mode="wait">
          <motion.img key={idx} src={photos[idx]} alt="Suivi"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightbox(true)}
            onError={e => { e.target.src = '/images/default_image.png'; }}
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all ${i === idx ? 'bg-white w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5'}`} />)}
            </div>
          </>
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {idx + 1}/{photos.length}
        </div>
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}>
            <motion.img initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              src={photos[idx]} alt="" className="max-w-4xl w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
            {photos.length > 1 && <>
              <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full text-xl">‹</button>
              <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full text-xl">›</button>
            </>}
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Barre de progression ROI ─────────────────────────────────────
const RoiBar = ({ value, max }) => {
  const pctVal = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pctVal >= 80 ? 'bg-green-500' : pctVal >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pctVal}%` }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
const Projects = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const TABS = [
    { id: 'projets',  label: 'Projets',              emoji: '📁' },
    { id: 'apercu',   label: 'Aperçu & Stats',        emoji: '📊' },
    { id: 'invest',   label: 'Investissements & ROI', emoji: '💹' },
    { id: 'suivis',   label: 'Suivis Trimestriels',   emoji: '📋' },
  ];

  const [tab, setTab] = useState('projets');
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, m] = await Promise.all([getProjects(), getMembers()]);
        setProjects(p || []);
        setMembers(m || []);
      } catch (err) {
        console.error('Erreur chargement:', err);
        notify('Erreur de chargement des données', 'error');
      }
      finally { setLoading(false); }
    };
    load();
  }, [notify]);

  const getMemberName = useCallback(id => {
    const m = members.find(x => x.id === parseInt(id));
    return m ? `${m.first_name || ''} ${m.last_name || ''}`.trim() : '—';
  }, [members]);

  const globalStats = useMemo(() => projects.reduce((a, p) => {
    a.budget  += parseFloat(p.budget || 0);
    a.prodKg  += (p.expected_production || []).reduce((s, ep) => s + parseFloat(ep.quantityKgPerYear || 0), 0);
    a.ca      += (p.financial_results || []).reduce((s, fr) => s + parseFloat(fr.turnover || 0), 0);
    a.suivis  += (p.follow_ups || []).length;
    return a;
  }, { budget: 0, prodKg: 0, ca: 0, suivis: 0 }), [projects]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── EN-TÊTE ─── */}
      <header className="bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/images/logo.png" alt="AIFASA 17"
                className="h-12 w-12 rounded-full object-contain bg-white/10 p-1 border border-white/20 shadow-lg"
                onError={e => e.target.style.display = 'none'} />
              <div>
                <p className="text-green-300 text-xs font-bold uppercase tracking-widest">AIFASA 17</p>
                <h1 className="text-3xl font-black tracking-tight">Projets AGR</h1>
                <p className="text-green-200/70 text-sm mt-0.5">Agriculture Rurale · Investissements · Suivi · ROI</p>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => setTab('projets')}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nouveau projet
              </button>
            )}
          </div>

          {/* KPIs en-tête */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Projets', val: projects.length, emoji: '📁' },
              { label: 'Budget total', val: fmt(globalStats.budget) + ' FCFA', emoji: '💰' },
              { label: 'Production prévisionnelle', val: fmt(globalStats.prodKg) + ' kg/an', emoji: '🌾' },
              { label: 'CA cumulé', val: fmt(globalStats.ca) + ' FCFA', emoji: '📈' },
            ].map((k, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
                <p className="text-xs text-green-200/70 font-medium">{k.emoji} {k.label}</p>
                <p className="font-black text-base mt-0.5">{k.val}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── ONGLETS ─── */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                tab === t.id ? 'border-green-600 text-green-800 bg-green-50/40' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENU ─── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {tab === 'projets' && <TabProjets projects={projects} setProjects={setProjects} members={members} isAdmin={isAdmin} notify={notify} setTab={setTab} />}
              {tab === 'apercu'  && <TabApercu  projects={projects} globalStats={globalStats} />}
              {tab === 'invest'  && <TabInvest  projects={projects} setProjects={setProjects} members={members} getMemberName={getMemberName} isAdmin={isAdmin} notify={notify} />}
              {tab === 'suivis'  && <TabSuivis  projects={projects} setProjects={setProjects} members={members} getMemberName={getMemberName} isAdmin={isAdmin} notify={notify} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 1 — PROJETS (CRUD)
// ═══════════════════════════════════════════════════════════════════
const FORM0 = { name: '', projectType: '', description: '', budget: '', startDate: '', status: 'actif' };

const TabProjets = ({ projects, setProjects, members, isAdmin, notify, setTab }) => {
  const [showForm, setShowForm]   = useState(false);
  const [editId,   setEditId]     = useState(null);
  const [form,     setForm]       = useState(FORM0);
  const [prods,    setProds]      = useState([{ product: '', quantityKgPerYear: '' }]);
  const [invest,   setInvest]     = useState({ numberOfShares: '', costPerShare: '', memberShares: [{ memberId: '', shares: '' }] });
  const [results,  setResults]    = useState([{ year: '', turnover: '', revenuePerMember: '' }]);
  const [respons,  setRespons]    = useState([{ memberId: '' }]);
  const [search,   setSearch]     = useState('');
  const [filter,   setFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const reset = () => {
    setForm(FORM0); setProds([{ product: '', quantityKgPerYear: '' }]);
    setInvest({ numberOfShares: '', costPerShare: '', memberShares: [{ memberId: '', shares: '' }] });
    setResults([{ year: '', turnover: '', revenuePerMember: '' }]);
    setRespons([{ memberId: '' }]); setEditId(null); setShowForm(false);
  };

  const openEdit = p => {
    setEditId(p.id);
    setForm({ name: p.name || '', projectType: p.project_type || '', description: p.description || '', budget: p.budget || '', startDate: p.start_date || '', status: p.status || 'actif' });
    setProds(p.expected_production?.length ? p.expected_production : [{ product: '', quantityKgPerYear: '' }]);
    setInvest(p.investment_details || { numberOfShares: '', costPerShare: '', memberShares: [{ memberId: '', shares: '' }] });
    setResults(p.financial_results?.length ? p.financial_results : [{ year: '', turnover: '', revenuePerMember: '' }]);
    setRespons(p.project_responsibles?.length ? p.project_responsibles : [{ memberId: '' }]);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.projectType || !form.description.trim() || !form.budget) {
      notify('Champs obligatoires manquants (nom, type, description, budget)', 'error'); return;
    }
    setSubmitting(true);
    const payload = {
      ...form, budget: parseFloat(form.budget),
      expectedProduction:  JSON.stringify(prods.filter(p => p.product.trim())),
      investmentDetails:   JSON.stringify({
        numberOfShares: parseFloat(invest.numberOfShares) || 0,
        costPerShare:   parseFloat(invest.costPerShare) || 0,
        memberShares:   invest.memberShares.filter(ms => ms.memberId && ms.shares),
      }),
      financialResults:    JSON.stringify(results.filter(r => r.year && r.turnover)),
      projectResponsibles: JSON.stringify(respons.filter(r => r.memberId)),
      followUps:           JSON.stringify(editId ? (projects.find(p => p.id === editId)?.follow_ups || []) : []),
    };
    try {
      const res = editId ? await updateProject(editId, payload) : await createProject(payload);
      setProjects(prev => editId ? prev.map(p => p.id === res.id ? res : p) : [res, ...prev]);
      notify(editId ? 'Projet mis à jour ✓' : 'Projet créé ✓');
      reset();
    } catch (err) {
      console.error('Erreur:', err);
      notify('Erreur lors de l\'opération', 'error');
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce projet définitivement ?')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      notify('Projet supprimé');
    } catch (err) {
      console.error('Erreur:', err);
      notify('Erreur lors de la suppression', 'error');
    }
  };

  const visible = useMemo(() => projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    const matchType = filter === 'all' || (p.project_type || '').toLowerCase() === filter.toLowerCase();
    const matchStatus = statusFilter === 'all' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchType && matchStatus;
  }), [projects, search, filter, statusFilter]);

  // Helpers champs dynamiques
  const updProd  = (i, k, v) => { const l=[...prods]; l[i][k]=v; setProds(l); };
  const updInvMs = (i, k, v) => { const l=[...invest.memberShares]; l[i][k]=v; setInvest(iv=>({...iv,memberShares:l})); };
  const updRes   = (i, k, v) => { const l=[...results]; l[i][k]=v; setResults(l); };

  // Calcul récapitulatif parts en temps réel
  const totalPartsForm = invest.memberShares.reduce((a, ms) => a + (parseFloat(ms.shares) || 0), 0);
  const totalInvestForm = totalPartsForm * (parseFloat(invest.costPerShare) || 0);

  return (
    <div className="space-y-6">
      {/* BARRE D'ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet…"
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full text-sm outline-none focus:ring-1 focus:ring-green-400 bg-white" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none text-gray-600">
          <option value="all">Tous types</option>
          {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none text-gray-600">
          <option value="all">Tous statuts</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        {isAdmin && (
          <button onClick={() => { reset(); setShowForm(v => !v); }}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} /></svg>
            {showForm ? 'Fermer' : 'Nouveau projet'}
          </button>
        )}
      </div>

      {/* FORMULAIRE AJOUT / ÉDITION */}
      <AnimatePresence>
        {showForm && isAdmin && (
          <motion.div ref={formRef} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-2xl border border-green-100 shadow-md">
              {/* Header formulaire */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center text-white text-sm font-black">
                    {editId ? '✎' : '+'}
                  </div>
                  <h2 className="font-black text-green-900 text-lg">{editId ? 'Modifier le projet' : 'Nouveau projet AGR'}</h2>
                </div>
                <button onClick={reset} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* ── Infos de base ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={LBL}>Nom du projet *</label>
                    <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className={INP} placeholder="Ex : Ferme piscicole AfricaNut…" required />
                  </div>
                  <div>
                    <label className={LBL}>Type *</label>
                    <select value={form.projectType} onChange={e => setForm(f=>({...f,projectType:e.target.value}))} className={INP} required>
                      <option value="">— Sélectionner —</option>
                      {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LBL}>Statut</label>
                    <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} className={INP}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LBL}>Budget (FCFA) *</label>
                    <input type="number" value={form.budget} onChange={e => setForm(f=>({...f,budget:e.target.value}))} className={INP} placeholder="0" required />
                  </div>
                  <div>
                    <label className={LBL}>Date de démarrage</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} className={INP} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={LBL}>Description *</label>
                    <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} className={`${INP} resize-none`} placeholder="Objectifs, localisation, contexte…" required />
                  </div>
                </div>

                {/* ── Production escomptée ── */}
                <Accordion title="Production Annuelle Escomptée" icon="🌾" defaultOpen badge={prods.filter(p=>p.product).length || null}>
                  <div className="space-y-3">
                    {prods.map((p, i) => (
                      <div key={i} className="grid grid-cols-3 gap-3 items-end">
                        <div className="col-span-2 grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Produit</label>
                            <input value={p.product} onChange={e => updProd(i,'product',e.target.value)} className={INP} placeholder="Poisson, maïs…" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Quantité (kg/an)</label>
                            <input type="number" value={p.quantityKgPerYear} onChange={e => updProd(i,'quantityKgPerYear',e.target.value)} className={INP} placeholder="0" />
                          </div>
                        </div>
                        <button type="button" disabled={prods.length <= 1}
                          onClick={() => setProds(l => l.filter((_,j) => j!==i))}
                          className="py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-30 transition-colors">Retirer</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setProds(l => [...l, { product: '', quantityKgPerYear: '' }])}
                      className="text-xs text-green-700 font-bold hover:text-green-800">+ Ajouter un produit</button>
                    {prods.some(p=>p.quantityKgPerYear) && (
                      <p className="text-xs text-gray-500 font-medium">
                        Total : <strong className="text-green-700">{fmt(prods.reduce((a,p)=>a+parseFloat(p.quantityKgPerYear||0),0))} kg/an</strong>
                      </p>
                    )}
                  </div>
                </Accordion>

                {/* ── Détails investissement / Parts ── */}
                <Accordion title="Investissement & Parts des Membres" icon="💹" badge={invest.memberShares.filter(ms=>ms.memberId&&ms.shares).length || null}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LBL}>Nombre total de parts</label>
                        <input type="number" value={invest.numberOfShares} onChange={e => setInvest(iv=>({...iv,numberOfShares:e.target.value}))} className={INP} placeholder="Ex : 30" />
                      </div>
                      <div>
                        <label className={LBL}>Coût par part (FCFA)</label>
                        <input type="number" value={invest.costPerShare} onChange={e => setInvest(iv=>({...iv,costPerShare:e.target.value}))} className={INP} placeholder="Ex : 25 000" />
                      </div>
                    </div>

                    {/* Récapitulatif investissement */}
                    {(invest.numberOfShares || invest.costPerShare) && (
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex flex-wrap gap-6 text-sm">
                        <div><span className="text-green-600 font-semibold">Capital total : </span><strong className="text-green-900">{fmt((invest.numberOfShares||0)*(invest.costPerShare||0))} FCFA</strong></div>
                        <div><span className="text-green-600 font-semibold">Parts allouées : </span><strong className="text-green-900">{totalPartsForm} / {invest.numberOfShares||0}</strong></div>
                        <div><span className="text-green-600 font-semibold">Capital investi : </span><strong className="text-green-900">{fmt(totalInvestForm)} FCFA</strong></div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Attribution des parts par membre</h4>
                      {invest.memberShares.map((ms, i) => (
                        <div key={i} className="grid grid-cols-3 gap-3 items-end mb-3">
                          <div className="col-span-2 grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Membre</label>
                              <select value={ms.memberId} onChange={e => updInvMs(i,'memberId',e.target.value)} className={INP}>
                                <option value="">— Sélectionner —</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">
                                Nb parts
                                {ms.shares && invest.costPerShare && <span className="ml-1 text-green-600">= {fmt(ms.shares * invest.costPerShare)} FCFA</span>}
                              </label>
                              <input type="number" value={ms.shares} onChange={e => updInvMs(i,'shares',e.target.value)} className={INP} placeholder="0" />
                            </div>
                          </div>
                          <button type="button" disabled={invest.memberShares.length <= 1}
                            onClick={() => setInvest(iv=>({...iv,memberShares:iv.memberShares.filter((_,j)=>j!==i)}))}
                            className="py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-30 transition-colors">Retirer</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setInvest(iv=>({...iv,memberShares:[...iv.memberShares,{memberId:'',shares:''}]}))}
                        className="text-xs text-green-700 font-bold hover:text-green-800">+ Ajouter un investisseur</button>
                    </div>
                  </div>
                </Accordion>

                {/* ── Responsables ── */}
                <Accordion title="Responsables du Projet" icon="👤" badge={respons.filter(r=>r.memberId).length || null}>
                  <div className="space-y-3">
                    {respons.map((r, i) => (
                      <div key={i} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <select value={r.memberId} onChange={e => { const l=[...respons]; l[i].memberId=e.target.value; setRespons(l); }} className={INP}>
                            <option value="">— Sélectionner —</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                          </select>
                        </div>
                        <button type="button" disabled={respons.length <= 1}
                          onClick={() => setRespons(l => l.filter((_,j)=>j!==i))}
                          className="py-2.5 px-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-30 transition-colors">Retirer</button>
                      </div>
                    ))}
                    {respons.length < 3 && (
                      <button type="button" onClick={() => setRespons(l => [...l, { memberId: '' }])} className="text-xs text-green-700 font-bold hover:text-green-800">+ Ajouter un responsable</button>
                    )}
                  </div>
                </Accordion>

                {/* ── Résultats financiers prévisionnels ── */}
                <Accordion title="Résultats Financiers Prévisionnels" icon="📊" badge={results.filter(r=>r.year&&r.turnover).length || null}>
                  <div className="space-y-3">
                    {results.map((r, i) => (
                      <div key={i} className="grid grid-cols-4 gap-3 items-end">
                        {[['year','Année','number','2024'],['turnover','CA (FCFA)','number','0'],['revenuePerMember','Revenu/Membre','number','0']].map(([k,l,t,ph]) => (
                          <div key={k}>
                            <label className="text-xs text-gray-400 mb-1 block">{l}</label>
                            <input type={t} value={r[k]} onChange={e => updRes(i,k,e.target.value)} className={INP} placeholder={ph} />
                          </div>
                        ))}
                        <button type="button" disabled={results.length <= 1}
                          onClick={() => setResults(l => l.filter((_,j)=>j!==i))}
                          className="py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-30 transition-colors">Retirer</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setResults(l => [...l, { year: '', turnover: '', revenuePerMember: '' }])} className="text-xs text-green-700 font-bold hover:text-green-800">+ Ajouter une année</button>
                  </div>
                </Accordion>

                {/* ── Boutons ── */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={reset} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-semibold transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-black text-sm shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors">
                    {submitting ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Enregistrement…</> : editId ? '✓ Mettre à jour' : '✓ Créer le projet'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRILLE PROJETS */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">🌾</p>
          <h3 className="font-bold text-gray-600 text-lg">Aucun projet trouvé</h3>
          <p className="text-sm mt-1">{search || filter !== 'all' || statusFilter !== 'all' ? 'Modifiez vos critères.' : isAdmin ? 'Créez votre premier projet AGR.' : 'Aucun projet disponible.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visible.map((p, i) => (
            <ProjectCard key={p.id} project={p} isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} onSuivi={() => setTab('suivis')} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Carte projet ─────────────────────────────────────────────────
const STATUS_STYLE = {
  actif:     'bg-green-100 text-green-800',
  en_cours:  'bg-blue-100 text-blue-700',
  suspendu:  'bg-amber-100 text-amber-700',
  terminé:   'bg-gray-100 text-gray-600',
};

const ProjectCard = ({ project: p, isAdmin, onEdit, onDelete, onSuivi, index }) => {
  const totalKg = (p.expected_production || []).reduce((a, ep) => a + parseFloat(ep.quantityKgPerYear || 0), 0);
  const totalCA  = (p.financial_results || []).reduce((a, fr) => a + parseFloat(fr.turnover || 0), 0);
  const totalParts = (p.investment_details?.memberShares || []).reduce((a, ms) => a + parseFloat(ms.shares || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col">

      {/* Bandeau type */}
      <div className={`px-4 py-2 flex items-center justify-between ${p.project_type === 'Investissement Associatif' ? 'bg-green-700' : 'bg-amber-600'}`}>
        <span className="text-white text-xs font-bold">{p.project_type || 'Type non défini'}</span>
        {p.status && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] || STATUS_STYLE.actif}`}>{p.status}</span>}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-black text-gray-900 text-base leading-tight mb-2 line-clamp-2">{p.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{p.description}</p>

        {/* KPIs projet */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Budget',       val: fmt(p.budget), unit: 'FCFA', color: 'bg-amber-50 text-amber-800' },
            { label: 'Production',   val: fmt(totalKg),  unit: 'kg/an', color: 'bg-green-50 text-green-800' },
            { label: 'CA cumulé',    val: fmt(totalCA),  unit: 'FCFA', color: 'bg-blue-50 text-blue-800' },
          ].map((k, i) => (
            <div key={i} className={`${k.color} rounded-xl p-2 text-center`}>
              <p className="text-[9px] font-bold uppercase opacity-60">{k.label}</p>
              <p className="font-black text-sm leading-tight">{k.val}</p>
              <p className="text-[9px] opacity-50">{k.unit}</p>
            </div>
          ))}
        </div>

        {/* Investisseurs mini */}
        {totalParts > 0 && (
          <div className="bg-purple-50 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
            <span className="text-xs text-purple-700 font-bold">💹 Investisseurs</span>
            <span className="text-xs font-black text-purple-900">
              {(p.investment_details?.memberShares||[]).filter(ms=>ms.memberId).length} membres · {fmt(totalParts * (p.investment_details?.costPerShare||0))} FCFA
            </span>
          </div>
        )}

        {/* Suivis */}
        {(p.follow_ups?.length > 0) && (
          <div className="bg-indigo-50 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
            <span className="text-xs text-indigo-700 font-bold">📋 Suivis enregistrés</span>
            <span className="text-xs font-black text-indigo-900">{p.follow_ups.length} trimestre{p.follow_ups.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button onClick={() => onSuivi(p)} className="flex-1 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors">📋 Suivi</button>
            <button onClick={() => onEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Modifier">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => onDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 2 — APERÇU & STATS
// ═══════════════════════════════════════════════════════════════════
const TabApercu = ({ projects, globalStats }) => {
  const typeCounts = projects.reduce((a, p) => { a[p.project_type||'Non défini']=(a[p.project_type||'Non défini']||0)+1; return a; }, {});
  const yearCA = projects.reduce((a, p) => {
    (p.financial_results||[]).forEach(fr => { if (fr.year&&fr.turnover) a[fr.year]=(a[fr.year]||0)+parseFloat(fr.turnover); });
    return a;
  }, {});
  const sortedYears = Object.keys(yearCA).sort();

  const prodByProj = projects.map(p => ({
    name: p.name,
    kg: (p.expected_production||[]).reduce((a,ep)=>a+parseFloat(ep.quantityKgPerYear||0),0),
  })).filter(x => x.kg > 0);

  const pieData = {
    labels: Object.keys(typeCounts),
    datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#15803d','#d97706','#7c3aed','#0891b2'], borderWidth: 2, borderColor: '#fff', hoverOffset: 8 }]
  };
  const lineData = {
    labels: sortedYears,
    datasets: [{ label: "CA Annuel (FCFA)", data: sortedYears.map(y => yearCA[y]), borderColor: '#15803d', backgroundColor: '#15803d15', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#15803d' }]
  };
  const barData = {
    labels: prodByProj.map(x => x.name.length > 16 ? x.name.slice(0,16)+'…' : x.name),
    datasets: [{ label: 'kg/an', data: prodByProj.map(x => x.kg), backgroundColor: '#059669', borderRadius: 6 }]
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { emoji: '📁', label: 'Projets actifs',  val: projects.length,            color: 'from-green-50 to-green-100 text-green-900' },
          { emoji: '💰', label: 'Budget total',     val: fmt(globalStats.budget)+' FCFA', color: 'from-amber-50 to-amber-100 text-amber-900' },
          { emoji: '🌾', label: 'Production/an',   val: fmt(globalStats.prodKg)+' kg',   color: 'from-emerald-50 to-emerald-100 text-emerald-900' },
          { emoji: '📈', label: 'CA total réalisé', val: fmt(globalStats.ca)+' FCFA',    color: 'from-blue-50 to-blue-100 text-blue-900' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.07 }}
            className={`bg-gradient-to-br ${k.color} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{k.emoji}</div>
            <p className="text-xs font-bold uppercase opacity-60 tracking-wide">{k.label}</p>
            <p className="text-xl font-black mt-1">{k.val}</p>
          </motion.div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Répartition par type</h3>
          <div className="h-56"><Pie data={pieData} options={{ cutout: '58%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14 } } } }} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Chiffre d'affaires annuel</h3>
          <div className="h-56">
            {sortedYears.length > 0
              ? <Line data={lineData} options={{ plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => fmt(v) } }, x: { grid: { display: false } } } }} />
              : <p className="text-gray-400 text-sm text-center pt-16">Aucune donnée financière enregistrée</p>}
          </div>
        </div>
        {prodByProj.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
            <h3 className="font-bold text-gray-800 mb-4">Production prévisionnelle par projet (kg/an)</h3>
            <div className="h-48"><Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }} /></div>
          </div>
        )}
      </div>

      {/* Tableau récapitulatif */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-x-auto">
        <h3 className="font-bold text-gray-800 mb-4">Récapitulatif complet</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Projet','Type','Statut','Budget','Prod/an','CA total','Investisseurs','Suivis'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-bold">{h}</th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 font-semibold text-gray-900 max-w-[140px] truncate">{p.name}</td>
                <td className="px-3 py-2.5"><Badge color={p.project_type==='Investissement Associatif'?'green':'amber'} size="xs">{(p.project_type||'').split(' ').slice(1).join(' ')}</Badge></td>
                <td className="px-3 py-2.5"><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]||STATUS_STYLE.actif}`}>{p.status||'actif'}</span></td>
                <td className="px-3 py-2.5 text-amber-700 font-semibold">{fmt(p.budget)}</td>
                <td className="px-3 py-2.5 text-green-700">{fmt((p.expected_production||[]).reduce((a,ep)=>a+parseFloat(ep.quantityKgPerYear||0),0))} kg</td>
                <td className="px-3 py-2.5 font-bold">{fmt((p.financial_results||[]).reduce((a,fr)=>a+parseFloat(fr.turnover||0),0))}</td>
                <td className="px-3 py-2.5 text-center"><Badge color="purple" size="xs">{(p.investment_details?.memberShares||[]).filter(ms=>ms.memberId).length}</Badge></td>
                <td className="px-3 py-2.5 text-center"><Badge color="blue" size="xs">{p.follow_ups?.length||0}</Badge></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-green-50 border-t border-green-100 font-bold text-sm">
            <tr>
              <td className="px-3 py-2.5 text-gray-700" colSpan={3}>TOTAUX</td>
              <td className="px-3 py-2.5 text-amber-700">{fmt(globalStats.budget)} FCFA</td>
              <td className="px-3 py-2.5 text-green-700">{fmt(globalStats.prodKg)} kg</td>
              <td className="px-3 py-2.5 font-black">{fmt(globalStats.ca)} FCFA</td>
              <td className="px-3 py-2.5 text-center">{projects.reduce((a,p)=>a+(p.investment_details?.memberShares||[]).filter(ms=>ms.memberId).length,0)}</td>
              <td className="px-3 py-2.5 text-center">{globalStats.suivis}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 3 — INVESTISSEMENTS & ROI
// ═══════════════════════════════════════════════════════════════════
const TabInvest = ({ projects, setProjects, members, getMemberName, isAdmin, notify }) => {
  const [selectedId, setSelectedId]     = useState('');
  const [selectedMem, setSelectedMem]   = useState('');
  const [viewMode, setViewMode]         = useState('projet');
  const [distribForm, setDistribForm]   = useState({ quarter: '', year: new Date().getFullYear(), grossRevenue: '', costDeduction: 0 });

  const proj = projects.find(p => p.id === parseInt(selectedId));
  const inv  = proj?.investment_details || {};
  const memberShares = (inv.memberShares || []).filter(ms => ms.memberId && ms.shares);
  const totalShares  = memberShares.reduce((a, ms) => a + parseFloat(ms.shares || 0), 0);
  const totalInvested = totalShares * parseFloat(inv.costPerShare || 0);

  const dividendsFromFollowUps = useMemo(() => {
    if (!proj?.follow_ups?.length || !totalShares) return [];
    return proj.follow_ups.map((fu, i) => {
      if (!fu.turnover || !fu.dividends) return null;
      const net = parseFloat(fu.dividends?.netRevenue || fu.turnover);
      return memberShares.map(ms => ({
        period: `T${fu.quarter} ${fu.year}`,
        memberId: ms.memberId,
        shares: parseFloat(ms.shares),
        pct: totalShares > 0 ? (ms.shares / totalShares * 100).toFixed(1) : 0,
        amount: totalShares > 0 ? Math.round((ms.shares / totalShares) * net) : 0,
      }));
    }).flat().filter(Boolean);
  }, [proj, memberShares, totalShares]);

  const simDistrib = useMemo(() => {
    if (!distribForm.grossRevenue || !totalShares) return [];
    const net = parseFloat(distribForm.grossRevenue) - parseFloat(distribForm.costDeduction || 0);
    return memberShares.map(ms => ({
      memberId: ms.memberId,
      name: getMemberName(ms.memberId),
      shares: parseFloat(ms.shares),
      pct: totalShares > 0 ? (ms.shares / totalShares * 100) : 0,
      dividend: totalShares > 0 ? Math.round((ms.shares / totalShares) * net) : 0,
      totalInvested: parseFloat(ms.shares) * parseFloat(inv.costPerShare || 0),
    })).sort((a,b) => b.dividend - a.dividend);
  }, [distribForm, memberShares, totalShares, inv, getMemberName]);

  const handleDistrib = async () => {
    if (!proj || !distribForm.quarter || !distribForm.grossRevenue) {
      notify('Remplissez trimestre et revenu brut', 'error'); return;
    }
    const net = parseFloat(distribForm.grossRevenue) - parseFloat(distribForm.costDeduction || 0);
    const updatedFollowUps = [...(proj.follow_ups || [])];
    const existingIdx = updatedFollowUps.findIndex(fu => fu.quarter === parseInt(distribForm.quarter) && fu.year === parseInt(distribForm.year));
    const divEntry = { netRevenue: net, shares: distribForm };
    if (existingIdx >= 0) {
      updatedFollowUps[existingIdx] = { ...updatedFollowUps[existingIdx], dividends: divEntry };
    } else {
      updatedFollowUps.push({ quarter: parseInt(distribForm.quarter), year: parseInt(distribForm.year), turnover: parseFloat(distribForm.grossRevenue), dividends: divEntry, quantityProduced: [], responsible: '' });
    }
    const payload = {
      name: proj.name, projectType: proj.project_type, description: proj.description, budget: proj.budget,
      expectedProduction:  JSON.stringify(proj.expected_production||[]),
      investmentDetails:   JSON.stringify(proj.investment_details||{}),
      financialResults:    JSON.stringify(proj.financial_results||[]),
      projectResponsibles: JSON.stringify(proj.project_responsibles||[]),
      followUps:           JSON.stringify(updatedFollowUps),
    };
    try {
      const res = await updateProject(proj.id, payload);
      setProjects(prev => prev.map(p => p.id === res.id ? res : p));
      notify('Distribution enregistrée ✓');
    } catch (err) {
      console.error('Erreur:', err);
      notify('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const portfolioData = useMemo(() => {
    if (!selectedMem) return [];
    return projects.map(p => {
      const inv = p.investment_details || {};
      const ms  = (inv.memberShares || []).find(x => x.memberId === selectedMem);
      if (!ms) return null;
      const totalP = (inv.memberShares || []).filter(x => x.memberId&&x.shares).reduce((a,x)=>a+parseFloat(x.shares||0),0);
      const invested = parseFloat(ms.shares||0) * parseFloat(inv.costPerShare||0);
      const received = (p.follow_ups||[]).reduce((a, fu) => {
        if (!fu.dividends?.netRevenue || !totalP) return a;
        return a + Math.round((ms.shares / totalP) * fu.dividends.netRevenue);
      }, 0);
      const roi = invested > 0 ? ((received - invested) / invested * 100) : 0;
      return { projectId: p.id, name: p.name, type: p.project_type, shares: parseFloat(ms.shares), costPerShare: parseFloat(inv.costPerShare||0), invested, received, roi };
    }).filter(Boolean);
  }, [projects, selectedMem]);

  const portTotalInv = portfolioData.reduce((a,x)=>a+x.invested,0);
  const portTotalRec = portfolioData.reduce((a,x)=>a+x.received,0);
  const portROI      = portTotalInv > 0 ? ((portTotalRec-portTotalInv)/portTotalInv*100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {[['projet','💹 Par projet'],['portfolio','👤 Portfolio membre']].map(([id,label]) => (
          <button key={id} onClick={() => setViewMode(id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode===id?'bg-white text-green-800 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {viewMode === 'projet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="text-sm font-bold text-gray-700 mb-2 block">Sélectionner un projet AGR</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className={INP + ' max-w-lg'}>
              <option value="">— Choisir un projet —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.project_type})</option>)}
            </select>
          </div>

          {proj && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Investisseurs', val: memberShares.length, color: 'bg-purple-50 text-purple-900' },
                  { label: 'Parts allouées', val: `${fmt(totalShares)} / ${fmt(inv.numberOfShares||0)}`, color: 'bg-blue-50 text-blue-900' },
                  { label: 'Capital investi', val: fmt(totalInvested)+' FCFA', color: 'bg-amber-50 text-amber-900' },
                  { label: 'Coût / part', val: fmt(inv.costPerShare||0)+' FCFA', color: 'bg-green-50 text-green-900' },
                ].map((k,i) => (
                  <div key={i} className={`${k.color} rounded-2xl p-4`}>
                    <p className="text-xs font-bold uppercase opacity-60">{k.label}</p>
                    <p className="text-xl font-black mt-1">{k.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                  <h3 className="font-bold text-gray-800">Tableau des investisseurs — {proj.name}</h3>
                </div>
                {memberShares.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-10">Aucun investisseur enregistré pour ce projet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          {['Membre','Parts','% Participation','Capital investi','Barre participation','Dividendes estimés'].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {[...memberShares].sort((a,b) => parseFloat(b.shares)-parseFloat(a.shares)).map((ms, i) => {
                          const sh    = parseFloat(ms.shares);
                          const pctV  = totalShares > 0 ? (sh/totalShares*100) : 0;
                          const cap   = sh * parseFloat(inv.costPerShare||0);
                          const divTotal = dividendsFromFollowUps.filter(d=>d.memberId===ms.memberId).reduce((a,d)=>a+d.amount,0);
                          return (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-900">{getMemberName(ms.memberId)}</td>
                              <td className="px-4 py-3 font-black text-purple-700 text-base">{sh}</td>
                              <td className="px-4 py-3 font-bold text-gray-700">{pct(pctV)}</td>
                              <td className="px-4 py-3 font-bold text-amber-700">{fmt(cap)} FCFA</td>
                              <td className="px-4 py-3 w-32">
                                <div className="flex items-center gap-2">
                                  <RoiBar value={sh} max={totalShares} />
                                  <span className="text-xs text-gray-500 whitespace-nowrap">{pct(pctV)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {divTotal > 0
                                  ? <span className="font-bold text-green-700">{fmt(divTotal)} FCFA</span>
                                  : <span className="text-gray-400 text-xs">Pas encore distribué</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-green-50 border-t border-green-100 font-bold text-sm">
                        <tr>
                          <td className="px-4 py-3">TOTAL</td>
                          <td className="px-4 py-3 text-purple-700">{fmt(totalShares)}</td>
                          <td className="px-4 py-3">100%</td>
                          <td className="px-4 py-3 text-amber-700">{fmt(totalInvested)} FCFA</td>
                          <td />
                          <td className="px-4 py-3 text-green-700">{fmt(dividendsFromFollowUps.reduce((a,d)=>a+d.amount,0))} FCFA</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {isAdmin && memberShares.length > 0 && (
                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    💰 Simulateur de Distribution de Dividendes
                    <Badge color="green" size="xs">Calcul proportionnel aux parts</Badge>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[['quarter','Trimestre *','number','1'],['year','Année *','number',new Date().getFullYear()],['grossRevenue','Revenu Brut (FCFA) *','number','0'],['costDeduction','Charges à déduire','number','0']].map(([k,l,t,ph]) => (
                      <div key={k}>
                        <label className={LBL}>{l}</label>
                        <input type={t} value={distribForm[k]} min={t==='number'?'0':undefined}
                          onChange={e => setDistribForm(f=>({...f,[k]:e.target.value}))} className={INP} placeholder={String(ph)} />
                      </div>
                    ))}
                  </div>

                  {simDistrib.length > 0 && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex flex-wrap gap-6 text-sm">
                        <span><strong className="text-green-700">Revenu net à distribuer :</strong> {fmt(parseFloat(distribForm.grossRevenue||0)-parseFloat(distribForm.costDeduction||0))} FCFA</span>
                        <span><strong className="text-green-700">Valeur par part :</strong> {fmt((parseFloat(distribForm.grossRevenue||0)-parseFloat(distribForm.costDeduction||0))/Math.max(1,totalShares))} FCFA</span>
                        <span><strong className="text-green-700">Investisseurs :</strong> {simDistrib.length}</span>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full text-sm">
                          <thead className="bg-amber-50 text-xs text-amber-800 uppercase">
                            <tr>{['Membre','Parts','% Participation','Dividende calculé','ROI préliminaire'].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left font-bold">{h}</th>))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-50">
                            {simDistrib.map((d, i) => {
                              const roi = d.totalInvested > 0 ? ((d.dividend / d.totalInvested) * 100).toFixed(1) : '—';
                              return (
                                <tr key={i} className="hover:bg-amber-50 transition-colors">
                                  <td className="px-3 py-2.5 font-semibold">{d.name}</td>
                                  <td className="px-3 py-2.5 font-black text-purple-700">{d.shares}</td>
                                  <td className="px-3 py-2.5">{pct(d.pct)}</td>
                                  <td className="px-3 py-2.5 font-black text-green-700 text-base">{fmt(d.dividend)} FCFA</td>
                                  <td className="px-3 py-2.5"><span className={`font-bold ${parseFloat(roi)>=0?'text-green-600':'text-red-500'}`}>{roi}%</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={handleDistrib}
                          className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
                          ✓ Enregistrer cette distribution
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'portfolio' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="text-sm font-bold text-gray-700 mb-2 block">Sélectionner un membre</label>
            <select value={selectedMem} onChange={e => setSelectedMem(e.target.value)} className={INP + ' max-w-md'}>
              <option value="">— Choisir un membre —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
            </select>
          </div>

          {selectedMem && portfolioData.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-3xl mb-2">💹</p>
              <p>{getMemberName(selectedMem)} n'a aucun investissement enregistré.</p>
            </div>
          )}

          {selectedMem && portfolioData.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total investi',   val: fmt(portTotalInv)+' FCFA', color: 'bg-amber-50 text-amber-900' },
                  { label: 'Total perçu',     val: fmt(portTotalRec)+' FCFA', color: 'bg-green-50 text-green-900' },
                  { label: 'ROI global',      val: portROI+'%',              color: parseFloat(portROI)>=0?'bg-emerald-100 text-emerald-900':'bg-red-50 text-red-900' },
                ].map((k,i) => (
                  <div key={i} className={`${k.color} rounded-2xl p-5 text-center`}>
                    <p className="text-xs font-bold uppercase opacity-60">{k.label}</p>
                    <p className="text-2xl font-black mt-1">{k.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Portfolio de {getMemberName(selectedMem)}</h3>
                </div>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>{['Projet','Type','Parts','Coût/Part','Capital investi','Dividendes perçus','ROI','Progression'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {portfolioData.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900 max-w-[140px] truncate">{d.name}</td>
                        <td className="px-4 py-3"><Badge color={d.type==='Investissement Associatif'?'green':'amber'} size="xs">
                          {d.type==='Investissement Associatif'?'Associatif':'Partenarial'}</Badge></td>
                        <td className="px-4 py-3 font-black text-purple-700">{d.shares}</td>
                        <td className="px-4 py-3 text-gray-500">{fmt(d.costPerShare)} FCFA</td>
                        <td className="px-4 py-3 font-bold text-amber-700">{fmt(d.invested)} FCFA</td>
                        <td className="px-4 py-3 font-bold text-green-700">{fmt(d.received)} FCFA</td>
                        <td className="px-4 py-3">
                          <span className={`font-black ${d.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>{d.roi.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3 w-28"><RoiBar value={d.received} max={d.invested} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-50 border-t border-green-100 font-bold text-sm">
                    <tr>
                      <td className="px-4 py-3 text-gray-700" colSpan={4}>TOTAL PORTFOLIO</td>
                      <td className="px-4 py-3 text-amber-700">{fmt(portTotalInv)} FCFA</td>
                      <td className="px-4 py-3 text-green-700">{fmt(portTotalRec)} FCFA</td>
                      <td className="px-4 py-3"><span className={`font-black ${parseFloat(portROI)>=0?'text-green-700':'text-red-500'}`}>{portROI}%</span></td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 4 — SUIVIS TRIMESTRIELS
// ═══════════════════════════════════════════════════════════════════
const FOLLOW_DEFAULT = { quarter: '', year: new Date().getFullYear(), responsible: '', turnover: '', photos: '', quantityProduced: [{ product: '', quantity: '' }] };

const TabSuivis = ({ projects, setProjects, members, getMemberName, isAdmin, notify }) => {
  const [selectedId, setSelectedId] = useState('');
  const [entry, setEntry]           = useState(FOLLOW_DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [histFilter, setHistFilter] = useState('all');

  const proj = projects.find(p => p.id === parseInt(selectedId));
  const followUps = proj?.follow_ups || [];

  const filteredFollowUps = useMemo(() => {
    if (histFilter === 'all') return [...followUps].reverse();
    return [...followUps].filter(fu => String(fu.year) === histFilter).reverse();
  }, [followUps, histFilter]);

  const years = useMemo(() => [...new Set(followUps.map(fu => String(fu.year)))].sort().reverse(), [followUps]);

  const handleAddProd  = () => setEntry(e => ({ ...e, quantityProduced: [...e.quantityProduced, { product: '', quantity: '' }] }));
  const handleRemProd  = i  => setEntry(e => ({ ...e, quantityProduced: e.quantityProduced.filter((_,j)=>j!==i) }));
  const handleUpdProd  = (i, k, v) => setEntry(e => { const l=[...e.quantityProduced]; l[i][k]=v; return {...e,quantityProduced:l}; });

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!entry.quarter || !entry.year || !entry.responsible) {
      notify('Trimestre, année et responsable obligatoires', 'error'); return;
    }
    setSubmitting(true);
    const photos = entry.photos.split('\n').map(l=>l.trim()).filter(Boolean);
    const newFu = {
      quarter: parseInt(entry.quarter),
      year: parseInt(entry.year),
      responsible: entry.responsible,
      turnover: parseFloat(entry.turnover) || 0,
      photos,
      quantityProduced: entry.quantityProduced.filter(p => p.product.trim() && p.quantity),
    };
    const updatedFus = [...(proj.follow_ups || []), newFu];
    const payload = {
      name: proj.name, projectType: proj.project_type, description: proj.description, budget: proj.budget,
      expectedProduction:  JSON.stringify(proj.expected_production||[]),
      investmentDetails:   JSON.stringify(proj.investment_details||{}),
      financialResults:    JSON.stringify(proj.financial_results||[]),
      projectResponsibles: JSON.stringify(proj.project_responsibles||[]),
      followUps:           JSON.stringify(updatedFus),
    };
    try {
      const res = await updateProject(proj.id, payload);
      setProjects(prev => prev.map(p => p.id === res.id ? res : p));
      setEntry(FOLLOW_DEFAULT);
      notify('Suivi enregistré ✓');
    } catch (err) {
      console.error('Erreur:', err);
      notify('Erreur lors de l\'enregistrement', 'error');
    }
    finally { setSubmitting(false); }
  };

  const handleDeleteFollowUp = async idx => {
    if (!window.confirm('Supprimer ce suivi ?')) return;
    const updatedFus = followUps.filter((_, i) => i !== (followUps.length - 1 - idx));
    const payload = {
      name: proj.name, projectType: proj.project_type, description: proj.description, budget: proj.budget,
      expectedProduction:  JSON.stringify(proj.expected_production||[]),
      investmentDetails:   JSON.stringify(proj.investment_details||{}),
      financialResults:    JSON.stringify(proj.financial_results||[]),
      projectResponsibles: JSON.stringify(proj.project_responsibles||[]),
      followUps:           JSON.stringify(updatedFus),
    };
    try {
      const res = await updateProject(proj.id, payload);
      setProjects(prev => prev.map(p => p.id === res.id ? res : p));
      notify('Suivi supprimé');
    } catch (err) {
      console.error('Erreur:', err);
      notify('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="text-sm font-bold text-gray-700 mb-2 block">Projet à suivre</label>
        <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setEntry(FOLLOW_DEFAULT); }}
          className={INP + ' max-w-lg'}>
          <option value="">— Sélectionner un projet —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name} — {p.project_type}</option>)}
        </select>
      </div>

      {proj && (
        <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
          {isAdmin && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-green-100 shadow-sm sticky top-24">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white rounded-t-2xl">
                  <h3 className="font-bold text-green-900">📋 Nouveau suivi</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{proj.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LBL}>Trimestre *</label>
                      <select value={entry.quarter} onChange={e => setEntry(f=>({...f,quarter:e.target.value}))} className={INP} required>
                        <option value="">—</option>
                        {[1,2,3,4].map(q => <option key={q} value={q}>T{q}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={LBL}>Année *</label>
                      <input type="number" value={entry.year} onChange={e => setEntry(f=>({...f,year:e.target.value}))} className={INP} placeholder="2026" required />
                    </div>
                  </div>

                  <div>
                    <label className={LBL}>Responsable *</label>
                    <select value={entry.responsible} onChange={e => setEntry(f=>({...f,responsible:e.target.value}))} className={INP} required>
                      <option value="">— Sélectionner —</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={LBL}>CA réalisé (FCFA)</label>
                    <input type="number" value={entry.turnover} onChange={e => setEntry(f=>({...f,turnover:e.target.value}))} className={INP} placeholder="0" />
                  </div>

                  <div>
                    <label className={LBL}>Production réalisée</label>
                    {entry.quantityProduced.map((p, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={p.product} onChange={e => handleUpdProd(i,'product',e.target.value)}
                          className={INP + ' flex-1'} placeholder="Produit…" />
                        <input type="number" value={p.quantity} onChange={e => handleUpdProd(i,'quantity',e.target.value)}
                          className={INP + ' w-20'} placeholder="kg" />
                        <button type="button" disabled={entry.quantityProduced.length<=1}
                          onClick={() => handleRemProd(i)} className="text-red-400 hover:text-red-600 disabled:opacity-30">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddProd} className="text-xs text-green-700 font-bold hover:text-green-800">+ Ajouter un produit</button>
                  </div>

                  <div>
                    <label className={LBL}>Photos (URLs Cloudinary, une par ligne)</label>
                    <textarea value={entry.photos} onChange={e => setEntry(f=>({...f,photos:e.target.value}))}
                      rows={3} className={`${INP} resize-none`}
                      placeholder={'https://res.cloudinary.com/…/photo1.jpg\nhttps://res.cloudinary.com/…/photo2.jpg'} />
                    <p className="text-[10px] text-gray-400 mt-1">Uploadez d'abord sur Cloudinary, puis collez les URLs ici.</p>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-colors">
                    {submitting ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Enregistrement…</> : '✓ Enregistrer le suivi'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className={isAdmin ? 'lg:col-span-3' : ''}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">
                Historique — <span className="text-green-700">{proj.name}</span>
                <span className="ml-2 text-xs font-normal text-gray-400">({followUps.length} suivi{followUps.length>1?'s':''})</span>
              </h3>
              {years.length > 0 && (
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button onClick={() => setHistFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${histFilter==='all'?'bg-white text-green-700 shadow-sm':'text-gray-500'}`}>Tous</button>
                  {years.map(y => (
                    <button key={y} onClick={() => setHistFilter(y)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${histFilter===y?'bg-white text-green-700 shadow-sm':'text-gray-500'}`}>{y}</button>
                  ))}
                </div>
              )}
            </div>

            {filteredFollowUps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <h4 className="font-bold text-gray-600">Aucun suivi enregistré</h4>
                {isAdmin && <p className="text-sm mt-1">Utilisez le formulaire pour ajouter le premier suivi.</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFollowUps.map((fu, dispIdx) => {
                  const realIdx = followUps.findIndex((x,i) => followUps.length-1-i === followUps.length-1-dispIdx);
                  return (
                    <motion.div key={dispIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dispIdx * 0.04 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                      {fu.photos?.length > 0 && <PhotoSlideshow photos={fu.photos} />}

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-0.5 rounded-full">T{fu.quarter} {fu.year}</span>
                              {fu.photos?.length > 0 && <span className="text-xs text-gray-400">📷 {fu.photos.length} photo{fu.photos.length>1?'s':''}</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-1.5">
                              👤 Responsable : <strong className="text-gray-800">{getMemberName(fu.responsible) || fu.responsible}</strong>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {fu.turnover > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase">CA réalisé</p>
                                <p className="font-black text-green-700">{fmt(fu.turnover)} FCFA</p>
                              </div>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDeleteFollowUp(dispIdx)}
                                className="text-red-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer ce suivi">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {fu.quantityProduced?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Production réalisée</p>
                            <div className="flex flex-wrap gap-2">
                              {fu.quantityProduced.map((p, pi) => (
                                <div key={pi} className="bg-green-50 border border-green-100 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                  <span className="text-sm">🌾</span>
                                  <span className="text-xs font-bold text-green-800">{p.product}</span>
                                  <span className="text-xs text-green-600 font-black">{fmt(p.quantity)} kg</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {fu.dividends?.netRevenue && (
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">💰 Dividendes distribués</p>
                            <p className="text-sm text-gray-700">
                              Revenu net distribué : <strong className="text-amber-700">{fmt(fu.dividends.netRevenue)} FCFA</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;