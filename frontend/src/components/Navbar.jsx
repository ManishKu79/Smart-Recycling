// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [localPoints, setLocalPoints] = useState(user?.points || 0);

  useEffect(() => {
    if (user) {
      setLocalPoints(user.points);
    }
  }, [user?.points, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      const refreshedUser = await refreshUser();
      if (refreshedUser && refreshedUser.points !== localPoints) {
        setLocalPoints(refreshedUser.points);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser, localPoints]);

  const hideNavbarPaths = ['/smartbin'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  if (shouldHideNavbar) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">♻️</span>
            <span>SmartRecycle</span>
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
            {/* ============ PUBLIC LINKS (Only show when NOT logged in) ============ */}
            {!isAuthenticated && (
              <>
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
              </>
            )}

            {/* ============ AUTHENTICATED USERS ============ */}
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
                        Rewards <span className="points-badge">{localPoints}</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/user/history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        History
                      </Link>
                    </li>
                  </>
                )}

                {/* Collector Menu */}
                {user?.role === 'collector' && (
                  <>
                    <li className="nav-item">
                      <Link to="/collector/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        My Pickups
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/collector/history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        History
                      </Link>
                    </li>
                  </>
                )}

                {/* Admin Menu */}
                {user?.role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <Link to="/admin/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/pickups" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Pickups
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/submissions" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Submissions
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/users" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Users
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/rewards" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Rewards
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin/collectors" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Collectors
                      </Link>
                    </li>
                  </>
                )}

                {/* User Name Button - shows for all logged in users */}
                <li className="nav-item user-menu">
                  <button 
                    className="nav-link user-name-btn" 
                    onClick={() => {
                      if (user?.role === 'admin') {
                        navigate('/admin/settings');
                      } else if (user?.role === 'collector') {
                        navigate('/collector/profile');
                      } else {
                        navigate('/user/profile');
                      }
                    }}
                  >
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{getFirstName(user?.fullName)}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                </li>

                {/* Logout */}
                <li className="nav-item">
                  <button className="nav-link logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              /* ============ NON-AUTHENTICATED USERS ============ */
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link btn-login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link btn-register" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;