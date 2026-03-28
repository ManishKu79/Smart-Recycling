import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

function HowItWorks() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up for free and get 100 welcome points instantly',
      icon: '📝',
      details: [
        'Register with your email',
        'Complete your profile',
        'Get 100 welcome bonus points'
      ]
    },
    {
      number: '02',
      title: 'Choose Your Method',
      description: 'Two easy ways to recycle your waste',
      icon: '🤔',
      details: [
        'Smart Bin Code - Instant points',
        'Pickup Request - Doorstep collection',
        'Select what works best for you'
      ]
    },
    {
      number: '03',
      title: 'Smart Bin Code',
      description: 'Use our Smart Bins to recycle and get a code',
      icon: '🗑️',
      details: [
        'Visit any SmartRecycle Smart Bin',
        'Deposit your recyclables',
        'Get a unique code on receipt',
        'Redeem code for instant points'
      ]
    },
    {
      number: '04',
      title: 'Waste Pickup Request',
      description: 'Schedule doorstep waste collection',
      icon: '🚛',
      details: [
        'Fill pickup request form',
        'Add waste types & estimated weight',
        'Select preferred date & time',
        'Admin approves and assigns collector'
      ]
    },
    {
      number: '05',
      title: 'Get Verified',
      description: 'Your submission is reviewed',
      icon: '✅',
      details: [
        'Smart Bin codes - Instant approval',
        'Pickup requests - Admin verification',
        'Actual weight measured at pickup',
        'Points added to your account'
      ]
    },
    {
      number: '06',
      title: 'Earn & Redeem',
      description: 'Earn points and get amazing rewards',
      icon: '⭐',
      details: [
        'Earn points per kg recycled',
        'Track your environmental impact',
        'Redeem for gift cards & eco products',
        'Plant trees & support charity'
      ]
    }
  ];

  const methods = [
    {
      title: 'Smart Bin Code',
      icon: '🗑️',
      color: '#10b981',
      bgColor: '#e8f5e9',
      steps: [
        'Find a SmartRecycle Smart Bin near you',
        'Deposit your recyclables in the bin',
        'Get a printed receipt with unique code',
        'Go to Recycle page → Redeem Smart Bin Code',
        'Enter your code and get instant points'
      ]
    },
    {
      title: 'Waste Pickup Request',
      icon: '🚛',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      steps: [
        'Go to Recycle page → Waste Pickup Request',
        'Fill waste types and estimated weight',
        'Enter your address (auto-detect available)',
        'Select preferred date and time slot',
        'Admin approves and assigns collector',
        'Collector picks up and verifies weight',
        'Points awarded after verification'
      ]
    }
  ];

  const pointsGuide = [
    { type: 'Batteries', points: 150, icon: '🔋', color: '#ef4444' },
    { type: 'E-waste', points: 100, icon: '💻', color: '#f59e0b' },
    { type: 'Metal', points: 25, icon: '⚙️', color: '#6b7280' },
    { type: 'Plastic', points: 10, icon: '♻️', color: '#10b981' },
    { type: 'Paper', points: 8, icon: '📄', color: '#3b82f6' },
    { type: 'Textiles', points: 7, icon: '👕', color: '#8b5cf6' },
    { type: 'Glass', points: 5, icon: '🍶', color: '#06b6d4' }
  ];

  const faqCategories = [
    {
      id: 'smartbin',
      name: 'Smart Bin System',
      icon: '🗑️',
      color: '#10b981',
      questions: [
        {
          id: 1,
          question: 'What is a Smart Bin Code?',
          answer: 'When you deposit recyclables at a SmartRecycle Smart Bin, you receive a receipt with a unique code. Enter this code in the app to instantly earn points for your recycling.'
        },
        {
          id: 2,
          question: 'Where can I find Smart Bins?',
          answer: 'Smart Bins are located at various public locations including malls, parks, community centers, and shopping complexes. Check our website or app for the nearest Smart Bin location in your city.'
        },
        {
          id: 3,
          question: 'How long is the Smart Bin code valid?',
          answer: 'Smart Bin codes are valid for 7 days from the time of generation. Make sure to redeem them before expiry to claim your points.'
        },
        {
          id: 4,
          question: 'Can I use the same code multiple times?',
          answer: 'No, each Smart Bin code can only be used once. After redemption, the code becomes invalid and cannot be used again.'
        },
        {
          id: 5,
          question: 'What if I lose my Smart Bin receipt?',
          answer: 'Unfortunately, codes cannot be recovered. Please keep your receipt safe until you redeem it. Each code is unique and one-time use only.'
        }
      ]
    },
    {
      id: 'pickup',
      name: 'Waste Pickup Request',
      icon: '🚛',
      color: '#3b82f6',
      questions: [
        {
          id: 6,
          question: 'How does Waste Pickup Request work?',
          answer: 'You can request doorstep collection of your recyclables. Fill the form with waste details and address. Admin will assign a collector who will pick up and verify the weight, then points are awarded.'
        },
        {
          id: 7,
          question: 'How long does pickup take?',
          answer: 'Pickup requests are usually processed within 24-48 hours. You will be notified when a collector is assigned and when pickup is scheduled.'
        },
        {
          id: 8,
          question: 'Can I cancel a pickup request?',
          answer: 'Yes, you can cancel a pickup request as long as it is still in "Pending" status. Go to Dashboard and click "Cancel Request" on your pickup.'
        },
        {
          id: 9,
          question: 'What happens after pickup?',
          answer: 'After pickup, the collector verifies the actual weight. Admin then awards points based on the actual weight collected. You will receive a notification when points are added.'
        },
        {
          id: 10,
          question: 'Is there a minimum weight for pickup?',
          answer: 'Yes, the minimum total weight for pickup is 1 kg. You can combine multiple waste types to reach this minimum.'
        },
        {
          id: 11,
          question: 'What areas do you cover?',
          answer: 'We currently cover major cities. During pickup request, you will be notified if your location is serviceable. New areas are being added regularly.'
        }
      ]
    },
    {
      id: 'points',
      name: 'Points & Rewards',
      icon: '⭐',
      color: '#f59e0b',
      questions: [
        {
          id: 12,
          question: 'How are points calculated?',
          answer: 'Points are based on waste type and weight. E-waste: 100 pts/kg, Batteries: 150 pts/kg, Metal: 25 pts/kg, Plastic: 10 pts/kg, Paper: 8 pts/kg, Textiles: 7 pts/kg, Glass: 5 pts/kg.'
        },
        {
          id: 13,
          question: 'What rewards can I get?',
          answer: 'Redeem points for Amazon, Flipkart, Swiggy, Zomato gift cards, eco-friendly products like bamboo toothbrushes and reusable water bottles, plant trees, e-books, and more!'
        },
        {
          id: 14,
          question: 'How do I redeem my points?',
          answer: 'Go to the Rewards page, browse available rewards, click "Redeem Now" on your chosen reward, confirm your selection, and you will receive a redemption code instantly.'
        },
        {
          id: 15,
          question: 'Do points expire?',
          answer: 'Points do not expire as long as your account is active. Keep recycling and saving the planet!'
        },
        {
          id: 16,
          question: 'Can I transfer points to another user?',
          answer: 'Currently, points are non-transferable and can only be used by the account owner for redemptions.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account & Support',
      icon: '👤',
      color: '#8b5cf6',
      questions: [
        {
          id: 17,
          question: 'How do I create an account?',
          answer: 'Click on "Register" in the navbar, fill in your details, and you will get 100 welcome points instantly!'
        },
        {
          id: 18,
          question: 'How do I update my profile?',
          answer: 'Go to Dashboard and click on "Profile" or go directly to /user/profile to update your personal information.'
        },
        {
          id: 19,
          question: 'How do I change my password?',
          answer: 'Go to Profile page, click on "Change Password", enter your current password and new password, then save.'
        },
        {
          id: 20,
          question: 'What if I forget my password?',
          answer: 'Click on "Forgot Password" on the login page and follow the instructions to reset your password via email.'
        },
        {
          id: 21,
          question: 'How can I contact support?',
          answer: 'You can email us at support@smartrecycle.com or use the contact form on our website for any assistance.'
        }
      ]
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const filteredFaqs = activeCategory === 'all' 
    ? faqCategories 
    : faqCategories.filter(cat => cat.id === activeCategory);

  return (
    <div className="how-it-works">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1>How It Works 🌱</h1>
          <p className="hero-subtitle">
            Two simple ways to recycle and earn rewards
          </p>
        </div>
      </div>

      {/* Process Steps Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2>The SmartRecycle Process</h2>
            <p>Follow these simple steps to start your recycling journey</p>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
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

      {/* Two Methods Section */}
      <section className="methods-section">
        <div className="container">
          <div className="section-header">
            <h2>Two Ways to Recycle</h2>
            <p>Choose the method that works best for you</p>
          </div>

          <div className="methods-grid">
            {methods.map((method, index) => (
              <div key={index} className="method-card" style={{ borderTopColor: method.color, background: method.bgColor }}>
                <div className="method-header">
                  <span className="method-icon" style={{ background: method.color, color: 'white' }}>
                    {method.icon}
                  </span>
                  <h3>{method.title}</h3>
                </div>
                <div className="method-steps">
                  {method.steps.map((step, idx) => (
                    <div key={idx} className="method-step">
                      <span className="step-number-small">{idx + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Points Guide Section */}
      <section className="points-section">
        <div className="container">
          <div className="section-header">
            <h2>Points Guide</h2>
            <p>Earn points based on waste type and weight</p>
          </div>

          <div className="points-grid">
            {pointsGuide.map((item, index) => (
              <div key={index} className="point-card" style={{ borderLeftColor: item.color }}>
                <span className="point-icon">{item.icon}</span>
                <div className="point-info">
                  <span className="point-type">{item.type}</span>
                  <span className="point-value" style={{ color: item.color }}>{item.points} pts/kg</span>
                </div>
              </div>
            ))}
          </div>

          <div className="points-note">
            <span>💡</span>
            <p>Example: Recycling 1kg of E-waste gives you 100 points! Recycling 2kg of Batteries gives you 300 points!</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions</p>
          </div>

          <div className="faq-tabs">
            <button 
              className={`faq-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Questions
            </button>
            {faqCategories.map(cat => (
              <button 
                key={cat.id}
                className={`faq-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="faq-accordion">
            {filteredFaqs.map(category => (
              <div key={category.id} className="faq-category-group">
                {activeCategory === 'all' && (
                  <div className="category-title" style={{ borderLeftColor: category.color }}>
                    <span className="category-icon" style={{ background: `${category.color}20`, color: category.color }}>
                      {category.icon}
                    </span>
                    <h3>{category.name}</h3>
                  </div>
                )}
                <div className="faq-list">
                  {category.questions.map(faq => (
                    <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'open' : ''}`}>
                      <button 
                        className="faq-question-btn"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <span className="faq-question-icon">❓</span>
                        <span className="faq-question-text">{faq.question}</span>
                        <span className="faq-toggle-icon">{openFaq === faq.id ? '−' : '+'}</span>
                      </button>
                      <div className="faq-answer-content">
                        <div className="faq-answer-inner">
                          <span className="faq-answer-icon">💡</span>
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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