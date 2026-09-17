/**
 * OperationalView.jsx
 * ===================
 * Level 1: Operational dynamics
 * - Route mix over time (weekly stacked bar)
 * - Planned vs Actual transit days (excluding Held in Gulf with dedicated stuck indicator)
 * - DIFOT % compliance by Route Type and Product Category
 */

import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../utils/chartConfig';
import { ROUTE_COLORS, ROUTE_ORDER, fmtPct } from '../utils/dataProcessor';

export default function OperationalView({
  weeklyRouteMix,
  weekLabels,
  transitByRoute,
  heldAvgStuck,
  difotByRoute,
  difotByProduct,
  productCategories,
  kpis,
}) {
  // ── 1. Route Mix Over Time (Stacked Bar Chart) ──────────────────────────
  const routeMixData = {
    labels: weekLabels.map(w => {
      const parts = w.split('-');
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: ROUTE_ORDER.map(rt => ({
      label: rt,
      data: weekLabels.map(w => (weeklyRouteMix[w] && weeklyRouteMix[w][rt]) || 0),
      backgroundColor: ROUTE_COLORS[rt],
      stack: 'routes',
      borderRadius: 2,
    })),
  };

  const routeMixOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} shipments`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8e8ea0', font: { size: 10 } },
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', stepSize: 5 },
        title: { display: true, text: 'Shipment Count', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  // ── 2. Planned vs Actual Transit Days ──────────────────────────────────
  // Note: Held in Gulf is excluded from actuals as it has no completed arrival
  const transitRoutes = ROUTE_ORDER.filter(rt => rt !== 'Held in Gulf');
  const transitData = {
    labels: transitRoutes.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        label: 'Planned Transit (Days)',
        data: transitRoutes.map(rt => Number(transitByRoute[rt]?.avgPlanned?.toFixed(1) || 0)),
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Actual Transit (Days)',
        data: transitRoutes.map(rt => Number(transitByRoute[rt]?.avgActual?.toFixed(1) || 0)),
        backgroundColor: transitRoutes.map(rt => ROUTE_COLORS[rt]),
        borderRadius: 4,
      },
    ],
  };

  const transitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} days`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8e8ea0', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0' },
        title: { display: true, text: 'Average Days', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  // ── 3. DIFOT Compliance by Route Type ──────────────────────────────────
  const difotRouteData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        label: 'DIFOT %',
        data: ROUTE_ORDER.map(rt => Number(((difotByRoute[rt] || 0) * 100).toFixed(1))),
        backgroundColor: ROUTE_ORDER.map(rt => {
          const pct = difotByRoute[rt] || 0;
          return pct >= 0.9 ? '#2ecc71' : pct >= 0.6 ? '#FFB74D' : '#ef5350';
        }),
        borderRadius: 4,
      },
    ],
  };

  const difotRouteOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` DIFOT: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8e8ea0', font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', callback: (v) => `${v}%` },
        title: { display: true, text: 'On-Time In-Full %', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  // ── 4. DIFOT Compliance by Product Category ────────────────────────────
  const difotProductData = {
    labels: productCategories,
    datasets: [
      {
        label: 'DIFOT %',
        data: productCategories.map(pc => Number(((difotByProduct[pc] || 0) * 100).toFixed(1))),
        backgroundColor: productCategories.map(pc => {
          const pct = difotByProduct[pc] || 0;
          return pct >= 0.8 ? '#2ecc71' : pct >= 0.6 ? '#FFB74D' : '#ef5350';
        }),
        borderRadius: 4,
      },
    ],
  };

  const difotProductOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` DIFOT: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8e8ea0', font: { size: 10 }, maxRotation: 25, minRotation: 20 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', callback: (v) => `${v}%` },
        title: { display: true, text: 'On-Time In-Full %', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  return (
    <section className="section" id="operational-view">
      <div className="section-header">
        <span className="section-number">01</span>
        <h2 className="section-title">Operational Dynamics: Routes, Transit, & Service Reliability</h2>
        <span className="section-subtitle">What shifted across physical transit networks</span>
      </div>

      <div className="chart-grid">
        {/* Chart 1: Route Mix Over Time */}
        <div className="chart-card full-width">
          <div className="chart-title">Route Evolution (Jan 5 – Mar 22, 2026)</div>
          <div className="chart-wrapper" style={{ height: '320px' }}>
            <Bar data={routeMixData} options={routeMixOptions} />
          </div>
          <p className="chart-caption">
            <strong>SO WHAT:</strong> After the late-January blockade initiation, Direct sailings collapsed from 100% of departures to 0%, forcing immediate rerouting into Cape of Good Hope diversions (+18 days) and leaving a persistent bloc of 54 voyages trapped inside the Persian Gulf.
          </p>
        </div>

        {/* Chart 2: Planned vs Actual Transit Days */}
        <div className="chart-card">
          <div className="chart-title">Transit Duration: Planned vs. Delivered Actuals</div>
          <div className="chart-wrapper" style={{ height: '280px' }}>
            <Bar data={transitData} options={transitOptions} />
          </div>

          <div className="stuck-indicator">
            <div className="value">{heldAvgStuck.toFixed(0)}d</div>
            <div className="label">
              <strong>Held in Gulf Backlog:</strong> {kpis.trappedCount} vessels stranded inside the strait for an average of {heldAvgStuck.toFixed(1)} days (Actual Transit undefined due to zero completed deliveries).
            </div>
          </div>

          <p className="chart-caption">
            <strong>SO WHAT:</strong> Cape of Good Hope adds 18.2 extra sailing days per voyage (+165% transit stretch), shattering delivery schedules, triggering customer penalty clauses, and doubling fuel burn per trip.
          </p>
        </div>

        {/* Chart 3 & 4: DIFOT % Breakdown */}
        <div className="chart-card">
          <div className="chart-title">Service Reliability: DIFOT % by Route & Product</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#8e8ea0', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                By Route Type
              </div>
              <div className="chart-wrapper" style={{ height: '160px' }}>
                <Bar data={difotRouteData} options={difotRouteOptions} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#8e8ea0', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                By Product Category
              </div>
              <div className="chart-wrapper" style={{ height: '160px' }}>
                <Bar data={difotProductData} options={difotProductOptions} />
              </div>
            </div>
          </div>

          <p className="chart-caption">
            <strong>SO WHAT:</strong> Held in Gulf has a 0% DIFOT rate, while Cape diversions drop to ~55%. Crude Oil and Petrochemicals bear the steepest failure rates, directly triggering contracted delay liquidated damages.
          </p>
        </div>
      </div>
    </section>
  );
}
