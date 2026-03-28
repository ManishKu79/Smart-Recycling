import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-badge">♻️ Smart Recycling Platform</div>
          <h1>Turn Waste into <span className="home-highlight">Rewards</span></h1>
          <p>Recycle using Smart Bins or request doorstep pickup. Earn points and redeem exciting gift cards!</p>
          <div className="home-hero-buttons">
            {isAuthenticated ? (
              <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} className="home-btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="home-btn-primary">Get Started Free</Link>
                <Link to="/login" className="home-btn-secondary">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="home-stats">
        <div className="home-stats-container">
          <div className="home-stat-box">
            <div className="home-stat-number">10,000+</div>
            <div className="home-stat-label">Active Users</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-number">50,000+</div>
            <div className="home-stat-label">Trees Saved</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-number">100+</div>
            <div className="home-stat-label">Rewards</div>
          </div>
          <div className="home-stat-box">
            <div className="home-stat-number">1M+</div>
            <div className="home-stat-label">Points Earned</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="home-how-it-works">
        <h2>How It Works</h2>
        <p className="home-section-subtitle">Simple steps to start recycling</p>
        <div className="home-steps">
          <div className="home-step">
            <div className="home-step-icon">1</div>
            <h3>Create Account</h3>
            <p>Sign up for free and get 100 welcome points</p>
          </div>
          <div className="home-step">
            <div className="home-step-icon">2</div>
            <h3>Choose Method</h3>
            <p>Smart Bin Code OR Doorstep Pickup</p>
          </div>
          <div className="home-step">
            <div className="home-step-icon">3</div>
            <h3>Earn Points</h3>
            <p>Get points based on waste type & weight</p>
          </div>
          <div className="home-step">
            <div className="home-step-icon">4</div>
            <h3>Redeem Rewards</h3>
            <p>Exchange points for gift cards & products</p>
          </div>
        </div>
      </div>

      {/* Two Methods */}
      <div className="home-methods">
        <h2>Two Ways to Recycle</h2>
        <p className="home-section-subtitle">Choose what works best for you</p>
        <div className="home-methods-grid">
          <div className="home-method-card">
            <div className="home-method-icon">🗑️</div>
            <h3>Smart Bin Code</h3>
            <p>Visit any SmartRecycle Smart Bin, deposit your waste, get a unique code, and redeem instantly for points.</p>
            <ul>
              <li>✓ Instant points</li>
              <li>✓ Available 24/7</li>
              <li>✓ No waiting time</li>
            </ul>
            <Link to="/user/recycle" className="home-method-link">Use Smart Bin →</Link>
          </div>
          <div className="home-method-card">
            <div className="home-method-icon">🚛</div>
            <h3>Waste Pickup Request</h3>
            <p>Schedule doorstep collection. We'll send a collector to pick up your recyclables from your home.</p>
            <ul>
              <li>✓ Doorstep service</li>
              <li>✓ Bulk waste accepted</li>
              <li>✓ Scheduled at your convenience</li>
            </ul>
            <Link to="/user/recycle" className="home-method-link">Request Pickup →</Link>
          </div>
        </div>
      </div>

      {/* Points Guide */}
      <div className="home-points-guide">
        <h2>Points Guide</h2>
        <p className="home-section-subtitle">Earn points based on waste type</p>
        <div className="home-points-grid">
          <div className="home-point-item">
            <span>🔋</span>
            <strong>Batteries</strong>
            <span>150 pts/kg</span>
          </div>
          <div className="home-point-item">
            <span>💻</span>
            <strong>E-waste</strong>
            <span>100 pts/kg</span>
          </div>
          <div className="home-point-item">
            <span>⚙️</span>
            <strong>Metal</strong>
            <span>25 pts/kg</span>
          </div>
          <div className="home-point-item">
            <span>♻️</span>
            <strong>Plastic</strong>
            <span>10 pts/kg</span>
          </div>
          <div className="home-point-item">
            <span>📄</span>
            <strong>Paper</strong>
            <span>8 pts/kg</span>
          </div>
          <div className="home-point-item">
            <span>👕</span>
            <strong>Textiles</strong>
            <span>7 pts/kg</span>
          </div>
          <div className="home-point-item">
            <span>🍶</span>
            <strong>Glass</strong>
            <span>5 pts/kg</span>
          </div>
        </div>
      </div>

      {/* Rewards Preview */}
      <div className="home-rewards">
        <div className="home-rewards-content">
          <div className="home-rewards-text">
            <h2>Amazing Rewards Await</h2>
            <p>Redeem your points for exciting rewards</p>
            <ul>
              <li>🛍️ Amazon & Flipkart Gift Cards</li>
              <li>🍔 Swiggy & Zomato Vouchers</li>
              <li>🎬 Netflix & Prime Video Subscriptions</li>
              <li>🪥 Bamboo Toothbrushes & Eco Products</li>
              <li>🌳 Plant Real Trees</li>
            </ul>
            <Link to="/user/rewards" className="home-btn-primary">View All Rewards</Link>
          </div>
          <div className="home-rewards-icons">
            <span>🛍️</span>
            <span>🍔</span>
            <span>🎬</span>
            <span>🌳</span>
            <span>🪥</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="home-cta">
        <div className="home-cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of eco-warriors who are earning rewards while saving the planet.</p>
          <Link to="/register" className="home-btn-primary">Sign Up Now 🌱</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;