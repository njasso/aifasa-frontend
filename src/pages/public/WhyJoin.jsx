// src/pages/public/WhyJoin.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiUsers, 
  FiBriefcase, 
  FiHeart,
  FiDollarSign,
  FiFileText,
  FiArrowRight,
  FiAward
} from 'react-icons/fi';

const WhyJoin = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const reasons = [
    { icon: FiUsers, title: 'Réseau Professionnel', description: 'Rejoignez une communauté d\'élite de plus de 50 ingénieurs agronomes et forestiers.' },
    { icon: FiBriefcase, title: 'Projets AGR', description: 'Participez activement à des activités génératrices de revenus et à des projets agropastoraux innovants.' },
    { icon: FiHeart, title: 'Solidarité Sociale', description: 'Bénéficiez d\'une couverture via le fonds social et de solides mécanismes d\'entraide mutuelle.' },
    { icon: FiDollarSign, title: 'Épargne et Tontine', description: 'Accédez à des systèmes internes structurés d\'épargne et de crédit pour propulser vos projets.' },
    { icon: FiFileText, title: 'Formation Continue', description: 'Profitez d\'ateliers techniques exclusifs, de masterclasses et de partages d\'expertises.' },
    { icon: FiAward, title: 'Visibilité Sectorielle', description: 'Valorisez vos compétences et étendez votre influence dans l\'écosystème de l\'agro-sylviculture.' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Votre demande d\'adhésion a bien été prise en compte en mode démonstration.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-800 to-green-800 text-white py-24 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1500')] mix-blend-overlay opacity-15 bg-cover bg-center"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Pourquoi Adhérer à l'AIFASA 17 ?
          </motion.h1>
          <div className="h-1 w-20 bg-emerald-400 mx-auto mb-6 rounded"></div>
          <p className="text-xl text-green-100 max-w-3xl mx-auto font-light">
            Unissez vos forces à celles d'un réseau dynamique d'ingénieurs au service du développement durable.
          </p>
        </div>
      </section>

      {/* Grid des avantages */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-900">Les Avantages Uniques de notre Réseau</h2>
          <p className="text-gray-600 mt-2">Faites le choix d’une croissance professionnelle et humaine partagée.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <reason.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{reason.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Processus d'adhésion avec visuel */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-green-900 mb-6">Le Processus d'Intégration</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Expression d’intérêt', desc: 'Complétez le formulaire ci-dessous pour manifester votre volonté de rejoindre la synergie.' },
                { step: '2', title: 'Étude du dossier', desc: 'Le Bureau Exécutif examine la conformité de votre profil avec la charte de la 17ème promotion FASA.' },
                { step: '3', title: 'Validation & Immersion', desc: 'Solder les droits d’entrée statutaires pour débloquer vos accès aux opportunités et plateformes privées.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-md">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Image illustrative du processus */}
          <div className="h-64 rounded-xl overflow-hidden shadow-inner relative">
            <img 
              src="https://res.cloudinary.com/djhyztec8/image/upload/v1782072082/WhatsApp_Image_2026-06-21_at_20.06.26_qdar11.jpg" 
              alt="Team work network" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-green-900/10"></div>
          </div>
        </div>

        {/* Formulaire */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-green-900 mb-2">Formulaire de Demande d'Adhésion</h2>
          <p className="text-sm text-gray-500 mb-6">* Informations obligatoires. Réservé aux ingénieurs de la promotion.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Email Professionnel *</label>
                <input
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none"
                  placeholder="jean.dupont@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Numéro Téléphone / WhatsApp</label>
              <input
                type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none"
                placeholder="+237 6xx xx xx xx"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Note de motivation ou parcours</label>
              <textarea
                rows="4" value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none"
                placeholder="Décrivez brièvement vos attentes ou vos spécialisations actuelles..."
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              Soumettre ma candidature
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default WhyJoin;