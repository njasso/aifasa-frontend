import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Documents from './pages/Documents';
import Members from './pages/Members';
import Treasury from './pages/Treasury';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Enterprises from './pages/Enterprises'; // Import du nouveau composant

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/members" element={<Members />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/enterprises" element={<Enterprises />} /> {/* Ajout de la nouvelle route */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
