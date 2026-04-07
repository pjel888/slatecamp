'use client'

import { Warning, CheckCircle, ArrowRight, Lightbulb, ArrowSquareOut } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { DesignScenarioQuestion, HiddenTrap } from '@/lib/design-scenarios'

type SolutionRevealProps = {
  question: DesignScenarioQuestion
  selectedIndex: number
  trapsForQuestion: HiddenTrap[]
  onNext: () => void
  isLast: boolean
}

export const SolutionReveal = ({
  question,
  selectedIndex,
  trapsForQuestion,
  onNext,
  isLast,
}: SolutionRevealProps) => {
  const isCorrect = selectedIndex === question.correct_answer_index
  const selectedOption = question.options[selectedIndex]
  const correctOption = question.options[question.correct_answer_index]

  const selectedText = typeof selectedOption === 'string' ? selectedOption : selectedOption.text
  const correctText = typeof correctOption === 'string' ? correctOption : correctOption.text

  return (
    <div className='flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200'>
      {/* Result Status & Context */}
      <div
        role="status"
        className={cn(
          'rounded-md border p-4 flex flex-col gap-3',
          isCorrect ? 'bg-success-50 border-success/20' : 'bg-warning-50 border-warning/20',
        )}
      >
        <div className='flex items-center gap-2'>
          {isCorrect ? (
            <CheckCircle size={18} weight="fill" className="text-success" />
          ) : (
            <ArrowRight size={18} weight="bold" className="text-warning" />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              isCorrect ? 'text-success' : 'text-warning'
            )}
          >
            {isCorrect ? 'Correct' : 'To review'}
          </span>
        </div>

        {/* Choice comparison */}
        {!isCorrect && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            You chose <span className="font-medium text-foreground">{String.fromCharCode(65 + selectedIndex)}. {selectedText}</span>.
            The correct answer is <span className="font-medium text-foreground">{String.fromCharCode(65 + question.correct_answer_index)}. {correctText}</span>.
          </p>
        )}

        {/* Rationale */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {question.rationale.correct || question.rationale.takeaway}
        </p>
      </div>

      {/* Trap warning */}
      {trapsForQuestion.length > 0 && (
        <div className='flex flex-col gap-2'>
          {trapsForQuestion.map((trap) => (
            <div
              key={trap.trap_id}
              className='flex items-start gap-2 rounded-md border border-warning/20 bg-warning-50 px-3 py-2.5'
            >
              <Warning size={14} className='text-warning shrink-0 mt-0.5' weight='fill' />
              <div className='flex flex-col gap-1'>
                <span className='text-[10px] font-semibold text-warning uppercase tracking-wide'>
                  TRAP: {trap.description}
                </span>
                <p className='text-xs text-foreground leading-relaxed'>{trap.trap_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Solution steps */}
      <div className='rounded-md border border-border bg-card p-4 flex flex-col gap-3'>
        <div className="flex items-center gap-2">
          <Lightbulb size={14} weight="fill" className="text-primary" />
          <h4 className='text-xs font-semibold text-foreground uppercase tracking-wide'>Solution Steps</h4>
        </div>
        <ol className='flex flex-col gap-1.5'>
          {question.solution_steps.map((step, idx) => (
            <li key={idx} className='flex items-start gap-2'>
              <span className='shrink-0 font-mono text-[10px] font-bold text-muted-foreground w-4 mt-0.5'>
                {idx + 1}.
              </span>
              <span className='text-xs text-muted-foreground leading-relaxed'>{step}</span>
            </li>
          ))}
        </ol>

        {/* Code citation */}
        <div className='pt-2 border-t border-background flex items-center justify-between'>
          <span className='text-[10px] font-medium px-2 py-0.5 rounded-sm bg-primary-50 text-primary'>
            {question.code_citation}
          </span>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <ArrowSquareOut size={12} />
            Check Wiki
          </button>
        </div>
      </div>

      {/* Takeaway callout */}
      <div className='rounded-sm px-3 py-2.5 border border-border bg-background'>
        <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wide'>Key Takeaway — </span>
        <span className='text-xs text-foreground leading-relaxed'>{question.rationale.takeaway}</span>
      </div>

      {/* Next button */}
      <div className='flex justify-end pt-2'>
        <button
          type='button'
          onClick={onNext}
          className='rounded-sm bg-primary px-6 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-all duration-150 ease-out shadow-sm active:scale-[0.98]'
        >
          {isLast ? 'See Results' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}

