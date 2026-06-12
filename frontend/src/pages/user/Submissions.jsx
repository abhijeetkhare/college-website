import React, { useState, useEffect } from 'react';
import { FaUpload, FaHistory, FaCheckCircle, FaExclamationCircle, FaHourglassHalf, FaExternalLinkAlt, FaBookOpen } from 'react-icons/fa';
import api from '../../services/api';

export const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMySubmissions = () => {
    setLoading(true);
    api.get('/api/journals/my-submissions')
      .then(res => {
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load submissions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Only PDF files are allowed.');
        setFile(null);
        e.target.value = null;
      } else {
        setErrorMsg('');
        setFile(selectedFile);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) {
      setErrorMsg('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('category', category);
    if (tags) formData.append('tags', tags);
    formData.append('file', file);

    try {
      await api.post('/api/journals/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMsg('Your journal has been uploaded and sent for peer evaluation!');
      setTitle('');
      setAbstract('');
      setCategory('General');
      setTags('');
      setFile(null);
      e.target.reset(); // clear file input in DOM
      setUploading(false);
      fetchMySubmissions(); // refresh history
    } catch (err) {
      setUploading(false);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit journal. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge bg-success text-light d-flex align-items-center gap-1.5"><FaCheckCircle /> Approved</span>;
      case 'Rejected':
        return <span className="badge bg-danger text-light d-flex align-items-center gap-1.5"><FaExclamationCircle /> Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark d-flex align-items-center gap-1.5"><FaHourglassHalf /> Evaluation Pending</span>;
    }
  };

  const categories = ['General', 'Politics', 'Literature', 'Economics', 'Diplomacy'];

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">EDITORIAL WORKFLOW</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">Journal Submissions</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '650px', fontSize: '1rem' }}>
            Submit your research paper or track approval timelines on your active drafts.
          </p>
        </div>

        <div className="row g-5">
          {/* UPLOAD FORM COLUMN */}
          <div className="col-lg-5 text-start">
            <div className="p-4 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.65)' }}>
              <h4 className="display-font text-warning mb-4 glow-text d-flex align-items-center gap-2">
                <FaUpload /> Submit New Paper
              </h4>

              {successMsg && (
                <div className="alert alert-success border-0 text-success bg-success bg-opacity-10 py-2.5 px-3 rounded small mb-4" role="alert">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 py-2.5 px-3 rounded small mb-4" role="alert">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label className="text-warning small fw-bold mb-1.5">Journal Title</label>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-light p-2.5"
                    placeholder="E.g. Rise of Multilateralism in Southeast Asia"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="text-warning small fw-bold mb-1.5">Abstract / Overview</label>
                  <textarea
                    className="form-control bg-dark border-secondary text-light p-2.5"
                    rows="4"
                    placeholder="Provide a concise 150-200 word summary of your thesis findings..."
                    value={abstract}
                    onChange={e => setAbstract(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="text-warning small fw-bold mb-1.5">Category</label>
                    <select
                      className="form-select bg-dark border-secondary text-light p-2.5"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="text-warning small fw-bold mb-1.5">Tags (Comma Sep)</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-light p-2.5"
                      placeholder="diplomacy, security, asean"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-warning small fw-bold mb-1.5">Select PDF Document</label>
                  <input
                    type="file"
                    className="form-control bg-dark border-secondary text-light p-2"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                  <span className="text-secondary d-block mt-1" style={{ fontSize: '0.7rem' }}>Only standard .pdf attachments accepted (Max 15MB).</span>
                </div>

                <button
                  type="submit"
                  className="btn glow-btn w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <FaUpload /> Submit for Peer Evaluation
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* HISTORICAL TIMELINE COLUMN */}
          <div className="col-lg-7 text-start">
            <div className="p-4 rounded-4 glass-card border border-warning h-100" style={{ background: 'rgba(17, 24, 39, 0.45)' }}>
              <h4 className="display-font text-warning mb-4 glow-text d-flex align-items-center gap-2">
                <FaHistory /> Submission Tracking Timeline
              </h4>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : submissions.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {submissions.map(sub => (
                    <div key={sub.id} className="p-4 rounded bg-dark bg-opacity-65 border-start border-3 border-warning">
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-dark text-warning border border-warning small">{sub.category}</span>
                          <span className="text-secondary small">{new Date(sub.created_at).toLocaleDateString()}</span>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>
                      
                      <h5 className="text-light display-font mb-2 glow-text">{sub.title}</h5>
                      <p className="text-secondary small mb-3 line-clamp-3">{sub.abstract}</p>

                      {sub.status === 'Rejected' && sub.moderator_comment && (
                        <div className="p-3 mb-3 rounded bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 small text-start">
                          <strong>Moderator Assessment / Feedback:</strong> <br />
                          {sub.moderator_comment}
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-10">
                        <span className="text-secondary small">ID: RT-JNL-{sub.id}</span>
                        <a 
                          href={sub.content_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn outline-gold-btn btn-sm d-flex align-items-center gap-1.5"
                        >
                          View PDF Draft <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-secondary">
                  <FaBookOpen className="display-4 text-warning mb-3 opacity-25" />
                  <p className="mb-0">You have not submitted any journals yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .form-control:focus, .form-select:focus {
          background-color: #111827 !important;
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 10px rgba(197, 168, 92, 0.25) !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};
