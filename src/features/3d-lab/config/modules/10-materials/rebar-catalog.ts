// src/features/3d-lab/config/modules/rebar-catalog.ts
// Full Philippine Rebar Catalog — 8mm through 36mm
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

export const rebarCatalogConfig: ExplodedAssemblyConfig = {
  id: 'rebar-catalog',
  title: 'Philippine Rebar Catalog (8–36mm)',
  description: 'Full Philippine standard deformed reinforcing bar (rebar) catalog from 8mm through 36mm, displayed at relative scale with unit weights per ASTM A615 / PNS 49.',
  subject: 'materials',
  comparisonMode: true,
  parts: [
    {
      id: 'rc-8mm',
      label: '8mm ø (0.395 kg/m)',
      description: 'Smallest standard Philippine rebar. Used for stirrups, ties, slab distribution bars. Unit weight: 0.395 kg/m.',
      codeCitation: 'PNS 49 / ASTM A615',
      geometry: { id: 'rc-8mm-geo', type: 'cylinder', position: [-1.75, 0, 0], args: [0.04, 0.04, 1.0, 10], color: '#D64545' },
      explodeOffset: [-1.75, 0, 0],
    },
    {
      id: 'rc-10mm',
      label: '10mm ø (0.617 kg/m)',
      description: '10mm — most common residential bar. Slabs, walls, stirrups. 0.617 kg/m.',
      geometry: { id: 'rc-10mm-geo', type: 'cylinder', position: [-1.45, 0, 0], args: [0.05, 0.05, 1.0, 10], color: '#D64545' },
      explodeOffset: [-1.45, 0, 0],
    },
    {
      id: 'rc-12mm',
      label: '12mm ø (0.888 kg/m)',
      description: '12mm — footing, light beams, slab main bars. 0.888 kg/m.',
      geometry: { id: 'rc-12mm-geo', type: 'cylinder', position: [-1.15, 0, 0], args: [0.06, 0.06, 1.0, 10], color: '#b91c1c' },
      explodeOffset: [-1.15, 0, 0],
    },
    {
      id: 'rc-16mm',
      label: '16mm ø (1.578 kg/m)',
      description: '16mm — standard beam and column bars. 1.578 kg/m.',
      geometry: { id: 'rc-16mm-geo', type: 'cylinder', position: [-0.85, 0, 0], args: [0.08, 0.08, 1.0, 10], color: '#991b1b' },
      explodeOffset: [-0.85, 0, 0],
    },
    {
      id: 'rc-20mm',
      label: '20mm ø (2.466 kg/m)',
      description: '20mm — primary beam/column bars in mid-rise. 2.466 kg/m.',
      geometry: { id: 'rc-20mm-geo', type: 'cylinder', position: [-0.55, 0, 0], args: [0.10, 0.10, 1.0, 10], color: '#7f1d1d' },
      explodeOffset: [-0.55, 0, 0],
    },
    {
      id: 'rc-22mm',
      label: '22mm ø (2.984 kg/m)',
      description: '22mm — bridge and heavy structural. 2.984 kg/m.',
      geometry: { id: 'rc-22mm-geo', type: 'cylinder', position: [-0.25, 0, 0], args: [0.11, 0.11, 1.0, 10], color: '#64748b' },
      explodeOffset: [-0.25, 0, 0],
    },
    {
      id: 'rc-25mm',
      label: '25mm ø (3.853 kg/m)',
      description: '25mm — large columns, transfer beams. 3.853 kg/m.',
      geometry: { id: 'rc-25mm-geo', type: 'cylinder', position: [0.05, 0, 0], args: [0.125, 0.125, 1.0, 10], color: '#475569' },
      explodeOffset: [0.05, 0, 0],
    },
    {
      id: 'rc-28mm',
      label: '28mm ø (4.834 kg/m)',
      description: '28mm — high-rise columns. 4.834 kg/m.',
      geometry: { id: 'rc-28mm-geo', type: 'cylinder', position: [0.35, 0, 0], args: [0.14, 0.14, 1.0, 10], color: '#334155' },
      explodeOffset: [0.35, 0, 0],
    },
    {
      id: 'rc-32mm',
      label: '32mm ø (6.313 kg/m)',
      description: '32mm — mat foundation and heavy columns. 6.313 kg/m.',
      geometry: { id: 'rc-32mm-geo', type: 'cylinder', position: [0.65, 0, 0], args: [0.16, 0.16, 1.0, 10], color: '#1e293b' },
      explodeOffset: [0.65, 0, 0],
    },
    {
      id: 'rc-36mm',
      label: '36mm ø (7.990 kg/m)',
      description: '36mm — largest standard Philippine deformed bar. Bridge piers, caissons, mega-columns. 7.990 kg/m.',
      codeCitation: 'PNS 49 Grade 60',
      geometry: { id: 'rc-36mm-geo', type: 'cylinder', position: [0.95, 0, 0], args: [0.18, 0.18, 1.0, 10], color: '#0f172a' },
      explodeOffset: [0.95, 0, 0],
    },
  ],
  camera: { position: [0, 2, 3], fov: 55 },
}

