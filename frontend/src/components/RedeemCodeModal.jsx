// frontend/src/components/RedeemCodeModal.jsx
import React, { useState } from 'react';
import api from '../services/api';
import './RedeemCodeModal.css';

function RedeemCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState(null);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCode(value);
    setError('');
    setVerifiedData(null);
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    setVerifying(true);
    setError('');
    
    try {
      const response = await api.verifySmartBinCode(code);
      console.log('Verify response:', response);
      
      if (response.valid === true) {
        setVerifiedData(response.data);
        setError('');
      } else {
        setError(response.message || 'Invalid code');
        setVerifiedData(null);
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError(err.message || 'Failed to verify code');
      setVerifiedData(null);
    } finally {
      setVerifying(false);
    }
  };

  // ✅ FIXED: Separate function for redemption
  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    setRedeeming(true);
    setError('');
    
    try {
      console.log('Redeeming code:', code);
      const response = await api.redeemSmartBinCode(code);
      console.log('Redeem response:', response);
      
      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
        // Close modal after successful redemption
        onClose();
      } else {
        setError(response.error || 'Failed to redeem code');
      }
    } catch (err) {
      console.error('Redeem error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to redeem code');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="redeem-code-overlay" onClick={onClose}>
      <div className="redeem-code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎁 Redeem Smart Bin Code</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Enter the code from your smart bin receipt to claim your recycling points!
          </p>
          
          <div className="code-input-group">
            <input
              type="text"
              className={`code-input ${error ? 'error' : ''} ${verifiedData ? 'success' : ''}`}
              placeholder="Enter code (e.g., SR-XXXXX-XXXXX-XX)"
              value={code}
              onChange={handleCodeChange}
              disabled={verifying || redeeming}
            />
            <button
              className="btn-verify"
              onClick={handleVerify}
              disabled={verifying || !code.trim() || redeeming}
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          
          {error && (
            <div className="error-message-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {verifiedData && (
            <div className="verified-info">
              <div className="success-badge">
                <span>✓</span>
                <span>Valid Code!</span>
              </div>
              
              <div className="reward-details">
                <div className="reward-item">
                  <span>Points:</span>
                  <strong className="highlight">{verifiedData.pointsValue} pts</strong>
                </div>
                <div className="reward-item">
                  <span>Waste Type:</span>
                  <strong>{verifiedData.wasteType}</strong>
                </div>
                <div className="reward-item">
                  <span>Weight:</span>
                  <strong>{verifiedData.weight} kg</strong>
                </div>
                <div className="reward-item">
                  <span>Expires:</span>
                  <strong>{new Date(verifiedData.expiresAt).toLocaleDateString()}</strong>
                </div>
              </div>
              
              <button
                className="btn-redeem"
                onClick={handleRedeem}
                disabled={redeeming}
              >
                {redeeming ? 'Redeeming...' : 'Redeem Points'}
              </button>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <p>💡 Codes are valid for 7 days. Each code can only be used once.</p>
        </div>
      </div>
    </div>
  );
}

export default RedeemCodeModal;