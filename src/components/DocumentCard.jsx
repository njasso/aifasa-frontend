import React from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteDocument } from '../services/documentService';
import { FiFile, FiDownload, FiTrash } from 'react-icons/fi';

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
          download
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 text-center text-sm font-medium flex-grow flex items-center justify-center gap-2"
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
