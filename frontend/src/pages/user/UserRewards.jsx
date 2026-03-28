import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RedeemModal from '../../components/RedeemModal';
import SuccessModal from '../../components/SuccessModal';
import './UserRewards.css';

function UserRewards() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal states
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [lastRedemption, setLastRedemption] = useState(null);

  const categories = [
    { id: 'all', name: 'All Rewards', icon: '🎁' },
    { id: 'eco-products', name: 'Eco Products', icon: '🌱' },
    { id: 'vouchers', name: 'Vouchers', icon: '🎫' },
    { id: 'eco-actions', name: 'Eco Actions', icon: '🌍' },
    { id: 'education', name: 'Education', icon: '📚' }
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
      setRewards(rewardsData.rewards || []);
      
      const historyData = await api.getUserRedemptions();
      setRedemptions(historyData.redemptions || []);
      
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleConfirmRedeem = async (rewardId, quantity) => {
    try {
      const result = await api.redeemReward(rewardId, quantity);
      
      setLastRedemption({
        rewardName: result.redemption.rewardName,
        redemptionCode: result.redemption.redemptionCode,
        pointsSpent: result.redemption.pointsSpent,
        remainingPoints: points - result.redemption.pointsSpent
      });
      
      setShowRedeemModal(false);
      setShowSuccessModal(true);
      
      // Refresh points and redemptions
      const pointsData = await api.getUserPoints();
      setPoints(pointsData.points.balance);
      
      const historyData = await api.getUserRedemptions();
      setRedemptions(historyData.redemptions || []);
      
    } catch (error) {
      alert('❌ Redemption failed: ' + error.message);
    }
  };

  const handleViewMyRewards = () => {
    setShowSuccessModal(false);
    // Navigate to My Rewards page (you can create this later)
    // For now, just scroll to recent redemptions
    document.getElementById('recent-redemptions')?.scrollIntoView({ behavior: 'smooth' });
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

      {/* Points Card */}
      <div className="points-card">
        <div className="points-info">
          <span className="points-label">Your Points Balance</span>
          <span className="points-value">{points}</span>
        </div>
        <button 
          className="view-history-btn" 
          onClick={() => navigate('/user/history')}
        >
          View History
        </button>
      </div>

      {/* Categories & Rewards Grid */}
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
                <span className="category-icon">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rewards-grid">
          {rewards.map(reward => (
            <div key={reward.id} className="reward-card">
              <div className="reward-header">
                <span className="reward-category">{reward.category}</span>
                <span className="reward-stock">Stock: {reward.stock}</span>
              </div>
              
              <div className="reward-content">
                <div className="reward-icon">{reward.icon || '🎁'}</div>
                <h3>{reward.name}</h3>
                <p className="reward-description">{reward.description}</p>
                <div className="reward-points">{reward.points} points</div>
              </div>
              
              <button
                className={`redeem-btn ${points >= reward.points ? 'redeem-btn-primary' : 'redeem-btn-secondary'}`}
                onClick={() => handleRedeemClick(reward)}
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

      {/* Recent Redemptions Section */}
      {redemptions.length > 0 && (
        <div id="recent-redemptions" className="recent-redemptions">
          <h3>Recent Redemptions</h3>
          <div className="redemptions-list">
            {redemptions.slice(0, 5).map(red => (
              <div key={red.id} className="redemption-item">
                <div className="redemption-info">
                  <span className="redemption-icon">{red.rewardIcon || '🎁'}</span>
                  <span className="redemption-name">{red.rewardName}</span>
                </div>
                <div className="redemption-details">
                  <span className="redemption-points">-{red.pointsSpent} pts</span>
                  <span className="redemption-code">{red.redemptionCode}</span>
                  <span className="redemption-date">
                    {new Date(red.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showRedeemModal && selectedReward && (
        <RedeemModal
          reward={selectedReward}
          userPoints={points}
          onClose={() => setShowRedeemModal(false)}
          onConfirm={handleConfirmRedeem}
        />
      )}

      {showSuccessModal && lastRedemption && (
        <SuccessModal
          redemption={lastRedemption}
          onClose={() => setShowSuccessModal(false)}
          onViewRewards={handleViewMyRewards}
        />
      )}
    </div>
  );
}

export default UserRewards;