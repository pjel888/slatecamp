// src/app/calculators/_stores/chbStore.ts
import { create } from 'zustand'
import { createBaseSlice, type BaseCalculatorStore } from './types'
import { computeCHBEstimate, type CHBInputs, type CHBEstimate } from '../_lib/chb-engine'

// ─── Store Interface ──────────────────────────────────────────────────────────

interface CHBState extends BaseCalculatorStore, CHBInputs {
  computed: CHBEstimate
  setInput: <K extends keyof CHBInputs>(key: K, value: CHBInputs[K]) => void
  addOpening: (opening: CHBInputs['openings'][number]) => void
  removeOpening: (id: string) => void
  recompute: () => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: CHBInputs = {
  wallLengthMm: 0,
  wallHeightMm: 2700,
  openings: [],
  blockLengthMm: 400,
  blockHeightMm: 200,
  blockThicknessMm: 150,
  chbSize: '6-inch',
  mortarJointMm: 10,
  wastePercent: 5,
  includeVerticalRebar: true,
  verticalRebarSpacingMm: 800,
  verticalRebarDiaMm: 10,
  includeHorizontalRebar: true,
  horizontalRebarCourseInterval: 3,
  horizontalRebarDiaMm: 10,
  mortarMixRatio: 4,
}

const EMPTY_COMPUTED: CHBEstimate = {
  grossWallAreaSqm: 0,
  openingAreaSqm: 0,
  netWallAreaSqm: 0,
  blockModuleAreaSqm: 0,
  rawBlockCount: 0,
  adjustedBlockCount: 0,
  roundedBlockCount: 0,
  courseCount: 0,
  blocksPerCourse: 0,
  totalMortarVolumeCuM: 0,
  horizontalJointVolumeCuM: 0,
  verticalJointVolumeCuM: 0,
  cementBags40kg: 0,
  sandVolumeCuM: 0,
  verticalRebarCount: 0,
  verticalRebarLengthM: 0,
  horizontalRebarCount: 0,
  horizontalRebarLengthM: 0,
  totalRebarLengthM: 0,
  blockGrid: [],
  verticalRebarPositionsM: [],
  horizontalRebarPositionsM: [],
  wastePercentApplied: 0,
  assumptions: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCHBStore = create<CHBState>()((set, get) => ({
  // Base calculator slice (inputVersion, viewMode, resultMode, hoveredSurface)
  ...createBaseSlice(set as (partial: Partial<BaseCalculatorStore>) => void),

  // CHB-specific inputs
  ...DEFAULT_INPUTS,

  // Computed results
  computed: EMPTY_COMPUTED,

  setInput: (key, value) => {
    set((s) => {
      const updates: Partial<CHBState> = {
        [key]: value,
        inputVersion: s.inputVersion + 1,
      }
      // When chbSize changes, update blockThicknessMm
      if (key === 'chbSize') {
        const presets: Record<string, number> = { '4-inch': 100, '6-inch': 150, '8-inch': 200 }
        updates.blockThicknessMm = presets[value as string] ?? s.blockThicknessMm
      }
      return updates
    })
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
    const inputs: CHBInputs = {
      wallLengthMm: s.wallLengthMm,
      wallHeightMm: s.wallHeightMm,
      openings: s.openings,
      blockLengthMm: s.blockLengthMm,
      blockHeightMm: s.blockHeightMm,
      blockThicknessMm: s.blockThicknessMm,
      chbSize: s.chbSize,
      mortarJointMm: s.mortarJointMm,
      wastePercent: s.wastePercent,
      includeVerticalRebar: s.includeVerticalRebar,
      verticalRebarSpacingMm: s.verticalRebarSpacingMm,
      verticalRebarDiaMm: s.verticalRebarDiaMm,
      includeHorizontalRebar: s.includeHorizontalRebar,
      horizontalRebarCourseInterval: s.horizontalRebarCourseInterval,
      horizontalRebarDiaMm: s.horizontalRebarDiaMm,
      mortarMixRatio: s.mortarMixRatio,
    }
    set({ computed: computeCHBEstimate(inputs) })
  },
}))
