import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();


  // Données de la page
  const activities = [
    { id: 1, title: "Séminaire sur l'Agro-pastoralisme", description: "Discussion sur les techniques modernes et durables.", date: "25 Février 2025" },
    { id: 2, title: "Atelier de Mentorat", description: "Accompagnement des jeunes ingénieurs dans leur carrière.", date: "10 Mars 2025" },
    { id: 3, title: "Campagne de Sensibilisation", description: "Promotion de l'éducation en milieu rural.", date: "15 Avril 2025" },
  ];

  const projects = [
    { id: 1, name: "Projet AGR 'Jardins Verts'", description: "Développement de jardins communautaires durables.", status: "En cours" },
    { id: 2, name: "Incubateur Tech Agricole", description: "Soutien aux startups innovantes dans l'agritech.", status: "Phase de conception" },
    { id: 3, name: "Programme de Forage d'Eau", description: "Accès à l'eau potable pour les communautés reculées.", status: "Terminé" },
  ];

  const boardMembers = [
    { id: 1, name: "NDONGO Davy", title: "Président", photo: "/images/members/NDONGO_Davy.jpg" },
    { id: 2, name: "AIFASA 17", title: "Vice-Présidente", photo: "/images/members/AIFASA_17_Vice_President.jpg" },
    { id: 3, name: "BINDOP Franck", title: "Secrétaire Général", photo: "/images/members/BINDOP_Franck.jpg" },
    { id: 4, name: "NGIDJOL", title: "Trésorière", photo: "/images/members/NGIDJOL.jpg" },
  ];

  const galleryItems = [
    { id: 1, title: "Journée de l'AGR", image: "/images/gallery/gallery1.jpg", description: "Préparation des sols pour la culture." },
    { id: 2, title: "Atelier de formation", image: "/images/gallery/gallery2.jpg", description: "Participants à l'atelier de codage." },
    { id: 3, title: "Rencontre des membres", image: "/images/gallery/gallery3.jpg", description: "Moment de convivialité entre ingénieurs." },
    { id: 4, title: "Inauguration projet eau", image: "/images/gallery/gallery4.jpg", description: "Cérémonie d'inauguration du forage." },
  ];

  const partners = [
    { id: 1, name: "AFRICANUT INDUSTRY GROUP", logo: "/images/partners/AFRICANUT_INDUSTRY_GROUP.png" },
    { id: 2, name: "MAGATON PROVENDER", logo: "/images/partners/MAGATON_PROVENDER.png" },
    { id: 3, name: "AFRICANUT FISH MARKET", logo: "/images/partners/AFRICANUT_FISH_MARKET.png" },
  ];

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/background_agro.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay amélioré avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 z-0"></div>

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-6xl space-y-12">

        {/* En-tête */}
        <motion.header 
          className="w-full flex flex-col sm:flex-row items-center justify-between mb-8 pb-6 border-b-2 border-emerald-400"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <img 
              src="/images/logo.png" 
              alt="Logo AIFASA 17" 
              className="h-20 w-20 object-contain mr-4 border-2 border-emerald-400 rounded-full p-1 bg-white/90 shadow-md" 
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
              Plateforme <span className="text-emerald-400 font-extrabold">AIFASA 17</span>
            </h1>
          </div>
          {user && (
            <div className="px-4 py-2 rounded-lg bg-emerald-50 shadow-sm">
              <p className="text-sm text-emerald-800 font-medium">
                Connecté en tant que <span className="font-semibold">{user.role}</span>
              </p>
            </div>
          )}
        </motion.header>

        {/* Carte d'introduction */}
        <motion.div 
          className="w-full bg-white rounded-xl shadow-lg p-8 backdrop-blur-sm bg-white/95"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold text-emerald-800 mb-4">
            {user ? `Bienvenue, ${user.email.split('@')[0]} !` : 'Bienvenue sur la plateforme AIFASA 17'}
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            Cette plateforme est conçue pour faciliter la gestion des activités de l'association des ingénieurs 
            de la 17ème promotion. Elle centralise les documents, les projets AGR, les événements et les 
            communications entre membres.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm hover:shadow-md transition-all"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-emerald-800 mb-3">Notre Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                Promouvoir l'excellence technique, soutenir le développement professionnel de nos membres 
                et renforcer les liens fraternels entre ingénieurs.
              </p>
            </motion.div>
            
            <motion.div 
              className="p-6 rounded-xl bg-amber-50 border border-amber-200 shadow-sm hover:shadow-md transition-all"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-amber-900 mb-3">Nos Valeurs</h3>
              <p className="text-gray-700 leading-relaxed">
                Intégrité, Innovation, Solidarité et Engagement communautaire sont les piliers de notre association.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Section Activités */}
        <motion.section
          className="w-full bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="flex items-center mb-6">
            <div className="h-1 w-12 bg-emerald-400 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-emerald-800">Nos Activités Récentes</h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {activities.map((activity) => (
              <motion.div 
                key={activity.id}
                className="p-5 rounded-lg border border-emerald-200 bg-emerald-50 shadow-sm hover:shadow-md transition-all"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="font-semibold text-emerald-800 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-700 mb-3">{activity.description}</p>
                <p className="text-xs text-gray-500 font-medium">
                  <span className="text-emerald-600">Date:</span> {activity.date}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section Projets */}
        <motion.section
          className="w-full bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="flex items-center mb-6">
            <div className="h-1 w-12 bg-amber-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-amber-900">Nos Projets AGR</h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                className="p-5 rounded-lg border border-amber-200 bg-amber-50 shadow-sm hover:shadow-md transition-all"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="font-semibold text-amber-900 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                  project.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' : 
                  project.status === 'En cours' ? 'bg-amber-100 text-amber-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {project.status}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section Bureau */}
        <motion.section
          className="w-full bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">Bureau de l'Association</h2>
            <p className="text-gray-700">L'équipe qui dirige et représente AIFASA 17</p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {boardMembers.map((member) => (
              <motion.div 
                key={member.id}
                className="flex flex-col items-center"
                variants={fadeInUp}
              >
                <div className="relative mb-4 group">
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-emerald-300 transition-all"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-emerald-500 transition-all pointer-events-none"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-center">{member.name}</h3>
                <p className="text-sm text-emerald-600 font-medium">{member.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section Galerie */}
        <motion.section
          className="w-full bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="flex items-center mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-amber-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Galerie Photo Evènements</h2>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {galleryItems.map((item) => (
              <motion.div 
                key={item.id}
                className="relative overflow-hidden rounded-lg aspect-square shadow-md"
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div>
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section Partenaires - Version améliorée */}
        <motion.section
          className="w-full bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Nos Partenaires</h2>
            <p className="text-gray-700">Ils nous accompagnent dans nos projets</p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {partners.map((partner) => (
              <motion.div 
                key={partner.id}
                className="flex flex-col items-center p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="h-32 flex items-center justify-center mb-4">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center">{partner.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Section Contact */}
        <motion.section
          className="w-full bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">Contactez-nous</h2>
            <p className="text-gray-700">Nous sommes à votre écoute pour toute question</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <motion.div 
              className="p-6 rounded-lg bg-emerald-50 border border-emerald-200"
              variants={fadeInUp}
            >
              <h3 className="font-semibold text-emerald-800 mb-2">Email</h3>
              <a 
                href="mailto:contact@aifasa17.org" 
                className="text-emerald-600 hover:underline"
              >
                contact@aifasa17.org
              </a>
            </motion.div>
            
            <motion.div 
              className="p-6 rounded-lg bg-amber-50 border border-amber-200"
              variants={fadeInUp}
            >
              <h3 className="font-semibold text-amber-900 mb-2">Téléphone</h3>
              <p className="text-amber-700">+237 620 37 02 86</p>
            </motion.div>
            
            <motion.div 
              className="p-6 rounded-lg bg-gray-50 border border-gray-200"
              variants={fadeInUp}
            >
              <h3 className="font-semibold text-gray-900 mb-2">Réseaux sociaux</h3>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-emerald-600 hover:text-emerald-800">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-emerald-600 hover:text-emerald-800">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-emerald-600 hover:text-emerald-800">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Pied de page - Version améliorée */}
        <motion.footer 
          className="w-full py-8 text-center bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-xl shadow-lg mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-4">
            <img 
              src="/images/logo.png" 
              alt="Logo AIFASA 17" 
              className="h-16 w-16 object-contain mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-white mb-2">Association AIFASA 17</h3>
            <p className="text-emerald-200 mb-4">
              Promouvoir l'excellence technique et renforcer les liens fraternels entre ingénieurs
            </p>
            
            <div className="border-t border-emerald-700 pt-6">
              <p className="text-white font-medium">
                &copy; {new Date().getFullYear()} AIFASA 17. Tous droits réservés.
              </p>
              <p className="text-emerald-300 text-sm mt-2">
                Conçu avec passion pour la promotion 17
              </p>
            </div>
          </div>
        </motion.footer>

      </div>
    </div>
  );
};

export default Home;