import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', backgroundColor: '#0b0f19' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ backgroundColor: '#0b0f19', minHeight: '85vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 text-start">
            <div className="p-5 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.75)' }}>
              <div className="text-center mb-5">
                <FaUserCircle className="text-warning display-1 mb-3 glow-text" />
                <h3 className="display-font text-light fw-bold mb-1">{user.full_name}</h3>
                <span className="badge bg-warning text-dark uppercase tracking-wider px-3 py-1.5 fw-bold rounded-pill">{user.role_name}</span>
              </div>

              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                  <FaEnvelope className="text-warning fs-5 mt-1" />
                  <div>
                    <span className="text-secondary small d-block">Registered Email Address</span>
                    <span className="text-light fw-bold">{user.email}</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                  <FaShieldAlt className="text-warning fs-5 mt-1" />
                  <div>
                    <span className="text-secondary small d-block">Security Authorization Role</span>
                    <span className="text-light fw-bold">{user.role_name}</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 p-3 rounded bg-dark bg-opacity-40 border border-secondary border-opacity-10">
                  <FaCalendarAlt className="text-warning fs-5 mt-1" />
                  <div>
                    <span className="text-secondary small d-block">Membership Joined Date</span>
                    <span className="text-light fw-bold">
                      {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
