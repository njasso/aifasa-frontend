// src/components/MemberCard.jsx
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
  FiMail,
  FiUserCheck
} from 'react-icons/fi';

// ✅ Helper pour optimiser les images Cloudinary
const getOptimizedImageUrl = (url, width = 400, height = 400) => {
  if (!url) return null;
  if (!url.includes('cloudinary')) return url;
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto/`);
};

const MemberCard = ({ member, onDelete, onEdit, userRole }) => {
  const firstName = member.first_name || '';
  const lastName = member.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  const profilePictureUrl = getOptimizedImageUrl(member.photo_url, 400, 400) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=10b981&color=fff&bold=true`;

  const isAdmin = userRole === 'admin';

  const getSuggestedCvFileName = (url) => {
    try {
      if (url && url.includes('/')) {
        const filename = url.split('/').pop();
        if (filename && filename.includes('.')) return filename;
      }
      const safeName = fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      return `cv_${safeName}.pdf`;
    } catch (e) {
      const safeName = fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      return `cv_${safeName}.pdf`;
    }
  };

  const suggestedFileName = member.cv_url ? getSuggestedCvFileName(member.cv_url) : '';

  const roleDisplay = member.role || 'Membre';
  const isBureau = roleDisplay === 'Bureau Exécutif';

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
          alt={fullName}
          className="w-full h-48 object-cover object-center"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=10b981&color=fff&bold=true`;
          }}
        />
        <div className={`absolute top-3 right-3 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md ${isBureau ? 'bg-purple-600' : 'bg-emerald-500'}`}>
          {isBureau ? 'Bureau' : roleDisplay}
        </div>
        {isBureau && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            ⭐ Bureau
          </div>
        )}
      </div>
      
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            {fullName}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{member.profession || 'Ingénieur'}</p>

          <div className="space-y-2 text-gray-700 text-sm mb-4">
            {member.location && (
              <p className="flex items-center">
                <FiMapPin className="mr-2 text-emerald-500 flex-shrink-0" />
                {member.location}
              </p>
            )}
            {member.contact && (
              <p className="flex items-center">
                <FiMail className="mr-2 text-emerald-500 flex-shrink-0" />
                {member.contact}
              </p>
            )}
            {member.phone_number && (
              <p className="flex items-center">
                <FiPhone className="mr-2 text-emerald-500 flex-shrink-0" />
                {member.phone_number}
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
        </div>

        <div>
          {member.cv_url && (
            <div className="mt-2 border border-gray-100 rounded-lg p-3 bg-gray-50/70 flex items-center justify-between">
              <div className="flex items-center text-gray-700 text-sm">
                <FiFileText className="mr-2 text-gray-400 w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]">Curriculum Vitae</span>
              </div>
              <a
                href={member.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                download={suggestedFileName}
                className="text-xs bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-emerald-600 font-bold px-3 py-1.5 rounded-md inline-flex items-center gap-1 transition-all"
                title="Consulter / Télécharger le CV"
              >
                <FiDownload className="w-3 h-3" />
                Ouvrir
              </a>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => onEdit(member)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-100"
                title="Modifier"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(member.id)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-100"
                title="Supprimer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MemberCard;