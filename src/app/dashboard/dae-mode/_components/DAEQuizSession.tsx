'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { DAEQuestion } from '@/lib/actions/dae-mode'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DAEQuizSessionProps {
  sessionId: string
  questions: DAEQuestion[]
  onExit: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const DAEQuizSession = ({ sessionId, questions, onExit }: DAEQuizSessionProps) => {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const selectedOptionId = answers[question.question_id]
  const isRevealed = revealed[question.question_id] ?? false

  const handleSelect = (optionId: string) => {
    if (isRevealed) return
    setAnswers((prev) => ({ ...prev, [question.question_id]: optionId }))
  }

  const handleReveal = () => {
    if (!selectedOptionId) return
    setRevealed((prev) => ({ ...prev, [question.question_id]: true }))
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      // Go to results
      router.push(`/quiz/chill/session/${sessionId}/results`)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#D4DAE3] px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#4A5568] hover:text-[#1B3FC4] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:underline"
          aria-label="Exit session"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Exit
        </button>

        <span className="text-[13px] text-[#4A5568]">
          {currentIndex + 1} / {totalQuestions}
        </span>

        <span className="text-[12px] text-[#8896A7] font-mono">
          DAE
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[#D4DAE3]" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={totalQuestions}>
        <div
          className="h-full bg-[#1B3FC4] transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question area */}
      <main className="flex-1 px-4 py-6 max-w-[680px] w-full mx-auto">
        {/* Breadcrumb */}
        {question.taxonomy_breadcrumb && (
          <p className="text-[11px] text-[#8896A7] mb-3 uppercase tracking-wide">
            {question.taxonomy_breadcrumb}
          </p>
        )}

        {/* Stem */}
        <p className="text-[16px] text-[#1A2332] leading-relaxed mb-5 font-medium">
          {question.stem}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer options">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(option.id)}
                disabled={isRevealed}
                className={[
                  'w-full text-left px-4 py-3 rounded-md border transition-colors duration-150 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-1',
                  isRevealed ? 'cursor-default' : 'cursor-pointer',
                  isSelected && !isRevealed
                    ? 'border-[#1B3FC4] bg-[#EEF2FC]'
                    : !isSelected
                    ? 'border-[#D4DAE3] bg-white hover:border-[#1B3FC4]/40'
                    : 'border-[#D4DAE3] bg-white',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      'flex-shrink-0 w-6 h-6 rounded-sm border text-[12px] font-medium flex items-center justify-center transition-colors duration-150',
                      isSelected && !isRevealed
                        ? 'bg-[#1B3FC4] border-[#1B3FC4] text-white'
                        : 'bg-white border-[#D4DAE3] text-[#4A5568]',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {option.letter}
                  </span>
                  <span className="text-[14px] text-[#1A2332] leading-snug pt-0.5">
                    {option.text}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Submit / Next */}
        <div className="mt-6 flex gap-3">
          {!isRevealed ? (
            <button
              type="button"
              onClick={handleReveal}
              disabled={!selectedOptionId}
              className={[
                'flex-1 rounded-sm px-4 py-2.5 text-[14px] font-medium transition-colors duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-1',
                selectedOptionId
                  ? 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]'
                  : 'bg-[#D4DAE3] text-[#8896A7] cursor-not-allowed',
              ].join(' ')}
            >
              Check Answer
            </button>
          ) : (
            <>
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-sm px-4 py-2.5 text-[14px] font-medium border border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4] hover:text-[#1B3FC4] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-1"
                  aria-label="Previous question"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-[14px] font-medium bg-[#1B3FC4] text-white hover:bg-[#1535A8] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-1"
              >
                {currentIndex < totalQuestions - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                ) : (
                  'Finish Session'
                )}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

DAEQuizSession.displayName = 'DAEQuizSession'

export { DAEQuizSession }
