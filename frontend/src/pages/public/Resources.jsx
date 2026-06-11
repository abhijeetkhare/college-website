import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaNewspaper, FaBookmark, FaEnvelopeOpenText } from 'react-icons/fa';
import api from '../../services/api';

export const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All'); // All, News, Resource

  useEffect(() => {
    setLoading(true);
    api.get('/api/resources')
      .then(res => {
        setResources(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load news/resources:", err);
        setLoading(false);
      });
  }, []);

  const filteredResources = filterType === 'All'
    ? resources
    : resources.filter(r => r.type.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">BULLETINS & STUDY AIDS</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">News & Resources</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '650px', fontSize: '1rem' }}>
            Access our society's latest announcements, notices, and downloadable study guides.
          </p>
        </div>

        {/* TABS FILTER */}
        <div className="d-flex justify-content-center mb-5">
          <div className="btn-group glass-card p-1 border border-warning" role="group">
            {[
              { id: 'All', label: 'All Items' },
              { id: 'News', label: 'Announcements' },
              { id: 'Resource', label: 'Study Resources' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn py-2 px-4 rounded ${filterType === tab.id ? 'btn-warning text-dark fw-bold' : 'btn-link text-secondary text-decoration-none'}`}
                onClick={() => setFilterType(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS LIST */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="row g-4 justify-content-center text-start">
            {filteredResources.map(item => (
              <div key={item.id} className="col-lg-8">
                <div className="p-4 rounded-4 glass-card border border-warning d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4" style={{ background: 'rgba(17,24,39,0.45)' }}>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className={`badge ${item.type === 'News' ? 'bg-danger text-light' : 'bg-warning text-dark'} small fw-bold`}>
                        {item.type === 'News' ? 'Announcement' : 'Study Resource'}
                      </span>
                      <span className="badge bg-dark text-warning small">{item.category}</span>
                      <span className="text-secondary small ms-2">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-light display-font mb-2 glow-text">{item.title}</h5>
                    {item.content && (
                      <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                        {item.content}
                      </p>
                    )}
                  </div>
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn glow-btn btn-sm d-flex align-items-center gap-1 text-nowrap py-2 px-3 align-self-start align-self-md-center"
                    >
                      <FaFilePdf /> View File
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 glass-card rounded-4 border border-warning mx-auto" style={{ background: 'rgba(17,24,39,0.3)', maxWidth: '650px' }}>
            <FaEnvelopeOpenText className="text-secondary fs-1 mb-3 opacity-50" />
            <p className="text-secondary mb-0">No active bulletins posted in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
