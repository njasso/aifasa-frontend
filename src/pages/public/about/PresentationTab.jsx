// src/pages/public/about/PresentationTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiGlobe, FiCalendar } from 'react-icons/fi';
import { strategicAxes, galleryImages, historyEvents } from './aboutData';

const PresentationTab = () => (
  <motion.div
    key="presentation"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.4 }}
    className="space-y-8"
  >
    {/* Présentation Générale */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-green-900 mb-4">Notre Identité</h2>
      <p className="text-gray-700 leading-relaxed text-lg">
        L'Association des Ingénieurs Agronomes et Forestiers de la 17ème promotion de la FASA (AIFASA 17) 
        est une organisation apolitique et à but non lucratif. Elle est le creuset de l'excellence collective, 
        conçue pour catalyser le développement socio-économique de ses membres à travers des synergies innovantes.
      </p>
    </div>

    {/* Feuille de Route Stratégique */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <FiStar className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-900">Feuille de Route Stratégique</h3>
          <p className="text-sm text-gray-500">Adoptée lors de l'Assemblée Générale - Juin 2026, EBOLOWA</p>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategicAxes.map((axis) => (
          <motion.div
            key={axis.id}
            whileHover={{ y: -3 }}
            className={`bg-gray-50 rounded-xl p-5 border-l-4 ${axis.color} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 rounded-full">
                Axe {axis.id}
              </span>
              <axis.icon className="w-4 h-4 text-green-700" />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">{axis.title}</h4>
            <p className="text-gray-600 text-xs leading-relaxed">{axis.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Galerie */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
        <FiGlobe className="text-emerald-600" /> L'Association en Actions
      </h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {galleryImages.map((img, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="relative rounded-xl overflow-hidden shadow-md group h-48 cursor-pointer"
          >
            <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity"></div>
            <p className="absolute bottom-3 left-3 right-3 text-xs text-white font-medium">{img.caption}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Historique */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-green-900 mb-8 flex items-center gap-2">
        <FiCalendar className="text-green-700" /> Notre Trajectoire
      </h2>
      <div className="relative border-l-2 border-green-200 ml-4 md:ml-6 space-y-8">
        {historyEvents.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8"
          >
            <div className="absolute -left-[11px] top-1 w-5 h-5 bg-green-600 border-4 border-white rounded-full shadow-md"></div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full mb-2">{event.year}</span>
              <p className="text-gray-700 font-medium">{event.event}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>

);

export default PresentationTab;
