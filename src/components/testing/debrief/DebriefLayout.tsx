'use client'

import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ScoreHero } from './ScoreHero'
import { ReadinessDelta } from './ReadinessDelta'
import { NodeMasteryStrip } from './NodeMasteryStrip'
import { QuestionReviewStrip } from './QuestionReviewStrip'
import { CalibrationReveal } from './CalibrationReveal'
import { BlockAccuracyChart } from './BlockAccuracyChart'
import { DebriefActions } from './DebriefActions'
import {
  getScoreBand,
  SCORE_BAND_THRESHOLDS,
} from '@/types/testing'
import type {
  NodeMasteryDelta,
  QuestionReviewItem,
  CalibrationResult,
  AccuracyBlock,
  ConfidenceRating,
  ModeSource,
} from '@/types/testing'
import { ERROR_TAG_LABELS } from '@/types/testing'

// ─── Raw DB shapes ─────────────────────────────────────────────────────────────

interface RawQuestion {
  question_id: string
  text: string
  options: Array<{ id: string; text: string; letter?: string }>
  correct_option_id: string
  rationale: string | null
  code_citation: string | null
  model_id: string | null
  topic_id: string
}

interface RawInteraction {
  interaction_id: string
  question_order: number
  selected_option_id: string | null
  is_correct: boolean
  confidence_tag: 'sure' | 'unsure' | null
  error_tags: string[] | null
  eliminated_option_ids: string[] | null
  is_flagged: boolean
  time_spent_ms: number
  questions: RawQuestion
}

interface RawMasteryRow {
  topic_id: string
  current_mastery_weight: number
  taxonomy_tree: {
    name: string
    ale_id: string
  }
}

interface RawSession {
  session_id: string
  status: string
  config: {
    source?: ModeSource
    preSessionConfidence?: Array<{ subjectId: string; subjectName: string; rating: ConfidenceRating }>
    isEnduranceSession?: boolean
  } | null
  question_ids: string[] | null
  completed_at: string | null
  mastery_snapshot_at_start?: Record<string, number> | null
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DebriefLayoutProps {
  session: RawSession
  interactions: RawInteraction[]
  readinessBefore: number
  readinessAfter: number
  masteryData: RawMasteryRow[]
  masterySnapshotAtStart: Record<string, number> | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MASTERY_STATE = (weight: number): NodeMasteryDelta['currentState'] => {
  if (weight <= 0) return 'grey'
  if (weight < 0.4) return 'red'
  if (weight < 0.7) return 'amber'
  return 'green'
}

const BLOCK_SIZE = 10

const buildAccuracyBlocks = (interactions: RawInteraction[]): AccuracyBlock[] => {
  const blocks: AccuracyBlock[] = []
  for (let i = 0; i < interactions.length; i += BLOCK_SIZE) {
    const chunk = interactions.slice(i, i + BLOCK_SIZE)
    const correct = chunk.filter(x => x.is_correct).length
    blocks.push({
      block: blocks.length + 1,
      accuracy: Math.round((correct / chunk.length) * 100),
      questionCount: chunk.length,
    })
  }
  return blocks
}

const buildCalibration = (
  interactions: RawInteraction[],
  preSessionConfidence: Array<{ subjectId: string; subjectName: string; rating: ConfidenceRating }>,
): CalibrationResult | null => {
  if (!preSessionConfidence?.length) return null

  // Group interactions by subject name via topic_id prefix match
  const subjects = preSessionConfidence.map(conf => {
    // Match interactions to subject by topic_id prefix (e.g. ALE-HIST-*)
    const subjectInteractions = interactions.filter(i =>
      i.questions.topic_id.startsWith(conf.subjectId)
    )
    if (subjectInteractions.length === 0) return null
    const correct = subjectInteractions.filter(i => i.is_correct).length
    const actualAccuracy = Math.round((correct / subjectInteractions.length) * 100)
    const predictedAccuracy = conf.rating === 1 ? 40 : conf.rating === 2 ? 65 : 85
    const gap = predictedAccuracy - actualAccuracy
    let gapDirection: 'overconfident' | 'underconfident' | 'calibrated'
    let gapText: string
    if (gap > 10) {
      gapDirection = 'overconfident'
      gapText = "You were overconfident here — that's useful to know."
    } else if (gap < -10) {
      gapDirection = 'underconfident'
      gapText = 'You knew this better than you thought — trust yourself.'
    } else {
      gapDirection = 'calibrated'
      gapText = 'Well-calibrated — your prediction matched reality.'
    }
    return {
      subjectName: conf.subjectName,
      predictedLevel: conf.rating,
      actualAccuracy,
      gapDirection,
      gapText,
    }
  }).filter(Boolean) as CalibrationResult['subjects']

  if (!subjects.length) return null

  // Calibration score: average inverse of |gap| normalized to 0-100
  const avgAbsGap =
    subjects.reduce((s, sub) => {
      const predicted = sub.predictedLevel === 1 ? 40 : sub.predictedLevel === 2 ? 65 : 85
      return s + Math.abs(predicted - sub.actualAccuracy)
    }, 0) / subjects.length
  const overallScore = Math.max(0, Math.round(100 - avgAbsGap))

  return { subjects, overallScore }
}

// ─── staggered reveal sequencing ──────────────────────────────────────────────
// Applied via inline style delays; uses Tailwind animate-in from tw-animate-css

// ─── Component ────────────────────────────────────────────────────────────────

export const DebriefLayout = ({
  session,
  interactions,
  readinessBefore,
  readinessAfter,
  masteryData,
  masterySnapshotAtStart,
}: DebriefLayoutProps) => {
  const router = useRouter()
  const source = session.config?.source ?? 'camp_mode'
  const isEndurance = session.config?.isEnduranceSession ?? false

  // ── Compute core score ────────────────────────────────────────────────────
  const correctCount = interactions.filter(i => i.is_correct).length
  const totalCount = interactions.length
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const scoreBand = getScoreBand(percentage)
  const readinessDelta = readinessAfter - readinessBefore

  // ── Question review items ─────────────────────────────────────────────────
  const questionReviewItems = useMemo((): QuestionReviewItem[] =>
    interactions.map(i => {
      const q = i.questions
      const selectedOption = i.selected_option_id
        ? q.options.find(o => o.id === i.selected_option_id)
        : null
      const correctOption = q.options.find(o => o.id === q.correct_option_id)
      return {
        questionId: q.question_id,
        questionIndex: i.question_order,
        questionText: q.text,
        selectedOptionId: i.selected_option_id,
        selectedOptionText: selectedOption
          ? `${selectedOption.letter ? `[${selectedOption.letter}] ` : ''}${selectedOption.text}`
          : null,
        correctOptionId: q.correct_option_id,
        correctOptionText: correctOption
          ? `${correctOption.letter ? `[${correctOption.letter}] ` : ''}${correctOption.text}`
          : q.correct_option_id,
        isCorrect: i.is_correct,
        isFlagged: i.is_flagged,
        timeSpentMs: i.time_spent_ms,
        errorTags: (i.error_tags ?? []).filter(t => t in ERROR_TAG_LABELS) as QuestionReviewItem['errorTags'],
        rationale: q.rationale,
        codeCitation: q.code_citation,
        modelId: q.model_id,
        confidenceTag: i.confidence_tag,
      }
    }),
    [interactions]
  )

  // ── Node mastery deltas ───────────────────────────────────────────────────
  const nodeMasteryDeltas = useMemo((): NodeMasteryDelta[] => {
    if (!masterySnapshotAtStart) return []
    return masteryData.map(row => {
      const previousMastery = masterySnapshotAtStart[row.topic_id] ?? 0
      const currentMastery = row.current_mastery_weight
      return {
        nodeId: row.topic_id,
        nodeName: row.taxonomy_tree.name,
        aleId: row.taxonomy_tree.ale_id,
        previousMastery,
        currentMastery,
        pointDelta: Math.round((currentMastery - previousMastery) * 100),
        previousState: MASTERY_STATE(previousMastery),
        currentState: MASTERY_STATE(currentMastery),
      }
    }).filter(d => d.pointDelta !== 0)
  }, [masteryData, masterySnapshotAtStart])

  // ── Accuracy blocks (endurance only) ─────────────────────────────────────
  const accuracyBlocks = useMemo((): AccuracyBlock[] | null => {
    if (!isEndurance || interactions.length < BLOCK_SIZE) return null
    return buildAccuracyBlocks(interactions)
  }, [interactions, isEndurance])

  // ── Calibration ───────────────────────────────────────────────────────────
  const calibration = useMemo((): CalibrationResult | null => {
    const preConf = session.config?.preSessionConfidence
    if (!preConf?.length) return null
    return buildCalibration(interactions, preConf)
  }, [interactions, session.config])

  // ── Wrong question IDs ────────────────────────────────────────────────────
  const wrongQuestionIds = interactions
    .filter(i => !i.is_correct)
    .map(i => i.questions.question_id)

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRetryWrong = useCallback(() => {
    router.push(
      `/dashboard/testing/session/new?source=camp_mode&retryIds=${wrongQuestionIds.join(',')}`
    )
  }, [router, wrongQuestionIds])

  const handleNewSession = useCallback(() => {
    router.push('/dashboard/testing')
  }, [router])

  const handleBackToHub = useCallback(() => {
    router.push('/dashboard/testing')
  }, [router])

  return (
    <main
      className="max-w-[720px] mx-auto px-6 py-8"
      aria-label="Session debrief"
    >
      <div className="space-y-8">
        {/* 1. Score hero */}
        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        >
          <ScoreHero
            correct={correctCount}
            total={totalCount}
            percentage={percentage}
            scoreBand={scoreBand}
          />
        </div>

        {/* 2. Readiness delta */}
        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: '80ms', animationFillMode: 'both' }}
        >
          <ReadinessDelta
            before={readinessBefore}
            after={readinessAfter}
            delta={readinessDelta}
          />
        </div>

        {/* 3. Node mastery strip */}
        {nodeMasteryDeltas.length > 0 && (
          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: '160ms', animationFillMode: 'both' }}
          >
            <NodeMasteryStrip deltas={nodeMasteryDeltas} />
          </div>
        )}

        {/* 4. Question review */}
        {questionReviewItems.length > 0 && (
          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: '240ms', animationFillMode: 'both' }}
          >
            <QuestionReviewStrip
              items={questionReviewItems}
              onRetryWrong={handleRetryWrong}
            />
          </div>
        )}

        {/* 5. Calibration (conditional) */}
        {calibration && (
          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: '320ms', animationFillMode: 'both' }}
          >
            <CalibrationReveal calibration={calibration} />
          </div>
        )}

        {/* 6. Block accuracy chart (endurance only) */}
        {accuracyBlocks && (
          <div
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <BlockAccuracyChart blocks={accuracyBlocks} />
          </div>
        )}

        {/* 7. Actions */}
        <div
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: '480ms', animationFillMode: 'both' }}
        >
          <DebriefActions
            wrongCount={wrongQuestionIds.length}
            sessionSource={source}
            onRetryWrong={handleRetryWrong}
            onNewSession={handleNewSession}
            onBackToHub={handleBackToHub}
          />
        </div>
      </div>
    </main>
  )
}
