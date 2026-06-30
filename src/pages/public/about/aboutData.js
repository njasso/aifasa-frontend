// src/pages/public/about/aboutData.js
// Données extraites de About.jsx pour alléger le composant et faciliter
// les mises à jour de contenu sans toucher au code de rendu (JSX).
import {
  FiUsers, FiTarget, FiAward, FiBriefcase, FiHeart, FiGlobe, FiTrendingUp,
  FiMessageCircle, FiShield, FiUser, FiMonitor, FiDatabase, FiChevronDown,
  FiChevronUp, FiArrowRight, FiMapPin, FiMail, FiPhone, FiUserCheck, FiStar,
  FiLink, FiFacebook, FiYoutube, FiExternalLink, FiEye, FiActivity, FiGrid,
  FiCheckCircle, FiAperture, FiSun, FiDroplet, FiPieChart, FiPackage, FiCalendar
} from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';

// Statistiques clés
export const stats = [
  { icon: FiUsers, value: '35+', label: 'Membres actifs' },
  { icon: FiActivity, value: '3', label: 'Projets AGR lancés' },
  { icon: FiGrid, value: '5', label: 'Axes Stratégiques' },
  { icon: FiCalendar, value: '5 ans', label: "D'existence légale" },
];

// Les 5 Axes Stratégiques (AG Juin 2026)
export const strategicAxes = [
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
export const executiveBoard = [
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
export const historyEvents = [
  { year: '2019', event: 'Émergence de l\'initiative et rassemblement fondateur de la 17ème promotion FASA.' },
  { year: '2021', event: 'Reconnaissance officielle par l\'État du Cameroun (Récépissé N°00000142/RDA/J06/SAAJP du 15 Mars 2021).' },
  { year: '2023', event: 'Lancement des premiers projets collectifs.' },
  { year: '2025', event: 'Lancement de la phase de maturation des Activités Génératrices de Revenus (AGR).' },
  { year: '2026', event: 'Programme stratégique de modernisation technologique de l\'Assocaition: Hub d\'expertise et plateforme numérique.' },
];

export const statutoryBodies = [
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

export const commissions = [
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
export const expertiseDomains = [
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
export const qhseData = {
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

export const partners = [
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

export const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=800', caption: 'Travaux de terrain en agroforesterie' },
  { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782068840/WhatsApp_Image_2026-06-21_at_19.51.37_frfzdi.jpg', caption: 'Session de réorientation des activités' },
  { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782133228/WhatsApp_Image_2026-06-22_at_05.20.23_i6hxcj.jpg', caption: 'Supervision des campagnes agricoles' },
  { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782067779/WhatsApp_Image_2026-06-21_at_19.40.41_je2cba.jpg', caption: 'Etude d\'impacts environnemetales route Akom 2 -Kribi' },
  { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782071069/PXL_20250703_074528129_t1kixn.jpg', caption: 'Formation aux métiers piscicoles' },
  { url: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782069784/IMG_2835_jagn6a.jpg', caption: 'Projets agricoles durables' },
];

export const contactInfo = {
  email: 'association@aifasa17.org',
  phone: '+237 620 370 286',
  address: 'Yaoundé, Cameroun'
};

export const socialLinks = [
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
export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

// Images d'illustration pour chaque domaine
export const expertiseImages = {
agroforestry: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782133330/WhatsApp_Image_2026-06-22_at_06.45.41_1_ydjnjn.jpg',
forestry: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800',
ecology: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&q=80&w=800',
agroeconomy: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754815391/front-view-plants-with-coins-stacked-dirt_erjelb.jpg',
aquaculture: 'https://res.cloudinary.com/djhyztec8/image/upload/v1782069915/IMG_9967_dobcho.jpg',
digital: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
};

