import React from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteDocument } from '../services/documentService';

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
    <div className="border rounded-lg p-4 shadow-md bg-white"> {/* Ajout de bg-white pour la carte */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{document.title}</h3> {/* Couleurs texte */}
      <p className="text-gray-600 text-sm mb-3">Type: {document.type}</p>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <a 
          href={document.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          download={suggestedFileName} // <-- AJOUT DE L'ATTRIBUT download
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-300 text-center text-sm font-medium flex-grow"
        >
          Télécharger
        </a>

        {user?.role === 'admin' && (
          <button 
            onClick={handleDelete} 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-center text-sm font-medium flex-grow"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
