import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDocuments, createDocument } from '../../services/documentService';
import DocumentCard from '../../components/DocumentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, 
  FiSearch, 
  FiFilter, 
  FiFileText, 
  FiPlus, 
  FiX, 
  FiFolder, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiCheckCircle,
  FiPieChart
} from 'react-icons/fi';

const Documents = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    type: 'Rapport', 
    file: null,
    fileName: '',
    fileSize: ''
  });
  
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Notifications Flash éphémères
  const triggerAlert = useCallback((message, type = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 4000);
  }, []);

  // Chargement initial des documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const data = await getDocuments();
        setDocuments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        triggerAlert('Impossible de récupérer la base de documents.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [triggerAlert]);

  // Formattage de la taille des fichiers
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Traitement du changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // Limite augmentée à 15 Mo
        triggerAlert('Le fichier sélectionné dépasse la limite autorisée de 15 Mo.', 'error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file,
        fileName: file.name,
        fileSize: formatBytes(file.size)
      }));
    }
  };

  const removeSelectedFile = (e) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, file: null, fileName: '', fileSize: '' }));
  };

  // Envoi asynchrone du document
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      triggerAlert('Veuillez attacher un document avant de soumettre.', 'error');
      return;
    }
    if (!formData.title.trim()) {
      triggerAlert('Le titre du document est obligatoire.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('type', formData.type.trim());
      data.append('file', formData.file);

      const newDocument = await createDocument(data);
      setDocuments(prev => [newDocument, ...prev]);
      setFormData({ title: '', type: 'Rapport', file: null, fileName: '', fileSize: '' });
      setIsFormOpen(false);
      triggerAlert('Le document a été archivé et publié avec succès !', 'success');
    } catch (error) {
      console.error(error);
      triggerAlert(error.message || 'Une erreur est survenue lors du téléversement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDocuments(prev => prev.filter((doc) => doc.id !== id));
    triggerAlert('Le document a été retiré des archives.', 'success');
  };

  // Filtrage intelligent combiné (Mémoïsé)
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = 
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type?.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, filterType]);

  // Liste unique des types pour le sélecteur
  const uniqueTypes = useMemo(() => {
    const types = documents.map(doc => doc.type?.trim());
    return ['all', ...new Set(types.filter(Boolean))];
  }, [documents]);

  // Statistiques dynamiques pour les badges filtres
  const stats = useMemo(() => {
    return {
      all: documents.length,
      rapport: documents.filter(d => d.type?.toLowerCase().includes('rapport')).length,
      pv: documents.filter(d => d.type?.toLowerCase().includes('pv') || d.type?.toLowerCase().includes('procès')).length,
      autres: documents.filter(d => !d.type?.toLowerCase().includes('rapport') && !d.type?.toLowerCase().includes('pv')).length
    };
  }, [documents]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-emerald-700 selection:text-white">
      
      {/* Banner / En-tête Pro */}
      <section className="bg-gradient-to-br from-green-950 via-emerald-900 to-green-900 text-white py-12 px-4 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-7xl relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-block text-xs font-bold bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/20 mb-2 uppercase tracking-wider">
              Espace Documentaire
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Gestion des Documents</h1>
            <p className="text-green-100/80 text-sm mt-1 max-w-xl font-light">
              Consultez, recherchez et téléchargez l'ensemble des rapports techniques, PV d'Assemblées Générales et documents officiels de l'AIFASA 17.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FiPlus className="w-4 h-4" /> Ajouter un document
            </button>
          )}
        </div>
      </section>

      {/* Notifications Flashes de l'application */}
      <div className="fixed top-5 right-5 z-50 max-w-sm w-full px-4">
        <AnimatePresence>
          {alert.message && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
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

      {/* Cartes Filtres Statistiques Évoluées UI/UX */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'all', label: 'Tous les fichiers', value: stats.all, icon: FiFolder, style: 'border-l-gray-400 text-gray-700' },
            { id: 'rapport', label: 'Rapports Mandat', value: stats.rapport, icon: FiTrendingUp, style: 'border-l-emerald-500 text-emerald-700' },
            { id: 'pv', label: 'Procès-Verbaux', value: stats.pv, icon: FiFileText, style: 'border-l-blue-500 text-blue-700' },
            { id: 'autres', label: 'Autres Annexes', value: stats.autres, icon: FiPieChart, style: 'border-l-amber-500 text-amber-700' },
          ].map((block) => (
            <button
              key={block.id}
              onClick={() => setFilterType(block.id === 'autres' ? 'all' : block.id)} // Exemple logique de filtre rapide
              className={`bg-white rounded-xl shadow-sm p-4 text-left border-l-4 transition-all duration-300 hover:shadow-md ${
                filterType === block.id ? 'scale-[1.02] shadow-md ring-1 ring-black/5 font-bold' : 'opacity-90'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{block.label}</p>
                <block.icon className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-black text-gray-800 mt-2">{block.value}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Filtres de Recherche Textuelle & Sélecteurs */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, titre, type ou date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50/50 rounded-lg w-full focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm outline-none"
            />
          </div>
          
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 bg-white text-sm outline-none appearance-none cursor-pointer font-medium text-gray-700"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tous les types' : type.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Section Principale d'affichage des grilles */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent mb-3"></div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Indexation des métadonnées...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl border border-gray-100 max-w-lg mx-auto shadow-sm p-8"
          >
            <FiFileText className="mx-auto text-4xl text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-700">Aucun document référencé</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm || filterType !== 'all' 
                ? "Aucun résultat ne correspond à vos critères de recherche actuels."
                : "La bibliothèque numérique ne contient aucun fichier pour le moment."}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DocumentCard 
                  document={doc} 
                  onDelete={handleDelete} 
                  userRole={user?.role} 
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ======== MODAL COMPOSANT : AJOUT DE FICHIER (ADMIN) ======== */}
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
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <FiUpload className="w-4 h-4" />
                  <span className="text-base">Archiver un nouveau document</span>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><FiX className="w-5 h-5" /></button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre descriptif *</label>
                  <input
                    type="text"
                    placeholder="Ex: Procès Verbal AG Ebolowa - Juin 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Typologie du document</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white outline-none font-medium text-gray-700"
                  >
                    <option value="Rapport">Rapport d'activité / Technique</option>
                    <option value="PV">Procès-Verbal (PV)</option>
                    <option value="Certificat">Certificat / Attestation</option>
                    <option value="Statuts">Texte Fondateur / Statuts</option>
                    <option value="Finances">Bilan Financier</option>
                  </select>
                </div>

                {/* Zone interactive Drag and Drop / Selecteur */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fichier joint (PDF, Images, Excel - Max 15Mo) *</label>
                  
                  {!formData.file ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-6 bg-gray-50 cursor-pointer transition-colors duration-200 group">
                      <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                      <span className="text-xs font-bold text-gray-600">Parcourir ou glisser le fichier</span>
                      <span className="text-[10px] text-gray-400 mt-1">Fichiers bureautiques standards acceptés</span>
                      <input type="file" onChange={handleFileChange} className="hidden" required />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between border border-emerald-200 bg-emerald-50/40 p-3 rounded-lg">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FiFileText className="text-emerald-700 w-5 h-5 flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-800 truncate">{formData.fileName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{formData.fileSize}</p>
                        </div>
                      </div>
                      <button onClick={removeSelectedFile} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><FiX className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {/* Footer boutons d'action */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-40 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                        <span>Archivage en cours...</span>
                      </>
                    ) : (
                      <span>Uploader le document</span>
                    )}
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

export default Documents;