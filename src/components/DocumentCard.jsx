import React from 'react';
import { FiFileText, FiTrash2 } from 'react-icons/fi';

const DocumentCard = ({ document, onDelete, userRole }) => {
  // Format date en français (exemple)
  const formattedDate = new Date(document.createdAt || document.date || Date.now())
    .toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      {/* Icône et type */}
      <div className="flex items-center space-x-3 mb-4">
        <FiFileText className="text-emerald-600 w-8 h-8" />
        <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{document.type}</span>
      </div>

      {/* Titre */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={document.title}>
        {document.title}
      </h3>

      {/* Date */}
      <p className="text-sm text-gray-500 mb-4">Ajouté le {formattedDate}</p>

      {/* Bouton supprimer (visible uniquement admin) */}
      {userRole === 'admin' && (
        <button
          onClick={() => onDelete(document.id)}
          className="self-start text-red-600 hover:text-red-700 flex items-center space-x-1 font-semibold"
          aria-label={`Supprimer le document ${document.title}`}
          type="button"
        >
          <FiTrash2 />
          <span>Supprimer</span>
        </button>
      )}
    </div>
  );
};

export default DocumentCard;
