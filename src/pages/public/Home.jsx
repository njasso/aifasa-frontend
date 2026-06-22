// src/pages/public/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiFileText, 
  FiBriefcase, 
  FiHeart, 
  FiArrowRight,
  FiAward,
  FiTarget,
  FiGlobe,
  FiUserPlus
} from 'react-icons/fi';

const Home = () => {
  const stats = [
    { icon: FiUsers, value: '35+', label: 'Membres Actifs' },
    { icon: FiBriefcase, value: '3', label: 'Projets AGR' },
    { icon: FiFileText, value: '100+', label: 'Documents Partagés' },
    { icon: FiAward, value: '5+', label: 'Partenariats Stratégiques' },
  ];

  const features = [
    { icon: FiTarget, title: 'Notre Mission', description: 'Promouvoir le développement socio-économique durable des Ingénieurs Agronomes et Forestiers de la 17ème promotion de la FASA.' },
    { icon: FiHeart, title: 'Nos Valeurs', description: 'Solidarité indéfectible, Fraternité agissante et Développement inclusif constituent les piliers de notre ADN.' },
    { icon: FiGlobe, title: 'Notre Vision', description: 'Devenir le réseau professionnel agro-sylvicole et halieutique de référence au Cameroun et sur l’échiquier africain.' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section Premium avec Image de fond */}
      <section className="relative bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 text-white py-28 px-4 overflow-hidden">
        {/* Image d'ambiance pro en arrière-plan */}
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djhyztec8/image/upload/v1782068825/WhatsApp_Image_2026-06-21_at_20.02.23_1_ye5hx5.jpg')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <img 
                src="/images/logo.png" 
                alt="Logo AIFASA 17" 
                className="h-28 w-28 object-contain rounded-full bg-white/10 p-2 border-2 border-white/20 shadow-xl"
                onError={(e) => { e.target.style.display = 'none' }} 
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
              Association AIFASA 17
            </h1>
            <p className="text-xl md:text-2xl text-emerald-300 font-medium mb-4 tracking-wide uppercase text-sm">
              Solidarité · Fraternité · Développement
            </p>
            <p className="text-lg max-w-2xl mx-auto text-green-100/90 font-light mb-10 leading-relaxed">
              Plateforme d'excellence des Ingénieurs Agronomes et Forestiers issus de la 17ème promotion de la FASA.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/about"
                className="bg-white text-green-900 px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-green-50 hover:shadow-lg transition-all duration-200"
              >
                Découvrir l'Association
              </Link>
              <Link
                to="/why-join"
                className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-500 shadow-md hover:shadow-lg transition-all duration-200 border border-emerald-500 inline-flex items-center gap-2 group"
              >
                <FiUserPlus />
                Pourquoi adhérer ?
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section Animée */}
      <section className="py-12 bg-white relative z-20 -mt-8 max-w-5xl mx-auto rounded-2xl shadow-xl border border-gray-100 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 division-x division-gray-100">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4"
            >
              <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-green-900 mb-0.5">{stat.value}</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section Missions / Vision avec Images Latérales */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-green-900">Les Fondations de l'AIFASA 17</h2>
          <p className="text-gray-600 mt-2">Ce qui guide notre vision commune et nos projets d’avenir.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mb-5">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feat.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section Galerie d'Impact Visuel */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-md">Impact & Innovation</span>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">Des ingénieurs engagés sur le terrain</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Qu'il s'agisse de la mise en place de cultures résilientes, de la gestion durable des forêts ou de l'initiation de micro-projets créateurs de richesse (AGR), nos membres déploient leur savoir-faire au profit du réseau et de la société.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors">
                En savoir plus sur nos réalisations <FiArrowRight />
              </Link>
            </div>
            {/* Composition d'images asymétriques */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://res.cloudinary.com/djhyztec8/image/upload/v1782067599/PXL_20250621_072607623.RAW-01.COVER_h8ebrx.jpg" alt="Agro 1" className="w-full h-40 object-cover rounded-xl shadow" />
                <img src="https://res.cloudinary.com/djhyztec8/image/upload/v1782067778/WhatsApp_Image_2026-06-21_at_19.40.39_wawspc.jpg" alt="Agro 2" className="w-full h-52 object-cover rounded-xl shadow" />
              </div>
              <div className="pt-8 space-y-4">
                <img src="https://res.cloudinary.com/djhyztec8/image/upload/v1782069512/IMG_2892_chfgpd.jpg" alt="Agro 3" className="w-full h-52 object-cover rounded-xl shadow" />
                <img src="https://res.cloudinary.com/djhyztec8/image/upload/v1782069522/IMG_2831_sitw6l.jpg" alt="Agro 4" className="w-full h-40 object-cover rounded-xl shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Premium */}
      <section className="py-20 bg-gradient-to-br from-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à dynamiser votre réseau ?</h2>
            <p className="text-emerald-200 mb-8 max-w-xl mx-auto font-light">
              Rejoignez une synergie ambitieuse d'ingénieurs agronomes et forestiers. Participez à l’essor de la 17ème promotion.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/why-join"
                className="bg-white text-green-900 px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-green-50 transition-colors inline-flex items-center gap-2 group"
              >
                Adhérer maintenant
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="bg-green-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors border border-green-700/60 shadow-inner"
              >
                Espace Membre
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start">
                <img 
                  src="/images/logo.png" 
                  alt="Logo" 
                  className="h-14 w-14 object-contain rounded-full bg-white/5 p-1.5 border border-gray-800"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <span className="text-xl font-bold text-white ml-3 tracking-wider">AIFASA 17</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs mx-auto md:mx-0 font-light">
                Association des Ingénieurs Agronomes et Forestiers de la 17ème promotion de la FASA.
              </p>
            </div>

            <div className="text-center space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Liens Utiles</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Accueil</Link></li>
                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">À Propos</Link></li>
                <li><Link to="/why-join" className="hover:text-emerald-400 transition-colors">Adhérer</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Espace Privé</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-right space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact & Secrétariat</h4>
              <ul className="space-y-2 text-xs font-light">
                <li><a href="mailto:association.fasa17@gmail.com" className="hover:text-white transition-colors">association.fasa17@gmail.com</a></li>
                <li><a href="tel:+237620370286" className="hover:text-white transition-colors">+237 620 370 286</a></li>
                <li><a href="tel:+237696322069" className="hover:text-white transition-colors">+237 696 322 069</a></li>
                <li className="text-gray-600 text-[10px] mt-2 uppercase tracking-widest">Yaoundé, Cameroun</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/80 pt-8 mt-4 text-center space-y-2">
            <p className="text-xs">&copy; {new Date().getFullYear()} AIFASA 17. Tous droits réservés.</p>
            <p className="text-[10px] text-gray-600">
              Ingénierie web orchestrée par la Nouvelle Académie Numérique Africaine <span className="font-semibold text-gray-500">"NA2"</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;