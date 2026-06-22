import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMedia, createMedia, deleteMedia } from '../../services/galleryService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUpload, 
  FiImage, 
  FiPlayCircle, 
  FiPlus, 
  FiTrash2, 
  FiFilter, 
  FiVideo, 
  FiAlertCircle, 
  FiCheckCircle,
  FiFilm
} from 'react-icons/fi';

// Composant de Confirmation Épuré
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
        <h4 className="font-bold text-gray-900 text-base">Confirmation requise</h4>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-5">{message}</p>
      <div className="flex justify-end space-x-2 text-xs font-bold">
        <button onClick={onCancel} className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">
          Supprimer définitivement
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const slideUp = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

const Gallery = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Événement',
    file: null,
    fileName: '',
    fileType: '',
    fileSize: ''
  });
  
  const [fileError, setFileError] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Notifications Flash Éphémères
  const triggerAlert = useCallback((message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  }, []);

  // Fetch initial
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const data = await getMedia();
        setMedia(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur de chargement des médias:', error);
        triggerAlert('Impossible de récupérer la galerie média.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [triggerAlert]);

  // Formatage lisible de la taille
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extraction dynamique des catégories uniques pour le système de filtrage
  const categoriesList = useMemo(() => {
    const cats = media.map(m => m.category?.trim()).filter(Boolean);
    return ['all', ...new Set(cats)];
  }, [media]);

  // Filtrage des médias (Mémoïsé)
  const filteredMedia = useMemo(() => {
    if (filterCategory === 'all') return media;
    return media.filter(m => m.category?.toLowerCase() === filterCategory.toLowerCase());
  }, [media, filterCategory]);

  // Gestion du sélecteur de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setFileError('Le fichier dépasse la limite globale autorisée de 50 Mo.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: formatBytes(file.size)
      }));
      setFileError('');
    }
  };

  // Envoi asynchrone sécurisé
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError('');

    if (!formData.file) {
      setFileError('Veuillez joindre une image ou une capsule vidéo.');
      return;
    }
    if (!formData.title.trim()) {
      triggerAlert('Le titre du média est obligatoire.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category.trim());
      data.append('file', formData.file);

      const newMedia = await createMedia(data);
      setMedia(prev => [newMedia, ...prev]);
      setFormData({ title: '', category: 'Événement', file: null, fileName: '', fileType: '', fileSize: '' });
      setIsFormOpen(false);
      triggerAlert('Média publié avec succès au catalogue !', 'success');
    } catch (error) {
      console.error(error);
      triggerAlert(error.response?.data?.error || 'Échec de la publication du média.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setMediaToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMedia(mediaToDelete);
      setMedia(prev => prev.filter((item) => item.id !== mediaToDelete));
      setShowConfirmModal(false);
      setMediaToDelete(null);
      triggerAlert('Le média a été retiré définitivement.', 'success');
    } catch (error) {
      console.error(error);
      triggerAlert('Erreur lors du retrait du fichier.', 'error');
      setShowConfirmModal(false);
      setMediaToDelete(null);
    }
  };

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-green-800 selection:text-white">
      
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 text-white py-12 px-4 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-block text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/20 mb-2 uppercase tracking-wider">
              Médiathèque Officielle
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Galerie Média</h1>
            <p className="text-green-100/80 text-sm mt-1 max-w-xl font-light">
              Revivez en images et vidéos les temps forts, Assemblées Générales et projets de terrain de la Promo 17 de l'AIFASA.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FiPlus className="w-4 h-4" /> Publier un média
            </button>
          )}
        </div>
      </section>

      {/* Flashes Notifications */}
      <div className="fixed top-5 right-5 z-50 max-w-sm w-full px-4">
        <AnimatePresence>
          {alert.message && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md ${
                alert.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
              }`}
            >
              {alert.type === 'error' ? <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /> : <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              <p className="text-xs font-semibold">{alert.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badges de Navigation par Catégorie (Filtres Horizontaux) */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="text-gray-400 mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider"><FiFilter /> Filtrer :</div>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex-shrink-0 capitalize ${
                filterCategory === cat
                  ? 'bg-green-800 border-green-900 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? 'Tous les médias' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grille d'Affichage Principale */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-700 border-t-transparent mb-3"></div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Synchronisation des albums...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 max-w-lg mx-auto shadow-sm p-8">
            <FiImage className="mx-auto text-4xl text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-700">Aucun élément trouvé</h3>
            <p className="text-xs text-gray-400 mt-1">Aucune image ou vidéo n'est classée dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredMedia.map((item) => {
              const isVideo = item.file_type?.startsWith('video');
              return (
                <motion.div
                  key={item.id}
                  variants={slideUp}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all group relative flex flex-col justify-between"
                >
                  <div className="relative h-56 bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => handleMediaClick(item)}>
                    {isVideo ? (
                      <>
                        <video src={item.image_url} className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500" preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white group-hover:bg-black/40 transition-colors">
                          <FiPlayCircle className="w-12 h-12 drop-shadow-md text-white/90 group-hover:scale-105 transition-transform" />
                        </div>
                      </>
                    ) : (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/default_image.png'; }}
                      />
                    )}
                    
                    {/* Badge type de fichier */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        {isVideo ? <FiVideo /> : <FiImage />} {isVideo ? 'Vidéo' : 'Photo'}
                      </span>
                    </div>
                  </div>

                  {/* Corps de carte */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-1 leading-snug" title={item.title}>{item.title}</h3>
                      {item.category && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-800 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="mt-3 pt-2.5 border-t border-gray-50 flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }}
                          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Retirer
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ======== MODAL DE VISUALISATION PLEIN ÉCRAN ======== */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-none">{selectedMedia.title}</h3>
                  {selectedMedia.category && <p className="text-[11px] text-gray-400 font-medium mt-1">Album : {selectedMedia.category}</p>}
                </div>
                <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow flex items-center justify-center p-4 bg-gray-950/5 overflow-hidden">
                {selectedMedia.file_type && selectedMedia.file_type.startsWith('video') ? (
                  <video src={selectedMedia.image_url} controls autoPlay className="max-w-full max-h-[65vh] rounded-lg shadow-lg" />
                ) : (
                  <img 
                    src={selectedMedia.image_url} 
                    alt={selectedMedia.title} 
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/default_image.png'; }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======== MODAL DE TÉLÉVERSEMENT (ADMIN) ======== */}
      <AnimatePresence>
        {isFormOpen && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 10 }}
              className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2 text-green-800 font-bold">
                  <FiUpload className="w-4 h-4" />
                  <span className="text-base">Publier sur la galerie</span>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><FiX className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre du média *</label>
                  <input
                    type="text"
                    placeholder="Ex: Photo de famille AG Ebolowa"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catégorie ou Album</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 bg-white outline-none font-medium text-gray-700"
                  >
                    <option value="Événement">Événement / Célébration</option>
                    <option value="Projet">Projet Agricole / Terrain</option>
                    <option value="Réunion">Conseil Exécutif / AG</option>
                    <option value="Divers">Divers / Cohésion</option>
                  </select>
                </div>

                {/* Zone interactive d'upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fichier source (Max 50Mo) *</label>
                  {!formData.file ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-green-600 rounded-xl p-6 bg-gray-50 cursor-pointer transition-colors group">
                      <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2 transition-colors" />
                      <span className="text-xs font-bold text-gray-600">Parcourir ou glisser l'élément</span>
                      <span className="text-[10px] text-gray-400 mt-1">Images (PNG, JPG) ou Vidéos (MP4)</span>
                      <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,video/*" required />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between border border-green-200 bg-green-50/40 p-3 rounded-lg">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {formData.fileType.startsWith('video') ? <FiFilm className="text-green-700 w-5 h-5 flex-shrink-0" /> : <FiImage className="text-green-700 w-5 h-5 flex-shrink-0" />}
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-800 truncate">{formData.fileName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{formData.fileSize}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, file: null, fileName: '', fileType: '', fileSize: '' }))} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><FiX className="w-4 h-4" /></button>
                    </div>
                  )}
                  {fileError && <p className="mt-1 text-xs text-red-600 font-medium">{fileError}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 font-semibold">
                    Annuler
                  </button>
                  <button type="submit" disabled={isSubmitting} className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-40 shadow-sm">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                        <span>Téléversement...</span>
                      </>
                    ) : 'Mettre en ligne'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation de suppression */}
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            message="Confirmez-vous la suppression irréversible de cette ressource multimédia de la base de données de l'AIFASA 17 ?"
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;