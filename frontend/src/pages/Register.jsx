// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Must contain one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Must contain one number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/[^\d]/g, '');
      if (phoneDigits.length !== 10) {
        newErrors.phone = 'Enter a valid 10-digit number';
      }
    }
    
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service';
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
        const userData = {
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          pincode: formData.pincode || undefined
        };
        
        await register(userData);
        navigate('/user/dashboard');
        
      } catch (error) {
        setServerError(error.message || 'Registration failed');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card card">
          <div className="register-header">
            <h2>Create Account 🌱</h2>
            <p>Join SmartRecycle and start earning rewards</p>
          </div>
          
          {serverError && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{serverError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <h3 className="form-section-title">Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="10-digit mobile number"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>
            </div>
            
            <h3 className="form-section-title">Address (Optional)</h3>
            
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="House no., Street, Area"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Your city"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="pincode" className="form-label">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="6-digit pincode"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <h3 className="form-section-title">Security</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create password"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
                <div className="password-hint">
                  Min 8 chars, 1 uppercase, 1 number
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter password"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
            
            <div className="form-group terms-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="terms-link" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="terms-link" target="_blank">
                    Privacy Policy
                  </Link>
                  <span className="required">*</span>
                </span>
              </label>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary register-btn"
              disabled={isSubmitting || !agreeTerms}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <div className="register-benefits card">
          <h3>🎁 Welcome Benefits</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <div className="benefit-content">
                <h4>100 Welcome Points</h4>
                <p>Get 100 points instantly</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📊</span>
              <div className="benefit-content">
                <h4>Track Impact</h4>
                <p>Monitor your recycling</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <div className="benefit-content">
                <h4>Redeem Rewards</h4>
                <p>Exchange points for gifts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;