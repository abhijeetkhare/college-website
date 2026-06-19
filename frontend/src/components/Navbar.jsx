import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaBook, FaCalendarAlt, FaImages, FaUsers, FaNewspaper, FaFlag, FaChartLine } from 'react-icons/fa';

export const Navbar = () => {
  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeNavbar = (e) => {
    if (e.target.classList.contains('dropdown-toggle')) {
      return;
    }
    const collapseEl = document.getElementById('navbarNav');
    if (collapseEl && collapseEl.classList.contains('show')) {
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) {
        toggler.click();
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(197, 168, 92, 0.2)' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src="/images/logo.jpg" 
            alt="The Round Table Logo" 
            className="rounded-circle me-2 border border-warning"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div>
            <span className="fw-bold glow-text text-light brand-font" style={{ fontSize: '1.25rem' }}>
              THE R<span style={{ color: 'var(--accent-red)' }}>O</span>UND TABLE
            </span>
            <span className="d-block text-secondary" style={{ fontSize: '0.65rem', trackingSpacing: '1px' }}>KMC, DELHI UNIVERSITY</span>
          </div>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav" onClick={closeNavbar}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/events">Events</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/gallery">Gallery</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/journals">Journals</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3 text-warning fw-semibold d-flex align-items-center" to="/mun">
                <FaFlag className="me-1 text-warning" /> MUN
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/resources">News & Resources</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/contact">Contact Us</Link>
            </li>

            {token ? (
              <li className="nav-item dropdown ms-lg-3 mt-2 mt-lg-0">
                <a className="nav-link dropdown-toggle btn outline-gold-btn d-flex align-items-center py-2 px-3 text-light" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <FaUserCircle className="me-2 text-warning fs-5" />
                  {user ? user.full_name.split(' ')[0] : 'Profile'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark glass-card mt-2 p-2 border-warning" aria-labelledby="navbarDropdown" style={{ backgroundColor: '#111827' }}>
                  {isAdmin() && (
                    <li>
                      <Link className="dropdown-item rounded py-2 d-flex align-items-center text-warning" to="/admin">
                        <FaChartLine className="me-2" /> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item rounded py-2 d-flex align-items-center text-light" to="/profile">
                      <FaUserCircle className="me-2 text-warning" /> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item rounded py-2 d-flex align-items-center text-light" to="/submissions">
                      <FaBook className="me-2 text-warning" /> My Submissions
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider bg-warning" style={{ opacity: 0.2 }} /></li>
                  <li>
                    <button className="dropdown-item text-danger rounded py-2" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <div className="d-flex flex-column flex-lg-row ms-lg-3 gap-2 mt-3 mt-lg-0">
                <Link className="btn outline-gold-btn text-warning py-1.5 px-3" to="/login">Login</Link>
                <Link className="btn glow-btn py-1.5 px-3" to="/register">Sign Up</Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
