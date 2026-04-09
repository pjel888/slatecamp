// src/features/3d-lab/config/modules/10-materials/wall-violations.ts
// Expanded violation rules — 3 original + 9 new

import type { ViolationRule } from '@/features/3d-lab/types/templates'
import { WALL_CODES } from './wall-constants'

const num = (v: number | string | boolean): number => typeof v === 'number' ? v : Number(v)
const str = (v: number | string | boolean): string => String(v)
const mm = (v: number | string | boolean): number => (typeof v === 'number' ? v : Number(v)) / 1000

export const wallViolations: ViolationRule[] = [
  // ── Original 3 violations (preserved exactly) ──
  {
    id: 'height-below-min',
    field: 'wallHeight',
    check: (p) => num(p.wallHeight) < 2400,
    message: 'Wall height below minimum ceiling clearance of 2.4m for habitable rooms',
    codeCitation: 'PD 1096 Rule VII §708',
    severity: 'warning',
    position: (p) => [0, mm(p.wallHeight) + 0.3, 0.5],
  },
  {
    id: 'chb-thickness-min',
    field: 'coreType',
    check: (p) => str(p.coreType) === 'chb',
    message: 'CHB non-bearing walls: min 100mm (4"); bearing walls: min 150mm (6")',
    codeCitation: 'NSCP 2015 §702.1',
    severity: 'info',
    position: () => [0, 1.5, 0.5],
  },
  {
    id: 'brick-load-bearing',
    field: 'coreType',
    check: (p) => str(p.coreType) === 'brick' && num(p.wallHeight) > 3600,
    message: 'Brick walls exceeding 3.6m height require structural engineering review',
    codeCitation: 'NSCP 2015 §705.2',
    severity: 'warning',
    position: (p) => [0, mm(p.wallHeight) + 0.3, 0.6],
  },

  // ── New violations ──
  {
    id: 'chb-rebar-spacing-max',
    field: 'rebarSpacing',
    check: (p) => str(p.coreType) === 'chb' && num(p.rebarSpacing || 800) > WALL_CODES.NSCP.CHB_MAX_REBAR_SPACING_MM,
    message: 'CHB rebar spacing exceeds maximum 1200mm per NSCP',
    codeCitation: 'NSCP 2015 structural notes',
    severity: 'warning',
    position: () => [0, 2.0, 0.5],
  },
  {
    id: 'chb-no-reinforcement',
    field: 'showReinforcement',
    check: (p) => str(p.coreType) === 'chb' && p.showReinforcement === false,
    message: 'CHB wall without reinforcement is non-compliant in Philippine seismic zones',
    codeCitation: 'NSCP 2015 §706',
    severity: 'error',
    position: () => [0, 1.8, 0.5],
  },
  {
    id: 'chb-length-no-stiffener',
    field: 'wallLength',
    check: (p) => str(p.coreType) === 'chb' && num(p.wallLength) > WALL_CODES.NSCP.CHB_MAX_STIFFENER_SPACING_MM,
    message: 'CHB wall exceeds 4.0m without stiffener column — add stiffener columns',
    codeCitation: 'NSCP structural notes',
    severity: 'warning',
    position: () => [0, 1.0, 0.5],
  },
  {
    id: 'plaster-on-drywall',
    field: 'showPlaster',
    check: (p) => ['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)) && p.showPlaster === true,
    message: 'Plaster is not standard on framed partition walls — use joint compound instead',
    codeCitation: 'Construction practice',
    severity: 'info',
    position: () => [0, 1.2, 0.5],
  },
  {
    id: 'chb-bearing-below-150',
    field: 'chbSize',
    check: (p) => str(p.coreType) === 'chb' && str(p.chbSize || '150') === '100',
    message: 'CHB 100mm (4") is for non-bearing partitions only. Bearing walls require 150mm minimum.',
    codeCitation: 'NSCP 2015 §702.1',
    severity: 'warning',
    position: () => [0, 1.5, 0.5],
  },
  {
    id: 'single-gypsum-fire-1hr',
    field: 'gypsumThickness',
    check: (p) => str(p.coreType) === 'drywall' && str(p.gypsumThickness || '12.5') === '12.5' && str(p.gypsumLayers || 'Single layer') === 'Single layer',
    message: 'Single ½" gypsum provides only 30-minute fire rating — use ⅝" Type X for 1-hour rating',
    codeCitation: 'ASTM E119',
    severity: 'info',
    position: () => [0, 2.0, 0.5],
  },
  {
    id: 'height-below-service-min',
    field: 'wallHeight',
    check: (p) => num(p.wallHeight) < WALL_CODES.PD_1096.MIN_SERVICE_HEIGHT_MM,
    message: 'Wall height below minimum 2.1m even for service rooms',
    codeCitation: 'PD 1096 Rule VII §708',
    severity: 'error',
    position: (p) => [0, mm(p.wallHeight) + 0.3, 0.5],
  },
  {
    id: 'no-insulation-acoustic',
    field: 'showInsulation',
    check: (p) => str(p.coreType) === 'drywall' && p.showInsulation === false,
    message: 'Drywall without insulation has STC ~35 — consider adding insulation for acoustic privacy',
    codeCitation: 'IBC practice (reference)',
    severity: 'info',
    position: () => [0, 1.5, 0.5],
  },
  {
    id: 'plywood-no-fire-rating',
    field: 'coreType',
    check: (p) => str(p.coreType) === 'plywood',
    message: 'Plywood partition is combustible with no fire rating — not suitable for fire-rated assemblies',
    codeCitation: 'RA 9514 IRR',
    severity: 'warning',
    position: () => [0, 1.8, 0.5],
  },
]
