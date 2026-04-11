// frontend/src/components/SmartBinRedeemModal.jsx
import React, { useState } from 'react';
import api from '../services/api';
import './SmartBinRedeemModal.css';

function SmartBinRedeemModal({ onClose, onSuccess }) {
  const [step, setStep] = useState('input'); // input, verify, success
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState(null);
  const [error, setError] = useState('');
  const [redemptionResult, setRedemptionResult] = useState(null);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCode(value);
    setError('');
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.verifySmartBinCode(code);
      console.log('Verify response:', response);
      
      if (response.valid === true) {
        setVerifiedData(response.data);
        setStep('verify');
        setError('');
      } else {
        setError(response.message || 'Invalid or expired code');
        setVerifiedData(null);
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.redeemSmartBinCode(code);
      console.log('Redeem response:', response);
      
      if (response.success) {
        setRedemptionResult(response.data);
        setStep('success');
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setError(response.error || 'Failed to redeem code');
      }
    } catch (err) {
      console.error('Redeem error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleNewCode = () => {
    setStep('input');
    setCode('');
    setVerifiedData(null);
    setError('');
    setRedemptionResult(null);
  };

  return (
    <div className="smartbin-modal-overlay" onClick={handleClose}>
      <div className="smartbin-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* STEP 1: Input Code */}
        {step === 'input' && (
          <>
            <div className="modal-header">
              <div className="modal-icon">🎁</div>
              <h2>Redeem Smart Bin Code</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">
                Enter the unique code from your Smart Bin receipt to claim your recycling points.
              </p>
              
              <div className="code-input-wrapper">
                <input
                  type="text"
                  className={`code-input ${error ? 'error' : ''}`}
                  placeholder="e.g., SR-ABCDE-FGHIJ-12"
                  value={code}
                  onChange={handleCodeChange}
                  disabled={loading}
                  autoFocus
                />
                <button
                  className="verify-btn"
                  onClick={handleVerify}
                  disabled={loading || !code.trim()}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
              
              {error && (
                <div className="error-box">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="info-box">
                <span>💡</span>
                <div>
                  <strong>How to get a code?</strong>
                  <p>Visit any SmartRecycle Smart Bin, deposit your recyclables, and you'll receive a receipt with a unique code.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleClose}>Cancel</button>
            </div>
          </>
        )}

        {/* STEP 2: Verify & Confirm */}
        {step === 'verify' && verifiedData && (
          <>
            <div className="modal-header">
              <div className="modal-icon">✅</div>
              <h2>Confirm Redemption</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="success-badge">
                <span>✓</span>
                <span>Code Verified Successfully!</span>
              </div>
              
              <div className="reward-preview">
                <h3>You will receive:</h3>
                
                <div className="reward-details-grid">
                  <div className="reward-detail-item">
                    <span className="detail-icon">⭐</span>
                    <div>
                      <label>Points</label>
                      <strong>{verifiedData.pointsValue} points</strong>
                    </div>
                  </div>
                  <div className="reward-detail-item">
                    <span className="detail-icon">🗑️</span>
                    <div>
                      <label>Waste Type</label>
                      <strong>{verifiedData.wasteType?.toUpperCase()}</strong>
                    </div>
                  </div>
                  <div className="reward-detail-item">
                    <span className="detail-icon">⚖️</span>
                    <div>
                      <label>Weight</label>
                      <strong>{verifiedData.weight} kg</strong>
                    </div>
                  </div>
                  <div className="reward-detail-item">
                    <span className="detail-icon">📅</span>
                    <div>
                      <label>Expires</label>
                      <strong>{new Date(verifiedData.expiresAt).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="warning-box">
                <span>⚠️</span>
                <span>Once redeemed, this code cannot be used again.</span>
              </div>
              
              {error && (
                <div className="error-box">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <div className="modal-footer dual-buttons">
              <button className="back-btn" onClick={() => setStep('input')}>
                Back
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleRedeem}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm & Redeem'}
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Success */}
        {step === 'success' && redemptionResult && (
          <>
            <div className="modal-header success-header">
              <div className="modal-icon">🎉</div>
              <h2>Redemption Successful!</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>
            
            <div className="modal-body success-body">
              <div className="success-animation">
                <div className="checkmark-circle">
                  <div className="checkmark">✓</div>
                </div>
              </div>
              
              <p className="success-message">
                You have successfully redeemed your Smart Bin code!
              </p>
              
              <div className="points-earned-card">
                <span className="points-label">Points Earned</span>
                <span className="points-value">+{redemptionResult.pointsEarned}</span>
              </div>
              
              <div className="redemption-summary">
                <div className="summary-row">
                  <span>Waste Type:</span>
                  <strong>{redemptionResult.wasteType?.toUpperCase()}</strong>
                </div>
                <div className="summary-row">
                  <span>Weight:</span>
                  <strong>{redemptionResult.weight} kg</strong>
                </div>
                <div className="summary-row">
                  <span>CO₂ Saved:</span>
                  <strong>{redemptionResult.co2Saved} kg</strong>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="done-btn" onClick={handleClose}>
                Done
              </button>
              <button className="new-code-btn" onClick={handleNewCode}>
                Redeem Another Code
              </button>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
}

export default SmartBinRedeemModal;