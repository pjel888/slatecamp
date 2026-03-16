import { create } from 'zustand'

type ParametricKey = 'lotArea' | 'far' | 'bhl' | 'setbackFront' | 'setbackSide'

interface LabState {
  // Parametric Playground state
  lotArea: number
  far: number
  bhl: number
  setbackFront: number
  setbackSide: number

  // Anatomy Inspector state
  activeHotspotId: string | null
  isQuizMode: boolean
  quizTargetPartId: string | null

  // R3F bridge — registered from inside Canvas via useInvalidateOnChange
  invalidateFn: (() => void) | null

  // Actions
  setParam: (key: ParametricKey, val: number) => void
  setActiveHotspot: (id: string | null) => void
  setQuizMode: (active: boolean, targetId?: string) => void
  setInvalidateFn: (fn: (() => void) | null) => void
  resetParametric: () => void
}

const DEFAULT_PARAMETRIC = {
  lotArea: 500,
  far: 2.5,
  bhl: 15,
  setbackFront: 3,
  setbackSide: 2,
} as const

export const useLabStore = create<LabState>()((set, get) => ({
  ...DEFAULT_PARAMETRIC,
  activeHotspotId: null,
  isQuizMode: false,
  quizTargetPartId: null,
  invalidateFn: null,

  setParam: (key, val) => {
    set({ [key]: val })
    // Directly trigger Canvas re-render — no React re-render needed
    get().invalidateFn?.()
  },

  setActiveHotspot: (id) => {
    set({ activeHotspotId: id })
    get().invalidateFn?.()
  },

  setQuizMode: (active, targetId) => {
    set({ isQuizMode: active, quizTargetPartId: targetId ?? null })
    get().invalidateFn?.()
  },

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),

  resetParametric: () => {
    set(DEFAULT_PARAMETRIC)
    get().invalidateFn?.()
  },
}))
