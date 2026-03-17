// src/app/dashboard/3d-lab/_config/modules/rebar-sizes-catalog.ts
// Rebar Sizes Catalog — NSCP / Philippine Standards
import type { ExplodedAssemblyConfig } from '../../_types/templates'

// Scale: 1 unit = 100mm diameter for visual clarity. Length = 1.0 unit = 1000mm.
export const rebarSizesCatalogConfig: ExplodedAssemblyConfig = {
  id: 'rebar-sizes-catalog',
  title: 'Philippine Rebar Sizes Catalog',
  description: 'Side-by-side comparison of Philippine standard rebar sizes 10mm through 32mm shown at relative scale, with unit weights per ASTM A615 / PNS standards.',
  subject: 'nscp',
  comparisonMode: true,
  parts: [
    {
      id: 'rbs-10mm',
      label: '10mm ø Rebar (0.617 kg/m)',
      description: 'Deformed bar 10mm (Grade 40/60). Most common in residential slabs, walls, and stirrups. Unit weight: 0.617 kg/m.',
      codeCitation: 'NSCP Section 403 / PNS 49',
      geometry: { id: 'rbs-10mm-geo', type: 'cylinder', position: [-1.05, 0, 0], args: [0.05, 0.05, 1.0, 12], color: '#D64545' },
      explodeOffset: [-1.05, 0, 0],
    },
    {
      id: 'rbs-12mm',
      label: '12mm ø Rebar (0.888 kg/m)',
      description: 'Deformed bar 12mm. Common in slabs on grade, footings, and light beams. Unit weight: 0.888 kg/m.',
      geometry: { id: 'rbs-12mm-geo', type: 'cylinder', position: [-0.75, 0, 0], args: [0.06, 0.06, 1.0, 12], color: '#D64545' },
      explodeOffset: [-0.75, 0, 0],
    },
    {
      id: 'rbs-16mm',
      label: '16mm ø Rebar (1.578 kg/m)',
      description: 'Deformed bar 16mm. Standard for beams, girders, and columns in mid-rise construction. Unit weight: 1.578 kg/m.',
      codeCitation: 'NSCP Section 403',
      geometry: { id: 'rbs-16mm-geo', type: 'cylinder', position: [-0.45, 0, 0], args: [0.08, 0.08, 1.0, 12], color: '#b91c1c' },
      explodeOffset: [-0.45, 0, 0],
    },
    {
      id: 'rbs-20mm',
      label: '20mm ø Rebar (2.466 kg/m)',
      description: 'Deformed bar 20mm. Heavy beams, transfer slabs, and primary column bars. Unit weight: 2.466 kg/m.',
      geometry: { id: 'rbs-20mm-geo', type: 'cylinder', position: [-0.15, 0, 0], args: [0.10, 0.10, 1.0, 12], color: '#991b1b' },
      explodeOffset: [-0.15, 0, 0],
    },
    {
      id: 'rbs-25mm',
      label: '25mm ø Rebar (3.853 kg/m)',
      description: 'Deformed bar 25mm. Large columns and transfer structures. Unit weight: 3.853 kg/m.',
      geometry: { id: 'rbs-25mm-geo', type: 'cylinder', position: [0.15, 0, 0], args: [0.125, 0.125, 1.0, 12], color: '#7f1d1d' },
      explodeOffset: [0.15, 0, 0],
    },
    {
      id: 'rbs-28mm',
      label: '28mm ø Rebar (4.834 kg/m)',
      description: 'Deformed bar 28mm. High-rise columns and prestressed elements. Unit weight: 4.834 kg/m.',
      geometry: { id: 'rbs-28mm-geo', type: 'cylinder', position: [0.45, 0, 0], args: [0.14, 0.14, 1.0, 12], color: '#64748b' },
      explodeOffset: [0.45, 0, 0],
    },
    {
      id: 'rbs-32mm',
      label: '32mm ø Rebar (6.313 kg/m)',
      description: 'Deformed bar 32mm. Very large high-rise columns, mat foundations. Unit weight: 6.313 kg/m.',
      geometry: { id: 'rbs-32mm-geo', type: 'cylinder', position: [0.75, 0, 0], args: [0.16, 0.16, 1.0, 12], color: '#475569' },
      explodeOffset: [0.75, 0, 0],
    },
  ],
  camera: { position: [0, 2, 3], fov: 50 },
}
