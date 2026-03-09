/**
 * Shared Recharts styling constants for consistent chart appearance.
 */

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.875rem",
  boxShadow: "var(--shadow-soft)",
  fontSize: "0.8125rem",
};

export const CHART_CURSOR_STYLE = { fill: "rgba(122, 201, 255, 0.08)" };

export const CHART_AXIS_TICK = {
  fill: "var(--color-muted-foreground)",
  fontSize: 12,
};

export const CHART_AXIS_LINE = { stroke: "var(--color-border)" };

export const CHART_GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "var(--color-border)",
  opacity: 0.45,
} as const;
