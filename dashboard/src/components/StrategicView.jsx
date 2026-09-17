/**
 * StrategicView.jsx
 * =================
 * Level 3: Strategic Exposure View
 * - Route Margin Sensitivity heatmap (Product Category × Route Type) — Prominently displayed
 * - War Risk Insurance Burden % (by Product Category & Cargo Type)
 * - Top 10 Highest-Exposure Lanes / Shipments ranked interactive DataGrid using @mui/x-data-grid
 */

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../utils/chartConfig';
import { ROUTE_COLORS, ROUTE_ORDER, fmtUSD, fmtPct } from '../utils/dataProcessor';

// Dark theme customized for MUI DataGrid in War Room
const darkGridTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#B3202B' },
    background: {
      default: '#16161f',
      paper: '#16161f',
    },
    text: {
      primary: '#f0f0f5',
      secondary: '#9595a8',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

export default function StrategicView({
  sensitivityHeatmap,
  productCategories,
  insuranceBurdenByProduct,
  insuranceBurdenByCargo,
  cargoTypes,
  topExposures,
}) {
  const [insuranceView, setInsuranceView] = useState('product'); // 'product' | 'cargo'
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // ── 1. Heatmap calculations & styling ────────────────────────────────────
  // Find max sensitivity for color intensity scaling
  let maxSens = 0;
  for (const pc of productCategories) {
    for (const rt of ROUTE_ORDER) {
      const val = sensitivityHeatmap[pc]?.[rt] || 0;
      if (val > maxSens) maxSens = val;
    }
  }

  function getHeatmapBg(val) {
    if (!val || val <= 0) return 'rgba(255, 255, 255, 0.02)';
    const ratio = Math.min(1, val / maxSens);
    // Gradient from transparent dark red to bright crimson
    return `rgba(179, 32, 43, ${0.15 + ratio * 0.85})`;
  }

  function getHeatmapTextColor(val) {
    if (!val || val === 0) return '#5a5a6e';
    const ratio = Math.min(1, val / maxSens);
    return ratio > 0.4 ? '#ffffff' : '#f0b0b5';
  }

  // Column totals for heatmap
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
        label: 'War Risk Insurance Burden (% of Cargo Value)',
        data: insuranceCategories.map(cat => {
          const b = insuranceDataMap[cat];
          const val = insuranceView === 'product' ? (b?.avgBurdenPct || 0) : ((b?.burdenPct || 0) * 100);
          return Number(val.toFixed(2));
        }),
        backgroundColor: insuranceCategories.map(cat => {
          const b = insuranceDataMap[cat];
          const val = insuranceView === 'product' ? (b?.avgBurdenPct || 0) : ((b?.burdenPct || 0) * 100);
          return val >= 1.25 ? '#B3202B' : val >= 1.0 ? '#FFB74D' : '#4FC3F7';
        }),
        borderRadius: 4,
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
        ticks: { color: '#8e8ea0', font: { size: 10 }, maxRotation: 25, minRotation: 15 },
      },
      y: {
        min: 0,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8e8ea0', callback: (v) => `${v}%` },
        title: { display: true, text: 'Insurance ÷ Cargo Value (%)', color: '#8e8ea0', font: { size: 11 } },
      },
    },
  };

  // ── 3. MUI DataGrid Columns Configuration ────────────────────────────────
  const columns = [
    {
      field: 'rank',
      headerName: '#',
      width: 50,
      renderCell: (params) => (
        <span style={{ fontWeight: 700, color: '#B3202B', fontFamily: 'monospace' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'shipmentId',
      headerName: 'Shipment ID',
      width: 110,
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4FC3F7' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1.2,
      minWidth: 160,
      renderCell: (params) => (
        <div style={{ fontWeight: 600, color: '#f0f0f5' }}>{params.value}</div>
      ),
    },
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'route',
      headerName: 'Route',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => {
        const color = ROUTE_COLORS[params.value] || '#999';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: `${color}20`,
              color: color,
              fontWeight: 600,
              fontSize: '0.72rem',
              border: `1px solid ${color}40`,
            }}
          >
            {params.value.replace(' (Pre-Blockade)', '')}
          </span>
        );
      },
    },
    {
      field: 'revenue',
      headerName: 'Contracted Rev',
      width: 125,
      type: 'number',
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace' }}>{fmtUSD(params.value)}</span>
      ),
    },
    {
      field: 'margin',
      headerName: 'Gross Margin ($)',
      width: 135,
      type: 'number',
      renderCell: (params) => {
        const isNeg = params.value < 0;
        return (
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: isNeg ? '#ef5350' : '#2ecc71',
            }}
          >
            {fmtUSD(params.value)}
          </span>
        );
      },
    },
    {
      field: 'marginPct',
      headerName: 'Margin %',
      width: 95,
      type: 'number',
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace', color: params.value < 0 ? '#ef5350' : '#2ecc71' }}>
          {fmtPct(params.value)}
        </span>
      ),
    },
    {
      field: 'difot',
      headerName: 'DIFOT',
      width: 80,
      renderCell: (params) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '100px',
            fontSize: '0.68rem',
            fontWeight: 700,
            background: params.value === 'Y' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(239, 83, 80, 0.15)',
            color: params.value === 'Y' ? '#2ecc71' : '#ef5350',
            border: `1px solid ${params.value === 'Y' ? '#2ecc7140' : '#ef535040'}`,
          }}
        >
          {params.value === 'Y' ? 'MET' : 'FAIL'}
        </span>
      ),
    },
    {
      field: 'exposureScore',
      headerName: 'Exposure Index',
      width: 140,
      renderCell: (params) => {
        const pct = Math.min(100, Math.round(params.value * 100));
        return (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                height: '6px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: pct >= 80 ? '#B3202B' : pct >= 60 ? '#FFB74D' : '#4FC3F7',
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#f0f0f5' }}>
              {pct}
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

  return (
    <section className="section" id="strategic-view">
      <div className="section-header">
        <span className="section-number">03</span>
        <h2 className="section-title">Strategic Exposure: Decision Metrics & Risk Ranking</h2>
        <span className="section-subtitle">Actionable intelligence for executive intervention</span>
      </div>

      {/* Heatmap: Route Margin Sensitivity USD */}
      <div className="chart-card full-width" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <div className="chart-title" style={{ margin: 0 }}>
              Decision Core: Route Margin Sensitivity ($) Matrix
            </div>
            <p style={{ fontSize: '0.75rem', color: '#8e8ea0', marginTop: '0.25rem' }}>
              Incremental cost/ton vs. product-specific pre-blockade benchmark × tons. Identifies where volume multiplier destroys operating cash flow.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#8e8ea0' }}>
            <span>Sensitivity Intensity:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} />
              <span>$0</span>
              <span style={{ width: '24px', height: '8px', background: 'linear-gradient(90deg, rgba(179,32,43,0.2), #B3202B)', borderRadius: '2px', margin: '0 4px' }} />
              <span>+$110M</span>
            </div>
          </div>
        </div>

        <div className="heatmap-container">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Product Category</th>
                {ROUTE_ORDER.map(rt => (
                  <th key={rt}>{rt.replace(' (Pre-Blockade)', '')}</th>
                ))}
                <th>Product Total</th>
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
                            className="heatmap-cell"
                            style={{
                              backgroundColor: getHeatmapBg(val),
                              color: getHeatmapTextColor(val),
                              fontWeight: val > 1e6 ? 700 : 500,
                              border: val > 1e7 ? '1px solid rgba(179,32,43,0.8)' : 'none',
                            }}
                          >
                            {val === 0 ? '—' : fmtUSD(val)}
                          </span>
                        </td>
                      );
                    })}
                    <td style={{ fontWeight: 700, color: rowTotal > 1e7 ? '#ef5350' : '#f0f0f5' }}>
                      {fmtUSD(rowTotal)}
                    </td>
                  </tr>
                );
              })}
              {/* Route Totals Row */}
              <tr style={{ background: 'rgba(255,255,255,0.02)', fontWeight: 700 }}>
                <td>Route Total</td>
                {ROUTE_ORDER.map(rt => (
                  <td key={rt} style={{ color: routeTotals[rt] > 1e7 ? '#ef5350' : '#f0f0f5' }}>
                    {fmtUSD(routeTotals[rt])}
                  </td>
                ))}
                <td style={{ color: '#B3202B', fontSize: '0.85rem' }}>
                  {fmtUSD(Object.values(routeTotals).reduce((a, b) => a + b, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="chart-caption">
          <strong>SO WHAT:</strong> Pipeline Bypass for Crude Oil represents an astonishing <strong>+$110.4M</strong> in margin sensitivity, followed by Cape diversions (+$23.1M) and Refined Petrochem on Pipeline (+$24.4M). Crude Oil alone accounts for 80%+ of total corporate margin vulnerability.
        </p>
      </div>

      <div className="chart-grid">
        {/* War Risk Insurance Burden */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="chart-title" style={{ margin: 0 }}>War Risk Insurance Burden %</div>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setInsuranceView('product')}
                style={{
                  background: insuranceView === 'product' ? '#B3202B' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                By Product
              </button>
              <button
                onClick={() => setInsuranceView('cargo')}
                style={{
                  background: insuranceView === 'cargo' ? '#B3202B' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                By Vessel/Cargo
              </button>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '280px' }}>
            <Bar data={insuranceChartData} options={insuranceChartOptions} />
          </div>
          <p className="chart-caption">
            <strong>SO WHAT:</strong> Crude Oil VLCCs and Consumer Goods bear the heaviest insurance surcharge (1.34% of entire cargo value), as underwriters price in drone and missile threats in the Gulf basin.
          </p>
        </div>

        {/* Methodology & Weighting Rationale Card */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="chart-title">Exposure Scoring Methodology</div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: '#ef5350', fontWeight: 600 }}>• Margin Erosion Magnitude:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>40%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: '#FFB74D', fontWeight: 600 }}>• DIFOT Failure Penalties:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>30%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: '#4FC3F7', fontWeight: 600 }}>• Customer Concentration:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>20%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#AB47BC', fontWeight: 600 }}>• War Risk Insurance Burden:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>10%</span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#9595a8', marginTop: '1rem', lineHeight: 1.6 }}>
              This composite index reflects boardroom exposure: voyages that combine severe unrecoverable dollar losses, contractual service failure penalties, and concentration with our two key energy accounts.
            </p>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(179,32,43,0.1)', border: '1px solid rgba(179,32,43,0.3)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#ef5350', fontWeight: 700, textTransform: 'uppercase' }}>
              CRITICAL THRESHOLD
            </span>
            <p style={{ fontSize: '0.75rem', color: '#f0f0f5', marginTop: '0.2rem' }}>
              Any shipment scoring &gt; 70 requires immediate executive intervention, legal review of force majeure clauses, and customer re-contracting.
            </p>
          </div>
        </div>
      </div>

      {/* Top 10 Exposure Interactive DataGrid (@mui/x-data-grid) */}
      <div className="chart-card full-width" style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div className="chart-title" style={{ margin: 0 }}>
              Top 10 Highest-Exposure Lanes & Shipments (MUI Interactive Grid)
            </div>
            <p style={{ fontSize: '0.75rem', color: '#8e8ea0', marginTop: '0.25rem' }}>
              Ranked by composite exposure score. Click column headers to sort or filter.
            </p>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8e8ea0', fontFamily: 'monospace' }}>
            Built with @mui/x-data-grid
          </div>
        </div>

        <div className="exposure-table-wrapper" style={{ height: 420, width: '100%' }}>
          <ThemeProvider theme={darkGridTheme}>
            <DataGrid
              rows={gridRows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              density="compact"
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(179, 32, 43, 0.08) !important',
                },
              }}
            />
          </ThemeProvider>
        </div>

        <p className="chart-caption">
          <strong>SO WHAT:</strong> The top 5 highest-exposure voyages alone represent <strong>-$35.8M</strong> in cumulative negative gross margin, all contracted to Meridian Energy Partners across Pipeline Bypass and Cape diversions with 100% DIFOT failures.
        </p>
      </div>
    </section>
  );
}
