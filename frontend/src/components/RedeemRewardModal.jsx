// frontend/src/components/RedeemRewardModal.jsx
import React, { useState } from 'react';
import './RedeemRewardModal.css';

function RedeemRewardModal({ reward, userPoints, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPoints = reward.points * quantity;
  const hasEnoughPoints = userPoints >= totalPoints;
  const maxQuantity = reward.stock !== 'Unlimited' ? parseInt(reward.stock) : 10;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
      setError('');
    }
  };

  const handleConfirm = async () => {
    if (!hasEnoughPoints) {
      setError(`You need ${totalPoints - userPoints} more points`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onConfirm(reward.id, quantity);
      onClose();
    } catch (err) {
      setError(err.message || 'Redemption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="redeem-reward-overlay" onClick={onClose}>
      <div className="redeem-reward-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <div className="modal-reward-icon">{reward.icon || '🎁'}</div>
        
        <h2 className="modal-reward-title">{reward.name}</h2>
        <p className="modal-reward-description">{reward.description}</p>
        
        <div className="modal-points-summary">
          <div className="points-row">
            <span>Points Required:</span>
            <strong>{reward.points} pts</strong>
          </div>
          <div className="points-row">
            <span>Your Balance:</span>
            <strong className={hasEnoughPoints ? 'text-green' : 'text-red'}>
              {userPoints} pts
            </strong>
          </div>
          {quantity > 1 && (
            <div className="points-row total-row">
              <span>Total Points:</span>
              <strong className={hasEnoughPoints ? 'text-green' : 'text-red'}>
                {totalPoints} pts
              </strong>
            </div>
          )}
          <div className="points-row">
            <span>After Redemption:</span>
            <strong>{userPoints - totalPoints} pts</strong>
          </div>
        </div>
        
        {reward.stock !== 'Unlimited' && (
          <div className="modal-stock-info">
            <span>📦 Stock Available: {reward.stock}</span>
          </div>
        )}
        
        {reward.stock !== 'Unlimited' && (
          <div className="modal-quantity-selector">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button 
                type="button" 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="qty-btn"
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button 
                type="button" 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity}
                className="qty-btn"
              >
                +
              </button>
            </div>
          </div>
        )}
        
        <div className="modal-redemption-note">
          <span>ℹ️</span>
          <span>Redemption code will be shown after confirmation</span>
        </div>
        
        {error && (
          <div className="modal-error-message">
            ⚠️ {error}
          </div>
        )}
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className={`btn-confirm ${!hasEnoughPoints ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!hasEnoughPoints || loading}
          >
            {loading ? 'Processing...' : `Redeem for ${totalPoints} pts`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RedeemRewardModal;