/**
 * KpiBar.jsx
 * ==========
 * Institutional 5-metric executive strip computed directly from shipment logs.
 */

import React from 'react';
import { fmtUSD, fmtPct, fmtNum } from '../utils/dataProcessor';

export default function KpiBar({ kpis }) {
  return (
    <div className="kpi-row">
      <div className="kpi-box">
        <div className="kpi-box-label">Total Shipments</div>
        <div className="kpi-box-value">{fmtNum(kpis.totalShipments)}</div>
        <div className="kpi-box-sub">{kpis.trappedCount} vessels held in Gulf</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-box-label">Contracted Revenue</div>
        <div className="kpi-box-value">{fmtUSD(kpis.totalContractedRevenue)}</div>
        <div className="kpi-box-sub">Fixed pre-blockade pricing</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-box-label">Gross Margin (Delivered)</div>
        <div className={`kpi-box-value ${kpis.deliveredMarginSum >= 0 ? 'success' : 'danger'}`}>
          {fmtUSD(kpis.deliveredMarginSum)}
        </div>
        <div className="kpi-box-sub">{fmtPct(kpis.deliveredMarginPct)} margin on delivered</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-box-label">Trapped Cargo Value</div>
        <div className="kpi-box-value danger">{fmtUSD(kpis.trappedValue)}</div>
        <div className="kpi-box-sub">{fmtUSD(kpis.trappedRevenue)} unbilled revenue</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-box-label">DIFOT Performance</div>
        <div className={`kpi-box-value ${kpis.difotPct < 0.7 ? 'danger' : 'warning'}`}>
          {fmtPct(kpis.difotPct)}
        </div>
        <div className="kpi-box-sub">{kpis.difotYes} of {kpis.totalShipments} on-time in-full</div>
      </div>
    </div>
  );
}
