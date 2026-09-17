/**
 * CommercialView.jsx
 * ==================
 * Level 2: Commercial & margin dynamics
 * - Gross margin $ and % by Route Type with toggle/annotation for emergency substitute distortion
 * - Cost-to-serve breakdown (Freight, Fuel, Insurance, Penalty) as stacked bar
 * - Customer concentration (Contracted Revenue with Concentration Risk % overlay)
 * - Scatter/Quadrant chart: Contracted Revenue (x) vs Gross Margin % (y), bubble size = Cargo Value
 */

import React, { useState } from 'react';
import { Bar, Bubble } from 'react-chartjs-2';
import '../utils/chartConfig';
import { ROUTE_COLORS, ROUTE_ORDER, fmtUSD, fmtPct } from '../utils/dataProcessor';

export default function CommercialView({
  marginByRoute,
  costBreakdownByRoute,
  customerConcentration,
  bubbleData,
}) {
  const [showCaveatDetails, setShowCaveatDetails] = useState(false);
  const [marginMetric, setMarginMetric] = useState('total'); // 'total' | 'pct'

  // ── 1. Gross Margin by Route Type ───────────────────────────────────────
  const marginChartData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        label: marginMetric === 'total' ? 'Total Gross Margin ($)' : 'Gross Margin (%)',
        data: ROUTE_ORDER.map(rt => {
          if (marginMetric === 'total') {
            return marginByRoute[rt]?.totalMargin || 0;
          } else {
            return Number(((marginByRoute[rt]?.avgMarginPct || 0) * 100).toFixed(1));
          }
        }),
        backgroundColor: ROUTE_ORDER.map(rt => {
          const val = marginMetric === 'total'
            ? (marginByRoute[rt]?.totalMargin || 0)
            : (marginByRoute[rt]?.avgMarginPct || 0);
          return val >= 0 ? '#2ecc71' : '#ef5350';
        }),
        borderRadius: 4,
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
              ` ${ctx.dataset.label}: ${marginMetric === 'total' ? fmtUSD(ctx.parsed.y) : `${ctx.parsed.y}%`}`,
              ` Revenue: ${fmtUSD(m?.totalRevenue || 0)}`,
              ` Voyages: ${m?.count || 0}`,
              m?.isEmergency ? ' [!] Emergency Mode (Priced at spot premiums)' : '',
            ].filter(Boolean);
          },
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
        ticks: {
          color: '#8e8ea0',
          callback: (v) => (marginMetric === 'total' ? fmtUSD(v) : `${v}%`),
        },
        title: {
          display: true,
          text: marginMetric === 'total' ? 'USD Gross Margin' : 'Average Margin %',
          color: '#8e8ea0',
          font: { size: 11 },
        },
      },
    },
  };

  // ── 2. Cost-to-Serve Breakdown (Stacked Bar) ───────────────────────────
  const costBreakdownData = {
    labels: ROUTE_ORDER.map(r => r.replace(' (Pre-Blockade)', '')),
    datasets: [
      {
        label: 'Freight Cost',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute[rt]?.freight || 0),
        backgroundColor: '#4FC3F7',
        stack: 'cost',
      },
      {
        label: 'Fuel Cost',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute[rt]?.fuel || 0),
        backgroundColor: '#FFB74D',
        stack: 'cost',
      },
      {
        label: 'War Risk Insurance',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute[rt]?.insurance || 0),
        backgroundColor: '#AB47BC',
        stack: 'cost',
      },
      {
        label: 'Delay Penalties (DIFOT)',
        data: ROUTE_ORDER.map(rt => costBreakdownByRoute[rt]?.penalty || 0),
        backgroundColor: '#EF5350',
        stack: 'cost',
      },
    ],
  };

  const costBreakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
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
        ticks: { color: '#8e8ea0', font: { size: 10 } },
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', callback: (v) => fmtUSD(v) },
        title: { display: true, text: 'Total Cost-to-Serve (USD)', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  // ── 3. Customer Concentration ──────────────────────────────────────────
  const top10Customers = customerConcentration.slice(0, 10);
  const customerChartData = {
    labels: top10Customers.map(c => c.name.length > 18 ? `${c.name.substring(0, 16)}...` : c.name),
    datasets: [
      {
        type: 'bar',
        label: 'Contracted Revenue ($)',
        data: top10Customers.map(c => c.revenue),
        backgroundColor: 'rgba(79, 195, 247, 0.75)',
        borderColor: '#4FC3F7',
        borderWidth: 1,
        yAxisID: 'yRev',
        borderRadius: 4,
      },
      {
        type: 'line',
        label: 'Concentration Risk %',
        data: top10Customers.map(c => Number(c.concentrationRisk.toFixed(1))),
        borderColor: '#B3202B',
        backgroundColor: '#B3202B',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'yRisk',
      },
    ],
  };

  const customerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.yAxisID === 'yRev') {
              return ` Contracted Revenue: ${fmtUSD(ctx.parsed.y)}`;
            } else {
              return ` Concentration Risk: ${ctx.parsed.y}%`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8e8ea0', font: { size: 9 }, maxRotation: 30, minRotation: 20 },
      },
      yRev: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#4FC3F7', callback: (v) => fmtUSD(v) },
        title: { display: true, text: 'Contracted Revenue', color: '#4FC3F7', font: { size: 10 } },
      },
      yRisk: {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        min: 0,
        max: 100,
        ticks: { color: '#B3202B', callback: (v) => `${v}%` },
        title: { display: true, text: 'Concentration Risk %', color: '#B3202B', font: { size: 10 } },
      },
    },
  };

  // ── 4. Scatter/Bubble: Revenue vs Gross Margin % ────────────────────────
  // Quadrant visualization: High Revenue + Negative Margin = Crisis zone
  const bubbleChartData = {
    datasets: ROUTE_ORDER.map(rt => {
      const items = bubbleData.filter(d => d.routeType === rt);
      return {
        label: rt,
        data: items.map(d => ({
          x: d.x,
          y: Number((d.y * 100).toFixed(1)),
          r: d.r,
          customer: d.customer,
          product: d.product,
          cargoValue: d.cargoValue,
          marginUSD: d.marginUSD,
          shipmentId: d.shipmentId,
        })),
        backgroundColor: ROUTE_COLORS[rt] + '99',
        borderColor: ROUTE_COLORS[rt],
        borderWidth: 1.5,
      };
    }),
  };

  const bubbleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 10 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pt = ctx.raw;
            return [
              ` ${pt.shipmentId} (${pt.customer})`,
              ` Product: ${pt.product}`,
              ` Revenue: ${fmtUSD(pt.x)} | Margin %: ${pt.y}%`,
              ` Net Margin: ${fmtUSD(pt.marginUSD)}`,
              ` Cargo Value: ${fmtUSD(pt.cargoValue)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', callback: (v) => fmtUSD(v) },
        title: { display: true, text: 'Contracted Freight Revenue (USD)', color: '#8e8ea0', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', callback: (v) => `${v}%` },
        title: { display: true, text: 'Gross Margin %', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  return (
    <section className="section" id="commercial-view">
      <div className="section-header">
        <span className="section-number">02</span>
        <h2 className="section-title">Commercial & Margin Exposure: Revenue vs. Cost-to-Serve</h2>
        <span className="section-subtitle">Where fixed contracts absorb unhedged cost escalations</span>
      </div>

      {/* Analytical Caveat Banner */}
      <div className="caveat-banner">
        <span className="icon" style={{ fontWeight: 700 }}>!</span>
        <div style={{ flex: 1 }}>
          <strong>Analytical Notice: Emergency Route Margin Distortion</strong>
          <p style={{ marginTop: '0.25rem' }}>
            Gross Margin % appears deeply negative (-400% on Air Bridge, -384% on Pipeline) because emergency substitute capacity was procured at spot rates while contracted revenue remained frozen at pre-blockade ocean tariffs. For high-value goods (e.g. Pharmaceuticals), paying a $100K logistics premium saved a $12M cargo line from default.
          </p>
          <button
            onClick={() => setShowCaveatDetails(!showCaveatDetails)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFB74D',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.72rem',
              marginTop: '0.35rem',
              padding: 0,
            }}
          >
            {showCaveatDetails ? 'Hide technical explanation' : 'Show why cargo value context is critical →'}
          </button>
          {showCaveatDetails && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.72rem' }}>
              Sorting naively by "worst margin %" would flag small Air shipments as the biggest crisis, when in fact Cape diversions on Bulk Crude VLCCs account for <strong>$26.3M in margin destruction</strong> and Pipeline Bypass accounts for <strong>$130M</strong> due to massive tonnage scale.
            </div>
          )}
        </div>
      </div>

      <div className="chart-grid">
        {/* Chart 1: Gross Margin by Route */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="chart-title" style={{ margin: 0 }}>Gross Margin by Route Type</div>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setMarginMetric('total')}
                style={{
                  background: marginMetric === 'total' ? '#B3202B' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                Total ($)
              </button>
              <button
                onClick={() => setMarginMetric('pct')}
                style={{
                  background: marginMetric === 'pct' ? '#B3202B' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                Avg (%)
              </button>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '280px' }}>
            <Bar data={marginChartData} options={marginChartOptions} />
          </div>
          <p className="chart-caption">
            <strong>SO WHAT:</strong> Direct pre-blockade routes generated +$2.4M positive margin (+15.4%). Every alternative route runs at catastrophic losses: Pipeline Bypass (-$130M), Held in Gulf (-$34.3M), and Cape of Good Hope (-$26.3M).
          </p>
        </div>

        {/* Chart 2: Cost-to-Serve Breakdown */}
        <div className="chart-card">
          <div className="chart-title">Cost-to-Serve Stack: Freight vs. Fuel vs. Insurance vs. Penalties</div>
          <div className="chart-wrapper" style={{ height: '280px' }}>
            <Bar data={costBreakdownData} options={costBreakdownOptions} />
          </div>
          <p className="chart-caption">
            <strong>SO WHAT:</strong> On Cape diversions, Fuel ($18.8M) and Freight ($12.5M) constitute 86% of total expenses. On Held in Gulf, Penalty costs and War Risk insurance accumulate daily without recognized revenue.
          </p>
        </div>

        {/* Chart 3: Customer Concentration */}
        <div className="chart-card">
          <div className="chart-title">Top 10 Customers: Contracted Revenue vs. Concentration Risk</div>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bar data={customerChartData} options={customerChartOptions} />
          </div>
          <p className="chart-caption">
            <strong>SO WHAT:</strong> Extreme commercial vulnerability: Meridian Energy Partners ($66.1M) and Zenith Crude Traders ($22.7M) represent 78.4% of total contracted revenue. Any unilateral cancellation by either customer would collapse the carrier's solvency.
          </p>
        </div>

        {/* Chart 4: Bubble / Scatter Quadrant */}
        <div className="chart-card">
          <div className="chart-title">Shipment Exposure Quadrant: Revenue vs. Margin % (Size = Cargo Value)</div>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bubble data={bubbleChartData} options={bubbleChartOptions} />
          </div>
          <p className="chart-caption">
            <strong>SO WHAT:</strong> The bottom-right quadrant highlights the core commercial crisis: large VLCC Crude and Petrochem voyages generating $1M–$3M in contracted revenue that operate at -50% to -400% margins, draining working capital.
          </p>
        </div>
      </div>
    </section>
  );
}
