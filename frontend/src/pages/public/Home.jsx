import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaBookOpen, FaTrophy, FaChevronRight, FaCompass, FaQuoteLeft } from 'react-icons/fa';
import api from '../../services/api';

export const Home = () => {
  const [events, setEvents] = useState([]);
  const [journals, setJournals] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Fetch data for homepage sections
    api.get('/api/events?include_past=false').then(res => setEvents(res.data.slice(0, 3))).catch(err => console.error(err));
    api.get('/api/journals').then(res => setJournals(res.data.slice(0, 3))).catch(err => console.error(err));
    api.get('/api/resources?type=News').then(res => setNews(res.data.slice(0, 3))).catch(err => console.error(err));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19' }}>
      {/* HERO SECTION */}
      <section className="hero-gradient position-relative py-5 overflow-hidden">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-start">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="d-inline-flex align-items-center mb-3 px-3 py-1.5 rounded-pill glass-card border border-warning" style={{ background: 'rgba(197,168,92,0.08)' }}>
                  <span className="text-warning small fw-bold tracking-wide">KIRORI MAL COLLEGE • DELHI UNIVERSITY</span>
                </div>
                <h1 className="display-3 fw-bold text-light mb-4" style={{ lineHeight: 1.15 }}>
                  <span className="brand-font">THE R<span style={{ color: 'var(--accent-red)' }}>O</span>UND TABLE</span> <br />
                  <span className="text-warning glow-text">Society</span>
                </h1>
                <p className="lead text-secondary mb-5" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
                  The Round Table Society of Kirori Mal College is a vibrant platform for dialogue, critical inquiry, and intellectual engagement. Committed to fostering analytical thinking, articulate expression, and collaborative problem-solving, the society bridges academic learning with real-world perspectives through meaningful discussions on contemporary issues. Guided by Dr. Prashant Shahi, The Round Table nurtures a culture of curiosity, constructive discourse, and respect for diverse viewpoints.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link to="/mun" className="btn glow-btn btn-lg d-flex align-items-center justify-content-center">
                    Explore MUN Division <FaChevronRight className="ms-2" style={{ fontSize: '0.8rem' }} />
                  </Link>
                  <Link to="/about" className="btn outline-gold-btn btn-lg d-flex align-items-center justify-content-center">
                    Our Legacy
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-5 text-center position-relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, type: 'spring' }}
                className="position-relative d-inline-block"
              >
                {/* Glowing Aura */}
                <div className="position-absolute top-50 start-50 translate-middle rounded-circle" style={{ width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(197, 168, 92, 0.2) 0%, transparent 70%)', zIndex: 0 }} />
                
                <img 
                  src="/images/logo.jpg" 
                  alt="Round Table Emblem" 
                  className="img-fluid rounded-circle shadow-lg position-relative border border-2 border-warning"
                  style={{ width: '350px', height: '350px', objectFit: 'cover', zIndex: 1, filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.5))' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-5" style={{ backgroundColor: '#090d16', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div className="row g-4 text-center">
            {[
              { num: '90+', label: 'Active Members' },
              // { num: '150+', label: 'Journals Published' },
              // { num: '25+', label: 'Debating Podiums' },
              { num: '13+', label: 'Years of Diplomacy' }
            ].map((stat, idx) => (
              <div key={idx} className="col-3 col-md-6">
                <h2 className="display-4 fw-bold text-warning mb-1 display-font glow-text">{stat.num}</h2>
                <p className="text-secondary small uppercase tracking-wider mb-0">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRODUCTION & MOTTO */}
      <section className="py-5 text-center position-relative">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <FaQuoteLeft className="text-warning fs-1 mb-4 opacity-50" />
              <h2 className="display-5 mb-4 display-font">"Dialogue Across Disciplines"</h2>
              <p className="lead text-secondary" style={{ fontStyle: 'italic', lineHeight: '1.9' }}>
                "We gather at The Round Table not as representatives of singular viewpoints, but as diplomats, writers, 
                and scholars looking to untangle the complexities of our global systems. Our forum promotes absolute equality of voice, 
                clarity of research, and a dedication to academic growth."
              </p>
              <div className="mt-4">
                <span className="fw-bold text-light">The Executive Council</span>
                <span className="d-block text-warning small">The Round Table, Kirori Mal College</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE EXECUTIVE BOARD 26-27 */}
              <div className="m-5 text-center">
                <h3 className="display-font text-warning mb-5 glow-text">The Executive Board (2026-27)</h3>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="row g-4"
                >
                  {[
                    { role: "President", name: "Vansh Srivastava", dept: "Political Science, Year III", image: "/images/VanshSrivastava.jpeg" },
                    { role: "Vice President", name: "Saanvi Duggal", dept: "English Literature, Year III", image: "/images/SaanviDuggal.jpeg" },
                    { role: "Secretary ", name: "Bhoomika Sahu", dept: "Economics, Year III", image: "/images/BhoomikaSahu.jpeg" },
                    { role: "Coordinator", name: "Prashasya Srivastava", dept: "History, Year III", image: "/images/Prashasya.jpeg" },
                    { role: "MUN Head", name: "Chaitanya Raghav", dept: "History, Year III", image: "/images/Chaitanya.jpeg" },
                    { role: "IT & Design Head", name: "Happy Kapasia", dept: "History, Year III", image: "/images/HappyKapasia.jpeg" },
                    { role: "Research & Development Head", name: "Vanshika Sharma", dept: "History, Year III", image: "/images/VanshikaSharma.jpeg" },
                    { role: "Research & Development Head", name: "Kanishka ", dept: "History, Year III", image: "/images/Kanishka.jpeg" },
                    { role: "Creatives & Promotions Head", name: "Prajanya Parihar", dept: "History, Year III", image: "/images/Prajanya.jpeg" },
                    { role: "Marketing Head", name: "Vanshika Wadhwa", dept: "History, Year II", image: "/images/VanshikaWadhwa.jpeg" },
                    { role: "Event Mangement Head", name: "Aksh Giri", dept: "History, Year III", image: "/images/AkshGiri.jpeg" },
                    { role: "Event Mangement Head", name: "Ananya Indhu Sundar", dept: "History, Year III", image: "/images/AnanyaIndhu.jpeg" },
                    { role: "Corporate handling and content head", name: "Pragati Sharma ", dept: "History, Year III", image: "/images/PragatiSharma.jpeg" }

                  ].map((member, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="col-md-3">
                      <div className="p-4 rounded-4 glass-card border border-warning text-center h-100" style={{ background: 'rgba(17, 24, 39, 0.4)' }}>
                        <img
                          src={member.image}
                          alt={member.name}
                          className="rounded-circle mb-3 border border-warning img-fluid mx-auto"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                        <h6 className="text-warning small tracking-wide uppercase fw-bold mb-1">{member.role}</h6>
                        <h5 className="text-light display-font mb-1">{member.name}</h5>
                        {/* <span className="text-secondary small d-block">{member.dept}</span> */}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

      {/* DYNAMIC INFORMATION SECTIONS (Events, News, Journals) */}
      <section className="py-5" style={{ backgroundColor: '#090d16' }}>
        <div className="container">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="row g-4"
          >
            {/* UPCOMING EVENTS COLUMN */}
            <div className="col-lg-4">
              <motion.div variants={itemVariants} className="h-100 p-4 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.5)' }}>
                <h4 className="display-font text-warning mb-4 d-flex align-items-center">
                  <FaCalendarAlt className="me-2" /> Upcoming Events
                </h4>
                {events.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {events.map((e, idx) => (
                      <div key={idx} className="p-3 rounded bg-dark border-start border-3 border-warning text-start">
                        <span className="text-warning small d-block mb-1">{new Date(e.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        <h6 className="text-light mb-1">{e.title}</h6>
                        <span className="text-secondary small d-block mb-2"><FaCompass className="me-1 text-warning" /> {e.location}</span>
                        <Link to={`/events`} className="text-warning small text-decoration-none d-flex align-items-center hover-gold">
                          Registration & Details <FaChevronRight className="ms-1" style={{ fontSize: '0.6rem' }} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-secondary">
                    <p className="mb-0">No upcoming events scheduled. Check back soon!</p>
                  </div>
                )}
                <div className="text-end mt-4">
                  <Link to="/events" className="text-warning text-decoration-none small d-flex align-items-center justify-content-end gap-1">
                    All Events <FaChevronRight style={{ fontSize: '0.6rem' }} />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* RECENT NEWS COLUMN */}
            <div className="col-lg-4">
              <motion.div variants={itemVariants} className="h-100 p-4 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.5)' }}>
                <h4 className="display-font text-warning mb-4 d-flex align-items-center">
                  <FaBookOpen className="me-2" /> News & Notices
                </h4>
                {news.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {news.map((n, idx) => (
                      <div key={idx} className="p-3 rounded bg-dark border-start border-3 border-warning text-start">
                        <span className="text-warning small d-block mb-1">{new Date(n.created_at).toLocaleDateString()}</span>
                        <h6 className="text-light mb-1">{n.title}</h6>
                        <p className="text-secondary small mb-2 line-clamp-2">{n.content}</p>
                        <Link to={`/resources`} className="text-warning small text-decoration-none d-flex align-items-center hover-gold">
                          Read Announcement <FaChevronRight className="ms-1" style={{ fontSize: '0.6rem' }} />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-secondary">
                    <p className="mb-0">No active announcements at the moment.</p>
                  </div>
                )}
                <div className="text-end mt-4">
                  <Link to="/resources" className="text-warning text-decoration-none small d-flex align-items-center justify-content-end gap-1">
                    All Announcements <FaChevronRight style={{ fontSize: '0.6rem' }} />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* FEATURED JOURNALS COLUMN */}
            <div className="col-lg-4">
              <motion.div variants={itemVariants} className="h-100 p-4 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.5)' }}>
                <h4 className="display-font text-warning mb-4 d-flex align-items-center">
                  <FaTrophy className="me-2" /> Featured Journals
                </h4>
                {journals.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {journals.map((j, idx) => (
                      <div key={idx} className="p-3 rounded bg-dark border-start border-3 border-warning text-start">
                        <span className="badge bg-warning text-dark mb-1 small">{j.category}</span>
                        <h6 className="text-light mb-1">{j.title}</h6>
                        <span className="text-secondary small d-block mb-2">By: {j.author_name}</span>
                        <a href={j.content_url} target="_blank" rel="noreferrer" className="text-warning small text-decoration-none d-flex align-items-center hover-gold">
                          Download & Read PDF <FaChevronRight className="ms-1" style={{ fontSize: '0.6rem' }} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-secondary">
                    <p className="mb-0">No approved journals available yet.</p>
                  </div>
                )}
                <div className="text-end mt-4">
                  <Link to="/journals" className="text-warning text-decoration-none small d-flex align-items-center justify-content-end gap-1">
                    Browse Journals <FaChevronRight style={{ fontSize: '0.6rem' }} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HIGHLIGHTS / GALLERY PREVIEW CALL TO ACTION */}
      {/* <section className="py-5 text-center">
        <div className="container py-4">
          <div className="p-5 rounded-4 glass-card border border-warning text-center position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(11,15,25,0.95))' }}>
            <h2 className="display-5 fw-bold text-light mb-3 display-font glow-text">Join The Round Table</h2>
            <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '650px', lineHeight: 1.7 }}>
              Are you a student of Kirori Mal College passionate about political debate, creative writing, research writing, or global affairs? 
              Get involved! Create an account today, submit your academic journals, register for mock debates, or apply to join our delegation groups.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/register" className="btn glow-btn btn-lg">Apply for Membership</Link>
              <Link to="/contact" className="btn outline-gold-btn btn-lg">Contact Secretariat</Link>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Custom Styles */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
