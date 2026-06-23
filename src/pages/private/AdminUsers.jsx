// src/pages/private/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  resetUserPassword,
  changeUserRole
} from '../../services/userService';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit3, 
  FiTrash2, 
  FiKey, 
  FiShield,
  FiUserCheck,
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye,      // ← AJOUTÉ
  FiEyeOff    // ← AJOUTÉ
} from 'react-icons/fi';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'member'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false); // ← AJOUTÉ

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setMessage({ text: 'Erreur lors du chargement des utilisateurs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        role: 'member'
      });
    }
    setIsModalOpen(true);
    setMessage({ text: '', type: '' });
    setShowPassword(false); // ← Réinitialiser
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', role: 'member' });
    setShowPassword(false); // ← Réinitialiser
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, formData);
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        setMessage({ text: 'Utilisateur mis à jour avec succès !', type: 'success' });
      } else {
        const newUser = await createUser(formData);
        setUsers([newUser, ...users]);
        setMessage({ text: 'Utilisateur créé avec succès !', type: 'success' });
      }
      setTimeout(() => {
        handleCloseModal();
        fetchUsers();
      }, 1500);
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Erreur lors de l\'opération', type: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setMessage({ text: 'Utilisateur supprimé avec succès !', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Erreur lors de la suppression', type: 'error' });
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Entrez le nouveau mot de passe (minimum 6 caractères) :');
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      await resetUserPassword(userId, newPassword);
      setMessage({ text: 'Mot de passe réinitialisé avec succès !', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Erreur lors de la réinitialisation', type: 'error' });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await changeUserRole(userId, newRole);
      setUsers(users.map(u => u.id === updated.user.id ? { ...u, role: updated.user.role } : u));
      setMessage({ text: 'Rôle mis à jour avec succès !', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Erreur lors du changement de rôle', type: 'error' });
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FiShield className="w-3.5 h-3.5" />;
      case 'treasurer': return <FiUserCheck className="w-3.5 h-3.5" />;
      default: return <FiUser className="w-3.5 h-3.5" />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'treasurer': return 'bg-amber-50 text-amber-800 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-800 border-emerald-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-700 border-t-transparent mb-3"></div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Indexation des comptes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 selection:bg-emerald-800 selection:text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ======== EN-TÊTE CONFIGURATION ======== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-950 text-amber-400 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                <FiShield className="w-3 h-3" />
                Sécurité Système
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight mt-1.5 flex items-center gap-2">
              <FiUsers className="text-emerald-800" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Habilitations, attribution des rôles et contrôle des accès de la plateforme.
            </p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-2xs"
          >
            <FiUserPlus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        </div>

        {/* ======== ZONE DE NOTIFICATION ======== */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center text-xs font-semibold gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {message.type === 'success' ? <FiCheckCircle className="w-4 h-4 text-emerald-700" /> : <FiAlertTriangle className="w-4 h-4 text-rose-700" />}
            {message.text}
          </motion.div>
        )}

        {/* ======== LISTING PRINCIPAL CONTENEUR ======== */}
        <div className="bg-white rounded-xl shadow-2xs overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/60">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Identifiant (ID)</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Compte Email</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rôle & Privilèges</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date de création</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, index) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400 w-3.5 h-3.5" />
                        <span className="text-xs font-bold text-slate-800">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1.5 w-fit uppercase tracking-wider ${getRoleColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Modifier les infos */}
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 bg-white border border-gray-200 hover:border-emerald-200 rounded-lg transition-colors shadow-2xs"
                          title="Modifier les informations"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Réinitialiser Clé d'accès */}
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 bg-white border border-gray-200 hover:border-amber-200 rounded-lg transition-colors shadow-2xs"
                          title="Réinitialiser le mot de passe"
                        >
                          <FiKey className="w-3.5 h-3.5" />
                        </button>

                        {/* Changement rapide de rôle */}
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-[11px] font-bold text-slate-700 border border-gray-200 rounded-lg p-1.5 bg-white focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 shadow-2xs outline-hidden cursor-pointer"
                        >
                          <option value="member">Membre</option>
                          <option value="treasurer">Trésorier</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Supprimer définitivement */}
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-100 rounded-lg transition-colors shadow-2xs"
                            title="Supprimer le compte"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======== MODAL SLIDE-IN OVERLAY FORMULAIRE ======== */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  {editingUser ? 'Ajuster les paramètres d\'accès' : 'Créer un nouveau profil'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Adresse Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 shadow-2xs outline-hidden"
                      placeholder="exemple@aifasa17.org"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                    {editingUser ? 'Nouveau mot de passe (Laisser vide pour inchangé)' : 'Mot de passe initial'}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"} // ← MODIFIÉ
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-9 pr-10 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 shadow-2xs outline-hidden"
                      minLength={editingUser ? 0 : 6}
                      placeholder="••••••••"
                      required={!editingUser}
                    />
                    {/* ← BOUTON ŒIL AJOUTÉ */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <FiEyeOff className="w-4 h-4" />
                      ) : (
                        <FiEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {editingUser && (
                    <p className="text-[10px] font-medium text-gray-400 mt-1">L'ancien mot de passe reste valide si ce champ reste vide.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Rôle assigné au profil</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 text-xs font-bold text-slate-700 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 bg-white shadow-2xs cursor-pointer outline-hidden"
                  >
                    <option value="member">Membre Régulier</option>
                    <option value="treasurer">Trésorier de Bureau</option>
                    <option value="admin">Administrateur Système</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-950 hover:bg-emerald-900 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors border border-emerald-800/40 shadow-2xs"
                  >
                    <FiSave className="w-3.5 h-3.5" />
                    {editingUser ? 'Enregistrer' : 'Générer le compte'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;