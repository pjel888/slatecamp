'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Clock,
  ArrowRight,
  ArrowCounterClockwise,
  SquaresFour,
  ChartBar,
  BookOpen,
  Flag,
  CheckCircle,
  XCircle,
  CaretDown,
  CaretUp,
  Scales,
  Swap,
  Timer,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'
import { getDebriefData } from '@/lib/actions/debrief'
import type { DebriefData } from '@/lib/actions/debrief'

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

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

const getScoreMessage = (score: number): string => {
  if (score >= 80) return "Strong session. You're locking this in."
  if (score >= 60) return 'Solid ground. A few gaps to close — check the breakdown below.'
  if (score >= 40) return "You found the edges of your knowledge. That's exactly the point."
  return 'Tough round. The explanations below are where the real learning happens.'
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-[#2D9F6F]'
  if (score >= 60) return 'text-[#D4951A]'
  return 'text-[#D64545]'
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
      const isCorrect = answers[q.question_id] === (q.correct_option_id ?? q.correct_answer)
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
      .filter((q) => answers[q.question_id] !== (q.correct_option_id ?? q.correct_answer))
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

  const readinessDelta = debrief
    ? Math.round(debrief.readinessAfter) - Math.round(debrief.readinessBefore)
    : null

  return (
    <div className='max-w-4xl mx-auto py-12 px-6'>
      {/* ── Score Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center mb-10'
      >
        <div className={cn('text-[36px] font-extrabold tabular-nums', getScoreColor(stats.score))}>
          {stats.correct} of {stats.total} correct — {stats.score}%
        </div>
        <p className='text-[#4A5568] mt-2 text-sm max-w-lg mx-auto'>
          {getScoreMessage(stats.score)}
        </p>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-10'>
        {/* Duration */}
        <div className='bg-white p-4 rounded-md border border-[#D4DAE3] text-center'>
          <SCIcon icon={Clock} size='sm' className='text-[#8896A7] mx-auto mb-1.5' />
          <div className='text-lg font-extrabold text-[#1A2332]'>
            {sessionDurationMs ? formatDuration(sessionDurationMs) : '—'}
          </div>
          <span className='text-[11px] text-[#8896A7] uppercase tracking-widest font-bold'>Duration</span>
        </div>

        {/* Avg time per Q */}
        <div className='bg-white p-4 rounded-md border border-[#D4DAE3] text-center'>
          <SCIcon icon={Timer} size='sm' className='text-[#8896A7] mx-auto mb-1.5' />
          <div className='text-lg font-extrabold text-[#1A2332]'>
            {debrief && debrief.avgTimeMs > 0 ? `${Math.round(debrief.avgTimeMs / 1000)}s` : sessionDurationMs && stats.total > 0 ? `${Math.round(sessionDurationMs / stats.total / 1000)}s` : '—'}
          </div>
          <span className='text-[11px] text-[#8896A7] uppercase tracking-widest font-bold'>Avg / Question</span>
        </div>

        {/* Readiness delta */}
        <div className='bg-white p-4 rounded-md border border-[#D4DAE3] text-center'>
          <SCIcon icon={ChartBar} size='sm' className='text-[#8896A7] mx-auto mb-1.5' />
          {debrief ? (
            <>
              <div className='text-lg font-extrabold text-[#1A2332]'>
                {Math.round(debrief.readinessBefore)}% → {Math.round(debrief.readinessAfter)}%
              </div>
              <span className={cn(
                'text-[11px] uppercase tracking-widest font-bold',
                readinessDelta !== null && readinessDelta > 0 ? 'text-[#2D9F6F]' : readinessDelta !== null && readinessDelta < 0 ? 'text-[#D64545]' : 'text-[#8896A7]',
              )}>
                {readinessDelta !== null && readinessDelta > 0 ? '+' : ''}{readinessDelta ?? 0} Readiness
              </span>
            </>
          ) : (
            <>
              <div className='text-lg font-extrabold text-[#2D9F6F]'>Updated</div>
              <span className='text-[11px] text-[#8896A7] uppercase tracking-widest font-bold'>Readiness</span>
            </>
          )}
        </div>

        {/* Answer changes */}
        <div className='bg-white p-4 rounded-md border border-[#D4DAE3] text-center'>
          <SCIcon icon={Swap} size='sm' className='text-[#8896A7] mx-auto mb-1.5' />
          <div className='text-lg font-extrabold text-[#1A2332]'>
            {debrief ? debrief.answerChangeCount : '—'}
          </div>
          <span className='text-[11px] text-[#8896A7] uppercase tracking-widest font-bold'>
            {debrief && debrief.answerChangeCount > 0
              ? `${debrief.answerChangesCorrect} turned correct`
              : 'Answer Changes'}
          </span>
        </div>
      </div>

      {/* ── Pacing Insight ──────────────────────────────────────────── */}
      {debrief && debrief.userHistoricalAvgTimeMs && debrief.avgTimeMs > 0 && (
        <div className='mb-8 p-4 bg-[#F8F7F5] border border-border rounded-md flex items-center gap-3'>
          <SCIcon
            icon={debrief.avgTimeMs < debrief.userHistoricalAvgTimeMs ? TrendDown : TrendUp}
            size='sm'
            className={debrief.avgTimeMs < debrief.userHistoricalAvgTimeMs ? 'text-[#2D9F6F]' : 'text-[#D4951A]'}
          />
          <p className='text-sm text-[#4A5568]'>
            {debrief.avgTimeMs < debrief.userHistoricalAvgTimeMs
              ? `You were faster than your average this session (${Math.round(debrief.avgTimeMs / 1000)}s vs ${Math.round(debrief.userHistoricalAvgTimeMs / 1000)}s typical).`
              : `You took more time per question this session (${Math.round(debrief.avgTimeMs / 1000)}s vs ${Math.round(debrief.userHistoricalAvgTimeMs / 1000)}s typical).`}
          </p>
        </div>
      )}

      {/* ── Calibration Section ─────────────────────────────────────── */}
      {preSessionConfidence && Object.keys(preSessionConfidence).length > 0 && (
        <CalibrationSection
          preSessionConfidence={preSessionConfidence}
          topicStats={stats.topicStats}
        />
      )}

      {/* ── Error Pattern Summary ──────────────────────────────────────── */}
      {debrief && <ErrorPatternSection interactions={debrief.interactions} />}

      {/* ── Subject Breakdown ────────────────────────────────────────── */}
      <div className='space-y-4 mb-10'>
        <h2 className='text-[11px] font-black uppercase tracking-[0.3em] text-[#8896A7]'>
          Topic Breakdown
        </h2>
        <div className='grid grid-cols-1 gap-3'>
          {Object.entries(stats.topicStats).map(([topicId, s]) => {
            const percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
            return (
              <div
                key={topicId}
                className='bg-white p-4 rounded-md border border-[#D4DAE3] flex items-center justify-between'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-md flex items-center justify-center border shrink-0',
                      percentage >= 75
                        ? 'bg-[#EDFAF4] border-[#2D9F6F]/20 text-[#2D9F6F]'
                        : percentage >= 50
                          ? 'bg-[#FEF8ED] border-[#D4951A]/20 text-[#D4951A]'
                          : 'bg-[#FDF0F0] border-[#D64545]/20 text-[#D64545]',
                    )}
                  >
                    <SCIcon icon={BookOpen} size='sm' />
                  </div>
                  <div className='min-w-0'>
                    <h4 className='text-sm font-bold text-[#1A2332] truncate'>{s.name}</h4>
                    <p className='text-[11px] text-[#8896A7] font-medium'>{s.correct}/{s.total} correct</p>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-24 h-1.5 bg-[#F8F7F5] rounded-full overflow-hidden border border-[#D4DAE3]/30 hidden sm:block'>
                    <div
                      className={cn(
                        'h-full rounded-full',
                        percentage >= 75 ? 'bg-[#2D9F6F]' : percentage >= 50 ? 'bg-[#D4951A]' : 'bg-[#D64545]',
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='text-sm font-extrabold text-[#1A2332] w-10 text-right'>{percentage}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Per-Question Review ──────────────────────────────────────── */}
      <div className='space-y-4 mb-10'>
        <h2 className='text-[11px] font-black uppercase tracking-[0.3em] text-[#8896A7]'>
          Question Review
        </h2>
        <div className='space-y-2'>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.question_id]
            const correctId = q.correct_option_id ?? q.correct_answer
            const isCorrect = userAnswer === correctId
            const options = (q.options as unknown as Choice[]) || []
            const userOption = options.find((o) => o.id === userAnswer)
            const correctOption = options.find((o) => o.id === correctId)
            const interaction = interactionMap[q.question_id]
            const isFlagged = interaction?.is_flagged
            const isExpanded = expandedQuestions.has(q.question_id)
            const topicName = debrief?.topicNames?.[q.topic_id] || ''
            const timeMs = interaction?.time_spent_ms

            return (
              <div key={q.question_id} className='bg-white border border-[#D4DAE3] rounded-md overflow-hidden'>
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(q.question_id)}
                  className='w-full flex items-center gap-3 p-4 text-left hover:bg-[#F8F7F5]/50 transition-colors'
                >
                  <span className='text-[11px] font-bold text-[#8896A7] w-6 shrink-0'>
                    {idx + 1}
                  </span>
                  <SCIcon
                    icon={isCorrect ? CheckCircle : XCircle}
                    size='sm'
                    weight='fill'
                    className={isCorrect ? 'text-[#2D9F6F] shrink-0' : 'text-[#D64545] shrink-0'}
                  />
                  <span className='text-sm text-[#1A2332] flex-1 truncate'>{q.text}</span>
                  <div className='flex items-center gap-2 shrink-0'>
                    {isFlagged && <SCIcon icon={Flag} size='xs' weight='fill' className='text-[#D4951A]' />}
                    {timeMs && timeMs > 0 && (
                      <span className='text-[11px] text-[#8896A7] font-medium tabular-nums'>
                        {Math.round(timeMs / 1000)}s
                      </span>
                    )}
                    {topicName && (
                      <span className='hidden md:block text-[11px] text-[#8896A7] bg-[#F8F7F5] px-2 py-0.5 rounded-sm max-w-[120px] truncate'>
                        {topicName}
                      </span>
                    )}
                    <SCIcon icon={isExpanded ? CaretUp : CaretDown} size='xs' className='text-[#8896A7]' />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className='px-4 pb-4 pt-0 border-t border-border/50 space-y-3'>
                    <div className='ml-9 space-y-2'>
                      {/* User's answer */}
                      <div className='flex items-start gap-2'>
                        <span className='text-[11px] font-bold uppercase tracking-wider text-[#8896A7] w-20 shrink-0 pt-0.5'>
                          Your answer
                        </span>
                        <span className={cn('text-sm', isCorrect ? 'text-[#2D9F6F]' : 'text-[#D64545]')}>
                          {userOption?.text || 'No answer'}
                        </span>
                      </div>
                      {/* Correct answer (if wrong) */}
                      {!isCorrect && correctOption && (
                        <div className='flex items-start gap-2'>
                          <span className='text-[11px] font-bold uppercase tracking-wider text-[#8896A7] w-20 shrink-0 pt-0.5'>
                            Correct
                          </span>
                          <span className='text-sm text-[#2D9F6F] font-medium'>{correctOption.text}</span>
                        </div>
                      )}
                      {/* Rationale */}
                      {!isCorrect && q.rationale && (
                        <div className='mt-2 p-3 bg-[#EEF2FC] border border-primary/10 rounded-md'>
                          <p className='text-[13px] text-[#4A5568] leading-relaxed'>{q.rationale}</p>
                          {q.code_citation && (
                            <div className='flex items-center gap-1.5 mt-2 text-[12px] text-[#4A5568]'>
                              <SCIcon icon={Scales} size='xs' className='text-[#8896A7]' />
                              {q.code_citation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Retry Wrong Answers ──────────────────────────────────────── */}
      {stats.wrongQuestionIds.length > 0 && onRetryWrongAnswers && (
        <div className='mb-10 p-5 bg-[#EEF2FC] border border-[#1B3FC4]/20 rounded-md'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-md bg-white border border-[#1B3FC4]/10 flex items-center justify-center shrink-0'>
                <SCIcon icon={ArrowCounterClockwise} size='md' className='text-primary' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-[#1A2332]'>
                  Retry missed questions
                </h3>
                <p className='text-sm text-[#4A5568] mt-0.5'>
                  {stats.wrongQuestionIds.length} question{stats.wrongQuestionIds.length !== 1 ? 's' : ''} to revisit.
                  Retrieval practice on missed items produces the strongest memory consolidation.
                </p>
              </div>
            </div>
            <button
              onClick={() => onRetryWrongAnswers(stats.wrongQuestionIds)}
              className='w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-sm font-semibold text-sm hover:bg-[#1535A8] transition-all flex items-center justify-center gap-2 group whitespace-nowrap'
            >
              Retry {stats.wrongQuestionIds.length} Questions
              <SCIcon icon={ArrowRight} size='sm' className='group-hover:translate-x-0.5 transition-transform' />
            </button>
          </div>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className='pt-8 border-t border-[#D4DAE3] grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Button
          onClick={onExit}
          variant='outline'
          className='h-14 rounded-sm border-[#D4DAE3] text-[#4A5568] hover:bg-[#F8F7F5] font-bold uppercase tracking-widest text-[11px] gap-2'
        >
          <SCIcon icon={SquaresFour} size='sm' />
          Back to Testing Hub
        </Button>
        <Button
          onClick={onRestart}
          className='h-14 rounded-sm bg-primary hover:bg-[#1535A8] text-white font-bold uppercase tracking-widest text-[11px] gap-2'
        >
          <SCIcon icon={ArrowCounterClockwise} size='sm' />
          Start New Session
        </Button>
      </div>
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
  overconfident: 'text-[#E8853A]',
  underconfident: 'text-[#1B3FC4]',
  well_calibrated: 'text-[#1B7A3C]',
}

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

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
      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8896A7]">
        Your Calibration
      </h2>
      <div className="bg-white border border-[#D4DAE3] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D4DAE3] bg-[#F8F7F5]">
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8896A7]">Subject</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8896A7]">Predicted</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8896A7]">Actual</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8896A7]">Calibration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subject} className="border-b border-[#D4DAE3] last:border-b-0">
                <td className="px-4 py-3 font-medium text-[#1A2332]">{row.subject}</td>
                <td className="px-4 py-3 text-[#4A5568]">{CONFIDENCE_LABELS[row.predicted] ?? '—'}</td>
                <td className="px-4 py-3 text-[#4A5568]">{row.actualPct !== null ? `${row.actualPct}%` : '—'}</td>
                <td className={cn('px-4 py-3 font-medium', row.calibration ? CALIBRATION_COLORS[row.calibration] : 'text-[#8896A7]')}>
                  {row.calibration ? CALIBRATION_LABELS[row.calibration] : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-[#4A5568] leading-relaxed max-w-[60ch]">
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
      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8896A7]">
        Error Patterns ({tagged.length} wrong answers tagged)
      </h2>
      <div className="bg-white border border-[#D4DAE3] rounded-md p-4 space-y-3">
        {sorted.map(([type, count]) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm text-[#1A2332]">
              {ERROR_TYPE_LABELS[type] ?? type}
            </span>
            <span className="text-sm font-bold text-[#4A5568]">
              {count} answer{count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
        {dominant && ERROR_TYPE_INSIGHTS[dominant] && (
          <div className="pt-3 border-t border-[#D4DAE3]">
            <p className="text-[13px] text-[#4A5568] leading-relaxed">
              → {ERROR_TYPE_INSIGHTS[dominant]}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
