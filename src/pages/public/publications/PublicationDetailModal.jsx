// src/pages/public/publications/PublicationDetailModal.jsx
// Modale de consultation détaillée d'une publication, extraite de Publications.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiTag, FiDownload, FiLink } from 'react-icons/fi';

const PublicationDetailModal = ({ isOpen, publication, onClose }) => (
  <AnimatePresence>
    {isOpen && publication && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-3 py-1.5 rounded-full">
              Détails de la publication
            </span>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            {publication.image_url && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={publication.image_url} 
                  alt="" 
                  className="w-full h-64 object-cover" 
                />
              </div>
            )}
            <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
              {publication.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                <FiCalendar className="w-3 h-3" />
                {new Date(publication.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {publication.category && (
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  <FiTag className="w-3 h-3" />
                  {publication.category}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {publication.content}
            </div>
            
            {publication.documents?.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  📎 Documents joints
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {publication.documents.map((doc, idx) => (
                    <a 
                      key={idx} 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-50 p-3 rounded-xl border border-emerald-100/50 transition-all hover:shadow-md"
                    >
                      <FiDownload className="flex-shrink-0 w-4 h-4" />
                      <span className="truncate">{doc.name || `Document_${idx + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {publication.external_links?.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  🔗 Ressources & Liens web
                </h4>
                <div className="space-y-1.5">
                  {publication.external_links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50/60 hover:bg-blue-50 p-3 rounded-xl border border-blue-100/30 transition-all hover:shadow-md"
                    >
                      <FiLink className="flex-shrink-0 w-4 h-4" />
                      {link.label || link.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PublicationDetailModal;
