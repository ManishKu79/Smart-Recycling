import React, { useState } from 'react';
import api from '../services/api';
import './RedeemCode.css';

function RedeemCode({ onSuccess, onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState(null);
  const [error, setError] = useState('');

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
      
      if (response.valid) {
        setVerifiedData(response.data);
        setError('');
      } else {
        setError(response.message);
        setVerifiedData(null);
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      setVerifiedData(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async () => {
    setLoading(true);
    
    try {
      const response = await api.redeemSmartBinCode(code);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      alert(response.message);
      
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="redeem-modal">
      <div className="redeem-content">
        <div className="redeem-header">
          <h3>🎁 Redeem Smart Bin Code</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="redeem-body">
          <p className="redeem-description">
            Enter the code from your smart bin receipt to claim your recycling points!
          </p>
          
          <div className="code-input-group">
            <input
              type="text"
              className={`code-input ${error ? 'error' : ''} ${verifiedData ? 'success' : ''}`}
              placeholder="Enter code (e.g., SR-XXXXX-XXXXX-XX)"
              value={code}
              onChange={handleCodeChange}
              disabled={loading}
            />
            <button
              className="btn-verify"
              onClick={handleVerify}
              disabled={verifying || !code.trim()}
            >
              {verifying ? '...' : 'Verify'}
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
                disabled={loading}
              >
                {loading ? 'Redeeming...' : 'Redeem Points'}
              </button>
            </div>
          )}
        </div>
        
        <div className="redeem-footer">
          <p>💡 Codes are valid for 7 days. Each code can only be used once.</p>
        </div>
      </div>
    </div>
  );
}

export default RedeemCode;