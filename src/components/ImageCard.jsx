import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage } from 'react-icons/fi';

// Assurez-vous d'avoir une image par défaut si l'URL est cassée
const DEFAULT_FALLBACK_IMAGE = 'https://placehold.co/400x300/e0e0e0/000000?text=Image+Non+Disponible';

/**
 * Composant de carte d'image pour afficher une image de la galerie.
 * Gère l'affichage, l'ouverture de la modale et la demande de suppression.
 */
const ImageCard = ({ image, onImageClick, onDeleteRequest, userRole }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div
        className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden cursor-pointer p-2 flex items-center justify-center bg-gray-100"
        onClick={() => onImageClick(image)}
      >
        {/* MODIFICATION CLÉ : 'object-contain' pour afficher l'image entière */}
        <img
          src={image.image_url}
          alt={image.title}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-1">{image.title}</h3>
          <p className="text-gray-600 text-sm mb-2">Catégorie: {image.category || 'Non spécifiée'}</p>
        </div>
        {userRole === 'admin' && (
          <div className="mt-auto flex justify-end">
            {/* Appel de la fonction de demande de suppression du parent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(image.id);
              }}
              className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors shadow-md"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Modale de confirmation personnalisée pour remplacer window.confirm
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

// Composant de modale de visualisation pour afficher l'image en grand
const ImageViewerModal = ({ image, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">{image.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
        >
          <FiX size={24} />
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
        <img
          src={image.image_url}
          alt={image.title}
          className="max-w-full max-h-[70vh] object-contain rounded"
        />
      </div>
    </motion.div>
  </motion.div>
);

// Composant parent simulant la logique de la galerie
const Gallery = () => {
  const [images, setImages] = useState([
    { id: '1', title: 'Vue de la ville', category: 'Urbain', image_url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=500&auto=format' },
    { id: '2', title: 'Nature en couleurs', category: 'Paysage', image_url: 'https://images.unsplash.com/photo-1510784722466-f1873099950d?w=500&auto=format' },
    { id: '3', title: 'Projet A', category: 'Projet', image_url: 'https://images.unsplash.com/photo-1502691456104-e53b4b5742fe?w=500&auto=format' },
    { id: '4', title: 'Photo de l\'équipe', category: 'Événement', image_url: 'https://images.unsplash.com/photo-1541089901412-f04b1263d95c?w=500&auto=format' },
  ]);
  const [userRole, setUserRole] = useState('admin');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [imageIdToDelete, setImageIdToDelete] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleDeleteRequest = (id) => {
    setImageIdToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    setImages(images.filter(img => img.id !== imageIdToDelete));
    setShowConfirmModal(false);
    setImageIdToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setImageIdToDelete(null);
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Galerie de Photos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onImageClick={openImageModal}
            onDeleteRequest={handleDeleteRequest}
            userRole={userRole}
          />
        ))}
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            message={`Êtes-vous sûr de vouloir supprimer cette image ?`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <ImageViewerModal
            image={selectedImage}
            onClose={closeImageModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
