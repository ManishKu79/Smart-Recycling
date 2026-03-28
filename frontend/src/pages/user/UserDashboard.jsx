import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import RedeemCode from '../../components/RedeemCode';
import './UserDashboard.css';

function UserDashboard() {
  const { user } = useAuth();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
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
  const [pickupLoading, setPickupLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadPickupRequests();
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

  const loadPickupRequests = async () => {
    try {
      setPickupLoading(true);
      const data = await api.getMyPickupRequests();
      // Ensure we have an array and each pickup has required fields
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

  const handleCodeRedeemed = (data) => {
    loadDashboardData();
    alert(`🎉 You earned ${data.pointsEarned} points!`);
  };

  const handleCancelPickup = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pickup request?')) {
      try {
        await api.cancelPickupRequest(id, 'Cancelled by user');
        alert('✅ Pickup request cancelled');
        loadPickupRequests();
      } catch (error) {
        alert('❌ Failed to cancel: ' + error.message);
      }
    }
  };

  const getPickupStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { class: 'status-pending', text: '⏳ Pending Approval', icon: '🕐' };
      case 'assigned':
        return { class: 'status-assigned', text: '🚛 Assigned to Collector', icon: '🚛' };
      case 'picked_up':
        return { class: 'status-picked', text: '✅ Picked Up', icon: '📦' };
      case 'completed':
        return { class: 'status-completed', text: '🎉 Completed', icon: '🎉' };
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
              // Safe access to address fields with fallbacks
              const address = request.address || {};
              return (
                <div key={request.id || request._id} className={`pickup-item ${request.status || 'pending'}`}>
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
                            <li key={i}>{w.type || 'Unknown'}: {w.estimatedWeight || 0} kg</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No waste items specified</p>
                      )}
                    </div>
                    
                    <div className="pickup-info">
                      <div>
                        <strong>📍 Address:</strong>
                        <p>{address.street || 'Not provided'}, {address.city || ''} {address.pincode ? `- ${address.pincode}` : ''}</p>
                      </div>
                      <div>
                        <strong>📅 Preferred Date:</strong>
                        <p>{request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Not set'}</p>
                      </div>
                      <div>
                        <strong>⏰ Time Slot:</strong>
                        <p>{request.preferredTimeSlot || 'Not specified'}</p>
                      </div>
                      <div>
                        <strong>⚖️ Estimated Weight:</strong>
                        <p>{request.totalEstimatedWeight || 0} kg</p>
                      </div>
                      <div>
                        <strong>⭐ Estimated Points:</strong>
                        <p>{request.totalEstimatedPoints || 0} pts</p>
                      </div>
                    </div>
                    
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
                    
                    {request.status === 'pending' && (
                      <button 
                        className="btn-cancel-pickup"
                        onClick={() => handleCancelPickup(request.id || request._id)}
                      >
                        Cancel Request
                      </button>
                    )}
                    
                    {request.status === 'assigned' && (
                      <div className="assigned-message">
                        🚛 A collector has been assigned to your pickup!
                      </div>
                    )}
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

      {/* Redeem Modal */}
      {showRedeemModal && (
        <RedeemCode
          onSuccess={handleCodeRedeemed}
          onClose={() => setShowRedeemModal(false)}
        />
      )}
    </div>
  );
}

export default UserDashboard;