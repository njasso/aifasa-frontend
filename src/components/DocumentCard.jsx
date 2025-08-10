import React from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteDocument } from '../services/documentService';
import { FiFile, FiDownload, FiTrash } from 'react-icons/fi'; // Add FiFile, FiDownload, FiTrash

const DocumentCard = ({ document, onDelete }) => {
  const { user } = useAuth();

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous supprimer ce document ?')) {
      try {
        await deleteDocument(document.id);
        onDelete(document.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du document.'); // Afficher une alerte en cas d'échec
      }
    }
  };

  // Fonction pour extraire l'extension du fichier
  const getFileExtension = (url) => {
    try {
      const parts = url.split('.');
      return parts.length > 1 ? parts.pop() : 'pdf'; // Supposons pdf par défaut si pas d'extension
    } catch (e) {
      return 'pdf'; // Gestion d'erreur au cas où l'URL n'est pas conforme
    }
  };

  const suggestedFileName = `${document.title.replace(/[^a-z0-9]/gi, '_')}.${getFileExtension(document.file_url)}`;

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-gray-100 mr-3">
          <FiFile className="text-gray-500 text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{document.title}</h3>
          <p className="text-gray-600 text-sm">Type: {document.type}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <a 
          href={document.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          download={suggestedFileName} // <-- AJOUT DE L'ATTRIBUT download
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-300 text-center text-sm font-medium flex-grow flex items-center justify-center gap-2"
        >
          <FiDownload />
          Télécharger
        </a>

        {user?.role === 'admin' && (
          <button 
            onClick={handleDelete} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-center text-sm font-medium flex-grow flex items-center justify-center gap-2"
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
