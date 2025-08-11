import React from 'react';
import { motion } from 'framer-motion';
import { Building, Phone, Mail, Globe, PiggyBank, Fish, HeartHandshake, Sprout, Building2, Briefcase } from 'lucide-react';

const enterprisesData = [
  {
    id: 1,
    name: 'Ferme Piscicole "AfricaNut Fish Market"',
    // URLs fournies par Cloudinary
    logo: 'https://res.cloudinary.com/djhyztec8/image/fetch/v1754811262/https://harmonious-boba-e7278d.netlify.app/cld-assets/images/partners/AFRICANUT_FISH_MARKET.png',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754812663/WhatsApp_Image_2024-10-08_%C3%A0_11.42.46_edf79ff4_cmppa6.jpg',
    activity: 'Élevage, vente de poissons d\'eau douce (silure, tilapia, carpe), aménagement des sites piscicoles et vente d\'équipements.',
    products: 'Silure, tilapia frais, filets de poisson, alevins.',
    production: 'Production annuelle de 7 tonnes de poisson.',
    contact: {
      phone: '+237 6 20 37 02 86',
      email: 'africanutindustry@outlook.com',
      website: 'www.africanutgroup.com'
    }
  },
  {
    id: 2,
    name: 'Élevage Avicole "La Cocotte Joyeuse"',
    logo: 'https://placehold.co/100x100/991b1b/ffffff?text=Logo',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754813064/little-chicks-farm_f5clss.jpg',
    activity: 'Production de poulets de chair et de poules pondeuses.',
    products: 'Poulets entiers, œufs de table, poussins.',
    production: '50 000 poulets produits par an.',
    contact: {
      phone: '+237 6 88 99 00 11',
      email: 'info@lacocottejoyeuse.com',
      website: 'www.lacocottejoyeuse.com'
    }
  },
  {
    id: 3,
    name: 'Porcherie "Le Cochon Heureux"',
    logo: 'https://placehold.co/100x100/be123c/ffffff?text=Logo',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754815648/scene-photorealiste-vie-ferme-cochons_h8jmzn.jpg',
    activity: 'Élevage de porcs et transformation de produits à base de porc.',
    products: 'Viande de porc fraîche, saucissons, jambon.',
    production: 'Production de 25 tonnes de viande de porc par an.',
    contact: {
      phone: '+237 6 99 00 11 22',
      email: 'contact@lecochonheureux.com',
      website: 'www.lecochonheureux.com'
    }
  },
  {
    id: 4,
    name: 'Agri-Végétale "Terre Fertile"',
    logo: 'https://placehold.co/100x100/166534/ffffff?text=Logo',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754813075/vue-pres-du-mais-encore-dans-sa-coquille_r3r22n.jpg',
    activity: 'Culture de légumes (tomates, poivrons, oignons) et de fruits.',
    products: 'Légumes et fruits de saison frais.',
    production: '30 tonnes de produits récoltés par an.',
    contact: {
      phone: '+237 6 11 22 33 44',
      email: 'contact@terrefertile.com',
      website: 'www.terrefertile.com'
    }
  },
  {
    id: 5,
    name: 'Bureau d\'Études "Alpha Conseil"',
    logo: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754936839/WhatsApp_Image_2024-10-21_%C3%A0_09.58.35_31ede8c6_igk2wj.png',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754936616/0_bqykuz.png',
    activity: 'Services de conseil et d\'études de faisabilité pour projets agricoles.',
    products: 'Études de marché, plans d\'affaires, formations.',
    production: '50 projets de conseil réalisés par an.',
    contact: {
      phone: '+237 6 22 33 44 55',
      email: 'info@alphaconseil.com',
      website: 'www.alphaconseil.com'
    }
  },
  {
    id: 6,
    name: 'Coopérative "AIFASA 17"',
    logo: 'https://placehold.co/100x100/065f46/ffffff?text=Logo',
    image: 'https://res.cloudinary.com/djhyztec8/image/upload/v1754815391/front-view-plants-with-coins-stacked-dirt_erjelb.jpg',
    activity: 'Rassemblement des membres d\'AIFASA 17 pour des projets collectifs.',
    products: 'Services de mutualisation, projets de développement commun.',
    production: 'Gestion de projets agricoles et sociaux pour la communauté.',
    contact: {
      phone: '+237 6 33 44 55 66',
      email: 'aifasa17@cooperative.com',
      website: 'www.aifasa17.org'
    }
  },
];

const EnterpriseCard = ({ enterprise, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1
      }
    }
  };

  const getIconForActivity = (activity) => {
    if (activity.toLowerCase().includes('piscicole') || activity.toLowerCase().includes('poissons')) return <Fish className="text-green-500" />;
    if (activity.toLowerCase().includes('avicole') || activity.toLowerCase().includes('poulets')) return <Briefcase className="text-yellow-500" />;
    if (activity.toLowerCase().includes('porcs')) return <PiggyBank className="text-pink-500" />;
    if (activity.toLowerCase().includes('légumes') || activity.toLowerCase().includes('culture')) return <Sprout className="text-emerald-500" />;
    if (activity.toLowerCase().includes('conseil') || activity.toLowerCase().includes('études')) return <Building2 className="text-indigo-500" />;
    if (activity.toLowerCase().includes('coopérative')) return <HeartHandshake className="text-teal-500" />;
    return <Building />;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
    >
      <img
        src={enterprise.image}
        alt={enterprise.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <img
            src={enterprise.logo}
            alt={`${enterprise.name} logo`}
            className="w-12 h-12 rounded-full mr-4 border-2 border-gray-200"
          />
          <h3 className="text-2xl font-bold text-gray-800">{enterprise.name}</h3>
        </div>
        <div className="space-y-4 text-gray-600 flex-1">
          <div className="flex items-start">
            <span className="flex-shrink-0 text-emerald-600 mr-2 mt-1">{getIconForActivity(enterprise.activity)}</span>
            <div>
              <p className="font-semibold text-gray-700">Activités et services :</p>
              <p className="text-sm">{enterprise.activity}</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 text-emerald-600 mr-2 mt-1"><Briefcase /></span>
            <div>
              <p className="font-semibold text-gray-700">Produits et services :</p>
              <p className="text-sm">{enterprise.products}</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 text-emerald-600 mr-2 mt-1"><Building /></span>
            <div>
              <p className="font-semibold text-gray-700">Production :</p>
              <p className="text-sm">{enterprise.production}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-6 border-t border-gray-100">
        <p className="font-semibold text-gray-700 mb-2">Contact :</p>
        <div className="flex flex-col space-y-2 text-sm text-gray-600">
          <a href={`tel:${enterprise.contact.phone}`} className="flex items-center hover:text-emerald-600 transition-colors">
            <Phone size={16} className="mr-2" />
            {enterprise.contact.phone}
          </a>
          <a href={`mailto:${enterprise.contact.email}`} className="flex items-center hover:text-emerald-600 transition-colors">
            <Mail size={16} className="mr-2" />
            {enterprise.contact.email}
          </a>
          <a href={`http://${enterprise.contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-emerald-600 transition-colors">
            <Globe size={16} className="mr-2" />
            {enterprise.contact.website}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const Enterprises = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col items-center mb-10 text-center"
      >
        <h1 className="text-4xl font-extrabold text-emerald-800 mb-2">Nos Entreprises Partenaires</h1>
        <p className="text-lg text-gray-600">Découvrez les activités et les services des entreprises de nos membres.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {enterprisesData.map((enterprise, index) => (
          <EnterpriseCard key={enterprise.id} enterprise={enterprise} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export default Enterprises;
