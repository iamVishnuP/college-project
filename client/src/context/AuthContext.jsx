import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // restoring session

  // Restore session from token on mount
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('cr_token');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('cr_token');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cr_token', data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const register = async (email, password, characterName) => {
    const { data } = await api.post('/auth/register', { email, password, characterName });
    localStorage.setItem('cr_token', data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('cr_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthModalOpen, setIsAuthModalOpen, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
