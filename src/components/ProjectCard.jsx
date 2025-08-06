// src/components/ProjectCard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteProject } from '../services/projectService';

const ProjectCard = ({ project, onDelete, onEdit, userRole, members, onSelectForFollowUp }) => {
  const { user } = useAuth();
  const isAdmin = userRole === 'admin' || user?.role === 'admin';

  // Définition des couleurs pour la cohérence visuelle
  const primaryGreen = 'text-emerald-700';
  const neutralBorder = 'border-gray-200';
  const redBg = 'bg-red-500';
  const redHover = 'hover:bg-red-600';
  const yellowBg = 'bg-yellow-500';
  const yellowHover = 'hover:bg-yellow-600';
  const blueBg = 'bg-blue-500'; // Pour le bouton de suivi
  const blueHover = 'hover:bg-blue-600';

  const handleDeleteClick = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) {
      try {
        await deleteProject(project.id);
        onDelete(project.id);
        alert('Projet supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        alert('Échec de la suppression du projet. Veuillez vérifier la console.');
      }
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(project);
    }
  };

  const handleSelectForFollowUpClick = () => {
    if (onSelectForFollowUp) {
      onSelectForFollowUp(project);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Scroller vers le bas
    }
  };

  // Fonction utilitaire pour obtenir le nom du membre par ID
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    // Assurez-vous que les noms des membres sont bien 'first_name' et 'last_name' dans votre objet membre
    return member ? `${member.first_name || ''} ${member.last_name || ''}`.trim() : 'Membre inconnu';
  };

  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 flex flex-col border ${neutralBorder} hover:shadow-xl transition-shadow duration-300`}>
      {/* Nom et Type du Projet */}
      <h3 className={`text-xl font-bold ${primaryGreen} mb-2`}>{project.name}</h3>
      <p className="text-gray-700 text-sm mb-1">Type: <span className="font-normal">{project.project_type || 'N/A'}</span></p>
      
      {/* Description */}
      <p className="text-gray-700 text-sm mb-2">Description: <span className="font-normal">{project.description || 'N/A'}</span></p>
      
      {/* Budget Total */}
      <p className="text-gray-600 text-sm mb-1">Budget Total: <span className="font-normal">{project.budget ? `${project.budget.toLocaleString('fr-FR')} FCFA` : 'N/A'}</span></p>

      {/* Production Annuelle Escomptée */}
      {project.expected_production && project.expected_production.length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="text-gray-700 text-sm font-semibold">Production Annuelle Escomptée:</p>
          <ul className="list-disc list-inside text-gray-600 text-xs ml-2">
            {project.expected_production.map((prod, index) => (
              <li key={index}>{prod.product}: {prod.quantityKgPerYear} kg</li>
            ))}
          </ul>
        </div>
      )}

      {/* Détails d'Investissement */}
      {project.investment_details && Object.keys(project.investment_details).length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="text-gray-700 text-sm font-semibold">Détails d'Investissement:</p>
          <p className="text-gray-600 text-xs">Nombre de parts: {project.investment_details.numberOfShares || 'N/A'}</p>
          <p className="text-gray-600 text-xs">Coût par part: {project.investment_details.costPerShare ? `${project.investment_details.costPerShare.toLocaleString('fr-FR')} FCFA` : 'N/A'}</p>
          {project.investment_details.memberShares && project.investment_details.memberShares.length > 0 && (
            <div>
              <p className="text-gray-600 text-xs font-semibold mt-1">Membres Investisseurs:</p>
              <ul className="list-disc list-inside text-gray-600 text-xs ml-4">
                {project.investment_details.memberShares.map((ms, index) => (
                  <li key={index}>{getMemberName(ms.memberId)}: {ms.shares} parts</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Résultats Financiers Prévisionnels */}
      {project.financial_results && project.financial_results.length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="text-gray-700 text-sm font-semibold">Résultats Financiers Prévisionnels:</p>
          {project.financial_results.map((res, index) => (
            <p key={index} className="text-gray-600 text-xs">
              Année {res.year}: CA={res.turnover ? `${res.turnover.toLocaleString('fr-FR')} FCFA` : 'N/A'}, Revenu/Membre={res.revenuePerMember ? `${res.revenuePerMember.toLocaleString('fr-FR')} FCFA` : 'N/A'}
            </p>
          ))}
        </div>
      )}

      {/* Responsables du Projet */}
      {project.project_responsibles && project.project_responsibles.length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          <p className="text-gray-700 text-sm font-semibold">Responsables du Projet:</p>
          <ul className="list-disc list-inside text-gray-600 text-xs ml-2">
            {project.project_responsibles.map((resp, index) => (
              <li key={index}>{getMemberName(resp.memberId)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Boutons d'action (visible uniquement pour l'admin) */}
      {isAdmin && (
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleEditClick}
            className={`px-4 py-2 text-sm rounded-lg ${yellowBg} text-white ${yellowHover} transition-colors shadow-md`}
          >
            Éditer
          </button>
          <button
            onClick={handleDeleteClick}
            className={`px-4 py-2 text-sm rounded-lg ${redBg} text-white ${redHover} transition-colors shadow-md`}
          >
            Supprimer
          </button>
          <button
            onClick={handleSelectForFollowUpClick}
            className={`px-4 py-2 text-sm rounded-lg ${blueBg} text-white ${blueHover} transition-colors shadow-md`}
          >
            Ajouter Suivi
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
