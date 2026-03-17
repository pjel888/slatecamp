'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Clock,
  ArrowRight,
  ArrowCounterClockwise,
  SquaresFour,
  ChartBar,
  BookOpen,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'

interface ResultsSummaryProps {
  questions: Question[]
  answers: Record<string, string>
  onExit: () => void
  onRestart: () => void
  testMode: string
  sessionDurationMs?: number
  previousAverageScore?: number
  onStartFocusedReview?: (topicIds: string[]) => void
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

export function ResultsSummary({
  questions,
  answers,
  onExit,
  onRestart,
  testMode,
  sessionDurationMs,
  previousAverageScore,
  onStartFocusedReview,
}: ResultsSummaryProps) {
  const stats = useMemo(() => {
    const total = questions.length
    let correct = 0
    const subjectStats: Record<string, { total: number; correct: number }> = {}

    questions.forEach((q) => {
      const isCorrect =
        answers[q.question_id] === (q.correct_option_id ?? q.correct_answer)
      if (isCorrect) correct++

      const subject = q.subject_id || 'General'
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, correct: 0 }
      }
      subjectStats[subject].total++
      if (isCorrect) subjectStats[subject].correct++
    })

    const score = Math.round((correct / total) * 100)

    const masteryLabel =
      score >= 75 ? 'Mastered' : score >= 50 ? 'Developing' : 'Keep Practicing'

    const masteryColor =
      score >= 75
        ? 'text-[#2D9F6F]'
        : score >= 50
          ? 'text-[#D4951A]'
          : 'text-[#D64545]'

    // Find weakest subject
    const subjectEntries = Object.entries(subjectStats)
    const weakestSubject =
      subjectEntries.length > 0
        ? subjectEntries.reduce(
            (worst, [name, data]) => {
              const pct = data.total > 0 ? data.correct / data.total : 1
              const worstPct =
                worst.data.total > 0 ? worst.data.correct / worst.data.total : 1
              return pct < worstPct ? { name, data } : worst
            },
            { name: subjectEntries[0][0], data: subjectEntries[0][1] },
          )
        : null

    // Collect topic IDs for the weakest subject's wrong answers
    const weakestTopicIds = weakestSubject
      ? questions
          .filter(
            (q) =>
              (q.subject_id || 'General') === weakestSubject.name &&
              answers[q.question_id] !==
                (q.correct_option_id ?? q.correct_answer),
          )
          .map((q) => q.topic_id)
          .filter((id, i, arr) => arr.indexOf(id) === i)
      : []

    const scoreDelta =
      previousAverageScore !== undefined ? score - previousAverageScore : null

    return {
      total,
      correct,
      score,
      subjectStats,
      masteryLabel,
      masteryColor,
      weakestSubject,
      weakestTopicIds,
      scoreDelta,
    }
  }, [questions, answers, previousAverageScore])

  const avgTimePerQ =
    sessionDurationMs && questions.length > 0
      ? Math.round(sessionDurationMs / questions.length / 1000)
      : null

  return (
    <div className='max-w-4xl mx-auto py-12 px-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center mb-12'
      >
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-md bg-[#EEF2FC] text-primary mb-6 border border-primary/10'>
          <SCIcon icon={Target} size='xl' />
        </div>
        <h1 className='text-2xl font-extrabold text-[#1A2332] tracking-tight'>
          Session Complete
        </h1>
        <p className='text-[#4A5568] mt-2'>
          Here&apos;s a look at what you covered in your {testMode} session.
        </p>
      </motion.div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
        {/* Score */}
        <div className='bg-white p-6 rounded-md border border-[#D4DAE3] flex flex-col items-center'>
          <div className='text-[#8896A7] mb-2 flex items-center gap-2'>
            <SCIcon icon={Target} size='sm' />
            <span className='text-[11px] font-black uppercase tracking-widest'>
              Accuracy
            </span>
          </div>
          <div className='text-3xl font-extrabold text-[#1A2332]'>
            {stats.score}%
          </div>
          {stats.scoreDelta !== null ? (
            <div
              className={cn(
                'text-[11px] mt-1 font-bold',
                stats.scoreDelta > 0
                  ? 'text-[#2D9F6F]'
                  : stats.scoreDelta < 0
                    ? 'text-[#D64545]'
                    : 'text-[#8896A7]',
              )}
            >
              {stats.scoreDelta > 0 ? '+' : ''}
              {stats.scoreDelta} pts vs your average
            </div>
          ) : (
            <div className='text-[11px] text-[#8896A7] mt-1 uppercase tracking-widest font-bold'>
              {stats.correct} / {stats.total} Correct
            </div>
          )}
        </div>

        {/* Mastery */}
        <div className='bg-white p-6 rounded-md border border-[#D4DAE3] flex flex-col items-center'>
          <div className='text-[#8896A7] mb-2 flex items-center gap-2'>
            <SCIcon icon={Clock} size='sm' />
            <span className='text-[11px] font-black uppercase tracking-widest'>
              Status
            </span>
          </div>
          <div className={`text-xl font-extrabold uppercase ${stats.masteryColor}`}>
            {stats.masteryLabel}
          </div>
          <div className='text-[11px] text-[#8896A7] mt-1 uppercase tracking-widest font-bold'>
            IRT Adjusted
          </div>
        </div>

        {/* Time */}
        <div className='bg-white p-6 rounded-md border border-[#D4DAE3] flex flex-col items-center'>
          <div className='text-[#8896A7] mb-2 flex items-center gap-2'>
            <SCIcon icon={ChartBar} size='sm' />
            <span className='text-[11px] font-black uppercase tracking-widest'>
              Time
            </span>
          </div>
          {sessionDurationMs ? (
            <>
              <div className='text-xl font-extrabold text-[#1A2332]'>
                {formatDuration(sessionDurationMs)}
              </div>
              {avgTimePerQ !== null && (
                <div className='text-[11px] text-[#8896A7] mt-1 uppercase tracking-widest font-bold'>
                  ~{avgTimePerQ}s / question
                </div>
              )}
            </>
          ) : (
            <>
              <div className='text-xl font-extrabold text-[#2D9F6F] uppercase'>
                Updated
              </div>
              <div className='text-[11px] text-[#8896A7] mt-1 uppercase tracking-widest font-bold'>
                EMA Recalculated
              </div>
            </>
          )}
        </div>
      </div>

      <div className='space-y-6'>
        <h2 className='text-[11px] font-black uppercase tracking-[0.3em] text-[#8896A7] mb-4'>
          Subject Breakdown
        </h2>
        <div className='grid grid-cols-1 gap-4'>
          {Object.entries(stats.subjectStats).map(([subject, s]) => {
            const percentage = Math.round((s.correct / s.total) * 100)
            return (
              <div
                key={subject}
                className='bg-white p-5 rounded-md border border-[#D4DAE3] flex items-center justify-between'
              >
                <div className='flex items-center gap-4'>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-md flex items-center justify-center border',
                      percentage >= 75
                        ? 'bg-[#EDFAF4] border-[#2D9F6F]/20 text-[#2D9F6F]'
                        : percentage >= 50
                          ? 'bg-[#FEF8ED] border-[#D4951A]/20 text-[#D4951A]'
                          : 'bg-[#FDF0F0] border-[#D64545]/20 text-[#D64545]',
                    )}
                  >
                    <SCIcon icon={BookOpen} size='md' />
                  </div>
                  <div>
                    <h4 className='text-sm font-bold text-[#1A2332]'>
                      {subject}
                    </h4>
                    <p className='text-[11px] text-[#8896A7] uppercase tracking-widest font-bold'>
                      {s.correct}/{s.total} Correct
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-6'>
                  <div className='w-32 h-1.5 bg-[#F8F7F5] rounded-full overflow-hidden border border-[#D4DAE3]/30 hidden sm:block'>
                    <div
                      className={cn(
                        'h-full transition-all duration-200 ease-out rounded-full',
                        percentage >= 75
                          ? 'bg-[#2D9F6F]'
                          : percentage >= 50
                            ? 'bg-[#D4951A]'
                            : 'bg-[#D64545]',
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='text-sm font-extrabold text-[#1A2332] w-10 text-right'>
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {stats.weakestSubject &&
        Math.round(
          (stats.weakestSubject.data.correct /
            stats.weakestSubject.data.total) *
            100,
        ) < 75 && (
          <div className='mt-8 p-5 bg-[#EEF2FC] border border-[#1B3FC4]/20 rounded-md'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 rounded-md bg-white border border-[#1B3FC4]/10 flex items-center justify-center shrink-0'>
                  <SCIcon icon={Target} size='md' className='text-primary' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-[#1A2332]'>
                    Area to Revisit
                  </h3>
                  <p className='text-sm text-[#4A5568] mt-0.5'>
                    <span className='font-bold text-[#1A2332]'>
                      {stats.weakestSubject.name}
                    </span>{' '}
                    had the lowest accuracy at{' '}
                    {Math.round(
                      (stats.weakestSubject.data.correct /
                        stats.weakestSubject.data.total) *
                        100,
                    )}
                    %. A focused session could strengthen this area.
                  </p>
                </div>
              </div>
              {onStartFocusedReview && stats.weakestTopicIds.length > 0 && (
                <button
                  onClick={() => onStartFocusedReview(stats.weakestTopicIds)}
                  className='w-full sm:w-auto px-5 py-2.5 bg-[#E8853A] text-white rounded-sm font-semibold text-sm hover:brightness-90 transition-all flex items-center justify-center gap-2 group whitespace-nowrap'
                >
                  Start Focused Review
                  <SCIcon
                    icon={ArrowRight}
                    size='sm'
                    className='group-hover:translate-x-0.5 transition-transform'
                  />
                </button>
              )}
            </div>
          </div>
        )}

      <div className='mt-12 pt-12 border-t border-[#D4DAE3] grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Button
          onClick={onExit}
          variant='outline'
          className='h-14 rounded-sm border-[#D4DAE3] text-[#4A5568] hover:bg-[#F8F7F5] font-bold uppercase tracking-widest text-[11px] gap-2'
        >
          <SCIcon icon={SquaresFour} size='sm' />
          Back to Dashboard
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
