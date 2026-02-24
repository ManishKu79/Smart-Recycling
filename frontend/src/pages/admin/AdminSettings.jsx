// frontend/src/pages/admin/AdminSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminSettings.css';

function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and system settings</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button
            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Settings
          </button>
        </div>

        <div className="settings-content card">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <h3>Profile Information</h3>
              
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="form-input"
                  disabled
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <h3>Change Password</h3>
              
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="form-input"
                  required
                />
                <small className="form-hint">Minimum 8 characters with uppercase and number</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Change Password
              </button>
            </form>
          )}

          {activeTab === 'system' && (
            <div>
              <h3>System Settings</h3>
              
              <div className="system-option">
                <h4>Points Configuration</h4>
                <div className="points-config">
                  <div className="config-item">
                    <label>Plastic (per kg)</label>
                    <input type="number" defaultValue="10" className="form-input" />
                  </div>
                  <div className="config-item">
                    <label>Paper (per kg)</label>
                    <input type="number" defaultValue="8" className="form-input" />
                  </div>
                  <div className="config-item">
                    <label>Metal (per kg)</label>
                    <input type="number" defaultValue="25" className="form-input" />
                  </div>
                  <div className="config-item">
                    <label>E-waste (per kg)</label>
                    <input type="number" defaultValue="100" className="form-input" />
                  </div>
                </div>
              </div>

              <div className="system-option">
                <h4>Email Notifications</h4>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Send email notifications for new submissions</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Send email notifications for user registrations</span>
                </label>
              </div>

              <button className="btn btn-primary">Save Settings</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;