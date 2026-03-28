import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPickups.css';

function AdminPickups() {
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [actualWeight, setActualWeight] = useState('');
  const [collectorList, setCollectorList] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    loadPickups();
    loadStats();
    loadCollectors();
  }, [filter]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPickups({ status: filter });
      setPickups(data.pickups || []);
    } catch (error) {
      console.error('Failed to load pickups:', error);
      alert('Failed to load pickups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getPickupStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadCollectors = async () => {
    try {
      // Get all users with role 'collector' or 'admin' who can be assigned
      const data = await api.getAllUsers({ role: 'all' });
      const collectors = (data.users || []).filter(u => u.role === 'admin' || u.role === 'collector');
      setCollectorList(collectors);
    } catch (error) {
      console.error('Failed to load collectors:', error);
    }
  };

  const handleAssign = async (id) => {
    if (!selectedCollector) {
      alert('Please select a collector');
      return;
    }
    
    try {
      await api.assignPickup(id, selectedCollector);
      alert('✅ Pickup assigned successfully! The user will be notified.');
      setShowAssignModal(false);
      setSelectedCollector('');
      loadPickups();
      loadStats();
    } catch (error) {
      alert('❌ Failed to assign: ' + error.message);
    }
  };

  const handleComplete = async (id) => {
    if (!actualWeight || actualWeight <= 0) {
      alert('Please enter valid actual weight');
      return;
    }
    
    try {
      await api.completePickup(id, { actualWeight: parseFloat(actualWeight) });
      alert('✅ Pickup completed! Points awarded to user.');
      setShowCompleteModal(false);
      setActualWeight('');
      loadPickups();
      loadStats();
    } catch (error) {
      alert('❌ Failed to complete: ' + error.message);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      try {
        await api.cancelPickupAdmin(id, reason);
        alert('✅ Pickup cancelled');
        loadPickups();
        loadStats();
      } catch (error) {
        alert('❌ Failed to cancel: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span className="status-badge pending">⏳ Pending</span>;
      case 'assigned': 
        return <span className="status-badge assigned">🚛 Assigned</span>;
      case 'picked_up': 
        return <span className="status-badge picked">📦 Picked Up</span>;
      case 'completed': 
        return <span className="status-badge completed">✅ Completed</span>;
      case 'cancelled': 
        return <span className="status-badge cancelled">❌ Cancelled</span>;
      default: 
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pickup requests...</p>
      </div>
    );
  }

  return (
    <div className="admin-pickups">
      <div className="page-header">
        <h1>Manage Pickup Requests</h1>
        <p>Assign collectors and verify doorstep waste collection</p>
      </div>

      {/* Stats Cards */}
      <div className="pickup-stats-grid">
        <div className="stat-card card">
          <div className="stat-value">{stats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card card pending-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card card assigned-card">
          <div className="stat-value">{stats.assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-card card completed-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Assigned ({stats.assigned})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({stats.completed})
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({stats.cancelled})
        </button>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {/* Pickups List */}
      <div className="pickups-container">
        {pickups.length === 0 ? (
          <div className="no-results card">
            <p>No pickup requests found</p>
          </div>
        ) : (
          pickups.map(pickup => (
            <div key={pickup.id} className="pickup-card card">
              <div className="pickup-card-header">
                <div className="tracking-section">
                  <span className="tracking-label">Tracking Code:</span>
                  <span className="tracking-code">{pickup.trackingCode}</span>
                </div>
                {getStatusBadge(pickup.status)}
              </div>

              <div className="pickup-card-body">
                {/* User Info */}
                <div className="info-section user-info">
                  <h4>👤 User Details</h4>
                  <p><strong>Name:</strong> {pickup.userId?.fullName || 'N/A'}</p>
                  <p><strong>Email:</strong> {pickup.userId?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {pickup.userId?.phone || 'N/A'}</p>
                </div>

                {/* Waste Items */}
                <div className="info-section waste-info">
                  <h4>🗑️ Waste Items</h4>
                  <ul>
                    {pickup.wasteTypes?.map((w, i) => (
                      <li key={i}>
                        <strong>{w.type}:</strong> {w.estimatedWeight} kg
                      </li>
                    ))}
                  </ul>
                  <p className="total-weight">
                    <strong>Total Estimated Weight:</strong> {pickup.totalEstimatedWeight} kg
                  </p>
                </div>

                {/* Address */}
                <div className="info-section address-info">
                  <h4>📍 Pickup Address</h4>
                  <p>{pickup.address?.street}</p>
                  <p>{pickup.address?.city}, {pickup.address?.pincode}</p>
                  {pickup.address?.landmark && <p><strong>Landmark:</strong> {pickup.address.landmark}</p>}
                </div>

                {/* Schedule */}
                <div className="info-section schedule-info">
                  <h4>📅 Schedule</h4>
                  <p><strong>Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                  <p><strong>Time Slot:</strong> {pickup.preferredTimeSlot}</p>
                  {pickup.specialInstructions && (
                    <p><strong>Instructions:</strong> {pickup.specialInstructions}</p>
                  )}
                </div>

                {/* Assigned Collector */}
                {pickup.assignedTo && (
                  <div className="info-section collector-info">
                    <h4>🚛 Assigned Collector</h4>
                    <p><strong>Name:</strong> {pickup.assignedTo?.fullName || 'N/A'}</p>
                  </div>
                )}

                {/* Completed Info */}
                {pickup.status === 'completed' && (
                  <div className="info-section completion-info">
                    <h4>✅ Completion Details</h4>
                    <p><strong>Actual Weight:</strong> {pickup.actualWeight} kg</p>
                    <p><strong>Points Awarded:</strong> +{pickup.pointsEarned} pts</p>
                    <p><strong>Completed on:</strong> {new Date(pickup.completedAt).toLocaleDateString()}</p>
                  </div>
                )}

                {/* Cancelled Info */}
                {pickup.status === 'cancelled' && pickup.cancellationReason && (
                  <div className="info-section cancellation-info">
                    <h4>❌ Cancellation Reason</h4>
                    <p>{pickup.cancellationReason}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pickup-card-actions">
                {pickup.status === 'pending' && (
                  <>
                    <button
                      className="btn-assign"
                      onClick={() => {
                        setSelectedPickup(pickup);
                        setShowAssignModal(true);
                      }}
                    >
                      🚛 Assign Collector
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(pickup.id)}
                    >
                      ❌ Cancel Request
                    </button>
                  </>
                )}
                
                {pickup.status === 'assigned' && (
                  <>
                    <button
                      className="btn-complete"
                      onClick={() => {
                        setSelectedPickup(pickup);
                        setShowCompleteModal(true);
                      }}
                    >
                      ✅ Complete & Award Points
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(pickup.id)}
                    >
                      ❌ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Assign Collector</h3>
            <p>Pickup Request: <strong>{selectedPickup.trackingCode}</strong></p>
            <p>User: <strong>{selectedPickup.userId?.fullName}</strong></p>
            
            <div className="form-group">
              <label>Select Collector</label>
              <select
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
                className="form-input"
              >
                <option value="">-- Select a collector --</option>
                {collectorList.map(collector => (
                  <option key={collector.id} value={collector.id}>
                    {collector.fullName} ({collector.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => handleAssign(selectedPickup.id)}>
                Confirm Assignment
              </button>
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Complete Pickup & Award Points</h3>
            <p>Pickup: <strong>{selectedPickup.trackingCode}</strong></p>
            <p>User: <strong>{selectedPickup.userId?.fullName}</strong></p>
            <p>Estimated Weight: <strong>{selectedPickup.totalEstimatedWeight} kg</strong></p>
            <p>Estimated Points: <strong>{selectedPickup.totalEstimatedPoints} pts</strong></p>
            
            <div className="form-group">
              <label>Actual Weight Collected (kg)</label>
              <input
                type="number"
                step="0.1"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                placeholder="Enter actual weight"
                className="form-input"
                autoFocus
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => handleComplete(selectedPickup.id)}>
                Confirm & Award Points
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPickups;