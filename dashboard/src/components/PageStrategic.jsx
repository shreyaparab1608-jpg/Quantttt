/**
 * PageStrategic.jsx
 * =================
 * Page 3: Strategic Decisions & Executive Action Plan
 * Features: Route Margin Sensitivity Heatmap Matrix, War Risk Insurance Burden,
 * Cargo Asset Value Share (Doughnut / Pie), Top 10 Exposure DataGrid (@mui/x-data-grid),
 * and Executive Action Blueprint (Protect, Change, Stop).
 */

import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../utils/chartConfig';
import { ROUTE_COLORS, ROUTE_ORDER, fmtUSD } from '../utils/dataProcessor';

// Minimalist dark theme for MUI DataGrid
const minimalGridTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#13171f',
      paper: '#13171f',
    },
    text: {
      primary: '#f1f3f7',
      secondary: '#8b94a5',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

export default function PageStrategic({
  sensitivityHeatmap,
  productCategories,
  insuranceBurdenByProduct,
  insuranceBurdenByCargo,
  cargoTypes,
  topExposures,
  recommendations,
}) {
  const [insuranceView, setInsuranceView] = useState('product'); // 'product' | 'cargo'
  const [actionFilter, setActionFilter] = useState('all'); // 'all' | 'protect' | 'change' | 'stop'

  // ── 1. Heatmap intensity styling ─────────────────────────────────────────
  let maxSens = 0;
  for (const pc of productCategories) {
    for (const rt of ROUTE_ORDER) {
      const val = sensitivityHeatmap[pc]?.[rt] || 0;
      if (val > maxSens) maxSens = val;
    }
  }

  function getHeatmapBg(val) {
    if (!val || val <= 0) return 'transparent';
    const ratio = Math.min(1, val / maxSens);
    return `rgba(179, 32, 43, ${0.12 + ratio * 0.75})`;
  }

  function getHeatmapTextColor(val) {
    if (!val || val === 0) return '#545d6e';
    const ratio = Math.min(1, val / maxSens);
    return ratio > 0.4 ? '#ffffff' : '#f87171';
  }

  // Column totals
  const routeTotals = {};
  for (const rt of ROUTE_ORDER) {
    routeTotals[rt] = productCategories.reduce(
      (sum, pc) => sum + (sensitivityHeatmap[pc]?.[rt] || 0),
      0
    );
  }

  // ── 2. Insurance Burden Chart ────────────────────────────────────────────
  const insuranceCategories = insuranceView === 'product' ? productCategories : cargoTypes;
  const insuranceDataMap = insuranceView === 'product' ? insuranceBurdenByProduct : insuranceBurdenByCargo;

  const insuranceChartData = {
    labels: insuranceCategories,
    datasets: [
      {
        data: insuranceCategories.map(cat => {
          const b = insuranceDataMap[cat];
          const val = insuranceView === 'product' ? (b?.avgBurdenPct || 0) : ((b?.burdenPct || 0) * 100);
          return Number(val.toFixed(2));
        }),
        backgroundColor: insuranceCategories.map(cat => {
          const b = insuranceDataMap[cat];
          const val = insuranceView === 'product' ? (b?.avgBurdenPct || 0) : ((b?.burdenPct || 0) * 100);
          return val >= 1.25 ? '#b3202b' : val >= 1.0 ? '#d29922' : '#388bfd';
        }),
        borderRadius: 3,
      },
    ],
  };

  const insuranceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Insurance Burden: ${ctx.parsed.y}% of Cargo Value`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b94a5', font: { size: 9 }, maxRotation: 20, minRotation: 15 },
      },
      y: {
        min: 0,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b94a5', callback: (v) => `${v}%` },
      },
    },
  };

  // ── 3. Cargo Asset Value Exposure (Doughnut / Pie Chart) ─────────────────
  const productColors = ['#d29922', '#388bfd', '#8957e5', '#238636', '#f0883e', '#b3202b'];
  const cargoValues = productCategories.map(pc => insuranceBurdenByProduct[pc]?.totalCargoValue || 0);
  const totalCargoValueSum = cargoValues.reduce((a, b) => a + b, 0);

  const cargoDonutData = {
    labels: productCategories,
    datasets: [
      {
        data: cargoValues,
        backgroundColor: productColors,
        borderWidth: 1,
        borderColor: '#13171f',
      },
    ],
  };

  const cargoDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 10, font: { size: 10 }, padding: 6 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed;
            const pct = ((val / totalCargoValueSum) * 100).toFixed(1);
            return ` ${ctx.label}: ${fmtUSD(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '62%',
  };

  // ── 4. MUI DataGrid Columns ──────────────────────────────────────────────
  const columns = [
    {
      field: 'rank',
      headerName: '#',
      width: 45,
      renderCell: (params) => (
        <span style={{ fontWeight: 600, color: '#8b94a5', fontFamily: 'monospace' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'shipmentId',
      headerName: 'Shipment',
      width: 105,
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#388bfd' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <span style={{ fontWeight: 500, color: '#f1f3f7' }}>{params.value}</span>
      ),
    },
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span style={{ color: '#8b94a5' }}>{params.value}</span>
      ),
    },
    {
      field: 'route',
      headerName: 'Route Corridor',
      flex: 1.1,
      minWidth: 135,
      renderCell: (params) => {
        const color = ROUTE_COLORS[params.value] || '#999';
        return (
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: `${color}18`,
              color: color,
              fontWeight: 500,
              fontSize: '0.72rem',
              border: `1px solid ${color}35`,
            }}
          >
            {params.value.replace(' (Pre-Blockade)', '')}
          </span>
        );
      },
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 115,
      type: 'number',
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace' }}>{fmtUSD(params.value)}</span>
      ),
    },
    {
      field: 'margin',
      headerName: 'Margin ($)',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: params.value < 0 ? '#f87171' : '#4ade80',
          }}
        >
          {fmtUSD(params.value)}
        </span>
      ),
    },
    {
      field: 'difot',
      headerName: 'DIFOT',
      width: 75,
      renderCell: (params) => (
        <span
          style={{
            padding: '1px 6px',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 600,
            background: params.value === 'Y' ? 'rgba(35, 134, 54, 0.2)' : 'rgba(179, 32, 43, 0.2)',
            color: params.value === 'Y' ? '#4ade80' : '#f87171',
            border: `1px solid ${params.value === 'Y' ? '#238636' : '#b3202b'}`,
          }}
        >
          {params.value === 'Y' ? 'PASS' : 'FAIL'}
        </span>
      ),
    },
    {
      field: 'exposureScore',
      headerName: 'Exposure Score',
      width: 130,
      renderCell: (params) => {
        const scoreVal = Math.min(100, Math.round(params.value * 100));
        return (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '5px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${scoreVal}%`,
                  height: '100%',
                  background: scoreVal >= 80 ? '#b3202b' : scoreVal >= 60 ? '#d29922' : '#388bfd',
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600, color: '#f1f3f7' }}>
              {scoreVal}
            </span>
          </div>
        );
      },
    },
  ];

  const gridRows = topExposures.map((item, idx) => ({
    id: item.shipmentId,
    rank: idx + 1,
    ...item,
  }));

  const filteredRecs = actionFilter === 'all'
    ? recommendations
    : recommendations.filter(r => r.type === actionFilter);

  return (
    <div>
      {/* Board Resolution Summary Banner */}
      <div className="board-brief">
        <div className="board-brief-header">
          <span className="board-brief-title">Level 3: Strategic Exposure & Interventions</span>
          <span style={{ fontSize: '0.75rem', color: '#8b94a5' }}>Advised by Team Quantttt</span>
        </div>
        <div className="board-brief-q">
          "Which exposures should be accepted, renegotiated, mitigated, diversified, or exited?"
        </div>
        <div className="board-brief-grid">
          <div className="board-point">
            <span className="board-point-label red">Sensitivity Epicenter</span>
            <span className="board-point-desc">
              Crude Oil on Pipeline Bypass represents <strong>+$110.4M</strong> in route margin sensitivity (incremental cost/ton vs benchmark × tons), the single largest exposure in the enterprise.
            </span>
          </div>
          <div className="board-point">
            <span className="board-point-label amber">War Risk Toll</span>
            <span className="board-point-desc">
              War Risk insurance averages 1.34% of cargo value on VLCC liquid bulk voyages, adding up to $270,000 per voyage in non-recoverable premiums.
            </span>
          </div>
          <div className="board-point">
            <span className="board-point-label green">Board Decision Mandate</span>
            <span className="board-point-desc">
              Enforce emergency fuel surcharges on Cape sailings, halt Air/Truck on bulk commodities, and legally petition force majeure on trapped Gulf charters.
            </span>
          </div>
        </div>
      </div>

      {/* 1. Heatmap: Route Margin Sensitivity Matrix */}
      <div className="layout-1col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Route Margin Sensitivity ($) Matrix</div>
              <div className="card-subtitle">
                Incremental cost/ton vs. product-specific pre-blockade Direct benchmark × tons
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8b94a5', fontFamily: 'monospace' }}>
              Prominent Decision Metric
            </div>
          </div>

          <div className="matrix-table-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Product Category</th>
                  {ROUTE_ORDER.map(rt => (
                    <th key={rt}>{rt.replace(' (Pre-Blockade)', '')}</th>
                  ))}
                  <th>Total Exposure</th>
                </tr>
              </thead>
              <tbody>
                {productCategories.map(pc => {
                  const rowTotal = ROUTE_ORDER.reduce(
                    (sum, rt) => sum + (sensitivityHeatmap[pc]?.[rt] || 0),
                    0
                  );
                  return (
                    <tr key={pc}>
                      <td>{pc}</td>
                      {ROUTE_ORDER.map(rt => {
                        const val = sensitivityHeatmap[pc]?.[rt] || 0;
                        return (
                          <td key={rt}>
                            <span
                              className="matrix-cell"
                              style={{
                                backgroundColor: getHeatmapBg(val),
                                color: getHeatmapTextColor(val),
                                fontWeight: val > 1e6 ? 600 : 400,
                              }}
                            >
                              {val === 0 ? '—' : fmtUSD(val)}
                            </span>
                          </td>
                        );
                      })}
                      <td style={{ fontWeight: 600, color: rowTotal > 1e7 ? '#f87171' : '#f1f3f7' }}>
                        {fmtUSD(rowTotal)}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ fontWeight: 600, borderTop: '2px solid #232936' }}>
                  <td>Route Total</td>
                  {ROUTE_ORDER.map(rt => (
                    <td key={rt} style={{ color: routeTotals[rt] > 1e7 ? '#f87171' : '#f1f3f7' }}>
                      {fmtUSD(routeTotals[rt])}
                    </td>
                  ))}
                  <td style={{ color: '#b3202b', fontWeight: 700 }}>
                    {fmtUSD(Object.values(routeTotals).reduce((a, b) => a + b, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="so-what">
            <strong>Key Finding:</strong> Crude Oil on Pipeline Bypass (+$110.4M) and Cape of Good Hope (+$23.1M) accounts for 85%+ of total margin sensitivity. Immediate fuel indexation and tariff renegotiation on crude is non-negotiable.
          </div>
        </div>
      </div>

      {/* 2. War Risk Insurance Burden & Cargo Asset Value Exposure (Pie / Donut) */}
      <div className="layout-2col">
        {/* War Risk Insurance Burden */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">War Risk Insurance Burden %</div>
              <div className="card-subtitle">Insurance cost as percentage of cargo asset value</div>
            </div>
            <div className="card-actions">
              <button
                className={`btn-sm ${insuranceView === 'product' ? 'active' : ''}`}
                onClick={() => setInsuranceView('product')}
              >
                By Product
              </button>
              <button
                className={`btn-sm ${insuranceView === 'cargo' ? 'active' : ''}`}
                onClick={() => setInsuranceView('cargo')}
              >
                By Vessel
              </button>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Bar data={insuranceChartData} options={insuranceChartOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Bulk Liquid VLCCs face the highest insurance burden (1.34%), as marine underwriters charge peak war risk premiums for Persian Gulf transit.
          </div>
        </div>

        {/* Cargo Asset Value Share (Donut / Pie Chart) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Cargo Asset Exposure (Pie / Donut View)</div>
              <div className="card-subtitle">Distribution of total cargo value across commodity categories</div>
            </div>
          </div>
          <div className="chart-box" style={{ height: '240px' }}>
            <Doughnut data={cargoDonutData} options={cargoDonutOptions} />
          </div>
          <div className="so-what">
            <strong>Key Finding:</strong> Crude Oil represents the single largest cargo value pool ($189M+), amplifying both total war risk premiums and counterparty default exposure.
          </div>
        </div>
      </div>

      {/* 3. Top 10 Exposure Table via @mui/x-data-grid */}
      <div className="layout-1col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top 10 Highest-Exposure Lanes & Shipments</div>
              <div className="card-subtitle">
                Ranked using composite exposure score (40% Margin + 30% DIFOT + 20% Concentration + 10% Insurance) • Powered by @mui/x-data-grid
              </div>
            </div>
          </div>

          <div className="grid-container" style={{ width: '100%', minHeight: 420 }}>
            <ThemeProvider theme={minimalGridTheme}>
              <DataGrid
                rows={gridRows}
                columns={columns}
                autoHeight
                disableRowSelectionOnClick
                density="compact"
                hideFooter
                sx={{
                  border: '1px solid #232936',
                  borderRadius: '6px',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #232936',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    borderBottom: '1px solid #232936',
                    backgroundColor: '#1a1f2c',
                  },
                }}
              />
            </ThemeProvider>
          </div>

          <div className="so-what">
            <strong>Key Finding:</strong> Meridian Energy Partners accounts for all 5 highest-exposure voyages, with margin losses exceeding -$5M per trip across Pipeline Bypass and Cape corridors.
          </div>
        </div>
      </div>

      {/* 4. Action Blueprint: What to Protect, Change, Stop */}
      <div className="layout-1col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Executive Action Blueprint: Board Directives</div>
              <div className="card-subtitle">Developed by Team Quantttt • Accountable owners with operational triggers</div>
            </div>
            <div className="card-actions">
              <button
                className={`btn-sm ${actionFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActionFilter('all')}
              >
                All ({recommendations.length})
              </button>
              <button
                className={`btn-sm ${actionFilter === 'protect' ? 'active' : ''}`}
                onClick={() => setActionFilter('protect')}
              >
                Protect
              </button>
              <button
                className={`btn-sm ${actionFilter === 'change' ? 'active' : ''}`}
                onClick={() => setActionFilter('change')}
              >
                Change
              </button>
              <button
                className={`btn-sm ${actionFilter === 'stop' ? 'active' : ''}`}
                onClick={() => setActionFilter('stop')}
              >
                Stop
              </button>
            </div>
          </div>

          <div className="actions-grid">
            {filteredRecs.map((rec, idx) => (
              <div key={idx} className={`action-card ${rec.type}`}>
                <div>
                  <span className="action-tag">
                    {rec.type === 'protect' ? 'What to Protect' : rec.type === 'change' ? 'What to Change' : 'What to Stop'}
                  </span>
                  <p className="action-text">{rec.action}</p>
                </div>

                <div className="action-meta">
                  <div className="action-meta-row">
                    <span className="action-meta-label">Owner</span>
                    <span className="action-meta-val">{rec.owner}</span>
                  </div>
                  <div className="action-meta-row">
                    <span className="action-meta-label">Horizon</span>
                    <span className="action-meta-val">{rec.horizon}</span>
                  </div>
                  <div className="action-meta-row" style={{ flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    <span className="action-meta-label">Operational Trigger:</span>
                    <span className="action-meta-val" style={{ color: '#d29922' }}>{rec.trigger}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
