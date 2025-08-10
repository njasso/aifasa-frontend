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
        alert('Erreur lors de la suppression du document.');
      }
    }
  };

  const getFileExtension = (url) => {
    try {
      const parts = url.split('.');
      return parts.length > 1 ? parts.pop().split(/\#|\?/)[0] : 'pdf';
    } catch {
      return 'pdf';
    }
  };

  const suggestedFileName = `${document.title.replace(/[^a-z0-9]/gi, '_')}.${getFileExtension(document.file_url)}`;

  // Fonction pour forcer le téléchargement via fetch + blob
  const handleDownload = async () => {
    try {
      const response = await fetch(document.file_url);
      if (!response.ok) throw new Error('Erreur lors du téléchargement du fichier');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = suggestedFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Impossible de télécharger le fichier directement. Le fichier s\'ouvrira dans un nouvel onglet.');
      // Fallback : ouvrir dans un nouvel onglet
      window.open(document.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{document.title}</h3>
      <p className="text-gray-600 text-sm mb-3">Type: {document.type}</p>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <button
          onClick={handleDownload}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-300 text-center text-sm font-medium flex-grow"
        >
          Télécharger
        </button>

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
