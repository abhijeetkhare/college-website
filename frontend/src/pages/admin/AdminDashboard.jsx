import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  FaChartBar, FaBook, FaCalendarCheck, FaImages, FaNewspaper, FaHistory, 
  FaTrash, FaCheck, FaTimes, FaUndo, FaPlus, FaSlidersH, FaFilePdf, FaSearch, FaUsers 
} from 'react-icons/fa';

export const AdminDashboard = () => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  // Stats
  const [stats, setStats] = useState(null);
  
  // Tab states lists
  const [pendingJournals, setPendingJournals] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [resources, setResources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recycled, setRecycled] = useState({ journals: [], events: [], gallery: [], resources: [] });
  const [archiveSettings, setArchiveSettings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState({});
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form toggles/inputs
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectJournalId, setRejectJournalId] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  // Filtering states
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');

  // Event form inputs
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventRegUrl, setEventRegUrl] = useState('');
  const [eventIsMun, setEventIsMun] = useState(false);
  const [eventFile, setEventFile] = useState(null);

  // Gallery form inputs
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState('');
  const [galFile, setGalFile] = useState(null);

  // Resource form inputs
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('News');
  const [resCategory, setResCategory] = useState('General');
  const [resContent, setResContent] = useState('');
  const [resFile, setResFile] = useState(null);

  // User direct creation inputs
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState('');

  useEffect(() => {
    fetchAnalytics();
    if (activeTab === 'journals') fetchJournals();
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'gallery') {
      fetchGallery();
      fetchGalleryCategories();
    }
    if (activeTab === 'resources') fetchResources();
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'recycle') fetchRecycled();
    if (activeTab === 'archive') fetchArchiveSettings();
    if (activeTab === 'users') fetchUsersAndRoles();
  }, [activeTab]);

  const fetchAnalytics = () => {
    api.get('/api/analytics').then(res => setStats(res.data)).catch(err => console.error(err));
  };

  const fetchJournals = () => {
    api.get('/api/journals/admin/all').then(res => {
      setAllJournals(res.data);
      setPendingJournals(res.data.filter(j => j.status === 'Pending'));
    }).catch(err => console.error(err));
  };

  const fetchEvents = () => {
    api.get('/api/events').then(res => setEvents(res.data)).catch(err => console.error(err));
  };

  const fetchGallery = () => {
    api.get('/api/gallery').then(res => setGallery(res.data)).catch(err => console.error(err));
  };

  const fetchGalleryCategories = () => {
    api.get('/api/gallery/categories')
      .then(res => {
        setGalleryCategories(res.data);
        if (res.data.length > 0 && !galCategory) {
          setGalCategory(res.data[0].name);
        }
      })
      .catch(err => console.error(err));
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(prev => ({ ...prev, 'add_category': true }));
    api.post('/api/gallery/categories', { name: newCategoryName })
      .then(() => {
        setNewCategoryName('');
        fetchGalleryCategories();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error adding category'))
      .finally(() => setLoading(prev => ({ ...prev, 'add_category': false })));
  };

  const handleDeleteCategory = (catId) => {
    if (window.confirm("Are you sure you want to delete this category? Any active photos in it will prevent deletion.")) {
      setLoading(prev => ({ ...prev, [`delete_category_${catId}`]: true }));
      api.delete(`/api/gallery/categories/${catId}`)
        .then(() => {
          fetchGalleryCategories();
        })
        .catch(err => alert(err.response?.data?.detail || 'Error deleting category'))
        .finally(() => setLoading(prev => ({ ...prev, [`delete_category_${catId}`]: false })));
    }
  };

  const fetchResources = () => {
    api.get('/api/resources').then(res => setResources(res.data)).catch(err => console.error(err));
  };

  const fetchLogs = () => {
    let url = '/api/logs';
    const params = [];
    if (logSearch) params.push(`search=${logSearch}`);
    if (logActionFilter) params.push(`action=${logActionFilter}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    api.get(url).then(res => setLogs(res.data)).catch(err => console.error(err));
  };

  const fetchRecycled = () => {
    api.get('/api/admin/recycle-bin').then(res => setRecycled(res.data)).catch(err => console.error(err));
  };

  const fetchArchiveSettings = () => {
    api.get('/api/admin/archive-settings').then(res => setArchiveSettings(res.data)).catch(err => console.error(err));
  };

  const fetchUsersAndRoles = () => {
    api.get('/api/users').then(res => setUsersList(res.data)).catch(err => console.error(err));
    api.get('/api/users/roles').then(res => {
      setRolesList(res.data);
      if (res.data.length > 0 && !newUserRoleId) {
        setNewUserRoleId(res.data[0].id);
      }
    }).catch(err => console.error(err));
  };

  // Moderation Handlers
  const handleApproveJournal = (id) => {
    setLoading(prev => ({ ...prev, [`approve_journal_${id}`]: true }));
    api.put(`/api/journals/moderate/${id}`, { status: 'Approved', moderator_comment: '' })
      .then(() => {
        fetchJournals();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, [`approve_journal_${id}`]: false })));
  };

  const handleOpenReject = (id) => {
    setRejectJournalId(id);
    setRejectionComment('');
    setShowRejectionModal(true);
  };

  const handleRejectJournal = (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, 'reject_journal': true }));
    api.put(`/api/journals/moderate/${rejectJournalId}`, { status: 'Rejected', moderator_comment: rejectionComment })
      .then(() => {
        setShowRejectionModal(false);
        fetchJournals();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, 'reject_journal': false })));
  };

  // CRUD creations
  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, 'add_event': true }));
    const fd = new FormData();
    fd.append('title', eventTitle);
    fd.append('description', eventDesc);
    fd.append('date_str', eventDate);
    fd.append('location', eventLoc);
    if (eventRegUrl) fd.append('registration_url', eventRegUrl);
    fd.append('is_mun', eventIsMun);
    fd.append('file', eventFile);

    api.post('/api/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setShowAddEvent(false);
        fetchEvents();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, 'add_event': false })));
  };

  const handleAddGallerySubmit = (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, 'add_gallery': true }));
    const fd = new FormData();
    fd.append('title', galTitle);
    fd.append('category', galCategory);
    fd.append('file', galFile);

    api.post('/api/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setShowAddGallery(false);
        fetchGallery();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, 'add_gallery': false })));
  };

  const handleAddResourceSubmit = (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, 'add_resource': true }));
    const fd = new FormData();
    fd.append('title', resTitle);
    fd.append('type', resType);
    fd.append('category', resCategory);
    if (resContent) fd.append('content', resContent);
    if (resFile) fd.append('file', resFile);

    api.post('/api/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setShowAddResource(false);
        fetchResources();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, 'add_resource': false })));
  };

  // User Direct Creation Submit
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, 'add_user': true }));
    api.post(`/api/users/admin-create?role_id=${newUserRoleId}`, {
      email: newUserEmail,
      full_name: newUserName,
      password: newUserPassword
    })
      .then(() => {
        setShowAddUser(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        fetchUsersAndRoles();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Failed to create user.'))
      .finally(() => setLoading(prev => ({ ...prev, 'add_user': false })));
  };

  const handleToggleUserActive = (userId, currentStatus) => {
    setLoading(prev => ({ ...prev, [`toggle_user_${userId}`]: true }));
    api.put(`/api/users/${userId}`, { is_active: !currentStatus })
      .then(() => fetchUsersAndRoles())
      .catch(err => alert(err.response?.data?.detail || 'Failed to update user.'))
      .finally(() => setLoading(prev => ({ ...prev, [`toggle_user_${userId}`]: false })));
  };

  const handleUpdateUserRole = (userId, roleId) => {
    setLoading(prev => ({ ...prev, [`role_user_${userId}`]: true }));
    api.put(`/api/users/${userId}`, { role_id: parseInt(roleId) })
      .then(() => fetchUsersAndRoles())
      .catch(err => alert(err.response?.data?.detail || 'Failed to update user.'))
      .finally(() => setLoading(prev => ({ ...prev, [`role_user_${userId}`]: false })));
  };

  // Soft Deletion CRUDs
  const handleSoftDelete = (type, id) => {
    setLoading(prev => ({ ...prev, [`delete_${type}_${id}`]: true }));
    let endpoint = '';
    if (type === 'journal') endpoint = `/api/journals/${id}`;
    if (type === 'event') endpoint = `/api/events/${id}`;
    if (type === 'gallery') endpoint = `/api/gallery/${id}`;
    if (type === 'resource') endpoint = `/api/resources/${id}`;

    api.delete(endpoint)
      .then(() => {
        if (type === 'journal') fetchJournals();
        if (type === 'event') fetchEvents();
        if (type === 'gallery') fetchGallery();
        if (type === 'resource') fetchResources();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, [`delete_${type}_${id}`]: false })));
  };

  // Recycle bin operations
  const handleRestoreItem = (type, id) => {
    setLoading(prev => ({ ...prev, [`restore_${type}_${id}`]: true }));
    api.put(`/api/admin/recycle-bin/restore/${type}/${id}`)
      .then(() => {
        fetchRecycled();
        fetchAnalytics();
      })
      .catch(err => alert(err.response?.data?.detail || 'Error'))
      .finally(() => setLoading(prev => ({ ...prev, [`restore_${type}_${id}`]: false })));
  };

  const handlePurgeItem = (type, id) => {
    if (window.confirm("Are you absolutely sure you want to permanently delete this item? This action is irreversible.")) {
      setLoading(prev => ({ ...prev, [`purge_${type}_${id}`]: true }));
      api.delete(`/api/admin/recycle-bin/purge/${type}/${id}`)
        .then(() => {
          fetchRecycled();
          fetchAnalytics();
        })
        .catch(err => alert(err.response?.data?.detail || 'Error'))
        .finally(() => setLoading(prev => ({ ...prev, [`purge_${type}_${id}`]: false })));
    }
  };

  // Logs management
  const handleDeleteLog = (id) => {
    api.delete(`/api/logs/${id}`)
      .then(() => fetchLogs())
      .catch(err => alert(err.response?.data?.detail || 'Error'));
  };

  const handlePurgeLogs = () => {
    if (window.confirm("Purge all logs older than 30 days?")) {
      api.post('/api/logs/purge?days=30')
        .then(() => fetchLogs())
        .catch(err => alert(err.response?.data?.detail || 'Error'));
    }
  };

  // Settings operations
  const handleUpdateArchiveSetting = (id, days) => {
    api.put(`/api/admin/archive-settings/${id}`, { duration_days: parseInt(days) })
      .then(() => fetchArchiveSettings())
      .catch(err => alert(err.response?.data?.detail || 'Error'));
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container-fluid px-lg-5">
        <div className="row g-4">
          
          {/* SIDEBAR TABS SELECTOR */}
          <div className="col-lg-3 text-start">
            <div className="p-4 rounded-4 glass-card border border-warning h-100" style={{ background: 'rgba(17, 24, 39, 0.7)' }}>
              <div className="text-center mb-4">
                <img 
                  src="/images/logo.jpg" 
                  alt="Emblem" 
                  className="rounded-circle border border-warning mb-2"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <h5 className="display-font text-warning mb-0 glow-text fw-bold">Admin Console</h5>
                <span className="text-secondary small">{user?.full_name}</span>
              </div>
              
              <div className="list-group list-group-flush gap-2">
                {[
                  { id: 'analytics', label: 'Overview Panel', icon: <FaChartBar /> },
                  { id: 'journals', label: 'Journal Review', icon: <FaBook /> },
                  { id: 'events', label: 'Manage Events', icon: <FaCalendarCheck /> },
                  { id: 'gallery', label: 'Manage Gallery', icon: <FaImages /> },
                  { id: 'resources', label: 'Manage Resources', icon: <FaNewspaper /> },
                  { id: 'users', label: 'Manage Users', icon: <FaUsers /> },
                  { id: 'logs', label: 'Activity Logs', icon: <FaHistory /> },
                  { id: 'recycle', label: 'Recycle Bin', icon: <FaTrash /> },
                  { id: 'archive', label: 'Archive Rules', icon: <FaSlidersH /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`list-group-item list-group-item-action border-0 rounded p-3 d-flex align-items-center gap-3 transition ${activeTab === tab.id ? 'bg-warning text-dark fw-bold' : 'bg-transparent text-secondary hover-gold'}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN PANEL VIEW */}
          <div className="col-lg-9 text-start">
            <div className="p-5 rounded-4 glass-card border border-warning h-100" style={{ background: 'rgba(17, 24, 39, 0.55)' }}>
              
              {/* ANALYTICS SUB-TAB */}
              {activeTab === 'analytics' && stats && (
                <div>
                  <h3 className="display-font text-warning mb-4 glow-text">Portal Operations Overview</h3>
                  <div className="row g-4 text-center">
                    {[
                      { label: "Total Members", num: stats.total_users, bg: "rgba(197, 168, 92, 0.15)", col: "warning" },
                      { label: "Pending Evaluations", num: stats.pending_journals, bg: "rgba(239, 68, 68, 0.15)", col: "danger" },
                      { label: "Society Journals", num: stats.total_journals, bg: "rgba(59, 130, 246, 0.15)", col: "primary" },
                      { label: "Active Events", num: stats.total_events, bg: "rgba(16, 185, 129, 0.15)", col: "success" },
                      { label: "Photo Gallery", num: stats.total_gallery, bg: "rgba(139, 92, 246, 0.15)", col: "info" },
                      { label: "Bulletin Items", num: stats.total_news_resources, bg: "rgba(107, 114, 128, 0.15)", col: "secondary" },
                      { label: "Archived Items", num: stats.total_archived, bg: "rgba(251, 191, 36, 0.15)", col: "warning" },
                      { label: "Recycled Drafts", num: stats.total_recycled, bg: "rgba(244, 63, 94, 0.15)", col: "danger" }
                    ].map((card, idx) => (
                      <div key={idx} className="col-6 col-md-3">
                        <div className="p-4 rounded border border-warning" style={{ background: card.bg }}>
                          <h2 className={`display-4 fw-bold text-${card.col} display-font mb-1 glow-text`}>{card.num}</h2>
                          <p className="text-secondary small mb-0">{card.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JOURNAL EVALUATION SUB-TAB */}
              {activeTab === 'journals' && (
                <div>
                  <h3 className="display-font text-warning mb-4 glow-text">Editorial Workspace</h3>
                  
                  {/* Pending Evaluations */}
                  <h5 className="text-light display-font mb-3">Pending Peer Reviews ({pendingJournals.length})</h5>
                  {pendingJournals.length > 0 ? (
                    <div className="table-responsive mb-5">
                      <table className="table table-custom">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingJournals.map(j => (
                            <tr key={j.id}>
                              <td 
                                className="text-black fw-bold"
                                style={{
                                  textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                                }}
                              >
                                {j.title}
                              </td>
                              <td>{j.author_name}</td>
                              <td>{j.category}</td>
                              <td>{new Date(j.created_at).toLocaleDateString()}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <a href={j.content_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info"><FaFilePdf /> View</a>
                                  <button className="btn btn-sm btn-success" onClick={() => handleApproveJournal(j.id)} disabled={loading[`approve_journal_${j.id}`]}>
                                    {loading[`approve_journal_${j.id}`] ? <span className="spinner-border spinner-border-sm" /> : <FaCheck />}
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleOpenReject(j.id)} disabled={loading[`approve_journal_${j.id}`]}>
                                    <FaTimes />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-secondary small mb-5">All student uploads evaluated.</p>
                  )}

                  {/* All Active Journals list */}
                  <h5 className="text-light display-font mb-3">Published Journals Catalog ({allJournals.length})</h5>
                  <div className="table-responsive">
                    <table className="table table-custom">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Author</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allJournals.map(j => (
                          <tr key={j.id}>
                            <td 
                              className="text-black fw-bold"
                              style={{
                                textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                              }}
                            >
                              {j.title}
                            </td>
                            <td>{j.author_name}</td>
                            <td>{j.category}</td>
                            <td>
                              <span className={`badge ${j.status === 'Approved' ? 'bg-success' : j.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {j.status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button className={`btn btn-sm ${j.is_archived ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => api.put(`/api/journals/archive/${j.id}`).then(() => fetchJournals())}>
                                  {j.is_archived ? 'Archived' : 'Archive'}
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleSoftDelete('journal', j.id)} disabled={loading[`delete_journal_${j.id}`]}>
                                  {loading[`delete_journal_${j.id}`] ? <span className="spinner-border spinner-border-sm" /> : <FaTrash />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* EVENTS SUB-TAB */}
              {activeTab === 'events' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="display-font text-warning mb-0 glow-text">Active Schedules</h3>
                    <button className="btn glow-btn btn-sm d-flex align-items-center gap-1.5" onClick={() => setShowAddEvent(!showAddEvent)}>
                      <FaPlus /> Add Event
                    </button>
                  </div>

                  {showAddEvent && (
                    <form onSubmit={handleAddEventSubmit} className="p-4 rounded bg-dark border border-warning mb-5">
                      <h5 className="text-warning display-font mb-3">Create Event Banner</h5>
                      <div className="mb-3">
                        <label className="text-warning small mb-1">Title</label>
                        <input type="text" className="form-control bg-dark border-secondary text-light" onChange={e => setEventTitle(e.target.value)} required />
                      </div>
                      <div className="mb-3">
                        <label className="text-warning small mb-1">Description</label>
                        <textarea className="form-control bg-dark border-secondary text-light" rows="3" onChange={e => setEventDesc(e.target.value)} required />
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="text-warning small mb-1">Date & Time</label>
                          <input type="datetime-local" className="form-control bg-dark border-secondary text-light" onChange={e => setEventDate(e.target.value)} required />
                        </div>
                        <div className="col-6">
                          <label className="text-warning small mb-1">Location</label>
                          <input type="text" className="form-control bg-dark border-secondary text-light" placeholder="Chamber room, Google Meet, etc." onChange={e => setEventLoc(e.target.value)} required />
                        </div>
                      </div>
                      <div className="row g-3 mb-3 align-items-center">
                        <div className="col-6">
                          <label className="text-warning small mb-1">External Registration URL</label>
                          <input type="url" className="form-control bg-dark border-secondary text-light" onChange={e => setEventRegUrl(e.target.value)} />
                        </div>
                        <div className="col-6 pt-3">
                          <div className="form-check">
                            <input className="form-check-input border-warning" type="checkbox" checked={eventIsMun} onChange={e => setEventIsMun(e.target.checked)} id="isMunCheck" />
                            <label className="form-check-label text-warning small" htmlFor="isMunCheck">MUN Division Event</label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-warning small mb-1">Upload Banner Image</label>
                        <input type="file" className="form-control bg-dark border-secondary text-light" onChange={e => setEventFile(e.target.files[0])} required />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn glow-btn btn-sm" disabled={loading['add_event']}>
                          {loading['add_event'] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" /> Publishing...
                            </>
                          ) : 'Publish Event'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddEvent(false)} disabled={loading['add_event']}>Cancel</button>
                      </div>
                    </form>
                  )}

                  <div className="table-responsive">
                    <table className="table table-custom">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Location</th>
                          <th>Division</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(ev => (
                          <tr key={ev.id}>
                            <td 
                              className="text-black fw-bold"
                              style={{
                                textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                              }}
                            >
                              {ev.title}
                            </td>
                            <td>{new Date(ev.date).toLocaleDateString()}</td>
                            <td>{ev.location}</td>
                            <td>
                              <span className={`badge ${ev.is_mun ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                {ev.is_mun ? 'MUN Cell' : 'General'}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-danger" onClick={() => handleSoftDelete('event', ev.id)} disabled={loading[`delete_event_${ev.id}`]}>
                                {loading[`delete_event_${ev.id}`] ? <span className="spinner-border spinner-border-sm" /> : <FaTrash />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GALLERY SUB-TAB */}
              {activeTab === 'gallery' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="display-font text-warning mb-0 glow-text">Gallery Assets</h3>
                    <button className="btn glow-btn btn-sm d-flex align-items-center gap-1.5" onClick={() => setShowAddGallery(!showAddGallery)}>
                      <FaPlus /> Add Image
                    </button>
                  </div>

                  {showAddGallery && (
                    <form onSubmit={handleAddGallerySubmit} className="p-4 rounded bg-dark border border-warning mb-5">
                      <h5 className="text-warning display-font mb-3">Upload Gallery Image</h5>
                      <div className="mb-3">
                        <label className="text-warning small mb-1">Image Title</label>
                        <input type="text" className="form-control bg-dark border-secondary text-light" onChange={e => setGalTitle(e.target.value)} required />
                      </div>
                      <div className="mb-3">
                        <label className="text-warning small mb-1">Category</label>
                        <select className="form-select bg-dark border-secondary text-light" value={galCategory} onChange={e => setGalCategory(e.target.value)} required>
                          <option value="" disabled>-- Select Section --</option>
                          {galleryCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="text-warning small mb-1">Select File</label>
                        <input type="file" className="form-control bg-dark border-secondary text-light" onChange={e => setGalFile(e.target.files[0])} required />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn glow-btn btn-sm" disabled={loading['add_gallery']}>
                          {loading['add_gallery'] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" /> Uploading...
                            </>
                          ) : 'Upload'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddGallery(false)} disabled={loading['add_gallery']}>Cancel</button>
                      </div>
                    </form>
                  )}

                  <div className="row g-3">
                    {gallery.map(item => (
                      <div key={item.id} className="col-6 col-md-3">
                        <div className="card bg-dark border border-secondary p-2 position-relative">
                          <img src={item.image_url} alt="" className="w-100 rounded" style={{ height: '120px', objectFit: 'cover' }} />
                          <h6 className="text-light mt-2 small mb-1 truncate text-center">{item.title}</h6>
                          <button className="btn btn-sm btn-danger position-absolute top-2 end-2" onClick={() => handleSoftDelete('gallery', item.id)} disabled={loading[`delete_gallery_${item.id}`]}>
                            {loading[`delete_gallery_${item.id}`] ? <span className="spinner-border spinner-border-sm" /> : <FaTrash />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Category/Section Manager */}
                  <div className="mt-5 pt-4 border-top border-secondary">
                    <h5 className="text-warning display-font mb-3">Manage Gallery Sections (Tabs)</h5>
                    <div className="row g-4">
                      {/* Add Category Form */}
                      <div className="col-md-5">
                        <form onSubmit={handleAddCategorySubmit} className="p-3 rounded bg-dark border border-secondary">
                          <label className="text-warning small mb-2 fw-bold d-block">Create New Tab</label>
                          <div className="d-flex gap-2">
                            <input 
                              type="text" 
                              className="form-control bg-dark border-secondary text-light form-control-sm" 
                              placeholder="e.g. Alumni, Orientation" 
                              value={newCategoryName} 
                              onChange={e => setNewCategoryName(e.target.value)} 
                              required 
                            />
                            <button type="submit" className="btn btn-warning btn-sm text-dark fw-bold d-flex align-items-center justify-content-center" disabled={loading['add_category']} style={{ minWidth: '60px' }}>
                              {loading['add_category'] ? <span className="spinner-border spinner-border-sm" /> : 'Add'}
                            </button>
                          </div>
                        </form>
                      </div>
                      {/* Categories List */}
                      <div className="col-md-7">
                        <div className="p-3 rounded bg-dark border border-secondary">
                          <label className="text-warning small mb-2 fw-bold d-block">Active Tabs List</label>
                          <div className="d-flex flex-wrap gap-2">
                            {galleryCategories.map(cat => (
                              <div key={cat.id} className="badge bg-secondary d-flex align-items-center gap-2 px-3 py-2 fs-6">
                                <span>{cat.name}</span>
                                <button 
                                  type="button" 
                                  className="btn btn-link text-danger p-0 border-0 hover-gold" 
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  disabled={loading[`delete_category_${cat.id}`]}
                                  style={{ fontSize: '0.8rem', lineHeight: 1 }}
                                >
                                  {loading[`delete_category_${cat.id}`] ? <span className="spinner-border spinner-border-sm" style={{ width: '0.8rem', height: '0.8rem' }} /> : <FaTimes />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RESOURCES SUB-TAB */}
              {activeTab === 'resources' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="display-font text-warning mb-0 glow-text">Announcements & Library</h3>
                    <button className="btn glow-btn btn-sm d-flex align-items-center gap-1.5" onClick={() => setShowAddResource(!showAddResource)}>
                      <FaPlus /> Add Notice
                    </button>
                  </div>

                  {showAddResource && (
                    <form onSubmit={handleAddResourceSubmit} className="p-4 rounded bg-dark border border-warning mb-5">
                      <h5 className="text-warning display-font mb-3">Publish Announcement / Resource File</h5>
                      <div className="mb-3">
                        <label className="text-warning small mb-1">Title</label>
                        <input type="text" className="form-control bg-dark border-secondary text-light" onChange={e => setResTitle(e.target.value)} required />
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="text-warning small mb-1">Type</label>
                          <select className="form-select bg-dark border-secondary text-light" value={resType} onChange={e => setResType(e.target.value)}>
                            <option value="News">Announcement</option>
                            <option value="Resource">Study Resource</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="text-warning small mb-1">Category</label>
                          <select className="form-select bg-dark border-secondary text-light" value={resCategory} onChange={e => setResCategory(e.target.value)}>
                            <option value="General">General Notice</option>
                            <option value="MUN RoP">MUN Rules of Procedure</option>
                            <option value="MUN Country Guide">MUN Country Guides</option>
                            <option value="Position Papers">Position Paper Guides</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="text-warning small mb-1">Content Details (Optional)</label>
                        <textarea className="form-control bg-dark border-secondary text-light" rows="3" onChange={e => setResContent(e.target.value)} />
                      </div>
                      <div className="mb-4">
                        <label className="text-warning small mb-1">Attach File (Optional PDF)</label>
                        <input type="file" className="form-control bg-dark border-secondary text-light" onChange={e => setResFile(e.target.files[0])} />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn glow-btn btn-sm" disabled={loading['add_resource']}>
                          {loading['add_resource'] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" /> Publishing...
                            </>
                          ) : 'Publish'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddResource(false)} disabled={loading['add_resource']}>Cancel</button>
                      </div>
                    </form>
                  )}

                  <div className="table-responsive">
                    <table className="table table-custom">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Category</th>
                          <th>Published</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map(res => (
                          <tr key={res.id}>
                            <td 
                               className="text-black fw-bold"
                               style={{
                                 textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                               }}
                             >
                               {res.title}
                             </td>
                            <td>{res.type}</td>
                            <td>{res.category}</td>
                            <td>{new Date(res.created_at).toLocaleDateString()}</td>
                            <td>
                              <button className="btn btn-sm btn-danger" onClick={() => handleSoftDelete('resource', res.id)} disabled={loading[`delete_resource_${res.id}`]}>
                                {loading[`delete_resource_${res.id}`] ? <span className="spinner-border spinner-border-sm" /> : <FaTrash />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* USER MANAGEMENT SUB-TAB */}
              {activeTab === 'users' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="display-font text-warning mb-0 glow-text">User Directory & Permissions</h3>
                    <button className="btn glow-btn btn-sm d-flex align-items-center gap-1.5" onClick={() => setShowAddUser(!showAddUser)}>
                      <FaPlus /> Add Administrator
                    </button>
                  </div>

                  {showAddUser && (
                    <form onSubmit={handleAddUserSubmit} className="p-4 rounded bg-dark border border-warning mb-5">
                      <h5 className="text-warning display-font mb-3">Create User/Admin Account</h5>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="text-warning small mb-1">Full Name</label>
                          <input type="text" className="form-control bg-dark border-secondary text-light" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                        </div>
                        <div className="col-md-6">
                          <label className="text-warning small mb-1">Email Address</label>
                          <input type="email" className="form-control bg-dark border-secondary text-light" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="text-warning small mb-1">Password</label>
                          <input type="password" className="form-control bg-dark border-secondary text-light" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
                        </div>
                        <div className="col-md-6">
                          <label className="text-warning small mb-1">Security Role</label>
                          <select className="form-select bg-dark border-secondary text-light" value={newUserRoleId} onChange={e => setNewUserRoleId(e.target.value)}>
                            {rolesList.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn glow-btn btn-sm" disabled={loading['add_user']}>
                          {loading['add_user'] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" /> Creating...
                            </>
                          ) : 'Create Account'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddUser(false)} disabled={loading['add_user']}>Cancel</button>
                      </div>
                    </form>
                  )}

                  <div className="table-responsive">
                    <table className="table table-custom">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Current Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map(u => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td 
                               className="text-black fw-bold"
                               style={{
                                 textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                               }}
                             >
                               {u.full_name}
                             </td>
                            <td>{u.email}</td>
                            <td>
                              <select 
                                className="form-select form-select-sm bg-dark border-secondary text-warning" 
                                style={{ width: '150px' }}
                                value={u.role_id}
                                onChange={e => handleUpdateUserRole(u.id, e.target.value)}
                                disabled={loading[`role_user_${u.id}`]}
                              >
                                {rolesList.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <span className={`badge ${u.is_active ? 'bg-success' : 'bg-danger'}`}>
                                {u.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-success'}`}
                                onClick={() => handleToggleUserActive(u.id, u.is_active)}
                                disabled={loading[`toggle_user_${u.id}`]}
                              >
                                {loading[`toggle_user_${u.id}`] ? <span className="spinner-border spinner-border-sm" /> : (u.is_active ? 'Disable' : 'Enable')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ACTIVITY LOGS SUB-TAB */}
              {activeTab === 'logs' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="display-font text-warning mb-0 glow-text">Portal Audit Trails</h3>
                    <button className="btn btn-sm btn-danger d-flex align-items-center gap-1.5" onClick={handlePurgeLogs}>
                      Purge History
                    </button>
                  </div>

                  {/* Logs Filter Bar */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-7">
                      <div className="d-flex glass-card p-1 border border-warning">
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 text-light px-3 py-1.5"
                          placeholder="Search logs by operator email, target ID..."
                          value={logSearch}
                          onChange={e => setLogSearch(e.target.value)}
                        />
                        <button className="btn btn-warning text-dark btn-sm px-3 fw-bold rounded" onClick={fetchLogs}>
                          <FaSearch /> Search
                        </button>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <select className="form-select bg-dark border-warning text-warning p-2" value={logActionFilter} onChange={e => { setLogActionFilter(e.target.value); }}>
                        <option value="">Filter by Action</option>
                        {['USER_LOGIN', 'SUBMIT_JOURNAL', 'MODERATE_APPROVED', 'MODERATE_REJECTED', 'CREATE_EVENT', 'SOFT_DELETE', 'RESTORE_ITEM'].map(act => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-custom small">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Operator</th>
                          <th>Action</th>
                          <th>Target</th>
                          <th>Details</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map(log => (
                          <tr key={log.id}>
                            <td>{new Date(log.created_at).toLocaleString()}</td>
                            <td className="fw-bold">{log.user_email}</td>
                            <td><span className="badge bg-secondary">{log.action}</span></td>
                            <td>{log.target_type} ({log.target_id})</td>
                            <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>{log.details}</td>
                            <td>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLog(log.id)}><FaTrash /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* RECYCLE BIN SUB-TAB */}
              {activeTab === 'recycle' && (
                <div>
                  <h3 className="display-font text-warning mb-4 glow-text">Recycle Bin Workspace</h3>
                  <p className="text-secondary small mb-4">
                    Soft-deleted records are preserved in the database for 15 days before automatic permanent deletion. 
                    Restoring an item reactivates its display on public lists. Enforces Super Admin restriction for permanent purging.
                  </p>

                  {/* Render Categories */}
                  {['journals', 'events', 'gallery', 'resources'].map(categoryKey => {
                    const list = recycled[categoryKey] || [];
                    if (list.length === 0) return null;
                    return (
                      <div key={categoryKey} className="mb-5">
                        <h5 className="text-warning display-font mb-3 uppercase tracking-wider">{categoryKey} ({list.length})</h5>
                        <div className="table-responsive">
                          <table className="table table-custom">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Deleted Date</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {list.map(item => (
                                <tr key={item.id}>
                                  <td 
                                    className="text-black fw-bold"
                                    style={{
                                      textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                                    }}
                                  >
                                    {item.title}
                                  </td>
                                  <td>{new Date(item.deleted_at).toLocaleDateString()}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button className="btn btn-sm btn-success" onClick={() => handleRestoreItem(categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1), item.id)} disabled={loading[`restore_${categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1)}_${item.id}`] || loading[`purge_${categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1)}_${item.id}`]}>
                                        {loading[`restore_${categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1)}_${item.id}`] ? <span className="spinner-border spinner-border-sm" /> : <><FaUndo className="me-1" /> Restore</>}
                                      </button>
                                      <button className="btn btn-sm btn-danger" onClick={() => handlePurgeItem(categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1), item.id)} disabled={loading[`restore_${categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1)}_${item.id}`] || loading[`purge_${categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1)}_${item.id}`]}>
                                        {loading[`purge_${categoryKey === 'gallery' ? 'gallery' : categoryKey.slice(0, -1)}_${item.id}`] ? <span className="spinner-border spinner-border-sm" /> : 'Purge'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                  
                  {recycled.journals.length === 0 && recycled.events.length === 0 && recycled.gallery.length === 0 && recycled.resources.length === 0 && (
                    <div className="text-center py-5 text-secondary">
                      <p className="mb-0">Recycle Bin is currently empty.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ARCHIVE SETTINGS SUB-TAB */}
              {activeTab === 'archive' && (
                <div>
                  <h3 className="display-font text-warning mb-4 glow-text">Auto-Archive Configurations</h3>
                  <p className="text-secondary small mb-4">
                    Modify active age durations (in days) after which approved papers and gallery uploads automatically archive. 
                    Set a category's duration to 0 to disable automated archiving for that segment.
                  </p>

                  <div className="row g-4">
                    {archiveSettings.map(sett => (
                      <div key={sett.id} className="col-md-6 col-lg-4 text-start">
                        <div className="p-4 rounded border border-warning bg-dark">
                          <h5 className="text-warning display-font uppercase glow-text mb-3">{sett.category}</h5>
                          <div className="mb-3">
                            <label className="text-secondary small mb-1">Archive Duration Days</label>
                            <input
                              type="number"
                              className="form-control bg-dark border-secondary text-light p-2"
                              defaultValue={sett.duration_days}
                              onBlur={e => handleUpdateArchiveSetting(sett.id, e.target.value)}
                            />
                          </div>
                          <span className="text-secondary small d-block" style={{ fontSize: '0.7rem' }}>Click away (unfocus) to save settings updates automatically.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {showRejectionModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
          <div className="p-4 rounded-4 glass-card border border-danger text-start" onClick={e => e.stopPropagation()} style={{ width: '450px', background: '#111827' }}>
            <h4 className="display-font text-danger mb-3 glow-text">Reject Submissions</h4>
            <form onSubmit={handleRejectJournal}>
              <div className="mb-4">
                <label className="text-secondary small mb-1.5">Provide feedback reason for author rejection...</label>
                <textarea
                  className="form-control bg-dark border-secondary text-light"
                  rows="4"
                  onChange={e => setRejectionComment(e.target.value)}
                  value={rejectionComment}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-danger btn-sm" disabled={loading['reject_journal']}>
                  {loading['reject_journal'] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" /> Rejecting...
                    </>
                  ) : 'Reject Submission'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRejectionModal(false)} disabled={loading['reject_journal']}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
