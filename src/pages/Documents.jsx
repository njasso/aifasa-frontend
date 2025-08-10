import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDocuments, createDocument } from '../services/documentService';
import { motion } from 'framer-motion';
import { FiUpload, FiSearch, FiFilter, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({ title: '', type: '', file: null, fileName: '' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Animations
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError('');

    if (!formData.file) {
      setFileError('Veuillez sélectionner un fichier');
      return;
    }

    if (formData.file.type !== 'application/pdf') {
      setFileError('Seuls les fichiers PDF sont acceptés.');
      return;
    }

    if (!formData.title.trim() || !formData.type.trim()) {
      setAlertMessage('Veuillez remplir tous les champs.');
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
      setFormData({ title: '', type: '', file: null, fileName: '' });
      e.target.reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      setAlertMessage(`Échec: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFileError('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      setFormData({ ...formData, file, fileName: file.name });
      setFileError('');
    }
  };

  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  // Documents filtrés
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, filterType]);

  const uniqueTypes = useMemo(() => {
    return ['all', ...new Set(documents.map(doc => doc.type.toLowerCase()))];
  }, [documents]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Titre */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-emerald-800"
      >
        Gestion des Documents
      </motion.h1>

      {/* Formulaire d'ajout */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <FiPlus className="mr-2 text-emerald-600" /> Ajouter un Document
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fichier (PDF)</label>
                <label className={`block w-full border ${fileError ? 'border-red-500' : 'border-gray-200'} p-3 rounded-lg cursor-pointer`}>
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${formData.fileName ? 'text-gray-800' : 'text-gray-500'}`}>
                      {formData.fileName || "Choisir un fichier"}
                    </span>
                    <FiUpload className="text-emerald-600" />
                  </div>
                  <input type="file" onChange={handleFileChange} className="hidden" accept="application/pdf" required />
                </label>
                {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? "Envoi en cours..." : "Ajouter Document"}
            </button>
          </form>
        </motion.div>
      )}

      {/* Barre recherche & filtre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100 sticky top-0 z-10"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tous les types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500">{filteredDocuments.length} résultat(s)</span>
        </div>
      </motion.div>

      {/* Liste documents */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-xl shadow border border-gray-100">
          <FiFileText className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun document trouvé</h3>
          {user?.role === 'admin' && (
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
              Ajouter un document
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              variants={cardVariants}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col h-full bg-white rounded-lg shadow hover:shadow-lg border border-gray-100"
            >
              <div className="flex-1 p-4">
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded mb-3">
                  <FiFileText className="text-emerald-600 text-5xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 truncate">{doc.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{doc.type}</p>
              </div>
              <div className="flex items-center justify-between p-3 border-t border-gray-100">
                <a
                  href={doc.fileUrl}
                  download
                  className="text-emerald-600 hover:text-emerald-800 flex items-center"
                >
                  <FiUpload className="mr-1" /> Télécharger
                </a>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                  >
                    <FiTrash2 className="mr-1" /> Supprimer
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal alerte */}
      {alertMessage && (
        <Modal isOpen={!!alertMessage} onClose={() => setAlertMessage('')} title="Erreur">
          <p className="text-center text-red-600">{alertMessage}</p>
        </Modal>
      )}
    </div>
  );
};

export default Documents;
