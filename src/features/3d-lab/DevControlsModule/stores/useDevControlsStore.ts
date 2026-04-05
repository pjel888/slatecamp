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
const DEFAULT_FLAR_OVERRIDE: number | undefined = undefined // use zone midpoint by default

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

// ─── Violation Presets (Educational — deliberate code violations) ────────────

export const VIOLATION_PRESETS: DevControlsPreset[] = [
  {
    label: 'Lot Encroachment',
    description: 'Building extends beyond lot boundary — property line violation',
    lot: { width: 15, depth: 12 },
    zoning: { zoneClass: 'R-1', firewallActive: false, firewallSides: [] },
    // Footprint 14×11 + front setback 4.5m = extends past 12m depth
    building: { proposedFootprintWidth: 14, proposedFootprintDepth: 11, proposedStoreys: 2, floorHeight: 3.0 },
    rrow: { width: 10 },
  },
  {
    label: 'BHL Violation',
    description: 'FLAR allows the GFA but building exceeds BHL — height cap breach',
    lot: { width: 30, depth: 30 },
    zoning: { zoneClass: 'R-2-basic', firewallActive: false, firewallSides: [] },
    // R-2 Basic BHL = 3 storeys, but proposing 6 storeys with small footprint
    building: { proposedFootprintWidth: 10, proposedFootprintDepth: 10, proposedStoreys: 6, floorHeight: 3.0 },
    rrow: { width: 10 },
  },
  {
    label: 'Setback Breach',
    description: 'Footprint fills entire buildable area and overflows into setbacks',
    lot: { width: 10, depth: 12 },
    zoning: { zoneClass: 'R-1', firewallActive: false, firewallSides: [] },
    // R-1 setbacks: F=4.5, S=2.0, R=2.0 → buildable = 6×5.5 = 33sqm, proposing 8×10
    building: { proposedFootprintWidth: 8, proposedFootprintDepth: 10, proposedStoreys: 2, floorHeight: 3.0 },
    rrow: { width: 10 },
  },
  {
    label: 'TGFA Overbuilt',
    description: 'Total floor area exceeds FLAR limit — too many floors for the lot',
    lot: { width: 20, depth: 15 },
    zoning: { zoneClass: 'R-1', firewallActive: false, firewallSides: [] },
    // R-1 TGFA ≈ 675sqm, proposing 12×8×8floors = 768sqm
    building: { proposedFootprintWidth: 12, proposedFootprintDepth: 8, proposedStoreys: 8, floorHeight: 3.0 },
    rrow: { width: 10 },
  },
]

// ─── Store Interface ────────────────────────────────────────────────────────

interface DevControlsStore {
  // ─ Raw Inputs
  lot: LotParams
  zoning: ZoningParams
  building: BuildingParams
  rrow: RROWParams
  flarOverride: number | undefined
  bhlOverride: number | undefined  // custom BHL storeys (local ordinance)

  // ─ Computed Output (recomputed atomically on every input mutation)
  result: DevControlsResult

  // ─ Mode
  labMode: LabMode

  // ─ ISA/USA spatial placement (user-draggable + resizable)
  isaPlacement: { x: number; z: number; w: number; d: number }
  usaPlacement: { x: number; z: number; w: number; d: number }

  // ─ 3D Scene UI State
  cameraPreset: CameraPreset
  visibleLayers: Set<LayerKey>
  activeHotspot: string | null
  highlightedMetric: string | null
  showDimensions: boolean
  xrayMode: boolean         // transparent building for see-through to setback volumes
  isDraggingZone: boolean  // locks camera when dragging ISA/USA
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
  setFlarOverride: (flar: number | undefined) => void
  setBhlOverride: (storeys: number | undefined) => void
  applyPreset: (preset: DevControlsPreset) => void
  reset: () => void

  setLabMode: (mode: LabMode) => void
  setCameraPreset: (p: CameraPreset) => void
  toggleLayer: (layer: LayerKey) => void
  setActiveHotspot: (id: string | null) => void
  setHighlightedMetric: (metric: string | null) => void
  setShowDimensions: (v: boolean) => void
  setXrayMode: (v: boolean) => void
  setIsDraggingZone: (v: boolean) => void
  setDpr: (dpr: number) => void
  setInvalidateFn: (fn: (() => void) | null) => void

  setIsaPlacement: (patch: Partial<{ x: number; z: number; w: number; d: number }>) => void
  setUsaPlacement: (patch: Partial<{ x: number; z: number; w: number; d: number }>) => void

  setTourStep: (step: number | null) => void
  nextTourStep: () => void
  prevTourStep: () => void
}

// ─── Initial computation ────────────────────────────────────────────────────

function computeResult(lot: LotParams, zoning: ZoningParams, building: BuildingParams, rrow: RROWParams, flarOverride?: number, bhlOverride?: number): DevControlsResult {
  return computeDevControls({ lot, zoning, building, rrow, flarOverride, bhlOverrideStoreys: bhlOverride })
}

const initialResult = computeResult(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING, DEFAULT_RROW, DEFAULT_FLAR_OVERRIDE)

// Default visible layers — ISA/USA removed (purely computational now), context off
const ALL_LAYERS: LayerKey[] = ['setbacks', 'ambf', 'pso', 'bhl', 'flar', 'floors', 'tosl']

// ─── Store ──────────────────────────────────────────────────────────────────

export const useDevControlsStore = create<DevControlsStore>()((set, get) => ({
  // ─ Inputs
  lot: DEFAULT_LOT,
  zoning: DEFAULT_ZONING,
  building: DEFAULT_BUILDING,
  rrow: DEFAULT_RROW,
  flarOverride: DEFAULT_FLAR_OVERRIDE,
  bhlOverride: undefined,

  // ─ Computed
  result: initialResult,

  // ─ Mode
  labMode: 'sandbox',

  // ─ ISA/USA placement (default: auto-positioned from setbacks)
  isaPlacement: { x: 0, z: 0, w: 5, d: 5 },
  usaPlacement: { x: 0, z: 10, w: 5, d: 5 },

  // ─ UI
  cameraPreset: 'orbit',
  visibleLayers: new Set<LayerKey>(ALL_LAYERS),
  activeHotspot: null,
  highlightedMetric: null,
  showDimensions: false,
  xrayMode: false,
  isDraggingZone: false,
  dpr: 1.5,

  // ─ R3F bridge
  invalidateFn: null,

  // ─ Tour
  tourStep: 0,

  // ─ Actions (every mutation atomically recomputes result + invalidates)

  setLot: (patch) => {
    const s = get()
    const lot = { ...s.lot, ...patch }
    const result = computeResult(lot, s.zoning, s.building, s.rrow, s.flarOverride, s.bhlOverride)
    // Auto-reposition ISA/USA to fit within new lot dimensions
    const isaW = Math.min(Math.sqrt(result.isa) * 1.5, lot.width)
    const isaD = result.isa / Math.max(isaW, 0.1)
    const usaW = Math.min(Math.sqrt(result.usa) * 1.5, lot.width)
    const usaD = result.usa / Math.max(usaW, 0.1)
    set({
      lot, result,
      isaPlacement: { x: 0, z: 0, w: isaW, d: Math.min(isaD, lot.depth) },
      usaPlacement: { x: 0, z: lot.depth - Math.min(usaD, lot.depth), w: usaW, d: Math.min(usaD, lot.depth) },
    })
    s.invalidateFn?.()
  },

  setZoneClass: (zc) => {
    const s = get()
    const zoning = { ...s.zoning, zoneClass: zc }
    // Reset overrides when zone changes
    const result = computeResult(s.lot, zoning, s.building, s.rrow, undefined, undefined)
    set({ zoning, result, flarOverride: undefined, bhlOverride: undefined })
    s.invalidateFn?.()
  },

  setFirewall: (active, sides) => {
    const s = get()
    const zoning = { ...s.zoning, firewallActive: active, firewallSides: sides }
    const result = computeResult(s.lot, zoning, s.building, s.rrow, s.flarOverride, s.bhlOverride)
    set({ zoning, result })
    s.invalidateFn?.()
  },

  setBuilding: (patch) => {
    const s = get()
    const building = { ...s.building, ...patch }
    const result = computeResult(s.lot, s.zoning, building, s.rrow, s.flarOverride, s.bhlOverride)
    set({ building, result })
    s.invalidateFn?.()
  },

  setRrowWidth: (w) => {
    const s = get()
    const rrow = { width: w }
    const result = computeResult(s.lot, s.zoning, s.building, rrow, s.flarOverride, s.bhlOverride)
    set({ rrow, result })
    s.invalidateFn?.()
  },

  setFlarOverride: (flar) => {
    const s = get()
    const result = computeResult(s.lot, s.zoning, s.building, s.rrow, flar, s.bhlOverride)
    set({ flarOverride: flar, result })
    s.invalidateFn?.()
  },

  setBhlOverride: (storeys) => {
    const s = get()
    const result = computeResult(s.lot, s.zoning, s.building, s.rrow, s.flarOverride, storeys)
    set({ bhlOverride: storeys, result })
    s.invalidateFn?.()
  },

  applyPreset: (preset) => {
    const s = get()
    const lot = { ...DEFAULT_LOT, ...preset.lot }
    const zoning = { ...DEFAULT_ZONING, ...preset.zoning }
    const building = { ...DEFAULT_BUILDING, ...preset.building }
    const rrow = { ...DEFAULT_RROW, ...preset.rrow }
    const result = computeResult(lot, zoning, building, rrow, undefined, undefined)
    set({ lot, zoning, building, rrow, flarOverride: undefined, bhlOverride: undefined, result, activeHotspot: null, highlightedMetric: null })
    s.invalidateFn?.()
  },

  reset: () => {
    const s = get()
    const result = computeResult(DEFAULT_LOT, DEFAULT_ZONING, DEFAULT_BUILDING, DEFAULT_RROW, DEFAULT_FLAR_OVERRIDE, undefined)
    set({
      lot: DEFAULT_LOT, zoning: DEFAULT_ZONING, building: DEFAULT_BUILDING, rrow: DEFAULT_RROW,
      flarOverride: DEFAULT_FLAR_OVERRIDE, bhlOverride: undefined, result, activeHotspot: null, highlightedMetric: null, tourStep: 0,
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

  setXrayMode: (v) => {
    set({ xrayMode: v })
    get().invalidateFn?.()
  },

  setIsDraggingZone: (v) => set({ isDraggingZone: v }),

  setDpr: (dpr) => set({ dpr }),

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),

  setIsaPlacement: (patch) => {
    const s = get()
    const lot = s.lot
    const maxArea = s.result.isa
    const next = { ...s.isaPlacement, ...patch }
    // Clamp dimensions so area never exceeds ISA limit
    if (next.w * next.d > maxArea) {
      next.d = maxArea / Math.max(next.w, 0.1)
    }
    // Clamp position to lot boundaries
    next.x = Math.max(0, Math.min(next.x, lot.width - next.w))
    next.z = Math.max(0, Math.min(next.z, lot.depth - next.d))
    next.w = Math.min(next.w, lot.width)
    next.d = Math.min(next.d, lot.depth)
    set({ isaPlacement: next })
    s.invalidateFn?.()
  },

  setUsaPlacement: (patch) => {
    const s = get()
    const lot = s.lot
    const maxArea = s.result.usa
    const next = { ...s.usaPlacement, ...patch }
    // Clamp dimensions so area never exceeds USA limit
    if (next.w * next.d > maxArea) {
      next.d = maxArea / Math.max(next.w, 0.1)
    }
    // Clamp position to lot boundaries
    next.x = Math.max(0, Math.min(next.x, lot.width - next.w))
    next.z = Math.max(0, Math.min(next.z, lot.depth - next.d))
    next.w = Math.min(next.w, lot.width)
    next.d = Math.min(next.d, lot.depth)
    set({ usaPlacement: next })
    s.invalidateFn?.()
  },

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
