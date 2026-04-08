// src/app/dashboard/3d-lab/_config/modules/08-vertical/stairway-configurator.ts
// ─────────────────────────────────────────────────────────────────────────────
// StairCode PH — Multi-Law Parallel Compliance Explorer
// PD 1096 (NBCP) · BP 220 (Housing) · BP 344 (Accessibility) · RA 9514 (Fire)
//
// Architecture: Each law evaluates geometry independently via the parallel
// rule-set pattern. Conflicts are flagged — never averaged or merged.
// Color severity: RA 9514 > BP 344 > PD 1096 > BP 220
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert mm parameter value to scene units (1 unit = 1 m) */
function mm(v: number | string | boolean): number {
  return (typeof v === 'number' ? v : Number(v)) / 1000
}

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function str(v: number | string | boolean): string {
  return String(v)
}

function bool(v: number | string | boolean): boolean {
  return v === true || v === 'true'
}

// ─── Law Color Palette (Ordered by Severity) ────────────────────────────────
// Each law has a permanent color identity. These are never reused elsewhere.

const LAW = {
  RA_9514: '#E74C3C', // Evacuation Red — CRITICAL (life-safety)
  BP_344: '#3498DB',  // Access Blue — HIGH (civil rights overlay)
  PD_1096: '#4A7FAD', // Code Slate — STANDARD (baseline)
  BP_220: '#F5A623',  // Housing Amber — CONTEXTUAL (relaxes baseline)
  PASS: '#2ECC71',    // Clearance Green
} as const

const NEUTRAL = {
  TREAD: '#a1a1aa',
  RISER: '#a1a1aa',
  LANDING: '#a1a1aa',
  HANDRAIL: '#71717a',
} as const

// ─── Project Classification Predicates ──────────────────────────────────────

type P = Record<string, number | boolean | string>

/** Is the project a BP 220 socialized or economic housing project? */
function isBP220(p: P): boolean {
  const pt = str(p.projectType)
  return pt === 'bp220_socialized' || pt === 'bp220_economic'
}

/** Is the stair part of an accessible route (BP 344 overlay)? */
function isAccessible(p: P): boolean {
  return bool(p.isAccessibleRoute)
}

/** Is the stair a required exit stair (RA 9514 overlay)? */
function isExit(p: P): boolean {
  return bool(p.isExitStair)
}

/** Is the occupant load > 50 (PD 1096 width escalation)? */
function isHighOcc(p: P): boolean {
  return bool(p.isHighOccupancy)
}

/** Is project type general residential? */
function isResidential(p: P): boolean {
  return str(p.projectType) === 'general_residential'
}

// ─── Violation Color Resolution ─────────────────────────────────────────────
// Each element displays ONE law's color — the most severe active violation.

function riserViolColor(p: P): string | null {
  const r = num(p.riserHeight)
  // Severity order: RA 9514 > PD 1096 > BP 220
  if (isExit(p) && r > 180) return LAW.RA_9514
  if (!isBP220(p) && r > 200) return LAW.PD_1096
  if (isBP220(p) && r > 250) return LAW.BP_220
  return null
}

function treadViolColor(p: P): string | null {
  const t = num(p.treadDepth)
  // All laws agree on 200 mm minimum
  if (t < 200) {
    if (isExit(p)) return LAW.RA_9514
    if (!isBP220(p)) return LAW.PD_1096
    return LAW.BP_220
  }
  return null
}

function widthViolColor(p: P): string | null {
  const w = num(p.stairWidth)
  // Severity order: BP 344 > RA 9514 > PD 1096 > BP 220
  if (isAccessible(p) && w < 1200) return LAW.BP_344
  if (isExit(p) && w < 900) return LAW.RA_9514
  if (!isBP220(p)) {
    if (isHighOcc(p) && w < 1100) return LAW.PD_1096
    if (!isResidential(p) && w < 900) return LAW.PD_1096
    if (isResidential(p) && w < 750) return LAW.PD_1096
  }
  if (isBP220(p) && w < 600) return LAW.BP_220
  return null
}

/** Returns the strictest applicable minimum width (for gap-plane geometry) */
function strictestMinWidth(p: P): number {
  const candidates: number[] = []

  // Base regime
  if (isBP220(p)) {
    candidates.push(600)
  } else if (isHighOcc(p)) {
    candidates.push(1100)
  } else if (!isResidential(p)) {
    candidates.push(900)
  } else {
    candidates.push(750)
  }

  // Overlays
  if (isAccessible(p)) candidates.push(1200)
  if (isExit(p)) candidates.push(900)

  return Math.max(...candidates)
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  // ── Project Classification ────────────────────────────────────────────────
  {
    key: 'projectType',
    label: 'Project Type',
    type: 'dropdown',
    default: 'general_residential',
    options: [
      { value: 'general_residential', label: 'General Residential' },
      { value: 'commercial', label: 'Commercial / Institutional' },
      { value: 'school', label: 'School / University' },
      { value: 'hospital', label: 'Hospital / Healthcare' },
      { value: 'bp220_socialized', label: 'BP 220 — Socialized Housing' },
      { value: 'bp220_economic', label: 'BP 220 — Economic Housing' },
    ],
    group: 'Project Classification',
  },
  {
    key: 'isAccessibleRoute',
    label: 'Part of Accessible Route?',
    type: 'toggle',
    default: false,
    group: 'Project Classification',
  },
  {
    key: 'isExitStair',
    label: 'Required Exit Stair?',
    type: 'toggle',
    default: false,
    group: 'Project Classification',
  },
  {
    key: 'isHighOccupancy',
    label: 'Occupant Load > 50?',
    type: 'toggle',
    default: false,
    group: 'Project Classification',
  },

  // ── Stair Geometry ────────────────────────────────────────────────────────
  {
    key: 'stairWidth',
    label: 'Clear Width',
    type: 'slider',
    min: 500,
    max: 1500,
    step: 25,
    default: 900,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'riserHeight',
    label: 'Riser Height',
    type: 'slider',
    min: 100,
    max: 300,
    step: 5,
    default: 185,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'treadDepth',
    label: 'Tread Depth',
    type: 'slider',
    min: 150,
    max: 350,
    step: 5,
    default: 250,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'headroom',
    label: 'Headroom',
    type: 'slider',
    min: 1800,
    max: 2500,
    step: 50,
    default: 2100,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'handrailHeight',
    label: 'Handrail Height',
    type: 'slider',
    min: 600,
    max: 1200,
    step: 25,
    default: 900,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'numRisers',
    label: 'Number of Risers',
    type: 'slider',
    min: 3,
    max: 20,
    step: 1,
    default: 12,
    group: 'Stair Geometry',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(p: P): GeometryInstruction[] {
  const rH = mm(p.riserHeight)
  const tD = mm(p.treadDepth)
  const sW = mm(p.stairWidth)
  const n = num(p.numRisers)
  const headroomM = mm(p.headroom)
  const hrH = mm(p.handrailHeight)

  // Resolve per-element violation colors (most severe active law wins)
  const rColor = riserViolColor(p) ?? NEUTRAL.RISER
  const tColor = treadViolColor(p) ?? NEUTRAL.TREAD
  const wColor = widthViolColor(p)
  const headViol = num(p.headroom) < 2000
  const hrViol =
    !isBP220(p) &&
    (num(p.handrailHeight) < 800 || num(p.handrailHeight) > 900)
  const hrColor = hrViol ? LAW.PD_1096 : NEUTRAL.HANDRAIL

  // Geometry constants
  const treadThk = 0.03
  const riserThk = 0.015
  const strThk = 0.04
  const hrRadius = 0.02
  const totalRise = n * rH
  const totalRun = (n - 1) * tD
  const strLen = Math.sqrt(totalRise ** 2 + totalRun ** 2)
  const strAngle = Math.atan2(totalRise, totalRun)
  const strCY = totalRise / 2
  const strCZ = -(totalRun / 2 - tD / 2)

  const g: GeometryInstruction[] = []

  // ── 1. Base platform (bottom landing) ─────────────────────────────────────
  g.push({
    id: 'base-platform',
    type: 'box',
    position: [0, -treadThk / 2, tD / 2],
    args: [sW, treadThk, tD],
    color: NEUTRAL.LANDING,
  })

  // ── 2. Treads & risers ────────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const y = (i + 1) * rH
    const z = -(i * tD)

    g.push({
      id: `tread-${i}`,
      type: 'box',
      position: [0, y - treadThk / 2, z],
      args: [sW, treadThk, tD],
      color: tColor,
    })

    g.push({
      id: `riser-${i}`,
      type: 'box',
      position: [0, y - rH / 2, z + tD / 2],
      args: [sW, rH, riserThk],
      color: rColor,
    })
  }

  // ── 3. Primary handrails ──────────────────────────────────────────────────
  for (const s of [-1, 1] as const) {
    g.push({
      id: `handrail-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [
        s * (sW / 2 + strThk / 2),
        strCY + hrH * Math.cos(strAngle),
        strCZ + hrH * Math.sin(strAngle),
      ],
      rotation: [Math.PI / 2 + strAngle, 0, 0],
      args: [hrRadius, hrRadius, strLen, 8],
      color: hrColor,
    })
  }

  // ── 5. Top landing ────────────────────────────────────────────────────────
  const topY = n * rH
  const topZ = -((n - 1) * tD + tD / 2)

  g.push({
    id: 'top-landing',
    type: 'box',
    position: [0, topY - treadThk / 2, topZ],
    args: [sW, treadThk, tD],
    color: NEUTRAL.LANDING,
  })

  // ── 6. Headroom clearance plane ───────────────────────────────────────────
  const midI = Math.floor(n / 2)
  const headY = midI * rH + headroomM
  const headZ = -(midI * tD - tD / 2)

  g.push({
    id: 'headroom-plane',
    type: 'box',
    position: [0, headY, headZ],
    args: [sW * 1.05, 0.005, totalRun + tD],
    color: headViol ? LAW.PD_1096 : '#dbeafe',
    opacity: 0.3,
    transparent: true,
  })

  // ── 7. BP 344 Ghost Handrails (Accessible Route Overlay) ──────────────────
  // When accessible route is active, show translucent rails at the BP 344
  // required heights (700 mm and 900 mm) with 300 mm extensions.
  if (isAccessible(p)) {
    const gR = 0.015 // ghost rail radius
    const gO = 0.4   // ghost opacity
    const gOff = 0.03 // outward offset from primary rail

    // Dual-height rails along the stair slope
    for (const hMm of [0.9, 0.7] as const) {
      for (const s of [-1, 1] as const) {
        g.push({
          id: `bp344-rail-${hMm * 1000}-${s < 0 ? 'L' : 'R'}`,
          type: 'cylinder',
          position: [
            s * (sW / 2 + strThk / 2 + gOff),
            strCY + hMm * Math.cos(strAngle),
            strCZ + hMm * Math.sin(strAngle),
          ],
          rotation: [Math.PI / 2 + strAngle, 0, 0],
          args: [gR, gR, strLen, 8],
          color: LAW.BP_344,
          opacity: gO,
          transparent: true,
        })
      }
    }

    // 300 mm horizontal extensions at bottom and top of stair
    const extLen = 0.3
    for (const s of [-1, 1] as const) {
      const xPos = s * (sW / 2 + strThk / 2 + gOff)

      // Bottom extension (extends forward from base)
      g.push({
        id: `bp344-ext-bot-${s < 0 ? 'L' : 'R'}`,
        type: 'cylinder',
        position: [xPos, 0.9, tD / 2 + extLen / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [gR, gR, extLen, 8],
        color: LAW.BP_344,
        opacity: gO,
        transparent: true,
      })

      // Top extension (extends beyond top landing)
      g.push({
        id: `bp344-ext-top-${s < 0 ? 'L' : 'R'}`,
        type: 'cylinder',
        position: [xPos, topY + 0.9, topZ - extLen / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [gR, gR, extLen, 8],
        color: LAW.BP_344,
        opacity: gO,
        transparent: true,
      })
    }
  }

  // ── 8. Width deficit indicator planes ─────────────────────────────────────
  // When clear width is below the strictest applicable minimum, translucent
  // planes fill the gap on each side showing how much wider the stair must be.
  if (wColor) {
    const reqW = strictestMinWidth(p)
    const deficit = mm(reqW) - sW
    if (deficit > 0) {
      for (const s of [-1, 1] as const) {
        g.push({
          id: `width-gap-${s < 0 ? 'L' : 'R'}`,
          type: 'box',
          position: [s * (sW / 2 + deficit / 4), totalRise / 2, strCZ],
          args: [deficit / 2, totalRise, totalRun + tD],
          color: wColor,
          opacity: 0.15,
          transparent: true,
        })
      }
    }
  }

  return g
}

// ─── Violation Rules ────────────────────────────────────────────────────────
// Organized by law. Each law evaluates independently.
// PD 1096 fires when it is the base regime (non-BP 220 projects).
// BP 220 fires only for qualifying housing projects.
// BP 344 / RA 9514 fire as overlays when their toggles are active.
// Conflict warnings fire when two laws disagree on the same dimension.

const violations: ViolationRule[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PD 1096 — National Building Code (Base Regime)
  // Active when project is NOT a BP 220 housing project
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pd1096-max-riser',
    field: 'riserHeight',
    check: (p) => !isBP220(p) && num(p.riserHeight) > 200,
    message: 'PD 1096: Maximum riser height is 200 mm',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'pd1096-min-tread',
    field: 'treadDepth',
    check: (p) => !isBP220(p) && num(p.treadDepth) < 200,
    message: 'PD 1096: Minimum tread depth is 200 mm',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) + 0.06, 0],
  },
  {
    id: 'pd1096-min-headroom',
    field: 'headroom',
    check: (p) => num(p.headroom) < 2000,
    message: 'Minimum headroom clearance is 2,000 mm',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [0, mid * mm(p.riserHeight) + mm(p.headroom), -(mid * mm(p.treadDepth))]
    },
  },
  {
    id: 'pd1096-max-vertical',
    field: 'numRisers',
    check: (p) => num(p.numRisers) * num(p.riserHeight) > 3600,
    message: 'PD 1096: Max 3,600 mm vertical rise between landings',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [mm(p.stairWidth) / 2 + 0.15, topY / 2, 0]
    },
  },
  {
    id: 'pd1096-min-width-high-occ',
    field: 'stairWidth',
    check: (p) => !isBP220(p) && isHighOcc(p) && num(p.stairWidth) < 1100,
    message: 'PD 1096: Min width 1,100 mm for occupant load > 50',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'pd1096-min-width-commercial',
    field: 'stairWidth',
    check: (p) =>
      !isBP220(p) && !isHighOcc(p) && !isResidential(p) && num(p.stairWidth) < 900,
    message: 'PD 1096: Min width 900 mm for 10–50 occupants',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'pd1096-min-width-residential',
    field: 'stairWidth',
    check: (p) =>
      !isBP220(p) && !isHighOcc(p) && isResidential(p) && num(p.stairWidth) < 750,
    message: 'PD 1096: Min width 750 mm for private stairs (≤10 persons)',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'pd1096-handrail-range',
    field: 'handrailHeight',
    check: (p) =>
      !isBP220(p) &&
      (num(p.handrailHeight) < 800 || num(p.handrailHeight) > 900),
    message: 'PD 1096: Handrails must be 800–900 mm above nosing',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        mm(p.stairWidth) / 2 + 0.15,
        mid * mm(p.riserHeight) + mm(p.handrailHeight),
        -(mid * mm(p.treadDepth)),
      ]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BP 220 — Socialized / Economic Housing (Replaces PD 1096 as Base)
  // Active only when project is BP 220 socialized or economic housing
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'bp220-max-riser',
    field: 'riserHeight',
    check: (p) => isBP220(p) && num(p.riserHeight) > 250,
    message: 'BP 220: Maximum riser height is 250 mm for housing',
    codeCitation: 'BP 220 IRR · DHSUD',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'bp220-min-tread',
    field: 'treadDepth',
    check: (p) => isBP220(p) && num(p.treadDepth) < 200,
    message: 'BP 220: Minimum tread depth is 200 mm',
    codeCitation: 'BP 220 IRR · DHSUD',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) + 0.06, 0],
  },
  {
    id: 'bp220-min-width',
    field: 'stairWidth',
    check: (p) => isBP220(p) && num(p.stairWidth) < 600,
    message: 'BP 220: Min interior stair width is 600 mm',
    codeCitation: 'BP 220 IRR · DHSUD',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BP 344 — Accessibility Law (Overlay — Additive to Base Regime)
  // Active when "Part of Accessible Route?" is toggled ON
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'bp344-min-width',
    field: 'stairWidth',
    check: (p) => isAccessible(p) && num(p.stairWidth) < 1200,
    message: 'BP 344: Min accessible stair width is 1,200 mm',
    codeCitation: 'BP 344 IRR · DPWH',
    severity: 'error',
    position: (p) => [0, -0.12, mm(p.treadDepth) / 2],
  },
  {
    id: 'bp344-handrail-upper',
    field: 'handrailHeight',
    check: (p) => isAccessible(p) && num(p.handrailHeight) !== 900,
    message: 'BP 344: Primary handrail must be at 900 mm (lower rail at 700 mm shown in 3D)',
    codeCitation: 'BP 344 IRR · DPWH',
    severity: 'error',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.18,
        mid * mm(p.riserHeight) + 0.9,
        -(mid * mm(p.treadDepth)),
      ]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RA 9514 — Fire Code (Overlay — Life-Safety Egress)
  // Active when "Required Exit Stair?" is toggled ON
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ra9514-max-riser',
    field: 'riserHeight',
    check: (p) => isExit(p) && num(p.riserHeight) > 180,
    message: 'RA 9514: Max exit stair riser is 180 mm',
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.12, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'ra9514-min-width',
    field: 'stairWidth',
    check: (p) => isExit(p) && num(p.stairWidth) < 900,
    message: 'RA 9514: Min exit stair width is 900 mm',
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => [0, -0.14, mm(p.treadDepth) / 2],
  },
  {
    id: 'ra9514-min-tread',
    field: 'treadDepth',
    check: (p) => isExit(p) && num(p.treadDepth) < 200,
    message: 'RA 9514: Min exit stair tread is 200 mm',
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) + 0.08, mm(p.treadDepth) / 2],
  },
  {
    id: 'ra9514-max-vertical',
    field: 'numRisers',
    check: (p) => isExit(p) && num(p.numRisers) * num(p.riserHeight) > 3000,
    message: 'RA 9514: Max 3,000 mm vertical rise between landings for exit stairs',
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [-(mm(p.stairWidth) / 2) - 0.15, topY / 2, 0]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Cross-Law Conflict Warnings
  // These fire when a stair passes one law but violates another on the same
  // dimension. A conflict is not noncompliance — it reflects different legal
  // regimes that apply to different project types.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'conflict-riser-bp220-vs-pd1096',
    field: 'riserHeight',
    check: (p) =>
      isBP220(p) && num(p.riserHeight) > 200 && num(p.riserHeight) <= 250,
    message:
      'Conflict: Passes BP 220 (≤ 250 mm) but exceeds PD 1096 baseline (≤ 200 mm). Confirm project is registered as housing with DHSUD.',
    codeCitation: 'BP 220 vs PD 1096',
    severity: 'warning',
    position: (p) => [mm(p.stairWidth) / 2 + 0.2, mm(p.riserHeight), 0],
  },
  {
    id: 'conflict-width-bp220-vs-pd1096',
    field: 'stairWidth',
    check: (p) =>
      isBP220(p) && num(p.stairWidth) >= 600 && num(p.stairWidth) < 750,
    message:
      'Conflict: Passes BP 220 (≥ 600 mm) but below PD 1096 baseline (≥ 750 mm). Valid only for qualifying housing projects.',
    codeCitation: 'BP 220 vs PD 1096',
    severity: 'warning',
    position: (p) => [0, -0.16, mm(p.treadDepth) / 2],
  },
  {
    id: 'conflict-riser-exit-vs-pd1096',
    field: 'riserHeight',
    check: (p) =>
      isExit(p) &&
      !isBP220(p) &&
      num(p.riserHeight) > 180 &&
      num(p.riserHeight) <= 200,
    message:
      'Stricter: Passes PD 1096 (≤ 200 mm) but exceeds RA 9514 exit maximum (≤ 180 mm). Redesign or declassify as exit stair.',
    codeCitation: 'RA 9514 vs PD 1096',
    severity: 'warning',
    position: (p) => [
      mm(p.stairWidth) / 2 + 0.2,
      mm(p.riserHeight) / 2 + 0.05,
      0,
    ],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────
// Labeled hotspots in the 3D viewport. BP 344 annotations are conditionally
// visible when the accessible route overlay is active.

const annotations: AnnotationDef[] = [
  {
    id: 'riser-height',
    label: 'Riser Height',
    description: 'Vertical distance between consecutive treads',
    codeCitation: 'PD 1096 / BP 220',
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.12, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'tread-depth',
    label: 'Tread Depth',
    description: 'Horizontal depth of a single tread (exclusive of nosing)',
    codeCitation: 'PD 1096 / BP 220',
    position: (p) => [0, mm(p.riserHeight) + 0.08, 0],
  },
  {
    id: 'clear-width',
    label: 'Clear Width',
    description: 'Clear width of the stair',
    codeCitation: 'PD 1096 / BP 344',
    position: (p) => [0, -0.08, mm(p.treadDepth) / 2 + 0.05],
  },
  {
    id: 'headroom-label',
    label: 'Headroom',
    description: 'Vertical clearance above the nosing line',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      const y = mid * mm(p.riserHeight) + mm(p.headroom) / 2
      return [mm(p.stairWidth) / 2 + 0.15, y, -(mid * mm(p.treadDepth))]
    },
  },
  {
    id: 'handrail-height',
    label: 'Handrail',
    description: 'Height of primary handrail above stair nosing',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        mm(p.stairWidth) / 2 + 0.15,
        mid * mm(p.riserHeight) + mm(p.handrailHeight),
        -(mid * mm(p.treadDepth)),
      ]
    },
  },

  // BP 344 annotations — visible only when accessible route is active
  {
    id: 'bp344-upper-rail',
    label: 'BP 344 Upper (900 mm)',
    description: 'Required accessible handrail at 900 mm above nosing',
    codeCitation: 'BP 344 IRR · DPWH',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.2,
        mid * mm(p.riserHeight) + 0.9,
        -(mid * mm(p.treadDepth)),
      ]
    },
    visibleWhen: (p) => isAccessible(p),
  },
  {
    id: 'bp344-lower-rail',
    label: 'BP 344 Lower (700 mm)',
    description: 'Required accessible handrail at 700 mm above nosing',
    codeCitation: 'BP 344 IRR · DPWH',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.2,
        mid * mm(p.riserHeight) + 0.7,
        -(mid * mm(p.treadDepth)),
      ]
    },
    visibleWhen: (p) => isAccessible(p),
  },
  {
    id: 'bp344-extension',
    label: 'Extension (300 mm)',
    description: 'Handrails must extend 300 mm beyond first and last step',
    codeCitation: 'BP 344 IRR · DPWH',
    position: (p) => [
      mm(p.stairWidth) / 2 + 0.18,
      0.9,
      mm(p.treadDepth) / 2 + 0.15,
    ],
    visibleWhen: (p) => isAccessible(p),
  },
]

// ─── Scenario Presets ───────────────────────────────────────────────────────
// Each preset encodes a complete project classification + geometry state.
// They are designed to demonstrate different compliance scenarios.

const presets: Preset[] = [
  {
    label: 'Standard House',
    values: {
      projectType: 'general_residential',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 900,
      riserHeight: 185,
      treadDepth: 250,
      headroom: 2100,
      handrailHeight: 860,
      numRisers: 12,
    },
  },
  {
    label: 'BP 220 Housing',
    values: {
      projectType: 'bp220_socialized',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 620,
      riserHeight: 240,
      treadDepth: 210,
      headroom: 2100,
      handrailHeight: 850,
      numRisers: 14,
    },
  },
  {
    label: 'Public Hall',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: false,
      isHighOccupancy: true,
      stairWidth: 1250,
      riserHeight: 175,
      treadDepth: 280,
      headroom: 2200,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: 'Exit Stair',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: false,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 950,
      riserHeight: 190,
      treadDepth: 260,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 14,
    },
  },
]

// ─── Export ──────────────────────────────────────────────────────────────────

export const stairwayConfigurator: ParametricSceneConfig = {
  id: 'stairway-configurator',
  title: 'Stairway Configurator',
  description:
    'Multi-law 3D stair compliance explorer — PD 1096, BP 220, BP 344, and RA 9514 evaluated in parallel with conflict detection.',
  subject: 'Building Technology',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [3, 3, 3],
    fov: 45,
  },
  contextScenario:
    "You're designing stairs for a mixed-use development in Quezon City. The project must satisfy multiple overlapping codes. Explore how PD 1096, BP 220, BP 344, and RA 9514 affect the same stair geometry.",
  leaQuestionCount: 12,
  leaQuestionType: 'code compliance',
  supportedPhases: ['guided', 'faded', 'sandbox', 'challenge'],
  hasChallengeMode: true,
}

