// src/features/3d-lab/config/modules/smoke-partition-requirements.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const smokePartitionRequirementsConfig: CutawaySectionConfig = {
  id: 'smoke-partition-requirements',
  title: 'Smoke Partition Requirements',
  description:
    'Building section showing smoke barriers, draft stops, and smoke partitions per RA 9514 — controls smoke movement during fire emergencies.',
  subject: 'ra-9514',
  cutAxis: 'y',
  camera: { position: [4.5, 3.5, 4.5], fov: 42 },
  layers: [
    {
      id: 'floor-slab',
      label: 'Floor Slabs',
      material: 'RC Slab 150mm',
      description: 'RC floor slabs — smoke barriers must extend from slab to underside of slab above.',
      depth: 0,
      geometry: { id: 'geo-slabs', type: 'box', args: [5, 0.15, 1.0], position: [0, 0.075, 0], color: '#b0b0b0' },
    },
    {
      id: 'floor2-slab',
      label: 'Floor 2 Slab',
      material: 'RC Slab 150mm',
      description: 'Second floor slab reference.',
      depth: 0.05,
      geometry: { id: 'geo-slab2', type: 'box', args: [5, 0.15, 1.0], position: [0, 3.075, 0], color: '#b0b0b0' },
    },
    {
      id: 'smoke-barrier',
      label: 'Smoke Barrier Wall',
      material: 'CMU 150mm / Gypsum 2-layer',
      description: 'Smoke barrier: continuous from floor to roof deck, 1-hour fire-resistance rating. Divides large floor plates into smoke compartments max 2000m².',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.1',
      depth: 0.2,
      geometry: { id: 'geo-sb', type: 'box', args: [0.15, 3.0, 1.0], position: [0, 1.65, 0], color: '#e0f2fe' },
    },
    {
      id: 'draft-stop',
      label: 'Draft Stop (Attic/Concealed)',
      material: 'Gypsum Board 12mm',
      description: 'Draft stop in concealed spaces (attic, suspended ceiling plenum) every 300m² or 30m — prevents lateral smoke spread in void spaces.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.3',
      depth: 0.4,
      geometry: { id: 'geo-ds', type: 'box', args: [0.012, 1.0, 1.0], position: [1.5, 3.65, 0], color: '#fef9c3' },
    },
    {
      id: 'smoke-damper',
      label: 'Smoke Damper in Duct',
      material: 'UL Listed Smoke Damper',
      description: 'Smoke damper in HVAC duct passing through smoke barrier — closes automatically on smoke detector activation.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.2',
      depth: 0.55,
      geometry: { id: 'geo-sdamp', type: 'box', args: [0.3, 0.25, 0.25], position: [0, 2.0, 0], color: '#64748b' },
    },
    {
      id: 'smoke-door',
      label: 'Smoke Door Assembly',
      material: 'Solid-core Door with Gasket',
      description: 'Smoke-actuated door in smoke barrier — solid-core wood or steel with perimeter smoke gasket, self-closing, 20-min rated minimum.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.1',
      depth: 0.7,
      geometry: { id: 'geo-sdoor', type: 'box', args: [0.04, 2.1, 0.9], position: [-0.1, 1.2, 0], color: '#78716c' },
    },
    {
      id: 'plenum-space',
      label: 'Ceiling Plenum',
      material: 'Concealed Space Above Ceiling',
      description: 'Ceiling plenum — draft stops required to compartmentalize smoke spread. Return air plenum must have listed materials.',
      depth: 0.85,
      geometry: { id: 'geo-plenum', type: 'box', args: [5, 0.6, 1.0], position: [0, 3.45, 0], color: '#f3f4f6', opacity: 0.4, transparent: true },
    },
  ],
  annotations: [
    {
      id: 'ann-barrier',
      label: 'Smoke Barrier: max 2000m² compartment',
      description: 'Smoke barriers divide floor into compartments ≤2000m² each. Must extend slab-to-slab, including through concealed spaces.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.1',
      position: () => [0.5, 1.5, 0.6],
    },
    {
      id: 'ann-draft',
      label: 'Draft Stops: every 300m²',
      description: 'Draft stops in concealed attic/ceiling spaces every 300m² or 30m run — 12mm gypsum board or equivalent non-combustible material.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.3',
      position: () => [2.5, 3.8, 0.6],
    },
    {
      id: 'ann-damper',
      label: 'Smoke Dampers in Ducts',
      description: 'Every duct penetrating a smoke barrier must have a listed smoke damper. Closes automatically on duct detector or system signal.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.5.2',
      position: () => [0.8, 2.5, 0.6],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 2.5 } },
    { label: 'Barrier & Door', values: { cutPosition: 1.5 } },
    { label: 'Plenum Level', values: { cutPosition: 3.5 } },
    { label: 'Draft Stop', values: { cutPosition: 3.7 } },
  ],
}

