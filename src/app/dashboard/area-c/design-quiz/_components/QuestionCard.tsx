'use client'

import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import { QuizOption } from '@/components/quiz-v2/QuizOption'

type QuestionCardProps = {
  questionNumber: number
  totalQuestions: number
  questionStem: string
  options: string[]
  selectedIndex: number | null
  eliminatedIds: Set<string>
  onSelect: (index: number) => void
  onCheck: () => void
  onNext: () => void
  onPrevious: () => void
  onToggleEliminate: (optionIdx: number) => void
  checked: boolean
  isLast: boolean
  isFirst: boolean
}

export const QuestionCard = ({
  questionNumber,
  totalQuestions,
  questionStem,
  options,
  selectedIndex,
  eliminatedIds,
  onSelect,
  onCheck,
  onNext,
  onPrevious,
  onToggleEliminate,
  checked,
  isLast,
  isFirst,
}: QuestionCardProps) => (
  <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-4'>
    {/* Question header */}
    <div className='flex items-center gap-2'>
      <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wide'>
        Question {questionNumber} of {totalQuestions}
      </span>
    </div>

    {/* Stem */}
    <p className='text-sm text-foreground leading-relaxed'>{questionStem}</p>

    {/* Options */}
    <div className='flex flex-col gap-2'>
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx
        let state: any = 'default'
        if (isSelected) state = 'selected'
        // For design quiz, we show 'correct'/'incorrect' only if needed, 
        // but sticking to standard selected state here.

        return (
          <QuizOption
            key={idx}
            id={idx.toString()}
            letter={String.fromCharCode(65 + idx)}
            text={option}
            state={state}
            isEliminated={eliminatedIds.has(idx.toString())}
            isDisabled={checked}
            onSelect={(id) => onSelect(parseInt(id))}
            onToggleEliminate={(id) => onToggleEliminate(parseInt(id))}
            name={`design-options-${questionNumber}`}
          />
        )
      })}
    </div>

    {/* Action Area: Slide to Submit */}
    <div className="py-2">
      <SlideToSubmit 
        onSubmit={onCheck}
        disabled={selectedIndex === null || checked}
        checked={checked}
        label="Slide to check answer"
      />
    </div>

    {/* Navigation Footer */}
    <div className='flex items-center justify-between pt-2 border-t border-background mt-2'>
      {/* Previous */}
      <button
        type='button'
        onClick={onPrevious}
        disabled={isFirst}
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors',
          isFirst ? 'text-border cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <ArrowLeft size={14} />
        Previous
      </button>

      {/* Next / See Results */}
      <button
        type='button'
        onClick={onNext}
        className='inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary-700 transition-colors'
      >
        {isLast ? 'See results' : 'Next'}
        {!isLast && <ArrowRight size={14} />}
      </button>
    </div>
  </div>
)

