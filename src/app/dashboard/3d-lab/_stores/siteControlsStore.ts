// src/app/dashboard/3d-lab/_stores/siteControlsStore.ts
// Zustand store for the PD 1096 Site Development Controls module.
// Enhanced for UX Plan §03: parametric sliders, computed HUD, guided tour.

import { create } from 'zustand'
import { ZoningClass } from '../_constants/nbcp'
import { calculateSiteControls, type SiteControlInputs, type SiteControlOutputs } from '../_utils/siteControlsCalculator'

// ─── Default Inputs ──────────────────────────────────────────────────────────
// 300 sqm R-1 lot — the canonical reference case from the Fact-Check document.

const DEFAULT_INPUTS: SiteControlInputs = {
  lotWidth: 15,
  lotDepth: 20,
  zoningClass: ZoningClass.R1,
  rrowWidth: 10,
  numFloors: 2,
  floorHeight: 3.0,
}

// ─── Presets (exam-relevant scenarios) ───────────────────────────────────────

export interface SiteControlPreset {
  label: string
  inputs: SiteControlInputs
}

export const SITE_CONTROL_PRESETS: SiteControlPreset[] = [
  {
    label: 'R-1 Subdivision (300 sqm)',
    inputs: { ...DEFAULT_INPUTS },
  },
  {
    label: 'R-2 Rowhouse',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 8, lotDepth: 15, zoningClass: ZoningClass.R2_BASIC, rrowWidth: 8, numFloors: 3, floorHeight: 3.0 },
  },
  {
    label: 'C-1 Commercial',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 20, lotDepth: 30, zoningClass: ZoningClass.C1, rrowWidth: 15, numFloors: 4, floorHeight: 3.5 },
  },
  {
    label: 'Narrow Lot (violation)',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 6, lotDepth: 20, rrowWidth: 8, numFloors: 2, floorHeight: 3.0 },
  },
  {
    label: 'Max Height Test',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 20, lotDepth: 25, zoningClass: ZoningClass.R4, rrowWidth: 15, numFloors: 8, floorHeight: 3.2 },
  },
]

// ─── Active Zone Type ────────────────────────────────────────────────────────

export type ActiveZone = 'ambf' | 'isa' | 'usa' | 'setbacks' | 'tla' | null
export type ViewMode = 'perspective' | 'top'

/** Tour steps 0-5 per UX Plan §05. null = sandbox (free mode). */
export type TourStep = 0 | 1 | 2 | 3 | 4 | 5 | null

export const TOUR_STEP_LABELS: Record<number, { title: string; subtitle: string }> = {
  0: { title: 'Read the lot', subtitle: 'Locate' },
  1: { title: 'Carve the margins', subtitle: 'Setbacks' },
  2: { title: 'Find the footprint', subtitle: 'AMBF' },
  3: { title: 'Rise within limits', subtitle: 'Build Height' },
  4: { title: 'Give back the ground', subtitle: 'Open Space' },
  5: { title: 'Test your limits', subtitle: 'Sandbox' },
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface SiteControlsState {
  // Core data
  inputs: SiteControlInputs
  computed: SiteControlOutputs

  // R3F bridge — registered from inside Canvas via useInvalidateOnStoreChange
  invalidateFn: (() => void) | null

  // Core actions
  setInputs: (patch: Partial<SiteControlInputs>) => void
  applyPreset: (preset: SiteControlPreset) => void
  reset: () => void
  setInvalidateFn: (fn: (() => void) | null) => void

  // UI state (not in calculator — purely presentation)
  activeZone: ActiveZone
  setActiveZone: (z: ActiveZone) => void
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void
  showDimensions: boolean
  toggleDimensions: () => void

  // Guided tour (UX Plan §05)
  tourStep: TourStep
  setTourStep: (step: TourStep) => void
  nextTourStep: () => void
  prevTourStep: () => void
}

function computeAndInvalidate(
  inputs: SiteControlInputs,
  invalidateFn: (() => void) | null,
): SiteControlOutputs {
  const computed = calculateSiteControls(inputs)
  invalidateFn?.()
  return computed
}

export const useSiteControlsStore = create<SiteControlsState>()((set, get) => ({
  inputs: DEFAULT_INPUTS,
  computed: calculateSiteControls(DEFAULT_INPUTS),
  invalidateFn: null,

  setInputs: (patch) => {
    const next = { ...get().inputs, ...patch }
    set({ inputs: next, computed: computeAndInvalidate(next, get().invalidateFn) })
  },

  applyPreset: (preset) => {
    set({ inputs: preset.inputs, computed: computeAndInvalidate(preset.inputs, get().invalidateFn) })
  },

  reset: () => {
    set({
      inputs: DEFAULT_INPUTS,
      computed: computeAndInvalidate(DEFAULT_INPUTS, get().invalidateFn),
      activeZone: null,
      viewMode: 'perspective',
      showDimensions: false,
      tourStep: null,
    })
  },

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),

  // UI state
  activeZone: null,
  setActiveZone: (z) => {
    set({ activeZone: z })
    get().invalidateFn?.()
  },
  viewMode: 'perspective',
  setViewMode: (m) => {
    set({ viewMode: m })
    get().invalidateFn?.()
  },
  showDimensions: false,
  toggleDimensions: () => {
    set((s) => ({ showDimensions: !s.showDimensions }))
    get().invalidateFn?.()
  },

  // Guided tour
  tourStep: null,
  setTourStep: (step) => {
    set({ tourStep: step })
    get().invalidateFn?.()
  },
  nextTourStep: () => {
    const current = get().tourStep
    if (current === null) {
      set({ tourStep: 0 })
    } else if (current < 5) {
      set({ tourStep: (current + 1) as TourStep })
    } else {
      // Step 5 → sandbox (null)
      set({ tourStep: null })
    }
    get().invalidateFn?.()
  },
  prevTourStep: () => {
    const current = get().tourStep
    if (current === null || current === 0) return
    set({ tourStep: (current - 1) as TourStep })
    get().invalidateFn?.()
  },
}))
