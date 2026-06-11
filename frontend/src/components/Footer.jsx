import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaMapMarkerAlt, FaEnvelope, FaYoutube, FaFileContract, FaPhone } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="pt-5 pb-3 mt-auto" style={{ backgroundColor: '#090d16', borderTop: '1px solid rgba(197, 168, 92, 0.2)' }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5 col-md-12">
            <h5 className="display-font text-warning mb-3 fw-bold glow-text">The Round Table</h5>
            <p className="text-secondary small" style={{ lineHeight: '1.7' }}>
              The 2025–26 session reflected The Round Table’s commitment to intellectual engagement, meaningful dialogue, and institutional growth. With a successful return to offline functioning, the society strengthened participation through discussions, simulations, events, and an Orientation Programme that welcomed and integrated new members into its vibrant community.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://www.instagram.com/kmc.trt?igsh=MW9zYWJiaHllM2o2eQ==" target='blank' className="text-secondary hover-gold fs-5 transition"><FaInstagram /></a>
              <a href="https://www.linkedin.com/school/the-round-table-society-kirori-mal-college/" target='blank' className="text-secondary hover-gold fs-5 transition"><FaLinkedin /></a>
              <a href="https://youtube.com/@theroundtable288?si=ijtLINTRnUMve2Qq" target='blank' className="text-secondary hover-gold fs-5 transition"><FaYoutube /></a>
              {/* <a href="#" target='blank' className="text-secondary hover-gold fs-5 transition"><FaTwitter /></a> */}
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="text-warning mb-3 fw-bold">Quick Navigation</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-secondary text-decoration-none hover-gold transition">Home Page</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none hover-gold transition">About the Society</Link></li>
              <li><Link to="/events" className="text-secondary text-decoration-none hover-gold transition">Events Showcase</Link></li>
              <li><Link to="/gallery" className="text-secondary text-decoration-none hover-gold transition">Media Gallery</Link></li>
              <li><Link to="/journals" className="text-secondary text-decoration-none hover-gold transition">Society Journals</Link></li>
              <li><Link to="/mun" className="text-warning text-decoration-none hover-gold transition fw-semibold">MUN Division</Link></li>
              <li><Link to="/contact" className="text-secondary text-decoration-none hover-gold transition">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h6 className="text-warning mb-3 fw-bold">Contact & Location</h6>
            <ul className="list-unstyled d-flex flex-column gap-3 small text-secondary">
              <li className="d-flex align-items-start gap-2">
                <FaMapMarkerAlt className="text-warning mt-1" />
                <span>
                  Kirori Mal College, University Enclave, <br />
                  Delhi University, New Delhi, 110007
                </span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-warning" />
                <a href="mailto:du.theroundtable@gmail.com" className="text-secondary text-decoration-none hover-gold transition">
                  du.theroundtable@gmail.com
                </a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaPhone className="text-warning" />
                <a href="#" target='blank' className="text-secondary text-decoration-none hover-gold transition">
                  +91-63882-40094
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="bg-warning my-4" style={{ opacity: 0.15 }} />
        
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <p className="text-secondary small mb-0">
            &copy; {new Date().getFullYear()} The Round Table, KMC. All Rights Reserved.
          </p>
          <p className="text-secondary small mb-0">
            Designed & Developed for Kirori Mal College, Delhi University.
          </p>
        </div>
      </div>
      
      {/* Dynamic Style for Hover Effect */}
      <style>{`
        .hover-gold:hover {
          color: var(--accent-gold) !important;
        }
        .transition {
          transition: all 0.2s ease;
        }
      `}</style>
    </footer>
  );
};
