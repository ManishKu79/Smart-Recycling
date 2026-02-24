// frontend/src/pages/user/UserProfile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './UserProfile.css';

function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit number';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const response = await api.updateProfile(formData);
        updateUser(response.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      pincode: user?.pincode || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="user-profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar card">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <h2>{user?.fullName}</h2>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{user?.points}</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user?.totalRecycled || 0}kg</span>
              <span className="stat-label">Recycled</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user?.streak || 0}</span>
              <span className="stat-label">Streak</span>
            </div>
          </div>
          <p className="member-since">
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="profile-form card">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {!isEditing ? (
            <div className="profile-view">
              <div className="info-group">
                <label>Full Name</label>
                <p>{user?.fullName}</p>
              </div>
              
              <div className="info-group">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              
              <div className="info-group">
                <label>Phone</label>
                <p>{user?.phone || 'Not provided'}</p>
              </div>
              
              <div className="info-group">
                <label>Address</label>
                <p>{user?.address || 'Not provided'}</p>
              </div>
              
              <div className="info-row">
                <div className="info-group">
                  <label>City</label>
                  <p>{user?.city || 'Not provided'}</p>
                </div>
                
                <div className="info-group">
                  <label>Pincode</label>
                  <p>{user?.pincode || 'Not provided'}</p>
                </div>
              </div>
              
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Street address"
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
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;