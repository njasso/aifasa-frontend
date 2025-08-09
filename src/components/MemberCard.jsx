import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteMember } from '../services/memberService';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Briefcase, Mail, Home, Users, BookOpen } from 'lucide-react'; // Importation d'icônes modernes

// Composant Modal pour remplacer les alertes natives
const Modal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full mx-4">
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Confirmer
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// Image par défaut si le membre n'a pas de photo de profil
const DEFAULT_PROFILE_PIC = 'https://placehold.co/112x112/a7f3d0/065f46?text=Profile';

const MemberCard = ({ member, onDelete, userRole, onEdit }) => {
  const { user } = useAuth();
  const isAdmin = userRole === 'admin' || user?.role === 'admin';

  // État pour gérer la visibilité de la modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction pour extraire le nom de fichier suggéré pour le CV
  const getSuggestedCvFileName = (url, memberName) => {
    try {
      const parts = url.split('.');
      const extension = parts.length > 1 ? parts.pop() : 'pdf';
      const safeName = memberName.replace(/[^a-z0-9]/gi, '_');
      return `cv_${safeName}.${extension}`;
    } catch (e) {
      return `cv_${memberName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    }
  };

  const suggestedFileName = member.cv_url
    ? getSuggestedCvFileName(member.cv_url, `${member.first_name}_${member.last_name}`)
    : '';
  
  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMember(member.id);
      onDelete(member.id);
      setIsModalOpen(false);
      // Remplacez l'alerte par une notification ou une modal de succès si nécessaire
      // alert('Membre supprimé avec succès !'); 
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      setIsModalOpen(false);
      // Remplacez l'alerte par une notification ou une modal d'erreur si nécessaire
      // alert('Échec de la suppression du membre. Veuillez vérifier la console.');
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(member);
    } else {
      console.log('La prop onEdit n\'a pas été fournie au composant MemberCard.');
    }
  };

  // Définition des couleurs pour la cohérence visuelle
  const primaryGreen = 'text-emerald-700';
  const neutralDark = 'text-gray-800';
  const neutralBorder = 'border-gray-200';

  // Variants pour l'animation de Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left border border-gray-200 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {isModalOpen && (
        <Modal
          message={`Êtes-vous sûr de vouloir supprimer ${member.first_name} ${member.last_name} ?`}
          onConfirm={confirmDelete}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

      {/* Section de gauche: Photo et nom */}
      <div className="flex flex-col items-center sm:items-start sm:mr-6 mb-4 sm:mb-0">
        <img
          src={member.photo_url || DEFAULT_PROFILE_PIC}
          alt={`${member.first_name} ${member.last_name}`}
          className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-emerald-400 shadow-md"
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PROFILE_PIC; }}
        />
        <h3 className={`text-xl font-bold ${primaryGreen} mb-1`}>{member.last_name} {member.first_name}</h3>
        <div className="flex items-center text-md font-semibold text-gray-700">
          <User size={16} className="mr-2 text-emerald-500" />
          <span>{member.role || 'N/A'}</span>
        </div>
      </div>

      {/* Section de droite: Détails du membre */}
      <div className="flex-1 w-full sm:w-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mb-4">
          {/* Rangée 1 */}
          <p className="flex items-center">
            <Briefcase size={16} className="mr-2 text-gray-500" />
            Profession: <span className="font-normal ml-1 text-gray-800">{member.profession || 'N/A'}</span>
          </p>
          <p className="flex items-center">
            <Phone size={16} className="mr-2 text-gray-500" />
            Contact: <span className="font-normal ml-1 text-gray-800">{member.contact || 'N/A'}</span>
          </p>
          {/* Rangée 2 */}
          <p className="flex items-center">
            <MapPin size={16} className="mr-2 text-gray-500" />
            Localisation: <span className="font-normal ml-1 text-gray-800">{member.location || 'N/A'}</span>
          </p>
          <p className="flex items-center">
            <Home size={16} className="mr-2 text-gray-500" />
            Adresse: <span className="font-normal ml-1 text-gray-800">{member.address || 'N/A'}</span>
          </p>
          {/* Rangée 3 */}
          <p className="flex items-center">
            <Users size={16} className="mr-2 text-gray-500" />
            Emploi: <span className="font-normal ml-1 text-gray-800">{member.employment_structure || 'N/A'}</span>
          </p>
          <p className="flex items-center">
            <BookOpen size={16} className="mr-2 text-gray-500" />
            Activités: <span className="font-normal ml-1 text-gray-800">{member.activities || 'N/A'}</span>
          </p>
          {/* Rangée 4 */}
          <p className="flex items-center col-span-1 md:col-span-2">
            <Mail size={16} className="mr-2 text-gray-500" />
            Entreprise/Projet: <span className="font-normal ml-1 text-gray-800">{member.company_or_project || 'N/A'}</span>
          </p>
        </div>

        {/* Liens pour le CV */}
        {member.cv_url && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
            <a
              href={member.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              download={suggestedFileName}
              className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors duration-300 text-center shadow-md"
            >
              Télécharger le CV
            </a>
            <a
              href={member.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors duration-300 text-center shadow-md"
            >
              Voir le CV
            </a>
          </div>
        )}

        {/* Boutons d'action (visible uniquement pour l'admin) */}
        {isAdmin && (
          <div className="mt-4 flex gap-2 w-full justify-center sm:justify-start">
            <button
              onClick={handleEditClick}
              className="px-4 py-2 text-sm rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors shadow-md transform hover:scale-105"
            >
              Éditer
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-md transform hover:scale-105"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MemberCard;
