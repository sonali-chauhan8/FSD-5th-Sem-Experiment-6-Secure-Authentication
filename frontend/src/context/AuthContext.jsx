import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load (validates HttpOnly cookie)
  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // 401 means not authenticated, which is expected on fresh visits
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Register function
  const register = async (name, email, password, confirmPassword) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  };

  // Login function
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
