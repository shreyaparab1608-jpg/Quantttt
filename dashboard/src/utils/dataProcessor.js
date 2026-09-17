/**
 * dataProcessor.js
 * ================
 * Central data processing module for the War Room dashboard.
 * Loads, cleans, normalizes, and pre-aggregates all data from the Shipment CSV.
 *
 * DATA QUALITY HANDLING:
 * 1. Customer_Region casing normalized (e.g., "east asia" → "East Asia")
 * 2. Held in Gulf shipments excluded from transit/margin averages
 * 3. Duplicate Shipment_IDs handled via deduplication
 * 4. Emergency route margin distortion annotated (Air Bridge, Overland Truck)
 */

import Papa from 'papaparse';

// ─── Route color palette (Consistent, institutional, non-neon) ───────────────
export const ROUTE_COLORS = {
  'Direct (Pre-Blockade)': '#388bfd',  // Institutional steel blue
  'Cape of Good Hope':     '#d29922',  // Muted amber diversion
  'Pipeline Bypass':       '#8957e5',  // Slate violet
  'Overland Truck':        '#e36209',  // Deep ochre
  'Air Bridge':            '#cf222e',  // Coral red
  'Held in Gulf':          '#b3202b',  // Primary crimson (stranded)
};

export const ROUTE_ORDER = [
  'Direct (Pre-Blockade)',
  'Cape of Good Hope',
  'Pipeline Bypass',
  'Overland Truck',
  'Air Bridge',
  'Held in Gulf',
];

// ─── Region normalization map ───────────────────────────────────────────────
const REGION_NORMALIZE = {
  'east asia':     'East Asia',
  'europe':        'Europe',
  'north america': 'North America',
  'south asia':    'South Asia',
  'middle east':   'Middle East',
};

function normalizeRegion(region) {
  if (!region) return 'Unknown';
  const lower = region.trim().toLowerCase();
  return REGION_NORMALIZE[lower] || region.trim();
}

// ─── Number parsing helpers ─────────────────────────────────────────────────
function parseNum(val) {
  if (val === '' || val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseDate(val) {
  if (!val) return null;
  return new Date(val);
}

// ─── Load and clean CSV ─────────────────────────────────────────────────────
export async function loadData() {
  const response = await fetch('/Shipment_Data.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const cleaned = cleanData(results.data);
          const aggregated = computeAggregations(cleaned);
          resolve({ raw: cleaned, ...aggregated });
        } catch (e) {
          reject(e);
        }
      },
      error: reject,
    });
  });
}

/**
 * Clean raw parsed rows:
 * - Normalize region casing
 * - Parse numeric fields
 * - Deduplicate by Shipment_ID
 */
function cleanData(rows) {
  const seen = new Set();
  const cleaned = [];

  for (const row of rows) {
    // Skip duplicate Shipment_IDs
    if (seen.has(row.Shipment_ID)) continue;
    seen.add(row.Shipment_ID);

    cleaned.push({
      ...row,
      // Normalize region
      Customer_Region: normalizeRegion(row.Customer_Region),
      // Parse dates
      Departure_Date: parseDate(row.Departure_Date),
      // Parse numbers
      Customer_Since:                parseNum(row.Customer_Since),
      Cargo_Weight_Tons:             parseNum(row.Cargo_Weight_Tons),
      Cargo_Value_USD:               parseNum(row.Cargo_Value_USD),
      Contracted_Freight_Revenue_USD: parseNum(row.Contracted_Freight_Revenue_USD),
      Planned_Transit_Days:          parseNum(row.Planned_Transit_Days),
      Actual_Transit_Days:           parseNum(row.Actual_Transit_Days),
      Delay_Days:                    parseNum(row.Delay_Days),
      Freight_Cost_USD:              parseNum(row.Freight_Cost_USD),
      Fuel_Cost_USD:                 parseNum(row.Fuel_Cost_USD),
      Insurance_Cost_USD:            parseNum(row.Insurance_Cost_USD),
      Penalty_Cost_USD:              parseNum(row.Penalty_Cost_USD),
      Total_Cost_to_Serve_USD:       parseNum(row.Total_Cost_to_Serve_USD),
      Revenue_Recognized_USD:        parseNum(row.Revenue_Recognized_USD),
      Gross_Margin_USD:              parseNum(row.Gross_Margin_USD),
      Gross_Margin_Pct:              parseNum(row.Gross_Margin_Pct),
      Cost_per_Ton_USD:              parseNum(row.Cost_per_Ton_USD),
      Revenue_per_Ton_USD:           parseNum(row.Revenue_per_Ton_USD),
      Route_Margin_Sensitivity_USD:  parseNum(row.Route_Margin_Sensitivity_USD),
      Customer_Concentration_Risk_Pct: parseNum(row.Customer_Concentration_Risk_Pct),
      War_Risk_Insurance_Burden_Pct: parseNum(row.War_Risk_Insurance_Burden_Pct),
      Delay_Cost_Attribution_Pct:    parseNum(row.Delay_Cost_Attribution_Pct),
    });
  }

  return cleaned;
}

// ─── Helper: get ISO week string ────────────────────────────────────────────
function getWeekLabel(date) {
  if (!date) return 'Unknown';
  const d = new Date(date);
  // Get Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const month = (monday.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = monday.getDate().toString().padStart(2, '0');
  return `${monday.getFullYear()}-${month}-${dayStr}`;
}

// ─── Filters ────────────────────────────────────────────────────────────────
/** Exclude Held in Gulf from transit/margin averages */
function deliveredOnly(rows) {
  return rows.filter(r => r.Route_Type !== 'Held in Gulf');
}

function heldInGulfOnly(rows) {
  return rows.filter(r => r.Route_Type === 'Held in Gulf');
}

// ─── Core aggregation engine ────────────────────────────────────────────────
function computeAggregations(data) {
  const delivered = deliveredOnly(data);
  const heldInGulf = heldInGulfOnly(data);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. KPI SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const totalShipments = data.length;
  const totalContractedRevenue = data.reduce((s, r) => s + (r.Contracted_Freight_Revenue_USD || 0), 0);

  // Gross margin computed only on delivered shipments for meaningful avg
  const deliveredMarginSum = delivered.reduce((s, r) => s + (r.Gross_Margin_USD || 0), 0);
  const deliveredRevenueSum = delivered.reduce((s, r) => s + (r.Contracted_Freight_Revenue_USD || 0), 0);
  const deliveredMarginPct = deliveredRevenueSum ? deliveredMarginSum / deliveredRevenueSum : 0;

  // Total margin including Held in Gulf losses
  const totalGrossMargin = data.reduce((s, r) => s + (r.Gross_Margin_USD || 0), 0);
  const totalMarginPct = totalContractedRevenue ? totalGrossMargin / totalContractedRevenue : 0;

  const trappedValue = heldInGulf.reduce((s, r) => s + (r.Cargo_Value_USD || 0), 0);
  const trappedRevenue = heldInGulf.reduce((s, r) => s + (r.Contracted_Freight_Revenue_USD || 0), 0);

  const difotYes = data.filter(r => r.DIFOT_Met === 'Y').length;
  const difotPct = totalShipments ? difotYes / totalShipments : 0;

  const kpis = {
    totalShipments,
    totalContractedRevenue,
    deliveredMarginSum,
    deliveredMarginPct,
    totalGrossMargin,
    totalMarginPct,
    trappedValue,
    trappedRevenue,
    trappedCount: heldInGulf.length,
    difotPct,
    difotYes,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. OPERATIONAL — Route mix over time (weekly)
  // ═══════════════════════════════════════════════════════════════════════════
  const weeklyRouteMix = {};
  for (const r of data) {
    const week = getWeekLabel(r.Departure_Date);
    if (!weeklyRouteMix[week]) weeklyRouteMix[week] = {};
    weeklyRouteMix[week][r.Route_Type] = (weeklyRouteMix[week][r.Route_Type] || 0) + 1;
  }
  const weekLabels = Object.keys(weeklyRouteMix).sort();

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. OPERATIONAL — Planned vs Actual transit by Route_Type
  // ═══════════════════════════════════════════════════════════════════════════
  const transitByRoute = {};
  for (const rt of ROUTE_ORDER) {
    const subset = data.filter(r => r.Route_Type === rt);
    const withActual = subset.filter(r => r.Actual_Transit_Days !== null);
    transitByRoute[rt] = {
      avgPlanned: subset.length ? subset.reduce((s, r) => s + (r.Planned_Transit_Days || 0), 0) / subset.length : 0,
      avgActual: withActual.length ? withActual.reduce((s, r) => s + r.Actual_Transit_Days, 0) / withActual.length : null,
      avgDelay: subset.length ? subset.reduce((s, r) => s + (r.Delay_Days || 0), 0) / subset.length : 0,
      count: subset.length,
    };
  }

  // Held in Gulf: days stuck
  const heldAvgStuck = heldInGulf.length
    ? heldInGulf.reduce((s, r) => s + (r.Delay_Days || 0), 0) / heldInGulf.length
    : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. OPERATIONAL — DIFOT % by Route_Type and Product_Category
  // ═══════════════════════════════════════════════════════════════════════════
  const difotByRoute = {};
  for (const rt of ROUTE_ORDER) {
    const subset = data.filter(r => r.Route_Type === rt);
    const yes = subset.filter(r => r.DIFOT_Met === 'Y').length;
    difotByRoute[rt] = subset.length ? yes / subset.length : 0;
  }

  const productCategories = [...new Set(data.map(r => r.Product_Category))].sort();
  const difotByProduct = {};
  for (const pc of productCategories) {
    const subset = data.filter(r => r.Product_Category === pc);
    const yes = subset.filter(r => r.DIFOT_Met === 'Y').length;
    difotByProduct[pc] = subset.length ? yes / subset.length : 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. COMMERCIAL — Gross margin by Route_Type
  // ═══════════════════════════════════════════════════════════════════════════
  const marginByRoute = {};
  for (const rt of ROUTE_ORDER) {
    const subset = data.filter(r => r.Route_Type === rt);
    const totalMargin = subset.reduce((s, r) => s + (r.Gross_Margin_USD || 0), 0);
    const totalRev = subset.reduce((s, r) => s + (r.Contracted_Freight_Revenue_USD || 0), 0);
    marginByRoute[rt] = {
      totalMargin,
      avgMarginPct: subset.length ? subset.reduce((s, r) => s + (r.Gross_Margin_Pct || 0), 0) / subset.length : 0,
      totalRevenue: totalRev,
      marginPct: totalRev ? totalMargin / totalRev : 0,
      count: subset.length,
      isEmergency: rt === 'Air Bridge' || rt === 'Overland Truck',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. COMMERCIAL — Cost-to-serve breakdown by Route_Type
  // ═══════════════════════════════════════════════════════════════════════════
  const costBreakdownByRoute = {};
  for (const rt of ROUTE_ORDER) {
    const subset = data.filter(r => r.Route_Type === rt);
    costBreakdownByRoute[rt] = {
      freight:   subset.reduce((s, r) => s + (r.Freight_Cost_USD || 0), 0),
      fuel:      subset.reduce((s, r) => s + (r.Fuel_Cost_USD || 0), 0),
      insurance: subset.reduce((s, r) => s + (r.Insurance_Cost_USD || 0), 0),
      penalty:   subset.reduce((s, r) => s + (r.Penalty_Cost_USD || 0), 0),
      total:     subset.reduce((s, r) => s + (r.Total_Cost_to_Serve_USD || 0), 0),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. COMMERCIAL — Customer concentration
  // ═══════════════════════════════════════════════════════════════════════════
  const customerMap = {};
  for (const r of data) {
    if (!customerMap[r.Customer_Name]) {
      customerMap[r.Customer_Name] = {
        name: r.Customer_Name,
        region: r.Customer_Region,
        since: r.Customer_Since,
        revenue: 0,
        margin: 0,
        shipments: 0,
        concentrationRisk: 0,
        cargoValue: 0,
      };
    }
    const c = customerMap[r.Customer_Name];
    c.revenue += r.Contracted_Freight_Revenue_USD || 0;
    c.margin += r.Gross_Margin_USD || 0;
    c.shipments += 1;
    c.cargoValue += r.Cargo_Value_USD || 0;
    // Use max concentration risk (it's a per-shipment % in the data)
    if (r.Customer_Concentration_Risk_Pct > c.concentrationRisk) {
      c.concentrationRisk = r.Customer_Concentration_Risk_Pct;
    }
  }
  const customerConcentration = Object.values(customerMap)
    .sort((a, b) => b.revenue - a.revenue);

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. COMMERCIAL — Bubble chart: Revenue vs Margin % per shipment
  // ═══════════════════════════════════════════════════════════════════════════
  // One data point per shipment for the scatter/bubble chart
  const bubbleData = data.map(r => ({
    x: r.Contracted_Freight_Revenue_USD || 0,
    y: r.Gross_Margin_Pct || 0,
    r: Math.max(3, Math.sqrt((r.Cargo_Value_USD || 0) / 50000)),
    routeType: r.Route_Type,
    customer: r.Customer_Name,
    product: r.Product_Category,
    shipmentId: r.Shipment_ID,
    cargoValue: r.Cargo_Value_USD || 0,
    marginUSD: r.Gross_Margin_USD || 0,
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. STRATEGIC — Route Margin Sensitivity heatmap (Product × Route)
  // ═══════════════════════════════════════════════════════════════════════════
  const sensitivityHeatmap = {};
  for (const pc of productCategories) {
    sensitivityHeatmap[pc] = {};
    for (const rt of ROUTE_ORDER) {
      const subset = data.filter(r => r.Product_Category === pc && r.Route_Type === rt);
      sensitivityHeatmap[pc][rt] = subset.reduce((s, r) => s + (r.Route_Margin_Sensitivity_USD || 0), 0);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. STRATEGIC — War Risk Insurance Burden
  // ═══════════════════════════════════════════════════════════════════════════
  const insuranceBurdenByProduct = {};
  for (const pc of productCategories) {
    const subset = data.filter(r => r.Product_Category === pc);
    const totalInsurance = subset.reduce((s, r) => s + (r.Insurance_Cost_USD || 0), 0);
    const totalCargoValue = subset.reduce((s, r) => s + (r.Cargo_Value_USD || 0), 0);
    insuranceBurdenByProduct[pc] = {
      totalInsurance,
      totalCargoValue,
      burdenPct: totalCargoValue ? (totalInsurance / totalCargoValue) : 0,
      avgBurdenPct: subset.length ? subset.reduce((s, r) => s + (r.War_Risk_Insurance_Burden_Pct || 0), 0) / subset.length : 0,
    };
  }

  const insuranceBurdenByCargo = {};
  const cargoTypes = [...new Set(data.map(r => r.Cargo_Type))].sort();
  for (const ct of cargoTypes) {
    const subset = data.filter(r => r.Cargo_Type === ct);
    const totalInsurance = subset.reduce((s, r) => s + (r.Insurance_Cost_USD || 0), 0);
    const totalCargoValue = subset.reduce((s, r) => s + (r.Cargo_Value_USD || 0), 0);
    insuranceBurdenByCargo[ct] = {
      totalInsurance,
      totalCargoValue,
      burdenPct: totalCargoValue ? (totalInsurance / totalCargoValue) : 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. STRATEGIC — Top 10 Exposure Lanes
  // ═══════════════════════════════════════════════════════════════════════════
  /**
   * EXPOSURE SCORING METHODOLOGY:
   * Composite score = weighted sum of:
   *   - Margin erosion (40%): abs(Gross_Margin_USD) normalized to [0,1]
   *   - DIFOT failure (30%): 1 if DIFOT_Met='N', 0 if 'Y'
   *   - Concentration risk (20%): Customer_Concentration_Risk_Pct / 100
   *   - Insurance burden (10%): War_Risk_Insurance_Burden_Pct / max(War_Risk_Insurance_Burden_Pct)
   *
   * This weights financial impact highest, then reliability, then concentration,
   * and insurance burden as a secondary strategic signal.
   */
  const maxMargin = Math.max(...data.map(r => Math.abs(r.Gross_Margin_USD || 0)));
  const maxInsuranceBurden = Math.max(...data.map(r => r.War_Risk_Insurance_Burden_Pct || 0));

  const exposureScored = data.map(r => {
    const marginErosion = maxMargin ? Math.abs(r.Gross_Margin_USD || 0) / maxMargin : 0;
    const difotFail = r.DIFOT_Met === 'N' ? 1 : 0;
    const concRisk = (r.Customer_Concentration_Risk_Pct || 0) / 100;
    const insuranceBurden = maxInsuranceBurden ? (r.War_Risk_Insurance_Burden_Pct || 0) / maxInsuranceBurden : 0;

    // Only flag as high-exposure if margin is actually negative
    const marginNegativeFlag = (r.Gross_Margin_USD || 0) < 0 ? 1 : 0;

    const score = (
      0.40 * marginErosion * marginNegativeFlag +
      0.30 * difotFail +
      0.20 * concRisk +
      0.10 * insuranceBurden
    );

    return {
      shipmentId: r.Shipment_ID,
      customer: r.Customer_Name,
      product: r.Product_Category,
      route: r.Route_Type,
      region: r.Customer_Region,
      revenue: r.Contracted_Freight_Revenue_USD || 0,
      margin: r.Gross_Margin_USD || 0,
      marginPct: r.Gross_Margin_Pct || 0,
      difot: r.DIFOT_Met,
      concentrationRisk: r.Customer_Concentration_Risk_Pct || 0,
      insuranceBurden: r.War_Risk_Insurance_Burden_Pct || 0,
      exposureScore: score,
    };
  });

  const topExposures = exposureScored
    .sort((a, b) => b.exposureScore - a.exposureScore)
    .slice(0, 10);

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. RECOMMENDATIONS — computed evidence-based
  // ═══════════════════════════════════════════════════════════════════════════
  const recommendations = computeRecommendations({
    kpis, marginByRoute, difotByRoute, customerConcentration,
    sensitivityHeatmap, insuranceBurdenByProduct, heldInGulf, data, productCategories,
    costBreakdownByRoute,
  });

  return {
    kpis,
    weeklyRouteMix,
    weekLabels,
    transitByRoute,
    heldAvgStuck,
    difotByRoute,
    difotByProduct,
    marginByRoute,
    costBreakdownByRoute,
    customerConcentration,
    bubbleData,
    sensitivityHeatmap,
    insuranceBurdenByProduct,
    insuranceBurdenByCargo,
    topExposures,
    recommendations,
    productCategories,
    cargoTypes,
    heldInGulf,
    delivered,
    dateRange: {
      min: new Date(Math.min(...data.filter(r => r.Departure_Date).map(r => r.Departure_Date))),
      max: new Date(Math.max(...data.filter(r => r.Departure_Date).map(r => r.Departure_Date))),
    },
  };
}

/**
 * Generate evidence-based recommendations.
 * Each recommendation is tagged with:
 *   - action: what to do
 *   - owner: who should own it
 *   - horizon: when
 *   - metric: what triggers/justifies it
 *   - evidence: the number behind it
 */
function computeRecommendations(ctx) {
  const recs = [];

  // 1. PROTECT: Direct routes with positive margin
  const directMargin = ctx.marginByRoute['Direct (Pre-Blockade)'];
  if (directMargin && directMargin.totalMargin > 0) {
    recs.push({
      type: 'protect',
      action: `Preserve remaining Direct (Pre-Blockade) routes — they generate $${(directMargin.totalMargin / 1e6).toFixed(1)}M gross margin at ${(directMargin.avgMarginPct * 100).toFixed(1)}% avg margin, the only route type with positive unit economics.`,
      owner: 'VP Operations',
      horizon: 'Immediate (0–30 days)',
      metric: 'Direct route gross margin %',
      trigger: 'If Direct margin falls below 10%, escalate to CEO.',
    });
  }

  // 2. CHANGE: Renegotiate Cape of Good Hope rates
  const capeMargin = ctx.marginByRoute['Cape of Good Hope'];
  if (capeMargin) {
    const capeCost = ctx.costBreakdownByRoute['Cape of Good Hope'];
    recs.push({
      type: 'change',
      action: `Renegotiate freight rates for Cape of Good Hope diversions — ${capeMargin.count} shipments generating $${(capeMargin.totalMargin / 1e6).toFixed(1)}M aggregate margin loss. Fuel costs ($${(capeCost.fuel / 1e6).toFixed(1)}M) are the primary driver; seek fuel surcharge pass-through clauses.`,
      owner: 'Commercial Director',
      horizon: 'Short-term (30–90 days)',
      metric: 'Cape route cost-per-ton vs. contracted revenue-per-ton',
      trigger: 'Cape route margin crosses -50% on a rolling 30-day basis.',
    });
  }

  // 3. STOP: Air Bridge / Overland for low-value cargo
  const airMargin = ctx.marginByRoute['Air Bridge'];
  const truckMargin = ctx.marginByRoute['Overland Truck'];
  if (airMargin || truckMargin) {
    recs.push({
      type: 'stop',
      action: `Stop using Air Bridge (avg margin ${((airMargin?.avgMarginPct || 0) * 100).toFixed(0)}%) and Overland Truck for anything except time-critical Pharmaceuticals and High-Tech Components. These emergency routes cost 3–5× ocean rates and destroy margin on bulk commodities.`,
      owner: 'VP Supply Chain',
      horizon: 'Immediate (0–14 days)',
      metric: 'Emergency route usage count by Product_Category',
      trigger: 'Any Air Bridge/Overland shipment for Crude Oil, Consumer Goods, or Industrial Machinery.',
    });
  }

  // 4. CHANGE: Address Held in Gulf trapped capital
  const trappedVal = ctx.kpis.trappedValue;
  const trappedCount = ctx.kpis.trappedCount;
  if (trappedCount > 0) {
    recs.push({
      type: 'change',
      action: `Resolve ${trappedCount} Held in Gulf shipments representing $${(trappedVal / 1e6).toFixed(0)}M in trapped cargo value and $${(ctx.kpis.trappedRevenue / 1e6).toFixed(1)}M in unrecognized contracted revenue. Initiate cargo transfer to alternative carriers or negotiate release corridors.`,
      owner: 'CEO + General Counsel',
      horizon: 'Urgent (0–14 days)',
      metric: 'Held in Gulf cargo value and average days stuck',
      trigger: 'Any Held in Gulf shipment exceeding 60 days or $5M cargo value.',
    });
  }

  // 5. PROTECT: Top customer concentration
  const topCustomer = ctx.customerConcentration[0];
  if (topCustomer) {
    const revShare = topCustomer.revenue / ctx.kpis.totalContractedRevenue;
    recs.push({
      type: 'protect',
      action: `Proactively engage ${topCustomer.name} (${(revShare * 100).toFixed(0)}% of contracted revenue, customer since ${topCustomer.since}). Their exposure to disruption is existential for the P&L. Offer route transparency dashboard access and negotiate disruption cost-sharing mechanisms.`,
      owner: 'Account Director',
      horizon: 'Short-term (0–30 days)',
      metric: 'Top customer revenue concentration %',
      trigger: 'Single customer exceeding 40% of total contracted revenue.',
    });
  }

  // 6. STRATEGIC: Pipeline Bypass scaling
  const pipelineMargin = ctx.marginByRoute['Pipeline Bypass'];
  if (pipelineMargin) {
    recs.push({
      type: 'change',
      action: `Evaluate Pipeline Bypass scalability — currently ${pipelineMargin.count} shipments. Despite aggregate margin of $${(pipelineMargin.totalMargin / 1e6).toFixed(1)}M, this route is constrained by infrastructure capacity. Partner with pipeline operators for guaranteed throughput allocation.`,
      owner: 'VP Strategy',
      horizon: 'Medium-term (90–180 days)',
      metric: 'Pipeline Bypass capacity utilization and margin per ton',
      trigger: 'Pipeline Bypass capacity waitlist exceeds 2 weeks.',
    });
  }

  return recs;
}

// ─── Formatting utilities ───────────────────────────────────────────────────
export function fmtUSD(val) {
  if (val === null || val === undefined) return '—';
  const abs = Math.abs(val);
  if (abs >= 1e9) return `${val < 0 ? '-' : ''}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${val < 0 ? '-' : ''}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${val < 0 ? '-' : ''}$${(abs / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export function fmtPct(val) {
  if (val === null || val === undefined) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

export function fmtNum(val) {
  if (val === null || val === undefined) return '—';
  return val.toLocaleString('en-US', { maximumFractionDigits: 1 });
}
