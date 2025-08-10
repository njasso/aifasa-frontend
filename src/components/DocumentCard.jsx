import React from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteDocument } from '../services/documentService';
import { FiFile, FiDownload, FiTrash } from 'react-icons/fi';

const DocumentCard = ({ document, onDelete }) => {
  const { user } = useAuth();

  // Suppression du document
  const handleDelete = async () => {
    if (!document?.id) {
      alert('Document introuvable.');
      return;
    }

    if (window.confirm('Voulez-vous supprimer ce document ?')) {
      try {
        await deleteDocument(document.id);
        onDelete(document.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du document.');
      }
    }
  };

  // Extraction de l'extension de fichier
  const getFileExtension = (url) => {
    if (!url) return 'pdf';
    try {
      const cleanUrl = url.split('?')[0]; // Supprime les paramètres de requête
      const parts = cleanUrl.split('.');
      return parts.length > 1 ? parts.pop().toLowerCase() : 'pdf';
    } catch {
      return 'pdf';
    }
  };

  // Nom suggéré pour le téléchargement
  const suggestedFileName = document?.title
    ? `${document.title.replace(/[^a-z0-9]/gi, '_')}.${getFileExtension(document?.file_url)}`
    : `document.${getFileExtension(document?.file_url)}`;

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
      {/* En-tête du document */}
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-gray-100 mr-3">
          <FiFile className="text-gray-500 text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {document?.title || 'Document sans titre'}
          </h3>
          <p className="text-gray-600 text-sm">
            Type : {document?.type || 'Inconnu'}
          </p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Bouton Télécharger */}
        <a
          href={document?.file_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          download={suggestedFileName}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-300 text-center text-sm font-medium flex-grow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Télécharger le document ${document?.title || ''}`}
        >
          <FiDownload />
          Télécharger
        </a>

        {/* Bouton Supprimer (visible uniquement pour l'admin) */}
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-center text-sm font-medium flex-grow flex items-center justify-center gap-2"
            aria-label={`Supprimer le document ${document?.title || ''}`}
          >
            <FiTrash />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
