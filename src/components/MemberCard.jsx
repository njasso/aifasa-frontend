import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiFileText, FiMapPin, FiPhone, FiUser, FiBriefcase, FiLayers, FiCheckCircle } from 'react-icons/fi';

const MemberCard = ({ member, onDelete, onEdit, userRole }) => {
  // Utilisation de la propriété 'photo_url' et d'un fallback pour la photo de profil
  const profilePictureUrl = member.photo_url || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=10b981&color=fff&bold=true`;
  const isAdmin = userRole === 'admin';

  // Fonction pour extraire le nom de fichier suggéré pour le CV
  const getSuggestedCvFileName = (url, memberName) => {
    try {
      const parts = url.split('.');
      const extension = parts.length > 1 ? parts.pop() : 'pdf';
      const safeName = memberName.replace(/[^a-z0-9]/gi, '_');
      return `cv_${safeName}.${extension}`;
    } catch (e) {
      return `cv_${memberName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    }
  };

  const suggestedFileName = member.cv_url
    ? getSuggestedCvFileName(member.cv_url, `${member.first_name}_${member.last_name}`)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
    >
      <div className="relative">
        <img
          src={profilePictureUrl}
          alt={`${member.first_name} ${member.last_name}`}
          className="w-full h-48 object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=10b981&color=fff&bold=true`;
          }}
        />
        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
          {member.role}
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
          {member.first_name} {member.last_name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{member.profession}</p>

        <div className="space-y-2 text-gray-700 text-sm flex-grow">
          {member.location && (
            <p className="flex items-center">
              <FiMapPin className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.location}
            </p>
          )}
          {member.address && (
            <p className="flex items-center">
              <FiMapPin className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.address}
            </p>
          )}
          {member.contact && (
            <p className="flex items-center">
              <FiPhone className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.contact}
            </p>
          )}
          {member.sex && (
            <p className="flex items-center">
              <FiUser className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.sex}
            </p>
          )}
          {member.employment_structure && (
            <p className="flex items-center">
              <FiBriefcase className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.employment_structure}
            </p>
          )}
          {member.company_or_project && (
            <p className="flex items-center">
              <FiLayers className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.company_or_project}
            </p>
          )}
          {member.activities && (
            <p className="flex items-center">
              <FiCheckCircle className="mr-2 text-emerald-500 flex-shrink-0" />
              {member.activities}
            </p>
          )}
        </div>

        {/* Section des boutons d'action */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
            {/* Bouton pour télécharger le CV, visible uniquement si le CV existe */}
            {member.cv_url && (
              <a
                href={member.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                download={suggestedFileName}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                title="Télécharger le CV"
              >
                <FiFileText />
              </a>
            )}
            {/* Bouton d'édition */}
            <button
              onClick={() => onEdit(member)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Modifier"
            >
              <FiEdit2 />
            </button>
            {/* Bouton de suppression */}
            <button
              onClick={() => onDelete(member.id)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Supprimer"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MemberCard;
