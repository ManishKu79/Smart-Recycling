import React, { useState, useEffect } from 'react';
import './SuccessModal.css';

function SuccessModal({ redemption, onClose, onViewRewards }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simple confetti effect using canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 5 + 2,
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 2,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allFinished = true;
      
      for (let p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        
        if (p.y < canvas.height) {
          allFinished = false;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
      
      if (allFinished) {
        cancelAnimationFrame(animationId);
        document.body.removeChild(canvas);
      } else {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (document.body.contains(canvas)) document.body.removeChild(canvas);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(redemption.redemptionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="success-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">🎉</div>
        
        <h2 className="success-title">Successfully Redeemed!</h2>
        <p className="success-message">
          You've redeemed <strong>{redemption.rewardName}</strong>
        </p>
        
        <div className="code-section">
          <div className="code-label">Your Redemption Code</div>
          <div className="code-value">{redemption.redemptionCode}</div>
          <button className="btn-copy" onClick={handleCopyCode}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
        
        <div className="points-summary-success">
          <div className="points-row">
            <span>Points Spent:</span>
            <strong className="text-red">-{redemption.pointsSpent} pts</strong>
          </div>
          <div className="points-row">
            <span>Remaining Points:</span>
            <strong className="text-green">{redemption.remainingPoints} pts</strong>
          </div>
        </div>
        
        <div className="redemption-instruction">
          <span>📧</span>
          <span>Redemption details have been sent to your registered email</span>
        </div>
        
        <div className="modal-actions-success">
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

export default SuccessModal;