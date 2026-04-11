// frontend/src/pages/admin/AdminCollectors.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminCollectors.css';

function AdminCollectors() {
  const [loading, setLoading] = useState(true);
  const [collectors, setCollectors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCollector, setEditingCollector] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    assignedZone: ''
  });

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      setLoading(true);
      const data = await api.getAllCollectors();
      setCollectors(data.collectors || []);
    } catch (error) {
      console.error('Failed to load collectors:', error);
      alert('Failed to load collectors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollector) {
        await api.updateCollector(editingCollector.id, formData);
        alert('✅ Collector updated successfully');
      } else {
        await api.createCollector(formData);
        alert('✅ Collector created successfully');
      }
      setShowModal(false);
      resetForm();
      loadCollectors();
    } catch (error) {
      alert('❌ Failed to save collector: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this collector?')) {
      try {
        await api.deleteCollector(id);
        alert('✅ Collector deleted');
        loadCollectors();
      } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
      }
    }
  };

  const handleEdit = (collector) => {
    setEditingCollector(collector);
    setFormData({
      fullName: collector.fullName,
      email: collector.email,
      password: '',
      phone: collector.phone || '',
      address: collector.address || '',
      city: collector.city || '',
      pincode: collector.pincode || '',
      assignedZone: collector.assignedZone || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      assignedZone: ''
    });
    setEditingCollector(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading collectors...</p>
      </div>
    );
  }

  return (
    <div className="admin-collectors">
      <div className="page-header">
        <h1>Manage Waste Collectors</h1>
        <p>Create and manage waste collection staff</p>
      </div>

      <div className="collectors-header">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add New Collector
        </button>
      </div>

      <div className="collectors-grid">
        {collectors.map(collector => (
          <div key={collector.id} className="collector-card card">
            <div className="collector-header">
              <div className="collector-avatar">👤</div>
              <div className="collector-info">
                <h3>{collector.fullName}</h3>
                <p className="collector-email">{collector.email}</p>
              </div>
              <span className={`status-badge ${collector.isActive ? 'active' : 'inactive'}`}>
                {collector.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="collector-details">
              <div className="detail-item">
                <span>📞 Phone:</span>
                <strong>{collector.phone || 'Not provided'}</strong>
              </div>
              <div className="detail-item">
                <span>📍 Zone:</span>
                <strong>{collector.assignedZone || 'Not assigned'}</strong>
              </div>
              <div className="detail-item">
                <span>📍 City:</span>
                <strong>{collector.city || 'Not specified'}</strong>
              </div>
              <div className="detail-item">
                <span>✅ Completed:</span>
                <strong>{collector.completedPickups || 0} pickups</strong>
              </div>
              <div className="detail-item">
                <span>⭐ Rating:</span>
                <strong>{collector.averageRating || 0} / 5</strong>
              </div>
            </div>
            
            <div className="collector-actions">
              <button className="btn-edit" onClick={() => handleEdit(collector)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(collector.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
        
        {collectors.length === 0 && (
          <div className="no-collectors">
            <p>No collectors found. Click "Add New Collector" to create one.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          resetForm();
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingCollector ? 'Edit Collector' : 'Add New Collector'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    required
                    disabled={!!editingCollector}
                  />
                </div>
              </div>
              
              {!editingCollector && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="form-input"
                    required
                    placeholder="Minimum 8 characters"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                  placeholder="10-digit mobile number"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Zone</label>
                  <input
                    type="text"
                    value={formData.assignedZone}
                    onChange={(e) => setFormData({...formData, assignedZone: e.target.value})}
                    className="form-input"
                    placeholder="e.g., North Zone, South Zone"
                  />
                </div>
                
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="form-input"
                  rows="2"
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingCollector ? 'Update Collector' : 'Create Collector'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCollectors;