import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaPenNib, FaClock, FaUniversity, FaPhone } from 'react-icons/fa';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subj, setSubj] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('Thank you for reaching out! The Round Table Secretariat will review your query and respond shortly.');
    setName('');
    setEmail('');
    setSubj('');
    setMsg('');
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container">
        
        {/* HEADER */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">CONNECT WITH US</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">Contact The Secretariat</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '650px', fontSize: '1rem' }}>
            Have a question, collaboration proposal, or feedback? Reach out to the executive committee of The Round Table.
          </p>
        </div>

        <div className="row g-5 text-start">
          {/* Glassmorphic Contact Form */}
          <div className="col-lg-7">
            <div className="p-5 rounded-4 glass-card border border-warning h-100" style={{ background: 'rgba(17, 24, 39, 0.65)' }}>
              <h4 className="display-font text-warning mb-4 glow-text d-flex align-items-center gap-2">
                <FaPenNib /> Send us a Message
              </h4>

              {success && (
                <div className="alert alert-success border-0 text-success bg-success bg-opacity-10 py-2.5 px-3 rounded small mb-4" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="text-warning small fw-bold mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-light p-2.5" 
                      placeholder="John Doe" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="text-warning small fw-bold mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control bg-dark border-secondary text-light p-2.5" 
                      placeholder="name@college.edu" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="text-warning small fw-bold mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark border-secondary text-light p-2.5" 
                    placeholder="E.g. Collaboration, MUN delegate query..." 
                    value={subj}
                    onChange={e => setSubj(e.target.value)}
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label className="text-warning small fw-bold mb-1.5">Message Body</label>
                  <textarea 
                    className="form-control bg-dark border-secondary text-light p-2.5" 
                    rows="6" 
                    placeholder="Describe your query in detail..." 
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    required 
                  />
                </div>

                <button type="submit" className="btn glow-btn px-4 py-2.5 d-flex align-items-center gap-2">
                  <FaPaperPlane /> Send Query
                </button>
              </form>
            </div>
          </div>

          {/* Contact coordinates & timings */}
          <div className="col-lg-5">
            <div className="p-5 rounded-4 glass-card border border-warning h-100 d-flex flex-column justify-content-between" style={{ background: 'rgba(17, 24, 39, 0.45)' }}>
              <div>
                <h4 className="display-font text-warning mb-4 glow-text">Official Headquarters</h4>
                <p className="text-secondary small mb-4" style={{ lineHeight: '1.7' }}>
                  The Round Table conducts all administrative correspondence from its dedicated chamber block at Kirori Mal College, Delhi University.
                </p>

                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-start gap-3">
                    <FaPhone className="text-warning fs-5 mt-1" />
                    <div>
                      <h6 className="text-light mb-0 fw-bold">Phone Number</h6>
                      <span className="text-secondary small d-block">
                        +91-63882-40094
                      </span>
                      <span className="text-secondary small d-block">
                        +91-96742-64121
                      </span>
                      <span className="text-secondary small d-block">
                        +91-62070-82264
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <FaEnvelope className="text-warning fs-5 mt-1" />
                    <div>
                      <h6 className="text-light mb-0 fw-bold">Email Communications</h6>
                      <a href="mailto:du.theroundtable@gmail.com" className="text-warning text-decoration-none small hover-gold">
                        du.theroundtable@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <FaClock className="text-warning fs-5 mt-1" />
                    <div>
                      <h6 className="text-light mb-0 fw-bold">Office Hours</h6>
                      <span className="text-secondary small d-block">
                        Monday – Friday (Working College Days)<br />
                        01:00 PM – 02:00 PM (LUNCH BREAK)<br />
                        04:00 PM – 05:00 PM (AFTER CLASS)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-top border-secondary border-opacity-10 d-flex align-items-center gap-3">
                <FaUniversity className="text-warning display-font fs-3" />
                <div>
                  <span className="text-secondary small d-block">Delhi University Registration</span>
                  <span className="text-light fw-bold small">Enrolment Reg ID: KMC/SOC/RT-2012/04</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

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
