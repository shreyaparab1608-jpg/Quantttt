/**
 * RecommendationPanel.jsx
 * =======================
 * Section 5: Executive Action Recommendations
 * Direct answers to the Board's question:
 * - WHAT TO PROTECT
 * - WHAT TO CHANGE
 * - WHAT TO STOP
 *
 * Each recommendation is tagged with:
 * - Action & Rationale (evidence-linked)
 * - Executive Owner
 * - Time Horizon
 * - Metric & Operational Trigger
 */

import React, { useState } from 'react';

export default function RecommendationPanel({ recommendations }) {
  const [filterType, setFilterType] = useState('all');

  const filteredRecs = filterType === 'all'
    ? recommendations
    : recommendations.filter(r => r.type === filterType);

  return (
    <section className="section" id="recommendation-panel">
      <div className="section-header">
        <span className="section-number">04</span>
        <h2 className="section-title">Executive Action Blueprint: Protect, Change, & Stop</h2>
        <span className="section-subtitle">Board-mandated interventions and accountability matrix</span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilterType('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filterType === 'all' ? '#f0f0f5' : 'rgba(255,255,255,0.06)',
            color: filterType === 'all' ? '#0a0a0f' : '#8e8ea0',
            transition: 'all 0.2s ease',
          }}
        >
          All Actions ({recommendations.length})
        </button>
        <button
          onClick={() => setFilterType('protect')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filterType === 'protect' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.06)',
            color: filterType === 'protect' ? '#2ecc71' : '#8e8ea0',
            border: filterType === 'protect' ? '1px solid #2ecc71' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Protect ({recommendations.filter(r => r.type === 'protect').length})
        </button>
        <button
          onClick={() => setFilterType('change')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filterType === 'change' ? 'rgba(255, 183, 77, 0.2)' : 'rgba(255,255,255,0.06)',
            color: filterType === 'change' ? '#FFB74D' : '#8e8ea0',
            border: filterType === 'change' ? '1px solid #FFB74D' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Change ({recommendations.filter(r => r.type === 'change').length})
        </button>
        <button
          onClick={() => setFilterType('stop')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filterType === 'stop' ? 'rgba(239, 83, 80, 0.2)' : 'rgba(255,255,255,0.06)',
            color: filterType === 'stop' ? '#ef5350' : '#8e8ea0',
            border: filterType === 'stop' ? '1px solid #ef5350' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Stop ({recommendations.filter(r => r.type === 'stop').length})
        </button>
      </div>

      <div className="recommendations-grid">
        {filteredRecs.map((rec, idx) => (
          <div key={idx} className={`rec-card ${rec.type}`}>
            <span className="rec-type-badge">
              {rec.type === 'protect' ? 'WHAT TO PROTECT' : rec.type === 'change' ? 'WHAT TO CHANGE' : 'WHAT TO STOP'}
            </span>

            <p className="rec-action">{rec.action}</p>

            <div className="rec-meta">
              <div className="rec-meta-item">
                <span className="rec-meta-label">Accountable Owner</span>
                <span className="rec-meta-value" style={{ fontWeight: 600, color: '#f0f0f5' }}>
                  {rec.owner}
                </span>
              </div>

              <div className="rec-meta-item">
                <span className="rec-meta-label">Time Horizon</span>
                <span className="rec-meta-value" style={{ color: '#4FC3F7' }}>
                  {rec.horizon}
                </span>
              </div>

              <div className="rec-meta-item" style={{ gridColumn: '1 / -1' }}>
                <span className="rec-meta-label">Decision Metric & Trigger</span>
                <span className="rec-meta-value" style={{ fontStyle: 'italic', color: '#FFB74D' }}>
                  {rec.trigger}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
