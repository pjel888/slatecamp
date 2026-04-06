'use client'

import { create } from 'zustand'
import type {
  CoreType,
  SideCount,
  Layer,
  AreaState,
  FinishType,
  TileConfig,
  LasonConfig,
} from '@/features/wall-configurator/types/wall.types'
import { TILE_SIZES } from '@/features/wall-configurator/types/wall.types'
import { getDefaultLayers, MASONRY_CORE_TYPES } from '@/features/wall-configurator/store/layer-defaults'

// ─── Wizard Step Type ───────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4 | 5
const STEP_SEQUENCE: WizardStep[] = [1, 2, 3, 4, 5]

// ─── Sponsor Data ───────────────────────────────────────────────────────────

export interface SponsorColor {
  name: string
  hex: string
  code?: string
}

export interface SponsorBrand {
  id: string
  name: string
  logoUrl?: string
  colors: SponsorColor[]
}

// ─── Core Type Sub-Options ───────────────────────────────────────────────

export interface CoreThicknessOption {
  mm: number
  label: string
}

export const CORE_THICKNESS_OPTIONS: Record<CoreType, CoreThicknessOption[]> = {
  chb: [
    { mm: 100, label: '100mm (4") — Non-load-bearing' },
    { mm: 150, label: '150mm (6") — Standard load-bearing' },
    { mm: 200, label: '200mm (8") — Heavy load-bearing' },
  ],
  drywall: [
    { mm: 10, label: '9.5mm — Standard' },
    { mm: 13, label: '12.5mm — Standard (common)' },
    { mm: 15, label: '15mm — Fire rated' },
  ],
  plywood: [
    { mm: 9, label: '9mm — Light duty' },
    { mm: 12, label: '12mm — Standard' },
    { mm: 18, label: '18mm — Heavy duty' },
  ],
  'cement-board': [
    { mm: 6, label: '6mm — Ceiling / light' },
    { mm: 9, label: '9mm — Standard wall' },
    { mm: 12, label: '12mm — Heavy / wet area' },
  ],
  brick: [
    { mm: 100, label: '100mm — Half-brick' },
    { mm: 200, label: '200mm — Full brick' },
  ],
  'solid-concrete': [
    { mm: 100, label: '100mm — Partition' },
    { mm: 150, label: '150mm — Standard' },
    { mm: 200, label: '200mm — Structural' },
    { mm: 250, label: '250mm — Heavy structural' },
  ],
  'existing-wall': [
    { mm: 150, label: '150mm — Assumed' },
  ],
}

export function getDefaultThickness(core: CoreType): number {
  const opts = CORE_THICKNESS_OPTIONS[core]
  // Pick the most common / middle option
  return core === 'chb' ? 150
    : core === 'drywall' ? 13
    : core === 'plywood' ? 12
    : core === 'cement-board' ? 9
    : core === 'brick' ? 200
    : core === 'solid-concrete' ? 150
    : 150
}

// Default sponsor palettes (Philippine paint brands)
export const SPONSOR_BRANDS: SponsorBrand[] = [
  {
    id: 'boysen',
    name: 'Boysen',
    colors: [
      { name: 'White', hex: '#ffffff', code: 'B-0001' },
      { name: 'Ivory', hex: '#fef9ef', code: 'B-0751' },
      { name: 'Colonial White', hex: '#fdf6e3', code: 'B-0761' },
      { name: 'Sahara Sand', hex: '#f5deb3', code: 'B-2710' },
      { name: 'Adobe', hex: '#d2a679', code: 'B-2720' },
      { name: 'Capri Blue', hex: '#4a90d9', code: 'B-4060' },
      { name: 'Sky Blue', hex: '#87ceeb', code: 'B-4070' },
      { name: 'Jade Green', hex: '#00a86b', code: 'B-5030' },
      { name: 'Mint', hex: '#98fb98', code: 'B-5050' },
      { name: 'Coral Pink', hex: '#f08080', code: 'B-1050' },
      { name: 'Sunset Red', hex: '#cf4520', code: 'B-1010' },
      { name: 'Charcoal', hex: '#36454f', code: 'B-0061' },
    ],
  },
  {
    id: 'davies',
    name: 'Davies',
    colors: [
      { name: 'Bright White', hex: '#fafafa', code: 'DV-0001' },
      { name: 'Cream Puff', hex: '#fff8dc', code: 'DV-0710' },
      { name: 'Buttermilk', hex: '#fff4c1', code: 'DV-0720' },
      { name: 'Mocha', hex: '#967969', code: 'DV-2730' },
      { name: 'Ocean Blue', hex: '#4f94cd', code: 'DV-4040' },
      { name: 'Cool Mint', hex: '#aaf0d1', code: 'DV-5060' },
      { name: 'Sage', hex: '#bcb88a', code: 'DV-5070' },
      { name: 'Rose Blush', hex: '#e8adaa', code: 'DV-1030' },
      { name: 'Terracotta', hex: '#cb6843', code: 'DV-2740' },
      { name: 'Slate Gray', hex: '#708090', code: 'DV-0070' },
      { name: 'Warm Gray', hex: '#a89f91', code: 'DV-0065' },
      { name: 'Lemon Yellow', hex: '#fff44f', code: 'DV-3010' },
    ],
  },
  {
    id: 'island',
    name: 'Island Paints',
    colors: [
      { name: 'Arctic White', hex: '#f8f8ff', code: 'IP-001' },
      { name: 'Pearl', hex: '#eae0c8', code: 'IP-710' },
      { name: 'Sand Dollar', hex: '#eedcb4', code: 'IP-720' },
      { name: 'Pacific Blue', hex: '#1ca9c9', code: 'IP-410' },
      { name: 'Leaf Green', hex: '#4f7942', code: 'IP-510' },
      { name: 'Bamboo', hex: '#e3d4a0', code: 'IP-730' },
      { name: 'Sunset Orange', hex: '#fd5e53', code: 'IP-120' },
      { name: 'Cloud Gray', hex: '#b0b7c6', code: 'IP-060' },
      { name: 'Mauve', hex: '#e0b0ff', code: 'IP-620' },
      { name: 'Espresso', hex: '#3c2415', code: 'IP-275' },
    ],
  },
]

// ─── State Interface ────────────────────────────────────────────────────────

export interface WallLabState {
  // Wizard
  step: WizardStep
  completedSteps: Set<number>

  // Core config
  coreType: CoreType
  coreThicknessMM: number
  coreMoistureResistant: boolean
  lengthM: number
  heightM: number
  sides: SideCount
  layers: Layer[]

  // Treatment
  lason: LasonConfig

  // Finish
  finishType: FinishType
  tileConfig: TileConfig
  tilePattern: string

  // Colors & sponsors
  selectedColorHex: string
  selectedColorName: string
  activeSponsorId: string | null

  // Paint extras
  topcoatCoats: number
  paintCoverageSqmPerL: number

  // 3D state
  invalidateFn: (() => void) | null

  // ── Actions ─────────────────────────────────────────────────

  // Navigation
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void

  // Step 1
  setCoreType: (core: CoreType) => void
  setCoreThickness: (mm: number) => void
  setCoreMoistureResistant: (v: boolean) => void

  // Step 2
  setGeometry: (lengthM: number, heightM: number) => void

  // Step 3
  setSides: (s: SideCount) => void
  setLason: (lason: LasonConfig) => void
  toggleLayer: (code: string, enabled: boolean) => void

  // Step 5
  setFinishType: (ft: FinishType) => void
  setTileConfig: (tc: TileConfig) => void
  setTilePattern: (p: string) => void

  // Step 6
  setColor: (hex: string, name: string) => void
  setSponsor: (id: string | null) => void

  // Paint
  setTopcoatCoats: (coats: number) => void

  // 3D bridge
  setInvalidateFn: (fn: (() => void) | null) => void

  // Reset
  reset: () => void
}

// ─── Computed Helpers ────────────────────────────────────────────────────────

export function computeAreaState(state: WallLabState): AreaState {
  const gross = state.lengthM * state.heightM
  const net = gross
  const finish = state.sides === 2 ? net * 2 : net
  return {
    grossAreaSqm: gross,
    openingAreaSqm: 0,
    netAreaSqm: net,
    finishAreaSqm: finish,
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useWallLabStore = create<WallLabState>()((set, get) => {
  function invalidate() {
    get().invalidateFn?.()
  }

  return {
    // Wizard
    step: 1,
    completedSteps: new Set<number>(),

    // Core config
    coreType: 'chb',
    coreThicknessMM: 150,
    coreMoistureResistant: false,
    lengthM: 5,
    heightM: 3,
    sides: 1 as SideCount,
    layers: getDefaultLayers('chb'),

    // Treatment
    lason: { enabled: true, productType: 'muriatic-acid' },

    // Finish
    finishType: 'paint',
    tileConfig: TILE_SIZES[0],
    tilePattern: 'grid',

    // Colors
    selectedColorHex: '#ffffff',
    selectedColorName: 'White',
    activeSponsorId: 'boysen',

    // Paint
    topcoatCoats: 2,
    paintCoverageSqmPerL: 7,

    // 3D
    invalidateFn: null,

    // ── Navigation ──────────────────────────────────────────────

    setStep: (step) => {
      const s = get()
      const completed = new Set(s.completedSteps)
      // Mark all previous steps as completed
      const idx = STEP_SEQUENCE.indexOf(step)
      for (let i = 0; i < idx; i++) {
        completed.add(STEP_SEQUENCE[i])
      }
      set({ step, completedSteps: completed })
    },

    nextStep: () => {
      const s = get()
      const idx = STEP_SEQUENCE.indexOf(s.step)
      if (idx < STEP_SEQUENCE.length - 1) {
        const completed = new Set(s.completedSteps)
        completed.add(s.step)
        set({ step: STEP_SEQUENCE[idx + 1], completedSteps: completed })
      }
    },

    prevStep: () => {
      const s = get()
      const idx = STEP_SEQUENCE.indexOf(s.step)
      if (idx > 0) {
        set({ step: STEP_SEQUENCE[idx - 1] })
      }
    },

    // ── Step 1: Core Type ───────────────────────────────────────

    setCoreType: (coreType) => {
      const isMasonry = MASONRY_CORE_TYPES.has(coreType)
      set({
        coreType,
        coreThicknessMM: getDefaultThickness(coreType),
        coreMoistureResistant: false,
        layers: getDefaultLayers(coreType),
        lason: {
          enabled: isMasonry,
          productType: 'muriatic-acid',
        },
      })
      invalidate()
    },

    setCoreThickness: (mm) => {
      set({ coreThicknessMM: mm })
      invalidate()
    },

    setCoreMoistureResistant: (v) => {
      set({ coreMoistureResistant: v })
    },

    // ── Step 2: Geometry ────────────────────────────────────────

    setGeometry: (lengthM, heightM) => {
      set({ lengthM, heightM })
      invalidate()
    },

    // ── Step 3: Treatment ───────────────────────────────────────

    setSides: (sides) => {
      set({ sides })
      invalidate()
    },

    setLason: (lason) => {
      set({ lason })
      invalidate()
    },

    toggleLayer: (code, enabled) => {
      set((s) => ({
        layers: s.layers.map((l) => (l.code === code ? { ...l, enabled } : l)),
      }))
      invalidate()
    },

    // ── Step 5: Finish Type ─────────────────────────────────────

    setFinishType: (finishType) => {
      set({ finishType })
      invalidate()
    },

    setTileConfig: (tileConfig) => {
      set({ tileConfig })
      invalidate()
    },

    setTilePattern: (tilePattern) => {
      set({ tilePattern })
      invalidate()
    },

    // ── Step 6: Colors & Sponsors ───────────────────────────────

    setColor: (hex, name) => {
      set({ selectedColorHex: hex, selectedColorName: name })
      invalidate()
    },

    setSponsor: (id) => {
      set({ activeSponsorId: id })
    },

    // ── Paint ───────────────────────────────────────────────────

    setTopcoatCoats: (topcoatCoats) => {
      set({ topcoatCoats })
    },

    // ── 3D Bridge ───────────────────────────────────────────────

    setInvalidateFn: (fn) => set({ invalidateFn: fn }),

    // ── Reset ───────────────────────────────────────────────────

    reset: () => {
      set({
        step: 1,
        completedSteps: new Set<number>(),
        coreType: 'chb',
        coreThicknessMM: 150,
        coreMoistureResistant: false,
        lengthM: 5,
        heightM: 3,
        sides: 1 as SideCount,
        layers: getDefaultLayers('chb'),
        lason: { enabled: true, productType: 'muriatic-acid' },
        finishType: 'paint',
        tileConfig: TILE_SIZES[0],
        tilePattern: 'grid',
        selectedColorHex: '#ffffff',
        selectedColorName: 'White',
        activeSponsorId: 'boysen',
        topcoatCoats: 2,
        paintCoverageSqmPerL: 7,
      })
      invalidate()
    },
  }
})
