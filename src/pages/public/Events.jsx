// src/pages/public/Events.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, Users, ArrowRight,
  Search, CheckCircle, Plus, X, Save, Edit3, Trash2
} from 'lucide-react';
import api from '../../services/api';

const Events = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'meeting', event_date: '', time: '', location: '', description: '', image_url: ''
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data || []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ title: '', type: 'meeting', event_date: '', time: '', location: '', description: '', image_url: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (event) => {
    setForm({
      title: event.title || '',
      type: event.type || 'meeting',
      event_date: event.event_date || '',
      time: event.time || '',
      location: event.location || '',
      description: event.description || '',
      image_url: event.image_url || ''
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
      } else {
        await api.post('/events', form);
      }
      setForm({ title: '', type: 'meeting', event_date: '', time: '', location: '', description: '', image_url: '' });
      setEditingId(null);
      setShowForm(false);
      fetchEvents();
    } catch { alert('Erreur lors de l\'enregistrement'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch { alert('Erreur lors de la suppression'); }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, filterType]);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'past');
  const typeLabels = { ag: 'AG', workshop: 'Atelier', webinar: 'Webinaire', meeting: 'Réunion' };
  const typeColors = { ag: 'bg-purple-100 text-purple-700', workshop: 'bg-blue-100 text-blue-700', webinar: 'bg-green-100 text-green-700', meeting: 'bg-amber-100 text-amber-700' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-green-700 border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Événements & Activités</h1>
            <div className="h-1 w-20 bg-emerald-400 mx-auto mb-6 rounded"></div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto font-light">AG, ateliers techniques, webinaires et rencontres de l'AIFASA 17</p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, value: events.length, label: 'Événements' },
            { icon: CheckCircle, value: upcomingEvents.length, label: 'À venir' },
            { icon: Clock, value: pastEvents.length, label: 'Passés' },
            { icon: Users, value: '35+', label: 'Participants' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-5 text-center border border-gray-100">
              <stat.icon className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un événement..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-lg px-3 py-2.5 text-sm">
            <option value="all">Tous types</option>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {isAdmin && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, idx) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all relative group">
              <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}')` }}>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>{typeLabels[event.type] || event.type}</span>
                  {event.status === 'past' && <span className="text-[10px] font-bold bg-gray-500 text-white px-2.5 py-0.5 rounded-full">Terminé</span>}
                </div>
                {/* Boutons Admin */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(event); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-blue-600 shadow-sm" title="Modifier">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-red-600 shadow-sm" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-2">{event.title}</h3>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p className="flex items-center gap-2"><Calendar className="w-3 h-3 text-emerald-600" /> {new Date(event.event_date || event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="flex items-center gap-2"><Clock className="w-3 h-3 text-emerald-600" /> {event.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-600" /> {event.location}</p>
                  <p className="flex items-center gap-2"><Users className="w-3 h-3 text-emerald-600" /> {event.participants || 0} participants</p>
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed line-clamp-3">{event.description}</p>
                {event.status === 'upcoming' && (
                  <a href={`mailto:association.fasa17@gmail.com?subject=Inscription: ${event.title}`} className="mt-4 inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
                    S'inscrire <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
          {filteredEvents.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">Aucun événement trouvé</div>}
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <><Edit3 className="w-5 h-5 text-blue-600" /> Modifier</> : <><Plus className="w-5 h-5 text-green-600" /> Nouvel événement</>}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre *" className="w-full p-2.5 border rounded-lg text-sm" required />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="p-2.5 border rounded-lg text-sm">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className="p-2.5 border rounded-lg text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="Horaire" className="p-2.5 border rounded-lg text-sm" />
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lieu" className="p-2.5 border rounded-lg text-sm" />
                </div>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3} className="w-full p-2.5 border rounded-lg text-sm" />
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="URL de l'image" className="w-full p-2.5 border rounded-lg text-sm" />
                <button type="submit" disabled={submitting} className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors">
                  {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer l\'événement'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;