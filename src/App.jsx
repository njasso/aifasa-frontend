// src/App.jsx - COMPLET
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages publiques
import Home from './pages/public/Home';
import About from './pages/public/About';
import WhyJoin from './pages/public/WhyJoin';
import Publications from './pages/public/Publications';
import Events from './pages/public/Events';
import AGSpace from './pages/public/AGSpace';
import Jobs from './pages/public/Jobs';
// ✅ Déplacées depuis pages/private : ces pages sont volontairement
// accessibles sans connexion (lecture publique côté API), seules les
// actions d'écriture (ajout/suppression) restent protégées côté backend.
import Documents from './pages/public/Documents';
import Gallery from './pages/public/Gallery';
import Enterprises from './pages/public/Enterprises';

// Pages privées (nécessitent une connexion)
import Login from './pages/auth/Login';
import Dashboard from './pages/private/Dashboard';
import Profile from './pages/private/Profile';
import AdminDashboard from './pages/private/AdminDashboard';
import AdminUsers from './pages/private/AdminUsers';
import Members from './pages/private/Members';
import Treasury from './pages/private/Treasury';
import Projects from './pages/private/Projects';
import Forum from './pages/private/Forum';

// ========== FOOTER LÉGER (Pages publiques) ==========
const PublicFooter = () => (
  <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
    <div className="container mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-10 w-10 object-contain rounded-full bg-white/5 p-1 border border-gray-800"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <span className="text-lg font-bold text-white">AIFASA 17</span>
          </div>
          <p className="text-xs max-w-xs mx-auto md:mx-0 text-gray-500">
            Association des Ingénieurs Agronomes et Forestiers de la FASA Promo 17 du Cameroun.
          </p>
        </div>

        <div className="text-center space-y-2">
          <h4 className="text-xs font-bold uppercase text-white">Navigation</h4>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Accueil</Link>
            <Link to="/about" className="hover:text-emerald-400 transition-colors">À Propos</Link>
            <Link to="/why-join" className="hover:text-emerald-400 transition-colors">Adhérer</Link>
            <Link to="/publications" className="hover:text-emerald-400 transition-colors">Publications</Link>
            <Link to="/events" className="hover:text-emerald-400 transition-colors">Événements</Link>
            <Link to="/jobs" className="hover:text-emerald-400 transition-colors">Emplois</Link>
          </div>
        </div>

        <div className="text-center md:text-right space-y-2">
          <h4 className="text-xs font-bold uppercase text-white">Contact</h4>
          <div className="text-xs space-y-1">
            <a href="mailto:association@aifasa17.org" className="hover:text-white transition-colors block">association@aifasa17.org</a>
            <a href="tel:+237620370286" className="hover:text-white transition-colors block">+237 620 370 286</a>
            <p className="text-gray-600 mt-1">Yaoundé, Cameroun</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800/50 pt-4 text-center text-[10px] text-gray-600 space-y-1">
        <p>&copy; {new Date().getFullYear()} AIFASA 17. Tous droits réservés. NIU: M021916273206S</p>
        <p>Propulsé par <span className="text-gray-500 font-semibold">NA2</span> - Nouvelle Académie Numérique Africaine</p>
      </div>
    </div>
  </footer>
);

// ========== LAYOUT PRINCIPAL ==========
const AppLayout = () => {
  const location = useLocation();
  
  // Pages publiques où le footer est affiché
  const pagesAvecFooter = ['/about', '/why-join', '/publications', '/events', '/jobs', '/gallery', '/enterprises', '/documents', '/ag'];
  const showFooter = pagesAvecFooter.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* ======== ROUTES PUBLIQUES ======== */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-join" element={<WhyJoin />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/events" element={<Events />} />
          <Route path="/ag" element={<AGSpace />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/enterprises" element={<Enterprises />} />
          <Route path="/login" element={<Login />} />

          {/* ======== ROUTES PRIVÉES ======== */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/treasury" element={<ProtectedRoute><Treasury /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Footer UNIQUEMENT sur les pages publiques pertinentes */}
      {showFooter && <PublicFooter />}
    </div>
  );
};

// ========== APP ==========
const App = () => (
  <AuthProvider>
    <Router>
      <AppLayout />
    </Router>
  </AuthProvider>
);

export default App;