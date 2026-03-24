'use client'

import { useState } from 'react'
import { OptionButton } from '@/components/quiz/OptionButton'
import { QuestionStem } from '@/components/quiz/QuestionStem'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'
import type { AnswerState } from '@/types/testing'
import type { OptionState } from '@/components/quiz/OptionButton'

interface StormSessionBehaviorProps {
  question: Question
  answer: AnswerState | null
  /** True after the user has confirmed their selection for this question */
  isConfirmed: boolean
  onSelectOption: (optionId: string) => void
  onConfirm: () => void
}

const getStormOptionState = (
  option: Choice,
  answer: AnswerState | null,
): OptionState => {
  // Storm mode: NEVER show correct/wrong during session
  if (answer?.eliminatedOptionIds.includes(option.id)) return 'struck'
  if (answer?.selectedOptionId === option.id) return 'selected'
  return 'default'
}

export const StormSessionBehavior = ({
  question,
  answer,
  isConfirmed,
  onSelectOption,
  onConfirm,
}: StormSessionBehaviorProps) => {
  const hasSelection = Boolean(answer?.selectedOptionId)

  return (
    <div className="space-y-5">
      {/* NO subject label in Storm mode — spec requirement */}

      {/* Question stem */}
      <QuestionStem text={question.text} imageUrl={question.prompt_image_url} />

      {/* Options — only default/selected states, never correct/wrong */}
      <div className="space-y-2" role="group" aria-label="Answer options">
        {question.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx)
          const state = getStormOptionState(option, answer)
          return (
            <OptionButton
              key={option.id}
              letter={letter}
              text={option.text}
              state={state}
              isChecked={isConfirmed}
              onSelect={() => !isConfirmed && onSelectOption(option.id)}
              onStrike={(e) => {
                // Storm mode: allow elimination pre-confirm
                e.stopPropagation()
              }}
            />
          )
        })}
      </div>

      {/* Confirm & Next — two-step flow */}
      {!isConfirmed && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={!hasSelection}
          aria-label="Confirm answer and advance"
          className={cn(
            'w-full h-11 rounded-sm text-[13px] font-black uppercase tracking-widest transition-colors duration-150',
            hasSelection
              ? 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]'
              : 'bg-[#F5F5F5] text-[#8896A7] cursor-not-allowed',
          )}
        >
          Confirm &amp; Next
        </button>
      )}

      {/* NO rationale, NO error taxonomy, NO confidence tag during Storm session */}
    </div>
  )
}
