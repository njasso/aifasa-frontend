// src/pages/public/WhyJoin.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiUsers, 
  FiBriefcase, 
  FiHeart,
  FiTrendingUp,
  FiBookOpen,
  FiArrowRight,
  FiAward,
  FiShield
} from 'react-icons/fi';

const WhyJoin = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    membershipType: '', // Nouveau : Type d'adhésion
    specialty: '', 
    message: '' 
  });

  const reasons = [
    { icon: FiUsers, title: 'Écosystème Agro-Sylvan-Pastoral', description: 'Intégrez un réseau d\'ingénieurs experts, de partenaires sectoriels et d\'acteurs engagés pour le développement durable.' },
    { icon: FiBriefcase, title: 'Investissements & AGR', description: 'Prenez des parts ou collaborez au co-pilotage de projets agropastoraux collectifs et porteurs (pisciculture, aviculture).' },
    { icon: FiHeart, title: 'Fonds Social & Entraide', description: 'Bénéficiez ou soutenez une dynamique de solidarité structurée, active lors des grands événements de vie.' },
    { icon: FiTrendingUp, title: 'Synergies Financières', description: 'Accédez à des opportunités de co-financement et à des leviers internes pour propulser des initiatives entrepreneuriales.' },
    { icon: FiBookOpen, title: 'Partage d\'Expertise (Hub)', description: 'Valorisez vos compétences ou accédez à un vivier d\'ingénieurs qualifiés pour vos diagnostics et projets de terrain.' },
    { icon: FiAward, title: 'Rayonnement & Partenariats', description: 'Augmentez votre visibilité sectorielle, connectez vos activités et créez des passerelles d\'affaires durables.' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données de candidature soumises :', formData);
    alert('Votre demande d\'adhésion a bien été transmise au Bureau Exécutif de l\'AIFASA 17.');
    setFormData({ name: '', email: '', phone: '', membershipType: '', specialty: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden selection:bg-green-700 selection:text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-emerald-800 to-green-800 text-white py-24 px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1500')] mix-blend-overlay opacity-15 bg-cover bg-center"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight"
          >
            Rejoignez le Réseau AIFASA 17
          </motion.h1>
          <div className="h-1 w-20 bg-emerald-400 mx-auto mb-6 rounded"></div>
          <p className="text-base md:text-xl text-green-100 max-w-3xl mx-auto font-light leading-relaxed">
            Que vous soyez ingénieur de la promotion, professionnel du secteur ou partenaire stratégique, unissez vos forces aux nôtres.
          </p>
        </div>
      </section>

      {/* Grid des avantages */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900">Les Piliers de notre Coopération</h2>
          <p className="text-sm text-gray-600 mt-2">Le choix stratégique d’une croissance technique, financière et humaine partagée.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4 border border-green-100">
                  <reason.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">{reason.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Processus d'adhésion élargi */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <FiShield className="text-emerald-600" /> Le Parcours d'Intégration
            </h2>
            <div className="space-y-5">
              {[
                { step: '1', title: 'Dépôt de la Demande', desc: 'Complétez le formulaire en sélectionnant le statut correspondant à votre profil (Membre actif, Sympathisant ou Partenaire).' },
                { step: '2', title: 'Examen de Conformité', desc: 'Le Bureau Exécutif évalue l\'alignement de vos attentes avec la feuille de route et les projets agropastoraux du réseau.' },
                { step: '3', title: 'Quitus Statutaire', desc: 'Régularisation des contributions définies par l\'Assemblée Générale selon votre catégorie de membre afin d\'activer vos accès.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-7 h-7 bg-green-700 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs shadow-sm mt-0.5">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs md:text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-64 rounded-xl overflow-hidden shadow-inner relative border border-gray-100">
            <img 
              src="https://res.cloudinary.com/djhyztec8/image/upload/v1782072082/WhatsApp_Image_2026-06-21_at_20.06.26_qdar11.jpg" 
              alt="Dynamique réseau AIFASA 17" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-950/20 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Formulaire Multi-Profils */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-green-900 mb-1">Formulaire de Demande d'Adhésion / Partenariat</h2>
          <p className="text-xs text-gray-400 mb-6">Merci de renseigner vos informations réelles. Le secrétariat vous contactera après traitement de votre profil.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Nom Complet / Structure *</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none bg-gray-50/50"
                  placeholder="Ex: Davy EDONGO ou AfricaNut Industry"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Email de Contact *</label>
                <input
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none bg-gray-50/50"
                  placeholder="adresse@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Téléphone / WhatsApp *</label>
                <input
                  type="tel" required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none bg-gray-50/50"
                  placeholder="+237 6xx xx xx xx"
                />
              </div>
              
              {/* NOUVEAU : Sélection du Statut */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Statut Souhaité *</label>
                <select
                  required
                  value={formData.membershipType}
                  onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none bg-gray-50/50 text-gray-700 font-bold"
                >
                  <option value="">Sélectionnez le statut...</option>
                  <option value="Actif">Membre Actif (17ème Promotion FASA)</option>
                  <option value="Sympathisant">Membre Sympathisant (Autre promo / Extérieur)</option>
                  <option value="Partenaire">Partenaire Technique ou Financier</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Domaine / Spécialisation *</label>
                <select
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none bg-gray-50/50 text-gray-700 font-medium"
                >
                  <option value="">Sélectionnez un secteur...</option>
                  <option value="Agronomie / Foresterie">Agronomie & Sciences Forestières</option>
                  <option value="Productions Animales">Productions Animales & Élevage</option>
                  <option value="Aquaculture">Aquaculture & Gestion Halieutique</option>
                  <option value="Numérique / Data">Technologies du Numérique & Data</option>
                  <option value="Agribusiness / Commerce">Agribusiness & Agro-industrie</option>
                  <option value="Autre">Autre secteur d'activité</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Note d'intérêt, Parcours ou propositions de synergie</label>
              <textarea
                rows="4" value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none bg-gray-50/50"
                placeholder="Présentez brièvement vos activités actuelles, vos motivations à interagir avec l'AIFASA 17 ou la nature du partenariat envisagé..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white font-bold text-xs md:text-sm px-8 py-3.5 rounded-xl transition-all shadow shadow-green-900/20 flex items-center justify-center gap-2 group"
              >
                Soumettre ma demande
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default WhyJoin;