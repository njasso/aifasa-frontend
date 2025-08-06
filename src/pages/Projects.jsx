import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';
import { getMembers } from '../services/memberService';
import ProjectCard from '../components/ProjectCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Configuration de Chart.js
ChartJS.register(
  ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, 
  BarElement, LineElement, PointElement, Title
);

// Configuration des couleurs
const colors = {
  primary: {
    green: '#2b8a3e',
    lightGreen: '#40c057',
    darkGreen: '#1e6a2e',
    brown: '#5c3c21',
    lightBrown: '#8a5a44'
  },
  secondary: {
    beige: '#f8f9fa',
    lightBeige: '#e9ecef',
    darkBeige: '#dee2e6'
  },
  accents: {
    gold: '#fcc419',
    lightGold: '#ffd43b'
  }
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [selectedProjectForFollowUp, setSelectedProjectForFollowUp] = useState(null);

  // États du formulaire principal
  const [formData, setFormData] = useState({
    name: '',
    projectType: '',
    description: '',
    budget: ''
  });

  // États des champs dynamiques
  const [expectedProductions, setExpectedProductions] = useState([{ product: '', quantityKgPerYear: '' }]);
  const [investmentDetails, setInvestmentDetails] = useState({
    numberOfShares: '',
    costPerShare: '',
    memberShares: [{ memberId: '', shares: '' }]
  });
  const [financialResults, setFinancialResults] = useState([{ year: '', turnover: '', revenuePerMember: '' }]);
  const [projectResponsibles, setProjectResponsibles] = useState([{ memberId: '' }]);

  // État pour le suivi
  const [currentFollowUpEntry, setCurrentFollowUpEntry] = useState({ 
    quarter: '', 
    year: '', 
    responsible: '', 
    quantityProduced: [{ product: '', quantity: '' }], 
    turnover: '' 
  });

  // Options
  const projectTypeOptions = ['Investissement Associatif', 'Investissement Partenarial'];
  const quarterOptions = [1, 2, 3, 4];

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsData, membersData] = await Promise.all([
          getProjects(),
          getMembers()
        ]);
        setProjects(projectsData);
        setMembers(membersData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonctions pour la gestion des productions attendues
  const handleAddExpectedProduction = () => {
    setExpectedProductions([...expectedProductions, { product: '', quantityKgPerYear: '' }]);
  };

  const handleRemoveExpectedProduction = (index) => {
    const list = [...expectedProductions];
    list.splice(index, 1);
    setExpectedProductions(list);
  };

  const handleExpectedProductionChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...expectedProductions];
    list[index][name] = value;
    setExpectedProductions(list);
  };

  // Fonctions pour la gestion des parts d'investissement
  const handleAddMemberShare = () => {
    setInvestmentDetails(prev => ({
      ...prev,
      memberShares: [...prev.memberShares, { memberId: '', shares: '' }]
    }));
  };

  const handleRemoveMemberShare = (index) => {
    const list = [...investmentDetails.memberShares];
    list.splice(index, 1);
    setInvestmentDetails(prev => ({ ...prev, memberShares: list }));
  };

  const handleMemberShareChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...investmentDetails.memberShares];
    list[index][name] = value;
    setInvestmentDetails(prev => ({ ...prev, memberShares: list }));
  };

  // Fonctions pour la gestion des responsables
  const handleAddResponsible = () => {
    if (projectResponsibles.length < 3) {
      setProjectResponsibles([...projectResponsibles, { memberId: '' }]);
    }
  };

  const handleRemoveResponsible = (index) => {
    const list = [...projectResponsibles];
    list.splice(index, 1);
    setProjectResponsibles(list);
  };

  const handleResponsibleChange = (e, index) => {
    const { value } = e.target;
    const list = [...projectResponsibles];
    list[index].memberId = value;
    setProjectResponsibles(list);
  };

  // Fonctions pour les résultats financiers
  const handleAddFinancialResult = () => {
    setFinancialResults([...financialResults, { year: '', turnover: '', revenuePerMember: '' }]);
  };

  const handleRemoveFinancialResult = (index) => {
    const list = [...financialResults];
    list.splice(index, 1);
    setFinancialResults(list);
  };

  const handleFinancialResultChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...financialResults];
    list[index][name] = value;
    setFinancialResults(list);
  };

  // Fonctions pour le suivi
  const handleFollowUpEntryChange = (e) => {
    const { name, value } = e.target;
    setCurrentFollowUpEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCurrentFollowUpProduct = () => {
    setCurrentFollowUpEntry(prev => ({
      ...prev,
      quantityProduced: [...prev.quantityProduced, { product: '', quantity: '' }]
    }));
  };

  const handleRemoveCurrentFollowUpProduct = (index) => {
    const list = [...currentFollowUpEntry.quantityProduced];
    list.splice(index, 1);
    setCurrentFollowUpEntry(prev => ({ ...prev, quantityProduced: list }));
  };

  const handleCurrentFollowUpProductChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...currentFollowUpEntry.quantityProduced];
    list[index][name] = value;
    setCurrentFollowUpEntry(prev => ({ ...prev, quantityProduced: list }));
  };

  // Fonction pour ajouter un suivi à un projet
  const handleAddFollowUpToProject = async (e) => {
    e.preventDefault();

    if (!selectedProjectForFollowUp) {
      alert("Veuillez sélectionner un projet pour ajouter un suivi.");
      return;
    }
    if (!currentFollowUpEntry.quarter || !currentFollowUpEntry.year || !currentFollowUpEntry.responsible) {
      alert("Veuillez remplir le trimestre, l'année et le responsable pour le suivi.");
      return;
    }

    const updatedFollowUps = selectedProjectForFollowUp.follow_ups ? [...selectedProjectForFollowUp.follow_ups] : [];
    updatedFollowUps.push({
      quarter: parseInt(currentFollowUpEntry.quarter, 10),
      year: parseInt(currentFollowUpEntry.year, 10),
      responsible: currentFollowUpEntry.responsible,
      quantityProduced: currentFollowUpEntry.quantityProduced.filter(p => p.product.trim() !== '' && p.quantity !== ''),
      turnover: parseFloat(currentFollowUpEntry.turnover) || 0,
    });

    const dataToSend = {
      ...selectedProjectForFollowUp,
      expectedProduction: JSON.stringify(selectedProjectForFollowUp.expected_production),
      investmentDetails: JSON.stringify(selectedProjectForFollowUp.investment_details),
      financialResults: JSON.stringify(selectedProjectForFollowUp.financial_results),
      projectResponsibles: JSON.stringify(selectedProjectForFollowUp.project_responsibles),
      followUps: JSON.stringify(updatedFollowUps),
    };

    try {
      const resultProject = await updateProject(selectedProjectForFollowUp.id, dataToSend);
      setProjects(projects.map(p => (p.id === resultProject.id ? resultProject : p)));
      setSelectedProjectForFollowUp(resultProject);
      setCurrentFollowUpEntry({ quarter: '', year: '', responsible: '', quantityProduced: [{ product: '', quantity: '' }], turnover: '' });
      alert("Suivi ajouté avec succès au projet !");
    } catch (error) {
      console.error("Erreur lors de l'ajout du suivi:", error);
      alert("Échec de l'ajout du suivi. Vérifiez la console.");
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetFormStates = () => {
    setFormData({ name: '', projectType: '', description: '', budget: '' });
    setExpectedProductions([{ product: '', quantityKgPerYear: '' }]);
    setInvestmentDetails({ numberOfShares: '', costPerShare: '', memberShares: [{ memberId: '', shares: '' }] });
    setFinancialResults([{ year: '', turnover: '', revenuePerMember: '' }]);
    setProjectResponsibles([{ memberId: '' }]);
  };

  // Fonction pour soumettre le formulaire principal
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.projectType.trim() || !formData.description.trim() || !formData.budget.trim()) {
      alert('Veuillez remplir les champs obligatoires : Nom, Type, Description, Budget.');
      return;
    }

    const dataToSend = {
      ...formData,
      budget: parseFloat(formData.budget),
      expectedProduction: JSON.stringify(expectedProductions.filter(p => p.product.trim() !== '' && p.quantityKgPerYear !== '')),
      investmentDetails: JSON.stringify({
        numberOfShares: parseFloat(investmentDetails.numberOfShares) || 0,
        costPerShare: parseFloat(investmentDetails.costPerShare) || 0,
        memberShares: investmentDetails.memberShares.filter(ms => ms.memberId.trim() !== '' && ms.shares !== ''),
      }),
      financialResults: JSON.stringify(financialResults.filter(fr => fr.year !== '' && fr.turnover !== '')),
      projectResponsibles: JSON.stringify(projectResponsibles.filter(pr => pr.memberId.trim() !== '')),
      followUps: JSON.stringify([]),
    };

    try {
      let resultProject;
      if (editingId) {
        resultProject = await updateProject(editingId, dataToSend);
        alert('Projet mis à jour avec succès !');
      } else {
        resultProject = await createProject(dataToSend);
        alert('Projet ajouté avec succès !');
      }
      
      const updatedProjects = editingId
        ? projects.map((p) => (p.id === editingId ? resultProject : p))
        : [...projects, resultProject];
      setProjects(updatedProjects);

      setEditingId(null);
      resetFormStates();
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le projet:', error);
      alert('Échec de l\'opération. Veuillez vérifier la console pour les détails.');
    }
  };

  // Fonction pour éditer un projet
  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name || '',
      projectType: project.project_type || '',
      description: project.description || '',
      budget: project.budget || '',
    });

    setExpectedProductions(project.expected_production?.length > 0 ? project.expected_production : [{ product: '', quantityKgPerYear: '' }]);
    setInvestmentDetails(project.investment_details ? project.investment_details : { numberOfShares: '', costPerShare: '', memberShares: [{ memberId: '', shares: '' }] });
    setFinancialResults(project.financial_results?.length > 0 ? project.financial_results : [{ year: '', turnover: '', revenuePerMember: '' }]);
    setProjectResponsibles(project.project_responsibles?.length > 0 ? project.project_responsibles : [{ memberId: '' }]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour supprimer un projet
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      try {
        await deleteProject(id);
        setProjects(projects.filter((p) => p.id !== id));
        alert('Projet supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        alert('Échec de la suppression du projet. Veuillez vérifier la console.');
      }
    }
  };

  // Fonction utilitaire pour obtenir le nom d'un membre
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.first_name || ''} ${member.last_name || ''}`.trim() : 'Membre inconnu';
  };

  // Filtrage des projets
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || (project.project_type || '').toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Préparation des données pour les graphiques
  const projectTypeCounts = projects.reduce((acc, project) => {
    acc[project.project_type || 'Non défini'] = (acc[project.project_type || 'Non défini'] || 0) + 1;
    return acc;
  }, {});

  const projectTypeChartData = {
    labels: Object.keys(projectTypeCounts),
    datasets: [{
      data: Object.values(projectTypeCounts),
      backgroundColor: [
        colors.primary.green,
        colors.primary.brown,
        colors.accents.gold,
        colors.secondary.darkBeige
      ],
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  const annualTurnoverData = projects.reduce((acc, project) => {
    if (project.financial_results) {
      project.financial_results.forEach(fr => {
        if (fr.year && fr.turnover) {
          acc[fr.year] = (acc[fr.year] || 0) + fr.turnover;
        }
      });
    }
    return acc;
  }, {});

  const sortedTurnoverYears = Object.keys(annualTurnoverData).sort();
  const annualTurnoverChartData = {
    labels: sortedTurnoverYears,
    datasets: [{
      label: 'Chiffre d\'Affaires Annuel (FCFA)',
      data: sortedTurnoverYears.map(year => annualTurnoverData[year]),
      borderColor: colors.primary.green,
      backgroundColor: `${colors.primary.green}20`,
      pointBackgroundColor: colors.primary.green,
      pointBorderColor: '#fff',
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  // Calcul des statistiques globales
  const stats = projects.reduce((acc, p) => {
    acc.totalBudget += p.budget || 0;
    
    if (p.expected_production) {
      acc.totalExpectedProductionKg += p.expected_production.reduce((sum, ep) => sum + (ep.quantityKgPerYear || 0), 0);
    }
    
    if (p.financial_results) {
      acc.totalActualTurnover += p.financial_results.reduce((sum, fr) => sum + (fr.turnover || 0), 0);
    }
    
    return acc;
  }, { 
    totalBudget: 0, 
    totalExpectedProductionKg: 0, 
    totalActualTurnover: 0 
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-brown-800">
            Gestion des Projets AGR
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Suivez et gérez tous vos projets d'Agriculture Rurale en un seul endroit
        </p>
      </div>

      {/* Formulaire d'ajout/édition */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? 'Modifier le Projet' : 'Nouveau Projet'}
            </h2>
            {editingId && (
              <button
                onClick={() => { setEditingId(null); resetFormStates(); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Annuler
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champs de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de projet*</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {projectTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Budget */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (FCFA)*</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Sections dynamiques avec accordéon */}
            <div className="space-y-4">
              {/* Production attendue */}
              <div className="border rounded-lg overflow-hidden">
                <details open className="group">
                  <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer list-none">
                    <span className="font-medium text-gray-900">Production Annuelle Escomptée</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 space-y-4">
                    {expectedProductions.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Produit</label>
                          <input
                            type="text"
                            name="product"
                            value={item.product}
                            onChange={(e) => handleExpectedProductionChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Quantité (kg)</label>
                          <input
                            type="number"
                            name="quantityKgPerYear"
                            value={item.quantityKgPerYear}
                            onChange={(e) => handleExpectedProductionChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpectedProduction(idx)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          disabled={expectedProductions.length <= 1}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddExpectedProduction}
                      className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                    >
                      + Ajouter un produit
                    </button>
                  </div>
                </details>
              </div>

              {/* Détails d'investissement */}
              <div className="border rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer list-none">
                    <span className="font-medium text-gray-900">Détails d'Investissement</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Nombre total de parts</label>
                        <input
                          type="number"
                          name="numberOfShares"
                          value={investmentDetails.numberOfShares}
                          onChange={(e) => setInvestmentDetails({...investmentDetails, numberOfShares: e.target.value})}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Coût par part (FCFA)</label>
                        <input
                          type="number"
                          name="costPerShare"
                          value={investmentDetails.costPerShare}
                          onChange={(e) => setInvestmentDetails({...investmentDetails, costPerShare: e.target.value})}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                    </div>

                    <h4 className="font-medium text-gray-700">Parts des membres investisseurs:</h4>
                    {investmentDetails.memberShares.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Membre</label>
                          <select
                            name="memberId"
                            value={item.memberId}
                            onChange={(e) => handleMemberShareChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
                          >
                            <option value="">Sélectionner un membre</option>
                            {members.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Nombre de parts</label>
                          <input
                            type="number"
                            name="shares"
                            value={item.shares}
                            onChange={(e) => handleMemberShareChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberShare(idx)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          disabled={investmentDetails.memberShares.length <= 1}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddMemberShare}
                      className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                    >
                      + Ajouter un investisseur
                    </button>
                  </div>
                </details>
              </div>

              {/* Responsables du projet */}
              <div className="border rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer list-none">
                    <span className="font-medium text-gray-900">Responsables du Projet</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 space-y-4">
                    {projectResponsibles.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Responsable</label>
                          <select
                            name="memberId"
                            value={item.memberId}
                            onChange={(e) => handleResponsibleChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
                          >
                            <option value="">Sélectionner un responsable</option>
                            {members.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveResponsible(idx)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          disabled={projectResponsibles.length <= 1}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    {projectResponsibles.length < 3 && (
                      <button
                        type="button"
                        onClick={handleAddResponsible}
                        className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                      >
                        + Ajouter un responsable
                      </button>
                    )}
                  </div>
                </details>
              </div>

              {/* Résultats financiers */}
              <div className="border rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer list-none">
                    <span className="font-medium text-gray-900">Résultats Financiers Prévisionnels</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 space-y-4">
                    {financialResults.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Année</label>
                          <input
                            type="number"
                            name="year"
                            value={item.year}
                            onChange={(e) => handleFinancialResultChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">CA (FCFA)</label>
                          <input
                            type="number"
                            name="turnover"
                            value={item.turnover}
                            onChange={(e) => handleFinancialResultChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Revenu/membre (FCFA)</label>
                          <input
                            type="number"
                            name="revenuePerMember"
                            value={item.revenuePerMember}
                            onChange={(e) => handleFinancialResultChange(e, idx)}
                            className="w-full px-3 py-2 rounded border border-gray-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFinancialResult(idx)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                          disabled={financialResults.length <= 1}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddFinancialResult}
                      className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                    >
                      + Ajouter une année
                    </button>
                  </div>
                </details>
              </div>
            </div>

            {/* Boutons de soumission */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
              >
                {editingId ? 'Mettre à jour' : 'Créer le projet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistiques et graphiques */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Aperçu des Projets</h2>
        
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Projets Actifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{projects.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Intl.NumberFormat('fr-FR').format(stats.totalBudget)} FCFA
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Production Totale</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Intl.NumberFormat('fr-FR').format(stats.totalExpectedProductionKg)} kg
                </p>
              </div>
              <div className="p-3 rounded-full bg-brown-50 text-brown-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">CA Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Intl.NumberFormat('fr-FR').format(stats.totalActualTurnover)} FCFA
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Type</h3>
            <div className="h-64">
              <Pie 
                data={projectTypeChartData} 
                options={{
                  cutout: '65%',
                  radius: '90%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        font: {
                          family: "'Inter', sans-serif",
                          size: 12
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      titleFont: { size: 14 },
                      bodyFont: { size: 12 },
                      padding: 12,
                      cornerRadius: 8
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Chiffre d'Affaires Annuel</h3>
            <div className="h-64">
              <Line 
                data={annualTurnoverChartData} 
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      titleFont: { size: 14 },
                      bodyFont: { size: 12 }
                    }
                  },
                  scales: {
                    y: {
                      grid: { display: true, drawBorder: false },
                      ticks: { font: { family: "'Inter', sans-serif" } }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { family: "'Inter', sans-serif" } }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Tous les Projets</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white w-full sm:w-48"
            >
              <option value="all">Tous types</option>
              {projectTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun projet trouvé</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? "Essayez de modifier vos critères de recherche." 
                : "Aucun projet n'a été créé pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
                userRole={user?.role}
                members={members}
                onSelectForFollowUp={setSelectedProjectForFollowUp}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section de suivi des projets */}
      {selectedProjectForFollowUp && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Suivi du Projet: {selectedProjectForFollowUp.name}
            </h2>
            <button
              onClick={() => setSelectedProjectForFollowUp(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Fermer
            </button>
          </div>

          {/* Formulaire d'ajout de suivi */}
          <form onSubmit={handleAddFollowUpToProject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre*</label>
                <select
                  name="quarter"
                  value={currentFollowUpEntry.quarter}
                  onChange={handleFollowUpEntryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  required
                >
                  <option value="">Sélectionner</option>
                  {quarterOptions.map(q => (
                    <option key={q} value={q}>T{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année*</label>
                <input
                  type="number"
                  name="year"
                  value={currentFollowUpEntry.year}
                  onChange={handleFollowUpEntryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable*</label>
                <select
                  name="responsible"
                  value={currentFollowUpEntry.responsible}
                  onChange={handleFollowUpEntryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  required
                >
                  <option value="">Sélectionner</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chiffre d'Affaires (FCFA)</label>
              <input
                type="number"
                name="turnover"
                value={currentFollowUpEntry.turnover}
                onChange={handleFollowUpEntryChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <details open className="group">
                <summary className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">Production Réalisée</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-4 space-y-4">
                  {currentFollowUpEntry.quantityProduced.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Produit</label>
                        <input
                          type="text"
                          name="product"
                          value={item.product}
                          onChange={(e) => handleCurrentFollowUpProductChange(e, idx)}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Quantité (kg)</label>
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleCurrentFollowUpProductChange(e, idx)}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCurrentFollowUpProduct(idx)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                        disabled={currentFollowUpEntry.quantityProduced.length <= 1}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCurrentFollowUpProduct}
                    className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                  >
                    + Ajouter un produit
                  </button>
                </div>
              </details>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
              >
                Enregistrer le suivi
              </button>
            </div>
          </form>

          {/* Historique des suivis */}
          {selectedProjectForFollowUp.follow_ups?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Historique des Suivis</h3>
              <div className="space-y-4">
                {selectedProjectForFollowUp.follow_ups.map((followUp, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Trimestre {followUp.quarter} {followUp.year}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Responsable: {getMemberName(followUp.responsible) || followUp.responsible}
                        </p>
                      </div>
                      {followUp.turnover && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {new Intl.NumberFormat('fr-FR').format(followUp.turnover)} FCFA
                        </span>
                      )}
                    </div>

                    {followUp.quantityProduced?.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Production:</h5>
                        <ul className="space-y-1">
                          {followUp.quantityProduced.map((prod, pIdx) => (
                            <li key={pIdx} className="text-sm text-gray-600">
                              {prod.product}: <span className="font-medium">{prod.quantity} kg</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;