// frontend/src/pages/SmartBinSimulator.jsx
import React, { useState, useEffect } from 'react';
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

  // ✅ Use deployed backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    document.body.classList.add('hide-navbar');
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

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
      const response = await fetch(`${API_BASE_URL}/smartbin/generate`, {
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
      console.error(err);
      setError('Failed to generate code. Please try again.');
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
        <div className="simulator-header">
          <div className="bin-icon">🗑️♻️</div>
          <h1>SmartRecycle Bin</h1>
          <p>Drop your recyclables and get your reward code</p>
        </div>

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
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
            </form>
          </div>
        )}

        {step === 'receipt' && generatedCode && (
          <div className="receipt-card">
            <h2>Code Generated</h2>
            <p>{generatedCode.code}</p>

            <button onClick={printReceipt}>Print</button>
            <button onClick={resetForm}>New</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartBinSimulator;
