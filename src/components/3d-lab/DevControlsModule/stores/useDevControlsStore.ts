'use client'

import { create } from 'zustand'
import { computeDevControls } from '@/lib/pd1096/computationEngine'
import type {
  ZoneClass,
  LotParams,
  ZoningParams,
  BuildingParams,
  RROWParams,
  DevControlsResult,
  LabMode,
  CameraPreset,
  LayerKey,
  FirewallSide,
} from '@/lib/pd1096/types'

// ─── Default Inputs ─────────────────────────────────────────────────────────

const DEFAULT_LOT: LotParams = { width: 20, depth: 15, type: 'interior' }
const DEFAULT_ZONING: ZoningParams = { zoneClass: 'R-1', firewallActive: false, firewallSides: [] }
const DEFAULT_BUILDING: BuildingParams = {
  proposedFootprintWidth: 12,
  proposedFootprintDepth: 6,
  proposedStoreys: 2,
  floorHeight: 3.0,
}
const DEFAULT_RROW: RROWParams = { width: 10 }

// ─── Presets ────────────────────────────────────────────────────────────────

export interface DevControlsPreset {
  label: string
  description: string
  lot: Partial<LotParams>
  zoning: Partial<ZoningParams>
  building: Partial<BuildingParams>
  rrow: Partial<RROWParams>
}

export const PRESETS: DevControlsPreset[] = [
  {
    label: 'R-1 Subdivision (300 sqm)',
    description: 'Canonical R-1 low-density lot — ALE standard exam case',
    lot: { width: 20, depth: 15 },
    zoning: { zoneClass: 'R-1', firewallActive: false, firewallSides: [] },
    building: { proposedFootprintWidth: 12, proposedFootprintDepth: 6, proposedStoreys: 2, floorHeight: 3.0 },
    rrow: { width: 10 },
  },
  {
    label: 'R-2 Rowhouse',
    description: 'Narrow rowhouse lot with firewall on one side',
    lot: { width: 8, depth: 20 },
    zoning: { zoneClass: 'R-2-basic', firewallActive: true, firewallSides: ['left'] },
    building: { proposedFootprintWidth: 5, proposedFootprintDepth: 14, proposedStoreys: 3, floorHeight: 3.0 },
    rrow: { width: 8 },
  },
  {
    label: 'C-1 Commercial',
    description: 'Low-intensity commercial along a 15m road',
    lot: { width: 30, depth: 40 },
    zoning: { zoneClass: 'Com-1', firewallActive: false, firewallSides: [] },
    building: { proposedFootprintWidth: 18, proposedFootprintDepth: 28, proposedStoreys: 4, floorHeight: 3.5 },
    rrow: { width: 15 },
  },
  {
    label: 'Narrow Lot (Violation)',
    description: 'Intentionally over-built narrow lot — triggers AMBF violation',
    lot: { width: 6, depth: 10 },
    zoning: { zoneClass: 'R-1', firewallActive: false, firewallSides: [] },
    building: { proposedFootprintWidth: 5, proposedFootprintDepth: 8, proposedStoreys: 2, floorHeight: 3.0 },
    rrow: { width: 6 },
  },
  {
    label: 'Max Height Test',
    description: 'R-3 Max with tall building — tests BHL compliance',
    lot: { width: 40, depth: 50 },
    zoning: { zoneClass: 'R-3-max', firewallActive: false, firewallSides: [] },
    building: { proposedFootprintWidth: 20, proposedFootprintDepth: 30, proposedStoreys: 10, floorHeight: 3.0 },
    rrow: { width: 20 },
  },
]

// ─── Store Interface ────────────────────────────────────────────────────────

interface DevControlsStore {
  // ─ Raw Inputs
  lot: LotParams
  zoning: ZoningParams
  building: BuildingParams
  rrow: RROWParams

  // ─ Computed Output (recomputed atomically on every input mutation)
  result: DevControlsResult

  // ─ Mode
  labMode: LabMode

  // ─ 3D Scene UI State
  cameraPreset: CameraPreset
  visibleLayers: Set<LayerKey>
  activeHotspot: string | null
  highlightedMetric: string | null
  showDimensions: boolean
  dpr: number

  // ─ R3F bridge
  invalidateFn: (() => void) | null

  // ─ Tour
  tourStep: number | null // 0–5 or null for dismissed

  // ─ Actions
  setLot: (patch: Partial<LotParams>) => void
  setZoneClass: (zc: ZoneClass) => void
  setFirewall: (active: boolean, sides: FirewallSide[]) => void
  setBuilding: (patch: Partial<BuildingParams>) => void
  setRrowWidth: (w: number) => void
  applyPreset: (preset: DevControlsPreset) => void
  reset: () => void

  setLabMode: (mode: LabMode) => void
  setCameraPreset: (p: CameraPreset) => void
  toggleLayer: (layer: LayerKey) => void
  setActiveHotspot: (id: string | null) => void
  setHighlightedMetric: (metric: string | null) => void
  setShowDimensions: (v: boolean) => void
  setDpr: (dpr: number) => void
  setInvalidateFn: (fn: (() => void) | null) => void

  setTourStep: (step: number | null) => void
  nextTourStep: () => void
  prevTourStep: () => void
}

// ─── Initial computation ────────────────────────────────────────────────────

function computeResult(lot: LotParams, zoning: ZoningParams, building: BuildingParams, rrow: RROWParams): DevControlsResult {
  return computeDevControls({ lot, zoning, building, rrow })
}

const initialResult = computeResult(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING, DEFAULT_RROW)

const ALL_LAYERS: LayerKey[] = ['setbacks', 'ambf', 'pso', 'bhl', 'floors', 'isa', 'usa', 'tosl', 'building', 'rrow']

// ─── Store ──────────────────────────────────────────────────────────────────

export const useDevControlsStore = create<DevControlsStore>()((set, get) => ({
  // ─ Inputs
  lot: DEFAULT_LOT,
  zoning: DEFAULT_ZONING,
  building: DEFAULT_BUILDING,
  rrow: DEFAULT_RROW,

  // ─ Computed
  result: initialResult,

  // ─ Mode
  labMode: 'sandbox',

  // ─ UI
  cameraPreset: 'orbit',
  visibleLayers: new Set<LayerKey>(ALL_LAYERS),
  activeHotspot: null,
  highlightedMetric: null,
  showDimensions: false,
  dpr: 1.5,

  // ─ R3F bridge
  invalidateFn: null,

  // ─ Tour
  tourStep: 0,

  // ─ Actions (every mutation atomically recomputes result + invalidates)

  setLot: (patch) => {
    const s = get()
    const lot = { ...s.lot, ...patch }
    const result = computeResult(lot, s.zoning, s.building, s.rrow)
    set({ lot, result })
    s.invalidateFn?.()
  },

  setZoneClass: (zc) => {
    const s = get()
    const zoning = { ...s.zoning, zoneClass: zc }
    const result = computeResult(s.lot, zoning, s.building, s.rrow)
    set({ zoning, result })
    s.invalidateFn?.()
  },

  setFirewall: (active, sides) => {
    const s = get()
    const zoning = { ...s.zoning, firewallActive: active, firewallSides: sides }
    const result = computeResult(s.lot, zoning, s.building, s.rrow)
    set({ zoning, result })
    s.invalidateFn?.()
  },

  setBuilding: (patch) => {
    const s = get()
    const building = { ...s.building, ...patch }
    const result = computeResult(s.lot, s.zoning, building, s.rrow)
    set({ building, result })
    s.invalidateFn?.()
  },

  setRrowWidth: (w) => {
    const s = get()
    const rrow = { width: w }
    const result = computeResult(s.lot, s.zoning, s.building, rrow)
    set({ rrow, result })
    s.invalidateFn?.()
  },

  applyPreset: (preset) => {
    const s = get()
    const lot = { ...DEFAULT_LOT, ...preset.lot }
    const zoning = { ...DEFAULT_ZONING, ...preset.zoning }
    const building = { ...DEFAULT_BUILDING, ...preset.building }
    const rrow = { ...DEFAULT_RROW, ...preset.rrow }
    const result = computeResult(lot, zoning, building, rrow)
    set({ lot, zoning, building, rrow, result, activeHotspot: null, highlightedMetric: null })
    s.invalidateFn?.()
  },

  reset: () => {
    const s = get()
    const result = computeResult(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING, DEFAULT_RROW)
    set({
      lot: DEFAULT_LOT, zoning: DEFAULT_ZONING, building: DEFAULT_BUILDING, rrow: DEFAULT_RROW,
      result, activeHotspot: null, highlightedMetric: null, tourStep: 0,
    })
    s.invalidateFn?.()
  },

  setLabMode: (mode) => set({ labMode: mode }),

  setCameraPreset: (p) => {
    set({ cameraPreset: p })
    get().invalidateFn?.()
  },

  toggleLayer: (layer) => {
    const s = get()
    const next = new Set(s.visibleLayers)
    if (next.has(layer)) next.delete(layer)
    else next.add(layer)
    set({ visibleLayers: next })
    s.invalidateFn?.()
  },

  setActiveHotspot: (id) => {
    set({ activeHotspot: id })
    get().invalidateFn?.()
  },

  setHighlightedMetric: (metric) => {
    set({ highlightedMetric: metric })
    get().invalidateFn?.()
  },

  setShowDimensions: (v) => {
    set({ showDimensions: v })
    get().invalidateFn?.()
  },

  setDpr: (dpr) => set({ dpr }),

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),

  setTourStep: (step) => {
    set({ tourStep: step })
    get().invalidateFn?.()
  },

  nextTourStep: () => {
    const s = get()
    if (s.tourStep === null) return
    set({ tourStep: Math.min(s.tourStep + 1, 5) })
    s.invalidateFn?.()
  },

  prevTourStep: () => {
    const s = get()
    if (s.tourStep === null) return
    set({ tourStep: Math.max(s.tourStep - 1, 0) })
    s.invalidateFn?.()
  },
}))
