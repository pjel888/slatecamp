// src/app/calculators/_stores/paintStore.ts
import { create } from 'zustand'
import { createBaseSlice, type BaseCalculatorStore } from './types'
import {
  computePaintEstimate,
  type PaintInputs,
  type PaintEstimate,
} from '../_lib/paint-engine'

// ─── Store Interface ──────────────────────────────────────────────────────────

interface PaintState extends BaseCalculatorStore, PaintInputs {
  computed: PaintEstimate
  setInput: <K extends keyof PaintInputs>(key: K, value: PaintInputs[K]) => void
  addOpening: (opening: PaintInputs['openings'][number]) => void
  removeOpening: (id: string) => void
  recompute: () => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: PaintInputs = {
  inputMode: 'room',
  roomLengthMm: 0,
  roomWidthMm: 0,
  wallHeightMm: 2700,
  wallSegments: [],
  openings: [],
  includeCeiling: false,
  ceilingAreaOverrideSqm: null,
  substrateType: 'new-concrete',
  coatsTopcoat: 2,
  coatsPrimer: 1,
  topcoatCoverageSqmPerLiter: 12,
  primerCoverageSqmPerLiter: 10,
  wastePercent: 5,
  canSizesAvailable: [1, 4, 16],
  selectedColorHex: '#FFFFFF',
}

const EMPTY_COMPUTED: PaintEstimate = {
  grossWallAreaSqm: 0,
  openingAreaSqm: 0,
  netWallAreaSqm: 0,
  ceilingAreaSqm: 0,
  basePaintableAreaSqm: 0,
  topcoatCoats: 2,
  primerCoats: 1,
  adjustedTopcoatAreaSqm: 0,
  topcoatLiters: 0,
  primerLiters: null,
  topcoatCanSuggestion: [],
  primerCanSuggestion: null,
  wastePercentApplied: 0,
  wallAreas: [],
  assumptions: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePaintStore = create<PaintState>()((set, get) => ({
  // Base calculator slice (inputVersion, viewMode, resultMode, hoveredSurface)
  ...createBaseSlice(set as (partial: Partial<BaseCalculatorStore>) => void),

  // Paint-specific inputs
  ...DEFAULT_INPUTS,

  // Computed results
  computed: EMPTY_COMPUTED,

  setInput: (key, value) => {
    set((s) => ({ [key]: value, inputVersion: s.inputVersion + 1 }))
    get().recompute()
  },

  addOpening: (opening) => {
    set((s) => ({
      openings: [...s.openings, opening],
      inputVersion: s.inputVersion + 1,
    }))
    get().recompute()
  },

  removeOpening: (id) => {
    set((s) => ({
      openings: s.openings.filter((o) => o.id !== id),
      inputVersion: s.inputVersion + 1,
    }))
    get().recompute()
  },

  recompute: () => {
    const s = get()
    const inputs: PaintInputs = {
      inputMode: s.inputMode,
      roomLengthMm: s.roomLengthMm,
      roomWidthMm: s.roomWidthMm,
      wallHeightMm: s.wallHeightMm,
      wallSegments: s.wallSegments,
      openings: s.openings,
      includeCeiling: s.includeCeiling,
      ceilingAreaOverrideSqm: s.ceilingAreaOverrideSqm,
      substrateType: s.substrateType,
      coatsTopcoat: s.coatsTopcoat,
      coatsPrimer: s.coatsPrimer,
      topcoatCoverageSqmPerLiter: s.topcoatCoverageSqmPerLiter,
      primerCoverageSqmPerLiter: s.primerCoverageSqmPerLiter,
      wastePercent: s.wastePercent,
      canSizesAvailable: s.canSizesAvailable,
      selectedColorHex: s.selectedColorHex,
    }
    set({ computed: computePaintEstimate(inputs) })
  },
}))
