// frontend/src/pages/user/SubmitRecycling.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SubmitRecycling.css';

function SubmitRecycling() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wasteType: '',
    weight: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiDetections, setAiDetections] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef(null);

  const wasteTypes = [
    { value: '', label: 'Select waste type' },
    { value: 'plastic', label: '♻️ Plastic (10 pts/kg)' },
    { value: 'paper', label: '📄 Paper (8 pts/kg)' },
    { value: 'metal', label: '⚙️ Metal (25 pts/kg)' },
    { value: 'ewaste', label: '💻 E-waste (100 pts/kg)' },
    { value: 'glass', label: '🍶 Glass (5 pts/kg)' },
    { value: 'batteries', label: '🔋 Batteries (150 pts/kg)' },
    { value: 'textiles', label: '👕 Textiles (7 pts/kg)' }
  ];

  const calculatePoints = () => {
    if (!formData.wasteType || !formData.weight) return 0;
    
    const pointsMap = {
      plastic: 10,
      paper: 8,
      metal: 25,
      ewaste: 100,
      glass: 5,
      batteries: 150,
      textiles: 7
    };
    
    return formData.weight * pointsMap[formData.wasteType];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.wasteType) {
      newErrors.wasteType = 'Please select waste type';
    }
    
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (formData.weight <= 0 || formData.weight > 1000) {
      newErrors.weight = 'Weight must be between 0.1 and 1000 kg';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      analyzeImage(file);
    }
  };

  const analyzeImage = async (file) => {
    setIsAnalyzing(true);
    try {
      const result = await api.detectWaste(file);
      
      if (result.success && result.detections.length > 0) {
        setAiDetections(result.detections);
        
        const topDetection = result.detections[0];
        setFormData(prev => ({
          ...prev,
          wasteType: topDetection.waste_type
        }));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const submissionData = {
          wasteType: formData.wasteType,
          weight: parseFloat(formData.weight),
          description: formData.description,
          location: formData.location,
          date: formData.date
        };

        await api.submitRecycling(submissionData);
        
        alert('✅ Recycling submitted successfully!');
        navigate('/user/dashboard');
        
      } catch (error) {
        alert('❌ Submission failed: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="submit-recycling">
      <div className="page-header">
        <h1>Submit Recycling</h1>
        <p>Log your recycling activity and earn points</p>
      </div>

      <div className="recycling-container">
        <div className="recycling-form card">
          {/* AI Image Upload */}
          <div className="ai-upload-section">
            <h3>📸 Upload Photo (AI Detection)</h3>
            <div 
              className="upload-area"
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>Click to upload waste image</p>
                  <p className="upload-hint">AI will detect waste type automatically</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            {isAnalyzing && (
              <div className="analyzing">
                <div className="spinner-small"></div>
                <span>AI analyzing image...</span>
              </div>
            )}

            {aiDetections.length > 0 && (
              <div className="detection-results">
                <h4>AI Detection Results:</h4>
                {aiDetections.map((detection, index) => (
                  <div key={index} className="detection-item">
                    <span className="detection-type">{detection.waste_type}</span>
                    <span className="detection-confidence">
                      {Math.round(detection.confidence * 100)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="recycling-form-fields">
            <div className="form-group">
              <label htmlFor="wasteType" className="form-label">
                Waste Type *
              </label>
              <select
                id="wasteType"
                name="wasteType"
                value={formData.wasteType}
                onChange={handleChange}
                className={`form-input ${errors.wasteType ? 'error' : ''}`}
              >
                {wasteTypes.map((type, index) => (
                  <option key={index} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.wasteType && (
                <span className="error-message">{errors.wasteType}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight" className="form-label">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={`form-input ${errors.weight ? 'error' : ''}`}
                  placeholder="0.0"
                  step="0.1"
                  min="0.1"
                  max="1000"
                />
                {errors.weight && (
                  <span className="error-message">{errors.weight}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Home, Office"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Additional Notes (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                placeholder="Any additional information..."
                rows="3"
              />
            </div>

            <div className="points-preview">
              <span className="points-label">Estimated Points:</span>
              <span className="points-value">{calculatePoints()}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Recycling'}
            </button>
          </form>
        </div>

        <div className="recycling-info card">
          <h3>📋 Recycling Guidelines</h3>
          <ul className="guidelines-list">
            <li>✅ Clean and dry items before recycling</li>
            <li>✅ Separate different waste types</li>
            <li>✅ Remove non-recyclable parts</li>
            <li>❌ No food contamination</li>
            <li>❌ No hazardous materials</li>
          </ul>

          <h3>💰 Points per kg</h3>
          <div className="points-table">
            <div className="point-row"><span>E-waste:</span> <span>100 pts</span></div>
            <div className="point-row"><span>Batteries:</span> <span>150 pts</span></div>
            <div className="point-row"><span>Metal:</span> <span>25 pts</span></div>
            <div className="point-row"><span>Plastic:</span> <span>10 pts</span></div>
            <div className="point-row"><span>Paper:</span> <span>8 pts</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitRecycling;