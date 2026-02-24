// frontend/src/pages/user/RecyclingHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './RecyclingHistory.css';

function RecyclingHistory() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    totalWeight: 0,
    totalPoints: 0,
    totalCO2: 0
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await api.getUserRecyclingHistory();
      setSubmissions(historyData.submissions);
      
      const statsData = await api.getUserStats();
      setStats(statsData.stats);
      
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="recycling-history">
      <div className="page-header">
        <h1>Recycling History</h1>
        <p>Track all your recycling activities</p>
      </div>

      <div className="history-stats">
        <div className="stat-card card">
          <div className="stat-label">Total Recycled</div>
          <div className="stat-value">{stats.totalWeight.toFixed(1)} kg</div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">Total Points</div>
          <div className="stat-value">{stats.totalPoints}</div>
        </div>
        <div className="stat-card card">
          <div className="stat-label">CO₂ Saved</div>
          <div className="stat-value">{stats.totalCO2.toFixed(1)} kg</div>
        </div>
      </div>

      <div className="history-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      <div className="history-list">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map(submission => (
            <div key={submission.id} className="history-item card">
              <div className="history-item-header">
                <div className="history-item-type">
                  <span className="waste-icon">
                    {submission.wasteType === 'plastic' && '♻️'}
                    {submission.wasteType === 'paper' && '📄'}
                    {submission.wasteType === 'metal' && '⚙️'}
                    {submission.wasteType === 'ewaste' && '💻'}
                    {submission.wasteType === 'glass' && '🍶'}
                    {submission.wasteType === 'batteries' && '🔋'}
                    {submission.wasteType === 'textiles' && '👕'}
                  </span>
                  <span className="waste-type">{submission.wasteType}</span>
                </div>
                <span className={`status-badge ${getStatusClass(submission.status)}`}>
                  {submission.status}
                </span>
              </div>

              <div className="history-item-details">
                <div className="detail">
                  <span className="detail-label">Weight:</span>
                  <span className="detail-value">{submission.weight} kg</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Points:</span>
                  <span className="detail-value">+{submission.pointsEarned}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(submission.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {submission.location && (
                <div className="history-item-location">
                  📍 {submission.location}
                </div>
              )}

              {submission.status === 'rejected' && submission.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Reason:</strong> {submission.rejectionReason}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-history">
            <p>No recycling history found</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/user/recycle'}
            >
              Start Recycling
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecyclingHistory;