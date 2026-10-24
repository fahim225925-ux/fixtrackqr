import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { QrCode, ArrowRight, ShieldCheck, Zap, CheckCircle2, AlertTriangle, Monitor, Sparkles } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success && res.data.data.length > 0) {
          setLocations(res.data.data);
          setSelectedCode(res.data.data[0].qrCodeId);
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    };
    fetchRooms();
  }, []);

  const handleSimulateScan = (e) => {
    e.preventDefault();
    const code = manualCode.trim() || selectedCode;
    if (code) {
      navigate(`/report?code=${encodeURIComponent(code)}`);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Hero Section */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '3rem 2rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Sparkles size={14} />
            Smart Campus Facility Management
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
            Report Campus Issues in Seconds with QR Codes
          </h1>
          <p style={{ marginTop: '1rem', fontSize: '1.05rem', color: '#e0e7ff', lineHeight: 1.6, maxWidth: '540px' }}>
            Spot a broken fan, flickering projector, or leaking tap? Scan the room's QR code. FixTrack instantly pre-fills the exact classroom location and sends your ticket directly to the facilities team.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/report"
              className="btn"
              style={{ background: 'white', color: '#1e3a8a', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <QrCode size={18} />
              Report Issue Now
            </Link>
            
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="btn btn-outline"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.75rem 1.25rem' }}
              >
                Sign In / Register
              </Link>
            ) : user.role === 'admin' ? (
              <Link
                to="/admin-dashboard"
                className="btn btn-outline"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.75rem 1.25rem' }}
              >
                Go to Admin Console
              </Link>
            ) : (
              <Link
                to="/student-dashboard"
                className="btn btn-outline"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '0.75rem 1.25rem' }}
              >
                View My Complaints
              </Link>
            )}
          </div>
        </div>

        {/* QR Scan Simulator Box */}
        <div
          style={{
            background: 'white',
            color: 'var(--text-primary)',
            padding: '1.75rem',
            borderRadius: '14px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.4rem', borderRadius: '8px', color: 'var(--primary)' }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Quick QR Code Simulator</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate scanning a classroom QR tag</p>
            </div>
          </div>

          <form onSubmit={handleSimulateScan} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Select a Campus Room:</label>
              <select
                className="form-select"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc.qrCodeId} value={loc.qrCodeId}>
                    {loc.building} - {loc.roomNumber} ({loc.qrCodeId})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              — OR ENTER CODE MANUALLY —
            </div>

            <div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. LOC-SCI-101"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <span>Simulate QR Scan</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* How It Works - 3 Step Flow */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            How FixTrack QR Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            No room searching. No phone calls. Instant campus ticketing.
          </p>
        </div>

        <div className="grid-cols-3">
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <QrCode size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Scan Room QR</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Every classroom, computer lab, and library room has a unique QR tag. Simply scan it with any smartphone camera.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fffbeb', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Report the Issue</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The form locks in the exact location automatically. Select the problem category (Electrical, Projector, Furniture), type a note, and submit.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Admin Resolves</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Maintenance staff update the issue status to In Progress and mark it Resolved with resolution remarks. Students track status in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Credentials Helper Box */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b' }}>
          <Zap size={16} color="var(--primary)" />
          Quick Demo Credentials for Evaluation & Testing
        </h4>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          <div>
            <strong>Student Account:</strong> <code style={{ background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>student@campus.edu</code> / <code style={{ background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>student123</code>
          </div>
          <div>
            <strong>Admin Account:</strong> <code style={{ background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>admin@campus.edu</code> / <code style={{ background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>admin123</code>
          </div>
        </div>
      </div>

    </div>
  );
}
