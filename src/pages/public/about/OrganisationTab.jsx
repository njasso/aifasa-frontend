// src/pages/public/about/OrganisationTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiArrowRight } from 'react-icons/fi';
import { statutoryBodies, commissions } from './aboutData';

const OrganisationTab = ({ expandedCommission, toggleCommission, containerVariants, itemVariants }) => (
  <motion.div
    key="organisation"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.4 }}
    className="space-y-8"
  >
    {/* Organes Statutaires */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-green-900 mb-1">Gouvernance & Organes Statutaires</h2>
      <p className="text-gray-500 mb-6 text-sm">Une structure organisationnelle transparente, démocratique et rigoureuse au service du bien commun.</p>
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6">
        {statutoryBodies.map((body, index) => {
          const Icon = body.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm flex gap-4 items-start hover:bg-white hover:shadow-md transition-all duration-300 relative overflow-hidden group"
            >
              <div className="p-3 bg-green-50 rounded-xl flex-shrink-0 text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-gray-800 text-base">{body.title}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-gray-200/60 text-gray-600 rounded">
                    {body.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 pt-1 leading-relaxed">{body.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>

    {/* Commissions */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-900">Commissions Spécialisées</h2>
          <p className="text-gray-500 text-sm mt-0.5">Les pôles opérationnels et techniques au cœur de nos actions.</p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">
          5 Pôles d'Action
        </span>
      </div>
      
      <div className="space-y-4">
        {commissions.map((comm, index) => {
          const Icon = comm.icon;
          const isExpanded = expandedCommission === comm.id;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                isExpanded 
                  ? 'bg-gradient-to-br from-green-50/40 to-white border-green-500/40 shadow-md' 
                  : 'bg-gray-50 border-gray-100/80 hover:bg-white hover:shadow-sm'
              }`}
            >
              <div 
                onClick={() => toggleCommission(comm.id)}
                className="flex items-center justify-between p-5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg transition-colors duration-300 ${isExpanded ? 'bg-green-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{comm.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{comm.description}</p>
                  </div>
                </div>
                <div className="text-gray-400 p-1 hover:text-gray-600 transition-colors">
                  {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-gray-100 grid md:grid-cols-2 gap-4 text-sm bg-white/50">
                      <div className="space-y-1.5 p-3 rounded-lg bg-gray-50 border border-gray-100/60">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mission Principale</h4>
                        <p className="text-gray-600 leading-relaxed">{comm.mission}</p>
                      </div>
                      <div className="space-y-1.5 p-3 rounded-lg bg-green-50/30 border border-green-100/40">
                        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Objectif Clé</h4>
                        <p className="text-green-900/90 font-medium leading-relaxed">{comm.kpi}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* Call to action */}
    <div className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-2xl p-8 text-center text-white shadow-xl max-w-3xl mx-auto border border-green-800/20">
      <h3 className="text-xl md:text-2xl font-bold">Unir nos forces pour un développement durable</h3>
      <p className="text-green-100/80 text-sm mt-2 max-w-xl mx-auto">
        Les commissions de travail sont ouvertes à tous les membres souhaitant contribuer activement à la vie de l'association.
      </p>
      <div className="mt-5">
        <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5">
          S'engager dans une commission
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>

);

export default OrganisationTab;
