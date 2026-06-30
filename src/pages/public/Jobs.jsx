// src/pages/public/Jobs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Calendar, Search, ExternalLink, Clock, Plus, X, Edit3, Trash2 } from 'lucide-react';
import api from '../../services/api';

const Jobs = () => {
  const { user } = useAuth();
  const isConnected = !!user;
  const isAdmin = user?.role === 'admin';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'emploi', organization: '', location: '', description: '', contact_email: '', deadline: ''
  });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const response = await api.get('/jobs'); setJobs(response.data || []); }
    catch { setJobs([]); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ title: '', type: 'emploi', organization: '', location: '', description: '', contact_email: '', deadline: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (job) => {
    setForm({
      title: job.title || '', type: job.type || 'emploi', organization: job.organization || '',
      location: job.location || '', description: job.description || '', contact_email: job.contact_email || '',
      deadline: job.deadline || ''
    });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
      } else {
        await api.post('/jobs', form);
      }
      setForm({ title: '', type: 'emploi', organization: '', location: '', description: '', contact_email: '', deadline: '' });
      setEditingId(null);
      setShowForm(false);
      fetchJobs();
    } catch { alert('Erreur'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try { await api.delete(`/jobs/${id}`); fetchJobs(); }
    catch { alert('Erreur'); }
  };

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = searchTerm.toLowerCase();
      return (j.title?.toLowerCase().includes(q) || j.organization?.toLowerCase().includes(q)) && (filterType === 'all' || j.type === filterType);
    });
  }, [jobs, searchTerm, filterType]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-green-700 border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Bourse d'Emploi</h1>
            <p className="text-xl text-green-100 font-light">Opportunités professionnelles pour les membres AIFASA 17</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm" /></div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-lg px-3 py-2.5 text-sm"><option value="all">Tous</option><option value="emploi">Emplois</option><option value="mission">Missions</option></select>
          {isConnected && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Publier une offre
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-xl border p-5 hover:shadow-md transition-all relative group">
              {/* Boutons Admin */}
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(job)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-blue-50 text-blue-600" title="Modifier"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(job.id)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-red-50 text-red-600" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <div className="flex items-start gap-3 mb-3"><div className="p-2 bg-green-50 rounded-lg"><Briefcase className="w-5 h-5 text-green-600" /></div><div><h3 className="font-bold text-gray-800 text-sm">{job.title}</h3><p className="text-xs text-green-600 font-semibold">{job.organization}</p></div></div>
              <p className="text-xs text-gray-500 mb-3">{job.description}</p>
              <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : 'N/A'}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type === 'emploi' ? 'CDD/CDI' : 'Mission'}</span>
              </div>
              <a href={`mailto:${job.contact_email}`} className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800">Postuler <ExternalLink className="w-3 h-3" /></a>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">Aucune offre trouvée</div>}
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <><Edit3 className="w-5 h-5 text-blue-600" /> Modifier l'offre</> : <><Plus className="w-5 h-5 text-green-600" /> Publier une offre</>}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre du poste *" className="w-full p-2.5 border rounded-lg text-sm" required />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="p-2.5 border rounded-lg text-sm"><option value="emploi">Emploi</option><option value="mission">Mission</option></select>
                  <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="Organisation *" className="p-2.5 border rounded-lg text-sm" required />
                </div>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Localisation" className="w-full p-2.5 border rounded-lg text-sm" />
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className="w-full p-2.5 border rounded-lg text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="Email de contact" type="email" className="p-2.5 border rounded-lg text-sm" />
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="p-2.5 border rounded-lg text-sm" />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors">
                  {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Publier l\'offre'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;