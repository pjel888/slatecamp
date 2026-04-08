// Navigation state for the 3D Lab — module traversal and exploration mode
import { create } from 'zustand'
import type { ExploreMode } from '@/types/3d-lab'

export interface LabNavigationState {
  // Sequence / guided-mode tracking
  currentSequenceIndex: number
  exploreMode: ExploreMode
  guidedSequenceComplete: boolean

  // Actions
  advanceSequence: () => void
  setExploreMode: (mode: ExploreMode) => void
  setGuidedSequenceComplete: (complete: boolean) => void
  resetNavigation: () => void
}

const NAVIGATION_DEFAULTS: Pick<
  LabNavigationState,
  'currentSequenceIndex' | 'exploreMode' | 'guidedSequenceComplete'
> = {
  currentSequenceIndex: 0,
  exploreMode: 'guided',
  guidedSequenceComplete: false,
}

export const useLabNavigationStore = create<LabNavigationState>()((set, get) => ({
  ...NAVIGATION_DEFAULTS,

  advanceSequence: () =>
    set((s) => ({ currentSequenceIndex: s.currentSequenceIndex + 1 })),

  setExploreMode: (mode) => set({ exploreMode: mode }),

  setGuidedSequenceComplete: (complete) => set({ guidedSequenceComplete: complete }),

  resetNavigation: () => set({ ...NAVIGATION_DEFAULTS }),
}))
