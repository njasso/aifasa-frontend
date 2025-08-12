import React, { useState } from 'react';
import { deleteImage } from '../services/galleryService'; // Assurez-vous d'importer deleteImage ici
import { Trash2 } from 'lucide-react'; // Utilisation d'une icône pour la suppression

// Une image par défaut si l'URL est cassée
const DEFAULT_FALLBACK_IMAGE = 'https://placehold.co/400x300/e0e0e0/000000?text=Media+Non+Disponible';

const ImageCard = ({ media, onDelete, onImageClick, userRole }) => {
  // Renommé "image" en "media" pour être plus générique (image ou vidéo)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState('');

  // Fonction utilitaire pour déterminer si l'URL est une vidéo
  const isVideo = (url) => {
    return url && /\.(mp4|webm|ogg)$/i.test(url);
  };

  const handleDeleteClick = async (e) => {
    // Empêcher la propagation de l'événement pour ne pas déclencher onImageClick
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      await deleteImage(media.id);
      onDelete(media.id); // Appelle la fonction de suppression du parent (Gallery.jsx)
      setMessage('Image supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      setMessage('Échec de la suppression de l\'image. Veuillez vérifier la console.');
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
  };

  const closeMessage = () => {
    setMessage('');
  };

  return (
    <div className="relative bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Conteneur pour le média (image ou vidéo) */}
      <div
        className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden cursor-pointer flex items-center justify-center bg-gray-100"
        onClick={() => onImageClick(media)}
      >
        {isVideo(media.image_url) ? (
          <video
            src={media.image_url}
            title={media.title}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            controls
            autoPlay
            loop
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE; }}
          />
        ) : (
          <img
            src={media.image_url}
            alt={media.title}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE; }}
          />
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-1">{media.title}</h3>
          <p className="text-gray-600 text-sm mb-2">Catégorie: {media.category || 'Non spécifiée'}</p>
        </div>
        {userRole === 'admin' && (
          <div className="mt-auto flex justify-end">
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
              aria-label="Supprimer l'image"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h4 className="text-xl font-bold mb-4 text-gray-800">Confirmer la suppression</h4>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'image "<span className="font-semibold">{media.title}</span>" ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message de notification */}
      {message && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <p className="text-gray-800 font-semibold mb-4">{message}</p>
            <button
              onClick={closeMessage}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
