'use client'

import { ArrowSquareOut, Cube, Scales } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Eyebrow } from '@/components/ui/eyebrow'
import { OptionButton } from '@/components/quiz/OptionButton'
import { QuestionStem } from '@/components/quiz/QuestionStem'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'
import type { AnswerState } from '@/types/testing'
import type { OptionState } from '@/components/quiz/OptionButton'
import { ROUTES } from '@/lib/constants/routes'

interface ChillSessionBehaviorProps {
  question: Question
  answer: AnswerState | null
  isSubmitted: boolean
  answeredCount: number
  subjectLabel?: string | null
  onSelectOption: (optionId: string) => void
  onStrikeOption: (optionId: string) => void
  onSubmit: () => void
  onSkip: () => void
  onEndSession: () => void
}

const getChillOptionState = (
  option: Choice,
  answer: AnswerState | null,
  isSubmitted: boolean,
  correctOptionId: string,
): OptionState => {
  if (!isSubmitted) {
    if (answer?.eliminatedOptionIds.includes(option.id)) return 'struck'
    if (answer?.selectedOptionId === option.id) return 'selected'
    return 'default'
  }
  // Soft feedback — same states as camp but styling is softer (handled via OptionButton's existing states)
  if (option.id === correctOptionId) return 'correct'
  if (answer?.selectedOptionId === option.id) return 'wrong'
  return 'faded'
}

const getCorrectOptionLetter = (options: Choice[], correctOptionId: string): string => {
  const idx = options.findIndex((o) => o.id === correctOptionId)
  return idx >= 0 ? String.fromCharCode(65 + idx) : '?'
}

export const ChillSessionBehavior = ({
  question,
  answer,
  isSubmitted,
  answeredCount,
  subjectLabel,
  onSelectOption,
  onStrikeOption,
  onSubmit,
  onSkip,
  onEndSession,
}: ChillSessionBehaviorProps) => {
  const correctLetter = getCorrectOptionLetter(question.options, question.correct_option_id)

  return (
    <div className="space-y-5">
      {/* Subject label */}
      {subjectLabel && (
        <Eyebrow aria-label={`Subject: ${subjectLabel}`}>{subjectLabel}</Eyebrow>
      )}

      {/* Chill progress — open-ended, growth-framed */}
      <p className="text-[12px] text-[#8896A7] font-medium">
        {answeredCount} answered
      </p>

      {/* Question stem */}
      <QuestionStem text={question.text} imageUrl={question.prompt_image_url} />

      {/* Options */}
      <div className="space-y-2" role="group" aria-label="Answer options">
        {question.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx)
          const state = getChillOptionState(option, answer, isSubmitted, question.correct_option_id)
          return (
            <OptionButton
              key={option.id}
              letter={letter}
              text={option.text}
              state={state}
              isChecked={isSubmitted}
              onSelect={() => onSelectOption(option.id)}
              onStrike={(e) => {
                e.stopPropagation()
                onStrikeOption(option.id)
              }}
            />
          )
        })}
      </div>

      {/* Rationale visible alongside options in Chill — not gated behind submit */}
      {!isSubmitted && question.rationale && (
        <details className="group">
          <summary className="text-[12px] text-[#8896A7] font-medium cursor-pointer hover:text-[#4A5568] transition-colors list-none flex items-center gap-1.5">
            <span className="text-[#D4DAE3] group-open:rotate-90 transition-transform duration-150 inline-block">▶</span>
            Show explanation
          </summary>
          <div className="mt-2 p-3 bg-[#F5F7FA] rounded-md border border-[#D4DAE3]">
            <p className="text-[13px] text-[#4A5568] leading-[1.7]">
              {typeof question.rationale === 'string'
                ? question.rationale
                : question.rationale.correct ?? ''}
            </p>
          </div>
        </details>
      )}

      {/* Submit + Skip footer row */}
      {!isSubmitted && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!answer?.selectedOptionId}
            aria-label="Submit answer"
            className={cn(
              'flex-1 h-11 rounded-sm text-[13px] font-black uppercase tracking-widest transition-colors duration-150',
              answer?.selectedOptionId
                ? 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]'
                : 'bg-[#F5F5F5] text-[#8896A7] cursor-not-allowed',
            )}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onSkip}
            aria-label="Skip this question"
            className="h-11 px-4 rounded-sm border border-[#D4DAE3] text-[#8896A7] hover:text-[#4A5568] hover:bg-[#F5F5F5] text-[13px] font-semibold transition-colors duration-150"
          >
            Skip →
          </button>
        </div>
      )}

      {/* Inline rationale after submit */}
      {isSubmitted && (
        <div
          className="rounded-md border border-[#D4DAE3] bg-[#F5F7FA] p-4 space-y-3"
          role="region"
          aria-label="Answer rationale"
        >
          <Eyebrow>Why {correctLetter} is correct</Eyebrow>

          {question.rationale && (
            <p className="text-[14px] text-[#4A5568] leading-[1.7]">
              {typeof question.rationale === 'string'
                ? question.rationale
                : question.rationale.correct ?? ''}
            </p>
          )}

          {question.explanation && (
            <p className="text-[14px] text-[#4A5568] leading-[1.7]">{question.explanation}</p>
          )}

          {question.code_citation && (
            <div className="flex items-start gap-2 bg-white border border-[#D4DAE3] rounded-md px-3 py-2">
              <SCIcon icon={Scales} size="sm" className="text-[#4A5568] shrink-0 mt-0.5" />
              <span className="font-mono text-[12px] text-[#4A5568] leading-[1.6]">
                {question.code_citation}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {question.topic_id && (
              <a
                href={ROUTES.WIKI_PAGE(question.topic_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-[#D4DAE3] text-[#4A5568] hover:bg-[#F5F5F5] text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                <SCIcon icon={ArrowSquareOut} size="xs" />
                Read full article
              </a>
            )}
            {question.model_id && (
              <a
                href={ROUTES.THREE_D_LAB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-[#D4DAE3] text-[#4A5568] hover:bg-[#F5F5F5] text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                <SCIcon icon={Cube} size="xs" />
                See this in 3D
              </a>
            )}
          </div>
        </div>
      )}

      {/* No error taxonomy in Chill mode */}
    </div>
  )
}
