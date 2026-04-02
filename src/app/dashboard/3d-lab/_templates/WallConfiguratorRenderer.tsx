'use client'

// src/app/dashboard/3d-lab/_templates/WallConfiguratorRenderer.tsx
// R3F renderer for the Wall Configurator. Reads from useWallLabStore and builds
// geometry instructions dynamically — independent of the old parameter system.

import { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { InstructionMesh } from '../_components/GeometryMesh'
import { useWallLabStore } from '../_stores/useWallLabStore'
import type { ParametricSceneConfig, GeometryInstruction } from '../_types/templates'
import type { CoreType, Layer, LasonConfig, FinishType, TileConfig, SideCount } from '@/features/wall-configurator/types/wall.types'

// ─── Core type visual configuration ────────────────────────────────────────

interface CoreConfig {
  thickness: number
  color: string
  label: string
  hasMortarPattern: boolean
  mortarSpacingH: number
  mortarSpacingV: number
  mortarColor: string
  supportsPlaster: boolean
}

const CORE_CONFIGS: Record<CoreType, CoreConfig> = {
  'chb': {
    thickness: 0.150,
    color: '#a8a29e',
    label: 'CHB Core',
    hasMortarPattern: true,
    mortarSpacingH: 0.200,
    mortarSpacingV: 0.400,
    mortarColor: '#8d8680',
    supportsPlaster: true,
  },
  'drywall': {
    thickness: 0.100,
    color: '#f5f5f4',
    label: 'Drywall (Studs + Board)',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
  },
  'plywood': {
    thickness: 0.075,
    color: '#c2956b',
    label: 'Plywood Panel',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
  },
  'cement-board': {
    thickness: 0.100,
    color: '#d6d3d1',
    label: 'Cement Board (HardieFlex)',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
  },
  'brick': {
    thickness: 0.200,
    color: '#b45309',
    label: 'Brick Masonry',
    hasMortarPattern: true,
    mortarSpacingH: 0.100,
    mortarSpacingV: 0.200,
    mortarColor: '#92400e',
    supportsPlaster: true,
  },
  'solid-concrete': {
    thickness: 0.150,
    color: '#78716c',
    label: 'Solid Concrete',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: true,
  },
  'existing-wall': {
    thickness: 0.150,
    color: '#e7e5e4',
    label: 'Existing Wall',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: true,
  },
}

// ─── State shape for geometry builder ───────────────────────────────────────

interface WallGeomState {
  coreType: CoreType
  coreThicknessMM: number
  lengthM: number
  heightM: number
  sides: SideCount
  layers: Layer[]
  lason: LasonConfig
  finishType: FinishType
  tileConfig: TileConfig
  selectedColorHex: string
}

// ─── Geometry builder ────────────────────────────────────────────────────────

function buildWallGeometry(state: WallGeomState): GeometryInstruction[] {
  const core = CORE_CONFIGS[state.coreType] ?? CORE_CONFIGS['chb']
  const L = state.lengthM
  const H = state.heightM
  const T = state.coreThicknessMM / 1000 // use user-selected thickness

  const bothSides = state.sides === 2

  const showPlaster = state.layers.some((l) => l.code === 'PLASTER' && l.enabled) && core.supportsPlaster
  const showSkim = state.layers.some((l) => l.code === 'SKIM_COAT' && l.enabled)
  const showPrimer = state.layers.some((l) => l.code === 'PRIMER' && l.enabled)
  const showPaint = state.layers.some((l) => l.code === 'TOPCOAT' && l.enabled)
  const showLason = state.lason.enabled && core.supportsPlaster

  // Layer thicknesses (meters)
  const plasterT = 0.0127
  const lasonT   = 0.001
  const skimT    = 0.003
  const primerT  = 0.001
  const paintT   = 0.001

  const inst: GeometryInstruction[] = []

  // ── Wall core ────────────────────────────────────────────────────────
  inst.push({
    id: 'wall-core',
    type: 'box',
    position: [0, H / 2, 0],
    args: [L, H, T],
    color: core.color,
  })

  const fz = T / 2 + 0.002 // front face Z for pattern overlays

  // ── Material-specific front-face patterns ────────────────────────────

  if (state.coreType === 'chb') {
    // CHB: visible block coursing with thick mortar joints
    const blockH = 0.200
    const blockW = 0.400
    const jointT = 0.010 // 10mm mortar joint
    const mortarC = '#7a7570'

    // Horizontal bed joints
    const hCount = Math.min(Math.floor(H / blockH), 30)
    for (let i = 1; i < hCount; i++) {
      inst.push({
        id: `chb-bed-${i}`,
        type: 'box',
        position: [0, blockH * i, fz],
        args: [L, jointT, 0.004],
        color: mortarC,
      })
    }

    // Vertical head joints — running bond (even rows at blockW, odd offset by half)
    const cols = Math.ceil(L / blockW) + 1
    for (let row = 0; row < hCount; row++) {
      const isOdd = row % 2 === 1
      const offset = isOdd ? blockW / 2 : 0
      for (let col = 0; col <= cols; col++) {
        const x = -L / 2 + offset + col * blockW
        if (x > -L / 2 + 0.01 && x < L / 2 - 0.01) {
          const yBot = blockH * row
          const yTop = Math.min(blockH * (row + 1), H)
          const segH = yTop - yBot
          if (segH > 0.01) {
            inst.push({
              id: `chb-head-${row}-${col}`,
              type: 'box',
              position: [x, yBot + segH / 2, fz],
              args: [jointT, segH, 0.004],
              color: mortarC,
            })
          }
        }
      }
    }
  }

  if (state.coreType === 'brick') {
    // Brick: smaller units, tighter coursing
    const brickH = 0.065 // brick height
    const brickW = 0.200 // brick length
    const jointT = 0.010
    const mortarC = '#c9a58a'

    const hCount = Math.min(Math.floor(H / (brickH + jointT)), 50)
    for (let i = 1; i < hCount; i++) {
      inst.push({
        id: `brick-bed-${i}`,
        type: 'box',
        position: [0, (brickH + jointT) * i, fz],
        args: [L, jointT, 0.004],
        color: mortarC,
      })
    }

    const cols = Math.ceil(L / brickW) + 1
    for (let row = 0; row < Math.min(hCount, 50); row++) {
      const isOdd = row % 2 === 1
      const offset = isOdd ? brickW / 2 : 0
      for (let col = 0; col <= cols; col++) {
        const x = -L / 2 + offset + col * brickW
        if (x > -L / 2 + 0.01 && x < L / 2 - 0.01) {
          const yBot = (brickH + jointT) * row
          const yTop = Math.min((brickH + jointT) * (row + 1), H)
          const segH = yTop - yBot
          if (segH > 0.005) {
            inst.push({
              id: `brick-head-${row}-${col}`,
              type: 'box',
              position: [x, yBot + segH / 2, fz],
              args: [jointT, segH, 0.004],
              color: mortarC,
            })
          }
        }
      }
    }
  }

  if (state.coreType === 'drywall' || state.coreType === 'cement-board') {
    // Board seam lines at 1.22m (4ft) intervals
    const boardW = 1.2192
    const seamColor = state.coreType === 'drywall' ? '#e0ddd8' : '#c4c0bc'
    const cols = Math.floor(L / boardW)
    for (let i = 1; i <= cols; i++) {
      const x = -L / 2 + boardW * i
      if (x < L / 2 - 0.05) {
        inst.push({
          id: `board-seam-${i}`,
          type: 'box',
          position: [x, H / 2, fz],
          args: [0.003, H, 0.003],
          color: seamColor,
          opacity: 0.6,
          transparent: true,
        })
      }
    }
  }

  if (state.coreType === 'plywood') {
    // Horizontal wood grain lines + vertical board seams
    const grainColor = '#b08050'
    const grainCount = Math.min(Math.floor(H / 0.04), 80)
    for (let i = 0; i < grainCount; i++) {
      // Irregular spacing for natural look
      const y = 0.02 + i * 0.04 + (i % 3) * 0.008
      if (y < H) {
        inst.push({
          id: `ply-grain-${i}`,
          type: 'box',
          position: [0, y, fz],
          args: [L, 0.002, 0.002],
          color: grainColor,
          opacity: 0.25 + (i % 4) * 0.08,
          transparent: true,
        })
      }
    }
    // Board seams at 1.22m
    const cols = Math.floor(L / 1.2192)
    for (let i = 1; i <= cols; i++) {
      const x = -L / 2 + 1.2192 * i
      if (x < L / 2 - 0.05) {
        inst.push({
          id: `ply-seam-${i}`,
          type: 'box',
          position: [x, H / 2, fz],
          args: [0.004, H, 0.003],
          color: '#8b6840',
          opacity: 0.5,
          transparent: true,
        })
      }
    }
  }

  if (state.coreType === 'solid-concrete') {
    // Form board marks — horizontal lines at ~600mm
    const formColor = '#6b6560'
    const formCount = Math.floor(H / 0.6)
    for (let i = 1; i <= formCount; i++) {
      inst.push({
        id: `form-mark-${i}`,
        type: 'box',
        position: [0, 0.6 * i, fz],
        args: [L, 0.005, 0.003],
        color: formColor,
        opacity: 0.35,
        transparent: true,
      })
    }
  }

    // ── Layer buildup ─────────────────────────────────────────────────────
    let frontOffset = T / 2
    let backOffset  = T / 2

    const layerSide = bothSides ? 'both' : 'front'

    function addLayer(
      side: 'front' | 'back' | 'both',
      idSuffix: string,
      thickness: number,
      color: string,
      opacity: number,
      label?: string,
    ): void {
      const half = thickness / 2

      if (side === 'front' || side === 'both') {
        frontOffset += half
        inst.push({
          id: `layer-front-${idSuffix}`,
          type: 'box',
          position: [0,H / 2, frontOffset],
          args: [L + 0.002, H + 0.002, thickness],
          color,
          opacity,
          transparent: true,
          label,
        })
        frontOffset += half
      }

      if (side === 'back' || side === 'both') {
        backOffset += half
        inst.push({
          id: `layer-back-${idSuffix}`,
          type: 'box',
          position: [0,H / 2, -backOffset],
          args: [L + 0.002, H + 0.002, thickness],
          color,
          opacity,
          transparent: true,
        })
        backOffset += half
      }
    }

    // Plaster
    if (showPlaster) {
      addLayer(layerSide, 'plaster', plasterT, '#d4d0ca', 0.85, 'Plaster')
    }

    // Lason (concrete neutralizer wash — thin green-tinted layer)
    if (showLason && showPlaster) {
      addLayer(layerSide, 'lason', lasonT, '#a7f3d0', 0.55, 'Lason')
    }

    // Skim coat
    if (showSkim) {
      addLayer(layerSide, 'skim', skimT, '#f5f5f0', 0.9, 'Skim Coat')
    }

    // Primer
    if (showPrimer) {
      addLayer(layerSide, 'primer', primerT, '#e8e8e8', 0.8, 'Primer')
    }

    // Paint / topcoat
    if (showPaint && state.finishType === 'paint') {
      addLayer(layerSide, 'paint', paintT, state.selectedColorHex, 0.9, 'Paint')
    }

    // ── Tile finish grid pattern ──────────────────────────────────────────
    if (state.finishType === 'tiles') {
      const tileW = state.tileConfig.widthMM / 1000
      const tileH = state.tileConfig.heightMM / 1000
      const grout = state.tileConfig.groutGapMM / 1000
      const tileZ = frontOffset + 0.008   // tile adhesive ~8mm
      const tileThickness = 0.009         // 9mm tile thickness

      // Tile base surface
      inst.push({
        id: `tile-surface`,
        type: 'box',
        position: [0,H / 2, tileZ + tileThickness / 2],
        args: [L, H, tileThickness],
        color: '#e5e7eb',
        opacity: 0.95,
        transparent: true,
        label: `Tiles — ${state.tileConfig.sizeLabel}`,
      })

      // Horizontal grout lines
      const hCount = Math.min(Math.floor(H / tileH), 20)
      for (let i = 1; i < hCount; i++) {
        const yPos = tileH * i
        inst.push({
          id: `tile-grout-h-${i}`,
          type: 'box',
          position: [0,yPos, tileZ + tileThickness + 0.0005],
          args: [L, grout, 0.001],
          color: '#9ca3af',
          opacity: 0.8,
          transparent: true,
        })
      }

      // Vertical grout lines
      const vCount = Math.min(Math.floor(L / tileW), 40)
      for (let i = 1; i < vCount; i++) {
        const xPos = -L / 2 + tileW * i
        inst.push({
          id: `tile-grout-v-${i}`,
          type: 'box',
          position: [xPos, H / 2, tileZ + tileThickness + 0.0005],
          args: [grout, H, 0.001],
          color: '#9ca3af',
          opacity: 0.8,
          transparent: true,
        })
      }

      frontOffset = tileZ + tileThickness
    }

  return inst
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  config: ParametricSceneConfig
}

export function WallConfiguratorRenderer({ config }: Props) {
  const invalidate      = useThree((s) => s.invalidate)
  const setInvalidateFn = useWallLabStore((s) => s.setInvalidateFn)

  // Register the R3F invalidate bridge into the wall lab store
  useEffect(() => {
    setInvalidateFn(invalidate)
    invalidate() // Trigger initial frame — frameloop="demand" won't render without this
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])

  // Subscribe to every store field that drives geometry
  const coreType         = useWallLabStore((s) => s.coreType)
  const coreThicknessMM  = useWallLabStore((s) => s.coreThicknessMM)
  const lengthM          = useWallLabStore((s) => s.lengthM)
  const heightM          = useWallLabStore((s) => s.heightM)
  const sides            = useWallLabStore((s) => s.sides)
  const layers          = useWallLabStore((s) => s.layers)
  const lason           = useWallLabStore((s) => s.lason)
  const finishType      = useWallLabStore((s) => s.finishType)
  const tileConfig      = useWallLabStore((s) => s.tileConfig)
  const selectedColorHex = useWallLabStore((s) => s.selectedColorHex)

  const geometryInstructions = useMemo(
    () =>
      buildWallGeometry({
        coreType,
        coreThicknessMM,
        lengthM,
        heightM,
        sides,
        layers,
        lason,
        finishType,
        tileConfig,
        selectedColorHex,
      }),
    [coreType, coreThicknessMM, lengthM, heightM, sides, layers, lason, finishType, tileConfig, selectedColorHex],
  )

  return (
    <group>
      {geometryInstructions.map((inst) => (
        <InstructionMesh key={inst.id} inst={inst} />
      ))}
    </group>
  )
}
