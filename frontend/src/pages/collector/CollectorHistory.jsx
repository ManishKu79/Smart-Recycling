// frontend/src/pages/collector/CollectorHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CollectorHistory.css';

function CollectorHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [stats, setStats] = useState({
    totalPickups: 0,
    totalWeight: 0,
    averageRating: 0,
    totalPointsAwarded: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getCollectorHistory();
      console.log('History data:', data);
      
      setPickups(data.pickups || []);
      setStats({
        totalPickups: data.stats?.totalPickups || 0,
        totalWeight: data.stats?.totalWeight || 0,
        averageRating: data.stats?.averageRating || 0,
        totalPointsAwarded: data.stats?.totalPointsAwarded || 0
      });
    } catch (error) {
      console.error('Failed to load history:', error);
      alert('Failed to load history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPickups = () => {
    let filtered = [...pickups];
    
    if (searchTerm) {
      filtered = filtered.filter(pickup => 
        pickup.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pickup.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      filtered = filtered.filter(pickup => {
        const completedDate = new Date(pickup.completedAt);
        if (filter === 'today') return completedDate >= today;
        if (filter === 'week') return completedDate >= weekAgo;
        if (filter === 'month') return completedDate >= monthAgo;
        return true;
      });
    }
    
    return filtered;
  };

  const getRatingStars = (rating) => {
    if (!rating || rating === 0) return 'Not rated';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  const filteredPickups = getFilteredPickups();
  const totalFilteredWeight = filteredPickups.reduce((sum, p) => sum + (p.actualWeight || 0), 0);
  const totalFilteredPoints = filteredPickups.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);

  return (
    <div className="collector-history">
      <div className="page-header">
        <h1>My Collection History</h1>
        <p>View all your completed pickups and performance stats</p>
      </div>

      <div className="history-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.totalPickups}</div>
          <div className="stat-label">Total Pickups</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-value">{stats.totalWeight} kg</div>
          <div className="stat-label">Total Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.averageRating || 0}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats.totalPointsAwarded}</div>
          <div className="stat-label">Points Awarded</div>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Time</button>
          <button className={`filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Today</button>
          <button className={`filter-btn ${filter === 'week' ? 'active' : ''}`} onClick={() => setFilter('week')}>Last 7 Days</button>
          <button className={`filter-btn ${filter === 'month' ? 'active' : ''}`} onClick={() => setFilter('month')}>Last 30 Days</button>
        </div>
        <div className="search-box">
          <input type="text" placeholder="Search by tracking code, customer, or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {filter !== 'all' && filteredPickups.length > 0 && (
        <div className="filter-summary">
          <span>📊 Showing <strong>{filteredPickups.length}</strong> pickups</span>
          <span>⚖️ Total Weight: <strong>{totalFilteredWeight.toFixed(1)} kg</strong></span>
          <span>⭐ Total Points: <strong>{totalFilteredPoints}</strong></span>
        </div>
      )}

      {filteredPickups.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">📭</div>
          <h3>No completed pickups yet</h3>
          <p>Once you complete pickups, they will appear here.</p>
        </div>
      ) : (
        <div className="pickups-list">
          {filteredPickups.map(pickup => (
            <div key={pickup.id} className="history-pickup-card">
              <div className="pickup-header">
                <div className="tracking-code">
                  <span className="label">Tracking Code:</span>
                  <span className="code">{pickup.trackingCode}</span>
                </div>
                <div className="completed-date">📅 {new Date(pickup.completedAt).toLocaleDateString()}</div>
              </div>
              
              <div className="pickup-body">
                <div className="customer-info">
                  <h4>👤 Customer</h4>
                  <p><strong>Name:</strong> {pickup.userId?.fullName}</p>
                  <p><strong>Email:</strong> {pickup.userId?.email}</p>
                  <p><strong>Phone:</strong> {pickup.userId?.phone || 'N/A'}</p>
                </div>
                
                <div className="address-info">
                  <h4>📍 Address</h4>
                  <p>{pickup.address?.street}</p>
                  <p>{pickup.address?.city}, {pickup.address?.pincode}</p>
                  {pickup.address?.landmark && <p><strong>Landmark:</strong> {pickup.address.landmark}</p>}
                </div>
                
                <div className="waste-info">
                  <h4>🗑️ Waste Details</h4>
                  <ul>
                    {pickup.wasteTypes?.map((w, i) => (
                      <li key={i}>{w.type}: {w.estimatedWeight} kg</li>
                    ))}
                  </ul>
                </div>
                
                <div className="completion-info">
                  <h4>✅ Completion Details</h4>
                  <div className="completion-row">
                    <span>Actual Weight:</span>
                    <strong>{pickup.actualWeight || 0} kg</strong>
                  </div>
                  <div className="completion-row">
                    <span>Points Awarded:</span>
                    <strong className="points">+{pickup.pointsEarned || 0} pts</strong>
                  </div>
                  <div className="completion-row">
                    <span>User Rating:</span>
                    <div className="rating-stars">
                      <span className="stars">{getRatingStars(pickup.rating)}</span>
                      {pickup.rating && pickup.rating > 0 && <span className="rating-value">({pickup.rating}/5)</span>}
                    </div>
                  </div>
                  {pickup.feedback && (
                    <div className="user-feedback">
                      <span>💬 Feedback:</span>
                      <p>"{pickup.feedback}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectorHistory;