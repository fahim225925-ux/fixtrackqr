import React, { useState, useEffect } from 'react';
import api from '../api/client';
import QRPrintCard from '../components/QRPrintCard';
import { MapPin, Plus, Trash2, Printer, AlertCircle, CheckCircle } from 'lucide-react';

export default function ManageLocations() {
  const [locations, setLocations] = useState([
    {
      _id: 'loc_001_demo',
      building: 'Science Block',
      floor: '1st Floor',
      roomNumber: 'LH 101',
      qrCodeId: 'LOC-SCI-101',
      description: 'Large Physics Lecture Hall with dual projectors',
    },
    {
      _id: 'loc_002_demo',
      building: 'Engineering Block',
      floor: '3rd Floor',
      roomNumber: 'Lab 302',
      qrCodeId: 'LOC-ENG-302',
      description: 'Advanced Computer Networks & Database Laboratory',
    },
    {
      _id: 'loc_003_demo',
      building: 'Main Academic Wing',
      floor: 'Ground Floor',
      roomNumber: 'Seminar Hall A',
      qrCodeId: 'LOC-MAIN-SEM-A',
      description: 'Auditorium style hall for guest lectures and conferences',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    building: '',
    floor: 'Ground Floor',
    roomNumber: '',
    qrCodeId: '',
    description: '',
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations');
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/locations', formData);
      if (res.data.success) {
        setSuccess(`Location "${res.data.data.roomNumber}" created with QR ID ${res.data.data.qrCodeId}`);
        setFormData({
          building: '',
          floor: 'Ground Floor',
          roomNumber: '',
          qrCodeId: '',
          description: '',
        });
        setShowForm(false);
        fetchLocations();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, room) => {
    if (!window.confirm(`Are you sure you want to delete "${room}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/locations/${id}`);
      if (res.data.success) {
        setLocations((prev) => prev.filter((loc) => loc._id !== id));
      }
    } catch (err) {
      alert('Failed to delete location: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Manage Campus Rooms & QR Codes
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Generate unique printable QR code stickers for classrooms, computer labs, and lecture halls
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrintAll} className="btn btn-outline btn-sm">
            <Printer size={15} />
            <span>Print All Plaques</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>{showForm ? 'Close Form' : 'Add New Room'}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="no-print" style={{ background: 'var(--success-bg)', border: '1px solid #bbf7d0', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="no-print" style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Add New Room Form */}
      {showForm && (
        <div className="card no-print" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Add Campus Classroom or Laboratory
          </h3>

          <form onSubmit={handleCreateLocation}>
            <div className="grid-cols-3">
              <div className="form-group">
                <label className="form-label">Building Name *</label>
                <input
                  type="text"
                  name="building"
                  className="form-input"
                  placeholder="e.g. Science Block, Tech Center"
                  required
                  value={formData.building}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Floor Level *</label>
                <select
                  name="floor"
                  className="form-select"
                  value={formData.floor}
                  onChange={handleChange}
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                  <option value="Basement">Basement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Room / Lab Name *</label>
                <input
                  type="text"
                  name="roomNumber"
                  className="form-input"
                  placeholder="e.g. Lab 302, LH-101"
                  required
                  value={formData.roomNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Custom QR Code Identifier (Optional)</label>
                <input
                  type="text"
                  name="qrCodeId"
                  className="form-input"
                  placeholder="Auto-generated if blank, e.g. LOC-SCI-101"
                  value={formData.qrCodeId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room Description / Notes</label>
                <input
                  type="text"
                  name="description"
                  className="form-input"
                  placeholder="e.g. Advanced Graphics Lab with 40 PCs"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting}
              >
                {submitting ? 'Creating Room...' : 'Save & Generate QR'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations Grid with QR Badges */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading campus locations...
        </div>
      ) : locations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          No campus rooms registered yet. Click "Add New Room" above to create your first QR code plaque.
        </div>
      ) : (
        <div className="grid-cols-3">
          {locations.map((loc) => (
            <div key={loc._id} style={{ position: 'relative' }}>
              <QRPrintCard location={loc} />
              <button
                onClick={() => handleDelete(loc._id, loc.roomNumber)}
                className="no-print"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                }}
                title="Delete Location"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
