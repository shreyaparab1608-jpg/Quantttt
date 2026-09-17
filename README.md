# Team Quantttt | Executive War Room: 2026 Strait of Hormuz Disruption

An institutional, board-level decision-support dashboard built by **Team Quantttt** to evaluate and resolve the financial, operational, and commercial impacts of the 2026 Strait of Hormuz maritime disruption.

---

## Executive Context & Board Question

> *"The Hormuz disruption has made a historically efficient network more expensive and less predictable. Where does disruption become a business problem, which evidence actually matters, and what should the company change?"*

This platform provides executive leadership with real-time operational telemetry, commercial exposure analysis, and board-level risk mitigation strategies across three structured decision planes.

---

## Core Analytical Architecture

### 1. Operations & Schedules (`Page 01`)
* **Transit Degradation:** Tracks transit delays across routes, highlighting the **+18.2 day delay** on the Cape of Good Hope diversion (29.2 days total vs. 11.0 days planned).
* **Service Reliability (DIFOT):** Visualizes the collapse of Delivery In-Full, On-Time performance from pre-crisis baseline (98%) to **67.5%**.
* **Fleet Allocation:** Interactive doughnut chart visualizing vessel count distribution across Direct, Cape of Good Hope, Pipeline Bypass, Overland Truck, and Air Bridge routes.
* **Bottleneck Radar:** Monitors stranded tonnage and fleet congestion metrics across the Persian Gulf and Red Sea corridors.

### 2. Commercial Economics & Customer Exposure (`Page 02`)
* **Revenue vs. Cost-to-Serve:** Demonstrates how **$113.31M** in contracted revenue (locked under pre-blockade tariffs) absorbs emergency spot rerouting costs, generating an aggregate **-$189.62M** net gross margin impact.
* **Customer Concentration:** Isolates exposure across counterparties, identifying that the top two clients absorb **78.4%** of total business:
  * **Meridian Energy Partners:** $66.11M revenue (57.6% concentration)
  * **Zenith Crude Traders:** $22.71M revenue (20.8% concentration)
* **Cost-to-Serve Breakdown:** Dedicated chart analyzing ocean freight tariffs against emergency trucking, air charter, and pipeline transit surcharges.
* **Interactive Data Grid:** Powered by `@mui/x-data-grid`, offering column-level filtering, sorting, and export capabilities across all 244 shipment voyages.

### 3. Strategy & Board Decisions (`Page 03`)
* **Route Margin Sensitivity Matrix ($):** Dynamic matrix modeling the financial leverage of a $100K cost reduction per voyage across commodities and routes, pinpointing highest ROI on **Crude Oil via Pipeline (+$110.4M impact)** and **Cape (+$23.1M impact)**.
* **Stranded Asset Exposure:** Tracks **$229.03M** in immobilized cargo value across **54 stranded vessels** trapped inside the Persian Gulf (average 42.1 days idle).
* **Executive Decision Directives:**
  * **WHAT TO PROTECT:** The remaining profitable Direct routes (+15.4% delivered margin).
  * **WHAT TO CHANGE:** Enforce mandatory bunker fuel surcharges on Cape diversions and petition diplomatic safe-transit corridors for stranded Gulf tonnage.
  * **WHAT TO STOP:** Immediately cease Air Bridge and Overland Trucking for bulk commodities (Crude, Petrochemicals, Consumer goods) where spot premiums exceed cargo value.

---

## Quantttt AI Executive Advisor

The dashboard features an integrated, real-time boardroom decision-support advisor:
* **Domain Guardrails:** Strictly constrained to the 2026 Hormuz masterplan dataset and verified shipment records.
* **Grounded Truth:** Backed by exact mathematical calculations (244 shipments, route margins, counterparty exposures).
* **Anti-Injection Protections:** Rejects off-topic queries, code generation, and prompt injections with polite domain enforcement.
* **Session Management:** One-click conversation reset and quick-prompt executive inquiry chips.

---

## Technology Stack

* **Frontend Framework:** React 19, Vite 8
* **Data Visualization:** Chart.js, react-chartjs-2
* **Data Table:** Material-UI DataGrid (`@mui/x-data-grid`), `@mui/material`, `@emotion/react`
* **Data Ingestion:** PapaParse (client-side CSV parsing of `Shipment_Data.csv`)
* **Aesthetics:** Institutional Dark Theme (Financial Times / Bloomberg terminal aesthetic)

---

## Local Development Setup

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/shreyaparab1608-jpg/Quantttt.git
   cd Quantttt
   ```

2. Install dependencies:
   ```bash
   cd dashboard
   npm install
   ```

3. Launch local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## Deployment (Vercel)

This repository is pre-configured for zero-config Vercel deployment:

1. Push this repository to GitHub (`shreyaparab1608-jpg/Quantttt`).
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select the `Quantttt` repository.
4. If deploying from the repository root:
   * Build Command: `cd dashboard && npm install && npm run build` (or leave default with root `package.json`)
   * Output Directory: `dashboard/dist`
5. Alternatively, set **Root Directory** to `dashboard` in the Vercel project settings:
   * Framework Preset: **Vite**
   * Output Directory: `dist`
6. Click **Deploy**.

---

## Repository Contents

```
Quantttt/
├── .gitignore                          # Git ignore rules
├── package.json                        # Root package scripts
├── vercel.json                         # Root Vercel deployment config
├── README.md                           # Documentation & Architecture
├── Shipment_Data.csv                   # Master shipment telemetry data (244 records)
├── R2-WAR ROOM MASTERPLAN.xlsx         # Financial model & scenario tables
├── R2-War Room Masterplan Case Study.pdf # Case study brief & board mandate
└── dashboard/                          # React + Vite application
    ├── vercel.json                     # Subfolder Vercel config
    ├── vite.config.js                  # Vite configuration
    ├── package.json                    # Dashboard dependencies
    ├── index.html                      # HTML entry point (no emojis, clean branding)
    ├── public/                         # Static assets & CSV data
    └── src/
        ├── App.jsx                     # Core 3-page state & KPI strip
        ├── index.css                   # Institutional dark theme styling
        ├── components/
        │   ├── TopNavbar.jsx           # Clean navigation with Quantttt branding
        │   ├── Header.jsx              # Executive KPI strip (clean typography)
        │   ├── PageOperations.jsx      # Page 1: Transit times, DIFOT & fleet doughnut
        │   ├── PageCommercial.jsx      # Page 2: Revenue, cost-to-serve & MUI DataGrid
        │   ├── PageStrategic.jsx       # Page 3: Sensitivity matrix & asset exposure
        │   ├── ExecutiveChatbot.jsx    # Guardrailed boardroom AI advisor
        │   ├── OperationalView.jsx     # Route operations analysis
        │   ├── CommercialView.jsx      # Commercial exposure tables
        │   ├── StrategicMatrix.jsx     # Sensitivity analysis component
        │   └── RecommendationPanel.jsx # Action decision cards
        └── utils/
            └── dataProcessor.js        # Mathematical single-source-of-truth
```

---

## Confidentiality Notice

**CONFIDENTIAL // FOR BOARD REVIEW ONLY**  
Developed by **Team Quantttt** for Executive Decision Support.
