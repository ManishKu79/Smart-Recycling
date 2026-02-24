// frontend/src/pages/admin/AdminRewards.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminRewards.css';

function AdminRewards() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    description: '',
    category: 'eco-products',
    stock: 'Unlimited',
    icon: '🎁'
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await api.getRewardsCatalog('all');
      setRewards(data.rewards);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      points: '',
      description: '',
      category: 'eco-products',
      stock: 'Unlimited',
      icon: '🎁'
    });
    setEditingReward(null);
    setShowForm(false);
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      points: reward.points,
      description: reward.description,
      category: reward.category,
      stock: reward.stock,
      icon: reward.icon || '🎁'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReward) {
        await api.updateReward(editingReward.id, formData);
        alert('✅ Reward updated successfully');
      } else {
        await api.createReward(formData);
        alert('✅ Reward created successfully');
      }
      
      resetForm();
      loadRewards();
    } catch (error) {
      alert('❌ Failed to save reward: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await api.deleteReward(id);
        alert('✅ Reward deleted');
        loadRewards();
      } catch (error) {
        alert('❌ Failed to delete: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading rewards...</p>
      </div>
    );
  }

  return (
    <div className="admin-rewards">
      <div className="page-header">
        <h1>Manage Rewards</h1>
        <p>Create and manage reward items</p>
      </div>

      <div className="rewards-header">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Reward
        </button>
      </div>

      {showForm && (
        <div className="reward-form card">
          <h3>{editingReward ? 'Edit Reward' : 'Create New Reward'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Reward Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="points" className="form-label">Points Required</label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="eco-products">Eco Products</option>
                  <option value="vouchers">Vouchers</option>
                  <option value="eco-actions">Eco Actions</option>
                  <option value="education">Education</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock" className="form-label">Stock</label>
                <input
                  type="text"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 50 or Unlimited"
                />
              </div>

              <div className="form-group">
                <label htmlFor="icon" className="form-label">Icon</label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="🎁"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingReward ? 'Update Reward' : 'Create Reward'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rewards-grid">
        {rewards.map(reward => (
          <div key={reward.id} className="reward-card card">
            <div className="reward-header">
              <span className="reward-icon">{reward.icon}</span>
              <span className="reward-category">{reward.category}</span>
            </div>
            <h3>{reward.name}</h3>
            <p className="reward-description">{reward.description}</p>
            <div className="reward-details">
              <span className="reward-points">{reward.points} points</span>
              <span className="reward-stock">Stock: {reward.stock}</span>
            </div>
            <div className="reward-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleEdit(reward)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(reward.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminRewards;