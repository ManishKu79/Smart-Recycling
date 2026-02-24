// frontend/src/pages/user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './UserDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWeight: 0,
    totalPoints: 0,
    totalCO2: 0,
    treesSaved: 0,
    streak: 0,
    recentActivities: [],
    byType: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getUserStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Chart data
  const wasteTypeData = {
    labels: Object.keys(stats.byType).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats.byType).map(item => item.weight),
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#3b82f6',
          '#ec4899',
          '#14b8a6'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.fullName}! 👋</h1>
          <p className="welcome-message">Here's your recycling impact summary</p>
        </div>
        <Link to="/user/recycle" className="btn btn-primary">
          + New Recycling
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalWeight.toFixed(1)} kg</div>
            <div className="stat-label">Total Recycled</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPoints}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCO2.toFixed(1)} kg</div>
            <div className="stat-label">CO₂ Saved</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon">🌳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.treesSaved}</div>
            <div className="stat-label">Trees Saved</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-section card">
          <h3>Waste Breakdown</h3>
          <div className="chart-container">
            {Object.keys(stats.byType).length > 0 ? (
              <Doughnut data={wasteTypeData} options={chartOptions} />
            ) : (
              <p className="no-data">No recycling data yet</p>
            )}
          </div>
        </div>

        <div className="recent-activities card">
          <div className="section-header">
            <h3>Recent Activities</h3>
            <Link to="/user/history" className="view-all">View All →</Link>
          </div>
          
          <div className="activities-list">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.wasteType === 'plastic' && '♻️'}
                    {activity.wasteType === 'paper' && '📄'}
                    {activity.wasteType === 'metal' && '⚙️'}
                    {activity.wasteType === 'ewaste' && '💻'}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{activity.wasteType}</div>
                    <div className="activity-meta">{activity.weight} kg • {activity.date}</div>
                  </div>
                  <div className="activity-points">+{activity.points}</div>
                </div>
              ))
            ) : (
              <p className="no-activities">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/user/recycle" className="action-card">
            <div className="action-icon">📸</div>
            <div className="action-text">Submit Recycling</div>
          </Link>
          
          <Link to="/user/rewards" className="action-card">
            <div className="action-icon">🎁</div>
            <div className="action-text">Browse Rewards</div>
          </Link>
          
          <Link to="/user/history" className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-text">View History</div>
          </Link>
          
          <Link to="/user/profile" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-text">Edit Profile</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;