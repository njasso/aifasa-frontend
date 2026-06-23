// src/pages/private/Treasury.jsx — v3 Production
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getTreasury, createTransaction, getSummary, deleteTransaction,
  getMemberFinancialStatus, getSanctions, createSanction,
  recoverSanction, waiveSanction, getCashOperations,
  createCashOperation, deleteCashOperation
} from '../../services/treasuryService';
import { getMembers } from '../../services/memberService';
import FinanceTable from '../../components/FinanceTable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Title as ChartTitle, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, Users, AlertCircle, Search,
  Plus, X, Eye, Trash2, CheckCircle, RefreshCw, PieChart,
  BarChart3, ArrowUpRight, ArrowDownRight, CreditCard, PiggyBank,
  Gift, Loader2, Printer, Scale, BookOpen, Landmark
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ChartTitle, Filler);

// ─── Constantes ───────────────────────────────────────────────────
const YEAR = new Date().getFullYear();

const MONTANTS = {
  inscription_nouveau: 5000, inscription_ancien: 2500,
  droit_adhesion: 2500, cotisation_sociale: 50000, tontine: 10000,
};

const TX_OPTS = {
  inscription_nouveau: { label: 'Inscription Nouveau Membre (5 000)',  emoji: '🆕', montant: 5000,  caisse: 'budget_association' },
  inscription_ancien:  { label: 'Inscription Ancien Membre (2 500)',   emoji: '📝', montant: 2500,  caisse: 'budget_association' },
  droit_adhesion:      { label: "Droit d'Adhésion (2 500)",           emoji: '🤝', montant: 2500,  caisse: 'budget_association' },
  cotisation_sociale:  { label: 'Cotisation Sociale',                  emoji: '💚', montant: null, caisse: 'compte_cotisation_sociale' },
  tontine:             { label: 'Tontine (10 000/part)',               emoji: '💰', montant: 10000, caisse: 'tontine_account' },
  retrait_social:      { label: 'Retrait Compte Social',               emoji: '🏦', montant: null, caisse: 'compte_cotisation_sociale' },
  discipline:          { label: 'Amende / Blâme',                      emoji: '⚖️', montant: null, caisse: 'budget_association' },
  absence_ag:          { label: 'Absence Assemblée Générale',          emoji: '📅', montant: null, caisse: 'budget_association' },
  autre_depense:       { label: 'Autre Dépense',                       emoji: '💳', montant: null, caisse: '' },
  autre_revenu:        { label: 'Autre Revenu',                        emoji: '📈', montant: null, caisse: '' },
};

const CAISSES = {
  budget_association:        { label: 'Budget Association',   icon: Wallet,    color: '#4f46e5', bg: 'bg-indigo-50 text-indigo-800' },
  compte_cotisation_sociale: { label: 'Compte Social',        icon: PiggyBank, color: '#10b981', bg: 'bg-emerald-50 text-emerald-800' },
  tontine_account:           { label: 'Compte Tontine',       icon: Gift,      color: '#f59e0b', bg: 'bg-amber-50 text-amber-800' },
};

const PAYMENT_METHODS = ['OM','Orange Money','MTN MoMo','FS','Virement','Cash','Chèque'];

const SANCTION_TYPES = {
  retard:       { label: 'Retard',              montant: 1000  },
  blame:        { label: 'Blâme',               montant: 1000  },
  absence_ag_1: { label: '1ère Absence AG',     montant: 15000 },
  absence_ag_2: { label: '2ème Absence AG',     montant: 25000 },
  autre:        { label: 'Autre sanction',       montant: null  },
};

const CASH_OP_TYPES = {
  entree: {
    retour_ag:       'Retour caisse après AG',
    remboursement:   'Remboursement reçu',
    autre_entree:    'Autre entrée',
  },
  sortie: {
    honoraires:      'Honoraires / Services externes',
    voir_bebe:       'Voir Bébé / Aide sociale',
    remboursement_emprunt: 'Remboursement emprunt',
    frais_ag:        "Frais d'Assemblée Générale",
    motivation_tresorier: 'Motivation Trésorier',
    autre_sortie:    'Autre sortie',
  },
};

const COMPTES = {
  caisse_courante: 'Caisse Courante',
  fonds_social:    'Fonds Social',
  uba_epargne:     'UBA Épargne',
  fonds_tresorier: 'Fonds Trésorier',
};

// ─── Helpers UI ───────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
const INP = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors bg-white';
const LBL = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5';

const Badge = ({ children, color = 'gray' }) => {
  const c = {
    gray:   'bg-gray-100 text-gray-600',
    green:  'bg-emerald-100 text-emerald-700',
    red:    'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue:   'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c[color] || c.gray}`}>{children}</span>;
};

const KpiCard = ({ title, value, icon: Icon, bg = 'bg-white', textColor = 'text-gray-900', sub }) => (
  <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}
    className={`${bg} rounded-2xl p-5 border border-gray-100 shadow-sm`}>
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 bg-white/60 rounded-xl"><Icon size={18} className="text-current opacity-70" /></div>
    </div>
    <p className="text-xs font-semibold text-current opacity-60 uppercase tracking-wide">{title}</p>
    <p className={`text-2xl font-black mt-1 ${textColor}`}>{value}</p>
    {sub && <p className="text-xs opacity-50 mt-0.5">{sub}</p>}
  </motion.div>
);

const AlertBanner = ({ text, type, onClose }) => {
  const s = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  };
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm mb-4 ${s[type]||s.info}`}>
      <span className="font-medium">{text}</span>
      <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
const Treasury = () => {
  const { user } = useAuth();
  const hasAccess = ['admin','treasurer'].includes(user?.role);

  const TABS = [
    { id: 'dashboard',    label: 'Tableau de bord', icon: PieChart },
    { id: 'membres',      label: 'Membres & FS',    icon: Users },
    { id: 'transactions', label: 'Transactions',    icon: CreditCard },
    { id: 'sanctions',    label: 'Sanctions',       icon: Scale },
    { id: 'journal',      label: 'Journal de Caisse', icon: BookOpen },
  ];

  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: { budget_association: 0, compte_cotisation_sociale: 0, tontine_account: 0 } });
  const [members, setMembers] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [cashOps, setCashOps] = useState([]);

  const notify = useCallback((text, type = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, sum, mem] = await Promise.all([getTreasury(), getSummary(), getMembers()]);
      setTransactions(tx || []);
      setSummary(sum?.balance ? sum : { balance: {} });
      setMembers(mem || []);
      // Sanctions et journal en secondaire
      try {
        const [san, ops] = await Promise.all([getSanctions(), getCashOperations()]);
        setSanctions(san || []);
        setCashOps(ops || []);
      } catch {/* optionnel */}
    } catch {
      notify('Erreur lors du chargement', 'error');
    } finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { if (hasAccess) fetchAll(); }, [hasAccess, fetchAll]);

  const safe = summary.balance || {};

  const stats = useMemo(() => {
    const byType = k => transactions.filter(t => k.includes(t.type)).reduce((a, t) => a + parseFloat(t.amount || 0), 0);
    const membresOk = members.filter(m => {
      const mt = transactions.filter(t => t.member_id === m.id);
      const insOk = mt.some(t => ['inscription_ancien','inscription_nouveau'].includes(t.type) && new Date(t.date).getFullYear() === YEAR);
      const socOk = mt.filter(t => t.type === 'cotisation_sociale' && new Date(t.date).getFullYear() === YEAR).reduce((a,t)=>a+parseFloat(t.amount||0),0) >= MONTANTS.cotisation_sociale;
      const adhOk = mt.some(t => t.type === 'droit_adhesion');
      return insOk && socOk && adhOk;
    }).length;
    return {
      totalCotisations: byType(['cotisation_sociale']),
      totalInscriptions: byType(['inscription_nouveau','inscription_ancien','droit_adhesion']),
      totalSanctions: byType(['discipline','absence_ag']),
      totalDepenses: byType(['retrait_social','autre_depense']),
      totalTontine: byType(['tontine']),
      membresOk, totalMembres: members.length,
      txCount: transactions.length,
    };
  }, [transactions, members]);

  const totalCaisses = (safe.budget_association || 0) + (safe.compte_cotisation_sociale || 0) + (safe.tontine_account || 0);

  const sanctSummary = useMemo(() => ({
    totalInitial: sanctions.reduce((a, s) => a + parseFloat(s.initial_amount || 0), 0),
    totalRecovered: sanctions.reduce((a, s) => a + parseFloat(s.recovered_amount || 0), 0),
    pending: sanctions.filter(s => ['pending','partial'].includes(s.status)).length,
  }), [sanctions]);

  if (!hasAccess) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Accès restreint</h2>
        <p className="text-sm text-gray-500">Réservé aux administrateurs et trésoriers.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── EN-TÊTE ─── */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/images/logo.png" alt="AIFASA 17"
                className="h-12 w-12 rounded-full object-contain bg-white/10 p-1 border border-white/20 shadow-lg"
                onError={e => e.target.style.display = 'none'} />
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">AIFASA 17</p>
                <h1 className="text-3xl font-black tracking-tight">Gestion de la Trésorerie</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                <p className="text-xs text-indigo-200 font-semibold">Solde total caisses</p>
                <p className="text-2xl font-black text-amber-300">{fmt(totalCaisses)} FCFA</p>
              </div>
              <button onClick={fetchAll}
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors" title="Actualiser">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => window.print()}
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors">
                <Printer size={16} />
              </button>
            </div>
          </div>

          {/* Cartes caisses dans l'en-tête */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {Object.entries(CAISSES).map(([k, c]) => {
              const Icon = c.icon;
              return (
                <div key={k} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl"><Icon size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-white/60 font-medium truncate">{c.label}</p>
                    <p className="font-black text-base truncate">{fmt(safe[k] || 0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── ONGLETS ─── */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  tab === t.id ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <Icon size={14} />{t.label}
                {t.id === 'sanctions' && sanctSummary.pending > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{sanctSummary.pending}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CONTENU ─── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence>{alert && <AlertBanner text={alert.text} type={alert.type} onClose={() => setAlert(null)} />}</AnimatePresence>

        {loading && (
          <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {tab === 'dashboard'    && <TabDashboard stats={stats} safe={safe} transactions={transactions} totalCaisses={totalCaisses} sanctSummary={sanctSummary} setTab={setTab} />}
              {tab === 'membres'      && <TabMembres members={members} transactions={transactions} notify={notify} />}
              {tab === 'transactions' && <TabTransactions transactions={transactions} setTransactions={setTransactions} members={members} setSummary={setSummary} notify={notify} />}
              {tab === 'sanctions'    && <TabSanctions sanctions={sanctions} setSanctions={setSanctions} members={members} notify={notify} />}
              {tab === 'journal'      && <TabJournal cashOps={cashOps} setCashOps={setCashOps} notify={notify} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 1 — DASHBOARD
// ═══════════════════════════════════════════════════════════════════
const TabDashboard = ({ stats, safe, transactions, totalCaisses, sanctSummary, setTab }) => {
  const pieData = {
    labels: Object.values(CAISSES).map(c => c.label),
    datasets: [{
      data: Object.keys(CAISSES).map(k => Math.max(0, safe[k] || 0)),
      backgroundColor: ['rgba(79,70,229,.8)','rgba(16,185,129,.8)','rgba(245,158,11,.8)'],
      borderWidth: 2, borderColor: '#fff', hoverOffset: 8,
    }]
  };

  const evoData = useMemo(() => {
    const byDate = {};
    transactions.forEach(t => {
      const d = (t.date || '').split('T')[0];
      if (t.caisse === 'budget_association') byDate[d] = (byDate[d] || 0) + parseFloat(t.amount || 0);
    });
    const sorted = Object.keys(byDate).sort();
    let cum = 0;
    return { labels: sorted, data: sorted.map(d => { cum += byDate[d]; return cum; }) };
  }, [transactions]);

  const lineData = {
    labels: evoData.labels,
    datasets: [{ label: 'Solde cumulé', data: evoData.data, borderColor: 'rgb(99,102,241)',
      backgroundColor: 'rgba(99,102,241,.08)', fill: true, tension: 0.3, borderWidth: 2, pointRadius: 3 }]
  };

  const conformite = stats.totalMembres > 0 ? Math.round((stats.membresOk / stats.totalMembres) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs ligne 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Cotisations Sociales" value={fmt(stats.totalCotisations)+' FCFA'} icon={PiggyBank}
          bg="bg-gradient-to-br from-emerald-50 to-emerald-100" textColor="text-emerald-900" />
        <KpiCard title="Inscriptions & Adhésions" value={fmt(stats.totalInscriptions)+' FCFA'} icon={Users}
          bg="bg-gradient-to-br from-blue-50 to-blue-100" textColor="text-blue-900" />
        <KpiCard title="Sanctions recouvrées" value={fmt(stats.totalSanctions)+' FCFA'} icon={Scale}
          bg="bg-gradient-to-br from-amber-50 to-amber-100" textColor="text-amber-900" />
        <KpiCard title="Tontine" value={fmt(stats.totalTontine)+' FCFA'} icon={Gift}
          bg="bg-gradient-to-br from-purple-50 to-purple-100" textColor="text-purple-900" />
      </div>

      {/* KPIs ligne 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Membres à jour" value={`${stats.membresOk}/${stats.totalMembres}`} icon={CheckCircle}
          bg="bg-white" sub={`${stats.totalMembres - stats.membresOk} en retard`} />
        <KpiCard title="Conformité" value={`${conformite}%`} icon={TrendingUp} bg="bg-white"
          sub={`objectif : 100%`} />
        <KpiCard title="Sanctions en attente" value={sanctSummary.pending} icon={AlertCircle} bg="bg-white"
          sub={fmt(sanctSummary.totalInitial - sanctSummary.totalRecovered)+' FCFA restant'} />
        <KpiCard title="Nb transactions" value={stats.txCount} icon={CreditCard} bg="bg-white" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-indigo-600" /> Répartition des fonds
          </h3>
          <div className="h-56">
            <Pie data={pieData} options={{ cutout:'58%', plugins:{ legend:{ position:'bottom', labels:{ usePointStyle:true, padding:12 } } } }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-600" /> Évolution caisse courante
          </h3>
          <div className="h-56">
            <Line data={lineData} options={{
              plugins: { legend: { display: false } },
              scales: { y: { ticks: { callback: v => fmt(v) }, grid: { color: '#f3f4f6' } }, x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } } }
            }} />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Actions rapides</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Nouvelle transaction', tab: 'transactions', color: 'bg-indigo-600 hover:bg-indigo-700', icon: Plus },
            { label: 'Suivi membres',        tab: 'membres',      color: 'bg-emerald-600 hover:bg-emerald-700', icon: Users },
            { label: 'Gérer les sanctions',  tab: 'sanctions',    color: 'bg-amber-600 hover:bg-amber-700', icon: Scale },
            { label: 'Journal de caisse',    tab: 'journal',      color: 'bg-purple-600 hover:bg-purple-700', icon: BookOpen },
          ].map(({ label, tab: t, color, icon: Icon }) => (
            <button key={t} onClick={() => setTab(t)}
              className={`${color} text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-sm hover:shadow-md`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 2 — MEMBRES & FS
// ═══════════════════════════════════════════════════════════════════
const TabMembres = ({ members, transactions, notify }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const enriched = useMemo(() => members.map(m => {
    const mt = transactions.filter(t => t.member_id === m.id);
    const ins25 = mt.filter(t => ['inscription_ancien','inscription_nouveau'].includes(t.type) && new Date(t.date||'').getFullYear() === 2025).reduce((a,t)=>a+parseFloat(t.amount||0),0);
    const ins26 = mt.filter(t => ['inscription_ancien','inscription_nouveau'].includes(t.type) && new Date(t.date||'').getFullYear() === YEAR).reduce((a,t)=>a+parseFloat(t.amount||0),0);
    const socPaid = mt.filter(t => t.type === 'cotisation_sociale' && new Date(t.date||'').getFullYear() === YEAR).reduce((a,t)=>a+parseFloat(t.amount||0),0);
    const adhPaid = mt.some(t => t.type === 'droit_adhesion');
    const fsSolde = mt.filter(t => t.caisse === 'compte_cotisation_sociale').reduce((a,t)=>a+parseFloat(t.amount||0),0);
    const sanctionsPending = 0; // sera alimenté depuis l'API sanctions en vraie prod
    const resteIns = Math.max(0, MONTANTS.inscription_ancien - ins26);
    const resteSoc = Math.max(0, MONTANTS.cotisation_sociale - socPaid);
    const resteAdh = adhPaid ? 0 : MONTANTS.droit_adhesion;
    const resteTotal = resteIns + resteSoc + resteAdh;
    let status = 'À jour';
    if (!adhPaid || resteIns > 0 || resteSoc > 0) {
      status = (!adhPaid && socPaid === 0 && ins26 === 0) ? 'Nouveau' : 'En retard';
    }
    return { ...m, ins25, ins26, socPaid, adhPaid, fsSolde, resteTotal, status };
  }), [members, transactions]);

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return enriched
      .filter(m => `${m.first_name||''} ${m.last_name||''}`.toLowerCase().includes(q))
      .filter(m => filter === 'all' ? true : filter === 'alerte' ? m.resteTotal > 0 : m.resteTotal === 0);
  }, [enriched, search, filter]);

  const totalFs = enriched.reduce((a,m) => a+m.fsSolde, 0);
  const membresOk = enriched.filter(m => m.status === 'À jour').length;

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-emerald-600 uppercase">Solde FS Total</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{fmt(totalFs)} FCFA</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-600 uppercase">Inscrits {YEAR}</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{enriched.filter(m=>m.ins26>0).length} / {members.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-red-600 uppercase">En retard</p>
          <p className="text-2xl font-black text-red-900 mt-1">{members.length - membresOk}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre…"
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full text-sm outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[['all','Tous'],['alerte','⚠ Alertes'],['ok','✓ À jour']].map(([id,label]) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter===id?'bg-white text-indigo-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Nom','Ins. 2025','Ins. 2026','Cotisation Sociale','Solde FS','Reste dû','Statut'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visible.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-gray-400">{m.profession || '—'}</p>
                </td>
                <td className="px-4 py-3">
                  {m.ins25 > 0 ? <Badge color="green">{fmt(m.ins25)}</Badge> : <Badge color="red">Non payé</Badge>}
                </td>
                <td className="px-4 py-3">
                  {m.ins26 > 0 ? <Badge color="green">{fmt(m.ins26)}</Badge> : <Badge color="red">Non payé</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (m.socPaid/MONTANTS.cotisation_sociale)*100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${m.socPaid >= MONTANTS.cotisation_sociale ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {fmt(m.socPaid)}/{fmt(MONTANTS.cotisation_sociale)}
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-3 font-bold ${m.fsSolde < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {fmt(m.fsSolde)} FCFA
                </td>
                <td className="px-4 py-3">
                  {m.resteTotal > 0
                    ? <span className="text-red-600 font-bold">{fmt(m.resteTotal)} FCFA</span>
                    : <span className="text-emerald-600 text-xs font-bold">✓ À jour</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge color={m.status==='À jour'?'green':m.status==='Nouveau'?'blue':'yellow'}>{m.status}</Badge>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Aucun membre trouvé</td></tr>
            )}
          </tbody>
          {visible.length > 0 && (
            <tfoot className="bg-indigo-50 border-t border-indigo-100 font-bold text-sm">
              <tr>
                <td className="px-4 py-3 text-gray-700">TOTAUX</td>
                <td className="px-4 py-3 text-emerald-700">{fmt(visible.reduce((a,m)=>a+m.ins25,0))}</td>
                <td className="px-4 py-3 text-emerald-700">{fmt(visible.reduce((a,m)=>a+m.ins26,0))}</td>
                <td className="px-4 py-3 text-emerald-700">{fmt(visible.reduce((a,m)=>a+m.socPaid,0))}</td>
                <td className="px-4 py-3 text-indigo-700">{fmt(visible.reduce((a,m)=>a+m.fsSolde,0))} FCFA</td>
                <td className="px-4 py-3 text-red-600">{fmt(visible.reduce((a,m)=>a+m.resteTotal,0))} FCFA</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 3 — TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════
const TX_FORM_DEFAULT = {
  member_id: '', transactionType: '', amount: '', caisse: '',
  date: new Date().toISOString().split('T')[0],
  payment_method: '', note: '', tontineShares: 1, trancheNumber: '',
};

const TRANCHES = {
  '1': { label: '1ère Tranche (Jan–Fév)', amount: 20000 },
  '2': { label: '2ème Tranche (Mar–Avr)', amount: 15000 },
  '3': { label: '3ème Tranche (Mai)',      amount: 15000 },
};

const TabTransactions = ({ transactions, setTransactions, members, setSummary, notify }) => {
  const [form, setForm] = useState(TX_FORM_DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const filterMembers = useMemo(() => members.filter(m => m.role !== 'admin'), [members]);

  const handleType = type => {
    const opt = TX_OPTS[type];
    setForm(f => ({
      ...f, transactionType: type,
      amount: opt?.montant || '',
      caisse: opt?.caisse || '',
      tontineShares: type === 'tontine' ? 1 : f.tontineShares,
      trancheNumber: '',
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const details = {};
      if (form.transactionType === 'tontine') details.tontineShares = parseInt(form.tontineShares) || 1;
      if (form.transactionType === 'cotisation_sociale') details.trancheNumber = form.trancheNumber;
      const tx = await createTransaction({
        member_id: form.member_id || null, type: form.transactionType,
        amount: parseFloat(form.amount), caisse: form.caisse,
        date: form.date, payment_method: form.payment_method,
        note: form.note, details,
      });
      setTransactions(p => [tx, ...p]);
      const updated = await getSummary();
      setSummary(updated);
      setForm(TX_FORM_DEFAULT);
      notify('Transaction enregistrée ✓');
    } catch (err) { notify(err.response?.data?.error || 'Erreur', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette transaction ?')) return;
    try {
      await deleteTransaction(id);
      setTransactions(p => p.filter(t => t.id !== id));
      notify('Transaction supprimée');
    } catch { notify('Erreur', 'error'); }
  };

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter(t =>
      ((t.first_name||'')+' '+(t.last_name||'')).toLowerCase().includes(q) &&
      (filterType === 'all' || t.type === filterType)
    );
  }, [transactions, search, filterType]);

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-indigo-600" /> Nouvelle transaction
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={LBL}>Membre</label>
            <select value={form.member_id} onChange={e => setForm(f=>({...f,member_id:e.target.value}))} className={INP}>
              <option value="">— Sélectionner —</option>
              {filterMembers.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Type *</label>
            <select value={form.transactionType} onChange={e => handleType(e.target.value)} className={INP} required>
              <option value="">— Type —</option>
              {Object.entries(TX_OPTS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Moyen de paiement</label>
            <select value={form.payment_method} onChange={e => setForm(f=>({...f,payment_method:e.target.value}))} className={INP}>
              <option value="">—</option>
              {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Caisse *</label>
            <select value={form.caisse} onChange={e => setForm(f=>({...f,caisse:e.target.value}))} className={INP} required>
              <option value="">—</option>
              {Object.entries(CAISSES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Montant (FCFA) *</label>
            <input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} className={INP} required />
          </div>
          <div>
            <label className={LBL}>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className={INP} required />
          </div>

          {form.transactionType === 'tontine' && (
            <div>
              <label className={LBL}>Nombre de parts (1–3)</label>
              <input type="number" min="1" max="3" value={form.tontineShares}
                onChange={e => {const n=parseInt(e.target.value)||1; setForm(f=>({...f,tontineShares:n,amount:n*10000}));}}
                className={INP} />
            </div>
          )}

          {form.transactionType === 'cotisation_sociale' && (
            <div>
              <label className={LBL}>Tranche</label>
              <select value={form.trancheNumber}
                onChange={e => setForm(f=>({...f,trancheNumber:e.target.value,amount:TRANCHES[e.target.value]?.amount||''}))}
                className={INP}>
                <option value="">—</option>
                {Object.entries(TRANCHES).map(([k,v]) => <option key={k} value={k}>{v.label} ({fmt(v.amount)} FCFA)</option>)}
              </select>
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LBL}>Note / Observation</label>
            <input value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
              placeholder="Détail optionnel, raison du retrait…"
              className={`${INP} w-full`} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</> : '✓ Enregistrer la transaction'}
            </button>
          </div>
        </form>
      </div>

      {/* Filtres + liste */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl w-full text-sm outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none">
            <option value="all">Tous types</option>
            {Object.entries(TX_OPTS).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
          <span className="text-sm text-gray-400 font-medium self-center">{visible.length} opérations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>{['Date','Membre','Type','Moyen','Caisse','Montant','Note',''].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.slice(0, 100).map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{(t.date||'').split('T')[0]}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{t.first_name} {t.last_name}</td>
                  <td className="px-3 py-2.5"><Badge color="indigo">{TX_OPTS[t.type]?.emoji} {TX_OPTS[t.type]?.label||t.type}</Badge></td>
                  <td className="px-3 py-2.5"><span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{t.payment_method||'—'}</span></td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{CAISSES[t.caisse]?.label||t.caisse}</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700">{fmt(t.amount)} FCFA</td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{t.note||'—'}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Aucune transaction</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {visible.length > 100 && (
          <p className="text-xs text-gray-400 text-center mt-3">Affichage limité aux 100 premières. Utilisez la recherche pour affiner.</p>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 4 — SANCTIONS
// ═══════════════════════════════════════════════════════════════════
const TabSanctions = ({ sanctions, setSanctions, members, notify }) => {
  const [form, setForm] = useState({
    member_id: '', type: '', description: '',
    initial_amount: '', sanction_date: new Date().toISOString().split('T')[0], payment_method: ''
  });
  const [recovery, setRecovery] = useState({ id: null, amount: '', payment_method: 'OM', recovery_date: new Date().toISOString().split('T')[0] });
  const [filter, setFilter] = useState('all');

  const handleCreate = async e => {
    e.preventDefault();
    try {
      const s = await createSanction(form);
      setSanctions(p => [s, ...p]);
      setForm({ member_id:'', type:'', description:'', initial_amount:'', sanction_date: new Date().toISOString().split('T')[0], payment_method:'' });
      notify('Sanction enregistrée ✓');
    } catch { notify('Erreur', 'error'); }
  };

  const handleRecover = async () => {
    if (!recovery.id) return;
    try {
      const s = await recoverSanction(recovery.id, { recovered_amount: parseFloat(recovery.amount), payment_method: recovery.payment_method, recovery_date: recovery.recovery_date });
      setSanctions(p => p.map(x => x.id === s.id ? s : x));
      setRecovery({ id: null, amount: '', payment_method: 'OM', recovery_date: new Date().toISOString().split('T')[0] });
      notify('Recouvrement enregistré ✓');
    } catch { notify('Erreur', 'error'); }
  };

  const totalInitial   = sanctions.reduce((a,s) => a+parseFloat(s.initial_amount||0), 0);
  const totalRecovered = sanctions.reduce((a,s) => a+parseFloat(s.recovered_amount||0), 0);
  const totalPending   = totalInitial - totalRecovered;

  const STATUS_COLOR = { pending: 'red', partial: 'yellow', recovered: 'green', waived: 'gray' };
  const STATUS_LABEL = { pending: 'En attente', partial: 'Partiel', recovered: 'Recouvré', waived: 'Annulé' };

  const visible = filter === 'all' ? sanctions : sanctions.filter(s => s.status === filter);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total imposé',      val: fmt(totalInitial)+' FCFA',   col: 'bg-gray-50' },
          { label: 'Recouvré',          val: fmt(totalRecovered)+' FCFA', col: 'bg-emerald-50' },
          { label: 'En attente',        val: fmt(totalPending)+' FCFA',   col: 'bg-red-50' },
          { label: 'Taux recouvrement', val: totalInitial>0 ? Math.round((totalRecovered/totalInitial)*100)+'%' : '—', col: 'bg-indigo-50' },
        ].map((k,i) => (
          <div key={i} className={`${k.col} rounded-2xl border border-gray-100 p-4`}>
            <p className="text-xs font-bold text-gray-500 uppercase">{k.label}</p>
            <p className="text-xl font-black text-gray-900 mt-1">{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire nouvelle sanction */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Scale size={15} className="text-red-500" /> Nouvelle sanction</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className={LBL}>Membre *</label>
              <select value={form.member_id} onChange={e => setForm(f=>({...f,member_id:e.target.value}))} className={INP} required>
                <option value="">— Sélectionner —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Type *</label>
              <select value={form.type} onChange={e => { const t=e.target.value; setForm(f=>({...f,type:t,initial_amount:SANCTION_TYPES[t]?.montant||''})); }} className={INP} required>
                <option value="">— Type —</option>
                {Object.entries(SANCTION_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Montant (FCFA) *</label>
              <input type="number" value={form.initial_amount} onChange={e => setForm(f=>({...f,initial_amount:e.target.value}))} className={INP} required />
            </div>
            <div>
              <label className={LBL}>Date</label>
              <input type="date" value={form.sanction_date} onChange={e => setForm(f=>({...f,sanction_date:e.target.value}))} className={INP} />
            </div>
            <div>
              <label className={LBL}>Description</label>
              <input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className={INP} placeholder="Motif détaillé…" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
              Enregistrer la sanction
            </button>
          </form>
        </div>

        {/* Formulaire recouvrement */}
        {recovery.id ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-bold text-amber-800 mb-4">💰 Enregistrer un recouvrement</h3>
            <div className="space-y-3">
              <div>
                <label className={LBL}>Montant recouvré *</label>
                <input type="number" value={recovery.amount} onChange={e => setRecovery(r=>({...r,amount:e.target.value}))} className={INP} />
              </div>
              <div>
                <label className={LBL}>Moyen de paiement</label>
                <select value={recovery.payment_method} onChange={e => setRecovery(r=>({...r,payment_method:e.target.value}))} className={INP}>
                  {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={LBL}>Date</label>
                <input type="date" value={recovery.recovery_date} onChange={e => setRecovery(r=>({...r,recovery_date:e.target.value}))} className={INP} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleRecover} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-colors">Confirmer</button>
                <button onClick={() => setRecovery({id:null,amount:'',payment_method:'OM',recovery_date:new Date().toISOString().split('T')[0]})}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-500">Annuler</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Scale size={28} className="opacity-30" />
            <p className="text-sm">Cliquez sur <strong>Recouvrer</strong> dans la liste</p>
            <p className="text-xs">pour enregistrer un paiement de sanction</p>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Toutes les sanctions ({sanctions.length})</h3>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {['all','pending','partial','recovered','waived'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter===f?'bg-white text-indigo-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
                {f==='all'?'Toutes':STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>{['Date','Membre','Type','Montant','Recouvré','Restant','Statut','Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{(s.sanction_date||'').split('T')[0]}</td>
                  <td className="px-3 py-2.5 font-medium">{s.first_name} {s.last_name}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{SANCTION_TYPES[s.type]?.label||s.type}</td>
                  <td className="px-3 py-2.5 font-bold text-red-600">{fmt(s.initial_amount)}</td>
                  <td className="px-3 py-2.5 text-emerald-600">{fmt(s.recovered_amount)}</td>
                  <td className="px-3 py-2.5 font-bold text-gray-900">{fmt(parseFloat(s.initial_amount)-parseFloat(s.recovered_amount))}</td>
                  <td className="px-3 py-2.5"><Badge color={STATUS_COLOR[s.status]}>{STATUS_LABEL[s.status]}</Badge></td>
                  <td className="px-3 py-2.5">
                    {['pending','partial'].includes(s.status) && (
                      <button onClick={() => setRecovery(r => ({...r, id: s.id, amount: parseFloat(s.initial_amount)-parseFloat(s.recovered_amount)}))}
                        className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 font-semibold transition-colors">
                        Recouvrer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Aucune sanction trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ONGLET 5 — JOURNAL DE CAISSE
// ═══════════════════════════════════════════════════════════════════
const TabJournal = ({ cashOps, setCashOps, notify }) => {
  const [form, setForm] = useState({
    type: '', direction: 'sortie', amount: '', account: 'caisse_courante',
    payment_method: 'Cash', description: '', reference_event: '',
    op_date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const op = await createCashOperation(form);
      setCashOps(p => [op, ...p]);
      setForm({ type:'', direction:'sortie', amount:'', account:'caisse_courante', payment_method:'Cash', description:'', reference_event:'', op_date:new Date().toISOString().split('T')[0] });
      notify('Opération enregistrée ✓');
    } catch { notify('Erreur', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette opération ?')) return;
    try { await deleteCashOperation(id); setCashOps(p => p.filter(o => o.id !== id)); notify('Opération supprimée'); }
    catch { notify('Erreur', 'error'); }
  };

  const totalE = cashOps.filter(o=>o.direction==='entree').reduce((a,o)=>a+parseFloat(o.amount||0),0);
  const totalS = cashOps.filter(o=>o.direction==='sortie').reduce((a,o)=>a+parseFloat(o.amount||0),0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-emerald-600 uppercase">Total Entrées</p>
          <p className="text-xl font-black text-emerald-900 mt-1">{fmt(totalE)} FCFA</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-red-600 uppercase">Total Sorties</p>
          <p className="text-xl font-black text-red-900 mt-1">{fmt(totalS)} FCFA</p>
        </div>
        <div className={`${totalE-totalS>=0?'bg-indigo-50 border-indigo-200':'bg-orange-50 border-orange-200'} border rounded-2xl p-4`}>
          <p className="text-xs font-bold text-indigo-600 uppercase">Solde Journal</p>
          <p className={`text-xl font-black mt-1 ${totalE-totalS>=0?'text-indigo-900':'text-orange-800'}`}>{fmt(totalE-totalS)} FCFA</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={15} className="text-purple-600" /> Nouvelle opération de caisse</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={LBL}>Direction *</label>
            <select value={form.direction} onChange={e => setForm(f=>({...f,direction:e.target.value,type:''}))} className={INP} required>
              <option value="entree">↑ Entrée</option>
              <option value="sortie">↓ Sortie</option>
            </select>
          </div>
          <div>
            <label className={LBL}>Type d'opération *</label>
            <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className={INP} required>
              <option value="">— Choisir —</option>
              {Object.entries(CASH_OP_TYPES[form.direction]||{}).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Compte *</label>
            <select value={form.account} onChange={e => setForm(f=>({...f,account:e.target.value}))} className={INP} required>
              {Object.entries(COMPTES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Montant (FCFA) *</label>
            <input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} className={INP} required />
          </div>
          <div>
            <label className={LBL}>Date *</label>
            <input type="date" value={form.op_date} onChange={e => setForm(f=>({...f,op_date:e.target.value}))} className={INP} required />
          </div>
          <div>
            <label className={LBL}>Moyen de paiement</label>
            <select value={form.payment_method} onChange={e => setForm(f=>({...f,payment_method:e.target.value}))} className={INP}>
              {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Événement de référence</label>
            <input value={form.reference_event} onChange={e => setForm(f=>({...f,reference_event:e.target.value}))}
              placeholder="AG Ebolowa, Voir Bébé N°…" className={INP} />
          </div>
          <div className="sm:col-span-2">
            <label className={LBL}>Description</label>
            <input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
              placeholder="Détail de l'opération…" className={`${INP} w-full`} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</> : '✓ Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      {/* Journal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-x-auto">
        <h3 className="font-bold text-gray-800 mb-4">Journal ({cashOps.length} opérations)</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Date','Direction','Type','Compte','Moyen','Événement','Description','Montant',''].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold">{h}</th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cashOps.map(op => (
              <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-gray-500 text-xs">{(op.op_date||'').split('T')[0]}</td>
                <td className="px-3 py-2.5">
                  <Badge color={op.direction==='entree'?'green':'red'}>{op.direction==='entree'?'↑ Entrée':'↓ Sortie'}</Badge>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{(CASH_OP_TYPES[op.direction]||{})[op.type]||op.type}</td>
                <td className="px-3 py-2.5 text-xs">{COMPTES[op.account]||op.account}</td>
                <td className="px-3 py-2.5"><span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{op.payment_method||'—'}</span></td>
                <td className="px-3 py-2.5 text-xs text-purple-700 font-medium">{op.reference_event||'—'}</td>
                <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[100px] truncate">{op.description||'—'}</td>
                <td className={`px-3 py-2.5 font-bold ${op.direction==='entree'?'text-emerald-700':'text-red-600'}`}>
                  {op.direction==='entree'?'+':'-'}{fmt(op.amount)} FCFA
                </td>
                <td className="px-3 py-2.5">
                  <button onClick={() => handleDelete(op.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {cashOps.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">Aucune opération enregistrée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Treasury;