import React, { useState } from 'react';
import './RedeemModal.css';

function RedeemModal({ reward, userPoints, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPoints = reward.points * quantity;
  const hasEnoughPoints = userPoints >= totalPoints;
  const maxQuantity = reward.stock !== 'Unlimited' ? parseInt(reward.stock) : 10;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleConfirm = () => {
    if (hasEnoughPoints) {
      setLoading(true);
      onConfirm(reward.id, quantity);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="redeem-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-icon">{reward.icon || '🎁'}</div>
        
        <h2 className="modal-title">{reward.name}</h2>
        <p className="modal-description">{reward.description}</p>
        
        <div className="points-summary">
          <div className="points-row">
            <span>Points Required:</span>
            <strong>{reward.points} pts</strong>
          </div>
          <div className="points-row">
            <span>Your Balance:</span>
            <strong>{userPoints} pts</strong>
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
          <div className="stock-info">
            <span>📦 Stock Available: {reward.stock}</span>
          </div>
        )}
        
        {reward.stock !== 'Unlimited' && (
          <div className="quantity-selector">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button 
                type="button" 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="qty-btn"
              >
                -
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
        
        <div className="redemption-note">
          <span>ℹ️</span>
          <span>Redemption code will be sent to your email after confirmation</span>
        </div>
        
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
        
        {!hasEnoughPoints && (
          <p className="error-message">
            ⚠️ You need {totalPoints - userPoints} more points to redeem this reward
          </p>
        )}
      </div>
    </div>
  );
}

export default RedeemModal;