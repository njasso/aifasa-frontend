// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages publiques
import Home from './pages/public/Home';
import About from './pages/public/About';
import WhyJoin from './pages/public/WhyJoin';
import Publications from './pages/public/Publications';
import Documents from './pages/private/Documents';
import Gallery from './pages/private/Gallery';
import Enterprises from './pages/private/Enterprises';

// Pages privées
import Login from './pages/auth/Login';
import Dashboard from './pages/private/Dashboard';
import Profile from './pages/private/Profile';
import AdminDashboard from './pages/private/AdminDashboard';
import AdminUsers from './pages/private/AdminUsers';
import Members from './pages/private/Members';
import Treasury from './pages/private/Treasury';
import Projects from './pages/private/Projects';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* ======== ROUTES PUBLIQUES ======== */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/why-join" element={<WhyJoin />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/enterprises" element={<Enterprises />} />
          <Route path="/login" element={<Login />} />

          {/* ======== ROUTES PRIVÉES ======== */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/members" 
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/treasury" 
            element={
              <ProtectedRoute>
                <Treasury />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } 
          />

          {/* Redirection 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;