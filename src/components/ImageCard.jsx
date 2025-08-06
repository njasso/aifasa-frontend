// src/components/ImageCard.jsx
import React from 'react';
import { deleteImage } from '../services/galleryService'; // Assurez-vous d'importer deleteImage ici

// Assurez-vous d'avoir une image par défaut si l'URL est cassée
const DEFAULT_FALLBACK_IMAGE = 'https://placehold.co/400x300/e0e0e0/000000?text=Image+Non+Disponible';

const ImageCard = ({ image, onDelete, onImageClick, userRole }) => {
  const handleDeleteClick = async (e) => {
    // Empêcher la propagation de l'événement pour ne pas déclencher onImageClick
    e.stopPropagation(); 
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'image "${image.title}" ?`)) {
      try {
        await deleteImage(image.id);
        onDelete(image.id); // Appelle la fonction de suppression du parent (Gallery.jsx)
        alert('Image supprimée avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
        alert('Échec de la suppression de l\'image. Veuillez vérifier la console.');
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden cursor-pointer" 
        onClick={() => onImageClick(image)} // Appel de la fonction onImageClick passée en prop
      >
        <img
          src={image.image_url}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_IMAGE; }}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-1">{image.title}</h3>
          <p className="text-gray-600 text-sm mb-2">Catégorie: {image.category || 'Non spécifiée'}</p>
        </div>
        {userRole === 'admin' && (
          <div className="mt-auto flex justify-end">
            <button
              onClick={handleDeleteClick}
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

export default ImageCard;
