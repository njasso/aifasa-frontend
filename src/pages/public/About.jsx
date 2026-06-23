// src/pages/public/About.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiUsers, 
  FiTarget, 
  FiAward,
  FiBriefcase,
  FiHeart,
  FiGlobe,
  FiTrendingUp,
  FiMessageCircle,
  FiShield,
  FiUser,
  FiMonitor,
  FiDatabase,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiMapPin,
  FiMail,
  FiPhone,
  FiUserCheck,
  FiStar,
  FiLink,
  FiFacebook,
  FiYoutube,
  FiExternalLink,
  FiEye,
  FiActivity,
  FiGrid,
  FiCheckCircle,
  FiAperture,
  FiSun,
  FiDroplet,
  FiPieChart,
  FiPackage
} from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';

const About = () => {
  const [activeTab, setActiveTab] = useState('presentation');
  const [expandedCommission, setExpandedCommission] = useState(null);

  // ============ DONNÉES ============
  
  // Statistiques clés
  const stats = [
    { icon: FiUsers, value: '35+', label: 'Membres actifs' },
    { icon: FiActivity, value: '3', label: 'Projets AGR lancés' },
    { icon: FiGrid, value: '5', label: 'Axes Stratégiques' },
    { icon: FiCalendar, value: '5 ans', label: "D'existence légale" },
  ];

  // Les 5 Axes Stratégiques (AG Juin 2026)
  const strategicAxes = [
    { 
      id: 1, 
      icon: FiEye,
      title: "Visibilité & Insertion Professionnelle", 
      desc: "Promouvoir le profil de chaque ingénieur, faciliter l'accès aux opportunités de carrière et renforcer la présence institutionnelle de l'association.",
      color: 'border-l-blue-500'
    },
    { 
      id: 2, 
      icon: FiHeart,
      title: "Solidarité & Cohésion Sociale", 
      desc: "Dynamiser le Fonds Social, structurer l'entraide mutuelle active lors des événements de vie et renforcer les liens fraternels entre membres.",
      color: 'border-l-red-500'
    },
    { 
      id: 3, 
      icon: FiTrendingUp,
      title: "Autonomie Financière & AGR", 
      desc: "Investir collectivement dans des projets agro-pastoraux porteurs (pisciculture, aviculture, foncier) pour garantir l'indépendance économique.",
      color: 'border-l-emerald-500'
    },
    { 
      id: 4, 
      icon: FiShield,
      title: "Gouvernance & Structuration Juridique", 
      desc: "Garantir un suivi-évaluation transparent, maintenir une conformité juridique stricte et professionnaliser la gestion administrative.",
      color: 'border-l-purple-500'
    },
    { 
      id: 5, 
      icon: FiMonitor,
      title: "Transition Numérique & Hub d'Expertise", 
      desc: "Concevoir les plateformes digitales, déployer le Hub d'expertise pour valoriser nos compétences et interconnecter les membres.",
      color: 'border-l-amber-500'
    },
  ];

  // Membres du Bureau Exécutif avec photos
  const executiveBoard = [
    { 
      name: 'EDONGO ABEGA Davy Fabrice', 
      role: 'Président',
      photo: '/images/members/NDONGO_Davy.jpeg'
    },
    { 
      name: 'BIKAÏ', 
      role: 'Vice-Président',
      photo: '/images/members/default_profile.jpg'
    },
    { 
      name: 'ESSOLA ONJA\'A Félix', 
      role: 'Secrétaire Général',
      photo: '/images/members/ESSOLA_Felix.png'
    },
    { 
      name: 'KOBLA Anne Stéphanie', 
      role: 'Secrétaire Générale Adjointe',
      photo: '/images/members/Kobla_profile.jpg'
    },
    { 
      name: 'NGIJOL BALENG Roland Dalex', 
      role: 'Trésorier',
      photo: '/images/members/NGIDJOL.jpg'
    },
    { 
      name: 'KUENBOU Jacques', 
      role: 'Commissaire aux Comptes',
      photo: '/images/members/Kuenbou_profile.png'
    },
    { 
      name: 'FONJI TANYA FOLEFAC', 
      role: 'Censeur',
      photo: '/images/members/Fonji_profile.jpg'
    },
  ];

  // Historique corrigé avec dates officielles
  const historyEvents = [
    { year: '2019', event: 'Émergence de l\'initiative et rassemblement fondateur de la 17ème promotion FASA.' },
    { year: '2021', event: 'Reconnaissance officielle par l\'État du Cameroun (Récépissé N°00000142/RDA/J06/SAAJP du 15 Mars 2021).' },
    { year: '2023', event: 'Lancement des premiers projets collectifs.' },
    { year: '2025', event: 'Lancement de la phase de maturation des Activités Génératrices de Revenus (AGR).' },
    { year: '2026', event: 'Programme stratégique de modernisation technologique de l\'Assocaition: Hub d\'expertise et plateforme numérique.' },
  ];

  const statutoryBodies = [
    { 
      icon: FiUsers, 
      title: 'Assemblée Générale', 
      role: 'Organe Suprême',
      description: 'Constituée de l\'ensemble des membres actifs et honoraires. Elle se réunit régulièrement pour valider les bilans, voter le budget et définir les grandes orientations stratégiques de l\'association.' 
    },
    { 
      icon: FiBriefcase, 
      title: 'Conseil Exécutif', 
      role: 'Pilotage & Vision',
      description: 'Élu par l\'Assemblée Générale. Il traduit les orientations en actions concrètes, supervise la gestion financière et coordonne les commissions opérationnelles.' 
    },
    { 
      icon: FiUser, 
      title: 'Président', 
      role: 'Représentation Légale',
      description: 'Représentant légal et diplomatique de l\'AIFASA 17. Il dispose des pouvoirs nécessaires pour engager l\'association vis-à-vis des tiers et garantir la cohésion interne.' 
    },
    { 
      icon: FiShield, 
      title: 'Comité de Surveillance', 
      role: 'Conformité & Discipline',
      description: 'Organe indépendant chargé de veiller à la stricte application des Statuts et du Règlement Intérieur. Il maintient l\'ordre et assure la médiation des conflits internes.' 
    }
  ];

  const commissions = [
    { 
      id: 'agr',
      name: 'Commission AGR', 
      icon: FiTrendingUp, 
      description: 'Activités Génératrices de Revenus',
      mission: 'Conçoit et pilote les projets d\'investissement collectifs visant à garantir l\'autonomie financière durable de l\'AIFASA 17.',
      kpi: 'Développer des projets rentables et durables pour l\'association.'
    },
    { 
      id: 'num',
      name: 'Commission Numérique', 
      icon: FiMonitor, 
      description: 'Digitalisation et plateformes',
      mission: 'Architecte de l\'écosystème technologique. Chargée du développement et de la maintenance des outils numériques et de l\'automatisation de l\'administration.',
      kpi: 'Déployer une plateforme numérique moderne et sécurisée.'
    },
    { 
      id: 'data',
      name: 'Commission Données & Recherche', 
      icon: FiDatabase, 
      description: 'Base de données et statistiques',
      mission: 'Centre d\'intelligence stratégique. Administre la base de données des profils et compétences des membres, et produit des analyses utiles.',
      kpi: 'Cartographier le capital humain de l\'association pour faciliter le réseautage.'
    },
    { 
      id: 'social',
      name: 'Commission Action Sociale', 
      icon: FiHeart, 
      description: 'Solidarité et entraide',
      mission: 'Cœur solidaire de la communauté. Gère les dispositifs d\'entraide, organise les chaînes de solidarité et structure les programmes d\'accompagnement.',
      kpi: 'Renforcer la cohésion et la solidarité entre les membres.'
    },
    { 
      id: 'comm',
      name: 'Commission Communication', 
      icon: FiMessageCircle, 
      description: 'Visibilité et relations publiques',
      mission: 'Vitrine officielle et porte-voix de l\'AIFASA 17. Gère l\'image de marque et anime les relations publiques.',
      kpi: 'Accroître le rayonnement de l\'association et attirer des partenaires.'
    },
  ];

  // ============ DONNÉES EXPERTISES AVEC DESCRIPTIONS UNIQUEMENT ============
  // ============ DONNÉES EXPERTISES AVEC DESCRIPTIONS ============
const expertiseDomains = [
  {
    id: 'agroforestry',
    icon: FiPackage,
    title: 'Productions Végétales & Agroforesterie',
    color: 'from-emerald-500 to-green-700',
    description: "Expertise en techniques de production végétale, gestion de pépinières, agroforesterie, et conseil agricole. Les membres de ce domaine maîtrisent les systèmes de production durables, la réhabilitation des vergers (cacao, café, hévéa), et l'accompagnement technique des producteurs."
  },
  {
    id: 'forestry',
    icon: FiAperture,
    title: 'Aménagement Forestier & Sylviculture',
    color: 'from-blue-500 to-cyan-700',
    description: "Compétences en aménagement durable des forêts, sylviculture, inventaires forestiers, planification d'exploitation à faible impact, et gestion des Unités Forestières d'Aménagement (UFA). Expertise en SIG, cartographie, et traçabilité des produits forestiers."
  },
  {
    id: 'ecology',
    icon: FiSun,
    title: 'Écologie & Conservation (Faune/Aires Protégées)',
    color: 'from-amber-500 to-orange-700',
    description: "Expertise en écologie, conservation de la faune, gestion des aires protégées, biomonitoring (SMART, CyberTracker, camera traps), inventaires fauniques, et recherche scientifique sur la biodiversité du Bassin du Congo."
  },
  {
    id: 'agroeconomy',
    icon: FiPieChart,
    title: 'Agro-économie & Chaînes de Valeur',
    color: 'from-purple-500 to-indigo-700',
    description: "Compétences en analyse des chaînes de valeur agricoles, développement de filières durables, économie rurale, finance climatique, et transformation des systèmes alimentaires. Expertise en études de marché, analyse socio-économique, et accompagnement des organisations paysannes."
  },
  {
    id: 'aquaculture',
    icon: FiDroplet,
    title: 'Aquaculture & Zootechnie',
    color: 'from-cyan-500 to-teal-700',
    description: "Expertise en production piscicole, reproduction et élevage des poissons, alimentation aquacole, et gestion des exploitations aquacoles. Compétences également en production animale, transformation des produits, et entrepreneuriat agricole."
  },
  {
    id: 'digital',
    icon: FiMonitor,
    title: 'Solutions Numériques & Transformation Digitale',
    color: 'from-indigo-500 to-purple-700',
    description: "Expertise en conception et développement de solutions numériques innovantes pour le secteur agricole et agro-industriel. Compétences en développement de logiciels de suivi d'activités de production, d'outils d'analyse statistique en temps réel, de plateformes d'évaluation des compétences professionnelles, et de systèmes d'information géographique (SIG) pour la gestion des ressources naturelles. Accompagnement des entreprises et organisations dans leur transformation digitale à travers des solutions sur mesure adaptées aux réalités du terrain."
  }
];

  // Données QHSE (section unique)
  const qhseData = {
    title: "Conseil, accompagnement, formation, audit QHSE et certification ISO",
    description: "Au-delà de l'expertise agronomique et forestière pure, des membres de l'association interviennent également, en collaboration avec des partenaires spécialisés en management QHSE, sur des domaines transversaux essentiels à la mise aux normes des entreprises agro-industrielles : formation des acteurs de la filière à tous les niveaux, organisation et suivi de groupements de producteurs, caractérisation socio-économique et environnementale des zones de production, conception et suivi de projets agricoles et halieutiques, promotion des bonnes pratiques agricoles, et renforcement des capacités sur l'utilisation sécurisée des produits phytosanitaires.",
    services: [
      "Conseil, accompagnement, formation et audit en QHSE et management des entreprises et organisations",
      "Certification de personnes et d'entreprises sur les référentiels ISO (9001, 22000, 26000, 14001, 31000)",
      "Audit des systèmes de management Qualité, Hygiène, Santé, Sécurité et Environnement",
      "Réalisation d'Études d'Impact Environnementales et Sociales (EIES) selon les référentiels législatifs et normatifs (ISO 14001, 26000, EMAS)",
      "Mise en place de systèmes HACCP et de méthodes d'hygiène pour les unités agroalimentaires",
      "Assainissement, dératisation, désinsectisation des espaces et bâtiments d'élevage, traitement phytosanitaire",
      "Accompagnement à la certification internationale PECB : management de la qualité, gouvernance et gestion des risques, sécurité de l'information, continuité d'activité",
      "Promotion de l'entrepreneuriat et du marketing par la formation et le renforcement des capacités"
    ]
  };

  const partners = [
    { 
      name: 'AFRICANUT FISH MARKET', 
      logo: 'https://res.cloudinary.com/djhyztec8/image/upload/v1755204855/project_Market_jjqyxl.png',
      url: '',
      sector: 'Aquaculture'
    },
    { 
      name: 'NOUVELLE ACADEMIE NUMERIQUE AFRICAINE', 
      logo: 'https://res.cloudinary.com/djhyztec8/image/upload/v1755204980/logo_t9bd7r.png',
      url: '',
      sector: 'Numérique'
    },
    { 
      name: 'MAPOURE AGRIBUSINESS', 
      logo: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754936839/WhatsApp_Image_2024-10-21_%C3%A0_09.58.35_31ede8c6_igk2wj.png',
      url: '',
      sector: 'Élevage'
    },
  ];

  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800', caption: 'Travaux de terrain en agroforesterie' },
    { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782068840/WhatsApp_Image_2026-06-21_at_19.51.37_frfzdi.jpg', caption: 'Session de réorientation des activités' },
    { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782133228/WhatsApp_Image_2026-06-22_at_05.20.23_i6hxcj.jpg', caption: 'Supervision des campagnes agricoles' },
    { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782067779/WhatsApp_Image_2026-06-21_at_19.40.41_je2cba.jpg', caption: 'Etude d\'impacts environnemetales route Akom 2 -Kribi' },
    { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782071069/PXL_20250703_074528129_t1kixn.jpg', caption: 'Formation aux métiers piscicoles' },
    { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782069784/IMG_2835_jagn6a.jpg', caption: 'Projets agricoles durables' },
  ];

  const contactInfo = {
    email: 'association.fasa17@gmail.com',
    phone: '+237 620 370 286',
    address: 'Yaoundé, Cameroun'
  };

    const socialLinks = [
    { 
      icon: FiFacebook, 
      url: 'https://www.facebook.com/share/1BDMdB7s4y/', 
      label: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    { 
      icon: FaLinkedin, 
      url: 'https://www.linkedin.com/company/association-des-ing%C3%A9nieurs-agronomes-et-forestiers-de-la-fasa-promo-17-du-cameroun/', 
      label: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    { 
      icon: FiYoutube, 
      url: 'https://www.youtube.com/@AIFASA17', 
      label: 'YouTube',
      color: 'bg-red-600 hover:bg-red-700'
    },
  ];

  // ============ VARIANTS ============
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const toggleCommission = (id) => {
    setExpandedCommission(expandedCommission === id ? null : id);
  };

  // Images d'illustration pour chaque domaine
  const expertiseImages = {
  agroforestry: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800',
  forestry: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800',
  ecology: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&q=80&w=800',
  agroeconomy: 'https://images.unsplash.com/photo-1578574017019-6b7a0cb5f3f3?auto=format&fit=crop&q=80&w=800',
  aquaculture: 'https://images.unsplash.com/photo-1542524602-97c41b1a9e70?auto=format&fit=crop&q=80&w=800',
  digital: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
};

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-green-700 selection:text-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">À Propos de l'AIFASA 17</h1>
            <div className="h-1 w-20 bg-emerald-400 mx-auto mb-6 rounded"></div>
            <p className="text-xl text-green-100 max-w-3xl mx-auto font-light">
              Association des Ingénieurs Agronomes et Forestiers de la 17ème promotion de la FASA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistiques clés */}
      <section className="container mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Navigation des Onglets */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap justify-center bg-white rounded-xl shadow-md p-2 max-w-3xl mx-auto border border-gray-100">
          {['presentation', 'expertise', 'bureau', 'organisation', 'partenaires', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-300 text-xs md:text-sm ${
                activeTab === tab
                  ? 'bg-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-green-50'
              }`}
            >
              {tab === 'presentation' && <FiTarget className="w-4 h-4" />}
              {tab === 'expertise' && <FiAward className="w-4 h-4" />}
              {tab === 'bureau' && <FiUserCheck className="w-4 h-4" />}
              {tab === 'organisation' && <FiBriefcase className="w-4 h-4" />}
              {tab === 'partenaires' && <FiLink className="w-4 h-4" />}
              {tab === 'contact' && <FiMail className="w-4 h-4" />}
              {tab === 'presentation' ? 'Présentation' : 
               tab === 'expertise' ? 'Expertises' : 
               tab === 'bureau' ? 'Bureau' : 
               tab === 'organisation' ? 'Gouvernance' : 
               tab === 'partenaires' ? 'Partenaires' : 'Contact'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <section className="pb-16 px-4 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ====== TAB PRESENTATION ====== */}
          {activeTab === 'presentation' && (
            <motion.div
              key="presentation"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Présentation Générale */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-green-900 mb-4">Notre Identité</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  L'Association des Ingénieurs Agronomes et Forestiers de la 17ème promotion de la FASA (AIFASA 17) 
                  est une organisation apolitique et à but non lucratif. Elle est le creuset de l'excellence collective, 
                  conçue pour catalyser le développement socio-économique de ses membres à travers des synergies innovantes.
                </p>
              </div>

              {/* Feuille de Route Stratégique */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FiStar className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900">Feuille de Route Stratégique</h3>
                    <p className="text-sm text-gray-500">Adoptée lors de l'Assemblée Générale - Juin 2026, EBOLOWA</p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategicAxes.map((axis) => (
                    <motion.div
                      key={axis.id}
                      whileHover={{ y: -3 }}
                      className={`bg-gray-50 rounded-xl p-5 border-l-4 ${axis.color} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 rounded-full">
                          Axe {axis.id}
                        </span>
                        <axis.icon className="w-4 h-4 text-green-700" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">{axis.title}</h4>
                      <p className="text-gray-600 text-xs leading-relaxed">{axis.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Galerie */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                  <FiGlobe className="text-emerald-600" /> L'Association en Actions
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {galleryImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="relative rounded-xl overflow-hidden shadow-md group h-48 cursor-pointer"
                    >
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity"></div>
                      <p className="absolute bottom-3 left-3 right-3 text-xs text-white font-medium">{img.caption}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Historique */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-green-900 mb-8 flex items-center gap-2">
                  <FiCalendar className="text-green-700" /> Notre Trajectoire
                </h2>
                <div className="relative border-l-2 border-green-200 ml-4 md:ml-6 space-y-8">
                  {historyEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-8"
                    >
                      <div className="absolute -left-[11px] top-1 w-5 h-5 bg-green-600 border-4 border-white rounded-full shadow-md"></div>
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full mb-2">{event.year}</span>
                        <p className="text-gray-700 font-medium">{event.event}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== TAB EXPERTISE ====== */}
          {activeTab === 'expertise' && (
            <motion.div
              key="expertise"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* En-tête des expertises */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FiAward className="w-8 h-8 text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Nos Domaines d'Expertise</h2>
                    <p className="text-gray-500 text-sm">Un vivier de compétences pluridisciplinaires au service du développement durable</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  L'AIFASA 17 regroupe des ingénieurs agronomes et forestiers aux profils variés et complémentaires. 
                  Notre association couvre un large spectre d'expertises, allant des productions végétales à la gouvernance environnementale, 
                  en passant par l'aquaculture et le conseil QHSE. Découvrez ci-dessous nos domaines de compétence clés.
                </p>
              </div>

              {/* Cartes des domaines d'expertise avec illustration et description */}
              <div className="grid md:grid-cols-2 gap-8">
                {expertiseDomains.map((domain) => (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Illustration */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={expertiseImages[domain.id]} 
                        alt={domain.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r ${domain.color} opacity-90`}>
                        <div className="flex items-center gap-2 text-white">
                          <domain.icon className="w-5 h-5" />
                          <span className="font-bold text-sm">{domain.title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description uniquement */}
                    <div className="p-5">
                      <p className="text-sm text-gray-600 leading-relaxed">{domain.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Section QHSE - UNIQUE */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
                    alt="QHSE - Conseil et certification ISO"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-red-800/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-r from-red-600 to-rose-700 opacity-95">
                    <div className="flex items-center gap-3 text-white">
                      <FiCheckCircle className="w-6 h-6" />
                      <h3 className="text-xl font-bold">Conseil, accompagnement, formation, audit QHSE et certification ISO</h3>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-gray-600 text-sm leading-relaxed">{qhseData.description}</p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {qhseData.services.map((service, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all duration-200">
                        <FiCheckCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700 leading-relaxed">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-2xl p-8 text-center text-white shadow-xl max-w-3xl mx-auto border border-green-800/20">
                <h3 className="text-xl md:text-2xl font-bold">Vous avez un projet ?</h3>
                <p className="text-green-100/80 text-sm mt-2 max-w-xl mx-auto">
                  Faites appel à l'expertise de nos ingénieurs pour vos projets de développement agricole, forestier ou environnemental.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5">
                    Consulter le Hub d'expertise
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                  <a 
                    href="mailto:association.fasa17@gmail.com"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-2.5 rounded-lg border border-white/20 transition-all"
                  >
                    <FiMail className="w-4 h-4" />
                    Nous contacter
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== TAB BUREAU ====== */}
          {activeTab === 'bureau' && (
            <motion.div
              key="bureau"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-green-900 mb-1">Bureau Exécutif</h2>
                <p className="text-gray-500 mb-8 text-sm">L'équipe dirigeante de l'AIFASA 17</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {executiveBoard.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-100 shadow-md mb-3">
                          <img 
                            src={member.photo} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/default_profile.png';
                            }}
                          />
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                        <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full mt-1">
                          {member.role}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== TAB ORGANISATION ====== */}
          {activeTab === 'organisation' && (
            <motion.div
              key="organisation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Organes Statutaires */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-green-900 mb-1">Gouvernance & Organes Statutaires</h2>
                <p className="text-gray-500 mb-6 text-sm">Une structure organisationnelle transparente, démocratique et rigoureuse au service du bien commun.</p>
                
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-6">
                  {statutoryBodies.map((body, index) => {
                    const Icon = body.icon;
                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm flex gap-4 items-start hover:bg-white hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="p-3 bg-green-50 rounded-xl flex-shrink-0 text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-base">{body.title}</h4>
                            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-gray-200/60 text-gray-600 rounded">
                              {body.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 pt-1 leading-relaxed">{body.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Commissions */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Commissions Spécialisées</h2>
                    <p className="text-gray-500 text-sm mt-0.5">Les pôles opérationnels et techniques au cœur de nos actions.</p>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">
                    5 Pôles d'Action
                  </span>
                </div>
                
                <div className="space-y-4">
                  {commissions.map((comm, index) => {
                    const Icon = comm.icon;
                    const isExpanded = expandedCommission === comm.id;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                          isExpanded 
                            ? 'bg-gradient-to-br from-green-50/40 to-white border-green-500/40 shadow-md' 
                            : 'bg-gray-50 border-gray-100/80 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <div 
                          onClick={() => toggleCommission(comm.id)}
                          className="flex items-center justify-between p-5 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg transition-colors duration-300 ${isExpanded ? 'bg-green-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-base">{comm.name}</h3>
                              <p className="text-xs text-gray-500 font-medium">{comm.description}</p>
                            </div>
                          </div>
                          <div className="text-gray-400 p-1 hover:text-gray-600 transition-colors">
                            {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                              <div className="px-5 pb-5 pt-1 border-t border-gray-100 grid md:grid-cols-2 gap-4 text-sm bg-white/50">
                                <div className="space-y-1.5 p-3 rounded-lg bg-gray-50 border border-gray-100/60">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mission Principale</h4>
                                  <p className="text-gray-600 leading-relaxed">{comm.mission}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-green-50/30 border border-green-100/40">
                                  <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Objectif Clé</h4>
                                  <p className="text-green-900/90 font-medium leading-relaxed">{comm.kpi}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Call to action */}
              <div className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-2xl p-8 text-center text-white shadow-xl max-w-3xl mx-auto border border-green-800/20">
                <h3 className="text-xl md:text-2xl font-bold">Unir nos forces pour un développement durable</h3>
                <p className="text-green-100/80 text-sm mt-2 max-w-xl mx-auto">
                  Les commissions de travail sont ouvertes à tous les membres souhaitant contribuer activement à la vie de l'association.
                </p>
                <div className="mt-5">
                  <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5">
                    S'engager dans une commission
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== TAB PARTENAIRES ====== */}
          {activeTab === 'partenaires' && (
            <motion.div
              key="partenaires"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-green-900 mb-1">Nos Partenaires</h2>
                <p className="text-gray-500 mb-8 text-sm">Ils nous accompagnent dans la réalisation de nos missions</p>
                
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {partners.map((partner, index) => (
                    <motion.a
                      key={index}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center hover:shadow-lg transition-all duration-300 hover:bg-white group cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="w-24 h-24 flex items-center justify-center mb-4 p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <img 
                          src={partner.logo} 
                          alt={`Logo ${partner.name}`}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default_profile.png';
                          }}
                        />
                      </div>
                      <p className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                        {partner.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{partner.sector}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FiExternalLink className="w-3 h-3" />
                        <span>Visiter le site</span>
                      </div>
                    </motion.a>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center">
                  <h3 className="text-lg font-bold text-green-900 mb-2">Devenir Partenaire</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Vous souhaitez collaborer avec l'AIFASA 17 ? Contactez-nous pour explorer les possibilités de partenariat.
                  </p>
                  <a 
                    href="mailto:association.fasa17@gmail.com"
                    className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    <FiMail className="w-4 h-4" />
                    Nous contacter
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== TAB CONTACT ====== */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">Contactez-nous</h2>
                <p className="text-gray-500 text-center mb-8">Nous sommes à votre écoute pour toute question ou collaboration</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-all hover:bg-white border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiMail className="w-6 h-6 text-green-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                    <a href={`mailto:${contactInfo.email}`} className="text-sm text-green-600 hover:underline break-all">
                      {contactInfo.email}
                    </a>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-all hover:bg-white border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiPhone className="w-6 h-6 text-green-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">Téléphone</h4>
                    <a href={`tel:${contactInfo.phone}`} className="text-sm text-green-600 hover:underline">
                      {contactInfo.phone}
                    </a>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-all hover:bg-white border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiMapPin className="w-6 h-6 text-green-700" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">Adresse</h4>
                    <p className="text-sm text-gray-600">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-center font-semibold text-gray-700 mb-4">Suivez-nous sur les réseaux</h4>
                  <div className="flex justify-center gap-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${social.color} text-white p-3 rounded-full shadow-lg transition-all duration-300`}
                        title={social.label}
                      >
                        <social.icon className="w-6 h-6" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-100 text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Bureau Exécutif AIFASA 17</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    association.fasa17@gmail.com • +237 620 370 286 / +237 696 322 069
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default About;