'use client'

import { ArrowSquareOut, Cube, Scales } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Eyebrow } from '@/components/ui/eyebrow'
import { OptionButton } from '@/components/quiz/OptionButton'
import { QuestionStem } from '@/components/quiz/QuestionStem'
import { ConfidenceTag } from './ConfidenceTag'
import { ErrorTaxonomyPrompt } from './ErrorTaxonomyPrompt'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'
import type { AnswerState, ConfidenceTag as ConfidenceTagType, ErrorTag } from '@/types/testing'
import type { OptionState } from '@/components/quiz/OptionButton'
import { ROUTES } from '@/lib/constants/routes'

interface CampSessionBehaviorProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  answer: AnswerState | null
  isSubmitted: boolean
  subjectLabel?: string | null
  onSelectOption: (optionId: string) => void
  onStrikeOption: (optionId: string) => void
  onSubmit: () => void
  onConfidenceChange: (tag: ConfidenceTagType) => void
  onErrorTagsChange: (tags: ErrorTag[]) => void
}

const getOptionState = (
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
  // Post-submit states
  if (option.id === correctOptionId) return 'correct'
  if (answer?.selectedOptionId === option.id) return 'wrong'
  return 'faded'
}

const getCorrectOptionLetter = (options: Choice[], correctOptionId: string): string => {
  const idx = options.findIndex((o) => o.id === correctOptionId)
  return idx >= 0 ? String.fromCharCode(65 + idx) : '?'
}

export const CampSessionBehavior = ({
  question,
  questionIndex,
  totalQuestions,
  answer,
  isSubmitted,
  subjectLabel,
  onSelectOption,
  onStrikeOption,
  onSubmit,
  onConfidenceChange,
  onErrorTagsChange,
}: CampSessionBehaviorProps) => {
  const isWrong = isSubmitted && answer?.isCorrect === false
  const isCorrect = isSubmitted && answer?.isCorrect === true
  const correctLetter = getCorrectOptionLetter(question.options, question.correct_option_id)
  const correctOption = question.options.find((o) => o.id === question.correct_option_id)

  return (
    <div className="space-y-5">
      {/* Subject label */}
      {subjectLabel && (
        <Eyebrow aria-label={`Subject: ${subjectLabel}`}>{subjectLabel}</Eyebrow>
      )}

      {/* Question stem */}
      <QuestionStem text={question.text} imageUrl={question.prompt_image_url} />

      {/* Options */}
      <div className="space-y-2" role="group" aria-label="Answer options">
        {question.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx)
          const state = getOptionState(option, answer, isSubmitted, question.correct_option_id)
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

      {/* Confidence tag — shown before submit, after selecting */}
      {!isSubmitted && answer?.selectedOptionId && (
        <ConfidenceTag
          value={answer.confidenceTag}
          onChange={onConfidenceChange}
        />
      )}

      {/* Submit button */}
      {!isSubmitted && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!answer?.selectedOptionId}
          aria-label="Submit answer"
          className={cn(
            'w-full h-11 rounded-sm text-[13px] font-black uppercase tracking-widest transition-colors duration-150',
            answer?.selectedOptionId
              ? 'bg-camp-cobalt text-white hover:bg-[#1535A8]'
              : 'bg-[#F5F5F5] text-text-tertiary cursor-not-allowed',
          )}
        >
          Submit Answer
        </button>
      )}

      {/* Inline rationale — shown after submit */}
      {isSubmitted && (
        <div
          className={cn(
            'rounded-md border p-4 space-y-3',
            isCorrect
              ? 'bg-[#EDFAF4] border-emerald/30'
              : 'bg-[#EEF2FC] border-camp-cobalt/20',
          )}
          role="region"
          aria-label="Answer rationale"
        >
          {/* Eyebrow */}
          <p
            className={cn(
              'text-[11px] font-black uppercase tracking-widest',
              isCorrect ? 'text-emerald' : 'text-[#1535A8]',
            )}
          >
            Why {correctLetter} is correct
          </p>

          {/* Rationale text */}
          {question.rationale && (
            <p className="text-[14px] text-text-secondary leading-[1.7]">
              {typeof question.rationale === 'string'
                ? question.rationale
                : question.rationale.correct ?? ''}
            </p>
          )}

          {/* Extended explanation */}
          {question.explanation && (
            <p className="text-[14px] text-text-secondary leading-[1.7]">{question.explanation}</p>
          )}

          {/* Code citation — monospace per spec */}
          {question.code_citation && (
            <div className="flex items-start gap-2 bg-white border border-border rounded-md px-3 py-2">
              <SCIcon icon={Scales} size="sm" className="text-text-secondary shrink-0 mt-0.5" />
              <span
                className="font-mono text-[12px] text-text-secondary leading-[1.6]"
                aria-label={`Code citation: ${question.code_citation}`}
              >
                {question.code_citation}
              </span>
            </div>
          )}

          {/* Action links */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {question.topic_id && (
              <a
                href={ROUTES.WIKI_PAGE(question.topic_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-camp-cobalt/20 text-[#1535A8] hover:bg-[#EEF2FC] text-[11px] font-black uppercase tracking-widest transition-colors"
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
                className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-camp-cobalt/20 text-[#1535A8] hover:bg-[#EEF2FC] text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                <SCIcon icon={Cube} size="xs" />
                See this in 3D
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error taxonomy — wrong answers only */}
      {isSubmitted && isWrong && (
        <ErrorTaxonomyPrompt
          selectedTags={answer?.errorTags ?? []}
          onChange={onErrorTagsChange}
        />
      )}
    </div>
  )
}
