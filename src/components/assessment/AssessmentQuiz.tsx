'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getCorrectOptionId } from '@/lib/utils/question'
import type { Question, Choice } from '@/types/app'
import {
  getSessionQuestions,
  createQuizSession,
  saveInteraction,
  updateQuizSession,
} from '@/lib/actions/quiz'
import { completeAssessment } from '@/lib/actions/assessment'
import { Skeleton } from '@/components/ui/skeleton'

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
  const [calculatingScore, setCalculatingScore] = useState(false)
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
        const correctId = getCorrectOptionId(q)
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

      // UX Strategy: "Calculating your Readiness Score..." — 2-3 second
      // intentional pause even if computation is instant, creates ceremonial weight
      setCalculatingScore(true)
      await new Promise((resolve) => setTimeout(resolve, 2500))

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
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <div className="shrink-0 h-16 bg-white border-b border-border" />
        <div className="shrink-0 h-1 bg-border/40" />
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-2xl px-5 py-8 space-y-6">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6">
        <div className="bg-white rounded-md p-6 max-w-sm w-full text-center space-y-4">
          <p className="text-destructive text-sm font-medium">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="h-10 px-6 rounded-sm bg-camp-cobalt text-white text-sm font-semibold hover:bg-[#1535A8] transition-colors duration-150 ease-out"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Calculating Score screen (UX Strategy: 2-3s ceremonial pause) ──────
  if (calculatingScore) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F5F5]">
        <div className="w-full max-w-xs space-y-4 px-4">
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
          <div className="pt-2 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 bg-white border-b border-border px-5 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-text-primary text-sm font-semibold tracking-tight">
            Assessment
          </span>
          <span className="text-text-secondary text-sm tabular-nums">
            Your score is building &middot; {currentIndex + 1} of {totalQuestions}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-border/40">
        <div
          className="h-full bg-camp-cobalt transition-all duration-150 ease-out"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
          {/* Framing text on first question */}
          {isFirstQuestion && (
            <div className="bg-[#EEF2FC] rounded-md px-4 py-3">
              <p className="text-text-primary text-sm leading-relaxed">
                This is not a test — it's a diagnostic to understand where you stand.
                Answer each question to the best of your ability.
              </p>
            </div>
          )}

          {/* Subject transition label */}
          {isSubjectTransition && currentQuestion.subject_id && (
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider shrink-0">
                New subject area
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {/* Question text */}
          <div key={currentQuestion.question_id} className="animate-in fade-in duration-100">
            <p className="text-text-primary text-base leading-relaxed font-medium">
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
                      ? 'border-camp-cobalt bg-[#EEF2FC]'
                      : 'border-border bg-white hover:border-camp-cobalt/40',
                    completing && 'opacity-60 cursor-not-allowed',
                  )}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span
                    className={cn(
                      'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-150 ease-out',
                      isSelected
                        ? 'bg-camp-cobalt text-white'
                        : 'bg-[#F5F5F5] text-text-secondary border border-border',
                    )}
                  >
                    {letter}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-relaxed pt-0.5',
                      isSelected ? 'text-text-primary font-medium' : 'text-text-secondary',
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
      <footer className="shrink-0 bg-white border-t border-border px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={isFirstQuestion || completing}
            className={cn(
              'h-10 px-5 rounded-sm text-sm font-semibold transition-colors duration-150 ease-out',
              isFirstQuestion || completing
                ? 'text-text-tertiary cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-[#F5F5F5]',
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
                  ? 'bg-border text-text-tertiary cursor-not-allowed'
                  : 'bg-camp-cobalt text-white hover:bg-[#1535A8]',
              )}
            >
              {completing ? (
                <span className="flex items-center gap-2">
                  {/* Spinner: inline button loading */}
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
                  ? 'bg-border text-text-tertiary cursor-not-allowed'
                  : 'bg-camp-cobalt text-white hover:bg-[#1535A8]',
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
