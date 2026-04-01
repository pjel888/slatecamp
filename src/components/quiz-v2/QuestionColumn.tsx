'use client'

import type { QuestionForClient, QuizMode } from '@/types/quiz-config'
import { HintButton } from './HintButton'

const FORMATIVE_MODES = new Set<QuizMode>(['camp', 'chill', 'subject', 'focused'])

interface QuestionColumnProps {
  question: QuestionForClient
  mode?: QuizMode
}

export const QuestionColumn = ({
  question,
  mode,
}: QuestionColumnProps) => {
  const headingId = `question-heading-${question.question_id}`
  const stemId = `question-stem-${question.question_id}`

  const isFormative = mode != null && FORMATIVE_MODES.has(mode)

  return (
    <section aria-label="Question" aria-describedby={stemId}>
      {/* Topic breadcrumb */}
      <p className="text-xs text-[#8896A7] mb-3 leading-snug">
        {question.taxonomy_breadcrumb}
        {question.is_interleaved && (
          <span
            className="ml-1.5 inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-medium"
            style={{ color: '#8896A7', backgroundColor: 'rgba(136,150,167,0.10)' }}
          >
            related topic
          </span>
        )}
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

      {/* Hint — formative modes only, when hint_text is present */}
      {question.hint_text && (
        <HintButton
          hintText={question.hint_text}
          isFormative={isFormative}
        />
      )}

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

    </section>
  )
}
