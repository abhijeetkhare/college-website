import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error("Auth bootstrap failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const res = await api.post('/api/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, refresh_token, role, email: uEmail, full_name } = res.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setToken(access_token);
      
      const profileRes = await api.get('/api/auth/profile');
      setUser(profileRes.data);
      setLoading(false);
      return profileRes.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (email, fullName, password) => {
    try {
      const res = await api.post('/api/auth/register', {
        email,
        full_name: fullName,
        password
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  // Helper check for role permissions
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role_name === 'Super Admin') return true;
    
    // Custom logic to map client roles to permission categories
    if (permission === 'journals') {
      return ['Super Admin', 'Content Admin', 'Moderator'].includes(user.role_name);
    }
    if (permission === 'events') {
      return ['Super Admin', 'Content Admin'].includes(user.role_name);
    }
    if (permission === 'gallery') {
      return ['Super Admin', 'Gallery Admin'].includes(user.role_name);
    }
    if (permission === 'logs' || permission === 'users') {
      return user.role_name === 'Super Admin';
    }
    return false;
  };

  const isAdmin = () => {
    return user && ['Super Admin', 'Content Admin', 'Gallery Admin', 'Moderator'].includes(user.role_name);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasPermission, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
