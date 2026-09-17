/**
 * App.jsx
 * =======
 * Executive War Room Dashboard — Strait of Hormuz Disruption (2026)
 * Developed by Team Quantttt
 *
 * Professional 3-Page Architecture:
 * - Page 01: Operations & Transit Schedules
 * - Page 02: Commercial Economics & Customer Exposure
 * - Page 03: Strategy & Action Decisions
 * + Embedded Executive Intelligence Advisor Chatbot with rigorous domain guardrails.
 */

import React, { useEffect, useState } from 'react';
import { loadData } from './utils/dataProcessor';
import TopNavbar from './components/TopNavbar';
import KpiBar from './components/KpiBar';
import PageOperations from './components/PageOperations';
import PageCommercial from './components/PageCommercial';
import PageStrategic from './components/PageStrategic';
import ExecutiveChatbot from './components/ExecutiveChatbot';

export default function App() {
  const [dataState, setDataState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const [activePage, setActivePage] = useState('operations'); // 'operations' | 'commercial' | 'strategic'

  useEffect(() => {
    loadData()
      .then((res) => {
        setDataState({
          loading: false,
          error: null,
          data: res,
        });
      })
      .catch((err) => {
        console.error('Error loading shipment dataset:', err);
        setDataState({
          loading: false,
          error: err.message || 'Failed to parse shipment records',
          data: null,
        });
      });
  }, []);

  if (dataState.loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem',
        color: '#8b94a5',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #232936',
          borderTopColor: '#b3202b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f3f7' }}>
          Team Quantttt War Room Initializing...
        </div>
        <div style={{ fontSize: '0.72rem', color: '#545d6e', fontFamily: 'monospace' }}>
          Parsing 244 shipment records • Normalizing regions • Initializing AI decision advisor
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (dataState.error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem',
        color: '#f87171',
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Data Stream Error</div>
        <div style={{ fontSize: '0.85rem', color: '#8b94a5' }}>{dataState.error}</div>
      </div>
    );
  }

  const { data } = dataState;

  return (
    <div className="app-container">
      {/* Top Minimal Navigation Bar with Team Quantttt Branding */}
      <TopNavbar
        activePage={activePage}
        setActivePage={setActivePage}
        dateRange={data.dateRange}
      />

      {/* Persistent 5-KPI Executive Strip */}
      <KpiBar kpis={data.kpis} />

      {/* 3 Dedicated Sorted Pages */}
      <main>
        {activePage === 'operations' && (
          <PageOperations
            weeklyRouteMix={data.weeklyRouteMix}
            weekLabels={data.weekLabels}
            transitByRoute={data.transitByRoute}
            heldAvgStuck={data.heldAvgStuck}
            difotByRoute={data.difotByRoute}
            difotByProduct={data.difotByProduct}
            productCategories={data.productCategories}
            kpis={data.kpis}
          />
        )}

        {activePage === 'commercial' && (
          <PageCommercial
            marginByRoute={data.marginByRoute}
            costBreakdownByRoute={data.costBreakdownByRoute}
            customerConcentration={data.customerConcentration}
            bubbleData={data.bubbleData}
          />
        )}

        {activePage === 'strategic' && (
          <PageStrategic
            sensitivityHeatmap={data.sensitivityHeatmap}
            productCategories={data.productCategories}
            insuranceBurdenByProduct={data.insuranceBurdenByProduct}
            insuranceBurdenByCargo={data.insuranceBurdenByCargo}
            cargoTypes={data.cargoTypes}
            topExposures={data.topExposures}
            recommendations={data.recommendations}
          />
        )}
      </main>

      {/* Embedded Executive AI Advisor Chatbot */}
      <ExecutiveChatbot kpis={data.kpis} />

      {/* Understated Institutional Footer */}
      <footer style={{
        marginTop: '3.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid #232936',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem',
        color: '#545d6e',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <strong>CONFIDENTIAL // FOR BOARD REVIEW ONLY</strong> — Developed by <strong>Team Quantttt</strong>
        </div>
        <div style={{ fontFamily: 'monospace' }}>
          AI Intelligence Online • 244 Shipments Analyzed • Client-Side Synthesis
        </div>
      </footer>
    </div>
  );
}
