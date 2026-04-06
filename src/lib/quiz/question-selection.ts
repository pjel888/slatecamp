// ─── Question Selection Algorithm (Doc 3 §7) ────────────────────────────────
// Selects questions based on mode config: topics, difficulty, freshness

import { toClientQuestion, type QuestionForClientRow } from '@/lib/quiz/to-client-question'
import type { QuizSessionConfig, QuizMode } from '@/types/quiz-config'

interface SelectionParams {
  userId: string
  config: QuizSessionConfig
  userMasteryLevel?: number
}

/** Build the Supabase query for question selection */
export const buildQuestionSelectionQuery = ({
  userId,
  config,
  userMasteryLevel = 3,
}: SelectionParams) => {
  const { setup } = config
  const { questionCount, topics, disciplines, difficultyMode, initialDifficulty } = setup

  return {
    // Step 1: Topic filter
    topicFilter: topics.length > 0 ? topics : null,
    disciplineFilter: disciplines.length > 0 ? disciplines : null,

    // Step 2: Recency exclusion (7 days)
    recencyExclusionDays: 7,

    // Step 3: Priority for recently-wrong questions (14 days)
    prioritizeWrongDays: config.mode === 'focused' ? 30 : 14,

    // Step 4: Difficulty distribution
    difficultyDistribution: getDifficultyDistribution(difficultyMode, initialDifficulty, userMasteryLevel),

    // Step 5: Count
    count: questionCount,

    userId,
  }
}

/** Get difficulty distribution percentages based on mode */
const getDifficultyDistribution = (
  mode: string,
  initial: string,
  userMastery: number,
): Record<string, number> => {
  switch (mode) {
    case 'adaptive':
      // Weight toward zone of proximal development
      return {
        easy: 0.15,
        medium: 0.70,
        hard: 0.15,
      }

    case 'user-selected':
      switch (initial) {
        case 'easy': return { easy: 0.60, medium: 0.30, hard: 0.10 }
        case 'medium': return { easy: 0.15, medium: 0.70, hard: 0.15 }
        case 'hard': return { easy: 0.05, medium: 0.30, hard: 0.65 }
        default: return { easy: 0.33, medium: 0.34, hard: 0.33 }
      }

    case 'static':
    default:
      // Exam-weighted distribution
      return { easy: 0.20, medium: 0.50, hard: 0.30 }
  }
}

/** ALE area distribution for exam modes (Doc 4 §2.4) */
export const ALE_AREA_DISTRIBUTION = {
  'area-a': 0.30, // History, Theory, Practice
  'area-b': 0.30, // Structural, Materials, Utilities
  'area-c': 0.40, // Architectural Design
} as const

/** Map difficulty level to band */
export const difficultyToBand = (level: number): 'easy' | 'medium' | 'hard' => {
  if (level <= 2) return 'easy'
  if (level <= 4) return 'medium'
  return 'hard'
}

/** Strip server-only fields from questions for client */
export const stripQuestionForClient = (question: {
  question_id: string
  text: string
  options: unknown
  prompt_image_url?: string | null
  difficulty?: number
  topic_id?: string
  question_type?: string
  metadata?: Record<string, unknown> | null
}, position: number): any => ({
  ...toClientQuestion(question as QuestionForClientRow, position),
})
