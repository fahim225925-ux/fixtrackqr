import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { QrCode, MapPin, CheckCircle, AlertCircle, Send, ArrowLeft, Building2 } from 'lucide-react';

const CATEGORIES = [
  'Electrical',
  'Furniture',
  'Projector/AV',
  'Plumbing',
  'Wi-Fi/Network',
  'HVAC/Air Conditioning',
  'Other',
];

const PRIORITIES = [
  { value: 'Low', label: 'Low (Minor cosmetic / non-blocking)' },
  { value: 'Medium', label: 'Medium (Standard classroom issue)' },
  { value: 'High', label: 'High (Disrupts lecture / lab work)' },
  { value: 'Urgent', label: 'Urgent (Hazard, water leak, safety risk)' },
];

export default function ReportIssue() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const codeFromUrl = searchParams.get('code') || '';

  const [qrCodeInput, setQrCodeInput] = useState(codeFromUrl);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Projector/AV',
    priority: 'Medium',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Fetch all locations for fallback selection
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success) {
          setLocations(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load room list:', err);
      }
    };
    fetchAllRooms();
  }, []);

  // When qrCodeInput changes or comes from URL, lookup location details
  useEffect(() => {
    const targetCode = qrCodeInput.trim();
    if (!targetCode) {
      setSelectedLocation(null);
      return;
    }

    const fetchLocation = async () => {
      setLocLoading(true);
      setLocError('');
      try {
        const res = await api.get(`/locations/code/${encodeURIComponent(targetCode)}`);
        if (res.data.success) {
          setSelectedLocation(res.data.data);
        }
      } catch (err) {
        setSelectedLocation(null);
        setLocError(`Could not find a room with QR code "${targetCode}". Please pick one from the list below.`);
      } finally {
        setLocLoading(false);
      }
    };

    fetchLocation();
  }, [qrCodeInput]);

  const handleLocationSelect = (locId) => {
    const found = locations.find((l) => l._id === locId);
    if (found) {
      setSelectedLocation(found);
      setQrCodeInput(found.qrCodeId);
      setLocError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/report?code=${encodeURIComponent(qrCodeInput)}` } });
      return;
    }

    if (!selectedLocation) {
      setSubmitError('Please select or scan a valid classroom QR code.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await api.post('/complaints', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        locationId: selectedLocation._id,
      });

      if (res.data.success) {
        setSubmitSuccess(res.data.data);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // Submission success screen
  if (submitSuccess) {
    return (
      <div className="fade-in" style={{ maxWidth: '560px', margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Maintenance Report Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Your issue has been logged and assigned to the campus facilities maintenance queue.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ticket ID:</span>
              <strong style={{ fontFamily: 'monospace' }}>#{submitSuccess._id.slice(-6).toUpperCase()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <strong>{submitSuccess.location?.building} — {submitSuccess.location?.roomNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Category:</span>
              <span>{submitSuccess.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Initial Status:</span>
              <span className="badge badge-pending">Pending Review</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/student-dashboard" className="btn btn-primary">
              View My Complaints
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(null);
                setFormData({ title: '', description: '', category: 'Projector/AV', priority: 'Medium' });
              }}
              className="btn btn-secondary"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}>
            <QrCode size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Campus Issue Reporting
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Location is automatically populated from the scanned QR code
            </p>
          </div>
        </div>

        {/* Auth prompt banner if user not signed in */}
        {!isAuthenticated && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
              💡 <strong>Student login required</strong> to file and track maintenance reports.
            </div>
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In Now
            </Link>
          </div>
        )}

        {/* Location Section */}
        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={16} color="var(--primary)" />
              Detected Classroom / Lab Location
            </span>
            {selectedLocation && (
              <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>
                QR Verified
              </span>
            )}
          </div>

          {selectedLocation ? (
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.875rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {selectedLocation.building} — {selectedLocation.roomNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Floor: {selectedLocation.floor} • Code: <code>{selectedLocation.qrCodeId}</code>
              </div>
              {selectedLocation.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                  {selectedLocation.description}
                </div>
              )}
            </div>
          ) : (
            <div>
              {locError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  {locError}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Choose room from campus directory:</label>
                <select
                  className="form-select"
                  value={selectedLocation?._id || ''}
                  onChange={(e) => handleLocationSelect(e.target.value)}
                >
                  <option value="">-- Choose Classroom or Lab --</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.building} - {loc.roomNumber} ({loc.qrCodeId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {submitError && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Complaint Details Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Summary / Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Broken ceiling fan in back row, projector loose HDMI"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description of Problem</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Please provide details (e.g. which desk row, error message on screen, tap leaking under sink)..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            disabled={submitting || !selectedLocation}
          >
            <Send size={16} />
            <span>{submitting ? 'Submitting Report...' : 'Submit Maintenance Report'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
