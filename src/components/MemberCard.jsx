// src/components/MemberCard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Assurez-vous d'importer useAuth ici
import { deleteMember } from '../services/memberService'; // Assurez-vous d'importer deleteMember

// Assurez-vous d'avoir une image par défaut si un membre n'a pas de photo de profil
// Par exemple, placez un fichier 'default_profile.png' dans public/images/
const DEFAULT_PROFILE_PIC = '/images/default_profile.png';

// Ajout de la prop 'onEdit'
const MemberCard = ({ member, onDelete, userRole, onEdit }) => {
  // Utilisez useAuth pour accéder au rôle de l'utilisateur, même si userRole est passé en prop
  // C'est une bonne pratique de vérifier la prop en premier si elle est fournie par le parent.
  const { user } = useAuth();
  const isAdmin = userRole === 'admin' || user?.role === 'admin';

  // Définition des couleurs pour la cohérence visuelle
  const primaryGreen = 'text-emerald-700';
  const lightGreenBg = 'bg-emerald-500';
  const lightGreenHover = 'hover:bg-emerald-600';
  const neutralDark = 'text-gray-800';
  const neutralBorder = 'border-gray-200';
  const redBg = 'bg-red-500';
  const redHover = 'hover:bg-red-600';
  const yellowBg = 'bg-yellow-500'; // Pour le bouton Modifier
  const yellowHover = 'hover:bg-yellow-600'; // Pour le bouton Modifier

  const handleDeleteClick = async () => { // Rendre async pour appeler deleteMember du service
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${member.first_name} ${member.last_name} ?`)) { // Utiliser first_name/last_name ici aussi
      try {
        await deleteMember(member.id); // Appel au service de suppression
        onDelete(member.id); // Appelle la fonction de suppression du parent (Members.jsx) pour mettre à jour l'état local
        alert('Membre supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error);
        alert('Échec de la suppression du membre. Veuillez vérifier la console.');
      }
    }
  };

  // La fonction handleEditClick appelle la prop onEdit si elle existe
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(member); // Passe l'objet membre complet au parent pour édition
    } else {
      console.log('La prop onEdit n\'a pas été fournie au composant MemberCard.');
    }
  };


  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center border ${neutralBorder} hover:shadow-xl transition-shadow duration-300`}>
      <img
        src={member.photo_url || DEFAULT_PROFILE_PIC} // Utilisez photo_url (du backend) si disponible, sinon l'image par défaut
        alt={`${member.first_name} ${member.last_name}`} // Utiliser first_name/last_name
        className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-emerald-400 shadow-md"
        // Gestion d'erreur pour l'image
        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PROFILE_PIC; }}
      />
      <h3 className={`text-xl font-bold ${primaryGreen} mb-2`}>{member.last_name} {member.first_name}</h3> {/* Utiliser last_name/first_name */}
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
        Structure d'emploi: <span className="font-normal">{member.employment_structure || 'N/A'}</span> {/* Assurez-vous que le nom de la colonne est 'employment_structure' */}
      </p>
      <p className="text-gray-600 text-sm mb-2">
        Entreprise/Projet: <span className="font-normal">{member.company_or_project || 'N/A'}</span> {/* Assurez-vous que le nom de la colonne est 'company_or_project' */}
      </p>
      <p className="text-gray-500 text-xs italic">
        {member.activities ? `Activités: ${member.activities}` : ''}
      </p>

      {/* Boutons d'action (visible uniquement pour l'admin) */}
      {isAdmin && ( // Utiliser la variable isAdmin
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleEditClick} // Appel direct de handleEditClick
            className={`px-4 py-2 text-sm rounded-lg ${yellowBg} text-white ${yellowHover} transition-colors`}
          >
            Éditer
          </button>
          <button
            onClick={handleDeleteClick}
            className={`px-4 py-2 text-sm rounded-lg ${redBg} text-white ${redHover} transition-colors`}
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
