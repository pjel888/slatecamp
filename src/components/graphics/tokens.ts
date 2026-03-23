/**
 * Campfire Graphic System v2 — Design Tokens
 *
 * These tokens are used by graphic compositions and illustrations.
 * For app-wide theming, see globals.css CSS custom properties.
 */

// ── Core palette (static values for SVG/Canvas contexts) ──
export const palette = {
  slateBlue: '#1B3FC4',
  slateBlue50: '#EEF2FC',
  slateBlue700: '#1535A8',
  campOrange: '#E8853A',
  campOrangeHover: '#D4751A',
  emerald: '#2D9F6F',
  emerald50: '#EDFAF4',
  warmRed: '#D64545',
  warmRed50: '#FDF0F0',
  amber: '#D4951A',
  amber50: '#FEF8ED',
  infoBlue: '#3B82C8',
  surfaceLight: '#F5F5F5',
  surfaceCard: '#FFFFFF',
  surfaceFocused: '#F5F7FA',
  inkPrimary: '#1A2332',
  inkSecondary: '#4A5568',
  inkTertiary: '#8896A7',
  borderDefault: '#D4DAE3',
} as const

// ── CSS custom property references (for use in JSX style props) ──
export const cssVars = {
  primary: 'var(--gc-primary, #1B3FC4)',
  accent: 'var(--gc-accent, #E8853A)',
  success: 'var(--gc-success, #2D9F6F)',
  danger: 'var(--gc-danger, #D64545)',
  border: 'var(--gc-border, #D4DAE3)',
  cutout: 'var(--gc-cutout, #F5F5F5)',
} as const

// ── Readiness score color thresholds ──
export function getScoreColor(score: number) {
  if (score >= 70)
    return { main: '#2D9F6F', grad: '#248A5E', glow: 'rgba(45,159,111,0.08)' }
  if (score >= 40)
    return { main: '#E8853A', grad: '#D4751A', glow: 'rgba(232,133,58,0.08)' }
  return { main: '#D64545', grad: '#B83A3A', glow: 'rgba(214,69,69,0.08)' }
}
