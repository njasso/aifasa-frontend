// src/pages/public/AGSpace.jsx - COMPLET (Données initiales vides)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, FileText, Download, CheckCircle, Users, Clock, Mail,
  Edit3, Save, X, Plus, Trash2, Eye, EyeOff, Globe
} from 'lucide-react';

const AGSpace = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeSection, setActiveSection] = useState('ordre');
  const [editMode, setEditMode] = useState(false);

  // Données initiales vides - vous allez tout remplir
  const [agData, setAgData] = useState({
    title: 'Assemblée Générale',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 17:00',
    location: '',
    venue: '',
    contact: 'association.fasa17@gmail.com',
    phone: '+237 620 370 286',
    maxProcurations: 2,
    procurationDeadline: new Date().toISOString().split('T')[0],
    hebergement: '',
    ordreDuJour: [],
    documents: [],
  });

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aifasa_ag_data');
    if (saved) {
      try { setAgData(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Sauvegarder
  const saveData = () => {
    localStorage.setItem('aifasa_ag_data', JSON.stringify(agData));
    setEditMode(false);
  };

  // Gérer les points de l'ordre du jour
  const updateOrdreDuJour = (id, text) => {
    setAgData(prev => ({
      ...prev,
      ordreDuJour: prev.ordreDuJour.map(item => item.id === id ? { ...item, text } : item)
    }));
  };

  const addOrdrePoint = () => {
    const newId = agData.ordreDuJour.length > 0 ? Math.max(...agData.ordreDuJour.map(i => i.id), 0) + 1 : 1;
    setAgData(prev => ({
      ...prev,
      ordreDuJour: [...prev.ordreDuJour, { id: newId, text: '' }]
    }));
  };

  const removeOrdrePoint = (id) => {
    setAgData(prev => ({
      ...prev,
      ordreDuJour: prev.ordreDuJour.filter(item => item.id !== id)
    }));
  };

  // Gérer les documents
  const updateDocument = (id, field, value) => {
    setAgData(prev => ({
      ...prev,
      documents: prev.documents.map(doc => doc.id === id ? { ...doc, [field]: value } : doc)
    }));
  };

  const addDocument = () => {
    const newId = agData.documents.length > 0 ? Math.max(...agData.documents.map(d => d.id), 0) + 1 : 1;
    setAgData(prev => ({
      ...prev,
      documents: [...prev.documents, { id: newId, name: '', format: 'PDF', size: '', url: '', visible: true }]
    }));
  };

  const removeDocument = (id) => {
    setAgData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  const sections = [
    { id: 'ordre', label: 'Ordre du Jour', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Download },
    { id: 'procuration', label: 'Procuration', icon: CheckCircle },
    { id: 'info', label: 'Infos Pratiques', icon: MapPin },
  ];

  // Filtrer les documents visibles (hors mode édition)
  const visibleDocuments = agData.documents.filter(d => d.visible && d.url && d.url !== '#');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-5"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 mb-4">
              🗳️ Assemblée Générale
            </span>
            {editMode ? (
              <input value={agData.title} onChange={e => setAgData(p => ({ ...p, title: e.target.value }))} 
                className="text-4xl md:text-5xl font-extrabold mb-4 bg-transparent border-b-2 border-white/30 text-center w-full max-w-2xl outline-none" />
            ) : (
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{agData.title || 'Assemblée Générale'}</h1>
            )}
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
              {editMode ? (
                <>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />
                    <input type="date" value={agData.date} onChange={e => setAgData(p => ({ ...p, date: e.target.value }))} className="bg-white/10 rounded px-2 py-1 text-white outline-none" />
                  </span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" />
                    <input value={agData.time} onChange={e => setAgData(p => ({ ...p, time: e.target.value }))} className="bg-white/10 rounded px-2 py-1 text-white outline-none w-32" />
                  </span>
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />
                    <input value={agData.location} onChange={e => setAgData(p => ({ ...p, location: e.target.value }))} className="bg-white/10 rounded px-2 py-1 text-white outline-none w-48" placeholder="Ville, Pays" />
                  </span>
                </>
              ) : (
                <>
                  {agData.date !== new Date().toISOString().split('T')[0] && (
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(agData.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  )}
                  {agData.time && <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {agData.time}</span>}
                  {agData.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {agData.location}</span>}
                </>
              )}
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Tous les membres</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Barre Admin */}
      {isAdmin && (
        <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20 flex justify-end">
          <button onClick={() => editMode ? saveData() : setEditMode(true)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${
              editMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white hover:bg-gray-50 text-green-700 border border-gray-200'
            }`}>
            {editMode ? <><Save className="w-4 h-4" /> Enregistrer</> : <><Edit3 className="w-4 h-4" /> Modifier</>}
          </button>
          {editMode && (
            <button onClick={() => setEditMode(false)} className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all">
              <X className="w-4 h-4" /> Annuler
            </button>
          )}
        </div>
      )}

      {/* Navigation sections */}
      <div className="container mx-auto max-w-4xl px-4 -mt-2 relative z-10 pt-4">
        <div className="bg-white rounded-xl shadow-md p-2 flex flex-wrap gap-1 border">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSection === s.id ? 'bg-green-700 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu sections */}
      <div className="container mx-auto max-w-4xl px-4 py-8 pb-16">
        
        {/* ==== ORDRE DU JOUR ==== */}
        {activeSection === 'ordre' && (
          <div className="bg-white rounded-2xl shadow-md border p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">📋 Ordre du Jour</h2>
              {editMode && (
                <button onClick={addOrdrePoint} className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800">
                  <Plus className="w-3 h-3" /> Ajouter un point
                </button>
              )}
            </div>
            {agData.ordreDuJour.length === 0 && !editMode ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="mx-auto w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">L'ordre du jour sera communiqué prochainement.</p>
              </div>
            ) : (
              <ol className="space-y-3 list-decimal list-inside text-gray-700 text-sm">
                {agData.ordreDuJour.map((point) => (
                  <li key={point.id} className={`font-semibold flex items-start gap-2 ${editMode ? 'bg-gray-50 rounded-lg p-2' : ''}`}>
                    <span className="flex-1">
                      {editMode ? (
                        <input value={point.text} onChange={e => updateOrdreDuJour(point.id, e.target.value)} 
                          className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-green-500" placeholder="Texte du point..." />
                      ) : point.text}
                    </span>
                    {editMode && (
                      <button onClick={() => removeOrdrePoint(point.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* ==== DOCUMENTS ==== */}
        {activeSection === 'documents' && (
          <div className="bg-white rounded-2xl shadow-md border p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">📎 Documents</h2>
              {editMode && (
                <button onClick={addDocument} className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800">
                  <Plus className="w-3 h-3" /> Ajouter un document
                </button>
              )}
            </div>
            {visibleDocuments.length === 0 && !editMode ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="mx-auto w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">Aucun document disponible pour le moment.</p>
              </div>
            ) : (
              visibleDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.format}{doc.size ? ` · ${doc.size}` : ''}</p>
                    </div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800">
                    <Download className="w-4 h-4" /> Télécharger
                  </a>
                </div>
              ))
            )}
            {/* Mode édition : afficher tous les documents */}
            {editMode && agData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <input value={doc.name} onChange={e => updateDocument(doc.id, 'name', e.target.value)} className="font-semibold text-gray-800 text-sm bg-white border rounded px-2 py-1 w-full sm:w-48 outline-none" placeholder="Nom du document" />
                      <input value={doc.format} onChange={e => updateDocument(doc.id, 'format', e.target.value)} className="text-xs bg-white border rounded px-2 py-1 w-16 outline-none" placeholder="PDF" />
                      <input value={doc.size} onChange={e => updateDocument(doc.id, 'size', e.target.value)} className="text-xs bg-white border rounded px-2 py-1 w-20 outline-none" placeholder="Taille" />
                      <input value={doc.url} onChange={e => updateDocument(doc.id, 'url', e.target.value)} placeholder="URL du fichier" className="text-xs bg-white border rounded px-2 py-1 w-40 outline-none" />
                      <button onClick={() => updateDocument(doc.id, 'visible', !doc.visible)} className={`text-xs px-2 py-1 rounded ${doc.visible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {doc.visible ? <Eye className="w-3 h-3 inline" /> : <EyeOff className="w-3 h-3 inline" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeDocument(doc.id)} className="text-red-400 hover:text-red-600 flex-shrink-0 ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ==== PROCURATION ==== */}
        {activeSection === 'procuration' && (
          <div className="bg-white rounded-2xl shadow-md border p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">✍️ Procuration</h2>
            <p className="text-gray-600 text-sm">
              Si vous ne pouvez pas assister à l'AG, vous pouvez donner procuration à un autre membre.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="font-bold text-amber-800 mb-2">📌 Rappel statutaire</p>
              {editMode ? (
                <div className="flex items-center gap-2">
                  <span>Chaque membre présent peut détenir au maximum</span>
                  <input type="number" value={agData.maxProcurations} onChange={e => setAgData(p => ({ ...p, maxProcurations: parseInt(e.target.value) || 1 }))} 
                    className="w-12 text-center border rounded px-1 font-bold outline-none" />
                  <span>procurations.</span>
                </div>
              ) : (
                <p className="text-amber-700">Chaque membre présent peut détenir au maximum <strong>{agData.maxProcurations} procurations</strong>.</p>
              )}
            </div>
            <ol className="space-y-2 text-sm text-gray-700 ml-5 list-decimal">
              <li>Téléchargez le formulaire de procuration</li>
              <li>Remplissez-le et signez-le</li>
              {editMode ? (
                <li>Envoyez-le par email à <a href={`mailto:${agData.contact}`} className="text-green-600 font-bold">{agData.contact}</a> avant le 
                  <input type="date" value={agData.procurationDeadline} onChange={e => setAgData(p => ({ ...p, procurationDeadline: e.target.value }))} className="mx-1 border rounded px-1 text-xs outline-none" />
                </li>
              ) : (
                <li>Envoyez-le par email à <a href={`mailto:${agData.contact}`} className="text-green-600 font-bold">{agData.contact}</a> avant le {new Date(agData.procurationDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</li>
              )}
            </ol>
            {visibleDocuments.find(d => d.name?.toLowerCase().includes('procuration')) ? (
              <a href={visibleDocuments.find(d => d.name?.toLowerCase().includes('procuration'))?.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
                <Download className="w-4 h-4" /> Télécharger le formulaire
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">Le formulaire de procuration sera disponible prochainement.</p>
            )}
          </div>
        )}

        {/* ==== INFOS PRATIQUES ==== */}
        {activeSection === 'info' && (
          <div className="bg-white rounded-2xl shadow-md border p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Informations Pratiques</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: MapPin, title: 'Lieu', field: 'venue', value: agData.venue },
                { icon: Calendar, title: 'Date', value: agData.date !== new Date().toISOString().split('T')[0] ? new Date(agData.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'À déterminer' },
                { icon: Clock, title: 'Horaire', field: 'time', value: agData.time },
                { icon: Mail, title: 'Contact', field: 'contact', value: agData.contact },
              ].map((info, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                  <info.icon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase">{info.title}</p>
                    {editMode && info.field ? (
                      <input value={agData[info.field] || ''} onChange={e => setAgData(p => ({ ...p, [info.field]: e.target.value }))} 
                        className="text-sm font-semibold text-gray-800 bg-white border rounded px-2 py-1 w-full outline-none" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{info.value || 'À déterminer'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm mt-4">
              <p className="font-bold text-green-800">🏨 Hébergement</p>
              {editMode ? (
                <textarea value={agData.hebergement} onChange={e => setAgData(p => ({ ...p, hebergement: e.target.value }))} 
                  className="text-green-700 mt-1 w-full bg-white border rounded px-2 py-1 text-sm outline-none" rows={2} placeholder="Informations sur l'hébergement..." />
              ) : (
                <p className="text-green-700 mt-1">{agData.hebergement || 'Informations à venir.'}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AGSpace;