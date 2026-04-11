// frontend/src/components/RatePickupModal.jsx
import React, { useState } from 'react';
import './RatePickupModal.css';

function RatePickupModal({ pickup, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(pickup.id, rating, feedback);
      onClose();
    } catch (error) {
      alert('Failed to submit rating: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rate-modal-overlay" onClick={onClose}>
      <div className="rate-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="rate-modal-header">
          <h3>Rate Your Pickup Experience</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="rate-modal-body">
          <div className="pickup-info">
            <p><strong>Tracking Code:</strong> {pickup.trackingCode}</p>
            <p><strong>Date:</strong> {new Date(pickup.preferredDate).toLocaleDateString()}</p>
          </div>
          
          <div className="rating-section">
            <label>How was your experience?</label>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="rating-label">
              {rating === 1 && 'Very Poor'}
              {rating === 2 && 'Poor'}
              {rating === 3 && 'Average'}
              {rating === 4 && 'Good'}
              {rating === 5 && 'Excellent!'}
            </div>
          </div>
          
          <div className="feedback-section">
            <label>Additional Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with the collector..."
              rows="4"
            />
          </div>
        </div>
        
        <div className="rate-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatePickupModal;