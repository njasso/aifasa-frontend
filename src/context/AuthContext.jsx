import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { getUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        getUser().then((userData) => {
          setUser({ ...userData, id: decoded.id, role: decoded.role });
        }).catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    getUser().then((userData) => {
      setUser({ ...userData, id: decoded.id, role: decoded.role });
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);