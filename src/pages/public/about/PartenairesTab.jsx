// src/pages/public/about/PartenairesTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiMail } from 'react-icons/fi';
import { partners } from './aboutData';

const PartenairesTab = () => (
  <motion.div
    key="partenaires"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-green-900 mb-1">Nos Partenaires</h2>
      <p className="text-gray-500 mb-8 text-sm">Ils nous accompagnent dans la réalisation de nos missions</p>
      
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {partners.map((partner, index) => (
          <motion.a
            key={index}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center hover:shadow-lg transition-all duration-300 hover:bg-white group cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 flex items-center justify-center mb-4 p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <img 
                src={partner.logo} 
                alt={`Logo ${partner.name}`}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default_profile.png';
                }}
              />
            </div>
            <p className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
              {partner.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{partner.sector}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FiExternalLink className="w-3 h-3" />
              <span>Visiter le site</span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center">
        <h3 className="text-lg font-bold text-green-900 mb-2">Devenir Partenaire</h3>
        <p className="text-sm text-gray-600 mb-4">
          Vous souhaitez collaborer avec l'AIFASA 17 ? Contactez-nous pour explorer les possibilités de partenariat.
        </p>
        <a 
          href="mailto:association@aifasa17.org"
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <FiMail className="w-4 h-4" />
          Nous contacter
        </a>
      </div>
    </div>
  </motion.div>

);

export default PartenairesTab;
