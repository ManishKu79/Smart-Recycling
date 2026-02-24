// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: '🔍',
      title: 'AI Waste Detection',
      description: 'Advanced AI identifies waste types automatically from photos'
    },
    {
      icon: '⭐',
      title: 'Reward Points',
      description: 'Earn points for every kilogram recycled'
    },
    {
      icon: '📊',
      title: 'Impact Tracking',
      description: 'Monitor your environmental contribution in real-time'
    },
    {
      icon: '🌱',
      title: 'Eco Impact',
      description: 'See your CO2 savings and trees saved'
    },
    {
      icon: '🏆',
      title: 'Achievements',
      description: 'Unlock badges and compete with friends'
    },
    {
      icon: '🎁',
      title: 'Special Rewards',
      description: 'Redeem points for exclusive eco-friendly products'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '50,000+', label: 'Trees Saved' },
    { number: '100+', label: 'Rewards' },
    { number: '1M+', label: 'Points Earned' }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">♻️</span>
            Smart Recycling & Reward System
          </h1>
          <p className="hero-subtitle">
            Turn your waste into rewards while saving the planet. 
            Join thousands of eco-warriors making a sustainable impact.
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} 
                className="btn btn-primary hero-btn"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary hero-btn">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary hero-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2>Why Choose SmartRecycle?</h2>
          <p>Our platform makes recycling rewarding and effortless</p>
        </div>
        <div className="grid grid-3">
          {features.map((feature, index) => (
            <div key={index} className="card feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="card stats-card">
          <h2>Our Community Impact</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="process-preview">
        <div className="section-header">
          <h2>Simple & Rewarding Process</h2>
          <p>Start your recycling journey in just a few easy steps</p>
        </div>
        
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your free account in minutes</p>
          </div>
          
          <div className="process-arrow">→</div>
          
          <div className="process-step">
            <div className="step-number">2</div>
            <h3>Collect & Submit</h3>
            <p>Take a photo of your recyclables</p>
          </div>
          
          <div className="process-arrow">→</div>
          
          <div className="process-step">
            <div className="step-number">3</div>
            <h3>Earn Points</h3>
            <p>Get rewarded for your contribution</p>
          </div>
        </div>
        
        <div className="process-cta">
          <Link to="/how-it-works" className="btn btn-primary">
            Learn More
          </Link>
        </div>
      </section>

      <section className="cta">
        <div className="card cta-card">
          <h2>Ready to Make a Difference?</h2>
          <p>Join our community today and start earning rewards for your eco-friendly actions.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary cta-btn">
              Sign Up Now 🌱
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;