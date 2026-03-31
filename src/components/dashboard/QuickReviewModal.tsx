'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Check, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ConfidenceInput } from '@/components/quiz-v2/ConfidenceInput'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import { FeedbackPanel } from '@/components/quiz-v2/FeedbackPanel'
import { getPrequestions } from '@/lib/actions/wiki/get-prequestions'
import { submitPrequestion } from '@/lib/actions/wiki/submit-prequestion'
import { dismissEmptyTopic as dismissEmptyTopicAction } from '@/lib/actions/mastery/dismiss-empty-topic'
import type { FeedbackData, QuestionForClient } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickReviewModalProps {
  topicId: string
  topicName: string
  articleSlug?: string
  onClose: () => void
  /** Called when no questions are available — parent can dismiss this topic from the calendar */
  onComplete: () => void
  onEmpty: (topicId: string) => void
}

interface ClientQuestion {
  questionId: string
  text: string
  sessionId: string
  options: { id: string; letter: string; text: string }[]
}

interface AnswerRecord {
  questionId: string
  selectedOptionId: string
  isCorrect: boolean
  correctOptionId: string
  rationale: string | null
}

type Phase = 'loading' | 'questions' | 'summary' | 'empty'

// ─── Component ────────────────────────────────────────────────────────────────

export const QuickReviewModal = ({
  topicId,
  topicName,
  articleSlug,
  onClose,
  onComplete,
  onEmpty,
}: QuickReviewModalProps) => {
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<ClientQuestion[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0.5)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch questions on mount
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const result = await getPrequestions(topicId, 5, articleSlug)
        if (cancelled) return
        if (!result || result.questions.length === 0) {
          setPhase('empty')
          return
        }
        setSessionId(result.sessionId)
        setQuestions(result.questions as unknown as ClientQuestion[])
        setPhase('questions')
      } catch {
        if (!cancelled) setPhase('empty')
      }
    }
    void load()
    return () => { cancelled = true }
  }, [topicId])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const correctCount = answers.filter((a) => a.isCorrect).length

  const handleSelect = useCallback(
    (optionId: string) => {
      if (feedback || submitting) return
      setSelectedId(optionId)
    },
    [feedback, submitting],
  )

  const handleSubmit = useCallback(
    async () => {
      if (!selectedId || feedback || submitting || !currentQuestion) return
      setSubmitting(true)

      try {
        const result = await submitPrequestion({
          questionId: currentQuestion.questionId,
          selectedOptionId: selectedId,
          topicId,
          timeSpentMs: 5000,
          sessionId,
        })

        const record: AnswerRecord = {
          questionId: currentQuestion.questionId,
          selectedOptionId: selectedId,
          isCorrect: result.isCorrect,
          correctOptionId: result.correctOptionId,
          rationale: result.rationale,
        }
        setAnswers((prev) => [...prev, record])

        const feedbackData: FeedbackData = {
          questionId: currentQuestion.questionId,
          isCorrect: result.isCorrect,
          correctOptionId: result.correctOptionId,
          rationale: result.fullRationale ?? result.rationale,
          wikiUrl: null,
          errorDiagnostic: null,
        }
        setFeedback(feedbackData)
      } catch (err) {
        console.error('[QuickReview] submitPrequestion ERROR:', err)
        setFeedback({ questionId: currentQuestion.questionId, isCorrect: false, correctOptionId: '', rationale: null, wikiUrl: null, errorDiagnostic: null })
      } finally {
        setSubmitting(false)
      }
    },
    [selectedId, feedback, submitting, currentQuestion, topicId, sessionId],
  )

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      setPhase('summary')
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedId(null)
      setConfidence(0.5)
      setFeedback(null)
    }
  }, [currentIndex, totalQuestions])

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="rounded-md bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-[#1B3FC4]/20 border-t-[#1B3FC4] animate-spin" />
            <span className="text-sm text-[#4A5568]">Loading review questions...</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty (no questions available) ──────────────────────────────────────────

  if (phase === 'empty') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
        <div
          className="w-full max-w-sm rounded-md border border-[#D4DAE3] bg-white p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <h3 className="text-sm font-semibold text-[#1A2332] mb-2">{topicName}</h3>
          <p className="text-xs text-[#4A5568] mb-4">
            No review questions available for this topic yet. Try a Camp session instead to build your question history.
          </p>
          <button
            type="button"
            onClick={async () => {
              await dismissEmptyTopicAction(topicId)
              onEmpty(topicId)
            }}
            className="w-full rounded-sm border border-[#D4DAE3] px-4 py-2 text-sm font-medium text-[#4A5568] transition-colors duration-150 hover:bg-[#F8F7F5]"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  if (phase === 'summary') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
        <div
          className="w-full max-w-md rounded-md border border-[#D4DAE3] bg-white p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Review complete"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A2332]">Quick Review Complete</h3>
            <button type="button" onClick={onClose} className="text-[#8896A7] hover:text-[#4A5568]">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-md text-lg font-bold',
                correctCount >= totalQuestions * 0.7
                  ? 'bg-[#EDFAF4] text-[#2D9F6F]'
                  : correctCount >= totalQuestions * 0.4
                    ? 'bg-[#FEF8ED] text-[#D4951A]'
                    : 'bg-[#FDF0F0] text-[#D64545]',
              )}
            >
              {correctCount}/{totalQuestions}
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A2332]">{topicName}</p>
              <p className="text-xs text-[#4A5568]">
                {correctCount >= totalQuestions * 0.7
                  ? 'Looking sharp — this topic is holding well.'
                  : correctCount >= totalQuestions * 0.4
                    ? 'Some areas to revisit. A few more reviews will help.'
                    : 'This topic needs more attention. Consider reading the Wiki article.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="w-full rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1535A8]"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // ── Questions ───────────────────────────────────────────────────────────────

  if (!currentQuestion) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-md border border-[#D4DAE3] bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Review question ${currentIndex + 1} of ${totalQuestions}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4DAE3] px-4 py-3">
          <div>
            <p className="text-xs text-[#8896A7]">{topicName}</p>
            <p className="text-sm font-semibold text-[#1A2332]">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#8896A7] hover:text-[#4A5568]">
            <X size={16} />
          </button>
        </div>

        {/* Question stem */}
        <div className="px-4 py-4">
          <p className="text-sm text-[#1A2332] leading-relaxed">{currentQuestion.text}</p>
        </div>

        {/* Options */}
        <div className="px-4 pb-3 space-y-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedId === option.id
            const showFeedback = feedback !== null
            const isCorrectOption = feedback?.correctOptionId === option.id
            const isWrongSelection = isSelected && showFeedback && !feedback?.isCorrect

            return (
              <button
                key={option.id}
                type="button"
                disabled={showFeedback}
                onClick={() => void handleSelect(option.id)}
                className={cn(
                  'flex items-center gap-3 w-full rounded-md border px-4 py-3 min-h-[48px] text-left',
                  'transition-colors duration-150 ease-out',
                  showFeedback && isCorrectOption
                    ? 'bg-[#EDFAF4] border-[#2D9F6F] border-2'
                    : isWrongSelection
                      ? 'bg-[#FDF0F0] border-[#D64545] border-2'
                      : isSelected
                        ? 'bg-[#EEF2FC] border-[#1B3FC4]'
                        : 'bg-white border-[#D4DAE3] hover:border-[#1B3FC4]/40',
                  showFeedback && !isCorrectOption && !isWrongSelection && 'opacity-60',
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center text-xs font-semibold',
                    showFeedback && isCorrectOption
                      ? 'bg-[#2D9F6F] text-white'
                      : isWrongSelection
                        ? 'bg-[#D64545] text-white'
                        : isSelected
                          ? 'bg-[#1B3FC4] text-white'
                          : 'bg-[#F8F7F5] text-[#4A5568]',
                  )}
                >
                  {showFeedback && isCorrectOption ? (
                    <Check size={12} weight="bold" />
                  ) : (
                    option.letter
                  )}
                </span>
                <span className="text-sm leading-relaxed">{option.text}</span>
              </button>
            )
          })}
        </div>

        {/* Confidence slider + Slide to submit — same pattern as main quiz */}
        <div className="px-4 pb-3 space-y-1">
          <ConfidenceInput
            value={confidence}
            onChange={setConfidence}
            disabled={feedback !== null}
          />
          <SlideToSubmit
            onSubmit={() => { void handleSubmit() }}
            label="Slide to submit"
            disabled={!selectedId || submitting || feedback !== null}
            checked={feedback !== null}
          />
        </div>

        {/* Feedback panel — same as main quiz */}
        {feedback && currentQuestion && (
          <div className="px-4 pb-2">
            <FeedbackPanel
              feedback={feedback}
              question={{
                question_id: currentQuestion.questionId,
                position: currentIndex + 1,
                stem: currentQuestion.text,
                image_url: null,
                image_alt_text: null,
                taxonomy_breadcrumb: topicName,
                difficulty_label: 'Medium',
                options: currentQuestion.options,
                question_type: 'mcq',
                unit: null,
              } as QuestionForClient}
              selectedOptionId={selectedId ?? ''}
              gatedDelayMs={0}
              onNext={() => {}}
              mode="camp"
            />
          </div>
        )}

        {/* Next question — always visible, text button, right-aligned */}
        <div className="flex justify-end px-4 pb-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={!feedback}
            className={cn(
              'inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150',
              feedback
                ? 'text-[#1B3FC4] hover:text-[#1535A8] cursor-pointer'
                : 'text-[#D4DAE3] cursor-not-allowed',
            )}
          >
            {currentIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question'}
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
