// frontend/src/components/RescheduleModal.jsx
import React, { useState } from 'react';
import './RescheduleModal.css';

function RescheduleModal({ pickup, onClose, onSubmit }) {
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    { value: 'morning', label: 'Morning (9:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 3:00 PM)' },
    { value: 'evening', label: 'Evening (3:00 PM - 6:00 PM)' }
  ];

  const handleSubmit = async () => {
    if (!newDate) {
      alert('Please select a new date');
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(pickup.id, newDate, reason);
      onClose();
    } catch (error) {
      alert('Failed to reschedule: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="reschedule-modal-overlay" onClick={onClose}>
      <div className="reschedule-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="reschedule-modal-header">
          <h3>Reschedule Pickup Request</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="reschedule-modal-body">
          <div className="current-info">
            <p><strong>Tracking Code:</strong> {pickup.trackingCode}</p>
            <p><strong>Current Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
            <p><strong>Current Time Slot:</strong> {pickup.preferredTimeSlot}</p>
          </div>
          
          <div className="new-schedule-section">
            <label>Select New Date *</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={minDateStr}
              className="date-input"
            />
          </div>
          
          <div className="reason-section">
            <label>Reason for Reschedule (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., I won't be available on the scheduled date..."
              rows="3"
            />
          </div>
          
          <div className="info-box">
            <span>ℹ️</span>
            <span>Your request will be sent to admin for approval. You will be notified once approved.</span>
          </div>
        </div>
        
        <div className="reschedule-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={submitting || !newDate}
          >
            {submitting ? 'Submitting...' : 'Request Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;