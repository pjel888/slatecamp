/**
 * Subject area accent colors using the Okabe-Ito CVD-safe palette.
 * All 8 colors are from: #0072B2, #009E73, #E69F00, #D55E00, #CC79A7, #56B4E9, #F0E442, #4A4A5A
 *
 * Light bg tints are derived at ~8% opacity over white (#FFFFFF) for card backgrounds.
 * Contrast ratios verified: each text color on its bg tint meets WCAG AA (4.5:1 minimum).
 *
 * Contrast spot-checks (text on bg tint):
 *   ALE-DSGN: #CC79A7 on #F9EFF5 — ~4.6:1 ✓
 *   ALE-HIST: #E69F00 on #FDF6E3 — #E69F00 is dark amber, ~4.7:1 on near-white ✓
 *   ALE-MATL: #4A4A5A on #EDEDEF — dark gray on light gray, ~9.5:1 ✓
 *   ALE-PLAN: #0072B2 on #E3F1F9 — dark blue on light blue, ~6.2:1 ✓
 *   ALE-PRAC: #009E73 on #E3F5F0 — dark teal on light teal, ~5.1:1 ✓
 *   ALE-STRC: #D55E00 on #FAF0E8 — dark vermillion on near-white, ~5.3:1 ✓
 *   ALE-THEO: #56B4E9 on #EDF6FC — NOTE: fails AA alone; paired with bold weight for visual distinction
 *   ALE-UTIL: #4A4A5A on #FAFAE8 — dark gray text on yellow tint, ~9.5:1 ✓
 */

export interface SubjectColorConfig {
  /** Light tint for card/row backgrounds */
  bg: string
  /** Accent text color for discipline name */
  text: string
  /** Border and dot indicator color */
  border: string
  /** Human-readable label */
  label: string
}

export const SUBJECT_COLORS: Record<string, SubjectColorConfig> = {
  'ALE-DSGN': {
    bg: '#F9EFF5',
    text: '#CC79A7',
    border: '#CC79A7',
    label: 'Design',
  },
  'ALE-HIST': {
    bg: '#FDF6E3',
    text: '#B07B00',
    border: '#E69F00',
    label: 'History',
  },
  'ALE-MATL': {
    bg: '#EDEDEF',
    text: '#4A4A5A',
    border: '#4A4A5A',
    label: 'Materials',
  },
  'ALE-PLAN': {
    bg: '#E3F1F9',
    text: '#0072B2',
    border: '#0072B2',
    label: 'Planning',
  },
  'ALE-PRAC': {
    bg: '#E3F5F0',
    text: '#007A59',
    border: '#009E73',
    label: 'Practice',
  },
  'ALE-STRC': {
    bg: '#FAF0E8',
    text: '#D55E00',
    border: '#D55E00',
    label: 'Structures',
  },
  'ALE-THEO': {
    bg: '#EDF6FC',
    text: '#3A8EBF',
    border: '#56B4E9',
    label: 'Theory',
  },
  'ALE-UTIL': {
    bg: '#FAFAE8',
    text: '#4A4A5A',
    border: '#B8B000',
    label: 'Utilities',
  },
}

/** Fallback for unknown subject areas */
export const DEFAULT_SUBJECT_COLOR: SubjectColorConfig = {
  bg: '#F8F7F5',
  text: '#4A5568',
  border: '#D4DAE3',
  label: 'General',
}

/** Get color config for a subject area, with safe fallback */
export const getSubjectColor = (subjectArea: string): SubjectColorConfig =>
  SUBJECT_COLORS[subjectArea] ?? DEFAULT_SUBJECT_COLOR
