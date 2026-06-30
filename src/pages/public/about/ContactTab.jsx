// src/pages/public/about/ContactTab.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { contactInfo, socialLinks } from './aboutData';

const ContactTab = () => (
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
          association@aifasa17.org • +237 620 370 286 / +237 696 322 069
        </p>
      </div>
    </div>
  </motion.div>

);

export default ContactTab;
