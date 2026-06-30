// src/pages/public/publications/PublicationFormModal.jsx
// Formulaire de création/édition d'une publication (admin), extrait de Publications.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage, FiFile, FiSave } from 'react-icons/fi';

const PublicationFormModal = ({
  isOpen,
  isAdmin,
  editingId,
  formData,
  setFormData,
  documentFiles,
  newLink,
  setNewLink,
  isSubmitting,
  onClose,
  onSubmit,
  onImageChange,
  onDocumentChange,
  onRemoveDocument,
  onAddExternalLink,
  onRemoveExternalLink,
}) => (
  <AnimatePresence>
    {isOpen && isAdmin && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <h3 className="font-bold text-gray-800 text-lg">
              {editingId ? '✏️ Modifier la publication' : '✨ Créer une nouvelle entrée'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Titre de la publication *
              </label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
                className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Corps du texte / Contenu
              </label>
              <textarea 
                value={formData.content} 
                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} 
                rows={5} 
                className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Type de document
                </label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} 
                  className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
                >
                  <option value="article">📄 Article technique</option>
                  <option value="rapport">📊 Rapport officiel</option>
                  <option value="actualite">📰 Actualité d'impact</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Thématique / Catégorie
                </label>
                <input 
                  type="text" 
                  value={formData.category} 
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} 
                  placeholder="Ex: Aquaculture, Financement..." 
                  className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                />
              </div>
            </div>

            {/* Bannière Image */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                🖼️ Couverture ou Illustration
              </label>
              <div className="flex items-center gap-4">
                {formData.imagePreview && (
                  <img 
                    src={formData.imagePreview} 
                    alt="" 
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" 
                  />
                )}
                <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                  <span className="text-sm text-gray-500 inline-flex items-center gap-2">
                    <FiImage className="w-5 h-5" />
                    {formData.imagePreview ? 'Remplacer l\'image (Max 5Mo)' : 'Téléverser un visuel d\'en-tête'}
                  </span>
                  <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Annexes / Fichiers joints */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                📎 Documents annexes
              </label>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                <span className="text-sm text-gray-500 inline-flex items-center gap-2">
                  <FiFile className="w-5 h-5" />
                  Attacher des fichiers (PDF, Excel, Word...)
                </span>
                <input type="file" multiple onChange={onDocumentChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
              </label>
              {documentFiles.length > 0 && (
                <div className="mt-2 space-y-1.5 bg-gray-50/80 p-3 rounded-xl">
                  {documentFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-gray-600">
                      <span className="truncate max-w-[85%]">{file.name}</span>
                      <button type="button" onClick={() => onRemoveDocument(idx)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liens Ressources Hypertextes */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                🔗 Indexation de liens utiles
              </label>
              <div className="flex flex-wrap gap-2">
                <input 
                  type="url" 
                  placeholder="https://exemple.com" 
                  value={newLink.url} 
                  onChange={(e) => setNewLink(p => ({ ...p, url: e.target.value }))} 
                  className="flex-1 min-w-[150px] p-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                />
                <input 
                  type="text" 
                  placeholder="Libellé du lien" 
                  value={newLink.label} 
                  onChange={(e) => setNewLink(p => ({ ...p, label: e.target.value }))} 
                  className="flex-1 min-w-[100px] p-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all" 
                />
                <button 
                  type="button" 
                  onClick={onAddExternalLink} 
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Ajouter
                </button>
              </div>
              {formData.externalLinks.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {formData.externalLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                      <span className="truncate text-blue-600 font-medium">{link.label || link.url}</span>
                      <button type="button" onClick={() => onRemoveExternalLink(idx)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visibilité */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                📌 Cycle de vie & Statut
              </label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} 
                className="w-full p-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all"
              >
                <option value="published">🚀 Publier immédiatement</option>
                <option value="draft">📝 Enregistrer comme Brouillon</option>
                <option value="archived">📦 Archiver l'élément</option>
              </select>
            </div>

            {/* Pied de formulaire actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 font-medium transition-all"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {isSubmitting ? 'Traitement...' : (editingId ? 'Mettre à jour' : 'Lancer la publication')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PublicationFormModal;
