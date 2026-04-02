// src/app/calculators/_stores/drywallStore.ts
import { create } from 'zustand'
import { createBaseSlice, type BaseCalculatorStore } from './types'
import {
  computeDrywallEstimate,
  type DrywallInputs,
  type DrywallEstimate,
} from '../_lib/drywall-engine'

// ─── Store Interface ──────────────────────────────────────────────────────────

interface DrywallState extends BaseCalculatorStore, DrywallInputs {
  computed: DrywallEstimate
  drywallViewMode: 'frame' | 'boarded'
  setInput: <K extends keyof DrywallInputs>(key: K, value: DrywallInputs[K]) => void
  addOpening: (opening: DrywallInputs['openings'][number]) => void
  removeOpening: (id: string) => void
  toggleDrywallView: () => void
  recompute: () => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: DrywallInputs = {
  wallLengthMm: 0,
  wallHeightMm: 2700,
  openings: [],
  studSpacingMm: 600,
  boardLengthMm: 2440,
  boardWidthMm: 1220,
  boardLayersPerSide: 1,
  sidesBoarded: 'two-side',
  boardOrientation: 'vertical',
  wastePercent: 10,
  includeCornerStudAllowance: true,
  cornerStudExtraCount: 2,
  includeOpeningFramingAllowance: true,
  extraStudsPerOpening: 3,
  trackStockLengthMm: 3000,
}

const EMPTY_COMPUTED: DrywallEstimate = {
  grossWallAreaSqm: 0,
  openingAreaSqm: 0,
  netWallAreaSqm: 0,
  boardedFaceCount: 2,
  boardLayersPerSide: 1,
  totalBoardedAreaSqm: 0,
  boardAreaSqm: 0,
  rawBoardCount: 0,
  adjustedBoardCount: 0,
  roundedBoardCount: 0,
  baseStudCount: 0,
  cornerAllowanceCount: 0,
  openingExtraStudCount: 0,
  finalStudCount: 0,
  topTrackLengthMm: 0,
  bottomTrackLengthMm: 0,
  totalTrackLengthMm: 0,
  headerTrackLengthMm: 0,
  trackPiecesToBuy: 0,
  studPositionsM: [],
  boardPlacements: [],
  assumptions: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDrywallStore = create<DrywallState>()((set, get) => ({
  // Base calculator slice (inputVersion, viewMode, resultMode, hoveredSurface)
  ...createBaseSlice(set as (partial: Partial<BaseCalculatorStore>) => void),

  // Drywall-specific inputs
  ...DEFAULT_INPUTS,

  // Computed results
  computed: EMPTY_COMPUTED,

  drywallViewMode: 'boarded' as const,

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

  toggleDrywallView: () => {
    set((s) => ({
      drywallViewMode: s.drywallViewMode === 'frame' ? 'boarded' : 'frame',
      inputVersion: s.inputVersion + 1,
    }))
  },

  recompute: () => {
    const s = get()
    const inputs: DrywallInputs = {
      wallLengthMm: s.wallLengthMm,
      wallHeightMm: s.wallHeightMm,
      openings: s.openings,
      studSpacingMm: s.studSpacingMm,
      boardLengthMm: s.boardLengthMm,
      boardWidthMm: s.boardWidthMm,
      boardLayersPerSide: s.boardLayersPerSide,
      sidesBoarded: s.sidesBoarded,
      boardOrientation: s.boardOrientation,
      wastePercent: s.wastePercent,
      includeCornerStudAllowance: s.includeCornerStudAllowance,
      cornerStudExtraCount: s.cornerStudExtraCount,
      includeOpeningFramingAllowance: s.includeOpeningFramingAllowance,
      extraStudsPerOpening: s.extraStudsPerOpening,
      trackStockLengthMm: s.trackStockLengthMm,
    }
    set({ computed: computeDrywallEstimate(inputs) })
  },
}))
