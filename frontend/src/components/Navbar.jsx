// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">♻️</span>
            <span className="logo-text">SmartRecycle</span>
          </Link>
        </div>

        <button 
          className="navbar-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="toggle-icon">☰</span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            {/* Public Links */}
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            
            <li className="nav-item">
              <Link to="/how-it-works" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                How It Works
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {/* User Menu */}
                {user?.role === 'user' && (
                  <>
                    <li className="nav-item">
                      <Link to="/user/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/user/recycle" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Recycle
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/user/rewards" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Rewards <span className="points-badge">{user.points || 0}</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/user/history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        History
                      </Link>
                    </li>
                  </>
                )}

                {/* Admin Menu */}
                {user?.role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <Link to="/admin/dashboard" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/submissions" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                        Submissions
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/users" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                        Users
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/rewards" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                        Rewards
                      </Link>
                    </li>
                  </>
                )}

                {/* User Profile & Logout */}
                <li className="nav-item user-menu">
                  <Link to={user?.role === 'admin' ? '/admin/settings' : '/user/profile'} 
                        className="nav-link profile-link" 
                        onClick={() => setIsMenuOpen(false)}>
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user?.fullName?.split(' ')[0]}</span>
                  </Link>
                  <button 
                    className="nav-link logout-btn" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="nav-link btn-login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;