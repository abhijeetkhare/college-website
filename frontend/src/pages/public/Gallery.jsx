import React, { useState, useEffect } from 'react';
import { FaEye, FaTimes, FaCamera } from 'react-icons/fa';
import api from '../../services/api';

export const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/gallery/categories'),
      api.get('/api/gallery')
    ])
      .then(([catRes, itemRes]) => {
        const catNames = ['All', ...catRes.data.map(c => c.name)];
        setCategories(catNames);
        setItems(itemRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load gallery:", err);
        setLoading(false);
      });
  }, []);

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="py-5" style={{ backgroundColor: '#0b0f19', minHeight: '90vh' }}>
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <span className="text-warning small fw-bold tracking-wider uppercase glow-text">MOMENTS & ACHIEVEMENTS</span>
          <h1 className="display-4 fw-bold display-font text-light mt-2 mb-3">Photo Gallery</h1>
          <p className="text-secondary mx-auto lead" style={{ maxWidth: '600px', fontSize: '1rem' }}>
            A visual capture of our conferences, debate rooms, trophy distributions, and social gatherings.
          </p>
        </div>

        {/* TABS CONTROLLER */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn px-4 py-2 rounded-pill transition ${selectedCategory === cat ? 'btn-warning text-dark fw-bold shadow' : 'outline-gold-btn text-warning'}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: '0.9rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GALLERY ITEMS GRID */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="row g-4">
            {filteredItems.map(item => (
              <div key={item.id} className="col-sm-6 col-md-4 col-lg-3">
                <div 
                  className="position-relative rounded-3 overflow-hidden border border-warning cursor-pointer group"
                  onClick={() => setSelectedImage(item)}
                  style={{ height: '220px', cursor: 'pointer' }}
                >
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-100 h-100 object-fit-cover transition-all"
                    style={{ transition: 'transform 0.4s ease' }}
                  />
                  {/* Hover Overlay */}
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center opacity-0 hover-overlay transition-all" style={{ backgroundColor: 'rgba(11, 15, 25, 0.85)', transition: 'all 0.3s ease' }}>
                    <FaEye className="text-warning fs-3 mb-2" />
                    <h6 className="text-light text-center px-3 mb-1 display-font">{item.title}</h6>
                    <span className="badge bg-warning text-dark small">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 glass-card rounded-4 border border-warning" style={{ background: 'rgba(17,24,39,0.3)' }}>
            <FaCamera className="text-secondary fs-1 mb-3 opacity-50" />
            <p className="text-secondary mb-0">No images posted under this division yet.</p>
          </div>
        )}

        {/* LIGHTBOX MODAL */}
        {selectedImage && (
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1050 }}
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="position-absolute top-4 end-4 btn btn-link text-warning fs-3 text-decoration-none"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes />
            </button>
            <div className="text-center px-3" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title} 
                className="img-fluid rounded shadow-lg mb-3"
                style={{ maxHeight: '75vh', objectFit: 'contain' }}
              />
              <h4 className="text-warning display-font glow-text mb-1">{selectedImage.title}</h4>
              <span className="badge bg-warning text-dark uppercase">{selectedImage.category}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover styling */}
      <style>{`
        .group:hover img {
          transform: scale(1.1);
        }
        .group:hover .hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
