// src/pages/public/publications/PublicationCard.jsx
// Carte d'affichage d'une publication, extraite de Publications.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiTag, FiArrowRight, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PublicationCard = ({ pub, index, isAdmin, onView, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
  >
    <div>
      {pub.image_url ? (
        <div className="h-48 overflow-hidden relative bg-gradient-to-br from-green-100 to-emerald-100">
          <img 
            src={pub.image_url} 
            alt={pub.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
              {pub.type}
            </span>
            {pub.status === 'draft' && (
              <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">Brouillon</span>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {new Date(pub.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-green-500"></div>
      )}
      <div className="p-5 pb-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
          {pub.category && (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
              <FiTag className="w-3 h-3" />
              {pub.category}
            </span>
          )}
          {!pub.image_url && (
            <span className="flex items-center gap-1 text-gray-400">
              <FiCalendar className="w-3 h-3" />
              {new Date(pub.created_at).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-800 text-base line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {pub.title}
        </h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
          {pub.content?.substring(0, 150)}...
        </p>
      </div>
    </div>
    <div className="p-5 pt-3 border-t border-gray-100/50 flex items-center justify-between">
      <button 
        onClick={() => onView(pub)} 
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-1 group/btn"
      >
        Consulter le document 
        <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
      </button>
      {isAdmin && (
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(pub)} 
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(pub.id)} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  </motion.div>
);

export default PublicationCard;
