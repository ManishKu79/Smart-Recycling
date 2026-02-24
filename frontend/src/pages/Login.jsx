// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      setServerError('');
      
      try {
        const response = await login(formData.email, formData.password);
        
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
        
      } catch (error) {
        setServerError(error.message || 'Invalid email or password');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <h2>Welcome Back! ♻️</h2>
            <p>Sign in to your SmartRecycle account</p>
          </div>
          
          {serverError && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{serverError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
            
            <div className="form-group">
              <div className="form-label-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="login-info card">
          <h3>🌱 Why Join SmartRecycle?</h3>
          <ul className="benefits-list">
            <li>Earn points for every kg recycled</li>
            <li>Track your environmental impact</li>
            <li>Redeem eco-friendly rewards</li>
            <li>Join community challenges</li>
          </ul>
          
          <div className="info-stats">
            <div className="info-stat">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="info-stat">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Trees Saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;