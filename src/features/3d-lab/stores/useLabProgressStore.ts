// Progress tracking state for the 3D Lab — visited hotspots, quiz results, compliance
import { create } from 'zustand'
import type { ComplianceState, QuizResult } from '@/types/3d-lab'

export interface LabProgressState {
  // Hotspot / question tracking
  visitedHotspotIds: Set<string>
  answeredQuestionIds: Set<string>
  correctQuestionIds: Set<string>

  // Parametric + compliance
  parametricValues: Record<string, number>
  complianceState: ComplianceState

  // Quiz results
  quizResults: QuizResult[]

  // Actions
  markHotspotVisited: (id: string) => void
  addQuizResult: (result: QuizResult) => void
  setParametricValue: (controlId: string, value: number) => void
  setComplianceState: (state: ComplianceState) => void
  resetProgress: () => void
}

const PROGRESS_DEFAULTS: Pick<
  LabProgressState,
  | 'visitedHotspotIds'
  | 'answeredQuestionIds'
  | 'correctQuestionIds'
  | 'parametricValues'
  | 'complianceState'
  | 'quizResults'
> = {
  visitedHotspotIds: new Set(),
  answeredQuestionIds: new Set(),
  correctQuestionIds: new Set(),
  parametricValues: {},
  complianceState: 'compliant',
  quizResults: [],
}

export const useLabProgressStore = create<LabProgressState>()((set) => ({
  ...PROGRESS_DEFAULTS,

  markHotspotVisited: (id) =>
    set((s) => {
      const next = new Set(s.visitedHotspotIds)
      next.add(id)
      return { visitedHotspotIds: next }
    }),

  addQuizResult: (result) =>
    set((s) => {
      const nextAnswered = new Set(s.answeredQuestionIds)
      nextAnswered.add(result.questionId)
      const nextCorrect = new Set(s.correctQuestionIds)
      if (result.correct) nextCorrect.add(result.questionId)
      return {
        quizResults: [...s.quizResults, result],
        answeredQuestionIds: nextAnswered,
        correctQuestionIds: nextCorrect,
      }
    }),

  setParametricValue: (controlId, value) =>
    set((s) => ({
      parametricValues: { ...s.parametricValues, [controlId]: value },
    })),

  setComplianceState: (state) => set({ complianceState: state }),

  resetProgress: () =>
    set({
      visitedHotspotIds: new Set(),
      answeredQuestionIds: new Set(),
      correctQuestionIds: new Set(),
      parametricValues: {},
      complianceState: 'compliant',
      quizResults: [],
    }),
}))
