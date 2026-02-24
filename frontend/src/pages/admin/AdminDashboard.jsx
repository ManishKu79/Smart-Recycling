// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    totalPoints: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsData = await api.getAdminStats();
      setStats(statsData.stats);
      
      const submissionsData = await api.getAllSubmissions({ limit: 5 });
      setRecentSubmissions(submissionsData.submissions);
      
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage recycling submissions and users</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSubmissions}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingSubmissions}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPoints}</div>
            <div className="stat-label">Points Given</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-submissions card">
          <div className="section-header">
            <h3>Recent Submissions</h3>
            <Link to="/admin/submissions" className="view-all">View All →</Link>
          </div>
          
          <div className="submissions-list">
            {recentSubmissions.map(sub => (
              <div key={sub.id} className="submission-item">
                <div className="submission-user">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{sub.user?.fullName}</span>
                </div>
                <div className="submission-details">
                  <span className="waste-type">{sub.wasteType}</span>
                  <span className="submission-weight">{sub.weight} kg</span>
                </div>
                <span className={`status-badge status-${sub.status}`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions card">
          <h3>Quick Actions</h3>
          <div className="actions-list">
            <Link to="/admin/submissions" className="action-item">
              <span className="action-icon">📋</span>
              <span>Review Pending Submissions</span>
              <span className="action-badge">{stats.pendingSubmissions}</span>
            </Link>
            
            <Link to="/admin/users" className="action-item">
              <span className="action-icon">👥</span>
              <span>Manage Users</span>
            </Link>
            
            <Link to="/admin/rewards" className="action-item">
              <span className="action-icon">🎁</span>
              <span>Manage Rewards</span>
            </Link>
            
            <Link to="/admin/settings" className="action-item">
              <span className="action-icon">⚙️</span>
              <span>System Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;