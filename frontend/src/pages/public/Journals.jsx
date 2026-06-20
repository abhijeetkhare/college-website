import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBook, FaPlus, FaExternalLinkAlt, FaTag } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Journals = () => {
  const { token } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Research Paper');

  useEffect(() => {
    fetchJournals();
  }, [activeTab]);

  const fetchJournals = () => {
    setLoading(true);
    let url = '/api/journals';
    const params = [];
    params.push(`category=${activeTab}`);
    if (search) params.push(`search=${search}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    api.get(url)
      .then(res => {
        setJournals(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load journals:", err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJournals();
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">ACADEMIC ARCHIVES</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">Research & Publication</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '650px', fontSize: '1rem' }}>
            Browse through approved student research papers and analytical articles compiled by our members.
          </p>
        </div>

        {/* SUB-TABS FOR PAPERS & ARTICLES */}
        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group glass-card p-1 border border-warning" role="group">
            {[
              { id: 'Research Paper', label: 'Research Papers' },
              { id: 'Research Article', label: 'Research Articles' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn py-2 px-4 rounded ${activeTab === tab.id ? 'btn-warning text-dark fw-bold' : 'btn-link text-secondary text-decoration-none'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="row g-3 justify-content-center mb-5">
          <div className="col-lg-6">
            <form onSubmit={handleSearchSubmit} className="d-flex glass-card p-1 border border-warning">
              <input
                type="text"
                className="form-control bg-transparent border-0 text-light px-3 py-2"
                placeholder={`Search within ${activeTab}s...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-warning text-dark px-4 d-flex align-items-center gap-2 fw-bold rounded">
                <FaSearch /> Search
              </button>
            </form>
          </div>
        </div>

        {/* SUBMISSION CALLOUT */}
        <div className="p-4 rounded-4 glass-card border border-warning text-start mb-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4" style={{ background: 'rgba(197, 168, 92, 0.05)' }}>
          <div>
            <h5 className="text-warning display-font mb-1 glow-text">Submit Your Work</h5>
            <p className="text-secondary small mb-0" style={{ maxWidth: '750px' }}>
              We encourage all Delhi University students to submit high-quality research papers and articles. 
              Submissions undergo standard peer evaluation by our editorial board. Uploads must be in PDF format.
            </p>
          </div>
          {token ? (
            <Link to="/submissions" className="btn glow-btn d-flex align-items-center gap-2 text-nowrap">
              <FaPlus /> Submit Work
            </Link>
          ) : (
            <Link to="/login" className="btn outline-gold-btn d-flex align-items-center gap-2 text-nowrap">
              Login to Submit
            </Link>
          )}
        </div>

        {/* JOURNALS LISTING */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : journals.length > 0 ? (
          <div className="row g-4">
            {journals.map(journal => (
              <div key={journal.id} className="col-lg-6 text-start">
                <div className="card h-100 glass-card border border-warning p-4 d-flex flex-column justify-content-between" style={{ background: 'rgba(17,24,39,0.45)' }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <span className="badge bg-warning text-dark small py-1.5 px-3 fw-bold">{journal.category}</span>
                      <span className="text-secondary small">{new Date(journal.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-light display-font mb-3 glow-text">{journal.title}</h4>
                    <p className="text-secondary small mb-4 line-clamp-4" style={{ lineHeight: '1.7' }}>
                      {journal.abstract}
                    </p>
                  </div>
                  <div>
                    <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-25">
                      <div>
                        <span className="text-secondary small d-block">Author</span>
                        <span className="text-light fw-bold small">{journal.author_name}</span>
                      </div>
                      <a
                        href={journal.content_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn outline-gold-btn py-1.5 px-3 d-flex align-items-center gap-2 small"
                      >
                        Read Document <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                      </a>
                    </div>
                    {journal.tags && (
                      <div className="mt-3 d-flex align-items-center flex-wrap gap-1.5 text-secondary small">
                        <FaTag className="text-warning me-1" />
                        {journal.tags.split(',').map((t, idx) => (
                          <span key={idx} className="bg-dark px-2 py-0.5 rounded text-secondary" style={{ fontSize: '0.75rem' }}>{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 glass-card rounded-4 border border-warning" style={{ background: 'rgba(17,24,39,0.3)' }}>
            <FaBook className="text-secondary fs-1 mb-3 opacity-50" />
            <p className="text-secondary mb-0">No approved {activeTab}s match the search query.</p>
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
