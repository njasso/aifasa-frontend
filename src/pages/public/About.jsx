// src/pages/public/About.jsx
// Page restructurée : les données et le contenu de chaque onglet ont été
// extraits dans src/pages/public/about/ pour rendre ce fichier lisible et
// maintenable (auparavant ~970 lignes dans un seul composant).
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiAward, FiUserCheck, FiBriefcase, FiLink, FiMail } from 'react-icons/fi';

import { stats } from './about/aboutData';
import PresentationTab from './about/PresentationTab';
import ExpertiseTab from './about/ExpertiseTab';
import BureauTab from './about/BureauTab';
import OrganisationTab from './about/OrganisationTab';
import PartenairesTab from './about/PartenairesTab';
import ContactTab from './about/ContactTab';

const TABS = [
  { id: 'presentation', label: 'Présentation', icon: FiTarget },
  { id: 'expertise', label: 'Expertises', icon: FiAward },
  { id: 'bureau', label: 'Bureau', icon: FiUserCheck },
  { id: 'organisation', label: 'Gouvernance', icon: FiBriefcase },
  { id: 'partenaires', label: 'Partenaires', icon: FiLink },
  { id: 'contact', label: 'Contact', icon: FiMail },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const About = () => {
  const [activeTab, setActiveTab] = useState('presentation');
  const [expandedCommission, setExpandedCommission] = useState(null);

  const toggleCommission = (id) => {
    setExpandedCommission(expandedCommission === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-green-700 selection:text-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">À Propos de l'AIFASA 17</h1>
            <div className="h-1 w-20 bg-emerald-400 mx-auto mb-6 rounded"></div>
            <p className="text-xl text-green-100 max-w-3xl mx-auto font-light">
              Association des Ingénieurs Agronomes et Forestiers de la 17ème promotion de la FASA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistiques clés */}
      <section className="container mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Navigation des Onglets */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap justify-center bg-white rounded-xl shadow-md p-2 max-w-3xl mx-auto border border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-300 text-xs md:text-sm ${
                activeTab === tab.id
                  ? 'bg-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-green-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <section className="pb-16 px-4 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'presentation' && <PresentationTab />}
          {activeTab === 'expertise' && <ExpertiseTab />}
          {activeTab === 'bureau' && <BureauTab />}
          {activeTab === 'organisation' && (
            <OrganisationTab
              expandedCommission={expandedCommission}
              toggleCommission={toggleCommission}
              containerVariants={containerVariants}
              itemVariants={itemVariants}
            />
          )}
          {activeTab === 'partenaires' && <PartenairesTab />}
          {activeTab === 'contact' && <ContactTab />}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default About;
