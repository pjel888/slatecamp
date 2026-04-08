// View/UI state for the 3D Lab — panel mode, hotspot selection, cross-section, quiz mode
import { create } from 'zustand'
import type { PanelMode } from '@/types/3d-lab'

export interface LabViewState {
  // Panel state
  activeHotspotId: string | null
  panelMode: PanelMode
  questionAnswered: boolean
  selectedOptionId: string | null

  // View toggles
  crossSectionEnabled: boolean
  explodedViewEnabled: boolean
  quizModeActive: boolean

  // Actions
  openHotspot: (id: string) => void
  closePanel: (markVisited?: boolean) => void
  openQuestion: () => void
  selectOption: (optionId: string) => void
  toggleCrossSection: () => void
  toggleExplodedView: () => void
  enterQuizMode: () => void
  exitQuizMode: () => void
  resetCamera: () => void
  resetView: () => void
}

const VIEW_DEFAULTS: Pick<
  LabViewState,
  | 'activeHotspotId'
  | 'panelMode'
  | 'questionAnswered'
  | 'selectedOptionId'
  | 'crossSectionEnabled'
  | 'explodedViewEnabled'
  | 'quizModeActive'
> = {
  activeHotspotId: null,
  panelMode: 'none',
  questionAnswered: false,
  selectedOptionId: null,
  crossSectionEnabled: false,
  explodedViewEnabled: false,
  quizModeActive: false,
}

export const useLabViewStore = create<LabViewState>()((set) => ({
  ...VIEW_DEFAULTS,

  openHotspot: (id) =>
    set({
      activeHotspotId: id,
      panelMode: 'info',
      questionAnswered: false,
      selectedOptionId: null,
    }),

  closePanel: () =>
    set({
      activeHotspotId: null,
      panelMode: 'none',
      questionAnswered: false,
      selectedOptionId: null,
    }),

  openQuestion: () => set({ panelMode: 'question' }),

  selectOption: (optionId) =>
    set({
      selectedOptionId: optionId,
      questionAnswered: true,
    }),

  toggleCrossSection: () =>
    set((s) => ({ crossSectionEnabled: !s.crossSectionEnabled })),

  toggleExplodedView: () =>
    set((s) => ({ explodedViewEnabled: !s.explodedViewEnabled })),

  enterQuizMode: () =>
    set({
      quizModeActive: true,
      panelMode: 'quiz',
      activeHotspotId: null,
    }),

  exitQuizMode: () =>
    set({
      quizModeActive: false,
      panelMode: 'none',
    }),

  resetCamera: () => {},

  resetView: () => set({ ...VIEW_DEFAULTS }),
}))
