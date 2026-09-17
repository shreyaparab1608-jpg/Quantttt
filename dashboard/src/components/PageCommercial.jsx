/**
 * PageCommercial.jsx
 * ==================
 * Page 2: Commercial Economics & Customer Exposure
 * Features: Margin by Corridor, Cost-to-Serve Breakdown (Stacked Bar + Doughnut Share),
 * Customer Concentration, and Revenue vs Margin % Bubble Quadrant.
 */

import React, { useState } from 'react';
import { Bar, Bubble, Doughnut } from 'react-chartjs-2';
import '../utils/chartConfig';
import { ROUTE_COLORS, ROUTE_ORDER, fmtUSD } from '../utils/dataProcessor';

export default function PageCommercial({
  marginByRoute = {},
  costBreakdownByRoute = {},
  customerConcentration = [],
  bubbleData = [],
}) {
  const [marginMetric, setMarginMetric] = useState('total'); // 'total' | 'pct'
  const [showCaveatDetails, setShowCaveatDetails] = useState(false);

  // ── 1. Gross Margin by Route Type ────────────────────────────────────────
  const marginChartData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        data: ROUTE_ORDER.map(rt => {
          if (marginMetric === 'total') {
            return marginByRoute?.[rt]?.totalMargin || 0;
          } else {
            return Number(((marginByRoute?.[rt]?.avgMarginPct || 0) * 100).toFixed(1));
          }
        }),
        backgroundColor: ROUTE_ORDER.map(rt => {
          const val = marginMetric === 'total'
            ? (marginByRoute?.[rt]?.totalMargin || 0)
            : (marginByRoute?.[rt]?.avgMarginPct || 0);
          return val >= 0 ? '#238636' : '#b3202b';
        }),
        borderRadius: 3,
      },
    ],
  };

  const marginChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const rt = ROUTE_ORDER[ctx.dataIndex];
            const m = marginByRoute[rt];
            return [
              ` ${marginMetric === 'total' ? 'Gross Margin' : 'Average Margin'}: ${marginMetric === 'total' ? fmtUSD(ctx.parsed.y) : `${ctx.parsed.y}%`}`,
              ` Contracted Revenue: ${fmtUSD(m?.totalRevenue || 0)}`,
              ` Voyages: ${m?.count || 0}`,
              m?.isEmergency ? ' (Emergency substitute rate)' : '',
            ].filter(Boolean);
          },
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
        ticks: {
          color: '#8b94a5',
          callback: (v) => (marginMetric === 'total' ? fmtUSD(v) : `${v}%`),
        },
      },
    },
  };

  // ── 2. Cost-to-Serve Breakdown (Stacked Bar) ─────────────────────────────
  const costBreakdownData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        label: 'Base Freight',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute?.[rt]?.freight || 0),
        backgroundColor: '#388bfd',
        stack: 'cost',
      },
      {
        label: 'Bunker Fuel',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute?.[rt]?.fuel || 0),
        backgroundColor: '#d29922',
        stack: 'cost',
      },
      {
        label: 'War Risk Insurance',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute?.[rt]?.insurance || 0),
        backgroundColor: '#8957e5',
        stack: 'cost',
      },
      {
        label: 'DIFOT Penalties',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute?.[rt]?.penalty || 0),
        backgroundColor: '#b3202b',
        stack: 'cost',
      },
    ],
  };

  const costBreakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 8, font: { size: 10 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmtUSD(ctx.parsed.y)}`,
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
        ticks: { color: '#8b94a5', callback: (v) => fmtUSD(v) },
      },
    },
  };

  // ── 3. Cost Component Share (Doughnut / Pie Chart) ───────────────────────
  const totalFreight = ROUTE_ORDER.reduce((s, rt) => s + (costBreakdownByRoute?.[rt]?.freight || 0), 0);
  const totalFuel = ROUTE_ORDER.reduce((s, rt) => s + (costBreakdownByRoute?.[rt]?.fuel || 0), 0);
  const totalInsurance = ROUTE_ORDER.reduce((s, rt) => s + (costBreakdownByRoute?.[rt]?.insurance || 0), 0);
  const totalPenalty = ROUTE_ORDER.reduce((s, rt) => s + (costBreakdownByRoute?.[rt]?.penalty || 0), 0);
  const grandTotalCost = totalFreight + totalFuel + totalInsurance + totalPenalty || 1;

  const costDonutData = {
    labels: ['Bunker Fuel', 'Base Freight', 'War Risk Ins.', 'DIFOT Penalties'],
    datasets: [
      {
        data: [totalFuel, totalFreight, totalInsurance, totalPenalty],
        backgroundColor: ['#d29922', '#388bfd', '#8957e5', '#b3202b'],
        borderWidth: 1,
        borderColor: '#13171f',
      },
    ],
  };

  const costDonutOptions = {
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
            const val = ctx.parsed;
            const pct = ((val / grandTotalCost) * 100).toFixed(1);
            return ` ${ctx.label}: ${fmtUSD(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '62%',
  };

  // ── 4. Customer Concentration ────────────────────────────────────────────
  const topCustomers = customerConcentration.slice(0, 8);
  const customerChartData = {
    labels: topCustomers.map(c => c.name.length > 18 ? `${c.name.substring(0, 16)}..` : c.name),
    datasets: [
      {
        type: 'bar',
        label: 'Contracted Revenue',
        data: topCustomers.map(c => c.revenue),
        backgroundColor: 'rgba(56, 139, 253, 0.7)',
        borderRadius: 3,
        yAxisID: 'yRev',
      },
      {
        type: 'line',
        label: 'Concentration Risk %',
        data: topCustomers.map(c => Number(c.concentrationRisk.toFixed(1))),
        borderColor: '#b3202b',
        backgroundColor: '#b3202b',
        borderWidth: 2,
        pointRadius: 3,
        yAxisID: 'yRisk',
      },
    ],
  };

  const customerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.yAxisID === 'yRev') {
              return ` Revenue: ${fmtUSD(ctx.parsed.y)}`;
            } else {
              return ` Concentration: ${ctx.parsed.y}%`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b94a5', font: { size: 9 }, maxRotation: 20, minRotation: 15 },
      },
      yRev: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#388bfd', callback: (v) => fmtUSD(v) },
      },
      yRisk: {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        min: 0,
        max: 100,
        ticks: { color: '#b3202b', callback: (v) => `${v}%` },
      },
    },
  };

  // ── 5. Revenue vs Margin % Bubble Quadrant ──────────────────────────────
  const bubbleChartData = {
    datasets: ROUTE_ORDER.map(rt => {
      const items = (bubbleData || []).filter(d => d?.routeType === rt);
      return {
        label: rt.replace(' (Pre-Blockade)', ''),
        data: items.map(d => ({
          x: d?.x || 0,
          y: Number(((d?.y || 0) * 100).toFixed(1)),
          r: d?.r || 5,
          customer: d?.customer || '',
          product: d?.product || '',
          cargoValue: d?.cargoValue || 0,
          marginUSD: d?.marginUSD || 0,
          shipmentId: d?.shipmentId || '',
        })),
        backgroundColor: (ROUTE_COLORS[rt] || '#8b94a5') + '90',
        borderColor: ROUTE_COLORS[rt] || '#8b94a5',
        borderWidth: 1,
      };
    }),
  };

  const bubbleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 8, font: { size: 10 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pt = ctx.raw;
            return [
              ` ${pt.shipmentId}: ${pt.customer}`,
              ` Cargo: ${pt.product} (${fmtUSD(pt.cargoValue)})`,
              ` Contract Revenue: ${fmtUSD(pt.x)}`,
              ` Gross Margin: ${pt.y}% (${fmtUSD(pt.marginUSD)})`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5', callback: (v) => fmtUSD(v) },
        title: { display: true, text: 'Contracted Freight Revenue', color: '#545d6e', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5', callback: (v) => `${v}%` },
        title: { display: true, text: 'Gross Margin %', color: '#545d6e', font: { size: 10 } },
      },
    },
  };

  return (
    <div>
      {/* Board Resolution Summary Banner */}
      <div className="board-brief">
        <div className="board-brief-header">
          <span className="board-brief-title">Level 2: Commercial & Margin Impact</span>
          <span style={{ fontSize: '0.75rem', color: '#8b94a5' }}>Prepared by Team Quantttt</span>
        </div>
        <div className="board-brief-q">
          "Where does disruption become a business problem, and which accounts absorb the economic shock?"
        </div>
        <div className="board-brief-grid">
          <div className="board-point">
            <span className="board-point-label red">Fixed Revenue Trap</span>
            <span className="board-point-desc">
              All $113.3M in freight revenue is contracted on pre-blockade ocean tariffs. Unhedged cost inflation on alternative corridors flows 100% into gross margin destruction.
            </span>
          </div>
          <div className="board-point">
            <span className="board-point-label amber">Extreme Concentration</span>
            <span className="board-point-desc">
              Top 2 energy customers (Meridian Energy & Zenith Crude) represent $88.8M (78.4%) of contracted revenue, concentrating catastrophic unit margin losses.
            </span>
          </div>
          <div className="board-point">
            <span className="board-point-label green">Emergency Distortion</span>
            <span className="board-point-desc">
              Overland & Air Bridge show -400% margin rates because spot emergency freight rates exceed ocean rates by 5x; however, they preserved $30M+ in critical payloads.
            </span>
          </div>
        </div>
      </div>

      {/* Analytical Notice on Margin Caveat */}
      <div className="notice-box">
        <span className="notice-icon">ℹ</span>
        <div style={{ flex: 1 }}>
          <strong>Analytical Context: Interpreting Negative Margins on Emergency Substitutes</strong>
          <p style={{ marginTop: '0.2rem', color: '#c9d1d9' }}>
            Air Bridge and Overland Truck display extreme negative margins (-400%) because spot logistics procurement costs far exceed contracted ocean tariffs. However, these shipments protected high-value client payloads (Pharma & High-Tech components). Conversely, Cape of Good Hope and Pipeline Bypass represent the true corporate balance sheet threat due to massive commodity volumes.
          </p>
          <button
            onClick={() => setShowCaveatDetails(!showCaveatDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d29922',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.72rem',
              marginTop: '0.35rem',
              padding: 0,
            }}
          >
            {showCaveatDetails ? 'Hide volume comparison' : 'View volume vs. margin distortion rationale →'}
          </button>
          {showCaveatDetails && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '4px', fontSize: '0.72rem' }}>
              • Air Bridge margin loss: <strong>-$1.02M</strong> total across 22 shipments (high % loss, modest $ impact).<br/>
              • Cape of Good Hope margin loss: <strong>-$26.35M</strong> total across 49 shipments (moderate % loss, severe $ impact).<br/>
              • Pipeline Bypass margin loss: <strong>-$130.36M</strong> total across 24 shipments (extreme $ impact due to crude volume multiplier).
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Margin Corridor & Cost-to-Serve Stack */}
      <div className="layout-2col">
        {/* Margin by Route */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Gross Margin by Route Corridor</div>
              <div className="card-subtitle">Comparing profitable direct baseline to alternative routes</div>
            </div>
            <div className="card-actions">
              <button
                className={`btn-sm ${marginMetric === 'total' ? 'active' : ''}`}
                onClick={() => setMarginMetric('total')}
              >
                Total ($)
              </button>
              <button
                className={`btn-sm ${marginMetric === 'pct' ? 'active' : ''}`}
                onClick={() => setMarginMetric('pct')}
              >
                Avg (%)
              </button>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Bar data={marginChartData} options={marginChartOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Direct sailings generated +$2.4M profit (+15.4%). Alternative corridors are deeply underwater, led by Pipeline Bypass (-$130.4M) and Cape (-$26.3M).
          </div>
        </div>

        {/* Cost-to-Serve Stack */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Cost-to-Serve Breakdown by Corridor</div>
              <div className="card-subtitle">Freight, Fuel, War Risk Insurance, and DIFOT Penalties</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Bar data={costBreakdownData} options={costBreakdownOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Fuel burn on Cape diversions and pipeline infrastructure surcharges drive over 80% of corporate cost inflation.
          </div>
        </div>
      </div>

      {/* Row 2: Expenditure Share (Donut / Pie) & Customer Concentration */}
      <div className="layout-2col">
        {/* Cost Allocation Donut / Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Expenditure Share (Pie / Donut View)</div>
              <div className="card-subtitle">Total cost-to-serve distribution across entire network</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '250px' }}>
            <Doughnut data={costDonutData} options={costDonutOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Bunker Fuel ($62M) and Base Freight ($55.7M) represent 78.5% of total expenses. Fuel surcharge indexing is the primary lever to restore solvency.
          </div>
        </div>

        {/* Customer Concentration */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Customer Concentration Exposure</div>
              <div className="card-subtitle">Top accounts by contracted volume vs. portfolio risk %</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '250px' }}>
            <Bar data={customerChartData} options={customerChartOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Extreme portfolio exposure to Meridian Energy ($66.1M) and Zenith Crude ($22.7M). Default or dispute with either account threatens corporate going-concern status.
          </div>
        </div>
      </div>

      {/* Row 3: Revenue vs Margin Bubble Quadrant */}
      <div className="layout-1col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Commercial Risk Quadrant: Revenue vs. Margin % (Bubble Size = Cargo Value)</div>
              <div className="card-subtitle">Surfacing high-revenue but margin-destroying voyages</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '280px' }}>
            <Bubble data={bubbleChartData} options={bubbleChartOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> High-revenue crude voyages clustered in the lower right (revenue &gt; $1M, margin &lt; -50%) are draining working capital at an unsustainable rate of $2.5M per voyage.
          </div>
        </div>
      </div>
    </div>
  );
}
