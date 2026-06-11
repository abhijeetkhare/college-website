import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setLoading(false);
      navigate(from, { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
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
                <h3 className="display-font text-warning fw-bold mb-1 glow-text">Welcome Back</h3>
                <span className="text-secondary small">Login to access The Round Table portal</span>
              </div>

              {error && (
                <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 py-2.5 px-3 rounded small mb-4" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
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
                    placeholder="Enter password"
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
                      <FaSignInAlt /> Login Securely
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-top border-secondary border-opacity-20 text-secondary small">
                <span>Don't have an account? </span>
                <Link to="/register" className="text-warning text-decoration-none fw-semibold">Sign Up</Link>
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
