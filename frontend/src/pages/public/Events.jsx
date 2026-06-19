import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaLink, FaBookmark, FaFlag } from 'react-icons/fa';
import api from '../../services/api';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, general, mun

  useEffect(() => {
    setLoading(true);
    api.get('/api/events')
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
        setLoading(false);
      });
  }, []);

  const getFilteredEvents = () => {
    if (filterType === 'mun') {
      return events.filter(e => e.is_mun);
    }
    if (filterType === 'general') {
      return events.filter(e => !e.is_mun);
    }
    return events;
  };

  const filteredEvents = getFilteredEvents();
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">SOCIETY ACTIVITIES</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">Events & Debates</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '650px', fontSize: '1rem' }}>
            Explore and participate in our public speech debates, writing workshops, and Model United Nations conferences.
          </p>
        </div>

        {/* CONTROLS & FILTER TABS */}
        <div className="d-flex justify-content-center mb-5">
          <div className="btn-group glass-card p-1 border border-warning" role="group">
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'general', label: 'Competition' },
              { id: 'mun', label: 'MUN Division' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn py-2 px-4 rounded ${filterType === tab.id ? 'btn-warning text-dark fw-bold' : 'btn-link text-secondary text-decoration-none'}`}
                onClick={() => setFilterType(tab.id)}
              >
                {tab.id === 'mun' && <FaFlag className="me-1" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-5">
            {/* UPCOMING EVENTS */}
            <div className="col-12">
              <h3 className="display-font text-warning mb-4 d-flex align-items-center glow-text">
                <span className="p-2 bg-warning bg-opacity-10 rounded-circle me-3"><FaCalendarAlt className="text-warning fs-5" /></span>
                Upcoming Schedules ({upcomingEvents.length})
              </h3>
              {upcomingEvents.length > 0 ? (
                <div className="row g-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="col-md-6 col-lg-4">
                      <div className="card h-100 glass-card border border-warning overflow-hidden text-start">
                        <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={event.banner_url || "/images/logo.jpg"} 
                            alt={event.title} 
                            className="w-100 h-100 object-fit-cover"
                          />
                          <span className="position-absolute top-3 end-3 badge bg-dark text-warning border border-warning py-1.5 px-3">
                            {event.is_mun ? "MUN Division" : "Society Event"}
                          </span>
                        </div>
                        <div className="card-body p-4 d-flex flex-column">
                          <span className="text-warning small fw-bold mb-2">
                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <h5
                            className="card-title text-black fw-bold mb-3"
                            style={{
                              textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                            }}
                          >
                            {event.title}
                          </h5>
                          <p className="card-text text-secondary small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                            {event.description}
                          </p>
                          <div className="d-flex align-items-center text-secondary small mb-4 gap-2">
                            <FaMapMarkerAlt className="text-warning" />
                            <span>{event.location}</span>
                          </div>
                          {event.registration_url ? (
                            <a 
                              href={event.registration_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn glow-btn w-100 d-flex align-items-center justify-content-center gap-2"
                            >
                              <FaLink /> Register Online
                            </a>
                          ) : (
                            <span className="btn btn-secondary w-100 disabled">Registration Closed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 glass-card rounded-4 border border-warning" style={{ background: 'rgba(17,24,39,0.3)' }}>
                  <p className="text-secondary mb-0">No upcoming events found for this filter.</p>
                </div>
              )}
            </div>

            {/* PAST EVENTS */}
            <div className="col-12 mt-5">
              <h3 className="display-font text-secondary mb-4 d-flex align-items-center">
                <span className="p-2 bg-secondary bg-opacity-10 rounded-circle me-3"><FaBookmark className="text-secondary fs-5" /></span>
                Concluded Activities ({pastEvents.length})
              </h3>
              {pastEvents.length > 0 ? (
                <div className="row g-4">
                  {pastEvents.map(event => (
                    <div key={event.id} className="col-md-6 col-lg-4">
                      <div className="card h-100 glass-card border-secondary overflow-hidden text-start opacity-75">
                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative', filter: 'grayscale(60%)' }}>
                          <img 
                            src={event.banner_url || "/images/logo.jpg"} 
                            alt={event.title} 
                            className="w-100 h-100 object-fit-cover"
                          />
                          <span className="position-absolute top-3 end-3 badge bg-secondary text-dark py-1 px-2.5">
                            Concluded
                          </span>
                        </div>
                        <div className="card-body p-4 d-flex flex-column">
                          <span className="text-secondary small mb-1">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <h6
                            className="card-title text-black fw-bold mb-2"
                            style={{
                              textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                            }}
                          >
                            {event.title}
                          </h6>
                          <p className="card-text text-secondary small flex-grow-1" style={{ fontSize: '0.8rem' }}>
                            {event.description}
                          </p>
                          <div className="d-flex align-items-center text-secondary small gap-2">
                            <FaMapMarkerAlt />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 glass-card rounded-4" style={{ background: 'rgba(17,24,39,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-secondary mb-0">No archived history available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
