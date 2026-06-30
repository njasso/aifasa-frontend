// src/pages/public/about/ExpertiseTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiCheckCircle, FiArrowRight, FiMail } from 'react-icons/fi';
import { expertiseDomains, expertiseImages, qhseData } from './aboutData';

const ExpertiseTab = () => (
  <motion.div
    key="expertise"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.4 }}
    className="space-y-8"
  >
    {/* En-tête des expertises */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-green-100 rounded-xl">
          <FiAward className="w-8 h-8 text-green-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-900">Nos Domaines d'Expertise</h2>
          <p className="text-gray-500 text-sm">Un vivier de compétences pluridisciplinaires au service du développement durable</p>
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed">
        L'AIFASA 17 regroupe des ingénieurs agronomes et forestiers aux profils variés et complémentaires. 
        Notre association couvre un large spectre d'expertises, allant des productions végétales à la gouvernance environnementale, 
        en passant par l'aquaculture et le conseil QHSE. Découvrez ci-dessous nos domaines de compétence clés.
      </p>
    </div>

    {/* Cartes des domaines d'expertise avec illustration et description */}
    <div className="grid md:grid-cols-2 gap-8">
      {expertiseDomains.map((domain) => (
        <motion.div
          key={domain.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Illustration */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={expertiseImages[domain.id]} 
              alt={domain.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r ${domain.color} opacity-90`}>
              <div className="flex items-center gap-2 text-white">
                <domain.icon className="w-5 h-5" />
                <span className="font-bold text-sm">{domain.title}</span>
              </div>
            </div>
          </div>

          {/* Description uniquement */}
          <div className="p-5">
            <p className="text-sm text-gray-600 leading-relaxed">{domain.description}</p>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Section QHSE - UNIQUE */}
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="relative h-56 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
          alt="QHSE - Conseil et certification ISO"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-red-800/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-r from-red-600 to-rose-700 opacity-95">
          <div className="flex items-center gap-3 text-white">
            <FiCheckCircle className="w-6 h-6" />
            <h3 className="text-xl font-bold">Conseil, accompagnement, formation, audit QHSE et certification ISO</h3>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-gray-600 text-sm leading-relaxed">{qhseData.description}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {qhseData.services.map((service, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all duration-200">
              <FiCheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-700 leading-relaxed">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Call to action */}
    <div className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-2xl p-8 text-center text-white shadow-xl max-w-3xl mx-auto border border-green-800/20">
      <h3 className="text-xl md:text-2xl font-bold">Vous avez un projet ?</h3>
      <p className="text-green-100/80 text-sm mt-2 max-w-xl mx-auto">
        Faites appel à l'expertise de nos ingénieurs pour vos projets de développement agricole, forestier ou environnemental.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5">
          Consulter le Hub d'expertise
          <FiArrowRight className="w-4 h-4" />
        </button>
        <a 
          href="mailto:association@aifasa17.org"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-lg border border-white/20 transition-all"
        >
          <FiMail className="w-4 h-4" />
          Nous contacter
        </a>
      </div>
    </div>
  </motion.div>

);

export default ExpertiseTab;
