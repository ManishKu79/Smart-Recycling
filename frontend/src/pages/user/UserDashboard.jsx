// frontend/src/pages/user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SmartBinRedeemModal from '../../components/SmartBinRedeemModal';
import RatePickupModal from '../../components/RatePickupModal';
import RescheduleModal from '../../components/RescheduleModal';
import './UserDashboard.css';

function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWeight: 0,
    totalPoints: 0,
    carbonSaved: 0,
    treesSaved: 0,
    streak: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [pickupStats, setPickupStats] = useState({
    totalRequests: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalPointsEarned: 0,
    totalWeightCollected: 0,
    averageRating: 0
  });
  const [pickupLoading, setPickupLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    loadDashboardData();
    loadPickupRequests();
    loadPickupStats();
  }, []);

  // Auto-refresh every 30 seconds for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadPickupRequests();
      setLastRefresh(Date.now());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await api.getDashboardStats();
      setStats(statsData.stats);
      
      const historyData = await api.getUserRecyclingHistory(1, 5);
      setRecentActivities(historyData.submissions || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPickupStats = async () => {
    try {
      const data = await api.getMyPickupStats();
      setPickupStats(data.stats);
    } catch (error) {
      console.error('Failed to load pickup stats:', error);
    }
  };

  const loadPickupRequests = async () => {
    try {
      setPickupLoading(true);
      const data = await api.getMyPickupRequests();
      const pickups = (data.pickups || []).map(pickup => ({
        ...pickup,
        address: {
          street: pickup.address?.street || 'Address not provided',
          city: pickup.address?.city || 'Not specified',
          pincode: pickup.address?.pincode || '',
          landmark: pickup.address?.landmark || ''
        },
        wasteTypes: pickup.wasteTypes || [],
        totalEstimatedWeight: pickup.totalEstimatedWeight || 0,
        totalEstimatedPoints: pickup.totalEstimatedPoints || 0,
        trackingCode: pickup.trackingCode || 'N/A'
      }));
      setPickupRequests(pickups);
    } catch (error) {
      console.error('Failed to load pickup requests:', error);
      setPickupRequests([]);
    } finally {
      setPickupLoading(false);
    }
  };

  const handleCodeRedeemed = async (data) => {
    await refreshUser();
    loadDashboardData();
  };

  const handleCancelPickup = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pickup request?')) {
      try {
        await api.cancelPickupRequest(id, 'Cancelled by user');
        alert('✅ Pickup request cancelled');
        loadPickupRequests();
        loadPickupStats();
      } catch (error) {
        alert('❌ Failed to cancel: ' + error.message);
      }
    }
  };

  const handleRatePickup = async (id, rating, feedback) => {
    await api.ratePickup(id, rating, feedback);
    alert('✅ Thank you for your feedback!');
    loadPickupRequests();
    loadPickupStats();
  };

  const handleReschedulePickup = async (id, newDate, reason) => {
    await api.reschedulePickupRequest(id, newDate, reason);
    alert('✅ Reschedule request submitted! Admin will review.');
    loadPickupRequests();
  };

  const getPickupStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { class: 'status-pending', text: '⏳ Pending Approval', icon: '🕐' };
      case 'assigned':
        return { class: 'status-assigned', text: '🚛 Assigned to Collector', icon: '🚛' };
      case 'picked_up':
        return { class: 'status-picked', text: '📦 Picked Up', icon: '📦' };
      case 'completed':
        return { class: 'status-completed', text: '✅ Completed', icon: '✅' };
      case 'cancelled':
        return { class: 'status-cancelled', text: '❌ Cancelled', icon: '❌' };
      default:
        return { class: 'status-pending', text: status || 'Pending', icon: '📋' };
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
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.fullName}!</h1>
          <p>Track your recycling impact and rewards</p>
        </div>
        
        <button 
          className="btn-redeem-code"
          onClick={() => setShowRedeemModal(true)}
        >
          🎁 Redeem Smart Bin Code
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon">♻️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalWeight} kg</div>
            <div className="stat-label">Total Recycled</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPoints}</div>
            <div className="stat-label">Points Earned</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon">🌳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.treesSaved}</div>
            <div className="stat-label">Trees Saved</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Pickup Stats Summary */}
      <div className="pickup-stats-summary card">
        <h3>📊 Your Pickup Summary</h3>
        <div className="pickup-stats-grid">
          <div className="pickup-stat">
            <span className="stat-number">{pickupStats.totalRequests}</span>
            <span className="stat-name">Total Requests</span>
          </div>
          <div className="pickup-stat">
            <span className="stat-number">{pickupStats.completed}</span>
            <span className="stat-name">Completed</span>
          </div>
          <div className="pickup-stat">
            <span className="stat-number">{pickupStats.pending}</span>
            <span className="stat-name">Pending</span>
          </div>
          <div className="pickup-stat">
            <span className="stat-number">{pickupStats.totalPointsEarned}</span>
            <span className="stat-name">Points Earned</span>
          </div>
        </div>
      </div>

      {/* Pickup Requests Section */}
      <div className="pickup-requests-section card">
        <div className="section-header">
          <h3>🚛 My Pickup Requests</h3>
          <button 
            className="btn-new-pickup"
            onClick={() => window.location.href = '/user/recycle'}
          >
            + New Pickup Request
          </button>
        </div>
        
        {pickupLoading ? (
          <div className="loading-small">Loading pickup requests...</div>
        ) : pickupRequests.length === 0 ? (
          <div className="no-pickups">
            <p>No pickup requests yet.</p>
            <p className="hint">Click "New Pickup Request" to schedule a doorstep waste collection.</p>
          </div>
        ) : (
          <div className="pickup-list">
            {pickupRequests.map(request => {
              const statusInfo = getPickupStatusBadge(request.status);
              const address = request.address || {};
              const canRate = request.status === 'completed' && !request.rating;
              const canReschedule = request.status === 'pending' || request.status === 'assigned';
              
              return (
                <div key={request.id} className={`pickup-item ${request.status}`}>
                  <div className="pickup-header">
                    <div className="pickup-tracking">
                      <span className="tracking-label">Tracking Code:</span>
                      <span className="tracking-code">{request.trackingCode}</span>
                    </div>
                    <div className={`status-badge ${statusInfo.class}`}>
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                  
                  <div className="pickup-details">
                    <div className="pickup-waste">
                      <strong>Waste Items:</strong>
                      {request.wasteTypes && request.wasteTypes.length > 0 ? (
                        <ul>
                          {request.wasteTypes.map((w, i) => (
                            <li key={i}>{w.type}: {w.estimatedWeight} kg</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No waste items specified</p>
                      )}
                    </div>
                    
                    <div className="pickup-info">
                      <div>
                        <strong>📍 Address:</strong>
                        <p>{address.street}, {address.city} {address.pincode}</p>
                      </div>
                      <div>
                        <strong>📅 Preferred Date:</strong>
                        <p>{new Date(request.preferredDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <strong>⏰ Time Slot:</strong>
                        <p>{request.preferredTimeSlot}</p>
                      </div>
                      <div>
                        <strong>⚖️ Estimated Weight:</strong>
                        <p>{request.totalEstimatedWeight} kg</p>
                      </div>
                      <div>
                        <strong>⭐ Estimated Points:</strong>
                        <p>{request.totalEstimatedPoints} pts</p>
                      </div>
                    </div>
                    
                    {/* NEW: Collector Info (when assigned) */}
                    {request.status === 'assigned' && request.collectorName && (
                      <div className="collector-info">
                        <div className="collector-details">
                          <strong>🚛 Collector Assigned:</strong>
                          <p>👤 {request.collectorName}</p>
                          <p>📞 {request.collectorPhone}</p>
                          {request.estimatedArrivalTime && (
                            <p>⏱️ Estimated Arrival: {new Date(request.estimatedArrivalTime).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Actual weight and points after completion */}
                    {request.actualWeight > 0 && (
                      <div className="actual-weight">
                        <strong>✅ Actual Weight Collected:</strong>
                        <span>{request.actualWeight} kg</span>
                      </div>
                    )}
                    
                    {request.pointsEarned > 0 && (
                      <div className="points-earned">
                        <strong>🎉 Points Awarded:</strong>
                        <span>+{request.pointsEarned} pts</span>
                      </div>
                    )}
                    
                    {/* Rating Display (if already rated) */}
                    {request.rating && (
                      <div className="rating-display">
                        <strong>⭐ Your Rating:</strong>
                        <div className="stars">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className={star <= request.rating ? 'star-filled' : 'star-empty'}>★</span>
                          ))}
                        </div>
                        {request.feedback && <p className="feedback-text">"{request.feedback}"</p>}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="pickup-actions">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            className="btn-reschedule"
                            onClick={() => {
                              setSelectedPickup(request);
                              setShowRescheduleModal(true);
                            }}
                          >
                            📅 Reschedule
                          </button>
                          <button 
                            className="btn-cancel-pickup"
                            onClick={() => handleCancelPickup(request.id)}
                          >
                            Cancel Request
                          </button>
                        </>
                      )}
                      
                      {request.status === 'assigned' && (
                        <>
                          <button 
                            className="btn-reschedule"
                            onClick={() => {
                              setSelectedPickup(request);
                              setShowRescheduleModal(true);
                            }}
                          >
                            📅 Reschedule
                          </button>
                          <div className="assigned-message">
                            🚛 A collector has been assigned! They will contact you shortly.
                          </div>
                        </>
                      )}
                      
                      {canRate && (
                        <button 
                          className="btn-rate"
                          onClick={() => {
                            setSelectedPickup(request);
                            setShowRateModal(true);
                          }}
                        >
                          ⭐ Rate Experience
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activities Section */}
      <div className="recent-activities card">
        <div className="section-header">
          <h3>Recent Activities</h3>
          <a href="/user/history" className="view-all">View All →</a>
        </div>
        {recentActivities.length === 0 ? (
          <p className="no-activities">No activities yet. Start recycling!</p>
        ) : (
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.wasteType === 'plastic' && '♻️'}
                  {activity.wasteType === 'paper' && '📄'}
                  {activity.wasteType === 'metal' && '⚙️'}
                  {activity.wasteType === 'ewaste' && '💻'}
                  {activity.wasteType === 'glass' && '🍶'}
                  {activity.wasteType === 'batteries' && '🔋'}
                  {activity.wasteType === 'textiles' && '👕'}
                </div>
                <div className="activity-details">
                  <div className="activity-title">
                    Recycled {activity.weight} kg of {activity.wasteType}
                  </div>
                  <div className="activity-date">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="activity-points">+{activity.pointsEarned} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRedeemModal && (
        <SmartBinRedeemModal
          onClose={() => setShowRedeemModal(false)}
          onSuccess={handleCodeRedeemed}
        />
      )}
      
      {showRateModal && selectedPickup && (
        <RatePickupModal
          pickup={selectedPickup}
          onClose={() => setShowRateModal(false)}
          onSubmit={handleRatePickup}
        />
      )}
      
      {showRescheduleModal && selectedPickup && (
        <RescheduleModal
          pickup={selectedPickup}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={handleReschedulePickup}
        />
      )}
    </div>
  );
}

export default UserDashboard;