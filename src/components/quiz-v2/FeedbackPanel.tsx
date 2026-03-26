'use client'

import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { CheckCircle, ArrowRight, ArrowSquareOut, Lightbulb, ChatCircleDots } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MnemonicTip } from './MnemonicTip'
import type { FeedbackData, QuestionForClient, QuizMode } from '@/types/quiz-config'

const SocraticExplorer = lazy(() =>
  import('./SocraticExplorer').then((m) => ({ default: m.SocraticExplorer })),
)

/** Modes that enable Socratic exploration (learning modes, not timed/exam modes) */
const SOCRATIC_MODES: QuizMode[] = ['camp', 'focused', 'subject', 'chill']

interface FeedbackPanelProps {
  feedback: FeedbackData
  question: QuestionForClient
  selectedOptionId: string
  gatedDelayMs: number
  onNext: () => void
  /** Current quiz mode — controls whether Socratic exploration is available */
  mode?: QuizMode | null
  /** Number of times the student has failed this question (for mnemonic trigger) */
  failCount?: number
}

export const FeedbackPanel = ({
  feedback,
  question,
  selectedOptionId,
  gatedDelayMs,
  onNext,
  mode,
  failCount = 0,
}: FeedbackPanelProps) => {
  const [nextReady, setNextReady] = useState(gatedDelayMs === 0)
  const [remainingMs, setRemainingMs] = useState(gatedDelayMs)
  const [socraticOpen, setSocraticOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const showSocraticButton =
    !feedback.isCorrect && mode != null && SOCRATIC_MODES.includes(mode)

  const showMnemonic =
    !feedback.isCorrect && failCount >= 2 && feedback.rationale != null

  useEffect(() => {
    const isImmediate = gatedDelayMs === 0
    setNextReady(isImmediate)
    setRemainingMs(isImmediate ? 0 : gatedDelayMs)

    if (!isImmediate) {
      const startTime = Date.now()
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const left = Math.max(0, gatedDelayMs - elapsed)
        setRemainingMs(left)
        if (left <= 0) {
          setNextReady(true)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      }, 50)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [gatedDelayMs, feedback.questionId])

  const selectedOption = question.options.find((o) => o.id === selectedOptionId)
  const correctOption = question.options.find((o) => o.id === feedback.correctOptionId)

  // Generation effect: detect non-MCQ question types
  const isGeneration = feedback.questionType != null && feedback.questionType !== 'mcq'

  const countdownSeconds = Math.ceil(remainingMs / 1000)
  const countdownProgress = gatedDelayMs > 0 ? 1 - remainingMs / gatedDelayMs : 1

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'rounded-md border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-150',
        feedback.isCorrect
          ? 'bg-[#EDFAF4] border-[#2D9F6F]/20'
          : 'bg-[#FEF8ED] border-[#D4951A]/20',
      )}
    >
      {/* Heading row */}
      <div className="flex items-center gap-2">
        {feedback.isCorrect ? (
          <CheckCircle
            size={18}
            weight="fill"
            className="text-[#2D9F6F] shrink-0"
            aria-hidden="true"
          />
        ) : (
          <ArrowRight
            size={18}
            weight="bold"
            className="text-[#D4951A] shrink-0"
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            'text-sm font-semibold',
            feedback.isCorrect ? 'text-[#2D9F6F]' : 'text-[#D4951A]',
          )}
        >
          {feedback.isCorrect
            ? 'Correct'
            : isGeneration && feedback.closeness != null && feedback.closeness > 0.8
              ? 'Very close'
              : 'Not quite'}
        </span>
      </div>

      {/* Wrong-answer context — generation questions */}
      {!feedback.isCorrect && isGeneration && (
        <div className="space-y-1.5">
          <p className="text-xs text-[#4A5568] leading-relaxed">
            You answered <span className="font-medium font-mono text-[#1A2332]">{selectedOptionId}</span>.
          </p>
          {feedback.correctAnswer && (
            <p className="text-xs text-[#4A5568] leading-relaxed">
              {feedback.closeness != null && feedback.closeness > 0.8
                ? <>The correct value is <span className="font-medium font-mono text-[#1A2332]">{feedback.correctAnswer}</span>.</>
                : <>The correct answer is <span className="font-medium font-mono text-[#1A2332]">{feedback.correctAnswer}</span>.</>}
            </p>
          )}
        </div>
      )}

      {/* Correct-answer context — generation questions */}
      {feedback.isCorrect && isGeneration && feedback.correctAnswer && (
        <p className="text-xs text-[#4A5568] leading-relaxed">
          The answer is <span className="font-medium font-mono text-[#2D9F6F]">{feedback.correctAnswer}</span>.
        </p>
      )}

      {/* Wrong-answer context — MCQ questions */}
      {!feedback.isCorrect && !isGeneration && (
        <p className="text-xs text-[#4A5568] leading-relaxed">
          {selectedOption && (
            <>
              You chose <span className="font-medium text-[#1A2332]">{selectedOption.letter}. {selectedOption.text}</span>.{' '}
            </>
          )}
          {correctOption && (
            <>
              The correct answer is <span className="font-medium text-[#1A2332]">{correctOption.letter}. {correctOption.text}</span>.
            </>
          )}
        </p>
      )}

      {/* Error diagnostic banner — shown above rationale for wrong answers with high-confidence classification */}
      {feedback.errorDiagnostic && !feedback.isCorrect && (
        <div className="flex items-start gap-2 rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] px-3 py-2">
          <Lightbulb
            size={14}
            weight="fill"
            className="text-[#D4951A] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-xs text-[#4A5568] leading-relaxed">
            {feedback.errorDiagnostic.message}
          </p>
        </div>
      )}

      {/* Rationale */}
      {feedback.rationale && (
        <p className="text-sm text-[#4A5568] leading-relaxed">{feedback.rationale}</p>
      )}

      {/* Wiki link */}
      {feedback.wikiUrl && (
        <a
          href={feedback.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#1B3FC4] hover:underline"
        >
          <ArrowSquareOut size={12} aria-hidden="true" />
          Read more
        </a>
      )}

      {/* Mnemonic tip — shown for recall questions failed 2+ times */}
      {showMnemonic && (
        <MnemonicTip
          factToRemember={feedback.rationale ?? ''}
          topicName={question.taxonomy_breadcrumb}
        />
      )}

      {/* Gated next button + Socratic exploration */}
      <div className="pt-1 space-y-2">
        {/* Countdown explanation + progress bar (always visible when gated) */}
        {gatedDelayMs > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-[#8896A7]">
              {nextReady
                ? 'Ready — tap Next question to continue'
                : `Review the explanation — next question in ${countdownSeconds}s`}
            </p>
            <div className="h-1 rounded-full bg-[#D4DAE3] overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-none',
                  nextReady ? 'bg-[#2D9F6F]' : 'bg-[#1B3FC4]/40',
                )}
                style={{ width: `${countdownProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Next button — always visible, disabled until countdown finishes */}
          <Button
            variant="primary"
            size="sm"
            disabled={!nextReady}
            onClick={onNext}
            aria-disabled={!nextReady}
            className={cn(
              'transition-all duration-200',
              !nextReady && 'opacity-50 cursor-not-allowed',
            )}
          >
            Next question
          </Button>

          {/* Socratic exploration trigger — only for wrong answers in learning modes */}
          {showSocraticButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSocraticOpen(true)}
              className="border-[#1B3FC4]/30 text-[#1B3FC4] hover:bg-[#EEF2FC]"
            >
              <ChatCircleDots size={14} weight="bold" aria-hidden="true" />
              Why was I wrong?
            </Button>
          )}
        </div>
      </div>

      {/* Socratic Explorer slide-over */}
      {socraticOpen && (
        <Suspense fallback={null}>
          <SocraticExplorer
            questionText={question.stem}
            selectedAnswer={
              question.options.find((o) => o.id === selectedOptionId)?.text ?? ''
            }
            correctAnswer={
              question.options.find((o) => o.id === feedback.correctOptionId)?.text ?? ''
            }
            topicName={question.taxonomy_breadcrumb}
            topicId={question.question_id}
            onClose={() => setSocraticOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
