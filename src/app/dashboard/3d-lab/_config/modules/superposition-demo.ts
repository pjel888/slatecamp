// src/app/dashboard/3d-lab/_config/modules/superposition-demo.ts
// Superposition of Orders — Architectural History
// ─────────────────────────────────────────────────────────────────────────────
// Colosseum-style stacking of the three classical orders:
// Doric (ground) → Ionic (middle) → Corinthian (top).

import type { AnimatedSequenceConfig } from '../../_types/templates'

export const superpositionDemoConfig: AnimatedSequenceConfig = {
  id: 'superposition-demo',
  title: 'Superposition of Orders',
  description:
    'The classical system of superposition as used on the Colosseum (80 AD): Doric order at the ground level, Ionic at the second, Corinthian at the third. Each order is progressively lighter and more ornate.',
  subject: 'history',
  loop: true,
  autoPlaySpeed: 2200,
  camera: { position: [0, 3, 6], target: [0, 2, 0], fov: 45 },
  steps: [
    // ── Step 1: Ground Level — Doric Order ───────────────────────────────────
    {
      id: 'doric',
      label: 'Ground Level — Doric Order',
      description:
        'Doric is the simplest, most robust order. Sturdy columns with no base, a plain capital (echinus + abacus), and a triglyph-metope frieze. Proportions: column height = 4–6 × lower diameter. First used at Paestum (~550 BC).',
      codeCitation: 'Vitruvius De Architectura Book IV, Chapter 3',
      duration: 2000,
      geometry: [
        // Stylobate base
        { id: 'stylobate', type: 'box', args: [3.5, 0.2, 1.2], position: [0, 0.1, 0], color: '#d4d4d8' },
        // Doric column 1 (no base, thick shaft)
        { id: 'col1-shaft', type: 'cylinder', args: [0.2, 0.22, 1.6, 16], position: [-1.2, 1.0, 0], color: '#e7e5e4' },
        { id: 'col1-cap', type: 'cylinder', args: [0.28, 0.22, 0.12, 16], position: [-1.2, 1.86, 0], color: '#d6d3d1', label: 'Echinus' },
        { id: 'col1-abacus', type: 'box', args: [0.6, 0.1, 0.6], position: [-1.2, 1.97, 0], color: '#d4d4d8' },
        // Doric column 2
        { id: 'col2-shaft', type: 'cylinder', args: [0.2, 0.22, 1.6, 16], position: [0, 1.0, 0], color: '#e7e5e4' },
        { id: 'col2-cap', type: 'cylinder', args: [0.28, 0.22, 0.12, 16], position: [0, 1.86, 0], color: '#d6d3d1' },
        { id: 'col2-abacus', type: 'box', args: [0.6, 0.1, 0.6], position: [0, 1.97, 0], color: '#d4d4d8' },
        // Doric column 3
        { id: 'col3-shaft', type: 'cylinder', args: [0.2, 0.22, 1.6, 16], position: [1.2, 1.0, 0], color: '#e7e5e4' },
        { id: 'col3-cap', type: 'cylinder', args: [0.28, 0.22, 0.12, 16], position: [1.2, 1.86, 0], color: '#d6d3d1' },
        { id: 'col3-abacus', type: 'box', args: [0.6, 0.1, 0.6], position: [1.2, 1.97, 0], color: '#d4d4d8' },
        // Architrave
        { id: 'architrave', type: 'box', args: [3.5, 0.2, 0.5], position: [0, 2.12, 0], color: '#d4d4d8' },
        // Frieze with triglyphs
        { id: 'frieze', type: 'box', args: [3.5, 0.3, 0.45], position: [0, 2.37, 0], color: '#e7e5e4', label: 'Triglyph-Metope Frieze' },
        { id: 'triglyph-1', type: 'box', args: [0.15, 0.28, 0.08], position: [-1.2, 2.37, 0.25], color: '#94a3b8' },
        { id: 'triglyph-2', type: 'box', args: [0.15, 0.28, 0.08], position: [0, 2.37, 0.25], color: '#94a3b8' },
        { id: 'triglyph-3', type: 'box', args: [0.15, 0.28, 0.08], position: [1.2, 2.37, 0.25], color: '#94a3b8' },
      ],
    },

    // ── Step 2: Second Level — Ionic Order ───────────────────────────────────
    {
      id: 'ionic',
      label: 'Second Level — Ionic Order',
      description:
        'Ionic is more slender and elegant than Doric. Distinctive scroll capitals (volutes) on two faces. Column has a base. Proportions: 8–9 × lower diameter. Continuous frieze replaces triglyph-metope. Used at Temple of Artemis, Ephesus.',
      codeCitation: 'Vitruvius De Architectura Book III, Chapter 5',
      duration: 2000,
      geometry: [
        // === Ground level (Doric) — simplified ===
        { id: 'base-platform', type: 'box', args: [3.5, 2.65, 1.0], position: [0, 1.325, 0], color: '#d4d4d8', opacity: 0.6, transparent: true },
        { id: 'doric-label', type: 'box', args: [1.2, 0.1, 0.2], position: [0, 0.3, 0.6], color: '#94a3b8', label: 'Doric — Ground' },
        // === Ionic level ===
        { id: 'ionic-stylobate', type: 'box', args: [3.0, 0.15, 1.0], position: [0, 2.75, 0], color: '#d4d4d8' },
        // Ionic column 1 (with base, slender)
        { id: 'ion1-base', type: 'cylinder', args: [0.19, 0.19, 0.12, 16], position: [-1.0, 2.97, 0], color: '#d6d3d1' },
        { id: 'ion1-shaft', type: 'cylinder', args: [0.16, 0.18, 1.5, 16], position: [-1.0, 3.82, 0], color: '#f5f5f4' },
        { id: 'ion1-volute', type: 'box', args: [0.55, 0.18, 0.2], position: [-1.0, 4.63, 0], color: '#d6d3d1', label: 'Volute capital' },
        // Ionic column 2
        { id: 'ion2-base', type: 'cylinder', args: [0.19, 0.19, 0.12, 16], position: [0, 2.97, 0], color: '#d6d3d1' },
        { id: 'ion2-shaft', type: 'cylinder', args: [0.16, 0.18, 1.5, 16], position: [0, 3.82, 0], color: '#f5f5f4' },
        { id: 'ion2-volute', type: 'box', args: [0.55, 0.18, 0.2], position: [0, 4.63, 0], color: '#d6d3d1' },
        // Ionic column 3
        { id: 'ion3-base', type: 'cylinder', args: [0.19, 0.19, 0.12, 16], position: [1.0, 2.97, 0], color: '#d6d3d1' },
        { id: 'ion3-shaft', type: 'cylinder', args: [0.16, 0.18, 1.5, 16], position: [1.0, 3.82, 0], color: '#f5f5f4' },
        { id: 'ion3-volute', type: 'box', args: [0.55, 0.18, 0.2], position: [1.0, 4.63, 0], color: '#d6d3d1' },
        // Entablature
        { id: 'ion-architrave', type: 'box', args: [3.0, 0.18, 0.45], position: [0, 4.81, 0], color: '#d4d4d8' },
        { id: 'ion-frieze', type: 'box', args: [3.0, 0.25, 0.42], position: [0, 5.045, 0], color: '#f5f5f4', label: 'Continuous Frieze' },
      ],
    },

    // ── Step 3: Third Level — Corinthian Order ────────────────────────────────
    {
      id: 'corinthian',
      label: 'Third Level — Corinthian Order',
      description:
        'Corinthian is the most ornate order, with acanthus-leaf capitals. Most slender: 9–10 × lower diameter. Used at the top of the Colosseum arcade. The capital is identical on all four faces, suitable for corner columns.',
      codeCitation: 'Vitruvius De Architectura Book IV, Chapter 1',
      duration: 2000,
      geometry: [
        // === Lower two levels (simplified block) ===
        { id: 'lower-block', type: 'box', args: [3.5, 5.3, 1.0], position: [0, 2.65, 0], color: '#d4d4d8', opacity: 0.55, transparent: true },
        { id: 'doric-tag', type: 'box', args: [0.9, 0.08, 0.1], position: [0, 0.4, 0.55], color: '#94a3b8', label: 'Doric' },
        { id: 'ionic-tag', type: 'box', args: [0.9, 0.08, 0.1], position: [0, 2.9, 0.55], color: '#94a3b8', label: 'Ionic' },
        // === Corinthian level ===
        { id: 'cor-stylobate', type: 'box', args: [2.5, 0.12, 0.9], position: [0, 5.36, 0], color: '#d4d4d8' },
        // Corinthian col 1
        { id: 'cor1-base', type: 'cylinder', args: [0.16, 0.16, 0.1, 16], position: [-0.8, 5.53, 0], color: '#d6d3d1' },
        { id: 'cor1-shaft', type: 'cylinder', args: [0.13, 0.15, 1.3, 16], position: [-0.8, 6.23, 0], color: '#fafaf9' },
        { id: 'cor1-capital', type: 'cylinder', args: [0.22, 0.14, 0.25, 16], position: [-0.8, 6.945, 0], color: '#d6d3d1', label: 'Acanthus capital' },
        // Corinthian col 2
        { id: 'cor2-base', type: 'cylinder', args: [0.16, 0.16, 0.1, 16], position: [0, 5.53, 0], color: '#d6d3d1' },
        { id: 'cor2-shaft', type: 'cylinder', args: [0.13, 0.15, 1.3, 16], position: [0, 6.23, 0], color: '#fafaf9' },
        { id: 'cor2-capital', type: 'cylinder', args: [0.22, 0.14, 0.25, 16], position: [0, 6.945, 0], color: '#d6d3d1' },
        // Corinthian col 3
        { id: 'cor3-base', type: 'cylinder', args: [0.16, 0.16, 0.1, 16], position: [0.8, 5.53, 0], color: '#d6d3d1' },
        { id: 'cor3-shaft', type: 'cylinder', args: [0.13, 0.15, 1.3, 16], position: [0.8, 6.23, 0], color: '#fafaf9' },
        { id: 'cor3-capital', type: 'cylinder', args: [0.22, 0.14, 0.25, 16], position: [0.8, 6.945, 0], color: '#d6d3d1' },
        // Entablature
        { id: 'cor-entab', type: 'box', args: [2.5, 0.38, 0.4], position: [0, 7.26, 0], color: '#e7e5e4' },
        // Cornice / attic
        { id: 'cor-cornice', type: 'box', args: [2.6, 0.12, 0.45], position: [0, 7.5, 0], color: '#d4d4d8' },
      ],
    },

    // ── Step 4: Full Colosseum Facade ────────────────────────────────────────
    {
      id: 'full-facade',
      label: 'Full Superposition — Colosseum Arcade',
      description:
        'The complete three-story arcade: Doric (1st), Ionic (2nd), Corinthian (3rd), with a 4th-story Corinthian pilaster attic. Each level is slightly set back. Superposition unifies vertical composition through progressive lightness and ornament.',
      codeCitation: 'Colosseum, Rome (Flavian Amphitheatre, 70–80 AD)',
      duration: 2500,
      geometry: [
        // Ground floor (Doric)
        { id: 'floor-1', type: 'box', args: [3.8, 2.5, 1.1], position: [0, 1.25, 0], color: '#d4d4d8', opacity: 0.75, transparent: true, label: 'Doric — 1F' },
        // Second floor (Ionic — slightly set back)
        { id: 'floor-2', type: 'box', args: [3.5, 2.4, 1.0], position: [0, 3.7, 0], color: '#e7e5e4', opacity: 0.75, transparent: true, label: 'Ionic — 2F' },
        // Third floor (Corinthian)
        { id: 'floor-3', type: 'box', args: [3.2, 2.3, 0.95], position: [0, 6.05, 0], color: '#f5f5f4', opacity: 0.75, transparent: true, label: 'Corinthian — 3F' },
        // Attic (4th level — pilasters)
        { id: 'attic', type: 'box', args: [3.0, 1.2, 0.85], position: [0, 7.8, 0], color: '#fafaf9', opacity: 0.8, transparent: true, label: 'Corinthian Pilaster Attic' },
        // Arcade arches (ground)
        { id: 'arch-1', type: 'ring', args: [0.35, 0.45, 16, 1, 0, Math.PI], position: [-1.1, 1.4, 0.56], rotation: [-Math.PI / 2, 0, 0], color: '#94a3b8' },
        { id: 'arch-2', type: 'ring', args: [0.35, 0.45, 16, 1, 0, Math.PI], position: [0, 1.4, 0.56], rotation: [-Math.PI / 2, 0, 0], color: '#94a3b8' },
        { id: 'arch-3', type: 'ring', args: [0.35, 0.45, 16, 1, 0, Math.PI], position: [1.1, 1.4, 0.56], rotation: [-Math.PI / 2, 0, 0], color: '#94a3b8' },
        // Order labels (floating spheres)
        { id: 'label-doric', type: 'sphere', args: [0.1, 8, 8], position: [-2.1, 1.25, 0], color: '#94a3b8' },
        { id: 'label-ionic', type: 'sphere', args: [0.09, 8, 8], position: [-1.95, 3.7, 0], color: '#8b5cf6' },
        { id: 'label-cor', type: 'sphere', args: [0.08, 8, 8], position: [-1.8, 6.05, 0], color: '#fbbf24' },
        { id: 'label-attic', type: 'sphere', args: [0.07, 8, 8], position: [-1.65, 7.8, 0], color: '#f97316' },
      ],
    },
  ],
}
