// src/pages/public/Enterprises.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Phone, 
  Mail, 
  Globe, 
  PiggyBank, 
  Fish, 
  HeartHandshake, 
  Sprout, 
  Building2, 
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

const enterprisesData = [
  {
    id: 1,
    name: 'Ferme Piscicole "AfricaNut Fish Market"',
    logo: 'https://res.cloudinary.com/djhyztec8/image/fetch/v1754811262/https://harmonious-boba-e7278d.netlify.app/cld-assets/images/partners/AFRICANUT_FISH_MARKET.png',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754812663/WhatsApp_Image_2024-10-08_%C3%A0_11.42.46_edf79ff4_cmppa6.jpg',
    activity: 'Élevage, vente de poissons d\'eau douce (silure, tilapia, carpe), aménagement des sites piscicoles et vente d\'équipements.',
    products: 'Silure, tilapia frais, filets de poisson, alevins.',
    production: 'Production annuelle estimée à 7 tonnes.',
    contact: {
      phone: '+237 6 20 37 02 86',
      email: 'africanutindustry@outlook.com',
      website: 'https://www.africanutgroup.com'
    }
  },
  {
    id: 2,
    name: 'Élevage Avicole "La Cocotte Joyeuse"',
    logo: '', // Géré par le fallback visuel automatique
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754813064/little-chicks-farm_f5clss.jpg',
    activity: 'Production de poulets de chair de qualité supérieure et distribution d\'œufs de table.',
    products: 'Poulets entiers plumés, œufs frais calibrés, poussins d\'un jour.',
    production: 'Capacité de 50 000 poulets par an.',
    contact: {
      phone: '+237 6 88 99 00 11',
      email: 'info@lacocottejoyeuse.com',
      website: 'https://www.lacocottejoyeuse.com'
    }
  },
  {
    id: 3,
    name: 'Porcherie "Le Cochon Heureux"',
    logo: '', 
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754815648/scene-photorealiste-vie-ferme-cochons_h8jmzn.jpg',
    activity: 'Élevage porcin moderne, sélection génétique et transformation charcutière artisanale.',
    products: 'Viande de porc fraîche, découpes au détail, charcuterie.',
    production: 'Production de 25 tonnes de carcasse par an.',
    contact: {
      phone: '+237 6 99 00 11 22',
      email: 'contact@lecochonheureux.com',
      website: 'https://www.lecochonheureux.com'
    }
  },
  {
    id: 4,
    name: 'Agri-Végétale "Terre Fertile"',
    logo: '',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754813075/vue-pres-du-mais-encore-dans-sa-coquille_r3r22n.jpg',
    activity: 'Culture maraîchère éco-responsable (tomates, poivrons, oignons) et arboriculture fruitière.',
    products: 'Légumes de saison, paniers de fruits frais bio.',
    production: '30 tonnes de produits récoltés par an.',
    contact: {
      phone: '+237 6 11 22 33 44',
      email: 'contact@terrefertile.com',
      website: 'https://www.terrefertile.com'
    }
  },
  {
    id: 5,
    name: 'Bureau d\'Études "Alpha Conseil"',
    logo: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754936839/WhatsApp_Image_2024-10-21_%C3%A0_09.58.35_31ede8c6_igk2wj.png',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754936616/0_bqykuz.png',
    activity: 'Services d\'ingénierie conseil, montages de business plans agropastoraux et audits environnementaux.',
    products: 'Études de faisabilité, plans d\'affaires, formations de terrain.',
    production: 'Plus de 50 projets et dossiers techniques accompagnés par an.',
    contact: {
      phone: '+237 6 22 33 44 55',
      email: 'info@alphaconseil.com',
      website: 'https://www.alphaconseil.com'
    }
  },
  {
    id: 6,
    name: 'Coopérative "AIFASA 17"',
    logo: '', 
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754815391/front-view-plants-with-coins-stacked-dirt_erjelb.jpg',
    activity: 'Mutualisation des compétences et des ressources de la promotion pour le co-investissement agricole.',
    products: 'Fonds d\'appui interne, assistance technique, projets communautaires.',
    production: 'Gestion et gouvernance de projets d\'intérêt collectif.',
    contact: {
      phone: '+237 6 33 44 55 66',
      email: 'aifasa17@cooperative.com',
      website: 'https://www.aifasa17.org'
    }
  },
];

const EnterpriseCard = ({ enterprise, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: index * 0.05 }
    }
  };

  const getIconForActivity = (activity) => {
    const act = activity.toLowerCase();
    if (act.includes('piscicole') || act.includes('poissons') || act.includes('halieutique')) return <Fish className="w-5 h-5 text-blue-600" />;
    if (act.includes('avicole') || act.includes('poulets') || act.includes('élevage')) return <Sparkles className="w-5 h-5 text-amber-500" />;
    if (act.includes('porcs') || act.includes('porcherie')) return <PiggyBank className="w-5 h-5 text-pink-500" />;
    if (act.includes('légumes') || act.includes('culture') || act.includes('végétale')) return <Sprout className="w-5 h-5 text-emerald-500" />;
    if (act.includes('conseil') || act.includes('études')) return <Building2 className="w-5 h-5 text-indigo-500" />;
    if (act.includes('coopérative') || act.includes('mutualisation')) return <HeartHandshake className="w-5 h-5 text-teal-500" />;
    return <Building className="w-5 h-5 text-green-700" />;
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
    >
      <div className="h-48 w-full overflow-hidden relative">
        <img
          src={enterprise.image}
          alt={enterprise.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-sm border border-gray-100">
          {getIconForActivity(enterprise.activity)}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center mb-4 pb-3 border-b border-gray-50">
          {enterprise.logo ? (
            <img
              src={enterprise.logo}
              alt={`${enterprise.name} logo`}
              className="w-11 h-11 rounded-xl mr-3 object-contain bg-gray-50 border border-gray-100 p-1 flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl mr-3 bg-gradient-to-br from-green-700 to-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
              {enterprise.name.charAt(0)}
            </div>
          )}
          <h3 className="text-base font-bold text-gray-800 leading-tight group-hover:text-green-800 transition-colors">{enterprise.name}</h3>
        </div>

        <div className="space-y-3.5 text-xs md:text-sm text-gray-600 flex-1">
          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 p-1 bg-gray-50 rounded-lg border border-gray-100 mt-0.5">
              {getIconForActivity(enterprise.activity)}
            </span>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Activités & Secteurs</p>
              <p className="text-gray-700 mt-0.5 leading-relaxed">{enterprise.activity}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 p-1 bg-gray-50 rounded-lg border border-gray-100 mt-0.5">
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </span>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Offre & Produits</p>
              <p className="text-gray-700 mt-0.5 leading-relaxed">{enterprise.products}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex-shrink-0 p-1 bg-gray-50 rounded-lg border border-gray-100 mt-0.5">
              <Layers className="w-4 h-4 text-emerald-600" />
            </span>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Volume / Impact</p>
              <p className="text-gray-700 mt-0.5 font-medium">{enterprise.production}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/70 p-5 border-t border-gray-100 space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Contacts Utiles</p>
        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
          <a href={`tel:${enterprise.contact.phone.replace(/\s+/g, '')}`} className="flex items-center hover:text-green-700 transition-colors group">
            <Phone size={14} className="mr-2 text-gray-400 group-hover:text-green-700" />
            <span className="font-medium">{enterprise.contact.phone}</span>
          </a>
          <a href={`mailto:${enterprise.contact.email}`} className="flex items-center hover:text-green-700 transition-colors group">
            <Mail size={14} className="mr-2 text-gray-400 group-hover:text-green-700" />
            <span className="truncate">{enterprise.contact.email}</span>
          </a>
          <a href={enterprise.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-green-700 transition-colors group">
            <Globe size={14} className="mr-2 text-gray-400 group-hover:text-green-700" />
            <span className="truncate underline decoration-gray-200 group-hover:decoration-green-700">{enterprise.contact.website.replace('https://', '')}</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const Enterprises = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête de section structuré */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col items-center mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-900 tracking-tight">
            Le Tissue Économique de nos Membres
          </h1>
          <div className="h-1 w-16 bg-emerald-500 my-4 rounded-full"></div>
          <p className="text-sm md:text-base text-gray-600 max-w-xl font-light">
            Explorez les initiatives entrepreneuriales, exploitations et cabinets d'études portés par les ingénieurs de l'AIFASA 17.
          </p>
        </motion.div>

        {/* Grille responsive */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {enterprisesData.map((enterprise, index) => (
            <EnterpriseCard key={enterprise.id} enterprise={enterprise} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Enterprises;