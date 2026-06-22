// src/pages/private/Treasury.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getTreasury, 
  createTransaction, 
  getSummary, 
  deleteTransaction, 
  getMemberFinancialStatus 
} from '../../services/treasuryService';
import { getMembers } from '../../services/memberService';
import FinanceTable from '../../components/FinanceTable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title as ChartTitle } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, Users, DollarSign,
  Calendar, AlertCircle, Download, Search,
  Plus, X, Eye, Trash2, FileText, 
  CheckCircle, Clock, RefreshCw,
  PieChart, BarChart3, ArrowUpRight,
  ArrowDownRight, CreditCard, Landmark, PiggyBank, Gift,
  Loader2, Filter, Settings, Printer, Save
} from 'lucide-react';

ChartJS.register(
  ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, 
  BarElement, LineElement, 
  PointElement, ChartTitle
);

// ============================================================
// CONSTANTES
// ============================================================
const currentYear = new Date().getFullYear();

const MONTANTS_FIXES = {
  inscription_nouveau: 5000,
  inscription_ancien: 2500,
  droit_adhesion: 2500,
  cotisation_sociale: 25000,
  tontine: 10000,
};

const transactionTypeOptions = {
  'inscription_nouveau': { label: 'Inscription Nouveau Membre', amount: MONTANTS_FIXES.inscription_nouveau, emoji: '🆕' },
  'inscription_ancien': { label: 'Inscription Ancien Membre', amount: MONTANTS_FIXES.inscription_ancien, emoji: '📝' },
  'droit_adhesion': { label: "Droit d'Adhésion", amount: MONTANTS_FIXES.droit_adhesion, emoji: '🤝' },
  'cotisation_sociale': { label: 'Cotisation Sociale', amount: MONTANTS_FIXES.cotisation_sociale, emoji: '💚' },
  'tontine': { label: 'Tontine', amount: MONTANTS_FIXES.tontine, emoji: '💰' },
  'retrait_social': { label: 'Retrait Compte Social', amount: 0, emoji: '🏦' },
  'discipline': { label: 'Amende / Blâme', amount: 0, emoji: '⚖️' },
  'absence_ag': { label: 'Absence Assemblée Générale', amount: 0, emoji: '📅' },
  'autre_depense': { label: 'Autre Dépense', amount: 0, emoji: '💳' },
  'autre_revenu': { label: 'Autre Revenu', amount: 0, emoji: '📈' },
};

const caisseOptions = {
  'budget_association': { label: 'Budget Association', icon: Wallet, color: '#4f46e5', bg: 'bg-indigo-50' },
  'compte_cotisation_sociale': { label: 'Compte Social', icon: PiggyBank, color: '#10b981', bg: 'bg-emerald-50' },
  'tontine_account': { label: 'Compte Tontine', icon: Gift, color: '#f59e0b', bg: 'bg-amber-50' },
};

// ============================================================
// COMPOSANTS UI
// ============================================================
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, loading }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-500 mt-3">{title}</p>
    {loading ? (
      <div className="flex items-center gap-2 mt-1">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Chargement...</span>
      </div>
    ) : (
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {!title.includes('taux') && !title.includes('Taux') && typeof value === 'number' && ' FCFA'}
      </p>
    )}
    {subtitle && !loading && (
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    )}
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const config = {
    'À jour': { bg: 'bg-green-100', text: 'text-green-700', icon: '✅', label: 'À jour' },
    'En retard': { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⚠️', label: 'En retard' },
    'Suspendu': { bg: 'bg-red-100', text: 'text-red-700', icon: '❌', label: 'Suspendu' },
    'Nouveau': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🆕', label: 'Nouveau' }
  };
  const s = config[status] || config['En retard'];
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 ${s.bg} ${s.text}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ============================================================
// PAGE PRINCIPALE
// ============================================================
const Treasury = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTreasurer = user?.role === 'treasurer';
  const hasAccess = isAdmin || isTreasurer;

  // États
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: { budget_association: 0, compte_cotisation_sociale: 0, tontine_account: 0 },
    correlations: {}
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberDetails, setMemberDetails] = useState(null);
  const [memberAlerts, setMemberAlerts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    member_id: '',
    type: '',
    amount: '',
    caisse: '',
    date: new Date().toISOString().split('T')[0],
    details: {},
    is_budget: false,
    is_old_account: false,
    description: ''
  });

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [transactionsData, summaryData, membersData] = await Promise.all([
        getTreasury(),
        getSummary(),
        getMembers()
      ]);
      setTransactions(transactionsData || []);
      setSummary(summaryData?.balance ? summaryData : { balance: { budget_association: 0, compte_cotisation_sociale: 0, tontine_account: 0 }, correlations: {} });
      setMembers(membersData || []);
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ message: 'Erreur lors du chargement des données', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) fetchData();
  }, [hasAccess, fetchData]);

  // Chargement des détails du membre
  useEffect(() => {
    const loadMemberDetails = async () => {
      if (!selectedMemberId) {
        setMemberDetails(null);
        setMemberAlerts([]);
        return;
      }
      try {
        const status = await getMemberFinancialStatus(selectedMemberId);
        setMemberDetails(status);
        
        const alerts = [];
        const memberTransactions = transactions.filter(t => t.member_id === parseInt(selectedMemberId));

        // Vérifier l'inscription annuelle
        const lastInscription = memberTransactions
          .filter(t => t.type.startsWith('inscription_'))
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (!lastInscription || new Date(lastInscription.date).getFullYear() < currentYear) {
          alerts.push(`Inscription annuelle non à jour pour ${currentYear}`);
        }

        // Vérifier le droit d'adhésion
        const adhesionPaid = memberTransactions.some(t => t.type === 'droit_adhesion');
        if (!adhesionPaid) {
          alerts.push("Droit d'adhésion non payé");
        }

        // Vérifier la cotisation sociale
        const totalSocial = memberTransactions
          .filter(t => t.type === 'cotisation_sociale' && new Date(t.date).getFullYear() === currentYear)
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        if (totalSocial < MONTANTS_FIXES.cotisation_sociale) {
          alerts.push(`Cotisation sociale incomplète (${totalSocial.toLocaleString()}/${MONTANTS_FIXES.cotisation_sociale.toLocaleString()} FCFA)`);
        }

        setMemberAlerts(alerts);
      } catch (error) {
        console.error('Erreur:', error);
        setMemberDetails(null);
        setMemberAlerts(['Erreur lors du chargement des détails']);
      }
    };
    loadMemberDetails();
  }, [selectedMemberId, transactions]);

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));

    // Auto-remplir le montant selon le type
    if (name === 'type') {
      const amount = transactionTypeOptions[value]?.amount || '';
      const caisse = value === 'cotisation_sociale' ? 'compte_cotisation_sociale' :
                     value === 'tontine' ? 'tontine_account' :
                     ['inscription_nouveau', 'inscription_ancien', 'droit_adhesion', 'discipline', 'absence_ag'].includes(value) 
                       ? 'budget_association' : '';
      setFormData(prev => ({ ...prev, amount, caisse }));
    }
  };

  // ============================================================
  // SOUMISSION
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (!formData.type || !formData.amount || !formData.caisse) {
      setAlert({ message: 'Veuillez remplir tous les champs obligatoires', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData = {
        member_id: formData.member_id ? parseInt(formData.member_id) : null,
        type: formData.type,
        amount: parseFloat(formData.amount),
        caisse: formData.caisse,
        date: formData.date,
        details: formData.details,
        is_budget: formData.is_budget || false,
        is_old_account: formData.is_old_account || false,
        description: formData.description
      };

      const newTransaction = await createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      
      const updatedSummary = await getSummary();
      setSummary(updatedSummary);

      setAlert({ message: 'Transaction enregistrée avec succès !', type: 'success' });
      setShowTransactionModal(false);
      resetForm();
      
      if (selectedMemberId) {
        const status = await getMemberFinancialStatus(selectedMemberId);
        setMemberDetails(status);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ message: error.response?.data?.error || 'Erreur lors de l\'enregistrement', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      type: '',
      amount: '',
      caisse: '',
      date: new Date().toISOString().split('T')[0],
      details: {},
      is_budget: false,
      is_old_account: false,
      description: ''
    });
  };

  // ============================================================
  // SUPPRESSION
  // ============================================================
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) return;
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      const updatedSummary = await getSummary();
      setSummary(updatedSummary);
      setAlert({ message: 'Transaction supprimée avec succès', type: 'success' });
    } catch (error) {
      console.error('Erreur:', error);
      setAlert({ message: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  // ============================================================
  // CALCULS
  // ============================================================
  const safeBalance = summary.balance || {};

  const stats = useMemo(() => {
    // Total des cotisations sociales (uniquement cotisation_sociale)
    const totalCotisations = transactions
      .filter(t => t.type === 'cotisation_sociale')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Total des inscriptions + adhésion
    const totalInscriptionsAdhesion = transactions
      .filter(t => ['inscription_nouveau', 'inscription_ancien', 'droit_adhesion'].includes(t.type))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Total des sanctions
    const totalSanctions = transactions
      .filter(t => ['discipline', 'absence_ag'].includes(t.type))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Total des dépenses
    const totalDepenses = transactions
      .filter(t => ['retrait_social', 'autre_depense'].includes(t.type))
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Total des revenus divers
    const totalRevenusDivers = transactions
      .filter(t => t.type === 'autre_revenu')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Membres à jour (calcul corrigé)
    const membresAjour = members.filter(m => {
      const mTransactions = transactions.filter(t => t.member_id === m.id);
      
      // Vérifier l'inscription de l'année en cours
      const inscriptionPaid = mTransactions
        .filter(t => ['inscription_nouveau', 'inscription_ancien'].includes(t.type) 
          && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      // Vérifier la cotisation sociale de l'année en cours
      const socialPaid = mTransactions
        .filter(t => t.type === 'cotisation_sociale' 
          && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      // Vérifier le droit d'adhésion (une seule fois)
      const adhesionPaid = mTransactions.some(t => t.type === 'droit_adhesion');
      
      const inscriptionOk = inscriptionPaid >= MONTANTS_FIXES.inscription_ancien;
      const socialOk = socialPaid >= MONTANTS_FIXES.cotisation_sociale;
      
      return adhesionPaid && inscriptionOk && socialOk;
    }).length;

    return {
      totalCotisations,
      totalInscriptionsAdhesion,
      totalSanctions,
      totalDepenses,
      totalRevenusDivers,
      totalTransactions: transactions.length,
      membresAjour,
      totalMembres: members.length,
    };
  }, [transactions, members]);

  // Graphique
  const chartData = {
    labels: Object.keys(caisseOptions).map(key => caisseOptions[key]?.label || key),
    datasets: [{
      data: Object.keys(caisseOptions).map(key => safeBalance[key] || 0),
      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b'],
      borderColor: ['#4338ca', '#059669', '#d97706'],
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  // ============================================================
  // PERMISSIONS
  // ============================================================
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès Interdit</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* ======== EN-TÊTE ======== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-indigo-600" />
              Trésorerie
            </h1>
            <p className="text-gray-500 mt-1">Gestion complète des finances de l'association</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-100 rounded-full">
              <span className="text-sm font-semibold text-indigo-700">
                Solde: {(
                  (safeBalance.budget_association || 0) + 
                  (safeBalance.compte_cotisation_sociale || 0) + 
                  (safeBalance.tontine_account || 0)
                ).toLocaleString()} FCFA
              </span>
            </div>
            <button
              onClick={fetchData}
              className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* ======== ALERTES ======== */}
        <AnimatePresence>
          {alert.message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl border ${
                alert.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{alert.message}</p>
                <button 
                  onClick={() => setAlert({ message: '', type: '' })}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======== ONGLETS ======== */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl shadow-sm p-1 border border-gray-100">
          {[
            { id: 'dashboard', label: '📊 Tableau de bord' },
            { id: 'membres', label: '👥 Membres' },
            { id: 'transactions', label: '💰 Transactions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* TAB: TABLEAU DE BORD */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* Stats - Première ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard 
                title="Cotisations Sociales" 
                value={stats.totalCotisations} 
                icon={PiggyBank} 
                color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                subtitle={`${MONTANTS_FIXES.cotisation_sociale.toLocaleString()} FCFA/membre/an`}
                loading={loading}
              />
              <StatCard 
                title="Inscriptions & Adhésions" 
                value={stats.totalInscriptionsAdhesion} 
                icon={Users} 
                color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                loading={loading}
              />
              <StatCard 
                title="Sanctions" 
                value={stats.totalSanctions} 
                icon={AlertCircle} 
                color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
                loading={loading}
              />
              <StatCard 
                title="Dépenses Totales" 
                value={stats.totalDepenses} 
                icon={TrendingDown} 
                color={{ bg: 'bg-red-50', text: 'text-red-600' }}
                loading={loading}
              />
            </div>

            {/* Stats - Deuxième ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                title="Membres à jour" 
                value={`${stats.membresAjour}/${stats.totalMembres}`} 
                icon={CheckCircle} 
                color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                subtitle={`${stats.totalMembres - stats.membresAjour} en retard`}
                loading={loading}
              />
              <StatCard 
                title="Taux de conformité" 
                value={stats.totalMembres > 0 
                  ? `${Math.round((stats.membresAjour / stats.totalMembres) * 100)}%` 
                  : '0%'} 
                icon={TrendingUp} 
                color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
                loading={loading}
              />
              <StatCard 
                title="Revenus divers" 
                value={stats.totalRevenusDivers} 
                icon={ArrowUpRight} 
                color={{ bg: 'bg-teal-50', text: 'text-teal-600' }}
                loading={loading}
              />
              <StatCard 
                title="Total transactions" 
                value={stats.totalTransactions} 
                icon={CreditCard} 
                color={{ bg: 'bg-gray-50', text: 'text-gray-600' }}
                loading={loading}
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Répartition des Fonds
                </h3>
                <div className="h-64">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                    <Pie 
                      data={chartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
                          tooltip: { 
                            callbacks: { 
                              label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString()} FCFA` 
                            } 
                          }
                        },
                        cutout: '55%'
                      }} 
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Résumé des Caisses
                </h3>
                <div className="space-y-4">
                  {Object.entries(caisseOptions).map(([key, c]) => (
                    <div key={key} className={`flex justify-between items-center p-3 rounded-xl ${c.bg}`}>
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <c.icon className="w-4 h-4" style={{ color: c.color }} />
                        {c.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {(safeBalance[key] || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-sm font-bold text-indigo-700">TOTAL</span>
                    <span className="text-sm font-bold text-indigo-700">
                      {(
                        (safeBalance.budget_association || 0) + 
                        (safeBalance.compte_cotisation_sociale || 0) + 
                        (safeBalance.tontine_account || 0)
                      ).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle transaction
                </button>
                <button
                  onClick={() => setActiveTab('membres')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                >
                  <Users className="w-4 h-4" />
                  Voir les membres
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Historique
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB: MEMBRES */}
        {/* ============================================================ */}
        {activeTab === 'membres' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Membre</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Adhésion</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Inscription {currentYear}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Social {currentYear}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Reste dû</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Statut</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {members
                        .filter(m => {
                          const name = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
                          return name.includes(searchTerm.toLowerCase());
                        })
                        .map(m => {
                          const mTransactions = transactions.filter(t => t.member_id === m.id);
                          
                          // Inscription annuelle
                          const inscriptionPaid = mTransactions
                            .filter(t => ['inscription_ancien', 'inscription_nouveau'].includes(t.type) 
                              && new Date(t.date).getFullYear() === currentYear)
                            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                          
                          // Cotisation sociale
                          const socialPaid = mTransactions
                            .filter(t => t.type === 'cotisation_sociale' 
                              && new Date(t.date).getFullYear() === currentYear)
                            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                          
                          // Droit d'adhésion (une seule fois)
                          const adhesionPaid = mTransactions.some(t => t.type === 'droit_adhesion');
                          
                          const totalInscription = MONTANTS_FIXES.inscription_ancien;
                          const totalSocial = MONTANTS_FIXES.cotisation_sociale;
                          const totalAdhesion = MONTANTS_FIXES.droit_adhesion;
                          
                          // Reste à payer
                          const resteInscription = Math.max(0, totalInscription - inscriptionPaid);
                          const resteSocial = Math.max(0, totalSocial - socialPaid);
                          const resteAdhesion = adhesionPaid ? 0 : totalAdhesion;
                          const resteTotal = resteInscription + resteSocial + resteAdhesion;
                          
                          // Déterminer le statut
                          let status = 'À jour';
                          if (!adhesionPaid || resteInscription > 0 || resteSocial > 0) {
                            status = 'En retard';
                            if (!adhesionPaid && socialPaid === 0 && inscriptionPaid === 0) {
                              status = 'Nouveau';
                            }
                          }
                          
                          return (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-800">
                                  {m.first_name} {m.last_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {m.profession || 'Non spécifié'}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {adhesionPaid ? 
                                  <span className="text-green-600 font-semibold">
                                    <CheckCircle className="w-5 h-5 mx-auto" />
                                    2 500 FCFA
                                  </span> : 
                                  <span className="text-red-600 font-semibold">
                                    {totalAdhesion.toLocaleString()} FCFA
                                  </span>
                                }
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`font-semibold ${inscriptionPaid >= totalInscription ? 'text-green-600' : 'text-amber-600'}`}>
                                    {inscriptionPaid.toLocaleString()} / {totalInscription.toLocaleString()}
                                  </span>
                                  {inscriptionPaid < totalInscription && (
                                    <span className="text-xs text-red-500 mt-1">
                                      Reste: {resteInscription.toLocaleString()} FCFA
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`font-semibold ${socialPaid >= totalSocial ? 'text-green-600' : 'text-amber-600'}`}>
                                    {socialPaid.toLocaleString()} / {totalSocial.toLocaleString()}
                                  </span>
                                  {socialPaid < totalSocial && (
                                    <span className="text-xs text-red-500 mt-1">
                                      Reste: {resteSocial.toLocaleString()} FCFA
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-semibold">
                                {resteTotal > 0 ? (
                                  <span className="text-red-600">{resteTotal.toLocaleString()} FCFA</span>
                                ) : (
                                  <span className="text-green-600">✅ À jour</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={status} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => setSelectedMemberId(m.id)}
                                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 hover:bg-indigo-50 rounded-lg"
                                  title="Voir détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                {members.filter(m => {
                  const name = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
                  return name.includes(searchTerm.toLowerCase());
                }).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun membre trouvé</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB: TRANSACTIONS */}
        {/* ============================================================ */}
        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Historique ({transactions.length})
              </h3>
              <button
                onClick={() => setShowTransactionModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nouvelle transaction
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucune transaction</h4>
                <p className="text-gray-400">Commencez par ajouter une nouvelle transaction.</p>
              </div>
            ) : (
              <FinanceTable
                transactions={transactions}
                balance={summary.balance}
                correlations={summary.correlations}
                members={members}
                transactionTypeOptions={Object.fromEntries(
                  Object.entries(transactionTypeOptions).map(([k, v]) => [k, v.label])
                )}
                caisseOptions={Object.fromEntries(
                  Object.entries(caisseOptions).map(([k, v]) => [k, v.label])
                )}
                onDeleteTransaction={handleDelete}
              />
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* MODAL D'AJOUT */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showTransactionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTransactionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Nouvelle transaction
                  </h3>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Membre</label>
                    <select
                      name="member_id"
                      value={formData.member_id}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="">Sélectionner un membre (optionnel)</option>
                      {members.filter(m => m.role !== 'admin').map(m => (
                        <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {Object.entries(transactionTypeOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.emoji} {value.label} - {value.amount.toLocaleString()} FCFA
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caisse *</label>
                    <select
                      name="caisse"
                      value={formData.caisse}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      required
                      disabled={['inscription_nouveau', 'inscription_ancien', 'droit_adhesion', 'cotisation_sociale', 'tontine', 'discipline', 'absence_ag'].includes(formData.type)}
                    >
                      <option value="">Sélectionner une caisse</option>
                      {Object.entries(caisseOptions).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant *</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        required
                        disabled={['inscription_nouveau', 'inscription_ancien', 'droit_adhesion', 'discipline', 'absence_ag'].includes(formData.type)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_budget"
                        checked={formData.is_budget}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      Budget
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_old_account"
                        checked={formData.is_old_account}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      Ancien compte
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Informations complémentaires..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowTransactionModal(false)}
                      className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* MODAL DÉTAILS MEMBRE */}
        {/* ============================================================ */}
        {selectedMemberId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {members.find(m => m.id === parseInt(selectedMemberId))?.first_name}{' '}
                  {members.find(m => m.id === parseInt(selectedMemberId))?.last_name}
                </h3>
                <button
                  onClick={() => setSelectedMemberId(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {memberDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Social {currentYear}</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {(memberDetails.socialContributionPaid || 0).toLocaleString()} / {MONTANTS_FIXES.cotisation_sociale.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Tontine</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {memberDetails.tontineShares || 0} parts
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Adhésion</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {memberDetails.adhesionPaid ? '✅ Payé' : '❌ Impayé'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Absences AG</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {memberDetails.agAbsenceCount || 0}
                      </p>
                    </div>
                  </div>

                  {memberAlerts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">Alertes</h4>
                      <ul className="space-y-1">
                        {memberAlerts.map((alert, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {alert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-gray-400 mt-2">Chargement...</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedMemberId(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Treasury;