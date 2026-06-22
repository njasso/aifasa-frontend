// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import jwtDecode from 'jwt-decode';
import { getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp < currentTime) {
            console.warn('⚠️ Token expiré');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
          }

          const userData = await getCurrentUser();
          setUser({
            ...userData,
            id: decoded.id,
            email: decoded.email || userData.email,
            role: decoded.role || userData.role || 'member'
          });
          setToken(storedToken);
        } catch (error) {
          console.error('❌ Erreur auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, userData) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser({
        id: decoded.id || userData?.id,
        email: decoded.email || userData?.email,
        role: decoded.role || userData?.role || 'member',
        ...userData
      });
      setToken(token);
      localStorage.setItem('user', JSON.stringify({
        id: decoded.id || userData?.id,
        email: decoded.email || userData?.email,
        role: decoded.role || userData?.role || 'member',
        ...userData
      }));
      return true;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = () => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp && decoded.exp > currentTime;
    } catch {
      return false;
    }
  };

  const isAdmin = () => user?.role === 'admin';

  const getUserRole = () => user?.role || 'member';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    getUserRole,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;