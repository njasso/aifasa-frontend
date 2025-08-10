import React from 'react';
import { motion } from 'framer-motion';
import {
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiLayers,
  FiCheckCircle,
  FiDownload,
} from 'react-icons/fi';

const MemberCard = ({ member, onDelete, onEdit, userRole }) => {
  // Utilisation de la propriété 'photo_url' et d'un fallback pour la photo de profil
  const profilePictureUrl =
    member.photo_url ||
    `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&background=10b981&color=fff&bold=true`;
  const isAdmin = userRole === 'admin';

  // Fonction pour extraire le nom de fichier suggéré pour le CV
  const getSuggestedCvFileName = (url, memberName) => {
    try {
      // Si l'URL contient déjà un nom de fichier valide
      if (url.includes('/')) {
        const filename = url.split('/').pop();
        if (filename.includes('.')) return filename;
      }
      
      // Sinon générer un nom basé sur le membre
      const safeName = memberName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      return `cv_${safeName}.pdf`;
    } catch (e) {
      return `cv_${memberName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    }
  };

  const suggestedFileName = member.cv_url
    ? getSuggestedCvFileName(member.cv_url, `${member.first_name}_${member.last_name}`)
    : '';

  // Vérifie si le CV est un PDF (pour déterminer s'il peut être affiché en iframe)
  const isPdf = member.cv_url?.toLowerCase().endsWith('.pdf');

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

        {/* Section CV */}
        {member.cv_url && (
          <div className="mt-4 border rounded p-2 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <FiFileText className="mr-2" />
                Curriculum Vitae
              </h4>
              <a
                href={member.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                download={suggestedFileName}
                className="text-sm text-emerald-600 hover:underline flex items-center"
                title="Télécharger le CV"
              >
                <FiDownload className="mr-1" />
                Télécharger
              </a>
            </div>
            
            {isPdf ? (
              <iframe
                src={member.cv_url}
                title={`CV de ${member.first_name} ${member.last_name}`}
                width="100%"
                height="300"
                className="rounded border"
                style={{ backgroundColor: '#f9fafb' }}
              />
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                <FiFileText className="mx-auto text-2xl mb-2" />
                <p>Aperçu non disponible</p>
                <p className="text-xs mt-1">Le format du CV ne permet pas l'affichage direct</p>
              </div>
            )}
          </div>
        )}

        {/* Section des boutons d'action */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
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
