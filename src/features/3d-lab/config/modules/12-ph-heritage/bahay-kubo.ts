// src/app/dashboard/3d-lab/_config/modules/bahay-kubo.ts
// Bahay Kubo — Philippine Vernacular Architecture
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

export const bahayKuboConfig: ExplodedAssemblyConfig = {
  id: 'bahay-kubo',
  title: 'Bahay Kubo',
  description: 'Exploded assembly of the traditional Filipino Bahay Kubo showing stilt posts, bamboo floor, woven bamboo walls, and nipa palm roof — a masterpiece of passive climate response.',
  subject: 'history',
  parts: [
    {
      id: 'bk-post-1',
      label: 'Stilt Post (Haligi) — FR',
      description: 'Hardwood or bamboo stilt post raising floor off ground for flood protection and ventilation. Typically 1.0–1.5m above grade.',
      geometry: { id: 'bk-post-1-geo', type: 'cylinder', position: [-0.3, -0.4, -0.3], args: [0.04, 0.04, 0.8, 8], color: '#92400e' },
      explodeOffset: [-0.5, -0.3, -0.5],
    },
    {
      id: 'bk-post-2',
      label: 'Stilt Post (Haligi) — FL',
      description: 'Front-left stilt post. Posts are often set in stones or concrete pads to prevent rot.',
      geometry: { id: 'bk-post-2-geo', type: 'cylinder', position: [0.3, -0.4, -0.3], args: [0.04, 0.04, 0.8, 8], color: '#92400e' },
      explodeOffset: [0.5, -0.3, -0.5],
    },
    {
      id: 'bk-post-3',
      label: 'Stilt Post (Haligi) — RR',
      description: 'Rear-right stilt post. The elevated platform creates a shaded under-space (silong) used for storage or animals.',
      geometry: { id: 'bk-post-3-geo', type: 'cylinder', position: [-0.3, -0.4, 0.3], args: [0.04, 0.04, 0.8, 8], color: '#92400e' },
      explodeOffset: [-0.5, -0.3, 0.5],
    },
    {
      id: 'bk-post-4',
      label: 'Stilt Post (Haligi) — RL',
      description: 'Rear-left stilt post. Four-post configuration defines the basic single-room plan.',
      geometry: { id: 'bk-post-4-geo', type: 'cylinder', position: [0.3, -0.4, 0.3], args: [0.04, 0.04, 0.8, 8], color: '#92400e' },
      explodeOffset: [0.5, -0.3, 0.5],
    },
    {
      id: 'bk-floor-beam',
      label: 'Floor Beam (Soleras)',
      description: 'Horizontal bamboo or timber beams connecting post tops, supporting the bamboo floor slats (sahig).',
      geometry: { id: 'bk-floor-beam-geo', type: 'box', position: [0, 0.04, 0], args: [0.7, 0.06, 0.7], color: '#a3734c' },
      explodeOffset: [0, 0.1, 0],
    },
    {
      id: 'bk-floor',
      label: 'Bamboo Floor (Sahig)',
      description: 'Split bamboo slats laid across floor beams. Gaps allow air circulation from below and easy cleaning — well-suited to tropical climate.',
      geometry: { id: 'bk-floor-geo', type: 'box', position: [0, 0.1, 0], args: [0.68, 0.02, 0.68], color: '#ca8a04' },
      explodeOffset: [0, 0.3, 0],
    },
    {
      id: 'bk-wall-front',
      label: 'Woven Bamboo Wall (Kawayan)',
      description: 'Woven bamboo (amakan) wall panel. Allows cross-ventilation through the weave. Can be lifted for more airflow.',
      geometry: { id: 'bk-wall-front-geo', type: 'box', position: [0, 0.42, -0.34], args: [0.68, 0.6, 0.025], color: '#D4951A', opacity: 0.85, transparent: true },
      explodeOffset: [0, 0.4, -0.6],
    },
    {
      id: 'bk-wall-side',
      label: 'Woven Bamboo Wall (Side)',
      description: 'Side wall panel of woven bamboo. Lightweight and replaceable — reflects the temporality and adaptability of vernacular construction.',
      geometry: { id: 'bk-wall-side-geo', type: 'box', position: [0.34, 0.42, 0], args: [0.025, 0.6, 0.68], color: '#D4951A', opacity: 0.85, transparent: true },
      explodeOffset: [0.6, 0.4, 0],
    },
    {
      id: 'bk-roof-frame',
      label: 'Roof Frame (Bubong)',
      description: 'Bamboo or light timber roof frame with steep pitch to shed heavy tropical rainfall quickly.',
      geometry: { id: 'bk-roof-frame-geo', type: 'box', position: [0, 0.78, 0], args: [0.72, 0.06, 0.72], color: '#92400e' },
      explodeOffset: [0, 0.7, 0],
    },
    {
      id: 'bk-roof-nipa',
      label: 'Nipa Palm Roof Thatch',
      description: 'Nipa palm (anahaw) thatch shingles layered on bamboo frame. Excellent insulation; biodegradable and locally sourced.',
      geometry: { id: 'bk-roof-nipa-geo', type: 'cone', position: [0, 1.1, 0], args: [0.55, 0.65, 4], color: '#78350f' },
      explodeOffset: [0, 1.0, 0],
    },
    {
      id: 'bk-ladder',
      label: 'Bamboo Ladder (Hagdan)',
      description: 'Removable bamboo ladder providing access to the elevated floor. Can be pulled up at night for security.',
      geometry: { id: 'bk-ladder-geo', type: 'box', position: [-0.5, -0.1, -0.15], rotation: [0.4, 0, 0.15], args: [0.08, 0.7, 0.04], color: '#ca8a04' },
      explodeOffset: [-0.8, -0.2, -0.4],
    },
  ],
  camera: { position: [3, 2, 3], fov: 45 },
}

