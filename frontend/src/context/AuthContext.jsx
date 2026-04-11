// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.login(email, password);
      setUser(response.user);
      toast.success(`Welcome back, ${response.user.fullName}!`);
      return response;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.register(userData);
      setUser(response.user);
      toast.success('Registration successful! Welcome to SmartRecycle!');
      return response;
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ✅ refreshUser - Fetches latest user data from server (for navbar update)
  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  // ✅ refreshUserPoints - Alias for refreshUser (for clarity)
  const refreshUserPoints = async () => {
    return await refreshUser();
  };

  // ✅ addUserPoints - Add points locally for immediate UI update
  const addUserPoints = (pointsToAdd) => {
    if (user) {
      const newPoints = (user.points || 0) + pointsToAdd;
      const updatedUser = { ...user, points: newPoints };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,        // ✅ EXPOSED - For navbar and components
    refreshUserPoints,  // ✅ EXPOSED - Alias
    addUserPoints,      // ✅ EXPOSED
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};