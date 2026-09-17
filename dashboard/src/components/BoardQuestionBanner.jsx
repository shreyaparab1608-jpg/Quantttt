/**
 * BoardQuestionBanner.jsx
 * =======================
 * Prominent executive framing banner that directly addresses the Board's core strategic question:
 * "The Hormuz disruption has made a historically efficient network more expensive and less predictable.
 *  Where does disruption become a business problem, which evidence actually matters, and what should the company change?"
 */

import React from 'react';

export default function BoardQuestionBanner() {
  return (
    <section className="board-banner-card">
      <div className="board-banner-header">
        <div className="board-badge">BOARD INQUIRY RESOLUTION</div>
        <h2 className="board-question">
          "Where does disruption become a business problem, which evidence actually matters, and what should the company change?"
        </h2>
      </div>

      <div className="board-answer-grid">
        <div className="board-answer-col">
          <div className="board-col-label danger">1. Where Disruption Becomes a Problem</div>
          <p className="board-col-text">
            Contracted freight revenue is <strong>100% locked pre-blockade</strong>. Every dollar of emergency routing cost (Cape diversions, Overland Truck, Air Bridge) and DIFOT penalty comes straight out of operating margin—collapsing net margin across substitute routes to deep negative territory while <strong>$229M</strong> in client cargo sits immobilized in the Gulf.
          </p>
        </div>

        <div className="board-answer-col">
          <div className="board-col-label warning">2. Which Evidence Actually Matters</div>
          <p className="board-col-text">
            Top-line volume is misleading. The metrics that dictate survival are <strong>Route Margin Sensitivity ($)</strong> (cost surge per ton vs. benchmark), <strong>Customer Concentration Risk</strong> (top 2 accounts control 78% of revenue), and <strong>War Risk Insurance Burden</strong> on high-value bulk liquid assets.
          </p>
        </div>

        <div className="board-answer-col">
          <div className="board-col-label success">3. What The Company Must Change</div>
          <p className="board-col-text">
            Immediately <strong>halt Air/Truck substitutions for low-margin bulk goods</strong>, invoke force majeure / emergency fuel surcharges on Cape of Good Hope lanes, prioritize high-margin Direct routes, and negotiate relief corridors for the 54 vessels stranded in the Gulf.
          </p>
        </div>
      </div>
    </section>
  );
}
