// src/app/dashboard/3d-lab/_config/modules/byzantine-pendentive.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const byzantinePendentiveConfig: CutawaySectionConfig = {
  id: 'byzantine-pendentive',
  title: 'Byzantine Pendentive',
  description:
    'Byzantine structural invention: triangular curved pendentive surfaces transition a square bay into a circular drum, allowing a dome above.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4, 3.5, 4], fov: 42 },
  layers: [
    {
      id: 'square-piers',
      label: 'Square Bay Piers',
      material: 'Brick / Stone Masonry',
      description: 'Four massive piers define the square bay. Pendentives spring from the tops of arches connecting these piers.',
      depth: 0,
      geometry: { id: 'geo-pier', type: 'box', args: [0.5, 3.0, 0.5], position: [-1.25, 1.5, -1.25], color: '#b0b0b0' },
    },
    {
      id: 'square-arches',
      label: 'Spanning Arches (4 sides)',
      material: 'Brick Semi-arch',
      description: 'Four semicircular arches span between the piers on each side of the square bay — these arches define the pendentive geometry.',
      depth: 0.2,
      geometry: { id: 'geo-sparch', type: 'ring', args: [0.8, 1.1, 24], position: [0, 3.5, -1.2], rotation: [Math.PI / 2, 0, 0], color: '#a87030' },
    },
    {
      id: 'pendentive',
      label: 'Pendentive (Triangular Curved Surface)',
      material: 'Brick / Thin Shell Masonry',
      description: 'Pendentive: triangular, concave, curved surface filling each corner between arch and drum. Geometrically derived from the surface of a sphere — transfers dome thrust to corner piers.',
      depth: 0.4,
      geometry: { id: 'geo-pend', type: 'sphere', args: [1.5, 16, 16, 0, Math.PI / 2, 0, Math.PI / 4], position: [-1.2, 3.2, -1.2], color: '#c4913f', opacity: 0.8, transparent: true },
    },
    {
      id: 'drum',
      label: 'Circular Drum',
      material: 'Brick with Window Openings',
      description: 'Circular drum above pendentives — vertical cylindrical wall supporting the dome. Windows pierce the drum for clerestory lighting (Hagia Sophia: 40 windows).',
      depth: 0.6,
      geometry: { id: 'geo-drum', type: 'cylinder', args: [1.2, 1.2, 0.8, 24, 1, 1], position: [0, 4.65, 0], color: '#d4a853' },
    },
    {
      id: 'dome-shell',
      label: 'Hemispherical Dome',
      material: 'Thin Brick Shell',
      description: 'Hemispherical dome in thin brick — lightweight brick courses laid in herringbone pattern for stability without centering. Acts as a membrane in compression.',
      depth: 0.75,
      geometry: { id: 'geo-dome', type: 'sphere', args: [1.2, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 5.05, 0], color: '#c4913f' },
    },
    {
      id: 'mosaic-interior',
      label: 'Interior Gold Mosaic',
      material: 'Glass Tesserae Mosaic',
      description: 'Interior surfaces covered in gold glass mosaic tesserae — dematerializes wall, creates luminous golden background for sacred imagery.',
      depth: 0.9,
      geometry: { id: 'geo-mosaic', type: 'sphere', args: [1.15, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 5.05, 0], color: '#b8942a', opacity: 0.6, transparent: true },
    },
  ],
  annotations: [
    {
      id: 'ann-pendentive',
      label: 'Pendentive: Square-to-Circle',
      description: 'The pendentive solves the geometric problem of placing a circular dome over a square bay — a key Byzantine innovation enabling grand domed spaces.',
      position: () => [-2.0, 3.5, 0.8],
    },
    {
      id: 'ann-thrust',
      label: 'Dome Thrust to Piers',
      description: 'Dome load travels through pendentives to the four corner piers — structural path is dome → pendentive → arch → pier. Lateral thrust resisted by massive piers or half-domes.',
      position: () => [2.0, 2.5, 0.8],
    },
    {
      id: 'ann-light',
      label: 'Clerestory Lighting Strategy',
      description: 'Drum windows at base of dome create ring of light — dome appears to float. Hagia Sophia has 40 windows in its drum.',
      position: () => [2.0, 5.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 3.5 } },
    { label: 'Pier Level', values: { cutPosition: 1.5 } },
    { label: 'Pendentive Zone', values: { cutPosition: 3.5 } },
    { label: 'Dome & Drum', values: { cutPosition: 5.5 } },
  ],
}

