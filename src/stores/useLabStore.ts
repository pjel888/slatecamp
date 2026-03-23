// src/stores/useLabStore.ts — Global 3D Lab state (Zustand)
// No component-local state for anything that crosses component boundaries.

import { create } from 'zustand'
import type {
  PanelMode,
  ExploreMode,
  ComplianceState,
  QuizResult,
} from '@/types/3d-lab'

interface LabState {
  // Panel state
  activeHotspotId: string | null
  panelMode: PanelMode
  questionAnswered: boolean
  selectedOptionId: string | null

  // Progress tracking
  visitedHotspotIds: Set<string>
  answeredQuestionIds: Set<string>
  correctQuestionIds: Set<string>
  currentSequenceIndex: number

  // Exploration mode
  exploreMode: ExploreMode
  guidedSequenceComplete: boolean

  // Parametric state
  parametricValues: Record<string, number>
  complianceState: ComplianceState

  // View state
  crossSectionEnabled: boolean
  explodedViewEnabled: boolean
  labelsVisible: boolean
  cameraIsOrbiting: boolean
  quizModeActive: boolean

  // Quiz results
  quizResults: QuizResult[]

  // Actions
  openHotspot: (id: string) => void
  closePanel: () => void
  openQuestion: () => void
  selectOption: (optionId: string) => void
  advanceSequence: () => void
  setExploreMode: (mode: ExploreMode) => void
  setParametricValue: (controlId: string, value: number) => void
  setComplianceState: (state: ComplianceState) => void
  toggleCrossSection: () => void
  toggleExplodedView: () => void
  toggleLabels: () => void
  setCameraOrbiting: (orbiting: boolean) => void
  enterQuizMode: () => void
  exitQuizMode: () => void
  addQuizResult: (result: QuizResult) => void
  resetCamera: () => void
  resetSession: () => void
}

export const useLabStore = create<LabState>((set, get) => ({
  // Panel state
  activeHotspotId: null,
  panelMode: 'none',
  questionAnswered: false,
  selectedOptionId: null,

  // Progress tracking
  visitedHotspotIds: new Set(),
  answeredQuestionIds: new Set(),
  correctQuestionIds: new Set(),
  currentSequenceIndex: 0,

  // Exploration mode
  exploreMode: 'guided',
  guidedSequenceComplete: false,

  // Parametric state
  parametricValues: {},
  complianceState: 'compliant',

  // View state
  crossSectionEnabled: false,
  explodedViewEnabled: false,
  labelsVisible: true,
  cameraIsOrbiting: false,
  quizModeActive: false,

  // Quiz results
  quizResults: [],

  // Actions
  openHotspot: (id) =>
    set({
      activeHotspotId: id,
      panelMode: 'info',
      questionAnswered: false,
      selectedOptionId: null,
    }),

  closePanel: () => {
    const { activeHotspotId, visitedHotspotIds, questionAnswered } = get()
    const nextVisited = new Set(visitedHotspotIds)
    if (activeHotspotId && questionAnswered) {
      nextVisited.add(activeHotspotId)
    }
    set({
      activeHotspotId: null,
      panelMode: 'none',
      questionAnswered: false,
      selectedOptionId: null,
      visitedHotspotIds: nextVisited,
    })
  },

  openQuestion: () =>
    set({ panelMode: 'question' }),

  selectOption: (optionId) =>
    set({
      selectedOptionId: optionId,
      questionAnswered: true,
    }),

  advanceSequence: () => {
    const { currentSequenceIndex } = get()
    set({ currentSequenceIndex: currentSequenceIndex + 1 })
  },

  setExploreMode: (mode) =>
    set({ exploreMode: mode }),

  setParametricValue: (controlId, value) =>
    set((state) => ({
      parametricValues: { ...state.parametricValues, [controlId]: value },
    })),

  setComplianceState: (state) =>
    set({ complianceState: state }),

  toggleCrossSection: () =>
    set((state) => ({ crossSectionEnabled: !state.crossSectionEnabled })),

  toggleExplodedView: () =>
    set((state) => ({ explodedViewEnabled: !state.explodedViewEnabled })),

  toggleLabels: () =>
    set((state) => ({ labelsVisible: !state.labelsVisible })),

  setCameraOrbiting: (orbiting) =>
    set({ cameraIsOrbiting: orbiting }),

  enterQuizMode: () =>
    set({
      quizModeActive: true,
      panelMode: 'quiz',
      activeHotspotId: null,
      labelsVisible: false,
      quizResults: [],
    }),

  exitQuizMode: () =>
    set({
      quizModeActive: false,
      panelMode: 'none',
      labelsVisible: true,
    }),

  addQuizResult: (result) =>
    set((state) => {
      const nextAnswered = new Set(state.answeredQuestionIds)
      nextAnswered.add(result.questionId)
      const nextCorrect = new Set(state.correctQuestionIds)
      if (result.correct) nextCorrect.add(result.questionId)
      return {
        quizResults: [...state.quizResults, result],
        answeredQuestionIds: nextAnswered,
        correctQuestionIds: nextCorrect,
      }
    }),

  resetCamera: () =>
    set({ cameraIsOrbiting: false }),

  resetSession: () =>
    set({
      activeHotspotId: null,
      panelMode: 'none',
      questionAnswered: false,
      selectedOptionId: null,
      visitedHotspotIds: new Set(),
      answeredQuestionIds: new Set(),
      correctQuestionIds: new Set(),
      currentSequenceIndex: 0,
      exploreMode: 'guided',
      guidedSequenceComplete: false,
      parametricValues: {},
      complianceState: 'compliant',
      crossSectionEnabled: false,
      explodedViewEnabled: false,
      labelsVisible: true,
      cameraIsOrbiting: false,
      quizModeActive: false,
      quizResults: [],
    }),
}))
