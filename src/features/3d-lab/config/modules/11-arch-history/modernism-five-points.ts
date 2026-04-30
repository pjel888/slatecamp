// src/features/3d-lab/config/modules/modernism-five-points.ts
// Modernism Five Points — Le Corbusier's Five Points of Architecture
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const modernismFivePointsConfig: ExplodedAssemblyConfig = {
  id: 'modernism-five-points',
  title: "Le Corbusier's Five Points of Architecture",
  description: 'Exploded model demonstrating Le Corbusier\'s Five Points of New Architecture (1927): pilotis, free plan, free facade, ribbon windows (fenêtre en longueur), and roof garden — as realized at Villa Savoye.',
  subject: 'history',
  parts: [
    // 1. Pilotis
    {
      id: 'mfp-piloti-1',
      label: 'Piloti 1 — Point 1: Pilotis',
      description: 'Concrete piloti (column on point foundation) raises the building off the ground. Frees the ground for circulation and gardens. Key to the free plan — no load-bearing walls below.',
      geometry: { id: 'mfp-piloti-1-geo', type: 'cylinder', position: [-0.5, 0.25, -0.4], args: [0.05, 0.05, 0.5, 8], color: '#94a3b8' },
      explodeOffset: [-0.7, -0.3, -0.6],
    },
    {
      id: 'mfp-piloti-2',
      label: 'Piloti 2',
      description: 'Second piloti. The ground level is entirely open — no walls, only slender columns.',
      geometry: { id: 'mfp-piloti-2-geo', type: 'cylinder', position: [0.5, 0.25, -0.4], args: [0.05, 0.05, 0.5, 8], color: '#94a3b8' },
      explodeOffset: [0.7, -0.3, -0.6],
    },
    {
      id: 'mfp-piloti-3',
      label: 'Piloti 3',
      description: 'Third piloti at rear. Grid of pilotis defines the structural module.',
      geometry: { id: 'mfp-piloti-3-geo', type: 'cylinder', position: [-0.5, 0.25, 0.4], args: [0.05, 0.05, 0.5, 8], color: '#94a3b8' },
      explodeOffset: [-0.7, -0.3, 0.6],
    },
    {
      id: 'mfp-piloti-4',
      label: 'Piloti 4',
      description: 'Fourth piloti completing the structural grid. Reinforced concrete Domino frame enables all five points.',
      geometry: { id: 'mfp-piloti-4-geo', type: 'cylinder', position: [0.5, 0.25, 0.4], args: [0.05, 0.05, 0.5, 8], color: '#94a3b8' },
      explodeOffset: [0.7, -0.3, 0.6],
    },
    // 2. Free Plan
    {
      id: 'mfp-floor-slab',
      label: 'Floor Slab — Point 2: Free Plan',
      description: 'Flat reinforced concrete floor slab supported on pilotis. Non-structural partition walls can be placed anywhere — the "free plan" liberated from structural constraints of load-bearing walls.',
      geometry: { id: 'mfp-floor-slab-geo', type: 'box', position: [0, 0.52, 0], args: [1.2, 0.06, 1.0], color: '#d4d4d8' },
      explodeOffset: yOff(0.2),
    },
    {
      id: 'mfp-partition',
      label: 'Free Partition Wall',
      description: 'Non-load-bearing partition wall positioned freely on the floor slab. Can be curved or angled — impossible in masonry construction.',
      geometry: { id: 'mfp-partition-geo', type: 'box', position: [0.2, 0.85, 0], args: [0.04, 0.5, 0.6], color: '#e4e4e7', opacity: 0.7, transparent: true },
      explodeOffset: [0.5, 0.4, 0],
    },
    // 3. Free Facade
    {
      id: 'mfp-facade',
      label: 'Free Façade — Point 3',
      description: 'The façade is non-structural — it can be any material, any arrangement of openings. Here a curtain wall of glass and thin infill panels hangs from the floor slabs.',
      geometry: { id: 'mfp-facade-geo', type: 'box', position: [0, 0.85, -0.52], args: [1.2, 0.5, 0.03], color: '#93c5fd', opacity: 0.5, transparent: true },
      explodeOffset: [0, 0.3, -0.8],
    },
    // 4. Ribbon Windows
    {
      id: 'mfp-ribbon-window',
      label: 'Ribbon Window — Point 4: Fenêtre en Longueur',
      description: 'Horizontal ribbon window running the full length of the façade. Only possible because facade is non-structural. Provides uniform daylighting and panoramic views.',
      geometry: { id: 'mfp-ribbon-window-geo', type: 'box', position: [0, 0.82, -0.54], args: [1.0, 0.15, 0.02], color: '#bfdbfe', opacity: 0.8, transparent: true },
      explodeOffset: [0, 0.25, -0.9],
    },
    // 5. Roof Garden
    {
      id: 'mfp-roof-slab',
      label: 'Roof Slab',
      description: 'Flat reinforced concrete roof slab with waterproofing membrane beneath the roof garden.',
      geometry: { id: 'mfp-roof-slab-geo', type: 'box', position: [0, 1.18, 0], args: [1.2, 0.06, 1.0], color: '#d4d4d8' },
      explodeOffset: yOff(0.7),
    },
    {
      id: 'mfp-roof-garden',
      label: 'Roof Garden — Point 5: Toit-Terrasse',
      description: 'Green roof garden replacing the ground area covered by the building. Recovers nature, provides insulation, and creates outdoor living space at elevation.',
      geometry: { id: 'mfp-roof-garden-geo', type: 'box', position: [0, 1.26, 0], args: [1.0, 0.04, 0.8], color: '#2D9F6F', opacity: 0.8, transparent: true },
      explodeOffset: yOff(1.0),
    },
    {
      id: 'mfp-planter',
      label: 'Roof Garden Planter',
      description: 'Raised planting bed on the roof terrace. The solarium and garden room complete the toit-terrasse concept at Villa Savoye.',
      geometry: { id: 'mfp-planter-geo', type: 'box', position: [0.3, 1.34, 0.2], args: [0.25, 0.12, 0.25], color: '#15803d' },
      explodeOffset: [0.4, 1.2, 0.3],
    },
  ],
  camera: { position: [3, 3, 3], fov: 45 },
}

