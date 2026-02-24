// frontend/src/pages/user/UserRewards.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserRewards.css';

function UserRewards() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Rewards' },
    { id: 'eco-products', name: 'Eco Products' },
    { id: 'vouchers', name: 'Vouchers' },
    { id: 'eco-actions', name: 'Eco Actions' },
    { id: 'education', name: 'Education' }
  ];

  useEffect(() => {
    loadRewardsData();
  }, [selectedCategory]);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      
      const pointsData = await api.getUserPoints();
      setPoints(pointsData.points.balance);
      
      const rewardsData = await api.getRewardsCatalog(selectedCategory);
      setRewards(rewardsData.rewards);
      
      const historyData = await api.getUserRedemptions();
      setRedemptions(historyData.redemptions);
      
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (points < reward.points) {
      alert(`❌ You need ${reward.points - points} more points`);
      return;
    }

    const confirm = window.confirm(`Redeem ${reward.name} for ${reward.points} points?`);
    if (!confirm) return;

    try {
      const result = await api.redeemReward(reward.id);
      alert(`✅ Success! Your code: ${result.redemption.redemptionCode}`);
      loadRewardsData();
    } catch (error) {
      alert('❌ Redemption failed: ' + error.message);
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
    <div className="user-rewards">
      <div className="page-header">
        <h1>Rewards Catalog 🎁</h1>
        <p>Redeem your points for amazing eco-friendly rewards</p>
      </div>

      <div className="points-card card">
        <div className="points-info">
          <span className="points-label">Your Points Balance</span>
          <span className="points-value">{points}</span>
        </div>
        <button className="btn btn-secondary" onClick={() => window.location.href = '/user/history'}>
          View History
        </button>
      </div>

      <div className="rewards-container">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          <div className="categories-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rewards-grid">
          {rewards.map(reward => (
            <div key={reward.id} className="reward-card card">
              <div className="reward-header">
                <span className="reward-category">{reward.category}</span>
                <span className="reward-stock">Stock: {reward.stock}</span>
              </div>
              
              <div className="reward-content">
                <div className="reward-icon">{reward.icon}</div>
                <h3>{reward.name}</h3>
                <p className="reward-description">{reward.description}</p>
                <div className="reward-points">{reward.points} points</div>
              </div>
              
              <button
                className={`btn ${points >= reward.points ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleRedeem(reward)}
                disabled={points < reward.points}
              >
                {points >= reward.points ? 'Redeem Now' : 'Insufficient Points'}
              </button>
            </div>
          ))}

          {rewards.length === 0 && (
            <div className="no-rewards">
              <p>No rewards available in this category</p>
            </div>
          )}
        </div>
      </div>

      {redemptions.length > 0 && (
        <div className="recent-redemptions card">
          <h3>Recent Redemptions</h3>
          <div className="redemptions-list">
            {redemptions.slice(0, 5).map(red => (
              <div key={red.id} className="redemption-item">
                <span className="redemption-name">{red.rewardName}</span>
                <span className="redemption-points">-{red.pointsSpent}</span>
                <span className="redemption-date">
                  {new Date(red.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRewards;