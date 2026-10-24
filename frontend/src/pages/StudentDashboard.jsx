import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { PlusCircle, RefreshCw, AlertCircle, MapPin, Clock, MessageSquareQuote } from 'lucide-react';

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([
    {
      _id: 'cmp_001_demo',
      title: 'Ceiling projector HDMI port loose / intermittent signal',
      description: 'The ceiling projector in LH 101 overheats or loses connection mid-lecture.',
      category: 'Projector/AV',
      priority: 'High',
      status: 'In Progress',
      adminRemarks: 'AV technician scheduled to replace HDMI splitter on Monday morning.',
      location: { building: 'Science Block', roomNumber: 'LH 101', floor: '1st Floor' },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'cmp_002_demo',
      title: 'Broken desk armrest in row 3',
      description: 'Third row desk has sharp broken plastic on the armrest, causing safety issue.',
      category: 'Furniture',
      priority: 'Medium',
      status: 'Pending',
      location: { building: 'Science Block', roomNumber: 'LH 101', floor: '1st Floor' },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/complaints/my');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            My Maintenance Complaints
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Track real-time progress and resolutions for your reported campus issues
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchMyComplaints}
            className="btn btn-outline btn-sm"
            disabled={loading}
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/report" className="btn btn-primary btn-sm">
            <PlusCircle size={14} />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca', color: 'var(--danger)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          Loading your complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <PlusCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No complaints filed yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem auto' }}>
            Notice an issue in a classroom, lab, or library? Scan the room's QR code to submit a quick maintenance report.
          </p>
          <Link to="/report" className="btn btn-primary">
            Report an Issue Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map((c) => (
            <div key={c._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                      #{c._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.title}
                  </h3>
                </div>

                <StatusBadge status={c.status} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                {c.description}
              </p>

              {/* Location & Time Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <strong>{c.location?.building}</strong> — {c.location?.roomNumber} ({c.location?.floor})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} />
                  Reported on {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Admin Remarks if provided */}
              {c.adminRemarks && (
                <div style={{ marginTop: '0.85rem', background: '#f8fafc', borderLeft: '3px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <MessageSquareQuote size={15} color="var(--primary)" />
                    Facilities Response:
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{c.adminRemarks}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
