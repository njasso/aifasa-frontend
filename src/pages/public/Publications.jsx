// src/pages/public/Publications.jsx
// Restructurée : le rendu des cartes et des modales a été extrait dans
// src/pages/public/publications/ pour réduire la taille du fichier.
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
import PublicationCard from './publications/PublicationCard';
import PublicationDetailModal from './publications/PublicationDetailModal';
import PublicationFormModal from './publications/PublicationFormModal';

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
              <PublicationCard
                key={pub.id}
                pub={pub}
                index={index}
                isAdmin={isAdmin}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <PublicationDetailModal
        isOpen={isModalOpen}
        publication={selectedPublication}
        onClose={() => setIsModalOpen(false)}
      />

      <PublicationFormModal
        isOpen={isFormOpen}
        isAdmin={isAdmin}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        documentFiles={documentFiles}
        newLink={newLink}
        setNewLink={setNewLink}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        onImageChange={handleImageChange}
        onDocumentChange={handleDocumentChange}
        onRemoveDocument={removeDocument}
        onAddExternalLink={addExternalLink}
        onRemoveExternalLink={removeExternalLink}
      />
    </div>
  );
};

export default Publications;
