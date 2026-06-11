import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaFlag, FaFilePdf, FaAward, FaCalendarAlt, FaUserTie, FaChevronRight, FaUniversity } from 'react-icons/fa';
import api from '../../services/api';

export const MUNPage = () => {
  const [guides, setGuides] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch MUN Resources & MUN Events
    api.get('/api/resources')
      .then(res => {
        // Filter for MUN-related resources
        const munResources = res.data.filter(r => r.category.startsWith('MUN'));
        setGuides(munResources);
      })
      .catch(err => console.error(err));

    api.get('/api/events?is_mun=true')
      .then(res => {
        setEvents(res.data.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

  const committees = [
    {
      acronym: "UNSC",
      name: "United Nations Security Council",
      agenda: "Maintaining international peace and security; addressing escalating border crises.",
      level: "Advanced",
      delegates: "30 Delegates"
    },
    {
      acronym: "DISEC",
      name: "Disarmament & International Security Committee",
      agenda: "Preventing weaponization of outer space and proliferation of automated cyber warfare.",
      level: "Intermediate",
      delegates: "50 Delegates"
    },
    {
      acronym: "UNHCR",
      name: "United Nations High Commissioner for Refugees",
      agenda: "Formulating legal frameworks for protecting climate-induced displaced refugees.",
      level: "Beginner Friendly",
      delegates: "60 Delegates"
    },
    {
      acronym: "AIPPM",
      name: "All India Political Parties Meet",
      agenda: "Evaluating federalism, administrative reforms, and electoral security in emerging sectors.",
      level: "Bilingual (Hindi/English)",
      delegates: "45 Delegates"
    }
  ];

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      {/* HERO SECTION */}
      <section className="container mb-5 text-start">
        <div className="p-5 rounded-4 glass-card border border-warning position-relative overflow-hidden" style={{ background: 'radial-gradient(circle at top right, rgba(197, 168, 92, 0.15), transparent 70%), rgba(17,24,39,0.7)' }}>
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div className="d-inline-flex align-items-center mb-3 px-3 py-1.5 rounded-pill glass-card border border-warning" style={{ background: 'rgba(197,168,92,0.08)' }}>
                <FaFlag className="text-warning me-2" />
                <span className="text-warning small fw-bold tracking-wider">THE ROUND TABLE DIPLOMATIC CELL</span>
              </div>
              <h1 className="display-4 fw-bold display-font text-light mb-3 glow-text">Model United Nations Division</h1>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                The Model United Nations (MUN) Division of **The Round Table** is Kirori Mal College's flagship diplomatic simulation cell. 
                We train DU students in standard foreign policy research, public speaking, multilateral negotiation, and UN Rules of Procedure (RoP).
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#committees" className="btn glow-btn">Show Committees</a>
                <a href="#resources" className="btn outline-gold-btn">Download Country Guides</a>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <FaUniversity className="text-warning display-1 opacity-25 glow-text" style={{ fontSize: '10rem' }} />
            </div>
          </div>
        </div>
      </section>

      {/* COMMITTEES MATRIX */}
      <section id="committees" className="container my-5 py-3">
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">CONFERENCE MATRIX</span>
          <h2 className="display-5 display-font text-light mt-1">Featured Committees</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Deliberate in our specialized chambers simulated during society sessions and the annual **KMC MUN** conference.
          </p>
        </div>

        <div className="row g-4 text-start">
          {committees.map((com, idx) => (
            <div key={idx} className="col-md-6">
              <div className="p-4 rounded-4 glass-card border border-warning h-100 d-flex flex-column justify-content-between" style={{ background: 'rgba(17, 24, 39, 0.45)' }}>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="display-font text-warning mb-0 glow-text fw-bold">{com.acronym}</h3>
                    <span className="badge bg-warning text-dark px-3 py-1 rounded small fw-bold">{com.level}</span>
                  </div>
                  <h5 className="text-light display-font mb-2">{com.name}</h5>
                  <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>
                    <strong>Agenda:</strong> {com.agenda}
                  </p>
                </div>
                <div className="pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center text-secondary small">
                  <span className="d-flex align-items-center gap-1.5"><FaUserTie className="text-warning" /> {com.delegates}</span>
                  <span className="text-warning">Rules: UNA-USA / High School</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MUN RESOURCES & GUIDES DOWNLOAD */}
      <section id="resources" className="container my-5 py-3">
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">DELEGATE PREPARATION</span>
          <h2 className="display-5 display-font text-light mt-1">Diplomatic Study Resources</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Download Rules of Procedure, Country Study Guides, and Position Paper templates written by our Executive Secretariat.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8 text-start">
            <div className="p-4 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.4)' }}>
              <h5 className="text-warning display-font mb-4 glow-text d-flex align-items-center gap-2">
                <FaFilePdf /> Secretariat Library
              </h5>
              {guides.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {guides.map(guide => (
                    <div key={guide.id} className="p-3 rounded bg-dark border-start border-3 border-warning d-flex justify-content-between align-items-center gap-3">
                      <div>
                        <span className="badge bg-warning text-dark mb-1 small">{guide.category}</span>
                        <h6 className="text-light mb-1">{guide.title}</h6>
                        <p className="text-secondary small mb-0 line-clamp-1">{guide.content}</p>
                      </div>
                      <a
                        href={guide.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn outline-gold-btn d-flex align-items-center gap-2 small py-1.5"
                      >
                        Download PDF
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-secondary">
                  <p className="mb-0">No MUN resources posted yet. Contact the Secretariat for delegate files.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MUN DEBATE EVENTS CALLOUT */}
      <section className="container mt-5 py-3">
        <div className="p-4 rounded-4 glass-card border border-warning text-center" style={{ background: 'rgba(197, 168, 92, 0.05)' }}>
          <h3 className="display-font text-warning glow-text mb-3">Model United Nations Conferences</h3>
          {events.length > 0 ? (
            <div className="row g-4 text-start justify-content-center mt-2">
              {events.map(ev => (
                <div key={ev.id} className="col-md-5">
                  <div className="p-3 rounded bg-dark border border-warning">
                    <span className="text-warning small d-block mb-1">{new Date(ev.date).toLocaleDateString()}</span>
                    <h6 className="text-light mb-2">{ev.title}</h6>
                    <p className="text-secondary small mb-3">{ev.description}</p>
                    {ev.registration_url && (
                      <a href={ev.registration_url} target="_blank" rel="noreferrer" className="btn glow-btn btn-sm d-inline-flex align-items-center gap-1">
                        Register Now <FaChevronRight style={{ fontSize: '0.65rem' }} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary mb-0">No active conference schedules at this moment. Monthly mock debate registrations open soon.</p>
          )}
        </div>
      </section>

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
