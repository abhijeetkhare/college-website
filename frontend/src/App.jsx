import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Events } from './pages/public/Events';
import { Gallery } from './pages/public/Gallery';
import { Journals } from './pages/public/Journals';
import { MUNPage } from './pages/public/MUNPage';
import { Resources } from './pages/public/Resources';
import { Contact } from './pages/public/Contact';

// User pages
import { Login } from './pages/user/Login';
import { Register } from './pages/user/Register';
import { Profile } from './pages/user/Profile';
import { Submissions } from './pages/user/Submissions';

// Admin page
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Import CSS (Cascading order: Bootstrap first, then custom overrides last!)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#0b0f19' }}>
          <Navbar />
          
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/journals" element={<Journals />} />
              <Route path="/mun" element={<MUNPage />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submissions" 
                element={
                  <ProtectedRoute>
                    <Submissions />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
