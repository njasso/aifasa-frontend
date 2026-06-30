// src/pages/public/about/BureauTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { executiveBoard } from './aboutData';

const BureauTab = () => (
  <motion.div
    key="bureau"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-green-900 mb-1">Bureau Exécutif</h2>
      <p className="text-gray-500 mb-8 text-sm">L'équipe dirigeante de l'AIFASA 17</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {executiveBoard.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-100 shadow-md mb-3">
                <img 
                  src={member.photo} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default_profile.png';
                  }}
                />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
              <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full mt-1">
                {member.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>

);

export default BureauTab;
