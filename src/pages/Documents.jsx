import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDocuments, createDocument } from '../services/documentService';
import DocumentCard from '../components/DocumentCard';
import { motion } from 'framer-motion';
import { FiUpload, FiSearch, FiFilter, FiFileText, FiPlus, FiX } from 'react-icons/fi';
import Modal from '../components/Modal'; // Assuming a Modal component exists

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({ 
    title: '', 
    type: '', 
    file: null,
    fileName: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrlToPreview, setPdfUrlToPreview] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
      setAlertMessage('Veuillez remplir tous les champs de texte.');
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
      setAlertMessage(`Échec de l'ajout du document: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setFileError('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      setFormData({
        ...formData,
        file,
        fileName: file.name
      });
      setFileError('');
    }
  };

  const handlePreview = (url) => {
    setPdfUrlToPreview(url);
    setShowPdfModal(true);
  };

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log(`Deleting document with ID: ${id}`);
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  // Memoized filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      {/* Titre principal avec animation */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold mb-8 text-emerald-800"
      >
        Gestion des Documents
      </motion.h1>

      {/* Formulaire d'ajout de document */}
      {user?.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <FiPlus className="mr-2 text-emerald-600" />
            Ajouter un Nouveau Document
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du document</label>
                <input
                  type="text"
                  placeholder="Ex: Rapport annuel 2023"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
                <input
                  type="text"
                  placeholder="Ex: Rapport, PV, Certificat"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier (PDF uniquement)</label>
                <label className={`block w-full border ${fileError ? 'border-red-500' : 'border-gray-200'} p-3 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}>
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${formData.fileName ? 'text-gray-800' : 'text-gray-500'}`}>
                      {formData.fileName || "Choisir un fichier"}
                    </span>
                    <FiUpload className="text-emerald-600" />
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf"
                    required
                  />
                </label>
                {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-md flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                'Ajouter Document'
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Barre de recherche et filtres */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 border border-gray-200 p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tous les types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Affichage des documents */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Chargement des documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl shadow border border-gray-100"
        >
          <FiFileText className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun document trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? "Essayez de modifier vos critères de recherche ou de filtre."
              : "Aucun document n'a été ajouté pour le moment."}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              variants={cardVariants}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DocumentCard 
                document={doc} 
                onDelete={handleDelete} 
                userRole={user?.role} 
                onPreview={handlePreview}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Modal pour la prévisualisation du PDF */}
      <Modal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
        title="Prévisualisation du Document"
        size="lg" // Utilisez une grande taille pour le PDF
      >
        <div className="h-[80vh]">
          {pdfUrlToPreview ? (
            <iframe 
              src={pdfUrlToPreview} 
              className="w-full h-full border-none"
              title="Aperçu du PDF"
            ></iframe>
          ) : (
            <p>Chargement du document...</p>
          )}
        </div>
      </Modal>

      {/* Modal d'alerte pour les messages */}
      {alertMessage && (
        <Modal 
          isOpen={!!alertMessage} 
          onClose={() => setAlertMessage('')} 
          title="Erreur" 
        >
          <p className="text-center text-red-600">{alertMessage}</p>
        </Modal>
      )}
    </div>
  );
};

export default Documents;
