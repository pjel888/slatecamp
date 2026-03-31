// src/app/dashboard/3d-lab/_config/modules/standard-material-sheets.ts
// Standard Material Sheets — Construction Materials
import type { ExplodedAssemblyConfig } from '../../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

// At 1:100 scale: 1220mm = 0.122 units, 2440mm = 0.244 units
// For clarity scale up 4×: 1220mm → 0.488, 2440mm → 0.976

export const standardMaterialSheetsConfig: ExplodedAssemblyConfig = {
  id: 'standard-material-sheets',
  title: 'Standard Material Sheets',
  description: 'Side-by-side exploded stacks showing standard Philippine sheet material sizes: Plywood (1220×2440mm) in multiple thicknesses, and Gypsum Board (1220×2440mm) in standard thickness — all at the same 1220×2440mm plan size.',
  subject: 'materials',
  comparisonMode: true,
  parts: [
    // ── PLYWOOD STACK (left) ─────────────────────────────────────────────────
    {
      id: 'sms-ply-6mm',
      label: 'Plywood 6mm (1/4″)',
      description: 'Plywood 6mm (1/4″) — used for cabinet backs, drawer bottoms, light wall sheathing. Sheet size 1220×2440mm.',
      codeCitation: 'PNS 196 / PS 1',
      geometry: { id: 'sms-ply-6mm-geo', type: 'box', position: [-0.6, 0.003, 0], args: [0.488, 0.006, 0.244], color: '#ca8a04' },
      explodeOffset: [-0.6, 0, 0],
    },
    {
      id: 'sms-ply-9mm',
      label: 'Plywood 9mm (3/8″)',
      description: 'Plywood 9mm — formwork, cabinet sides, light floor sheathing.',
      geometry: { id: 'sms-ply-9mm-geo', type: 'box', position: [-0.6, 0.0075, 0], args: [0.488, 0.009, 0.244], color: '#b45309' },
      explodeOffset: [-0.6, 0.1, 0],
    },
    {
      id: 'sms-ply-12mm',
      label: 'Plywood 12mm (1/2″)',
      description: 'Plywood 12mm — most common thickness for sub-floors, concrete formwork, furniture carcass.',
      geometry: { id: 'sms-ply-12mm-geo', type: 'box', position: [-0.6, 0.012, 0], args: [0.488, 0.012, 0.244], color: '#92400e' },
      explodeOffset: [-0.6, 0.2, 0],
    },
    {
      id: 'sms-ply-18mm',
      label: 'Plywood 18mm (3/4″)',
      description: 'Plywood 18mm — structural floor decking, heavy formwork (formply). Standard formply for concrete slab formwork in Philippine construction.',
      codeCitation: 'DPWH Blue Book / PNS 196',
      geometry: { id: 'sms-ply-18mm-geo', type: 'box', position: [-0.6, 0.019, 0], args: [0.488, 0.018, 0.244], color: '#78350f' },
      explodeOffset: [-0.6, 0.3, 0],
    },
    {
      id: 'sms-ply-25mm',
      label: 'Plywood 25mm (1″)',
      description: 'Plywood 25mm — heavy structural use, heavy-duty formwork, stair treads. Heaviest standard sheet.',
      geometry: { id: 'sms-ply-25mm-geo', type: 'box', position: [-0.6, 0.0275, 0], args: [0.488, 0.025, 0.244], color: '#451a03' },
      explodeOffset: [-0.6, 0.4, 0],
    },
    {
      id: 'sms-ply-label',
      label: 'Plywood Sheet Label',
      description: 'All plywood sheets: 1220mm × 2440mm nominal. Actual size may be 1200×2400mm. Philippine standard is PS 1 (Softwood) and PNS 196 (Hardwood).',
      geometry: { id: 'sms-ply-label-geo', type: 'box', position: [-0.6, -0.02, 0], args: [0.5, 0.01, 0.26], color: '#D4951A' },
      explodeOffset: [-0.6, -0.1, 0],
    },
    // ── GYPSUM BOARD STACK (right) ───────────────────────────────────────────
    {
      id: 'sms-gyp-9mm',
      label: 'Gypsum Board 9.5mm (3/8″)',
      description: 'Gypsum board 9.5mm — lightest ceiling board. 1220×2440mm. 8.5 kg/m².',
      codeCitation: 'ASTM C36 / PNS 106',
      geometry: { id: 'sms-gyp-9mm-geo', type: 'box', position: [0.6, 0.00475, 0], args: [0.488, 0.0095, 0.244], color: '#e4e4e7' },
      explodeOffset: [0.6, 0, 0],
    },
    {
      id: 'sms-gyp-12mm',
      label: 'Gypsum Board 12.5mm (1/2″)',
      description: 'Gypsum board 12.5mm — standard wall and ceiling board. 1220×2440mm. Most common in Philippine interiors. 10.8 kg/m².',
      geometry: { id: 'sms-gyp-12mm-geo', type: 'box', position: [0.6, 0.0125, 0], args: [0.488, 0.0125, 0.244], color: '#d4d4d8' },
      explodeOffset: [0.6, 0.15, 0],
    },
    {
      id: 'sms-gyp-15mm',
      label: 'Gypsum Board 15.9mm (5/8″)',
      description: 'Gypsum board 15.9mm — fire-rated Type X board. 1220×2440mm. Required for 1-hour rated assemblies. 13.7 kg/m².',
      codeCitation: 'ASTM C36 Type X',
      geometry: { id: 'sms-gyp-15mm-geo', type: 'box', position: [0.6, 0.0159, 0], args: [0.488, 0.0159, 0.244], color: '#f97316', opacity: 0.75, transparent: true },
      explodeOffset: [0.6, 0.3, 0],
    },
    {
      id: 'sms-gyp-moisture',
      label: 'Moisture-Resistant Gypsum (MR)',
      description: 'Green board (MR) 12.5mm — moisture-resistant face for wet areas. 1220×2440mm. Silicone-treated core and paper.',
      geometry: { id: 'sms-gyp-moisture-geo', type: 'box', position: [0.6, 0.0125, 0.28], args: [0.488, 0.0125, 0.244], color: '#2D9F6F', opacity: 0.8, transparent: true },
      explodeOffset: [0.6, 0.45, 0.3],
    },
    {
      id: 'sms-gyp-label',
      label: 'Gypsum Board Sheet Label',
      description: 'All gypsum boards: 1220mm × 2440mm nominal. Installed with screws or adhesive to steel studs or furring. Taped and skimmed joints.',
      geometry: { id: 'sms-gyp-label-geo', type: 'box', position: [0.6, -0.02, 0], args: [0.5, 0.01, 0.26], color: '#a1a1aa' },
      explodeOffset: [0.6, -0.1, 0],
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}
