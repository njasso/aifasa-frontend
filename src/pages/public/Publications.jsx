// src/pages/public/Publications.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getPublications, 
  createPublication, 
  updatePublication, 
  deletePublication 
} from '../../services/publicationService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, 
  FiArrowRight, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiBookOpen,
  FiFile,
  FiTrendingUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiImage,
  FiLink,
  FiSave,
  FiTag,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEye
} from 'react-icons/fi';

const Publications = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    type: 'article',
    image: null,
    imagePreview: '',
    documents: [],
    externalLinks: [],
    status: 'published',
  });
  const [documentFiles, setDocumentFiles] = useState([]);
  const [newLink, setNewLink] = useState({ url: '', label: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const triggerAlert = useCallback((message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  }, []);

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      try {
        const data = await getPublications();
        setPublications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur de chargement:', error);
        triggerAlert('Impossible de récupérer la liste des publications.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, [triggerAlert]);

  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchesSearch = 
        pub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || pub.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [publications, searchTerm, filterType]);

  const stats = useMemo(() => ({
    all: publications.length,
    article: publications.filter(p => p.type === 'article').length,
    rapport: publications.filter(p => p.type === 'rapport').length,
    actualite: publications.filter(p => p.type === 'actualite').length,
  }), [publications]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      category: '',
      type: 'article',
      image: null,
      imagePreview: '',
      documents: [],
      externalLinks: [],
      status: 'published',
    });
    setDocumentFiles([]);
    setNewLink({ url: '', label: '' });
    setEditingId(null);
  }, []);

  const handleAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (pub) => {
    setEditingId(pub.id);
    setFormData({
      title: pub.title || '',
      content: pub.content || '',
      category: pub.category || '',
      type: pub.type || 'article',
      image: null,
      imagePreview: pub.image_url || '',
      documents: pub.documents || [],
      externalLinks: pub.external_links || [],
      status: pub.status || 'published',
    });
    setDocumentFiles([]);
    setIsFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerAlert('L\'image sélectionnée dépasse la limite autorisée de 5 Mo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles(prev => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addExternalLink = () => {
    if (newLink.url.trim() && newLink.label.trim()) {
      setFormData(prev => ({
        ...prev,
        externalLinks: [...prev.externalLinks, { url: newLink.url.trim(), label: newLink.label.trim() }],
      }));
      setNewLink({ url: '', label: '' });
    }
  };

  const removeExternalLink = (index) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      triggerAlert('Le titre de la publication est requis.', 'error');
      return;
    }

    setIsSubmitting(true);
    setAlert({ message: '', type: '' });

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('content', formData.content.trim());
      data.append('category', formData.category.trim());
      data.append('type', formData.type);
      data.append('status', formData.status);
      
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      documentFiles.forEach(file => {
        data.append('documents', file);
      });
      
      data.append('externalLinks', JSON.stringify(formData.externalLinks));

      let result;
      if (editingId) {
        result = await updatePublication(editingId, data);
        setPublications(prev => prev.map(p => p.id === editingId ? result : p));
        triggerAlert('Publication mise à jour avec succès !', 'success');
      } else {
        result = await createPublication(data);
        setPublications(prev => [result, ...prev]);
        triggerAlert('Nouvelle publication partagée avec succès !', 'success');
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      triggerAlert(error.response?.data?.error || 'Une erreur est survenue lors de la sauvegarde.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmez-vous la suppression définitive de cette publication ?')) {
      try {
        await deletePublication(id);
        setPublications(prev => prev.filter(p => p.id !== id));
        triggerAlert('La publication a bien été supprimée.', 'success');
      } catch (error) {
        console.error(error);
        triggerAlert('Erreur lors du processus de suppression.', 'error');
      }
    }
  };

  const handleView = (pub) => {
    setSelectedPublication(pub);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 overflow-x-hidden">
      {/* Hero Banner avec effets de lumière */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 text-white py-20 px-4 overflow-hidden">
        {/* Effets de lumière */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-30%] right-[-10%] w-[400px] h-[400px] bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Grille de fond */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-400/20 rounded-2xl mb-6 backdrop-blur-sm border border-emerald-400/30">
              <FiBookOpen className="w-10 h-10 text-emerald-300" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Publications & <span className="text-emerald-300">Rapports</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-green-300 mx-auto my-4 rounded-full"></div>
            <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto font-light leading-relaxed">
              Espace de diffusion, de documentation technique et d'actualités officielles de l'AIFASA 17.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notifications Flashes */}
      <div className="fixed top-5 right-5 z-50 max-w-md w-full px-4">
        <AnimatePresence>
          {alert.message && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-sm ${
                alert.type === 'error' 
                  ? 'bg-red-50/95 text-red-800 border-red-200' 
                  : 'bg-green-50/95 text-green-800 border-green-200'
              }`}
            >
              {alert.type === 'error' ? (
                <FiAlertCircle className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" />
              ) : (
                <FiCheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{alert.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filtres Interactifs */}
      <section className="container mx-auto max-w-6xl px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'all', label: 'Toutes', value: stats.all, icon: FiFileText, color: 'border-b-emerald-500 text-emerald-700', bg: 'bg-emerald-50/50' },
            { id: 'article', label: 'Articles', value: stats.article, icon: FiBookOpen, color: 'border-b-blue-500 text-blue-700', bg: 'bg-blue-50/50' },
            { id: 'rapport', label: 'Rapports', value: stats.rapport, icon: FiTrendingUp, color: 'border-b-purple-500 text-purple-700', bg: 'bg-purple-50/50' },
            { id: 'actualite', label: 'Actualités', value: stats.actualite, icon: FiFile, color: 'border-b-amber-500 text-amber-700', bg: 'bg-amber-50/50' },
          ].map((block) => (
            <motion.button
              key={block.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterType(block.id)}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 text-center border-b-4 transition-all duration-300 ${
                filterType === block.id 
                  ? `${block.color} ${block.bg} border-b-4 shadow-xl scale-[1.02] font-bold` 
                  : 'border-b-transparent opacity-80 hover:opacity-100 hover:shadow-xl'
              }`}
            >
              <div className="text-gray-400 mb-2 flex justify-center">
                <block.icon className={`w-6 h-6 ${filterType === block.id ? 'text-current' : ''}`} />
              </div>
              <p className="text-3xl font-black text-gray-800">{block.value}</p>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">{block.label}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Barre de Recherche et Action */}
      <section className="container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-emerald-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par mot-clé, thème ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              <FiPlus className="w-5 h-5" />
              Nouvelle Publication
            </motion.button>
          )}
        </div>
      </section>

      {/* Liste de Cartes */}
      <section className="container mx-auto max-w-6xl px-4 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Synchronisation du catalogue...</p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-16 text-center max-w-xl mx-auto shadow-lg"
          >
            <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Aucun document trouvé</h3>
            <p className="text-sm text-gray-400 mt-2">Ajustez vos filtres ou essayez un autre mot clé.</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((pub, index) => (
              <motion.div
                key={pub.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {pub.image_url ? (
                    <div className="h-48 overflow-hidden relative bg-gradient-to-br from-green-100 to-emerald-100">
                      <img 
                        src={pub.image_url} 
                        alt={pub.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                          {pub.type}
                        </span>
                        {pub.status === 'draft' && (
                          <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">Brouillon</span>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {new Date(pub.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-emerald-600 to-green-500"></div>
                  )}
                  <div className="p-5 pb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
                      {pub.category && (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                          <FiTag className="w-3 h-3" />
                          {pub.category}
                        </span>
                      )}
                      {!pub.image_url && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <FiCalendar className="w-3 h-3" />
                          {new Date(pub.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-base line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                      {pub.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {pub.content?.substring(0, 150)}...
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-3 border-t border-gray-100/50 flex items-center justify-between">
                  <button 
                    onClick={() => handleView(pub)} 
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-1 group/btn"
                  >
                    Consulter le document 
                    <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEdit(pub)} 
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(pub.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ======== MODAL DE LECTURE COMPLÈTE ======== */}
      <AnimatePresence>
        {isModalOpen && selectedPublication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-3 py-1.5 rounded-full">
                  Détails de la publication
                </span>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {selectedPublication.image_url && (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={selectedPublication.image_url} 
                      alt="" 
                      className="w-full h-64 object-cover" 
                    />
                  </div>
                )}
                <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
                  {selectedPublication.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 border-b border-gray-100 pb-4">
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(selectedPublication.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {selectedPublication.category && (
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      <FiTag className="w-3 h-3" />
                      {selectedPublication.category}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedPublication.content}
                </div>
                
                {selectedPublication.documents?.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      📎 Documents joints
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedPublication.documents.map((doc, idx) => (
                        <a 
                          key={idx} 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-50 p-3 rounded-xl border border-emerald-100/50 transition-all hover:shadow-md"
                        >
                          <FiDownload className="flex-shrink-0 w-4 h-4" />
                          <span className="truncate">{doc.name || `Document_${idx + 1}`}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPublication.external_links?.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      🔗 Ressources & Liens web
                    </h4>
                    <div className="space-y-1.5">
                      {selectedPublication.external_links.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50/60 hover:bg-blue-50 p-3 rounded-xl border border-blue-100/30 transition-all hover:shadow-md"
                        >
                          <FiLink className="flex-shrink-0 w-4 h-4" />
                          {link.label || link.url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== FORMULAIRE D'ÉDITION & CRÉATION (ADMIN) ======== */}
      <AnimatePresence>
        {isFormOpen && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-gray-800 text-lg">
                  {editingId ? '✏️ Modifier la publication' : '✨ Créer une nouvelle entrée'}
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Titre de la publication *
                  </label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
                    className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Corps du texte / Contenu
                  </label>
                  <textarea 
                    value={formData.content} 
                    onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
                    rows={5} 
                    className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Type de document
                    </label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} 
                      className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                    >
                      <option value="article">📄 Article technique</option>
                      <option value="rapport">📊 Rapport officiel</option>
                      <option value="actualite">📰 Actualité d'impact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      Thématique / Catégorie
                    </label>
                    <input 
                      type="text" 
                      value={formData.category} 
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} 
                      placeholder="Ex: Aquaculture, Financement..." 
                      className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* Bannière Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    🖼️ Couverture ou Illustration
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.imagePreview && (
                      <img 
                        src={formData.imagePreview} 
                        alt="" 
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" 
                      />
                    )}
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                      <span className="text-sm text-gray-500 inline-flex items-center gap-2">
                        <FiImage className="w-5 h-5" />
                        {formData.imagePreview ? 'Remplacer l\'image (Max 5Mo)' : 'Téléverser un visuel d\'en-tête'}
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Annexes / Fichiers joints */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    📎 Documents annexes
                  </label>
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                    <span className="text-sm text-gray-500 inline-flex items-center gap-2">
                      <FiFile className="w-5 h-5" />
                      Attacher des fichiers (PDF, Excel, Word...)
                    </span>
                    <input type="file" multiple onChange={handleDocumentChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
                  </label>
                  {documentFiles.length > 0 && (
                    <div className="mt-2 space-y-1.5 bg-gray-50/80 p-3 rounded-xl">
                      {documentFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm text-gray-600">
                          <span className="truncate max-w-[85%]">{file.name}</span>
                          <button type="button" onClick={() => removeDocument(idx)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all">
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Liens Ressources Hypertextes */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    🔗 Indexation de liens utiles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input 
                      type="url" 
                      placeholder="https://exemple.com" 
                      value={newLink.url} 
                      onChange={(e) => setNewLink(p => ({ ...p, url: e.target.value }))} 
                      className="flex-1 min-w-[150px] p-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                    />
                    <input 
                      type="text" 
                      placeholder="Libellé du lien" 
                      value={newLink.label} 
                      onChange={(e) => setNewLink(p => ({ ...p, label: e.target.value }))} 
                      className="flex-1 min-w-[100px] p-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                    />
                    <button 
                      type="button" 
                      onClick={addExternalLink} 
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.externalLinks.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {formData.externalLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                          <span className="truncate text-blue-600 font-medium">{link.label || link.url}</span>
                          <button type="button" onClick={() => removeExternalLink(idx)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all">
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visibilité */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    📌 Cycle de vie & Statut
                  </label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} 
                    className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                  >
                    <option value="published">🚀 Publier immédiatement</option>
                    <option value="draft">📝 Enregistrer comme Brouillon</option>
                    <option value="archived">📦 Archiver l'élément</option>
                  </select>
                </div>

                {/* Pied de formulaire actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)} 
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {isSubmitting ? 'Traitement...' : (editingId ? 'Mettre à jour' : 'Lancer la publication')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Publications;