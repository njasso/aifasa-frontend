import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTreasury, createTransaction, getSummary, deleteTransaction, getMemberFinancialStatus } from '../services/treasuryService';
import { getMembers } from '../services/memberService';
import FinanceTable from '../components/FinanceTable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title as ChartTitle } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Enregistrement des composants Chart.js nécessaires
ChartJS.register(
  ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, 
  BarElement, LineElement, 
  PointElement, ChartTitle
);

// --- Nouvelle palette de couleurs modernes ---
const colors = {
  primary: {
    main: 'text-indigo-600',
    light: 'text-indigo-400',
    dark: 'text-indigo-800',
    bg: 'bg-indigo-600',
    bgLight: 'bg-indigo-100',
    bgDark: 'bg-indigo-800',
    hover: 'hover:bg-indigo-700',
    border: 'border-indigo-300',
    ring: 'focus:ring-indigo-500'
  },
  secondary: {
    main: 'text-emerald-600',
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-100',
    hover: 'hover:bg-emerald-700',
    border: 'border-emerald-300',
    ring: 'focus:ring-emerald-500'
  },
  neutral: {
    dark: 'text-gray-800',
    medium: 'text-gray-600',
    light: 'text-gray-400',
    bg: 'bg-white',
    bgLight: 'bg-gray-50',
    border: 'border-gray-200',
    borderLight: 'border-gray-100'
  },
  alert: {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  }
};



const Treasury = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: {
      associationBudget: 0,
      socialContributionAccount: 0,
      tontineAccount: 0,
    },
    correlations: {},
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });

  // Fonction utilitaire pour obtenir le nom du membre par ID
const getMemberName = (memberId) => {
  const member = members.find(m => m.id === memberId);
  return member ? `${member.first_name || ''} ${member.last_name || ''}`.trim() : `ID: ${memberId}`;
};

  // États pour le suivi par membre
  const [selectedMemberIdForDetails, setSelectedMemberIdForDetails] = useState('');
  const [selectedMemberFinancialStatus, setSelectedMemberFinancialStatus] = useState(null);
  const [memberAlerts, setMemberAlerts] = useState([]);

  // Formulaire de transaction
  const [formData, setFormData] = useState({
    member_id: '',
    transactionType: '',
    amount: '',
    caisse: '',
    date: new Date().toISOString().split('T')[0],
    withdrawalReason: '',
    trancheNumber: '',
    tontineShares: '',
    disciplineReason: '',
    agAbsenceReason: '',
  });

  // Options pour les menus déroulants
  const transactionTypeOptions = {
    'inscription_nouveau': 'Inscription Nouveau Membre (5 000 FCFA)',
    'inscription_ancien': 'Inscription Ancien Membre (2 500 FCFA)',
    'droit_adhesion': 'Droit d\'Adhésion (2 500 FCFA)',
    'cotisation_sociale': 'Cotisation Sociale (50 000 FCFA)',
    'tontine': 'Tontine (10 000 FCFA/part)',
    'retrait_social': 'Retrait Compte Social',
    'discipline': 'Amende / Blâme',
    'absence_ag': 'Absence Assemblée Générale',
    'autre_depense': 'Autre Dépense',
    'autre_revenu': 'Autre Revenu',
  };

  const caisseOptions = {
    'budget_association': 'Budget de l\'Association',
    'compte_cotisation_sociale': 'Compte Cotisation Sociale',
    'tontine_account': 'Compte Tontine',
  };

  const socialWithdrawalReasons = {
    'deces_membre': 'Décès du Membre',
    'deces_conjoint': 'Décès du Conjoint',
    'deces_parent': 'Décès Parent',
    'deces_belle_mere': 'Décès Belle-Mère',
    'mariage': 'Mariage',
    'naissance': 'Naissance',
  };

  const disciplineReasons = {
    'retard': 'Retard',
    'blame': 'Blâme',
  };

  const agAbsenceReasons = {
    '1ere_absence': '1ère Absence AG',
    '2eme_absence': '2ème Absence AG',
  };

  const socialContributionTranches = {
    '1': { label: '1ère Tranche (Jan-Fév)', amount: 20000 },
    '2': { label: '2ème Tranche (Mar-Avr)', amount: 15000 },
    '3': { label: '3ème Tranche (Mai)', amount: 15000 },
  };

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [transactionsData, summaryData, membersData] = await Promise.all([
          getTreasury(),
          getSummary(),
          getMembers()
        ]);

        setTransactions(transactionsData);
        setSummary(summaryData && summaryData.balance ? summaryData : { balance: {}, correlations: {} });
        setMembers(membersData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setAlertMessage({ text: 'Erreur lors du chargement des données de trésorerie.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'treasurer' || user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  // Chargement des détails financiers du membre sélectionné
  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (selectedMemberIdForDetails) {
        try {
          const memberStatus = await getMemberFinancialStatus(selectedMemberIdForDetails);
          setSelectedMemberFinancialStatus(memberStatus);
          
          // Générer les alertes spécifiques au membre
          const alerts = [];
          const currentYear = new Date().getFullYear();
          const memberTransactions = transactions.filter(t => t.member_id === parseInt(selectedMemberIdForDetails));

          // Vérification Inscription Annuelle
          const lastInscription = memberTransactions.filter(t => t.type.startsWith('inscription_')).sort((a,b) => new Date(b.date) - new Date(a.date))[0];
          if (!lastInscription || new Date(lastInscription.date).getFullYear() < currentYear) {
            alerts.push('Inscription annuelle non à jour pour l\'année en cours');
          }

          // Vérification Droit d'Adhésion
          const adhesionPaid = memberTransactions.some(t => t.type === 'droit_adhesion');
          if (!adhesionPaid) {
            alerts.push('Droit d\'adhésion non payé');
          }

          // Vérification Cotisation Sociale
          const totalCotisationPaid = memberTransactions
            .filter(t => t.type === 'cotisation_sociale' && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0);
          if (totalCotisationPaid < 50000) {
            alerts.push(`Cotisation sociale incomplète (${totalCotisationPaid}/50000 FCFA)`);
          }

          setMemberAlerts(alerts);

        } catch (error) {
          console.error('Erreur lors du chargement des détails du membre:', error);
          setSelectedMemberFinancialStatus(null);
          setMemberAlerts(['Erreur lors du chargement des détails financiers']);
        }
      } else {
        setSelectedMemberFinancialStatus(null);
        setMemberAlerts([]);
      }
    };
    fetchMemberDetails();
  }, [selectedMemberIdForDetails, transactions]);

  // Gère les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Logique pour pré-remplir le montant et la caisse
    if (name === 'transactionType') {
      let newAmount = '';
      let newCaisse = '';

      switch (value) {
        case 'inscription_nouveau':
          newAmount = 5000;
          newCaisse = 'budget_association';
          break;
        case 'inscription_ancien':
          newAmount = 2500;
          newCaisse = 'budget_association';
          break;
        case 'droit_adhesion':
          newAmount = 2500;
          newCaisse = 'budget_association';
          break;
        case 'cotisation_sociale':
          newCaisse = 'compte_cotisation_sociale';
          break;
        case 'tontine':
          newAmount = 10000;
          newCaisse = 'tontine_account';
          break;
        case 'retrait_social':
          newCaisse = 'compte_cotisation_sociale';
          break;
        case 'discipline':
          newCaisse = 'budget_association';
          break;
        case 'absence_ag':
          newCaisse = 'budget_association';
          break;
        default:
          newAmount = '';
          newCaisse = '';
      }
      setFormData(prev => ({
        ...prev,
        amount: newAmount,
        caisse: newCaisse,
        withdrawalReason: '',
        trancheNumber: '',
        tontineShares: value === 'tontine' ? 1 : '',
        disciplineReason: '',
        agAbsenceReason: '',
      }));
    } else if (name === 'trancheNumber' && formData.transactionType === 'cotisation_sociale') {
      setFormData(prev => ({
        ...prev,
        amount: socialContributionTranches[value]?.amount || '',
      }));
    } else if (name === 'disciplineReason' && formData.transactionType === 'discipline') {
      setFormData(prev => ({
        ...prev,
        amount: value === 'retard' ? 1000 : (value === 'blame' ? 1000 : ''),
      }));
    } else if (name === 'agAbsenceReason' && formData.transactionType === 'absence_ag') {
      setFormData(prev => ({
        ...prev,
        amount: value === '1ere_absence' ? 15000 : (value === '2eme_absence' ? 25000 : ''),
      }));
    } else if (name === 'tontineShares' && formData.transactionType === 'tontine') {
      const shares = parseInt(value, 10);
      if (!isNaN(shares) && shares > 0 && shares <= 3) {
        setFormData(prev => ({ ...prev, amount: shares * 10000 }));
      } else {
        setFormData(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMessage({ text: '', type: '' });

    if (!formData.member_id || !formData.transactionType || !formData.amount || !formData.caisse || !formData.date) {
      setAlertMessage({ text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
      return;
    }

    const transactionData = {
      member_id: formData.member_id,
      type: formData.transactionType,
      amount: parseFloat(formData.amount),
      caisse: formData.caisse,
      date: formData.date,
      details: {},
    };

    // Ajout des détails spécifiques
    if (formData.transactionType === 'cotisation_sociale') {
      transactionData.details.trancheNumber = formData.trancheNumber;
    } else if (formData.transactionType === 'retrait_social') {
      transactionData.details.withdrawalReason = formData.withdrawalReason;
    } else if (formData.transactionType === 'tontine') {
      transactionData.details.tontineShares = parseInt(formData.tontineShares, 10);
    } else if (formData.transactionType === 'discipline') {
      transactionData.details.disciplineReason = formData.disciplineReason;
    } else if (formData.transactionType === 'absence_ag') {
      transactionData.details.agAbsenceReason = formData.agAbsenceReason;
    }

    try {
      const newTransaction = await createTransaction(transactionData);
      setTransactions(prev => [...prev, newTransaction]);
      
      const updatedSummary = await getSummary();
      setSummary(updatedSummary);

      setAlertMessage({ text: 'Transaction ajoutée avec succès !', type: 'success' });
      
      // Réinitialiser le formulaire
      setFormData({
        member_id: '',
        transactionType: '',
        amount: '',
        caisse: '',
        date: new Date().toISOString().split('T')[0],
        withdrawalReason: '',
        trancheNumber: '',
        tontineShares: '',
        disciplineReason: '',
        agAbsenceReason: '',
      });

      // Recharger les détails du membre si un membre est sélectionné
      if (selectedMemberIdForDetails) {
        const memberStatus = await getMemberFinancialStatus(selectedMemberIdForDetails);
        setSelectedMemberFinancialStatus(memberStatus);
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      const errorMessage = error.response?.data?.error || 'Erreur inconnue lors de l\'ajout de la transaction.';
      setAlertMessage({ text: `Échec de l'ajout: ${errorMessage}`, type: 'error' });
    }
  };

  // Gère la suppression d'une transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.')) {
      try {
        await deleteTransaction(transactionId);
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        
        const updatedSummary = await getSummary();
        setSummary(updatedSummary);

        setAlertMessage({ text: 'Transaction supprimée avec succès !', type: 'success' });

        // Recharger les détails du membre si un membre est sélectionné
        if (selectedMemberIdForDetails) {
          const memberStatus = await getMemberFinancialStatus(selectedMemberIdForDetails);
          setSelectedMemberFinancialStatus(memberStatus);
        }

      } catch (error) {
        console.error('Erreur lors de la suppression de la transaction:', error);
        const errorMessage = error.response?.data?.error || 'Erreur inconnue lors de la suppression de la transaction.';
        setAlertMessage({ text: `Échec de la suppression: ${errorMessage}`, type: 'error' });
      }
    }
  };

  // Filtrer les membres pour le sélecteur
  const filterMembers = useMemo(() => {
    return members.filter(m => m.role !== 'admin');
  }, [members]);

  // --- Données pour les graphiques modernes ---
  const safeBalance = summary.balance || {};
  
  // Graphique circulaire moderne
  const caisseBalanceChartData = {
    labels: Object.keys(safeBalance).map(key => caisseOptions[key] || key),
    datasets: [{
      data: Object.values(safeBalance),
      backgroundColor: [
        'rgba(99, 102, 241, 0.7)',  // Indigo
        'rgba(16, 185, 129, 0.7)',   // Emerald
        'rgba(245, 158, 11, 0.7)'    // Amber
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)'
      ],
      borderWidth: 2,
      hoverOffset: 10
    }],
  };

  // Options modernes pour le graphique circulaire
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw.toLocaleString('fr-FR')} FCFA`;
          }
        }
      }
    },
    cutout: '60%',
    borderRadius: 8
  };

  // Graphique linéaire moderne
  const historicalBalanceData = useMemo(() => {
    const data = {};
    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      data[date] = (data[date] || 0) + (t.caisse === 'budget_association' && t.amount || 0);
    });
    const sortedDates = Object.keys(data).sort();
    let cumulativeBalance = 0;
    const balances = sortedDates.map(date => {
      cumulativeBalance += data[date];
      return cumulativeBalance;
    });
    return { labels: sortedDates, data: balances };
  }, [transactions]);

  const lineChartData = {
    labels: historicalBalanceData.labels,
    datasets: [{
      label: 'Solde Total Cumulé (FCFA)',
      data: historicalBalanceData.data,
      fill: true,
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7,
      pointHitRadius: 20
    }],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw.toLocaleString('fr-FR')} FCFA`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('fr-FR') + ' FCFA';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Vérification des permissions
  if (user?.role !== 'treasurer' && user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className={`text-3xl font-bold mb-4 ${colors.primary.main}`}>Accès Interdit</h1>
        <p className="text-gray-700">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold ${colors.primary.main}`}>Gestion de la Trésorerie</h1>
          <p className={`mt-2 ${colors.neutral.medium}`}>Tableau de bord complet des finances de l'association</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className={`px-4 py-2 rounded-full ${colors.primary.bgLight} ${colors.primary.main} text-sm font-medium`}>
            Solde Total: {(safeBalance.associationBudget + safeBalance.socialContributionAccount + safeBalance.tontineAccount).toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      </div>

      {/* Section Alerte */}
      {alertMessage.text && (
        <div className={`mb-6 p-4 rounded-lg border ${colors.alert[alertMessage.type === 'success' ? 'success' : 'error']} flex items-start`}>
          <div className="flex-shrink-0">
            {alertMessage.type === 'success' ? (
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {alertMessage.text}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button 
              onClick={() => setAlertMessage({ text: '', type: '' })}
              className={`-mx-1.5 -my-1.5 inline-flex rounded-md p-1.5 ${alertMessage.type === 'success' ? 'text-green-500 hover:bg-green-100' : 'text-red-500 hover:bg-red-100'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${alertMessage.type === 'success' ? 'focus:ring-green-600' : 'focus:ring-red-600'}`}
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Carte Budget Association */}
        <div className={`rounded-xl shadow-sm border ${colors.neutral.border} overflow-hidden`}>
          <div className={`px-5 py-4 ${colors.primary.bg} flex items-center`}>
            <div className={`p-3 rounded-lg ${colors.primary.bgDark} mr-4`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Budget Association</h3>
              <p className="text-indigo-100 text-sm">Fonds opérationnels</p>
            </div>
          </div>
          <div className="px-5 py-6 bg-white">
            <p className="text-3xl font-bold text-gray-900">{safeBalance.associationBudget?.toLocaleString('fr-FR') || 0} <span className="text-lg font-normal text-gray-500">FCFA</span></p>
          </div>
        </div>

        {/* Carte Compte Social */}
        <div className={`rounded-xl shadow-sm border ${colors.neutral.border} overflow-hidden`}>
          <div className={`px-5 py-4 ${colors.secondary.bg} flex items-center`}>
            <div className="p-3 rounded-lg bg-emerald-700 mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Compte Social</h3>
              <p className="text-emerald-100 text-sm">Cotisations et aides</p>
            </div>
          </div>
          <div className="px-5 py-6 bg-white">
            <p className="text-3xl font-bold text-gray-900">{safeBalance.socialContributionAccount?.toLocaleString('fr-FR') || 0} <span className="text-lg font-normal text-gray-500">FCFA</span></p>
          </div>
        </div>

        {/* Carte Compte Tontine */}
        <div className={`rounded-xl shadow-sm border ${colors.neutral.border} overflow-hidden`}>
          <div className="px-5 py-4 bg-amber-500 flex items-center">
            <div className="p-3 rounded-lg bg-amber-600 mr-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Compte Tontine</h3>
              <p className="text-amber-100 text-sm">Épargne collective</p>
            </div>
          </div>
          <div className="px-5 py-6 bg-white">
            <p className="text-3xl font-bold text-gray-900">{safeBalance.tontineAccount?.toLocaleString('fr-FR') || 0} <span className="text-lg font-normal text-gray-500">FCFA</span></p>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout de transaction - Version moderne */}
      <div className={`rounded-xl shadow-md border ${colors.neutral.border} p-6 mb-8 bg-white`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${colors.primary.main}`}>Nouvelle Transaction</h2>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.primary.bgLight} ${colors.primary.main}`}>
            {formData.transactionType ? transactionTypeOptions[formData.transactionType] : 'Sélectionnez un type'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Sélecteur de Membre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membre *</label>
              <select
                name="member_id"
                value={formData.member_id}
                onChange={handleFormChange}
                className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                required
              >
                <option value="">Sélectionner un membre</option>
                {filterMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>
                ))}
              </select>
            </div>

            {/* Type de Transaction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleFormChange}
                className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                required
              >
                <option value="">Sélectionner un type</option>
                {Object.entries(transactionTypeOptions).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* Caisse Affectée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caisse *</label>
              <select
                name="caisse"
                value={formData.caisse}
                onChange={handleFormChange}
                className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                required
                disabled={['inscription_nouveau', 'inscription_ancien', 'droit_adhesion', 'cotisation_sociale', 'tontine', 'discipline', 'absence_ag'].includes(formData.transactionType)}
              >
                <option value="">Sélectionner une caisse</option>
                {Object.entries(caisseOptions).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA) *</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="amount"
                  placeholder="Montant"
                  value={formData.amount}
                  onChange={handleFormChange}
                  className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                  required
                  disabled={['inscription_nouveau', 'inscription_ancien', 'droit_adhesion', 'discipline', 'absence_ag'].includes(formData.transactionType)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">FCFA</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                required
              />
            </div>

            {/* Champs conditionnels */}
            {formData.transactionType === 'cotisation_sociale' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tranche *</label>
                <select
                  name="trancheNumber"
                  value={formData.trancheNumber}
                  onChange={handleFormChange}
                  className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                  required
                >
                  <option value="">Sélectionner une tranche</option>
                  {Object.entries(socialContributionTranches).map(([key, value]) => (
                    <option key={key} value={key}>{value.label} ({value.amount} FCFA)</option>
                  ))}
                </select>
              </div>
            )}

            {formData.transactionType === 'tontine' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Parts *</label>
                <input
                  type="number"
                  name="tontineShares"
                  placeholder="Nombre de parts"
                  value={formData.tontineShares}
                  onChange={handleFormChange}
                  min="1"
                  max="3"
                  className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                  required
                />
              </div>
            )}

            {formData.transactionType === 'retrait_social' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raison *</label>
                <select
                  name="withdrawalReason"
                  value={formData.withdrawalReason}
                  onChange={handleFormChange}
                  className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                  required
                >
                  <option value="">Sélectionner une raison</option>
                  {Object.entries(socialWithdrawalReasons).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.transactionType === 'discipline' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raison *</label>
                <select
                  name="disciplineReason"
                  value={formData.disciplineReason}
                  onChange={handleFormChange}
                  className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                  required
                >
                  <option value="">Sélectionner une raison</option>
                  {Object.entries(disciplineReasons).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.transactionType === 'absence_ag' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'Absence *</label>
                <select
                  name="agAbsenceReason"
                  value={formData.agAbsenceReason}
                  onChange={handleFormChange}
                  className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
                  required
                >
                  <option value="">Sélectionner le type</option>
                  {Object.entries(agAbsenceReasons).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-white ${colors.primary.bg} ${colors.primary.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Enregistrer la Transaction
            </button>
          </div>
        </form>
      </div>

      {/* Section Graphiques et Analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique circulaire moderne */}
        <div className={`rounded-xl shadow-md border ${colors.neutral.border} p-6 bg-white`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${colors.primary.main}`}>Répartition des Fonds</h3>
            <div className={`px-2 py-1 rounded text-xs ${colors.primary.bgLight} ${colors.primary.main}`}>
              {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div className="h-64">
            <Pie data={caisseBalanceChartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Graphique linéaire moderne */}
        <div className={`rounded-xl shadow-md border ${colors.neutral.border} p-6 bg-white`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${colors.primary.main}`}>Évolution du Solde</h3>
            <div className="flex space-x-2">
              <button className={`px-2 py-1 rounded text-xs ${colors.neutral.bgLight} ${colors.neutral.medium}`}>30j</button>
              <button className={`px-2 py-1 rounded text-xs ${colors.primary.bg} text-white`}>12m</button>
              <button className={`px-2 py-1 rounded text-xs ${colors.neutral.bgLight} ${colors.neutral.medium}`}>Tout</button>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Section Suivi Financier par Membre */}
      <div className={`rounded-xl shadow-md border ${colors.neutral.border} p-6 mb-8 bg-white`}>
        <h2 className={`text-2xl font-bold mb-6 ${colors.primary.main}`}>Suivi par Membre</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélecteur de membre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un Membre</label>
            <select
              value={selectedMemberIdForDetails}
              onChange={(e) => setSelectedMemberIdForDetails(e.target.value)}
              className={`block w-full rounded-lg border ${colors.neutral.border} py-3 px-4 shadow-sm focus:outline-none ${colors.primary.ring} focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">-- Sélectionner un membre --</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.first_name} {member.last_name}</option>
              ))}
            </select>
          </div>

          {/* Carte de statut si membre sélectionné */}
          {selectedMemberIdForDetails && (
            <div className={`rounded-lg border ${colors.neutral.border} p-5 bg-white shadow-sm`}>
              <div className="flex items-start">
                <div className={`flex-shrink-0 p-3 rounded-lg ${colors.primary.bgLight} ${colors.primary.main}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-medium ${colors.primary.main}`}>
                    {getMemberName(selectedMemberIdForDetails)}
                  </h3>
                  {selectedMemberFinancialStatus ? (
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Cotisation Sociale</p>
                        <p className="font-medium">
                          {selectedMemberFinancialStatus.socialContributionPaid?.toLocaleString('fr-FR') || 0}/50 000 FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Parts Tontine</p>
                        <p className="font-medium">
                          {selectedMemberFinancialStatus.tontineShares || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Droit Adhésion</p>
                        <p className="font-medium">
                          {selectedMemberFinancialStatus.adhesionPaid ? 'Payé' : 'Impayé'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Absences AG</p>
                        <p className="font-medium">
                          {selectedMemberFinancialStatus.agAbsenceCount || 0}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-2">Chargement des détails...</p>
                  )}
                </div>
              </div>

              {/* Alertes membre */}
              {memberAlerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Alertes</h4>
                  <ul className="space-y-2">
                    {memberAlerts.map((alert, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-red-600">{alert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className={`rounded-xl shadow-md border ${colors.neutral.border} p-6 bg-white`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${colors.primary.main}`}>Historique des Transactions</h2>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.neutral.bgLight} ${colors.neutral.medium}`}>
            {transactions.length} opérations
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par ajouter une nouvelle transaction.</p>
          </div>
        ) : (
          <FinanceTable
            transactions={transactions}
            balance={summary.balance}
            correlations={summary.correlations}
            members={members}
            transactionTypeOptions={transactionTypeOptions}
            caisseOptions={caisseOptions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </div>
    </div>
  );
};

export default Treasury;