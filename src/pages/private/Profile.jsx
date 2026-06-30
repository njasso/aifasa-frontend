// src/pages/private/Profile.jsx
// Réécrit : la page appelait auparavant des fonctions commentées et
// affichait un faux message de succès sans rien sauvegarder. Elle est
// maintenant branchée sur les vraies routes self-service du backend
// (GET/PUT /api/members/me et POST /api/auth/change-password).
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser, changePassword } from '../../services/api';
import { getMyProfile, updateMyProfile } from '../../services/memberService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiTag, 
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiKey,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiLogOut,
  FiInfo
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FORM_DEFAULT = {
  first_name: '',
  last_name: '',
  phone_number: '',
  location: '',
  address: '',
  profession: '',
  company_or_project: '',
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [accountData, setAccountData] = useState(null); // email / role / created_at (table users)
  const [memberData, setMemberData] = useState(null);   // fiche annuaire (table members)
  const [notLinked, setNotLinked] = useState(false);     // compte non relié à une fiche membre
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState(FORM_DEFAULT);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetProfileForm = (data) => {
    if (!data) {
      setFormData(FORM_DEFAULT);
      setImagePreview(null);
      return;
    }
    setFormData({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone_number: data.phone_number || '',
      location: data.location || '',
      address: data.address || '',
      profession: data.profession || '',
      company_or_project: data.company_or_project || '',
    });
    setImagePreview(data.photo_url || null);
    setPhotoFile(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const account = await getCurrentUser();
        setAccountData(account);

        try {
          const member = await getMyProfile();
          setMemberData(member);
          resetProfileForm(member);
          setNotLinked(false);
        } catch (memberError) {
          // 404 = aucune fiche annuaire reliée à ce compte pour l'instant
          setNotLinked(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: "L'image dépasse la limite maximale autorisée de 2 Mo", type: 'error' });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const updated = await updateMyProfile({ ...formData, photoFile });
      setMemberData(updated);
      resetProfileForm(updated);
      setMessage({ text: 'Votre profil a été mis à jour avec succès.', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setMessage({
        text: error.response?.data?.error || 'Une erreur est survenue lors de la mise à jour.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'Les nouveaux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: 'Le mot de passe doit contenir au moins 6 caractères.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ text: 'Votre mot de passe a été modifié avec succès.', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      console.error(error);
      setMessage({
        text: error.response?.data?.error || 'Erreur lors de la modification du mot de passe.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = memberData
    ? `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim()
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-700 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Chargement des données du compte...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 selection:bg-emerald-800 selection:text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* ======== EN-TÊTE DE PAGE ======== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <Link 
              to="/dashboard" 
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-950 hover:border-gray-300 transition-all shadow-2xs"
            >
              <FiArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight">Mon Profil</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Gérez vos coordonnées et vos paramètres de sécurité</p>
            </div>
          </div>
          
          {!isEditing && !isChangingPassword && !notLinked && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 hover:to-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-emerald-800/50 shadow-xs transition-all"
            >
              <FiEdit3 className="w-3.5 h-3.5 text-amber-400" />
              Modifier le profil
            </button>
          )}
        </div>

        {/* ======== NOTIFICATIONS / MESSAGES ======== */}
        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold shadow-2xs ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-900 border border-rose-100'
              }`}
            >
              {message.type === 'success' ? (
                <FiCheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <FiAlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">{message.text}</div>
              <button onClick={() => setMessage({ text: '', type: '' })} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======== COMPTE NON RELIÉ À UNE FICHE MEMBRE ======== */}
        {notLinked && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-100">
            <FiInfo className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <p>
              Votre compte de connexion n'est pas encore relié à une fiche de l'annuaire des membres.
              Vous pouvez changer votre mot de passe ci-dessous, mais pour modifier vos informations
              personnelles (téléphone, profession, photo...), contactez un administrateur afin qu'il
              relie votre compte à votre fiche.
            </p>
          </div>
        )}

        {/* ======== CONTEXTE DE LA CARTE DE PROFIL ======== */}
        <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-100">
          
          {/* BANNIÈRE DESIGN COHÉRENTE */}
          <div className="h-36 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          
          {/* ZONE IDENTITÉ & AVATAR */}
          <div className="relative px-6 pb-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14">
              <div className="relative group self-start sm:self-auto">
                <div className="w-28 h-28 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-md flex-shrink-0 relative">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Avatar utilisateur" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 text-3xl font-black">
                      {fullName ? fullName.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                  )}
                </div>
                
                {isEditing && !notLinked && (
                  <label className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 hover:to-emerald-800 text-amber-400 p-2 rounded-xl cursor-pointer shadow-md transition-all border border-emerald-800/60">
                    <FiCamera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="sm:pb-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {fullName || 'Compte Membre'}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    <FiTag className="w-3 h-3" />
                    {accountData?.role || 'Membre'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CORPS PRINCIPAL DES CONTENUS */}
          <div className="p-6">
            
            {/* VUE : CONSULTATION STANDARD */}
            {!isEditing && !isChangingPassword && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-gray-50/50 p-3.5 border border-gray-100/70 rounded-lg">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5"><FiUser className="w-3 h-3" /> Nom complet</label>
                    <p className="text-xs text-slate-900 font-bold mt-1">{fullName || 'Non renseigné'}</p>
                  </div>
                  <div className="bg-gray-50/50 p-3.5 border border-gray-100/70 rounded-lg">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5"><FiMail className="w-3 h-3" /> Adresse e-mail</label>
                    <p className="text-xs text-slate-900 font-bold mt-1 truncate">{accountData?.email}</p>
                  </div>
                  <div className="bg-gray-50/50 p-3.5 border border-gray-100/70 rounded-lg">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5"><FiPhone className="w-3 h-3" /> Numéro de téléphone</label>
                    <p className="text-xs text-slate-900 font-bold mt-1">{memberData?.phone_number || 'Non configuré'}</p>
                  </div>
                  <div className="bg-gray-50/50 p-3.5 border border-gray-100/70 rounded-lg">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5"><FiBriefcase className="w-3 h-3" /> Profession</label>
                    <p className="text-xs text-slate-900 font-bold mt-1">{memberData?.profession || 'Non renseignée'}</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-3.5 border border-gray-100/70 rounded-lg">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5"><FiMapPin className="w-3 h-3" /> Localisation / Adresse</label>
                  <p className="text-xs text-slate-900 font-bold mt-1">
                    {[memberData?.location, memberData?.address].filter(Boolean).join(' — ') || 'Non spécifiée'}
                  </p>
                </div>

                <div className="bg-gray-50/50 p-4 border border-gray-100/70 rounded-lg">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">Structure / Entreprise</label>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed mt-2 whitespace-pre-line">
                    {memberData?.company_or_project || "Aucune information renseignée pour le moment."}
                  </p>
                </div>

                {/* BARRE D'ACTIONS INFERIEURE */}
                <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-gray-100">
                  {!notLinked && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 hover:to-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-emerald-800/50 shadow-2xs transition-all"
                    >
                      <FiEdit3 className="w-3.5 h-3.5 text-amber-400" />
                      Modifier les informations
                    </button>
                  )}
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-2xs"
                  >
                    <FiKey className="w-3.5 h-3.5 text-emerald-700" />
                    Sécurité d'accès
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-all ml-auto"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}

            {/* VUE : FORMULAIRE D'ÉDITION DES DONNÉES */}
            {isEditing && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Adresse email (Lecture seule)</label>
                    <input
                      type="email"
                      value={accountData?.email || ''}
                      className="w-full text-xs p-3 border border-gray-100 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                      placeholder="+237 6__ ___ ___"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ville / Localisation</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                      placeholder="Ville, Pays"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Adresse</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Profession</label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Structure / Entreprise</label>
                    <input
                      type="text"
                      value={formData.company_or_project}
                      onChange={(e) => setFormData({ ...formData, company_or_project: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 hover:to-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-2xs"
                  >
                    <FiSave className="w-3.5 h-3.5 text-amber-400" />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      resetProfileForm(memberData);
                      setMessage({ text: '', type: '' });
                    }}
                    className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
                  >
                    <FiX className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* VUE : MODIFICATION DU MOT DE PASSE */}
            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3.5 flex gap-2.5 items-start text-[11px] font-semibold text-amber-900">
                  <FiInfo className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                  <p>Par mesure de sécurité, assurez-vous d'utiliser un mot de passe complexe comprenant au moins 6 caractères mêlant des lettres et des chiffres.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium bg-white"
                      required
                      minLength="6"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 outline-hidden font-medium bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-950 to-emerald-900 hover:from-emerald-900 hover:to-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-2xs"
                  >
                    <FiKey className="w-3.5 h-3.5 text-amber-400" />
                    {isSubmitting ? 'Traitement...' : 'Mettre à jour les accès'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setMessage({ text: '', type: '' });
                    }}
                    className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
                  >
                    <FiX className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
