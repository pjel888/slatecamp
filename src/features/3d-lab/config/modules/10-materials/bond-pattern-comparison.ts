// src/app/dashboard/3d-lab/_config/modules/bond-pattern-comparison.ts
// Bond Pattern Comparison — Construction Materials
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

// Standard CHB/brick: 390×190×190mm → scaled 0.39×0.19×0.19
// Showing 2 courses of each pattern side by side

function brick(id: string, x: number, y: number, z: number, rotated: boolean, color: string) {
  const w = rotated ? 0.19 : 0.39
  const d = rotated ? 0.39 : 0.19
  return {
    id,
    label: rotated ? 'Header Brick' : 'Stretcher Brick',
    description: rotated ? 'Header: brick laid perpendicular, showing short face (width = 190mm).' : 'Stretcher: brick laid parallel to wall face, showing long face (390mm).',
    geometry: { id: `${id}-geo`, type: 'box' as const, position: [x, y, z] as [number,number,number], args: [w, 0.09, d], color },
    explodeOffset: [x, y + 0.3, z] as [number,number,number],
  }
}

export const bondPatternComparisonConfig: ExplodedAssemblyConfig = {
  id: 'bond-pattern-comparison',
  title: 'Masonry Bond Pattern Comparison',
  description: 'Side-by-side comparison of four masonry bond patterns: Running (Stretcher), Stack, Flemish, and English — shown at 2 courses with standard 390×190mm CHB/brick units.',
  subject: 'materials',
  comparisonMode: true,
  parts: [
    // ── RUNNING BOND (x = -1.2) ──────────────────────────────────────────────
    brick('run-c1-b1', -1.4, 0.045, 0, false, '#D4951A'),
    brick('run-c1-b2', -1.0, 0.045, 0, false, '#D4951A'),
    brick('run-c2-b1', -1.6, 0.14, 0, false, '#ca8a04'),
    brick('run-c2-b2', -1.2, 0.14, 0, false, '#ca8a04'),
    brick('run-c2-b3', -0.82, 0.14, 0, false, '#ca8a04'),
    {
      id: 'run-label',
      label: 'Running Bond Pattern',
      description: 'All stretchers offset by half brick each course. Maximum longitudinal strength; standard residential wall bond. No headers — relies on metal ties for cavity walls.',
      codeCitation: 'PD 1096 / NSCP',
      geometry: { id: 'run-label-geo', type: 'box', position: [-1.2, -0.12, 0], args: [0.7, 0.04, 0.2], color: '#92400e' },
      explodeOffset: [-1.2, -0.12, 0],
    },
    // ── STACK BOND (x = -0.3) ────────────────────────────────────────────────
    brick('stk-c1-b1', -0.5, 0.045, 0, false, '#1B3FC4'),
    brick('stk-c1-b2', -0.1, 0.045, 0, false, '#1B3FC4'),
    brick('stk-c2-b1', -0.5, 0.14, 0, false, '#1535A8'),
    brick('stk-c2-b2', -0.1, 0.14, 0, false, '#1535A8'),
    {
      id: 'stk-label',
      label: 'Stack Bond Pattern',
      description: 'Vertical joints aligned in every course — no offset. Weakest bond; requires horizontal joint reinforcement. Used for decorative effect only.',
      geometry: { id: 'stk-label-geo', type: 'box', position: [-0.3, -0.12, 0], args: [0.55, 0.04, 0.2], color: '#1535A8' },
      explodeOffset: [-0.3, -0.12, 0],
    },
    // ── FLEMISH BOND (x = 0.6) ───────────────────────────────────────────────
    brick('flem-c1-s1', 0.4, 0.045, 0, false, '#2D9F6F'),
    { id: 'flem-c1-h1', label: 'Header Brick', description: 'Header brick in Flemish bond alternating with stretcher in each course.', geometry: { id: 'flem-c1-h1-geo', type: 'box', position: [0.625, 0.045, 0], args: [0.19, 0.09, 0.39], color: '#15803d' }, explodeOffset: [0.625, 0.375, 0] },
    brick('flem-c1-s2', 0.84, 0.045, 0, false, '#2D9F6F'),
    { id: 'flem-c2-h1', label: 'Header Brick (Course 2)', description: 'Course 2 of Flemish bond starts with header, offset from course 1.', geometry: { id: 'flem-c2-h1-geo', type: 'box', position: [0.505, 0.14, 0], args: [0.19, 0.09, 0.39], color: '#166534' }, explodeOffset: [0.505, 0.44, 0] },
    brick('flem-c2-s1', 0.72, 0.14, 0, false, '#15803d'),
    {
      id: 'flem-label',
      label: 'Flemish Bond Pattern',
      description: 'Alternating stretcher and header in every course, headers centred on stretchers above/below. Strong and decorative — used in Georgian and Colonial architecture.',
      geometry: { id: 'flem-label-geo', type: 'box', position: [0.62, -0.12, 0], args: [0.65, 0.04, 0.2], color: '#14532d' },
      explodeOffset: [0.62, -0.12, 0],
    },
    // ── ENGLISH BOND (x = 1.6) ───────────────────────────────────────────────
    brick('eng-c1-b1', 1.4, 0.045, 0, false, '#D64545'),
    brick('eng-c1-b2', 1.8, 0.045, 0, false, '#D64545'),
    { id: 'eng-c2-h1', label: 'Header Course', description: 'English bond: all-stretcher course alternates with all-header course. Strongest traditional bond pattern.', geometry: { id: 'eng-c2-h1-geo', type: 'box', position: [1.41, 0.14, 0], args: [0.19, 0.09, 0.39], color: '#b91c1c' }, explodeOffset: [1.41, 0.44, 0] },
    { id: 'eng-c2-h2', label: 'Header Course Brick 2', description: 'Second header in all-header course of English bond.', geometry: { id: 'eng-c2-h2-geo', type: 'box', position: [1.61, 0.14, 0], args: [0.19, 0.09, 0.39], color: '#b91c1c' }, explodeOffset: [1.61, 0.44, 0] },
    { id: 'eng-c2-h3', label: 'Header Course Brick 3', description: 'Third header brick completing the English bond header course.', geometry: { id: 'eng-c2-h3-geo', type: 'box', position: [1.81, 0.14, 0], args: [0.19, 0.09, 0.39], color: '#b91c1c' }, explodeOffset: [1.81, 0.44, 0] },
    {
      id: 'eng-label',
      label: 'English Bond Pattern',
      description: 'Alternate courses of all-stretchers and all-headers. Strongest traditional bond — every header ties the two wythes together. Used in structural brick walls.',
      geometry: { id: 'eng-label-geo', type: 'box', position: [1.6, -0.12, 0], args: [0.65, 0.04, 0.2], color: '#7f1d1d' },
      explodeOffset: [1.6, -0.12, 0],
    },
  ],
  camera: { position: [0, 1.5, 3], fov: 55 },
}

