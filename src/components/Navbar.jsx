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
  FaCog,
  FaUserEdit
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

  // ============ SECTION 2: LIENS DE GESTION (Connecté) ============
  const getManagementLinks = () => {
    const links = [
      { to: "/members", text: "Espace Membre", icon: FaUsers },
      { to: "/projects", text: "Projets", icon: FaProjectDiagram },
      { to: "/dashboard", text: "Tableau de bord", icon: FaChartPie },
      
    ];

    if (user?.role === 'admin' || user?.role === 'treasurer') {
      links.push({ to: "/treasury", text: "Trésorerie", icon: FaMoneyBillWave });
    }

    if (user?.role === 'admin') {
      links.push({ to: "/admin/dashboard", text: "Administration", icon: FaUserShield });
      links.push({ to: "/admin/users", text: "Utilisateurs", icon: FaCog });
    }

    return links;
  };

  // ============ MENU UTILISATEUR (Mobile) ============
  const getUserMenu = () => {
    const menu = [
      { to: "/dashboard", text: "Tableau de bord", icon: FaChartPie },
      // ✅ Profil retiré - accessible depuis le Dashboard
      { to: "/members", text: "Membres", icon: FaUsers },
      { to: "/projects", text: "Projets", icon: FaProjectDiagram },
    ];

    if (user?.role === 'admin' || user?.role === 'treasurer') {
      menu.push({ to: "/treasury", text: "Trésorerie", icon: FaMoneyBillWave });
    }

    if (user?.role === 'admin') {
      menu.push({ to: "/admin/dashboard", text: "Administration", icon: FaUserShield });
      menu.push({ to: "/admin/users", text: "Utilisateurs", icon: FaCog });
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
        staggerChildren: 0.08,
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
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <nav className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          {/* ======== LOGO ======== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center flex-shrink-0"
          >
            <Link to="/" className="flex items-center group">
              {!logoError ? (
                <img
                  src="/images/logo.png"
                  alt="Logo AIFASA 17"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-600 flex items-center justify-center text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                  A
                </div>
              )}
              <span className="text-lg sm:text-xl font-bold hidden sm:inline-block ml-2">
                AIFASA 17
              </span>
            </Link>
          </motion.div>

          {/* ======== NAVIGATION DESKTOP ======== */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {/* Groupe 1: Liens Publics */}
            {publicNavLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.to}
                  className={`px-2 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium hover:bg-green-700 transition-colors duration-300 flex items-center whitespace-nowrap ${
                    location.pathname === link.to ? 'bg-green-700' : ''
                  }`}
                >
                  <link.icon className="mr-1 xl:mr-2 text-sm" />
                  <span className="hidden xl:inline">{link.text}</span>
                </Link>
              </motion.div>
            ))}

            {/* Séparateur */}
            {isAuthenticated() && (
              <span className="w-px h-6 bg-green-500 opacity-50 mx-1"></span>
            )}

            {/* Groupe 2: Liens de Gestion (Connecté) */}
            {isAuthenticated() && getManagementLinks().map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.to}
                  className={`px-2 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium hover:bg-green-700 transition-colors duration-300 flex items-center whitespace-nowrap ${
                    location.pathname === link.to ? 'bg-green-700' : ''
                  }`}
                >
                  <link.icon className="mr-1 xl:mr-2 text-sm" />
                  <span className="hidden xl:inline">{link.text}</span>
                </Link>
              </motion.div>
            ))}

            {/* Groupe 3: Profil & Déconnexion */}
            {isAuthenticated() ? (
              <motion.div
                className="flex items-center space-x-2 ml-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Rôle */}
                <div className="flex items-center space-x-1 bg-green-700 px-2 py-1 rounded-full">
                  {roleInfo && (
                    <>
                      <roleInfo.icon className="text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                        {roleInfo.label}
                      </span>
                    </>
                  )}
                </div>

                {/* Déconnexion */}
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors duration-300"
                >
                  <FaSignOutAlt className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap"
                >
                  Connexion
                </Link>
              </motion.div>
            )}
          </div>

          {/* ======== MENU MOBILE ======== */}
          <div className="flex md:hidden items-center">
            {isAuthenticated() && roleInfo && (
              <div className="flex items-center mr-2 bg-green-700 px-2 py-1 rounded-full">
                <roleInfo.icon className="text-xs mr-1" />
                <span className="text-xs hidden xs:inline">{roleInfo.label}</span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none hover:text-green-200 transition-colors p-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* ======== NAVIGATION MOBILE ======== */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileNavVariants}
              className="md:hidden fixed top-14 left-0 right-0 w-full h-[calc(100vh-3.5rem)] bg-green-800 shadow-xl overflow-y-auto"
            >
              <div className="px-4 pt-2 pb-8 space-y-1">
                {/* Section 1: Liens Publics */}
                <div className="text-xs text-green-300 uppercase tracking-wider px-3 py-2 font-semibold">
                  Navigation
                </div>
                {publicNavLinks.map((link) => (
                  <motion.div key={link.to} variants={itemVariants}>
                    <Link
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-3 rounded-md text-base font-medium hover:bg-green-700 transition-colors duration-300 flex items-center ${
                        location.pathname === link.to ? 'bg-green-700' : ''
                      }`}
                    >
                      <link.icon className="mr-3" />
                      {link.text}
                    </Link>
                  </motion.div>
                ))}

                {isAuthenticated() && (
                  <>
                    <motion.div variants={itemVariants} className="border-t border-green-600 my-2" />
                    
                    {/* Section 2: Gestion */}
                    <div className="text-xs text-green-300 uppercase tracking-wider px-3 py-2 font-semibold">
                      Gestion
                    </div>
                    {getUserMenu().map((link) => (
                      <motion.div key={link.to} variants={itemVariants}>
                        <Link
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-3 rounded-md text-base font-medium hover:bg-green-700 transition-colors duration-300 flex items-center ${
                            location.pathname === link.to ? 'bg-green-700' : ''
                          }`}
                        >
                          <link.icon className="mr-3" />
                          {link.text}
                        </Link>
                      </motion.div>
                    ))}

                    {/* Section 3: Déconnexion */}
                    <motion.div variants={itemVariants} className="pt-4 border-t border-green-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full space-x-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-md text-base font-medium transition-colors duration-300"
                      >
                        <FaSignOutAlt />
                        <span>Déconnexion</span>
                      </button>
                    </motion.div>
                  </>
                )}

                {!isAuthenticated() && (
                  <motion.div variants={itemVariants} className="pt-4 border-t border-green-700">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full space-x-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-md text-base font-medium transition-colors duration-300"
                    >
                      <FaUserPlus className="mr-2" />
                      <span>Connexion</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;