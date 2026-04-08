// src/features/3d-lab/stores/useLabStore.ts
// Backward-compatible re-export that delegates to the three focused stores.
// New code should import directly from the focused stores:
//   useLabNavigationStore, useLabProgressStore, useLabViewStore

export { useLabNavigationStore } from './useLabNavigationStore'
export type { LabNavigationState } from './useLabNavigationStore'

export { useLabProgressStore } from './useLabProgressStore'
export type { LabProgressState } from './useLabProgressStore'

export { useLabViewStore } from './useLabViewStore'
export type { LabViewState } from './useLabViewStore'

// ---------------------------------------------------------------------------
// Combined selector hook — mirrors the original useLabStore API surface so
// existing call-sites (useComplianceCheck, useGuidedSequence, LabViewport,
// ModuleViewer) keep working without any changes.
// ---------------------------------------------------------------------------

import { useLabNavigationStore } from './useLabNavigationStore'
import { useLabProgressStore } from './useLabProgressStore'
import { useLabViewStore } from './useLabViewStore'
import type { ExploreMode, ComplianceState, QuizResult, PanelMode } from '@/types/3d-lab'

export interface LabState {
  // View state
  activeHotspotId: string | null
  panelMode: PanelMode
  questionAnswered: boolean
  selectedOptionId: string | null
  crossSectionEnabled: boolean
  explodedViewEnabled: boolean
  quizModeActive: boolean

  // Progress tracking
  visitedHotspotIds: Set<string>
  answeredQuestionIds: Set<string>
  correctQuestionIds: Set<string>
  parametricValues: Record<string, number>
  complianceState: ComplianceState
  quizResults: QuizResult[]

  // Navigation
  currentSequenceIndex: number
  exploreMode: ExploreMode
  guidedSequenceComplete: boolean

  // Actions — view
  openHotspot: (id: string) => void
  closePanel: () => void
  openQuestion: () => void
  selectOption: (optionId: string) => void
  toggleCrossSection: () => void
  toggleExplodedView: () => void
  enterQuizMode: () => void
  exitQuizMode: () => void
  resetCamera: () => void

  // Actions — progress
  addQuizResult: (result: QuizResult) => void
  setParametricValue: (controlId: string, value: number) => void
  setComplianceState: (state: ComplianceState) => void

  // Actions — navigation
  advanceSequence: () => void
  setExploreMode: (mode: ExploreMode) => void

  // Session reset
  resetSession: () => void
}

const buildCombined = (): LabState => {
  const nav = useLabNavigationStore.getState()
  const progress = useLabProgressStore.getState()
  const view = useLabViewStore.getState()

  return {
    // View
    activeHotspotId: view.activeHotspotId,
    panelMode: view.panelMode,
    questionAnswered: view.questionAnswered,
    selectedOptionId: view.selectedOptionId,
    crossSectionEnabled: view.crossSectionEnabled,
    explodedViewEnabled: view.explodedViewEnabled,
    quizModeActive: view.quizModeActive,
    openHotspot: view.openHotspot,
    closePanel: view.closePanel,
    openQuestion: view.openQuestion,
    selectOption: view.selectOption,
    toggleCrossSection: view.toggleCrossSection,
    toggleExplodedView: view.toggleExplodedView,
    enterQuizMode: view.enterQuizMode,
    exitQuizMode: view.exitQuizMode,
    resetCamera: view.resetCamera,

    // Progress
    visitedHotspotIds: progress.visitedHotspotIds,
    answeredQuestionIds: progress.answeredQuestionIds,
    correctQuestionIds: progress.correctQuestionIds,
    parametricValues: progress.parametricValues,
    complianceState: progress.complianceState,
    quizResults: progress.quizResults,
    addQuizResult: progress.addQuizResult,
    setParametricValue: progress.setParametricValue,
    setComplianceState: progress.setComplianceState,

    // Navigation
    currentSequenceIndex: nav.currentSequenceIndex,
    exploreMode: nav.exploreMode,
    guidedSequenceComplete: nav.guidedSequenceComplete,
    advanceSequence: nav.advanceSequence,
    setExploreMode: nav.setExploreMode,

    resetSession: () => {
      view.resetView()
      progress.resetProgress()
      nav.resetNavigation()
    },
  }
}

/**
 * Combined hook that merges all three focused stores into the original
 * useLabStore API. Selector-based usage is preferred to avoid over-subscribing.
 *
 * Usage (selector — preferred):
 *   const parametricValues = useLabStore((s) => s.parametricValues)
 *
 * Usage (full state — use sparingly):
 *   const { resetSession } = useLabStore((s) => s)
 */
export const useLabStore = <T>(selector: (state: LabState) => T): T => {
  const nav = useLabNavigationStore()
  const progress = useLabProgressStore()
  const view = useLabViewStore()

  const combined: LabState = {
    activeHotspotId: view.activeHotspotId,
    panelMode: view.panelMode,
    questionAnswered: view.questionAnswered,
    selectedOptionId: view.selectedOptionId,
    crossSectionEnabled: view.crossSectionEnabled,
    explodedViewEnabled: view.explodedViewEnabled,
    quizModeActive: view.quizModeActive,
    openHotspot: view.openHotspot,
    closePanel: view.closePanel,
    openQuestion: view.openQuestion,
    selectOption: view.selectOption,
    toggleCrossSection: view.toggleCrossSection,
    toggleExplodedView: view.toggleExplodedView,
    enterQuizMode: view.enterQuizMode,
    exitQuizMode: view.exitQuizMode,
    resetCamera: view.resetCamera,
    visitedHotspotIds: progress.visitedHotspotIds,
    answeredQuestionIds: progress.answeredQuestionIds,
    correctQuestionIds: progress.correctQuestionIds,
    parametricValues: progress.parametricValues,
    complianceState: progress.complianceState,
    quizResults: progress.quizResults,
    addQuizResult: progress.addQuizResult,
    setParametricValue: progress.setParametricValue,
    setComplianceState: progress.setComplianceState,
    currentSequenceIndex: nav.currentSequenceIndex,
    exploreMode: nav.exploreMode,
    guidedSequenceComplete: nav.guidedSequenceComplete,
    advanceSequence: nav.advanceSequence,
    setExploreMode: nav.setExploreMode,
    resetSession: () => {
      view.resetView()
      progress.resetProgress()
      nav.resetNavigation()
    },
  }

  return selector(combined)
}

// Static setState — used by useGuidedSequence:
//   useLabStore.setState({ guidedSequenceComplete: true })
useLabStore.setState = (partial: Partial<LabState>) => {
  if ('guidedSequenceComplete' in partial) {
    useLabNavigationStore.setState({ guidedSequenceComplete: partial.guidedSequenceComplete })
  }
  if ('currentSequenceIndex' in partial) {
    useLabNavigationStore.setState({ currentSequenceIndex: partial.currentSequenceIndex })
  }
  if ('exploreMode' in partial) {
    useLabNavigationStore.setState({ exploreMode: partial.exploreMode })
  }
  if ('complianceState' in partial) {
    useLabProgressStore.setState({ complianceState: partial.complianceState })
  }
  if ('parametricValues' in partial) {
    useLabProgressStore.setState({ parametricValues: partial.parametricValues })
  }
  if ('activeHotspotId' in partial) {
    useLabViewStore.setState({ activeHotspotId: partial.activeHotspotId })
  }
  if ('panelMode' in partial) {
    useLabViewStore.setState({ panelMode: partial.panelMode })
  }
  if ('quizModeActive' in partial) {
    useLabViewStore.setState({ quizModeActive: partial.quizModeActive })
  }
}

// Static getState — used by LabViewport:
//   useLabStore.getState().resetSession()
useLabStore.getState = (): LabState => buildCombined()
