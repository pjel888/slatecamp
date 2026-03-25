'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { getCorrectOptionId } from '@/lib/utils/question'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/app'
import { getDebriefData } from '@/lib/actions/debrief'
import type { DebriefData } from '@/lib/actions/debrief'
import { Card } from '@/components/ui/card'

import { ScoreHero } from './results/ScoreHero'
import { StatCards, PacingInsight } from './results/StatCards'
import { TopicBreakdown } from './results/TopicBreakdown'
import { QuestionReviewList } from './results/QuestionReviewList'
import { RetryWrongAnswers, ResultsActions } from './results/ResultsActions'

interface ResultsSummaryProps {
  questions: Question[]
  answers: Record<string, string>
  onExit: () => void
  onRestart: () => void
  testMode: string
  sessionId?: string
  sessionDurationMs?: number
  previousAverageScore?: number
  preSessionConfidence?: Record<string, number>
  onStartFocusedReview?: (topicIds: string[]) => void
  onRetryWrongAnswers?: (questionIds: string[]) => void
}

export function ResultsSummary({
  questions,
  answers,
  onExit,
  onRestart,
  testMode,
  sessionId,
  sessionDurationMs,
  preSessionConfidence,
  onStartFocusedReview,
  onRetryWrongAnswers,
}: ResultsSummaryProps) {
  const [debrief, setDebrief] = useState<DebriefData | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (sessionId) {
      getDebriefData(sessionId).then(setDebrief)
    }
  }, [sessionId])

  const stats = useMemo(() => {
    const total = questions.length
    let correct = 0
    const topicStats: Record<string, { total: number; correct: number; name: string }> = {}

    questions.forEach((q) => {
      const isCorrect = answers[q.question_id] === getCorrectOptionId(q)
      if (isCorrect) correct++

      const topicId = q.topic_id || 'general'
      const topicName = debrief?.topicNames?.[topicId] || q.subject_id || 'General'
      if (!topicStats[topicId]) {
        topicStats[topicId] = { total: 0, correct: 0, name: topicName }
      }
      topicStats[topicId].total++
      if (isCorrect) topicStats[topicId].correct++
    })

    const score = total > 0 ? Math.round((correct / total) * 100) : 0

    const wrongQuestionIds = questions
      .filter((q) => answers[q.question_id] !== getCorrectOptionId(q))
      .map((q) => q.question_id)

    return { total, correct, score, topicStats, wrongQuestionIds }
  }, [questions, answers, debrief?.topicNames])

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  // Interaction lookup
  const interactionMap = useMemo(() => {
    if (!debrief) return {}
    return Object.fromEntries(debrief.interactions.map((i) => [i.question_id, i]))
  }, [debrief])

  return (
    <div className='max-w-4xl mx-auto py-12 px-6'>
      <ScoreHero correct={stats.correct} total={stats.total} score={stats.score} />

      <StatCards sessionDurationMs={sessionDurationMs} total={stats.total} debrief={debrief} />

      {debrief && <PacingInsight debrief={debrief} />}

      {preSessionConfidence && Object.keys(preSessionConfidence).length > 0 && (
        <CalibrationSection
          preSessionConfidence={preSessionConfidence}
          topicStats={stats.topicStats}
        />
      )}

      {debrief && <ErrorPatternSection interactions={debrief.interactions} />}

      <TopicBreakdown topicStats={stats.topicStats} />

      <QuestionReviewList
        questions={questions}
        answers={answers}
        expandedQuestions={expandedQuestions}
        onToggleExpand={toggleExpand}
        interactionMap={interactionMap}
        topicNames={debrief?.topicNames}
      />

      {stats.wrongQuestionIds.length > 0 && onRetryWrongAnswers && (
        <RetryWrongAnswers
          wrongQuestionIds={stats.wrongQuestionIds}
          onRetryWrongAnswers={onRetryWrongAnswers}
        />
      )}

      <ResultsActions onExit={onExit} onRestart={onRestart} />
    </div>
  )
}

// ── Calibration Section ───────────────────────────────────────────────────

type CalibrationState = 'overconfident' | 'underconfident' | 'well_calibrated'

const getCalibration = (predicted: number, actualPct: number): CalibrationState => {
  if (predicted === 3 && actualPct < 60) return 'overconfident'
  if (predicted === 1 && actualPct > 60) return 'underconfident'
  return 'well_calibrated'
}

const CALIBRATION_LABELS: Record<CalibrationState, string> = {
  overconfident: 'Overconfident',
  underconfident: 'Underconfident (pleasant surprise)',
  well_calibrated: 'Well calibrated',
}

const CALIBRATION_COLORS: Record<CalibrationState, string> = {
  overconfident: 'text-camp-orange',
  underconfident: 'text-camp-cobalt',
  well_calibrated: 'text-camp-green',
}

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

// TODO: extract CalibrationSection to results/ when it gains more complexity
const CalibrationSection = ({
  preSessionConfidence,
  topicStats,
}: {
  preSessionConfidence: Record<string, number>
  topicStats: Record<string, { total: number; correct: number; name: string }>
}) => {
  // Match confidence ratings to actual per-subject performance
  const rows = Object.entries(preSessionConfidence).map(([subject, predicted]) => {
    // Find a matching topic stat by name
    const matchingTopic = Object.values(topicStats).find(
      (t) => t.name === subject,
    )
    // Also try matching by subject as topic ID key
    const topicStat = matchingTopic || topicStats[subject]

    const actualPct = topicStat && topicStat.total > 0
      ? Math.round((topicStat.correct / topicStat.total) * 100)
      : null

    const calibration = actualPct !== null ? getCalibration(predicted, actualPct) : null

    return { subject, predicted, actualPct, calibration }
  })

  // Only show if we have at least one matchable row
  const hasData = rows.some((r) => r.actualPct !== null)
  if (!hasData) return null

  return (
    <div className="space-y-4 mb-10">
      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary">
        Your Calibration
      </h2>
      <div className="bg-white border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Subject</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Predicted</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Actual</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Calibration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subject} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-text-primary">{row.subject}</td>
                <td className="px-4 py-3 text-text-secondary">{CONFIDENCE_LABELS[row.predicted] ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{row.actualPct !== null ? `${row.actualPct}%` : '—'}</td>
                <td className={cn('px-4 py-3 font-medium', row.calibration ? CALIBRATION_COLORS[row.calibration] : 'text-text-tertiary')}>
                  {row.calibration ? CALIBRATION_LABELS[row.calibration] : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed max-w-[60ch]">
        The gap between prediction and performance is where hidden risk lives. Calibration improves with practice.
      </p>
    </div>
  )
}

// ── Error Pattern Section ─────────────────────────────────────────────────

const ERROR_TYPE_LABELS: Record<string, string> = {
  knowledge_gap: 'Knowledge gap',
  misread: 'Misread question',
  distractor: 'Distractor confusion',
  code_version: 'Code confusion',
  time_pressure: 'Time pressure',
}

const ERROR_TYPE_INSIGHTS: Record<string, string> = {
  knowledge_gap: 'These topics need more study time. Consider a focused Camp Trail.',
  misread: 'Slow down on question reading. The exam often uses double negatives.',
  distractor: 'Review the comparison between these similar code provisions.',
  code_version: 'Check: are you studying the latest code amendments?',
  time_pressure: 'Your pacing may need adjustment. Extended practice sessions can help.',
}

// TODO: extract ErrorPatternSection to results/ when it gains more complexity
const ErrorPatternSection = ({
  interactions,
}: {
  interactions: Array<{ error_type: string | null }>
}) => {
  const tagged = interactions.filter((i) => i.error_type)
  if (tagged.length < 3) return null

  // Group by error_type
  const counts: Record<string, number> = {}
  tagged.forEach((i) => {
    if (i.error_type) {
      counts[i.error_type] = (counts[i.error_type] || 0) + 1
    }
  })

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
  const dominant = sorted[0]?.[0]

  return (
    <div className="space-y-4 mb-10">
      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary">
        Error Patterns ({tagged.length} wrong answers tagged)
      </h2>
      <Card className="space-y-3">
        {sorted.map(([type, count]) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm text-text-primary">
              {ERROR_TYPE_LABELS[type] ?? type}
            </span>
            <span className="text-sm font-bold text-text-secondary">
              {count} answer{count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
        {dominant && ERROR_TYPE_INSIGHTS[dominant] && (
          <div className="pt-3 border-t border-border">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              → {ERROR_TYPE_INSIGHTS[dominant]}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
