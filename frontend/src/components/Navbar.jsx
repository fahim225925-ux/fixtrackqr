import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QrCode, ClipboardList, LayoutDashboard, MapPin, LogOut, User, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              FixTrack <span style={{ color: 'var(--primary)' }}>QR</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Campus Maintenance
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            to="/report"
            className={`btn btn-sm ${isActive('/report') ? 'btn-primary' : 'btn-outline'}`}
          >
            <PlusCircle size={16} />
            <span>Report Issue</span>
          </Link>

          {isAuthenticated && !isAdmin && (
            <Link
              to="/student-dashboard"
              className={`btn btn-sm ${isActive('/student-dashboard') ? 'btn-primary' : 'btn-outline'}`}
            >
              <ClipboardList size={16} />
              <span>My Complaints</span>
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin-dashboard"
                className={`btn btn-sm ${isActive('/admin-dashboard') ? 'btn-primary' : 'btn-outline'}`}
              >
                <LayoutDashboard size={16} />
                <span>Admin Console</span>
              </Link>
              <Link
                to="/locations"
                className={`btn btn-sm ${isActive('/locations') ? 'btn-primary' : 'btn-outline'}`}
              >
                <MapPin size={16} />
                <span>Manage Rooms & QR</span>
              </Link>
            </>
          )}
        </nav>

        {/* User Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right', display: 'none', mdDisplay: 'block' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: isAdmin ? 'var(--primary)' : 'var(--success)' }}>
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
