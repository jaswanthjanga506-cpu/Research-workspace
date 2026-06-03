import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('nexus_access_token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
      } catch {
        localStorage.removeItem('nexus_access_token');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();

    const handleGlobalLogout = () => {
      setUser(null);
      localStorage.removeItem('nexus_access_token');
    };
    window.addEventListener('logout', handleGlobalLogout);
    return () => window.removeEventListener('logout', handleGlobalLogout);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data.data;
    localStorage.setItem('nexus_access_token', access_token);
    setUser(userData);
    return userData;
  };

  // role param added — passed through to backend
  const register = async (username, email, password, role = 'user') => {
    const res = await api.post('/auth/register', { username, email, password, role });
    return res.data;
  };

  const logout = async () => {
    try { await api.delete('/auth/logout'); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('nexus_access_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};