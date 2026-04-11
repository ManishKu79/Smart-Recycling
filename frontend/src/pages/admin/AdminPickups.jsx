// frontend/src/pages/admin/AdminPickups.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPickups.css';

function AdminPickups() {
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actualWeight, setActualWeight] = useState('');
  const [collectorList, setCollectorList] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    assigned: 0,
    pickedUp: 0,
    completed: 0,
    cancelled: 0,
    totalPointsAwarded: 0,
    totalWeightCollected: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadPickups();
    loadStats();
    loadCollectors();
  }, [filter]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      console.log('Loading pickups with filter:', filter);
      const data = await api.getAdminPickups({ status: filter, search: searchTerm });
      console.log('API Response pickups:', data.pickups);
      console.log('Number of pickups:', data.pickups?.length);
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
      console.log('Stats:', data.stats);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadCollectors = async () => {
    try {
      const data = await api.getCollectors();
      let collectors = [];
      if (data.collectors && Array.isArray(data.collectors)) {
        collectors = data.collectors;
      }
      const processedCollectors = collectors.map(collector => ({
        id: collector._id || collector.id,
        fullName: collector.fullName,
        email: collector.email,
        phone: collector.phone || ''
      })).filter(c => c.id);
      setCollectorList(processedCollectors);
    } catch (error) {
      console.error('Failed to load collectors:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedCollector) {
      alert('⚠️ Please select a collector');
      return;
    }
    
    try {
      await api.assignPickup(selectedPickup.id, selectedCollector, estimatedArrival || null, adminNotes);
      alert('✅ Pickup assigned successfully!');
      setShowAssignModal(false);
      setSelectedCollector('');
      setEstimatedArrival('');
      setAdminNotes('');
      loadPickups();
      loadStats();
    } catch (error) {
      alert('❌ Failed to assign: ' + error.message);
    }
  };

  const handleMarkAsPickedUp = async () => {
    try {
      await api.markAsPickedUp(selectedPickup.id, adminNotes);
      alert('✅ Pickup marked as picked up!');
      setShowPickupModal(false);
      setAdminNotes('');
      loadPickups();
      loadStats();
    } catch (error) {
      alert('❌ Failed to update: ' + error.message);
    }
  };

  const handleComplete = async () => {
    console.log('=== handleComplete called ===');
    console.log('actualWeight:', actualWeight);
    console.log('selectedPickup:', selectedPickup);
    
    if (!actualWeight || actualWeight <= 0) {
      alert('⚠️ Please enter valid actual weight');
      return;
    }
    
    if (!selectedPickup || !selectedPickup.id) {
      alert('⚠️ No pickup selected');
      return;
    }
    
    const weightValue = parseFloat(actualWeight);
    console.log('Sending weight:', weightValue);
    
    try {
      const response = await api.completePickup(selectedPickup.id, { 
        actualWeight: weightValue, 
        notes: adminNotes 
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        alert(`✅ Pickup completed! ${response.pointsAwarded || 0} points awarded to user.`);
        setShowCompleteModal(false);
        setActualWeight('');
        setAdminNotes('');
        loadPickups();
        loadStats();
      } else {
        alert('❌ Failed: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Complete error:', error);
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

  const handleRescheduleAction = async (approved) => {
    try {
      await api.approveReschedule(selectedPickup.id, approved, adminNotes);
      alert(approved ? '✅ Reschedule approved' : '❌ Reschedule rejected');
      setShowRescheduleModal(false);
      setAdminNotes('');
      loadPickups();
    } catch (error) {
      alert('❌ Failed to process: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="status-badge pending">⏳ Pending</span>;
      case 'assigned': return <span className="status-badge assigned">🚛 Assigned</span>;
      case 'picked_up': return <span className="status-badge picked">📦 Picked Up</span>;
      case 'completed': return <span className="status-badge completed">✅ Completed</span>;
      case 'cancelled': return <span className="status-badge cancelled">❌ Cancelled</span>;
      default: return <span className="status-badge">{status}</span>;
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
        <p>Assign collectors and manage doorstep waste collection</p>
      </div>

      {/* Stats Cards */}
      <div className="pickup-stats-grid">
        <div className="stat-card card">
          <div className="stat-value">{stats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card card pending-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card card assigned-card">
          <div className="stat-value">{stats.assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-card card picked-card">
          <div className="stat-value">{stats.pickedUp || 0}</div>
          <div className="stat-label">Picked Up</div>
        </div>
        <div className="stat-card card completed-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card card rating-card">
          <div className="stat-value">⭐ {stats.averageRating || 0}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="filters">
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending ({stats.pending})</button>
          <button className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`} onClick={() => setFilter('assigned')}>Assigned ({stats.assigned})</button>
          <button className={`filter-btn ${filter === 'picked_up' ? 'active' : ''}`} onClick={() => setFilter('picked_up')}>Picked Up ({stats.pickedUp || 0})</button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed ({stats.completed})</button>
          <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>Cancelled ({stats.cancelled})</button>
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        </div>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by tracking code or city..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && loadPickups()} 
          />
          <button onClick={loadPickups}>🔍 Search</button>
        </div>
      </div>

      {/* Pickups List */}
      <div className="pickups-container">
        {pickups.length === 0 ? (
          <div className="no-results card">
            <p>No pickup requests found. Try changing the filter.</p>
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
                <button className="btn-view-details" onClick={() => { setSelectedPickup(pickup); setShowDetailsModal(true); }}>View Details</button>
              </div>

              <div className="pickup-card-body">
                <div className="info-section user-info">
                  <h4>👤 User Details</h4>
                  <p><strong>Name:</strong> {pickup.userId?.fullName || 'N/A'}</p>
                  <p><strong>Email:</strong> {pickup.userId?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {pickup.userId?.phone || 'N/A'}</p>
                </div>

                <div className="info-section waste-info">
                  <h4>🗑️ Waste Items</h4>
                  <ul>
                    {pickup.wasteTypes?.map((w, i) => (
                      <li key={i}><strong>{w.type}:</strong> {w.estimatedWeight} kg</li>
                    ))}
                  </ul>
                  <p className="total-weight">Total: {pickup.totalEstimatedWeight} kg</p>
                </div>

                <div className="info-section address-info">
                  <h4>📍 Address</h4>
                  <p>{pickup.address?.street}</p>
                  <p>{pickup.address?.city}, {pickup.address?.pincode}</p>
                </div>

                <div className="info-section schedule-info">
                  <h4>📅 Schedule</h4>
                  <p><strong>Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
                  <p><strong>Time Slot:</strong> {pickup.preferredTimeSlot}</p>
                </div>

                {/* Show actual weight and points if completed */}
                {pickup.status === 'completed' && (
                  <>
                    <div className="info-section completion-info">
                      <h4>✅ Completion Details</h4>
                      <p><strong>Actual Weight:</strong> {pickup.actualWeight || 0} kg</p>
                      <p><strong>Points Earned:</strong> +{pickup.pointsEarned || 0} pts</p>
                      <p><strong>Completed At:</strong> {pickup.completedAt ? new Date(pickup.completedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="pickup-card-actions">
                {pickup.status === 'pending' && (
                  <>
                    <button className="btn-assign" onClick={() => { setSelectedPickup(pickup); setShowAssignModal(true); }}>🚛 Assign Collector</button>
                    <button className="btn-cancel" onClick={() => handleCancel(pickup.id)}>❌ Cancel</button>
                  </>
                )}
                
                {pickup.status === 'assigned' && (
                  <>
                    <button className="btn-pickup" onClick={() => { setSelectedPickup(pickup); setShowPickupModal(true); }}>📦 Mark as Picked Up</button>
                    <button className="btn-cancel" onClick={() => handleCancel(pickup.id)}>❌ Cancel</button>
                  </>
                )}
                
                {pickup.status === 'picked_up' && (
                  <button className="btn-complete" onClick={() => { setSelectedPickup(pickup); setShowCompleteModal(true); }}>✅ Complete & Award Points</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Modal */}
      {showCompleteModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>✅ Complete Pickup & Award Points</h3>
            <p><strong>Pickup:</strong> {selectedPickup.trackingCode}</p>
            <p><strong>Estimated Weight:</strong> {selectedPickup.totalEstimatedWeight} kg</p>
            <p><strong>Estimated Points:</strong> {selectedPickup.totalEstimatedPoints} pts</p>
            
            <div className="form-group">
              <label>Actual Weight Collected (kg) *</label>
              <input 
                type="number" 
                step="0.1" 
                value={actualWeight} 
                onChange={(e) => setActualWeight(e.target.value)} 
                placeholder="Enter actual weight" 
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>Completion Notes (Optional)</label>
              <textarea 
                value={adminNotes} 
                onChange={(e) => setAdminNotes(e.target.value)} 
                rows="2" 
                placeholder="Any notes about the completion..."
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleComplete}>Confirm & Award Points</button>
              <button className="btn-secondary" onClick={() => { setShowCompleteModal(false); setActualWeight(''); setAdminNotes(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Assign Collector</h3>
            <p><strong>Pickup:</strong> {selectedPickup.trackingCode}</p>
            <select value={selectedCollector} onChange={(e) => setSelectedCollector(e.target.value)} className="form-input">
              <option value="">-- Select a collector --</option>
              {collectorList.map(c => (<option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>))}
            </select>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleAssign} disabled={!selectedCollector}>Confirm Assignment</button>
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Modal */}
      {showPickupModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowPickupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>📦 Mark as Picked Up</h3>
            <p><strong>Pickup:</strong> {selectedPickup.trackingCode}</p>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows="3" placeholder="Any notes about the pickup..." />
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleMarkAsPickedUp}>Confirm Picked Up</button>
              <button className="btn-secondary" onClick={() => setShowPickupModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPickup && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <h3>Pickup Details - {selectedPickup.trackingCode}</h3>
            <p><strong>User:</strong> {selectedPickup.userId?.fullName}</p>
            <p><strong>Email:</strong> {selectedPickup.userId?.email}</p>
            <p><strong>Address:</strong> {selectedPickup.address?.street}, {selectedPickup.address?.city}</p>
            <p><strong>Waste:</strong> {selectedPickup.wasteTypes?.map(w => `${w.type}(${w.estimatedWeight}kg)`).join(', ')}</p>
            <p><strong>Status:</strong> {selectedPickup.status}</p>
            {selectedPickup.actualWeight > 0 && <p><strong>Actual Weight:</strong> {selectedPickup.actualWeight} kg</p>}
            {selectedPickup.pointsEarned > 0 && <p><strong>Points Earned:</strong> {selectedPickup.pointsEarned}</p>}
            <div className="modal-actions"><button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPickups;