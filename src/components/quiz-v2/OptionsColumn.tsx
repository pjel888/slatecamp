'use client'

import { useEffect, useCallback, useRef, memo } from 'react'
import { Backspace } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/stores/useQuizStore'
import { ConfidenceInput } from './ConfidenceInput'
import { FeedbackPanel } from './FeedbackPanel'
import { SlideToSubmit } from './SlideToSubmit'
import { GestureCaptureZone } from './GestureCaptureZone'
import { QuizOption } from './QuizOption'
import type { QuestionForClient, FeedbackData, QuizSessionConfig } from '@/types/quiz-config'
import type { GestureSignalEvent } from '@/types/patent'

interface OptionsColumnProps {
  question: QuestionForClient
  selectedOptionId: string | null
  confidenceLevel: 1 | 2 | 3 | null
  feedback: FeedbackData | null
  config: QuizSessionConfig
  onSelectOption: (optionId: string) => void
  onConfidenceChange: (level: number) => void
  onSubmit: (signalTrace?: GestureSignalEvent[]) => void
  onNext: () => void
}

const EMPTY_ELIMINATED_IDS: string[] = []

const getOptionState = (
  optionId: string,
  selectedOptionId: string | null,
  feedback: FeedbackData | null,
): 'default' | 'selected' | 'correct' | 'incorrect' => {
  if (!feedback) {
    return selectedOptionId === optionId ? 'selected' : 'default'
  }
  if (optionId === feedback.correctOptionId) return 'correct'
  if (optionId === selectedOptionId && !feedback.isCorrect) return 'incorrect'
  return 'default'
}

export const OptionsColumn = memo(({
  question,
  selectedOptionId,
  confidenceLevel,
  feedback,
  config,
  onSelectOption,
  onConfidenceChange,
  onSubmit,
  onNext,
}: OptionsColumnProps) => {
  const signalTraceRef = useRef<GestureSignalEvent[]>([])
  
  const status = useQuizStore((s) => s.status)
  const isChecked = feedback !== null
  const isSubmitting = status === 'submitting'
  const isDisabled = isChecked || isSubmitting

  const showFeedbackPanel =
    feedback !== null && config.feedback.timing === 'immediate'

  const headingId = `question-heading-${question.question_id}`
  const hasAnswered = selectedOptionId !== null

  // ── Elimination state from store (Granular selector) ─────────────────────
  const eliminatedIds = useQuizStore((s) => s.eliminatedOptions[question.question_id] ?? EMPTY_ELIMINATED_IDS)
  const toggleEliminate = useQuizStore((s) => s.toggleEliminate)

  // Keyboard submit (Enter / Space) as accessibility fallback
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isDisabled || !hasAnswered) return
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'LABEL') return
        e.preventDefault()
        onSubmit()
      }
    },
    [isDisabled, hasAnswered, onSubmit],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleGestureBuffer = useCallback((buffer: GestureSignalEvent[]) => {
    signalTraceRef.current = buffer
  }, [])

  const handleInternalSubmit = useCallback(() => {
    onSubmit(signalTraceRef.current)
    signalTraceRef.current = [] // Clear after submission
  }, [onSubmit])

  return (
    <div className="flex flex-col gap-4">
      {/* Radio group */}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="flex flex-col gap-2"
      >
        {question.options.map((option) => {
          const state = getOptionState(option.id, selectedOptionId, feedback)
          const isEliminated = eliminatedIds.includes(option.id) && !isChecked

          return (
            <QuizOption
              key={option.id}
              id={option.id}
              letter={option.letter}
              text={option.text}
              state={state}
              isEliminated={isEliminated}
              isDisabled={isDisabled}
              onSelect={onSelectOption}
              onToggleEliminate={(id) => toggleEliminate(question.question_id, id)}
              name={`options-${question.question_id}`}
            />
          )
        })}
      </div>

      {/* Confidence slider — always visible, disabled after submit. Hidden only in chill mode. */}
      {config.mode !== 'chill' && (
        <ConfidenceInput
          value={confidenceLevel}
          onChange={onConfidenceChange}
          disabled={isDisabled}
        />
      )}

      {/* Slide-to-submit bar — wrapped with signal capture zone (Patent Claims 1(a-b), 6) */}
      <GestureCaptureZone onBufferReady={handleGestureBuffer}>
        <SlideToSubmit
          onSubmit={handleInternalSubmit}
          label={config.feedback.timing === 'none' ? 'Slide to continue' : 'Slide to submit'}
          disabled={!hasAnswered || isDisabled}
          checked={isChecked}
        />
      </GestureCaptureZone>

      {/* Inline feedback panel */}
      {showFeedbackPanel && selectedOptionId && (
        <FeedbackPanel
          feedback={feedback}
          question={question}
          selectedOptionId={selectedOptionId}
          gatedDelayMs={config.feedback.gatedProgressionDelayMs}
          onNext={onNext}
          mode={config.mode}
        />
      )}
    </div>
  )
})

OptionsColumn.displayName = 'OptionsColumn'
