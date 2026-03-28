import React, { useState } from 'react';
import './SmartBinSimulator.css';

function SmartBinSimulator() {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    wasteType: '',
    weight: ''
  });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const wasteTypes = [
    { value: 'plastic', label: 'Plastic', points: 10, icon: '♻️', color: '#10b981', description: 'Bottles, containers, packaging' },
    { value: 'paper', label: 'Paper', points: 8, icon: '📄', color: '#3b82f6', description: 'Newspapers, cardboard, office paper' },
    { value: 'metal', label: 'Metal', points: 25, icon: '⚙️', color: '#6b7280', description: 'Cans, aluminum, scrap metal' },
    { value: 'ewaste', label: 'E-waste', points: 100, icon: '💻', color: '#f59e0b', description: 'Electronics, phones, computers' },
    { value: 'glass', label: 'Glass', points: 5, icon: '🥃', color: '#06b6d4', description: 'Bottles, jars, containers' },
    { value: 'batteries', label: 'Batteries', points: 150, icon: '🔋', color: '#ef4444', description: 'All types of batteries' },
    { value: 'textiles', label: 'Textiles', points: 7, icon: '👕', color: '#8b5cf6', description: 'Clothes, fabrics, linens' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const calculatePoints = () => {
    const waste = wasteTypes.find(w => w.value === formData.wasteType);
    if (waste && formData.weight) {
      return Math.round(parseFloat(formData.weight) * waste.points);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.wasteType) {
      setError('Please select a waste type');
      return;
    }
    
    if (!formData.weight || formData.weight <= 0) {
      setError('Please enter a valid weight');
      return;
    }
    
    if (formData.weight > 50) {
      setError('Maximum weight is 50kg per transaction');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/smartbin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wasteType: formData.wasteType,
          weight: parseFloat(formData.weight)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedCode(data.data);
        setStep('receipt');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to generate code. Please make sure the backend server is running on port 8000');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const resetForm = () => {
    setStep('form');
    setFormData({ wasteType: '', weight: '' });
    setGeneratedCode(null);
    setError('');
  };

  const selectedWaste = wasteTypes.find(w => w.value === formData.wasteType);

  return (
    <div className="smartbin-simulator">
      <div className="simulator-container">
        {/* Header Section */}
        <div className="simulator-header">
          <div className="bin-icon">🗑️♻️</div>
          <h1>SmartRecycle Bin</h1>
          <p>Drop your recyclables and get your reward code</p>
        </div>

        {/* Form Section */}
        {step === 'form' && (
          <div className="simulator-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Waste Type</label>
                <div className="waste-type-grid">
                  {wasteTypes.map(type => (
                    <div
                      key={type.value}
                      className={`waste-option ${formData.wasteType === type.value ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, wasteType: type.value }))}
                    >
                      <span className="waste-icon">{type.icon}</span>
                      <span className="waste-name">{type.label}</span>
                      <span className="waste-points" style={{ color: type.color }}>{type.points} pts/kg</span>
                      <span className="waste-desc">{type.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="form-input"
                  step="0.1"
                  min="0.1"
                  max="50"
                  placeholder="Enter weight in kilograms"
                  required
                />
                <small className="form-hint">Maximum 50kg per transaction. Minimum 0.1kg.</small>
              </div>

              {formData.wasteType && formData.weight && (
                <div className="points-preview" style={{ borderColor: selectedWaste?.color }}>
                  <div className="points-preview-left">
                    <span>🌟 You will earn</span>
                  </div>
                  <div className="points-preview-right">
                    <strong style={{ color: selectedWaste?.color }}>{calculatePoints()} points</strong>
                    <span className="co2-saved">🌱 Saves {Math.round(parseFloat(formData.weight) * (selectedWaste?.value === 'plastic' ? 0.5 : selectedWaste?.value === 'paper' ? 0.3 : 1.2) * 10) / 10} kg CO₂</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-generate"
                disabled={loading}
              >
                {loading ? 'Generating Code...' : 'Generate Receipt Code'}
              </button>
            </form>
          </div>
        )}

        {/* Receipt Section */}
        {step === 'receipt' && generatedCode && (
          <div className="receipt-card">
            <div className="receipt-header">
              <div className="receipt-logo">
                <span className="logo-icon">♻️</span>
                <span>SmartRecycle</span>
              </div>
              <div className="receipt-title">RECEIPT</div>
              <div className="receipt-date">
                {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="receipt-body">
              <div className="receipt-code-section">
                <div className="code-label">YOUR REWARD CODE</div>
                <div className="code-value">{generatedCode.code}</div>
                <button 
                  className="btn-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode.code);
                    alert('✓ Code copied to clipboard!');
                  }}
                >
                  📋 Copy Code
                </button>
              </div>

              <div className="receipt-details">
                <div className="detail-row">
                  <span>♻️ Waste Type:</span>
                  <strong>{generatedCode.wasteType.charAt(0).toUpperCase() + generatedCode.wasteType.slice(1)}</strong>
                </div>
                <div className="detail-row">
                  <span>⚖️ Weight:</span>
                  <strong>{generatedCode.weight} kg</strong>
                </div>
                <div className="detail-row highlight">
                  <span>⭐ Points Earned:</span>
                  <strong>{generatedCode.pointsValue} points</strong>
                </div>
                <div className="detail-row">
                  <span>🌍 CO₂ Saved:</span>
                  <strong>{generatedCode.co2Saved} kg</strong>
                </div>
                <div className="detail-row">
                  <span>📅 Expires:</span>
                  <strong>{new Date(generatedCode.expiresAt).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="receipt-message">
                <p>✨ Keep this code safe! ✨</p>
                <p>Visit <strong>SmartRecycle Website</strong> → Click <strong>"Redeem Smart Bin Code"</strong></p>
                <p>Enter this code to claim your points!</p>
              </div>

              <div className="receipt-qr-placeholder">
                <div className="qr-simulate">
                  <span>📱</span>
                  <span>Scan to redeem</span>
                </div>
              </div>
            </div>

            <div className="receipt-footer">
              <button className="btn-print" onClick={printReceipt}>
                🖨️ Print Receipt
              </button>
              <button className="btn-new" onClick={resetForm}>
                New Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartBinSimulator;