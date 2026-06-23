// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaHome,
  FaBuilding,
  FaFileAlt,
  FaUsers,
  FaMoneyBillWave,
  FaProjectDiagram,
  FaImages,
  FaUserShield,
  FaUserTie,
  FaInfoCircle,
  FaUserPlus,
  FaChartPie,
  FaBookOpen,
  FaCog
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  // ============ SECTION 1: LIENS PUBLICS ============
  const publicNavLinks = [
    { to: "/", text: "Accueil", icon: FaHome },
    { to: "/about", text: "À Propos", icon: FaInfoCircle },
    { to: "/why-join", text: "Adhérer", icon: FaUserPlus },
    { to: "/publications", text: "Publications", icon: FaBookOpen },
    { to: "/documents", text: "Documents", icon: FaFileAlt },
    { to: "/gallery", text: "Galerie", icon: FaImages },
    { to: "/enterprises", text: "Entreprises", icon: FaBuilding },
  ];

  // ============ SECTION 2: LIENS DE GESTION (Desktop) ============
  const getManagementLinks = () => {
    const links = [
      { to: "/members", text: "Membres", icon: FaUsers },
      { to: "/projects", text: "Projets", icon: FaProjectDiagram },
      { to: "/dashboard", text: "Dashboard", icon: FaChartPie },
    ];

    if (user?.role === 'admin' || user?.role === 'treasurer') {
      links.push({ to: "/treasury", text: "Trésorerie", icon: FaMoneyBillWave });
    }

    if (user?.role === 'admin') {
      links.push({ to: "/admin/dashboard", text: "Admin", icon: FaUserShield });
      links.push({ to: "/admin/users", text: "Utilisateurs", icon: FaCog });
    }

    return links;
  };

  // ============ MENU UTILISATEUR (Mobile) ============
  const getUserMenu = () => {
    const menu = [
      { to: "/dashboard", text: "Tableau de bord", icon: FaChartPie },
      { to: "/profile", text: "Mon Profil", icon: FaUser }, // Ralloué pour accès direct mobile
      { to: "/members", text: "Espace Membres", icon: FaUsers },
      { to: "/projects", text: "Projets Transversaux", icon: FaProjectDiagram },
    ];

    if (user?.role === 'admin' || user?.role === 'treasurer') {
      menu.push({ to: "/treasury", text: "Gestion Trésorerie", icon: FaMoneyBillWave });
    }

    if (user?.role === 'admin') {
      menu.push({ to: "/admin/dashboard", text: "Panel Administration", icon: FaUserShield });
      menu.push({ to: "/admin/users", text: "Contrôle Utilisateurs", icon: FaCog });
    }

    return menu;
  };

  const getRoleDisplay = () => {
    if (!user) return null;
    const roleMap = {
      'admin': { label: 'Admin', icon: FaUserShield, color: 'bg-purple-600' },
      'treasurer': { label: 'Trésorier', icon: FaUserTie, color: 'bg-blue-600' },
      'member': { label: 'Membre', icon: FaUser, color: 'bg-green-600' },
    };
    return roleMap[user.role] || roleMap['member'];
  };

  const roleInfo = getRoleDisplay();

  const mobileNavVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    closed: {
      opacity: 0,
      x: "100%",
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    closed: { opacity: 0, y: 15, transition: { duration: 0.2 } }
  };

  return (
    <nav className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex justify-between items-center">
          
          {/* ======== LOGO ======== */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group">
              {!logoError ? (
                <img
                  src="/images/logo.png"
                  alt="Logo AIFASA 17"
                  className="h-9 w-9 rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-base font-bold">
                  A
                </div>
              )}
              <span className="text-lg font-bold ml-2 tracking-wider">
                AIFASA 17
              </span>
            </Link>
          </motion.div>

          {/* ======== NAVIGATION DESKTOP (Ajusté à xl:flex pour éviter les chevauchements) ======== */}
          <div className="hidden xl:flex items-center space-x-1">
            {/* Liens Publics */}
            {publicNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors duration-200 flex items-center whitespace-nowrap ${
                  location.pathname === link.to ? 'bg-green-900/40 text-emerald-300' : ''
                }`}
              >
                <link.icon className="mr-1.5 text-sm" />
                <span>{link.text}</span>
              </Link>
            ))}

            {/* Séparateur si connecté */}
            {isAuthenticated() && (
              <span className="w-px h-5 bg-green-500/50 mx-2"></span>
            )}

            {/* Liens Privés de Gestion */}
            {isAuthenticated() && getManagementLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center whitespace-nowrap ${
                  location.pathname === link.to ? 'bg-green-900 text-emerald-300' : 'text-emerald-100'
                }`}
              >
                <link.icon className="mr-1.5 text-sm" />
                <span>{link.text}</span>
              </Link>
            ))}

            {/* Profil Direct & Actions d'Authentification */}
            {isAuthenticated() ? (
              <div className="flex items-center space-x-2 ml-3 pl-2 border-l border-green-600/50">
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-transparent transition-all hover:border-green-400 ${roleInfo?.color || 'bg-green-900'}`}
                  title="Accéder à mon profil"
                >
                  {roleInfo && <roleInfo.icon className="text-xs" />}
                  <span>{user?.name || roleInfo?.label}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600/90 hover:bg-red-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-4 bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 shadow-sm"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* ======== MOBILE / TABLET TOGGLE (Modifié de md:hidden à xl:hidden pour couvrir le vide) ======== */}
          <div className="flex xl:hidden items-center space-x-2">
            {isAuthenticated() && roleInfo && (
              <Link to="/profile" className={`flex items-center bg-green-900/60 px-2.5 py-1 rounded-full border border-green-500/30`}>
                {roleInfo && <roleInfo.icon className="text-xs mr-1 text-emerald-300" />}
                <span className="text-xs font-medium text-emerald-500/100">{roleInfo.label}</span>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none hover:bg-green-700/50 p-2 rounded-lg transition-colors"
              aria-label="Menu principal"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* ======== MENU MOBILE DROPDOWN (xl:hidden) ======== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileNavVariants}
            className="xl:hidden fixed top-[53px] left-0 right-0 w-full h-[calc(100vh-53px)] bg-green-900 shadow-2xl overflow-y-auto z-40 border-t border-green-700/50"
          >
            <div className="px-4 pt-3 pb-12 space-y-1">
              
              <div className="text-[10px] text-green-400 uppercase tracking-widest px-3 py-1.5 font-bold">
                Navigation Publique
              </div>
              {publicNavLinks.map((link) => (
                <motion.div key={link.to} variants={itemVariants}>
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center ${
                      location.pathname === link.to ? 'bg-green-800 text-emerald-300 font-semibold' : 'text-gray-100 hover:bg-green-800/60'
                    }`}
                  >
                    <link.icon className="mr-3 text-green-400" />
                    {link.text}
                  </Link>
                </motion.div>
              ))}

              {isAuthenticated() && (
                <>
                  <motion.div variants={itemVariants} className="border-t border-green-800 my-3" />
                  <div className="text-[10px] text-green-400 uppercase tracking-widest px-3 py-1.5 font-bold">
                    Espace Privé & Gestion
                  </div>
                  {getUserMenu().map((link) => (
                    <motion.div key={link.to} variants={itemVariants}>
                      <Link
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center ${
                          location.pathname === link.to ? 'bg-green-800 text-emerald-300 font-semibold' : 'text-gray-100 hover:bg-green-800/60'
                        }`}
                      >
                        <link.icon className="mr-3 text-emerald-400" />
                        {link.text}
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div variants={itemVariants} className="pt-4 mt-2 border-t border-green-800">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      <FaSignOutAlt />
                      <span>Déconnexion de la Plateforme</span>
                    </button>
                  </motion.div>
                </>
              )}

              {!isAuthenticated() && (
                <motion.div variants={itemVariants} className="pt-4 mt-2 border-t border-green-800">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full space-x-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow"
                  >
                    <FaUserPlus />
                    <span>Se connecter à l'Espace Interne</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;