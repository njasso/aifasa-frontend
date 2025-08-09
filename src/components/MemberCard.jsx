import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteMember } from '../services/memberService';

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

  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center border ${neutralBorder} hover:shadow-xl transition-shadow duration-300`}>
      {isModalOpen && (
        <Modal
          message={`Êtes-vous sûr de vouloir supprimer ${member.first_name} ${member.last_name} ?`}
          onConfirm={confirmDelete}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

      <img
        src={member.photo_url || DEFAULT_PROFILE_PIC}
        alt={`${member.first_name} ${member.last_name}`}
        className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-emerald-400 shadow-md"
        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PROFILE_PIC; }}
      />
      <h3 className={`text-xl font-bold ${primaryGreen} mb-2`}>{member.last_name} {member.first_name}</h3>
      <p className={`text-md font-semibold ${neutralDark} mb-1`}>
        Rôle: <span className="font-normal text-gray-700">{member.role || 'N/A'}</span>
      </p>
      <p className="text-gray-700 text-sm mb-1">
        Profession: <span className="font-normal">{member.profession || 'N/A'}</span>
      </p>
      <p className="text-gray-600 text-sm mb-1">
        Sexe: <span className="font-normal">{member.sex || 'N/A'}</span>
      </p>
      <p className="text-gray-600 text-sm mb-1">
        Localisation: <span className="font-normal">{member.location || 'N/A'}</span>
      </p>
      <p className="text-gray-600 text-sm mb-1">
        Adresse: <span className="font-normal">{member.address || 'N/A'}</span>
      </p>
      <p className="text-gray-600 text-sm mb-1">
        Contact: <span className="font-normal">{member.contact || 'N/A'}</span>
      </p>
      <p className="text-gray-600 text-sm mb-1">
        Structure d'emploi: <span className="font-normal">{member.employment_structure || 'N/A'}</span>
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Entreprise/Projet: <span className="font-normal">{member.company_or_project || 'N/A'}</span>
      </p>
      <p className="text-gray-500 text-xs italic">
        {member.activities ? `Activités: ${member.activities}` : ''}
      </p>

      {/* Liens pour le CV */}
      {member.cv_url && (
        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
          <a
            href={member.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            download={suggestedFileName}
            className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors duration-300 text-center"
          >
            Télécharger le CV
          </a>
          <a
            href={member.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors duration-300 text-center"
          >
            Voir le CV
          </a>
        </div>
      )}

      {/* Boutons d'action (visible uniquement pour l'admin) */}
      {isAdmin && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleEditClick}
            className="px-4 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
          >
            Éditer
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
