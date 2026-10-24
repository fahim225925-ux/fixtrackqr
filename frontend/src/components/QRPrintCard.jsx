import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ExternalLink, MapPin } from 'lucide-react';

export default function QRPrintCard({ location }) {
  // Construct direct link to report issue for this room
  const reportUrl = `${window.location.origin}/report?code=${encodeURIComponent(location.qrCodeId)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            {location.qrCodeId}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {location.roomNumber}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
            <MapPin size={14} />
            {location.building} • {location.floor}
          </p>
        </div>
      </div>

      {/* QR Code Container styled like a campus physical plaque */}
      <div
        className="printable-area"
        style={{
          background: '#ffffff',
          border: '2px dashed var(--border)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0.5rem 0 1rem 0',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Campus Facilities & Maintenance
        </div>

        <QRCodeSVG
          value={reportUrl}
          size={140}
          level="H"
          includeMargin={true}
        />

        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.5rem' }}>
          {location.building} - {location.roomNumber}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
          Scan to report broken fans, projectors, taps, or Wi-Fi
        </div>
      </div>

      {location.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic', flex: 1 }}>
          "{location.description}"
        </p>
      )}

      {/* Action Buttons */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <a
          href={`/report?code=${location.qrCodeId}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
        >
          <ExternalLink size={14} />
          <span>Test Form</span>
        </a>
        <button
          onClick={handlePrint}
          className="btn btn-outline btn-sm"
          title="Print QR code"
        >
          <Printer size={14} />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}
