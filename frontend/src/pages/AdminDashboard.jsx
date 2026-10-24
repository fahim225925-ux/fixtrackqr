import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatCard from '../components/StatCard';
import {
  Clock,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  User,
  Edit3,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Status update modal / inline editing state
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/complaints/stats'),
        api.get('/complaints', {
          params: {
            status: statusFilter,
            category: categoryFilter,
            search: searchQuery,
          },
        }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const startEditStatus = (c) => {
    setEditingId(c._id);
    setNewStatus(c.status);
    setRemarks(c.adminRemarks || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRemarks('');
  };

  const handleUpdateStatus = async (complaintId) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/api/complaints/${complaintId}/status`, {
        status: newStatus,
        adminRemarks: remarks,
      });

      if (res.data.success) {
        setComplaints((prev) =>
          prev.map((item) => (item._id === complaintId ? res.data.data : item))
        );
        setEditingId(null);
        // Refresh stats
        const statsRes = await api.get('/complaints/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const totals = stats?.totals || { total: 0, pending: 0, inProgress: 0, resolved: 0 };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Campus Maintenance Admin Console
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Manage student issue tickets, assign status updates, and view campus health
          </p>
        </div>

        <button onClick={fetchData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Reports"
          value={totals.total}
          subtitle="All-time submissions"
          icon={AlertOctagon}
          color="#3b82f6"
        />
        <StatCard
          title="Pending Action"
          value={totals.pending}
          subtitle="Awaiting technician review"
          icon={Clock}
          color="#d97706"
        />
        <StatCard
          title="In Progress"
          value={totals.inProgress}
          subtitle="Work order in repair"
          icon={Wrench}
          color="#0284c7"
        />
        <StatCard
          title="Resolved"
          value={totals.resolved}
          subtitle="Fixed & verified"
          icon={CheckCircle2}
          color="#16a34a"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              <Search size={15} />
              <span>Search</span>
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Category:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="Furniture">Furniture</option>
                <option value="Projector/AV">Projector/AV</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Wi-Fi/Network">Wi-Fi/Network</option>
                <option value="HVAC/Air Conditioning">HVAC</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Complaints Table / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            Loading maintenance reports...
          </div>
        ) : complaints.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No complaints found matching the selected filters.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      #{c._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={c.status} />
                  {editingId !== c._id && (
                    <button
                      onClick={() => startEditStatus(c)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit3 size={14} />
                      <span>Update Status</span>
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                {c.description}
              </p>

              {/* Submitter & Location Meta */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <strong>{c.location?.building}</strong> — {c.location?.roomNumber} ({c.location?.floor}) [Code: {c.location?.qrCodeId}]
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} />
                  Reported by: <strong>{c.submittedBy?.name || 'Anonymous Student'}</strong> ({c.submittedBy?.studentId || c.submittedBy?.email})
                </div>
                <div>
                  Date: {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Remarks View Mode */}
              {c.adminRemarks && editingId !== c._id && (
                <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.85rem' }}>
                  <strong>Admin Remarks:</strong> {c.adminRemarks}
                </div>
              )}

              {/* Inline Status & Remarks Edit Form */}
              {editingId === c._id && (
                <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Update Ticket Status & Log Remarks
                  </h4>
                  <div className="grid-cols-2" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Change Status:</label>
                      <select
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress (Assigned to technician)</option>
                        <option value="Resolved">Resolved (Repair completed)</option>
                        <option value="Rejected">Rejected (Duplicate / Not an issue)</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Technician / Admin Remarks:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Electrician replaced fuse on panel B"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="btn btn-secondary btn-sm"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(c._id)}
                      className="btn btn-primary btn-sm"
                      disabled={updating}
                    >
                      <Check size={14} />
                      <span>{updating ? 'Saving...' : 'Save Status'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
