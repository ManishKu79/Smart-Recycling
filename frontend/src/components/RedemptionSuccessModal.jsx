// frontend/src/components/RedemptionSuccessModal.jsx
import React, { useState } from 'react';
import './RedemptionSuccessModal.css';

function RedemptionSuccessModal({ redemption, onClose, onViewRewards }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(redemption.redemptionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="success-overlay" onClick={onClose}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-animation">
          <div className="success-checkmark">✓</div>
        </div>
        
        <h2 className="success-title">Redemption Successful! 🎉</h2>
        <p className="success-message">
          You have successfully redeemed <strong>{redemption.rewardName}</strong>
        </p>
        
        <div className="success-code-section">
          <div className="code-label">YOUR REDEMPTION CODE</div>
          <div className="code-value">{redemption.redemptionCode}</div>
          <button className="btn-copy-code" onClick={handleCopyCode}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
        
        <div className="success-points-summary">
          <div className="points-row">
            <span>Points Spent:</span>
            <strong className="points-spent">-{redemption.pointsSpent} pts</strong>
          </div>
          <div className="points-row">
            <span>Remaining Points:</span>
            <strong className="points-remaining">{redemption.remainingPoints} pts</strong>
          </div>
        </div>
        
        <div className="success-instruction">
          <span>📧</span>
          <span>Redemption details have also been sent to your email</span>
        </div>
        
        <div className="success-actions">
          <button className="btn-view-rewards" onClick={onViewRewards}>
            🎁 View My Rewards
          </button>
          <button className="btn-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default RedemptionSuccessModal;