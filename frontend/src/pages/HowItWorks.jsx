// frontend/src/pages/HowItWorks.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up for free and get 100 welcome points',
      icon: '📝',
      details: [
        'Register with your email',
        'Complete your profile',
        'Get welcome bonus points'
      ]
    },
    {
      number: '02',
      title: 'Collect Waste',
      description: 'Gather recyclable materials from your home',
      icon: '🗑️',
      details: [
        'Separate by type',
        'Clean items properly',
        'Check recycling guidelines'
      ]
    },
    {
      number: '03',
      title: 'Submit via AI',
      description: 'Upload photos for automatic detection',
      icon: '📱',
      details: [
        'Take a clear photo',
        'AI identifies waste type',
        'Enter weight manually'
      ]
    },
    {
      number: '04',
      title: 'Get Verified',
      description: 'Admin verifies your submission',
      icon: '✅',
      details: [
        'Automatic verification',
        'Manual review if needed',
        'Points added to account'
      ]
    },
    {
      number: '05',
      title: 'Earn Points',
      description: 'Receive points based on waste type',
      icon: '⭐',
      details: [
        'E-waste: 100 pts/kg',
        'Metal: 25 pts/kg',
        'Plastic: 10 pts/kg'
      ]
    },
    {
      number: '06',
      title: 'Redeem Rewards',
      description: 'Exchange points for exciting rewards',
      icon: '🎁',
      details: [
        'Browse reward catalog',
        'Choose your reward',
        'Instant redemption'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What types of waste can I recycle?',
      answer: 'We accept plastic, paper, metal, e-waste, glass, batteries, and textiles.'
    },
    {
      question: 'How are points calculated?',
      answer: 'Points vary by waste type: E-waste (100/kg), Batteries (150/kg), Metal (25/kg), Plastic (10/kg).'
    },
    {
      question: 'How long does verification take?',
      answer: 'Most submissions are verified within 24 hours.'
    }
  ];

  return (
    <div className="how-it-works">
      <div className="hero-section">
        <div className="container">
          <h1>How It Works 🌱</h1>
          <p className="hero-subtitle">
            Your simple guide to turning waste into rewards
          </p>
        </div>
      </div>

      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2>The SmartRecycle Process</h2>
            <p>Follow these simple steps to start your recycling journey</p>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card card">
                <div className="step-header">
                  <span className="step-number">{step.number}</span>
                  <span className="step-icon">{step.icon}</span>
                </div>
                <h3>{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <ul className="step-details">
                  {step.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Get answers to common questions</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card card">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="cta-section">
            <Link to="/register" className="btn btn-primary">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HowItWorks;