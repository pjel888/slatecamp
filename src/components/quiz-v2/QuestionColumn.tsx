'use client'

import { cn } from '@/lib/utils'
import type { QuestionForClient } from '@/types/quiz-config'

interface QuestionColumnProps {
  question: QuestionForClient
  confidenceLevel: 1 | 2 | 3 | null
  showConfidence: boolean
  onConfidenceChange: (level: 1 | 2 | 3) => void
}

const CONFIDENCE_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: 'Guessing' },
  { value: 2, label: 'Somewhat sure' },
  { value: 3, label: 'Very sure' },
]

export const QuestionColumn = ({
  question,
  confidenceLevel,
  showConfidence,
  onConfidenceChange,
}: QuestionColumnProps) => {
  const headingId = `question-heading-${question.question_id}`
  const stemId = `question-stem-${question.question_id}`

  return (
    <section aria-label="Question" aria-describedby={stemId}>
      {/* Topic breadcrumb */}
      <p className="text-xs text-[#8896A7] mb-3 leading-snug">
        {question.taxonomy_breadcrumb}
      </p>

      {/* Question number */}
      <h2
        id={headingId}
        tabIndex={-1}
        className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-3"
      >
        Question {question.position}
        {' '}
        <span className="normal-case font-normal text-[#8896A7]">
          · {question.difficulty_label}
        </span>
      </h2>

      {/* Question stem */}
      <p
        id={stemId}
        className="text-[#1A2332] text-base leading-relaxed"
      >
        {question.stem}
      </p>

      {/* Optional image */}
      {question.image_url && (
        <figure className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.image_url}
            alt={question.image_alt_text ?? 'Question illustration'}
            className="rounded-md max-w-full h-auto border border-[#D4DAE3]"
          />
          {question.image_alt_text && (
            <figcaption className="mt-1.5 text-xs text-[#8896A7]">
              {question.image_alt_text}
            </figcaption>
          )}
        </figure>
      )}

      {/* Confidence rating */}
      {showConfidence && (
        <fieldset className="mt-6 border-0 p-0 m-0">
          <legend className="text-xs font-medium text-[#4A5568] mb-2">
            How confident are you?
          </legend>
          <div className="flex gap-2 flex-wrap">
            {CONFIDENCE_OPTIONS.map(opt => {
              const inputId = `confidence-${question.question_id}-${opt.value}`
              const isSelected = confidenceLevel === opt.value
              return (
                <label
                  key={opt.value}
                  htmlFor={inputId}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs cursor-pointer',
                    'transition-colors duration-150 ease-out select-none',
                    isSelected
                      ? 'bg-[#EEF2FC] border-[#1B3FC4] text-[#1B3FC4] font-medium'
                      : 'bg-white border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4]/40',
                  )}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={`confidence-${question.question_id}`}
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => onConfidenceChange(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        </fieldset>
      )}
    </section>
  )
}
