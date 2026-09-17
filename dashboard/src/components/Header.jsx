/**
 * Header.jsx
 * ==========
 * Executive header with KPI summary strip.
 * KPIs are COMPUTED from data, not hardcoded.
 */

import React from 'react';
import { fmtUSD, fmtPct, fmtNum } from '../utils/dataProcessor';

export default function Header({ kpis, dateRange }) {
  const formatDate = (d) => {
    if (!d) return '—';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-title">
          <h1>War Room: <span>Strait of Hormuz</span> Exposure</h1>
          <div className="status-badge">
            <div className="pulse" />
            Active Disruption
          </div>
        </div>
        <div className="header-meta">
          <span>{formatDate(dateRange?.min)} — {formatDate(dateRange?.max)}</span>
          <span>{kpis.totalShipments} shipments analyzed</span>
        </div>
      </div>

      <div className="kpi-strip">
        {/* Total Shipments */}
        <div className="kpi-card blue">
          <div className="kpi-label">Total Shipments</div>
          <div className="kpi-value">{fmtNum(kpis.totalShipments)}</div>
          <div className="kpi-sub">{kpis.trappedCount} held in Gulf</div>
        </div>

        {/* Contracted Revenue */}
        <div className="kpi-card blue">
          <div className="kpi-label">Contracted Revenue</div>
          <div className="kpi-value">{fmtUSD(kpis.totalContractedRevenue)}</div>
          <div className="kpi-sub">Locked pre-blockade pricing</div>
        </div>

        {/* Delivered Gross Margin */}
        <div className="kpi-card green">
          <div className="kpi-label">Delivered Gross Margin</div>
          <div className={`kpi-value ${kpis.deliveredMarginSum >= 0 ? 'positive' : 'negative'}`}>
            {fmtUSD(kpis.deliveredMarginSum)}
          </div>
          <div className="kpi-sub">{fmtPct(kpis.deliveredMarginPct)} of delivered revenue</div>
        </div>

        {/* Trapped Cargo Value */}
        <div className="kpi-card red">
          <div className="kpi-label">Trapped Cargo Value</div>
          <div className="kpi-value negative">{fmtUSD(kpis.trappedValue)}</div>
          <div className="kpi-sub">{kpis.trappedCount} shipments, {fmtUSD(kpis.trappedRevenue)} unrealized revenue</div>
        </div>

        {/* DIFOT % */}
        <div className={`kpi-card ${kpis.difotPct >= 0.9 ? 'green' : kpis.difotPct >= 0.7 ? 'amber' : 'red'}`}>
          <div className="kpi-label">DIFOT Compliance</div>
          <div className={`kpi-value ${kpis.difotPct < 0.7 ? 'negative' : ''}`}>
            {fmtPct(kpis.difotPct)}
          </div>
          <div className="kpi-sub">{kpis.difotYes} of {kpis.totalShipments} on-time in-full</div>
        </div>
      </div>
    </header>
  );
}
