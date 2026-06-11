import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

export const Register = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call AuthContext Register API
      await register(email, fullName, password);
      // 2. Perform Auto-Login upon success
      await login(email, password);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Registration failed. Email address may already be in use.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ backgroundColor: '#0b0f19', minHeight: '85vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 text-start">
            <div className="p-5 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.75)' }}>
              <div className="text-center mb-4">
                <img 
                  src="/images/logo.jpg" 
                  alt="Emblem" 
                  className="rounded-circle border border-warning mb-3"
                  style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                />
                <h3 className="display-font text-warning fw-bold mb-1 glow-text">Join The Table</h3>
                <span className="text-secondary small">Register to upload papers and join events</span>
              </div>

              {error && (
                <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 py-2.5 px-3 rounded small mb-4" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="text-warning small fw-bold mb-1.5 d-flex align-items-center gap-1.5">
                    <FaUser /> Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-light p-2.5"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="text-warning small fw-bold mb-1.5 d-flex align-items-center gap-1.5">
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control bg-dark border-secondary text-light p-2.5"
                    placeholder="name@society.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="text-warning small fw-bold mb-1.5 d-flex align-items-center gap-1.5">
                    <FaLock /> Password
                  </label>
                  <input
                    type="password"
                    className="form-control bg-dark border-secondary text-light p-2.5"
                    placeholder="Create secure password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn glow-btn w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 mb-4"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <FaUserPlus /> Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-top border-secondary border-opacity-20 text-secondary small">
                <span>Already have an account? </span>
                <Link to="/login" className="text-warning text-decoration-none fw-semibold">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom focus styles */}
      <style>{`
        .form-control:focus {
          background-color: #111827 !important;
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 10px rgba(197, 168, 92, 0.25) !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};
