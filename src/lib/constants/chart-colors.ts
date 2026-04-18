/**
 * Centralized chart color constants for all Recharts visualizations.
 *
 * Recharts renders to SVG — `fill`/`stroke` attributes do NOT resolve
 * CSS `var(--token)` values. These resolved hex values are the static
 * fallbacks used by `useChartColors()` and imported directly where
 * client-side resolution isn't available (e.g. server-side chart-data).
 */

export const CHART_COLORS = {
  // ── Core semantic tokens ──────────────────────────────────────────
  primary: '#1B3FC4',       // Camp Cobalt — --primary
  primaryLight: '#EEF2FC',  // --primary-50
  success: '#2D9F6F',       // Emerald — --success
  destructive: '#D64545',   // Warm Red — --destructive
  warning: '#D4951A',       // Amber — --warning
  border: '#D4DAE3',        // --border
  textSecondary: '#4A5568', // --text-secondary / Ink Secondary
  mutedForeground: '#8896A7', // --muted-foreground
  foreground: '#1A2332',    // --foreground / Ink Primary
  background: '#F8F7F5',    // --background / Surface Light

  // ── Chart-specific aliases ────────────────────────────────────────
  gridStroke: '#D4DAE3',
  referenceLine: '#2D9F6F',
  tooltipBorder: '#D4DAE3',
  axisTickFill: '#4A5568',
  quadrantFallback: '#4A5568',
  modeFallback: '#71717a',
} as const

/**
 * Quiz mode colors — used in PacingAccuracy, ModeFunnel, StaminaHeatmap.
 * Keys match `quiz_sessions.test_mode` values.
 */
export const MODE_COLORS: Record<string, string> = {
  camp: CHART_COLORS.primary,
  timed: CHART_COLORS.warning,
  practice: CHART_COLORS.success,
  storm: CHART_COLORS.destructive,
  chill: '#7c3aed',
  custom: '#0891b2',
  focus_review: '#9333ea',
  full_exam: '#0284c7',
  endurance: '#059669',
}

export const getModeColor = (mode: string): string =>
  MODE_COLORS[mode] ?? CHART_COLORS.modeFallback

/**
 * Forgetting curve color interpolation thresholds.
 * ratio > 0.5 → fast decay (destructive)
 * ratio > 0.25 → medium decay (warning)
 * else → slow decay (success)
 */
export const getForgettingCurveColor = (ratio: number): string =>
  ratio > 0.5 ? CHART_COLORS.destructive : ratio > 0.25 ? CHART_COLORS.warning : CHART_COLORS.success

export type ChartColorKey = keyof typeof CHART_COLORS
