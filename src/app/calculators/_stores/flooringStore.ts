// src/app/calculators/_stores/flooringStore.ts
import { create } from 'zustand'
import { createBaseSlice, type BaseCalculatorStore } from './types'
import {
  computeFlooringEstimate,
  PATTERN_WASTE_DEFAULTS,
  type FlooringInputs,
  type FlooringEstimate,
} from '../_lib/flooring-engine'

// ─── Store Interface ──────────────────────────────────────────────────────────

interface FlooringState extends BaseCalculatorStore, FlooringInputs {
  computed: FlooringEstimate
  setInput: <K extends keyof FlooringInputs>(key: K, value: FlooringInputs[K]) => void
  addExclusion: (exclusion: FlooringInputs['exclusions'][number]) => void
  removeExclusion: (id: string) => void
  recompute: () => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: FlooringInputs = {
  roomMode: 'rectangle',
  roomLengthMm: 4000,
  roomWidthMm: 3000,
  floorPolygonPoints: [],
  exclusions: [],
  tileLengthMm: 600,
  tileWidthMm: 600,
  groutJointMm: 3,
  pattern: 'straight',
  wastePercent: PATTERN_WASTE_DEFAULTS.straight,
  boxCoverageSqm: 4.0,
  orientationDeg: 0,
  includeSparePercent: 0,
}

const _EMPTY_COMPUTED: FlooringEstimate = {
  grossAreaSqm: 0,
  exclusionAreaSqm: 0,
  netAreaSqm: 0,
  effectiveModuleAreaSqm: 0,
  rawTileCount: 0,
  adjustedTileCount: 0,
  roundedTileCount: 0,
  wastePercentApplied: 0,
  sparePercentApplied: 0,
  boxCoverageSqm: null,
  boxesToBuy: null,
  cutTileCountApprox: 0,
  tileGrid: [],
  assumptions: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFlooringStore = create<FlooringState>()((set, get) => ({
  // Base calculator slice (inputVersion, viewMode, resultMode, hoveredSurface)
  ...createBaseSlice(set as (partial: Partial<BaseCalculatorStore>) => void),

  // Flooring-specific inputs
  ...DEFAULT_INPUTS,

  // Computed results — pre-compute from default inputs so scene renders on load
  computed: computeFlooringEstimate(DEFAULT_INPUTS),

  setInput: (key, value) => {
    set((s) => {
      const updates: Partial<FlooringState> = {
        [key]: value,
        inputVersion: s.inputVersion + 1,
      }
      // Auto-set waste when pattern changes
      if (key === 'pattern' && typeof value === 'string') {
        updates.wastePercent =
          PATTERN_WASTE_DEFAULTS[value as keyof typeof PATTERN_WASTE_DEFAULTS] ?? s.wastePercent
      }
      return updates
    })
    get().recompute()
  },

  addExclusion: (exclusion) => {
    set((s) => ({
      exclusions: [...s.exclusions, exclusion],
      inputVersion: s.inputVersion + 1,
    }))
    get().recompute()
  },

  removeExclusion: (id) => {
    set((s) => ({
      exclusions: s.exclusions.filter((e) => e.id !== id),
      inputVersion: s.inputVersion + 1,
    }))
    get().recompute()
  },

  recompute: () => {
    const s = get()
    const inputs: FlooringInputs = {
      roomMode: s.roomMode,
      roomLengthMm: s.roomLengthMm,
      roomWidthMm: s.roomWidthMm,
      floorPolygonPoints: s.floorPolygonPoints,
      exclusions: s.exclusions,
      tileLengthMm: s.tileLengthMm,
      tileWidthMm: s.tileWidthMm,
      groutJointMm: s.groutJointMm,
      pattern: s.pattern,
      wastePercent: s.wastePercent,
      boxCoverageSqm: s.boxCoverageSqm,
      orientationDeg: s.orientationDeg,
      includeSparePercent: s.includeSparePercent,
    }
    set({ computed: computeFlooringEstimate(inputs) })
  },
}))
