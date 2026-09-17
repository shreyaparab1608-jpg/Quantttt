/**
 * TopNavbar.jsx
 * =============
 * Minimalist executive navigation bar with Team Quantttt branding.
 */

import React from 'react';

export default function TopNavbar({ activePage, setActivePage, dateRange }) {
  const formatDate = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <header className="top-nav">
      <div className="nav-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#ffffff',
              background: '#b3202b',
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}
          >
            QUANTTTT
          </span>
          <span className="nav-brand-title">Strait of Hormuz Exposure</span>
        </div>
        <span className="nav-brand-tag">Crisis War Room</span>
      </div>

      <nav className="tab-bar">
        <button
          className={`tab-btn ${activePage === 'operations' ? 'active' : ''}`}
          onClick={() => setActivePage('operations')}
        >
          <span className="tab-num">01</span> Operations & Transit
        </button>
        <button
          className={`tab-btn ${activePage === 'commercial' ? 'active' : ''}`}
          onClick={() => setActivePage('commercial')}
        >
          <span className="tab-num">02</span> Commercial Economics
        </button>
        <button
          className={`tab-btn ${activePage === 'strategic' ? 'active' : ''}`}
          onClick={() => setActivePage('strategic')}
        >
          <span className="tab-num">03</span> Strategy & Decisions
        </button>
      </nav>

      <div className="nav-meta">
        {formatDate(dateRange?.min)} – {formatDate(dateRange?.max)} • 244 Shipments
      </div>
    </header>
  );
}
