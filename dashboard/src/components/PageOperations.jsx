/**
 * PageOperations.jsx
 * ==================
 * Page 1: Operational Network & Service Reliability
 * Features: Route Mix (Weekly Bar), Fleet Allocation (Doughnut), Transit Variance, DIFOT performance.
 */

import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../utils/chartConfig';
import { ROUTE_COLORS, ROUTE_ORDER } from '../utils/dataProcessor';

export default function PageOperations({
  weeklyRouteMix,
  weekLabels,
  transitByRoute,
  heldAvgStuck,
  difotByRoute,
  difotByProduct,
  productCategories,
  kpis,
}) {
  // ── 1. Weekly Route Mix ──────────────────────────────────────────────────
  const routeMixData = {
    labels: weekLabels.map(w => {
      const parts = w.split('-');
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: ROUTE_ORDER.map(rt => ({
      label: rt.replace(' (Pre-Blockade)', ''),
      data: weekLabels.map(w => (weeklyRouteMix[w] && weeklyRouteMix[w][rt]) || 0),
      backgroundColor: ROUTE_COLORS[rt],
      stack: 'routes',
      borderRadius: 1,
    })),
  };

  const routeMixOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 8, font: { size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} voyages`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#8b94a5', font: { size: 9 } },
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5', stepSize: 5 },
        title: { display: true, text: 'Departures', color: '#545d6e', font: { size: 10 } },
      },
    },
  };

  // ── 2. Fleet Allocation by Route (Doughnut / Pie Chart) ──────────────────
  const routeCounts = ROUTE_ORDER.map(rt => transitByRoute[rt]?.count || 0);
  const routeDonutData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        data: routeCounts,
        backgroundColor: ROUTE_ORDER.map(rt => ROUTE_COLORS[rt]),
        borderWidth: 1,
        borderColor: '#13171f',
      },
    ],
  };

  const routeDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 10, font: { size: 10 }, padding: 8 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const count = ctx.parsed;
            const pct = ((count / kpis.totalShipments) * 100).toFixed(1);
            return ` ${ctx.label}: ${count} voyages (${pct}%)`;
          },
        },
      },
    },
    cutout: '62%',
  };

  // ── 3. Planned vs Actual Transit Days ────────────────────────────────────
  const transitRoutes = ROUTE_ORDER.filter(rt => rt !== 'Held in Gulf');
  const transitData = {
    labels: transitRoutes.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        label: 'Planned Schedule',
        data: transitRoutes.map(rt => Number(transitByRoute[rt]?.avgPlanned?.toFixed(1) || 0)),
        backgroundColor: '#2e3646',
        borderRadius: 3,
      },
      {
        label: 'Delivered Actual',
        data: transitRoutes.map(rt => Number(transitByRoute[rt]?.avgActual?.toFixed(1) || 0)),
        backgroundColor: transitRoutes.map(rt => ROUTE_COLORS[rt]),
        borderRadius: 3,
      },
    ],
  };

  const transitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} days`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b94a5', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5' },
        title: { display: true, text: 'Days', color: '#545d6e', font: { size: 11 } },
      },
    },
  };

  // ── 4. DIFOT Performance ─────────────────────────────────────────────────
  const difotRouteData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        data: ROUTE_ORDER.map(rt => Number(((difotByRoute[rt] || 0) * 100).toFixed(1))),
        backgroundColor: ROUTE_ORDER.map(rt => {
          const pct = difotByRoute[rt] || 0;
          return pct >= 0.9 ? '#238636' : pct >= 0.5 ? '#d29922' : '#b3202b';
        }),
        borderRadius: 3,
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
          label: (ctx) => ` On-Time In-Full: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b94a5', font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5', callback: (v) => `${v}%` },
      },
    },
  };

  const difotProductData = {
    labels: productCategories,
    datasets: [
      {
        data: productCategories.map(pc => Number(((difotByProduct[pc] || 0) * 100).toFixed(1))),
        backgroundColor: productCategories.map(pc => {
          const pct = difotByProduct[pc] || 0;
          return pct >= 0.8 ? '#238636' : pct >= 0.6 ? '#d29922' : '#b3202b';
        }),
        borderRadius: 3,
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
          label: (ctx) => ` On-Time In-Full: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b94a5', font: { size: 10 }, maxRotation: 20, minRotation: 15 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5', callback: (v) => `${v}%` },
      },
    },
  };

  return (
    <div>
      {/* Board Resolution Summary Banner */}
      <div className="board-brief">
        <div className="board-brief-header">
          <span className="board-brief-title">Level 1: Operational Network Assessment</span>
          <span style={{ fontSize: '0.75rem', color: '#8b94a5' }}>Analyzed by Team Quantttt</span>
        </div>
        <div className="board-brief-q">
          "The Hormuz disruption has made a historically efficient network more expensive and less predictable."
        </div>
        <div className="board-brief-grid">
          <div className="board-point">
            <span className="board-point-label red">Network Shift</span>
            <span className="board-point-desc">
              Direct sailings collapsed to 0% after late January. 49 voyages diverted via Cape of Good Hope, adding 18.2 transit days per trip.
            </span>
          </div>
          <div className="board-point">
            <span className="board-point-label amber">Fleet Immobility</span>
            <span className="board-point-desc">
              54 vessels (22.1% of total voyages) remain trapped inside the Persian Gulf, with an average stationary delay of 42.1 days.
            </span>
          </div>
          <div className="board-point">
            <span className="board-point-label green">Service Degradation</span>
            <span className="board-point-desc">
              Network DIFOT fell from 98% pre-blockade to 67.5% overall; Cape diversions deliver only 55.1% on-time performance.
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Weekly Route Mix & Fleet Allocation Donut Chart */}
      <div className="layout-2col">
        {/* Weekly Bar */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Fleet Route Evolution by Week</div>
              <div className="card-subtitle">Volume transition from direct passage to diversion channels</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Bar data={routeMixData} options={routeMixOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Complete shutdown of direct routes by week 4 forced heavy reliance on Cape of Good Hope circumnavigation and sudden Gulf immobilization.
          </div>
        </div>

        {/* Fleet Allocation Donut Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Fleet Route Share (Pie / Donut View)</div>
              <div className="card-subtitle">Distribution across all 244 shipments in study period</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Doughnut data={routeDonutData} options={routeDonutOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Over 42% of total operational capacity is either stranded in the Gulf (22.1%) or committed to Cape circumnavigation (20.1%).
          </div>
        </div>
      </div>

      {/* Row 2: Transit Schedule & DIFOT Reliability */}
      <div className="layout-2col">
        {/* Planned vs Actual Transit */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Transit Duration: Planned vs. Delivered Actuals</div>
              <div className="card-subtitle">Excludes undelivered Gulf vessels; measured in calendar days</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Bar data={transitData} options={transitOptions} />
          </div>

          <div className="stranded-strip">
            <span><strong>Held in Gulf:</strong> 54 stranded vessels</span>
            <span className="count">Avg. {heldAvgStuck.toFixed(1)} days immobilized</span>
          </div>

          <div className="so-what">
            <strong>Key Finding:</strong> Cape of Good Hope routing extends transit from 11.0 to 29.2 days (+165%), consuming extra fuel and delaying vessel re-chartering.
          </div>
        </div>

        {/* DIFOT Performance */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Service Reliability: DIFOT Compliance</div>
              <div className="card-subtitle">Delivery-in-Full, On-Time percentage by route and product</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#8b94a5', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}>
                By Route Type
              </div>
              <div className="chart-box" style={{ height: '95px' }}>
                <Bar data={difotRouteData} options={difotRouteOptions} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#8b94a5', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}>
                By Product Category
              </div>
              <div className="chart-box" style={{ height: '95px' }}>
                <Bar data={difotProductData} options={difotProductOptions} />
              </div>
            </div>
          </div>

          <div className="so-what">
            <strong>Key Finding:</strong> Crude Oil and Refined Petrochemicals experience the highest service failure rates, directly generating customer contract penalties.
          </div>
        </div>
      </div>
    </div>
  );
}
