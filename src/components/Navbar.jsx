import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { to: "/", text: "Accueil" },
    { to: "/documents", text: "Documents" },
    { to: "/members", text: "Membres" },
    // Condition pour le lien "Trésorerie" : Admins et Trésoriers
    ...((user?.role === 'treasurer' || user?.role === 'admin') 
      ? [{ to: "/treasury", text: "Trésorerie" }] 
      : []),
    // NOUVELLE CONDITION POUR LE LIEN "PROJETS" : Tous les utilisateurs connectés
    ...(user ? [{ to: "/projects", text: "Projets" }] : []),
    { to: "/gallery", text: "Galerie" }
  ];

  const mobileNavVariants = {
    open: { 
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    closed: { 
      opacity: 0,
      x: "100%",
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
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
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo et nom de l'association */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="h-10 w-10 mr-2"
              />
              <span className="text-xl font-bold hidden sm:inline-block">
                AIFASA 17
              </span>
            </Link>
          </motion.div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={link.to} 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-300"
                >
                  {link.text}
                </Link>
              </motion.div>
            ))}

            {user ? (
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-full">
                  <FaUser className="text-sm" />
                  <span className="text-sm font-medium">
                    {user.role === 'admin' ? 'Admin' : 
                     user.role === 'treasurer' ? 'Trésorier' : 
                     'Membre'}
                  </span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  <FaSignOutAlt />
                  <span>Déconnexion</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login" 
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Connexion
                </Link>
              </motion.div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center">
            {user && (
              <div className="flex items-center mr-4 bg-green-700 px-2 py-1 rounded-full">
                <FaUser className="text-sm mr-1" />
                <span className="text-xs">
                  {user.role === 'admin' ? 'Admin' : 
                   user.role === 'treasurer' ? 'Trésorier' : 
                   'Membre'}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Navigation mobile */}
        <motion.div
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={mobileNavVariants}
          className="md:hidden fixed top-16 right-0 w-full h-[calc(100vh-4rem)] bg-green-800 shadow-xl overflow-y-auto"
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          <div className="px-4 pt-2 pb-8 space-y-2">
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                variants={itemVariants}
              >
                <Link 
                  to={link.to} 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 rounded-md text-base font-medium hover:bg-green-700 transition-colors duration-300"
                >
                  {link.text}
                </Link>
              </motion.div>
            ))}

            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-green-700"
            >
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full space-x-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-md text-base font-medium transition-colors duration-300"
                >
                  <FaSignOutAlt />
                  <span>Déconnexion</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full space-x-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-md text-base font-medium transition-colors duration-300"
                >
                  <span>Connexion</span>
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;