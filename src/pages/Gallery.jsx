import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMedia, createMedia, deleteMedia } from '../services/galleryService';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUpload, FiImage, FiPlayCircle } from 'react-icons/fi';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-auto"
    >
      <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const MessageBox = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-auto"
    >
      <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          OK
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

const Gallery = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    file: null,
    fileName: '',
    fileType: '',
  });
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileError, setFileError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const data = await getMedia();
        setMedia(data);
      } catch (error) {
        console.error('Erreur lors du chargement des médias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError('');

    if (!formData.file) {
      setFileError('Veuillez sélectionner une image ou une vidéo.');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category.trim());
      data.append('file', formData.file);

      const newMedia = await createMedia(data);
      setMedia([newMedia, ...media]);
      setFormData({ title: '', category: '', file: null, fileName: '', fileType: '' });
      e.target.reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du média:', error);
      setMessage(`Échec de l'ajout du média: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setFileError('Le fichier ne doit pas dépasser 50MB');
        return;
      }
      setFormData({
        ...formData,
        file: file,
        fileName: file.name,
        fileType: file.type
      });
      setFileError('');
    }
  };

  const handleDelete = (id) => {
    setMediaToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMedia(mediaToDelete);
      setMedia(media.filter((item) => item.id !== mediaToDelete));
      setShowConfirmModal(false);
      setMediaToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du média:', error);
      setMessage(`Échec de la suppression du média: ${error.message || 'Erreur inconnue'}`);
      setShowConfirmModal(false);
      setMediaToDelete(null);
    }
  };

  const handleMediaClick = (item) => {
    setSelectedMedia(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMedia(null), 300);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-900">
            Galerie Média
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Découvrez nos moments forts et nos réalisations en images et vidéos
        </p>
      </motion.div>

      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FiUpload className="mr-2 text-green-600" />
            Ajouter un Média
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Événement, Projet, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier Média*</label>
              <label className={`block w-full border ${fileError ? 'border-red-500' : 'border-gray-300'} rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}>
                <div className="flex items-center justify-between p-3">
                  <span className={`truncate ${formData.fileName ? 'text-gray-800' : 'text-gray-500'}`}>
                    {formData.fileName || "Sélectionner une image ou une vidéo"}
                  </span>
                  <FiUpload className="text-green-600" />
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                  accept="image/*,video/*"
                />
              </label>
              {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
              <p className="mt-1 text-xs text-gray-500">Formats acceptés : Images (JPG, PNG), Vidéos (MP4, WEBM) - max 50MB</p>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-md"
            >
              Publier le Média
            </button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : media.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl shadow border border-gray-100"
        >
          <FiImage className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Galerie vide</h3>
          <p className="text-gray-500">
            {user?.role === 'admin'
              ? "Commencez par ajouter des images ou des vidéos."
              : "Aucun média n'a été publié pour le moment."}
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
          {media.map((item) => (
            <motion.div
              key={item.id}
              variants={slideUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleMediaClick(item)}
              >
                {/* Nouvelle version du conteneur image/vidéo */}
                <div className="relative h-64 bg-gray-100 flex items-center justify-center">
                  {item.file_type.startsWith('video') ? (
                    <>
                      <video
                        src={item.file_url}
                        className="max-h-full max-w-full object-contain"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white">
                        <FiPlayCircle size={60} />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
                  {item.category && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {item.category}
                    </span>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="mt-2 text-sm text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <>
        <AnimatePresence>
          {isModalOpen && selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">{selectedMedia.title}</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-full max-h-full"
                  >
                    {selectedMedia.file_type.startsWith('video') ? (
                      <video
                        src={selectedMedia.file_url}
                        controls
                        autoPlay
                        className="max-w-full max-h-[70vh] rounded"
                      />
                    ) : (
                      <img
                        src={selectedMedia.file_url}
                        alt={selectedMedia.title}
                        className="max-w-full max-h-[70vh] object-contain rounded"
                      />
                    )}
                  </motion.div>
                </div>

                {selectedMedia.category && (
                  <div className="p-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Catégorie:</span> {selectedMedia.category}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirmModal && (
            <ConfirmationModal
              message="Êtes-vous sûr de vouloir supprimer ce média ?"
              onConfirm={confirmDelete}
              onCancel={() => setShowConfirmModal(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {message && (
            <MessageBox
              message={message}
              onClose={() => setMessage('')}
            />
          )}
        </AnimatePresence>
      </>
    </div>
  );
};

export default Gallery;
