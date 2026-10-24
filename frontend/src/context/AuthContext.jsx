import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const demo = urlParams ? urlParams.get('demo') : null;
    if (demo === 'admin') {
      return { _id: 'usr_admin_001', name: 'Campus Facilities Admin', email: 'admin@campus.edu', role: 'admin' };
    }
    if (demo === 'student') {
      return { _id: 'usr_student_001', name: 'Alex Johnson', email: 'student@campus.edu', role: 'student' };
    }
    const savedUser = localStorage.getItem('fixtrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (urlParams && urlParams.get('demo')) return 'mock_demo_token';
    return localStorage.getItem('fixtrack_token');
  });

  const [loading, setLoading] = useState(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (urlParams && urlParams.get('demo')) return false;
    return true;
  });

  useEffect(() => {
    const verifyUser = async () => {
      // Check for quick demo query param (e.g. ?demo=admin or ?demo=student)
      const urlParams = new URLSearchParams(window.location.search);
      const demoRole = urlParams.get('demo');

      if (demoRole === 'admin') {
        try {
          const res = await api.post('/auth/login', { email: 'admin@campus.edu', password: 'admin123' });
          if (res.data.success) {
            setUser(res.data.data);
            setToken(res.data.data.token);
            localStorage.setItem('fixtrack_token', res.data.data.token);
            localStorage.setItem('fixtrack_user', JSON.stringify(res.data.data));
            setLoading(false);
            return;
          }
        } catch (e) {}
      } else if (demoRole === 'student') {
        try {
          const res = await api.post('/auth/login', { email: 'student@campus.edu', password: 'student123' });
          if (res.data.success) {
            setUser(res.data.data);
            setToken(res.data.data.token);
            localStorage.setItem('fixtrack_token', res.data.data.token);
            localStorage.setItem('fixtrack_user', JSON.stringify(res.data.data));
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      const storedToken = localStorage.getItem('fixtrack_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('fixtrack_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('fixtrack_token', userData.token);
      localStorage.setItem('fixtrack_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const data = res.data.data;
      setUser(data);
      setToken(data.token);
      localStorage.setItem('fixtrack_token', data.token);
      localStorage.setItem('fixtrack_user', JSON.stringify(data));
      return data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixtrack_token');
    localStorage.removeItem('fixtrack_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
