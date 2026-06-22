// src/pages/private/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../services/api';
import { getDashboardStats, getRecentActivity } from '../../services/dashboardService';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiTag, 
  FiCalendar,
  FiFileText,
  FiUsers,
  FiDollarSign,
  FiLayers,
  FiImage,
  FiClock,
  FiArrowRight,
  FiBookOpen,
  FiUserCheck,
  FiSettings,
  FiActivity
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    members: 0,
    documents: 0,
    projects: 0,
    gallery: 0,
    transactions: 0,
    myContributions: 0,
    publications: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userInfo, statsData, activityData] = await Promise.all([
          getCurrentUser(),
          getDashboardStats(),
          getRecentActivity(6)
        ]);
        
        setUserData(userInfo);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
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
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Initialisation du tableau de bord...</p>
      </div>
    );
  }

  const statsCards = [
    { title: 'Documents', value: stats.documents, icon: FiFileText, color: 'text-blue-600 bg-blue-50 border-blue-100', link: '/documents' },
    { title: 'Membres', value: stats.members, icon: FiUsers, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', link: '/members' },
    { title: 'Projets', value: stats.projects, icon: FiLayers, color: 'text-amber-600 bg-amber-50 border-amber-100', link: '/projects' },
    { title: 'Galerie', value: stats.gallery, icon: FiImage, color: 'text-purple-600 bg-purple-50 border-purple-100', link: '/gallery' },
    { title: 'Publications', value: stats.publications, icon: FiBookOpen, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', link: '/publications' },
  ];

  const quickActions = [
    { title: 'Mon Profil', icon: FiUserCheck, color: 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-amber-400', link: '/profile' },
    { title: 'Documents', icon: FiFileText, color: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700', link: '/documents' },
    { title: 'Membres', icon: FiUsers, color: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700', link: '/members' },
    { title: 'Projets', icon: FiLayers, color: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700', link: '/projects' },
    { title: 'Galerie', icon: FiImage, color: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700', link: '/gallery' },
    { title: 'Publications', icon: FiBookOpen, color: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700', link: '/publications' },
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'member': return <FiUsers className="text-emerald-600" />;
      case 'document': return <FiFileText className="text-blue-600" />;
      case 'project': return <FiLayers className="text-amber-600" />;
      case 'transaction': return <FiDollarSign className="text-green-600" />;
      case 'publication': return <FiBookOpen className="text-indigo-600" />;
      case 'gallery': return <FiImage className="text-purple-600" />;
      default: return <FiClock className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 selection:bg-emerald-800 selection:text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* ======== EN-TÊTE DU TABLEAU DE BORD ======== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight">Tableau de bord</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Ravi de vous revoir, <span className="text-emerald-900 font-bold">{userData?.name || user?.name || 'Cher Membre'}</span>. Suivez l'évolution de la promotion.
              </p>
            </div>
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 hover:to-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-emerald-800/50 shadow-xs transition-all group"
              >
                <FiSettings className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                Administration Panel
                <FiArrowRight className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </motion.div>

        {/* ======== BANDEAU SYNTHÈSE UTILISATEUR ======== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60 -mr-5 -mt-5"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 font-black text-lg shadow-2xs">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : <FiUser className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  {userData?.name || user?.name || 'Utilisateur non configuré'}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><FiMail className="w-3.5 h-3.5 text-gray-400" /> {userData?.email || user?.email}</span>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    <FiTag className="w-3 h-3" /> {userData?.role || user?.role || 'Membre'}
                  </span>
                  {stats.myContributions > 0 && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      Cotisations : {stats.myContributions.toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-2xs md:ml-auto"
            >
              <FiUserCheck className="w-3.5 h-3.5 text-emerald-700" />
              Gérer mon profil
            </Link>
          </div>
        </motion.div>

        {/* ======== GRILLE DES STATISTIQUES GLOBALES ======== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <Link to={stat.link} className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${stat.color} transition-transform group-hover:scale-105`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ======== BLOC : ACTIVITÉS RÉCENTES ======== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 lg:col-span-2"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-50">
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <FiActivity className="text-emerald-700 w-4 h-4" />
                Flux d'activités de la plateforme
              </h3>
              <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {activities.length} événements
              </span>
            </div>
            
            <div className="space-y-1">
              {activities.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic text-xs font-medium">
                  Aucun mouvement ou mise à jour récente sur la plateforme.
                </div>
              ) : (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/70 px-2 rounded-lg transition-colors group text-xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-7 h-7 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-gray-800 group-hover:text-emerald-900 transition-colors truncate">
                          {activity.action}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          Par : {activity.user}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap ml-4 bg-gray-100/60 px-2 py-0.5 rounded-sm">
                      {activity.time}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* ======== BLOC : ACTIONS RAPIDES ======== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-xs border border-gray-100 p-5"
          >
            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider pb-4 mb-4 border-b border-gray-50">
              Raccourcis & Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className={`${action.color} border p-3.5 rounded-lg transition-all hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xs flex flex-col items-center justify-center text-center gap-2 group`}
                >
                  <action.icon className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold tracking-tight">{action.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>
          
        </div>

        {/* ======== METADONNÉES PIED DE PAGE ======== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-[11px] text-gray-400 font-medium space-y-1"
        >
          <p>© 2026 AIFASA 17 — Écosystème numérique de gestion des Ingénieurs de la promotion.</p>
          <p>Identifiant de session sécurisé : <span className="text-gray-500 font-mono">{user?.email}</span></p>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Dashboard;