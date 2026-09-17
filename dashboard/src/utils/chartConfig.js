/**
 * chartConfig.js
 * ==============
 * Shared Chart.js defaults and plugin registrations via chart.js/auto.
 * Enforces the war-room dark aesthetic across all charts (Bar, Line, Doughnut, Bubble, etc.).
 */

import ChartJS from 'chart.js/auto';

// Global defaults for the war-room dark theme
ChartJS.defaults.color = '#8b94a5';
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.06)';
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
ChartJS.defaults.font.size = 11;
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.padding = 14;
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(19,23,31,0.95)';
ChartJS.defaults.plugins.tooltip.titleColor = '#ffffff';
ChartJS.defaults.plugins.tooltip.bodyColor = '#8b94a5';
ChartJS.defaults.plugins.tooltip.borderColor = '#2e3646';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.cornerRadius = 6;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.animation.duration = 400;
ChartJS.defaults.animation.easing = 'easeOutQuart';

export const GRID_STYLE = {
  color: 'rgba(255,255,255,0.04)',
  drawBorder: false,
};

export const TICK_STYLE = {
  color: '#8b94a5',
  font: { size: 10 },
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

export default ChartJS;
