// src/types/3d-lab.ts — Type contracts for the 3D Learning Lab
// Every field is intentional. Do not add fields speculatively.

export type HotspotType = 'informational' | 'exam-critical' | 'violation'

export type PanelMode = 'none' | 'info' | 'question' | 'quiz'

export type ComplianceState = 'compliant' | 'at-limit' | 'violation'

export type ExploreMode = 'guided' | 'free'

export type QuestionType = 'multiple-choice' | 'slider-adjust' | 'hotspot-click'

export interface HotspotData {
  id: string
  position: [number, number, number]
  type: HotspotType
  label: string
  eyebrow: string
  title: string
  body: string
  values: Array<{
    label: string
    value: string
    isOld?: boolean
  }>
  source: string
  questionId: string
  highlightMeshName?: string
  sequenceOrder: number
  category?: string
}

export interface LabQuestion {
  id: string
  hotspotId: string
  type: QuestionType
  stem: string
  options?: Array<{ id: string; text: string }>
  correctOptionId?: string
  correctValue?: number
  correctHotspotId?: string
  rationale: string
  taxonomyNode: string
}

export interface ParametricControl {
  id: string
  label: string
  unit: 'mm' | 'degrees' | 'ratio'
  min: number
  max: number
  codeMin?: number
  codeMax?: number
  step: number
  defaultValue: number
  affectsMeshes: string[]
}

export interface ModuleConfig {
  slug: string
  title: string
  codeReference: string
  subject: string
  learningObjective: string
  estimatedMinutes: number
  modelUrl: string
  modelSizeMB: number
  defaultCameraPosition: [number, number, number]
  defaultCameraTarget: [number, number, number]
  hotspots: HotspotData[]
  questions: LabQuestion[]
  parametricControls?: ParametricControl[]
  supportsCrossSection: boolean
  supportsExplodedView: boolean
  preTrainingTips: string[]
  presetViews: {
    plan?: [number, number, number]
    section?: [number, number, number]
    elevation?: [number, number, number]
  }
}

export interface TelemetryEvent {
  moduleSlug: string
  event: string
  timestamp: number
  payload: Record<string, unknown>
}

// Guided sequence state for the sequencer
export interface GuidedSequenceState {
  currentIndex: number
  totalHotspots: number
  visitedIds: Set<string>
  isComplete: boolean
}

// Quiz result for exit summary
export interface QuizResult {
  questionId: string
  correct: boolean
  selectedOptionId?: string
  selectedValue?: number
  selectedHotspotId?: string
  timeMs: number
}
