// frontend/src/pages/user/SubmitRecycling.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SmartBinRedeemModal from '../../components/SmartBinRedeemModal';
import './SubmitRecycling.css';

function SubmitRecycling() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [submissionMethod, setSubmissionMethod] = useState('smartbin');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  
  // Pickup Request Form State
  const [pickupForm, setPickupForm] = useState({
    wasteTypes: [{ type: '', estimatedWeight: '' }],
    address: { street: '', city: '', pincode: '', landmark: '' },
    preferredDate: '',
    preferredTimeSlot: 'morning',
    specialInstructions: ''
  });

  const wasteTypes = [
    { value: 'plastic', label: '♻️ Plastic', points: 10 },
    { value: 'paper', label: '📄 Paper', points: 8 },
    { value: 'metal', label: '⚙️ Metal', points: 25 },
    { value: 'ewaste', label: '💻 E-waste', points: 100 },
    { value: 'glass', label: '🍶 Glass', points: 5 },
    { value: 'batteries', label: '🔋 Batteries', points: 150 },
    { value: 'textiles', label: '👕 Textiles', points: 7 }
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (9:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 3:00 PM)' },
    { value: 'evening', label: 'Evening (3:00 PM - 6:00 PM)' }
  ];

  // Auto detect location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      return;
    }

    setDetectingLocation(true);
    setMessage({ type: '', text: '' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const address = data.address;
            const street = address.road || address.suburb || address.neighbourhood || '';
            const city = address.city || address.town || address.village || '';
            const pincode = address.postcode || '';
            
            setPickupForm(prev => ({
              ...prev,
              address: { ...prev.address, street, city, pincode }
            }));
            
            setMessage({ type: 'success', text: '📍 Location detected successfully!' });
          } else {
            throw new Error('Could not get address details');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setMessage({ type: 'info', text: 'Location detected! Please enter your address manually.' });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setDetectingLocation(false);
        
        let errorMessage = 'Unable to detect location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please enter your address manually.';
        }
        setMessage({ type: 'error', text: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const addWasteType = () => {
    setPickupForm(prev => ({
      ...prev,
      wasteTypes: [...prev.wasteTypes, { type: '', estimatedWeight: '' }]
    }));
  };

  const removeWasteType = (index) => {
    if (pickupForm.wasteTypes.length === 1) return;
    setPickupForm(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.filter((_, i) => i !== index)
    }));
  };

  const updateWasteType = (index, field, value) => {
    const updated = [...pickupForm.wasteTypes];
    updated[index][field] = value;
    setPickupForm(prev => ({ ...prev, wasteTypes: updated }));
  };

  const handlePickupChange = (e, section, field) => {
    const { value } = e.target;
    if (section === 'address') {
      setPickupForm(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setPickupForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateTotalEstimatedPoints = () => {
    let total = 0;
    for (const item of pickupForm.wasteTypes) {
      if (item.type && item.estimatedWeight) {
        const waste = wasteTypes.find(w => w.value === item.type);
        if (waste) {
          total += waste.points * parseFloat(item.estimatedWeight);
        }
      }
    }
    return Math.round(total);
  };

  const calculateTotalWeight = () => {
    let total = 0;
    for (const item of pickupForm.wasteTypes) {
      if (item.estimatedWeight) {
        total += parseFloat(item.estimatedWeight);
      }
    }
    return total.toFixed(1);
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    
    if (pickupForm.wasteTypes.some(w => !w.type || !w.estimatedWeight)) {
      setMessage({ type: 'error', text: 'Please fill all waste type details' });
      return;
    }
    
    if (!pickupForm.address.street || !pickupForm.address.city || !pickupForm.address.pincode) {
      setMessage({ type: 'error', text: 'Please fill complete address' });
      return;
    }
    
    if (!pickupForm.preferredDate) {
      setMessage({ type: 'error', text: 'Please select a pickup date' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.createPickupRequest({
        wasteTypes: pickupForm.wasteTypes.map(w => ({
          type: w.type,
          estimatedWeight: parseFloat(w.estimatedWeight)
        })),
        address: pickupForm.address,
        preferredDate: pickupForm.preferredDate,
        preferredTimeSlot: pickupForm.preferredTimeSlot,
        specialInstructions: pickupForm.specialInstructions
      });
      
      setMessage({ type: 'success', text: `✅ Pickup request submitted! Tracking Code: ${response.pickupRequest.trackingCode}` });
      setTimeout(() => navigate('/user/dashboard'), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Pickup request failed: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Smart Bin Redemption Handler
  const handleCodeRedeemed = async (data) => {
    // Refresh user points from server to update navbar
    await refreshUser();
    
    setRedeemSuccess({
      points: data.pointsEarned,
      weight: data.weight,
      wasteType: data.wasteType
    });
    
    // Auto hide success message after 5 seconds
    setTimeout(() => setRedeemSuccess(null), 5000);
  };

  return (
    <div className="submit-recycling">
      <div className="page-header">
        <h1>Submit Recycling</h1>
        <p>Choose how you want to recycle</p>
      </div>

      {/* Method Selection Tabs */}
      <div className="method-tabs">
        <button
          className={`method-tab ${submissionMethod === 'smartbin' ? 'active' : ''}`}
          onClick={() => setSubmissionMethod('smartbin')}
        >
          🎁 Smart Bin Code
        </button>
        <button
          className={`method-tab ${submissionMethod === 'pickup' ? 'active' : ''}`}
          onClick={() => setSubmissionMethod('pickup')}
        >
          🚛 Waste Pickup Request
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`message-box ${message.type === 'success' ? 'success' : message.type === 'error' ? 'error' : 'info'}`}>
          <span>{message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Redemption Success Message */}
      {redeemSuccess && (
        <div className="message-box success">
          <span>🎉</span>
          <span>Success! You earned {redeemSuccess.points} points for recycling {redeemSuccess.weight} kg of {redeemSuccess.wasteType}!</span>
        </div>
      )}

      {/* SMART BIN SECTION */}
      {submissionMethod === 'smartbin' && (
        <div className="smartbin-section">
          <div className="redeem-section">
            <div className="redeem-icon">🎁</div>
            <h3>Have a Smart Bin Code?</h3>
            <p>If you recycled at a SmartRecycle Smart Bin, you received a receipt with a unique code.</p>
            <p>Enter that code here to instantly claim your points!</p>
            
            <button
              className="btn-redeem-code-large"
              onClick={() => setShowRedeemModal(true)}
            >
              📝 Enter Smart Bin Code
            </button>
          </div>
        </div>
      )}

      {/* PICKUP SECTION */}
      {submissionMethod === 'pickup' && (
        <form className="pickup-form" onSubmit={handlePickupSubmit}>
          {/* Waste Types Section */}
          <div className="form-section">
            <h3>🗑️ Waste Items</h3>
            <p className="section-hint">Add the waste items you want to be picked up</p>
            
            {pickupForm.wasteTypes.map((item, index) => (
              <div key={index} className="waste-item-row">
                <div className="form-group">
                  <label className="form-label">Waste Type</label>
                  <select
                    value={item.type}
                    onChange={(e) => updateWasteType(index, 'type', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select waste type</option>
                    {wasteTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.points} pts/kg)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Estimated Weight (kg)</label>
                  <input
                    type="number"
                    value={item.estimatedWeight}
                    onChange={(e) => updateWasteType(index, 'estimatedWeight', e.target.value)}
                    className="form-input"
                    step="0.1"
                    min="0.1"
                    max="100"
                    placeholder="Enter weight"
                    required
                  />
                </div>
                
                {pickupForm.wasteTypes.length > 1 && (
                  <button type="button" className="btn-remove" onClick={() => removeWasteType(index)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            <button type="button" className="btn-add-waste" onClick={addWasteType}>
              + Add Another Waste Type
            </button>
          </div>

          {/* Address Section */}
          <div className="form-section">
            <div className="address-header">
              <h3>📍 Pickup Address</h3>
              <button type="button" className="btn-detect-location" onClick={detectCurrentLocation} disabled={detectingLocation}>
                {detectingLocation ? '📍 Detecting...' : '📍 Detect My Location'}
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                value={pickupForm.address.street}
                onChange={(e) => handlePickupChange(e, 'address', 'street')}
                className="form-input"
                placeholder="House/Flat No., Street, Area"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  value={pickupForm.address.city}
                  onChange={(e) => handlePickupChange(e, 'address', 'city')}
                  className="form-input"
                  placeholder="City"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  value={pickupForm.address.pincode}
                  onChange={(e) => handlePickupChange(e, 'address', 'pincode')}
                  className="form-input"
                  placeholder="6-digit pincode"
                  maxLength="6"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Landmark (Optional)</label>
              <input
                type="text"
                value={pickupForm.address.landmark}
                onChange={(e) => handlePickupChange(e, 'address', 'landmark')}
                className="form-input"
                placeholder="Nearby landmark"
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="form-section">
            <h3>📅 Schedule Pickup</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input
                  type="date"
                  value={pickupForm.preferredDate}
                  onChange={(e) => handlePickupChange(e, null, 'preferredDate')}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Time Slot *</label>
                <select
                  value={pickupForm.preferredTimeSlot}
                  onChange={(e) => handlePickupChange(e, null, 'preferredTimeSlot')}
                  className="form-input"
                  required
                >
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="form-section">
            <h3>📝 Special Instructions</h3>
            <textarea
              value={pickupForm.specialInstructions}
              onChange={(e) => handlePickupChange(e, null, 'specialInstructions')}
              className="form-input"
              rows="3"
              placeholder="Any special instructions for pickup? (e.g., gate code, floor number, etc.)"
            />
          </div>

          {/* Points Preview */}
          <div className="points-preview-card">
            <div className="preview-header">
              <span>🌟 Estimated Reward</span>
            </div>
            <div className="preview-details">
              <div className="preview-item">
                <span>Total Weight:</span>
                <strong>{calculateTotalWeight()} kg</strong>
              </div>
              <div className="preview-item">
                <span>Estimated Points:</span>
                <strong className="points-highlight">{calculateTotalEstimatedPoints()} pts</strong>
              </div>
            </div>
            <p className="preview-note">
              ⚠️ Final points will be awarded after actual weight verification at pickup
            </p>
          </div>

          <button type="submit" className="btn-submit-pickup" disabled={loading}>
            {loading ? 'Submitting Request...' : '🚛 Request Pickup'}
          </button>
        </form>
      )}

      {/* Smart Bin Redeem Modal */}
      {showRedeemModal && (
        <SmartBinRedeemModal
          onClose={() => setShowRedeemModal(false)}
          onSuccess={handleCodeRedeemed}
        />
      )}
    </div>
  );
}

export default SubmitRecycling;