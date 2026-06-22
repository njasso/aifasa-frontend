// src/pages/private/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getRecentActivity } from '../../services/dashboardService';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiFileText, 
  FiLayers, 
  FiDollarSign,
  FiShield,
  FiActivity,
  FiPieChart,
  FiBookOpen,
  FiImage,
  FiClock,
  FiArrowRight,
  FiSliders,
  FiUserCheck,
  FiDatabase
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          getAdminStats(),
          getRecentActivity(8)
        ]);
        
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-700 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Chargement du panel d'administration...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Erreur système</p>
          <p className="text-sm text-gray-500 mt-1">Impossible de récupérer les indicateurs d'administration.</p>
        </div>
      </div>
    );
  }

  const adminStats = [
    { title: 'Membres & Comptes', value: stats.users.total, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50', detail: `Admin: ${stats.users.admins} · Trésoriers: ${stats.users.treasurers} · Membres: ${stats.users.members}` },
    { title: 'Documents archivés', value: stats.documents.total, icon: FiFileText, color: 'text-emerald-600', bg: 'bg-emerald-50', detail: Object.entries(stats.documents.byType).map(([k,v]) => `${k}: ${v}`).join(' · ') },
    { title: 'Projets communautaires', value: stats.projects.total, icon: FiLayers, color: 'text-indigo-600', bg: 'bg-indigo-50', detail: Object.entries(stats.projects.byType).map(([k,v]) => `${k}: ${v}`).join(' · ') },
    { title: 'Transactions globales', value: stats.transactions.total, icon: FiDollarSign, color: 'text-amber-600', bg: 'bg-amber-50', detail: `${stats.transactions.totalAmount.toLocaleString()} FCFA` },
  ];

  const financeStats = [
    { title: 'Budget Fonctionnement', value: stats.finances.associationBudget, icon: FiDatabase, color: 'text-emerald-700' },
    { title: 'Fonds Social & Célébrations', value: stats.finances.socialContributionAccount, icon: FiUserCheck, color: 'text-blue-700' },
    { title: 'Compte Tontine interne', value: stats.finances.tontineAccount, icon: FiUsers, color: 'text-amber-700' },
  ];

  const totalFinances = stats.finances.associationBudget + stats.finances.socialContributionAccount + stats.finances.tontineAccount;

  const getActivityIcon = (type) => {
    switch(type) {
      case 'member': return <FiUsers className="text-blue-600" />;
      case 'document': return <FiFileText className="text-emerald-600" />;
      case 'project': return <FiLayers className="text-indigo-600" />;
      case 'transaction': return <FiDollarSign className="text-amber-600" />;
      case 'publication': return <FiBookOpen className="text-teal-600" />;
      case 'gallery': return <FiImage className="text-rose-600" />;
      default: return <FiClock className="text-gray-400" />;
    }
  };

  const adminActions = [
    { title: 'Membres', icon: FiUsers, color: 'text-blue-600 border-blue-100 hover:bg-blue-50/40', link: '/members' },
    { title: 'Documents', icon: FiFileText, color: 'text-emerald-600 border-emerald-100 hover:bg-emerald-50/40', link: '/documents' },
    { title: 'Projets', icon: FiLayers, color: 'text-indigo-600 border-indigo-100 hover:bg-indigo-50/40', link: '/projects' },
    { title: 'Trésorerie', icon: FiDollarSign, color: 'text-amber-600 border-amber-100 hover:bg-amber-50/40', link: '/treasury' },
    { title: 'Galerie Média', icon: FiImage, color: 'text-rose-600 border-rose-100 hover:bg-rose-50/40', link: '/gallery' },
    { title: 'Publications', icon: FiBookOpen, color: 'text-teal-600 border-teal-100 hover:bg-teal-50/40', link: '/publications' },
    { title: 'Rôles & Droits', icon: FiSliders, color: 'text-slate-700 border-gray-200 hover:bg-gray-50', link: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 selection:bg-emerald-800 selection:text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* ======== EN-TÊTE DU DASHBOARD ======== */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/60 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-amber-400 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                  <FiShield className="w-3 h-3" />
                  Espace d'administration
                </span>
              </div>
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight mt-1.5">
                Tableau de Bord Exécutif
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Session active : <span className="text-slate-800 font-bold">{user?.email || 'bureau.executif@aifasa17.org'}</span> · Mandature 2026–2028
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-2xs"
              >
                <FiPieChart className="w-3.5 h-3.5 text-emerald-800" />
                Vue utilisateur
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ======== GRILLE DES STATISTIQUES DES MODULES ======== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {adminStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-2xs p-5 border border-gray-100 flex items-center justify-between group hover:shadow-xs transition-all"
            >
              <div className="overflow-hidden mr-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.title}</p>
                <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-1 truncate" title={stat.detail}>
                  {stat.detail}
                </p>
              </div>
              <div className={`${stat.bg} ${stat.color} w-11 h-11 rounded-xl flex items-shrink-0 items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ======== SECTOR FINANCES CONSOLIDÉES ======== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-2xs p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-gray-50 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FiDollarSign className="text-emerald-800 w-4 h-4" />
              Situation de la Trésorerie Centrale
            </h3>
            <span className="text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
              Encours consolidé : {totalFinances.toLocaleString()} FCFA
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {financeStats.map((stat, index) => (
              <div
                key={stat.title}
                className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center"
              >
                <div className={`${stat.color} bg-white border border-gray-100 w-9 h-9 rounded-lg flex items-center justify-center shadow-2xs mb-2.5`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.title}</p>
                <p className="text-base font-black text-slate-900 mt-1">
                  {stat.value.toLocaleString()} <span className="text-xs font-semibold text-gray-500">FCFA</span>
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ======== ACCÈS RAPIDES ET RACCOURCIS ACTIONS ======== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-2xs p-6 mb-8 border border-gray-100"
        >
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
            <FiSliders className="text-emerald-800 w-4 h-4" />
            Modules de gestion opérationnelle
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {adminActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`border ${action.color} p-3.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 shadow-2xs group`}
              >
                <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold tracking-tight">{action.title}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ======== MODULE FLUX / ACTIVITÉS RÉCENTES ======== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-2xs p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FiActivity className="text-emerald-800 w-4 h-4" />
              Journal des activités d'administration
            </h3>
            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-md">
              {activities.length} événements loggés
            </span>
          </div>
          
          <div className="space-y-2.5">
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aucun événement</p>
                <p className="text-xs text-gray-500 mt-0.5">Aucune modification récente n'a été répertoriée.</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-3 bg-gray-50/40 hover:bg-gray-50 border border-gray-100/60 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-2xs flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {activity.action}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                        Par : {activity.user}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-md ml-4 flex-shrink-0">
                    {activity.time}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* ======== PIED DE PAGE ET CONFIGURATION SYSTEME ======== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-6 border-t border-gray-200/60 text-center text-[11px] text-gray-400 font-semibold uppercase tracking-wider"
        >
          <p>
            Console d'administration Intégrée · AIFASA 17
          </p>
          <p className="text-gray-400 font-medium normal-case tracking-normal mt-1">
            Niveau de privilèges : <span className="text-emerald-800 font-bold">{user?.role || 'Administrateur Général'}</span>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;