// frontend/src/pages/collector/CollectorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './CollectorDashboard.css';

function CollectorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedCount: 0,
    pickedUpCount: 0,
    completedCount: 0,
    totalWeightCollected: 0,
    todayPickups: 0
  });
  const [assignedPickups, setAssignedPickups] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    loadDashboard();
    loadPickups();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getCollectorDashboard();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadPickups = async () => {
    try {
      const data = await api.getCollectorPickups();
      setAssignedPickups(data.pickups || []);
    } catch (error) {
      console.error('Failed to load pickups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pickup, status) => {
    setSelectedPickup(pickup);
    setActionType(status);
    setShowNotesModal(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      await api.updatePickupStatus(selectedPickup.id, actionType, notes);
      alert(`✅ Pickup marked as ${actionType.replace('_', ' ')}`);
      setShowNotesModal(false);
      setNotes('');
      loadDashboard();
      loadPickups();
    } catch (error) {
      alert('❌ Failed to update status: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'assigned': return <span className="badge assigned">🚛 Assigned</span>;
      case 'picked_up': return <span className="badge picked">📦 Picked Up</span>;
      default: return <span className="badge">{status}</span>;
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
    <div className="collector-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.fullName}!</h1>
        <p>Manage your assigned pickups</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚛</div>
          <div className="stat-value">{stats.assignedCount}</div>
          <div className="stat-label">Assigned Pickups</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.pickedUpCount}</div>
          <div className="stat-label">Picked Up</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-value">{stats.totalWeightCollected} kg</div>
          <div className="stat-label">Total Collected</div>
        </div>
      </div>

      <div className="pickups-section">
        <h2>My Assigned Pickups</h2>
        
        {assignedPickups.length === 0 ? (
          <div className="no-pickups">
            <p>No pickups assigned to you yet.</p>
          </div>
        ) : (
          <div className="pickups-list">
            {assignedPickups.map(pickup => (
              <div key={pickup.id} className="pickup-card">
                <div className="pickup-header">
                  <div className="tracking-code">
                    <span>Tracking Code:</span>
                    <strong>{pickup.trackingCode}</strong>
                  </div>
                  {getStatusBadge(pickup.status)}
                </div>
                
                <div className="pickup-body">
                  <div className="customer-info">
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {pickup.userId?.fullName}</p>
                    <p><strong>Phone:</strong> {pickup.userId?.phone || 'Not provided'}</p>
                    <p><strong>Address:</strong> {pickup.address?.street}, {pickup.address?.city}, {pickup.address?.pincode}</p>
                  </div>
                  
                  <div className="waste-info">
                    <h4>Waste Details</h4>
                    <ul>
                      {pickup.wasteTypes?.map((w, i) => (
                        <li key={i}>{w.type}: {w.estimatedWeight} kg</li>
                      ))}
                    </ul>
                    <p><strong>Total Weight:</strong> {pickup.totalEstimatedWeight} kg</p>
                    <p><strong>Estimated Points:</strong> {pickup.totalEstimatedPoints} pts</p>
                  </div>
                  
                  <div className="schedule-info">
                    <h4>Schedule</h4>
                    <p><strong>Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                    <p><strong>Time Slot:</strong> {pickup.preferredTimeSlot}</p>
                    {pickup.specialInstructions && <p><strong>Instructions:</strong> {pickup.specialInstructions}</p>}
                  </div>
                </div>
                
                <div className="pickup-actions">
                  {pickup.status === 'assigned' && (
                    <button className="btn-pickup" onClick={() => handleStatusUpdate(pickup, 'picked_up')}>
                      📦 Mark as Picked Up
                    </button>
                  )}
                  {pickup.status === 'picked_up' && (
                    <button className="btn-complete" onClick={() => handleStatusUpdate(pickup, 'completed')}>
                      ✅ Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNotesModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{actionType === 'picked_up' ? 'Mark as Picked Up' : 'Mark as Completed'}</h3>
            <p><strong>Pickup:</strong> {selectedPickup.trackingCode}</p>
            <p><strong>Customer:</strong> {selectedPickup.userId?.fullName}</p>
            
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Any notes about this pickup..." />
            </div>
            
            <div className="modal-actions">
              <button className="btn-primary" onClick={confirmStatusUpdate}>Confirm</button>
              <button className="btn-secondary" onClick={() => setShowNotesModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectorDashboard;