// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const Login = () => {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await login(formData);
      setAuth(response.token, response.user);
      
      if (response.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.error || 'Identifiants d\'accès non valides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id === 'email' ? 'email' : 'password']: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 selection:bg-emerald-800 selection:text-white">
      
      {/* Effets lumineux floutés d'arrière-plan */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-amber-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8 relative z-10"
      >
        {/* Identité visuelle d'en-tête avec Logo Officiel */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl mb-3 shadow-2xs overflow-hidden p-2">
            <img 
              src="/images/logo.png" 
              alt="AIFASA 17 Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-emerald-800 font-black text-xl">A17</div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AIFASA 17</p>
          <h1 className="text-xl font-black text-emerald-950 tracking-tight mt-1">Espace de Connexion</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Accédez à votre espace d'ingénierie et de gestion</p>
        </div>

        {/* Message d'erreur épuré */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border border-rose-200 p-3.5 mb-5 rounded-xl flex items-start gap-2.5"
          >
            <FiAlertTriangle className="text-rose-700 mt-0.5 flex-shrink-0 w-4 h-4" />
            <p className="text-rose-950 text-xs font-semibold">{error}</p>
          </motion.div>
        )}

        {/* Formulaire d'accès */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Adresse email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400 w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="nom@aifasa17.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 shadow-2xs outline-hidden transition-all"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400 w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 shadow-2xs outline-hidden transition-all"
                required
                minLength="6"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 text-emerald-800 focus:ring-emerald-800 border-gray-300 rounded cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-700 cursor-pointer select-none">Se souvenir de moi</label>
            </div>
            <button 
              type="button" 
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
              onClick={() => alert("Veuillez vous rapprocher du Secrétariat Général pour réinitialiser vos accès.")}
              disabled={isLoading}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 bg-emerald-950 hover:bg-emerald-900 text-amber-400 border border-emerald-800/40 text-xs font-bold rounded-lg shadow-2xs transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authentification en cours...
              </>
            ) : (
              <>
                <FiLogIn className="w-3.5 h-3.5" />
                Se connecter à la plateforme
              </>
            )}
          </button>
        </form>

        {/* Encadré d'information pour demande d'identifiants */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <FiInfo className="text-emerald-800 w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
              Pas encore de compte ? Veuillez <span className="text-emerald-950 font-bold">contacter l'administrateur</span> du système pour générer vos identifiants d'accès nominatifs.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;