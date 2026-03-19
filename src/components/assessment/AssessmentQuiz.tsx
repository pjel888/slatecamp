'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'
import {
  getSessionQuestions,
  createQuizSession,
  saveInteraction,
  updateQuizSession,
} from '@/lib/actions/quiz'
import { completeAssessment } from '@/lib/actions/assessment'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AssessmentQuizProps {
  questionIds: string[]
  disciplineId: string
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AssessmentQuiz = ({ questionIds, disciplineId }: AssessmentQuizProps) => {
  const router = useRouter()

  // ── State ───────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  const questionStartRef = useRef<number>(Date.now())

  // ── Initialize session on mount ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        const [fetchedQuestions, session] = await Promise.all([
          getSessionQuestions(questionIds),
          createQuizSession({
            discipline_id: disciplineId,
            test_mode: 'camp',
            question_ids: questionIds,
            config: {
              isAssessment: true,
              showTimer: false,
              showFeedback: false,
            },
          }),
        ])

        if (cancelled) return

        sessionIdRef.current = session.session_id
        setQuestions(fetchedQuestions)
        setLoading(false)
        questionStartRef.current = Date.now()
      } catch (err) {
        if (cancelled) return
        console.error('Failed to initialize assessment:', err)
        setError('Something went wrong loading the assessment. Please try again.')
        setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [questionIds, disciplineId])

  // ── Derived values ──────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []
  const selectedOptionId = currentQuestion ? answers.get(currentQuestion.question_id) ?? null : null
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === questions.length - 1
  const totalQuestions = questions.length

  // Track subject transitions
  const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
  const isSubjectTransition =
    currentQuestion &&
    previousQuestion &&
    currentQuestion.topic_id !== previousQuestion.topic_id

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelect = useCallback((optionId: string) => {
    if (!currentQuestion || completing) return
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(currentQuestion.question_id, optionId)
      return next
    })
  }, [currentQuestion, completing])

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      questionStartRef.current = Date.now()
    }
  }, [currentIndex, totalQuestions])

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      questionStartRef.current = Date.now()
    }
  }, [currentIndex])

  const handleComplete = useCallback(async () => {
    if (!sessionIdRef.current || completing) return
    setCompleting(true)

    try {
      const sessionId = sessionIdRef.current

      // Save all interactions in parallel batches
      const interactions = questions.map((q) => {
        const selected = answers.get(q.question_id) ?? null
        const correctId = q.correct_option_id ?? (q as any).correct_answer
        const isCorrect = selected === correctId

        return saveInteraction({
          session_id: sessionId,
          question_id: q.question_id,
          topic_id: q.topic_id,
          selected_option_id: selected,
          is_correct: isCorrect,
          time_spent_ms: 0, // Assessment does not track per-question time
        })
      })

      await Promise.all(interactions)

      // Mark session completed
      await updateQuizSession(sessionId, { status: 'completed' })

      // Complete assessment scoring
      await completeAssessment(sessionId)

      router.push('/dashboard/score-reveal')
    } catch (err) {
      console.error('Failed to complete assessment:', err)
      setError('Something went wrong submitting the assessment. Please try again.')
      setCompleting(false)
    }
  }, [questions, answers, completing, router])

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1B3FC4] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#4A5568] text-sm font-medium">
            Preparing your assessment...
          </p>
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6">
        <div className="bg-white rounded-md p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-[#D64545] text-sm font-medium">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="h-10 px-6 rounded-sm bg-[#1B3FC4] text-white text-sm font-semibold hover:bg-[#1535A8] transition-colors duration-150 ease-out"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 bg-white border-b border-[#D4DAE3] px-5 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-[#1A2332] text-sm font-semibold tracking-tight">
            Assessment
          </span>
          <span className="text-[#4A5568] text-sm tabular-nums">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-[#D4DAE3]/40">
        <div
          className="h-full bg-[#1B3FC4] transition-all duration-150 ease-out"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
          {/* Framing text on first question */}
          {isFirstQuestion && (
            <div className="bg-[#EEF2FC] rounded-md px-4 py-3">
              <p className="text-[#1A2332] text-sm leading-relaxed">
                This is not a test — it's a diagnostic to understand where you stand.
                Answer each question to the best of your ability.
              </p>
            </div>
          )}

          {/* Subject transition label */}
          {isSubjectTransition && currentQuestion.subject_id && (
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-[#D4DAE3]" />
              <span className="text-[11px] font-medium text-[#8896A7] uppercase tracking-wider shrink-0">
                New subject area
              </span>
              <div className="h-px flex-1 bg-[#D4DAE3]" />
            </div>
          )}

          {/* Question text */}
          <div key={currentQuestion.question_id} className="animate-in fade-in duration-100">
            <p className="text-[#1A2332] text-base leading-relaxed font-medium">
              {currentQuestion.text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
            {options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id
              const letter = String.fromCharCode(65 + idx)

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  disabled={completing}
                  className={cn(
                    'w-full text-left rounded-md border px-4 py-3.5 transition-all duration-150 ease-out',
                    'flex items-start gap-3',
                    'shadow-none hover:shadow-sm',
                    isSelected
                      ? 'border-[#1B3FC4] bg-[#EEF2FC]'
                      : 'border-[#D4DAE3] bg-white hover:border-[#1B3FC4]/40',
                    completing && 'opacity-60 cursor-not-allowed',
                  )}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span
                    className={cn(
                      'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-150 ease-out',
                      isSelected
                        ? 'bg-[#1B3FC4] text-white'
                        : 'bg-[#F8F7F5] text-[#4A5568] border border-[#D4DAE3]',
                    )}
                  >
                    {letter}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-relaxed pt-0.5',
                      isSelected ? 'text-[#1A2332] font-medium' : 'text-[#4A5568]',
                    )}
                  >
                    {option.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="shrink-0 bg-white border-t border-[#D4DAE3] px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={isFirstQuestion || completing}
            className={cn(
              'h-10 px-5 rounded-sm text-sm font-semibold transition-colors duration-150 ease-out',
              isFirstQuestion || completing
                ? 'text-[#8896A7] cursor-not-allowed'
                : 'text-[#4A5568] hover:text-[#1A2332] hover:bg-[#F8F7F5]',
            )}
          >
            &larr; Previous
          </button>

          {/* Next / Complete button */}
          {isLastQuestion ? (
            <button
              onClick={handleComplete}
              disabled={completing || !selectedOptionId}
              className={cn(
                'h-10 px-6 rounded-sm text-sm font-semibold transition-colors duration-150 ease-out',
                completing || !selectedOptionId
                  ? 'bg-[#D4DAE3] text-[#8896A7] cursor-not-allowed'
                  : 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]',
              )}
            >
              {completing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Completing...
                </span>
              ) : (
                'Complete Assessment'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedOptionId || completing}
              className={cn(
                'h-10 px-6 rounded-sm text-sm font-semibold transition-colors duration-150 ease-out',
                !selectedOptionId || completing
                  ? 'bg-[#D4DAE3] text-[#8896A7] cursor-not-allowed'
                  : 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]',
              )}
            >
              Next &rarr;
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
