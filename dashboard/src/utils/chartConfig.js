/**
 * chartConfig.js
 * ==============
 * Shared Chart.js defaults and plugin registrations.
 * Enforces the war-room dark aesthetic across all charts.
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

// Register all required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
);

// Global defaults for the war-room dark theme
ChartJS.defaults.color = '#a0a0a0';
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.06)';
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.padding = 16;
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(10,10,10,0.95)';
ChartJS.defaults.plugins.tooltip.titleColor = '#ffffff';
ChartJS.defaults.plugins.tooltip.bodyColor = '#cccccc';
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(179,32,43,0.4)';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.animation.duration = 800;
ChartJS.defaults.animation.easing = 'easeOutQuart';

export const GRID_STYLE = {
  color: 'rgba(255,255,255,0.05)',
  drawBorder: false,
};

export const TICK_STYLE = {
  color: '#808080',
  font: { size: 11 },
};

/**
 * Standard tooltip callback formatters
 */
export const tooltipCallbacks = {
  usd: (ctx) => {
    const val = ctx.parsed.y ?? ctx.parsed;
    const abs = Math.abs(val);
    if (abs >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  },
  pct: (ctx) => {
    const val = ctx.parsed.y ?? ctx.parsed;
    return `${(val * 100).toFixed(1)}%`;
  },
};
