// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">♻️</span>
              <span>SmartRecycle</span>
            </div>
            <p className="footer-tagline">
              Building a greener future, one recycle at a time.
            </p>
            <div className="footer-social">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                𝕏
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                f
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                📷
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                in
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
                <li><Link to="/user/dashboard">Dashboard</Link></li>
                <li><Link to="/user/recycle">Submit Recycling</Link></li>
                <li><Link to="/user/rewards">Rewards</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/how-it-works#faq">FAQ</Link></li>
                <li><Link to="/how-it-works#guide">Recycling Guide</Link></li>
                <li><a href="#centers">Recycling Centers</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/terms">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/terms">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} SmartRecycle. All rights reserved.</p>
            <p className="eco-message">🌱 Making Earth a better place, together.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;