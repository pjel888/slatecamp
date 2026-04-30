// src/features/3d-lab/config/modules/ifugao-house.ts
// Ifugao House — Philippine Vernacular Architecture
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const ifugaoHouseConfig: ExplodedAssemblyConfig = {
  id: 'ifugao-house',
  title: 'Ifugao House (Bale)',
  description: 'Exploded assembly of the traditional Ifugao bale showing its four hardwood posts with rat guards, single-room floor platform, and distinctive massive pyramidal thatched roof that constitutes the majority of the structure.',
  subject: 'history',
  parts: [
    {
      id: 'ifg-post-1',
      label: 'Main Post (Tukud) — FR',
      description: 'One of four massive hardwood posts (tukud) supporting the house. Molave or narra. Set in stone pads, not buried, for longevity.',
      geometry: { id: 'ifg-post-1-geo', type: 'cylinder', position: [-0.3, 0.2, -0.3], args: [0.06, 0.06, 0.9, 8], color: '#92400e' },
      explodeOffset: [-0.5, -0.3, -0.5],
    },
    {
      id: 'ifg-post-2',
      label: 'Main Post — FL',
      description: 'Front-left post. The four posts are the primary structural element — all other components attach to or rest on them.',
      geometry: { id: 'ifg-post-2-geo', type: 'cylinder', position: [0.3, 0.2, -0.3], args: [0.06, 0.06, 0.9, 8], color: '#92400e' },
      explodeOffset: [0.5, -0.3, -0.5],
    },
    {
      id: 'ifg-post-3',
      label: 'Main Post — RR',
      description: 'Rear-right post. Posts are typically 1.2–1.5m above grade, creating a protected under-space.',
      geometry: { id: 'ifg-post-3-geo', type: 'cylinder', position: [-0.3, 0.2, 0.3], args: [0.06, 0.06, 0.9, 8], color: '#92400e' },
      explodeOffset: [-0.5, -0.3, 0.5],
    },
    {
      id: 'ifg-post-4',
      label: 'Main Post — RL',
      description: 'Rear-left post completing the four-post frame.',
      geometry: { id: 'ifg-post-4-geo', type: 'cylinder', position: [0.3, 0.2, 0.3], args: [0.06, 0.06, 0.9, 8], color: '#92400e' },
      explodeOffset: [0.5, -0.3, 0.5],
    },
    {
      id: 'ifg-rat-guard',
      label: 'Rat Guard (Halipan)',
      description: 'Circular wooden disk slid over each post to prevent rats from climbing into the granary. A signature detail of Ifugao construction — critical for protecting rice stores.',
      geometry: { id: 'ifg-rat-guard-geo', type: 'cylinder', position: [-0.3, 0.55, -0.3], args: [0.15, 0.15, 0.03, 16], color: '#a3734c' },
      explodeOffset: [-0.5, 0.1, -0.5],
    },
    {
      id: 'ifg-floor-beams',
      label: 'Floor Beams (Soleras)',
      description: 'Hardwood floor beams connecting post tops. Support the single-room floor platform.',
      geometry: { id: 'ifg-floor-beams-geo', type: 'box', position: [0, 0.7, 0], args: [0.7, 0.08, 0.7], color: '#a3734c' },
      explodeOffset: yOff(0.2),
    },
    {
      id: 'ifg-floor',
      label: 'Single-Room Floor',
      description: 'Single-room floor of the bale — the entire living, sleeping, and storage space of the family. Compact and thermally efficient in the Ifugao highlands.',
      geometry: { id: 'ifg-floor-geo', type: 'box', position: [0, 0.78, 0], args: [0.65, 0.05, 0.65], color: '#78350f' },
      explodeOffset: yOff(0.3),
    },
    {
      id: 'ifg-walls',
      label: 'Woven Bamboo Walls',
      description: 'Low woven bamboo walls on two or three sides. Very short — interior headroom is mostly in the roof space.',
      geometry: { id: 'ifg-walls-geo', type: 'box', position: [0, 1.0, -0.33], args: [0.65, 0.3, 0.04], color: '#ca8a04', opacity: 0.8, transparent: true },
      explodeOffset: [0, 0.3, -0.6],
    },
    {
      id: 'ifg-roof-frame',
      label: 'Roof Frame (Pyramidal)',
      description: 'Steeply pitched pyramidal roof frame of bamboo and light timber. The massive roof dominates the structure — far larger than the floor area below.',
      geometry: { id: 'ifg-roof-frame-geo', type: 'box', position: [0, 1.2, 0], args: [0.7, 0.08, 0.7], color: '#92400e' },
      explodeOffset: yOff(0.6),
    },
    {
      id: 'ifg-thatch',
      label: 'Cogon Grass Thatch Roof',
      description: 'Thick layered cogon grass thatching on the pyramidal roof. Excellent thermal insulation for cool Cordillera climate. The overhanging eaves protect the walls below.',
      geometry: { id: 'ifg-thatch-geo', type: 'cone', position: [0, 1.75, 0], args: [0.55, 1.0, 4], color: '#ca8a04' },
      explodeOffset: yOff(1.0),
    },
  ],
  camera: { position: [3, 2.5, 3], fov: 45 },
}

