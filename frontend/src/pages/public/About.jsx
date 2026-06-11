import React from 'react';
import { motion } from 'framer-motion';
import { FaBookmark, FaQuoteLeft, FaGraduationCap, FaAward, FaCalendarCheck } from 'react-icons/fa';

export const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19' }}>
      <div className="container">
        {/* HEADER SECTION */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">ESTABLISHED 2012</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">Our Legacy & History</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '750px', fontSize: '1.1rem' }}>
            Delve into the history of The Round Table, the premium academic, literary, and debating forum of Kirori Mal College, Delhi University.
          </p>
        </div>

        {/* INTRODUCTION & PRINCIPALS */}
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <h2 className="display-font text-warning mb-4 glow-text">The Ideal of Equality & Exchange</h2>
            <p className="text-secondary" style={{ lineHeight: '1.8' }}>
              Named after the legendary Arthurian table where all knights sat as absolute equals without hierarchy, 
              <strong>The Round Table</strong> at Kirori Mal College was created to challenge typical college club structures. 
              Here, first-year recruits and final-year advisors debate on equal footing, judged solely on research accuracy, 
              diplomatic tact, and writing eloquence.
            </p>
            <p className="text-secondary" style={{ lineHeight: '1.8' }}>
              Over the last decade, we have grown from a tight-knit debating circle into a powerhouse society housing 
              national-level quiz winners, literary authors, academic journal publishers, and an independent Model United Nations division 
              renowned across Delhi University.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="p-4 rounded-4 glass-card border border-warning" style={{ background: 'rgba(17, 24, 39, 0.4)' }}>
              <FaQuoteLeft className="text-warning fs-3 mb-3 opacity-50" />
              <p className="text-light fs-5" style={{ fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                "The Round Table is not just a society; it is a mindset. It is the belief that critical dialogue, constructive debate, 
                and rigorous research can change perspective and build leadership."
              </p>
              <div className="d-flex align-items-center mt-3 gap-3">
                <img 
                  src="/images/logo.jpg" 
                  alt="Faculty Coordinator placeholder" 
                  className="rounded-circle border border-warning"
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="text-light mb-0 fw-bold">Dr. Sanjay Kumar</h6>
                  <span className="text-warning small d-block">Faculty Convenor, Kirori Mal College</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIETY STRATEGY & MISSION */}
        <div className="row g-4 mb-5 text-center">
          {[
            { icon: <FaBookmark className="text-warning fs-3" />, title: "Intellectual Rigor", text: "Providing standard training in diplomatic writing, research methodologies, and logical debating techniques." },
            { icon: <FaGraduationCap className="text-warning fs-3" />, title: "Academic Outreach", text: "Publishing student journals annually and maintaining a free database of research papers and country guides." },
            { icon: <FaAward className="text-warning fs-3" />, title: "diplomatic Podiums", text: "Fostering standard Model United Nations delegates and representing Delhi University at national events." }
          ].map((item, idx) => (
            <div key={idx} className="col-md-4">
              <div className="p-4 rounded-4 glass-card border border-warning h-100" style={{ background: 'rgba(17, 24, 39, 0.4)' }}>
                <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ background: 'rgba(197, 168, 92, 0.1)' }}>
                  {item.icon}
                </div>
                <h5 className="display-font text-warning mb-3">{item.title}</h5>
                <p className="text-secondary small mb-0">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* THE EXECUTIVE BOARD 26-27 */}
        <div className="mt-5 text-center">
          <h3 className="display-font text-warning mb-5 glow-text">The Executive Board (2026-27)</h3>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="row g-4"
          >
            {[
              { role: "President", name: "Vansh Srivastava", dept: "Political Science, Year III", image: "/images/logo.jpg" },
              { role: "Vice President", name: "Saanvi", dept: "English Literature, Year III", image: "/images/logo.jpg" },
              { role: "Secretary ", name: "Bhoomika", dept: "Economics, Year III", image: "/images/logo.jpg" },
              { role: "Marketing Head", name: "Vanshika Wadhwa", dept: "History, Year III", image: "/images/logo.jpg" },
              { role: "MUN Head", name: "Chaitanya", dept: "History, Year III", image: "/images/logo.jpg" },
              { role: "ITD Head", name: "Happy", dept: "History, Year III", image: "/images/logo.jpg" },
              { role: "Research & Development Heads", name: "Kanishka and Vanshika", dept: "History, Year III", image: "/images/logo.jpg" },
              { role: "Creatives & Promotions Head", name: "Prajanya", dept: "History, Year III", image: "/images/logo.jpg" }
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
        {/* TIMELINE SECTION */}
        <div className="my-5 py-3">
          <h3 className="display-font text-warning text-center mb-5 glow-text">Historical Milestones</h3>
          <div className="timeline-container mx-auto" style={{ maxWidth: '800px' }}>
            {[
              { year: "2012", title: "The Foundation", desc: "The Round Table was chartered at Kirori Mal College by a cohort of passionate English and Political Science students." },
              { year: "2015", title: "Launch of 'The Circular'", desc: "Published the first volume of our peer-reviewed society journal, cataloging academic essays on contemporary geopolitical challenges." },
              { year: "2018", title: "Inception of KMC MUN", desc: "Inaugurated our Model United Nations division, hosting the first national-level DU conference with over 300 delegates." },
              { year: "2023", title: "Digital Research Library", desc: "Launched digital archives cataloging delegate resources, Country Guides, and research resources for global access." }
            ].map((milestone, idx) => (
              <div key={idx} className="timeline-item">
                <span className="text-warning fw-bold display-font fs-4 glow-text">{milestone.year}</span>
                <h5 className="text-light mt-1 mb-2">{milestone.title}</h5>
                <p className="text-secondary small">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* THE EXECUTIVE BOARD 25-26 */}
        <div className="mt-5 text-center">
          <h3 className="display-font text-warning mb-5 glow-text">The Executive Board (2025-26)</h3>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="row g-4"
          >
            {[
              { role: "President", name: "Aarav Mehra", dept: "Political Science, Year III", image: "/images/logo.jpg" },
              { role: "Vice President", name: "Ananya Iyer", dept: "English Literature, Year III", image: "/images/logo.jpg" },
              { role: "Secretary General (MUN)", name: "Kunal Malhotra", dept: "Economics, Year III", image: "/images/logo.jpg" },
              { role: "Editor-in-Chief (Journals)", name: "Diya Sharma", dept: "History, Year III", image: "/images/logo.jpg" }
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
      </div>
    </div>
  );
};
