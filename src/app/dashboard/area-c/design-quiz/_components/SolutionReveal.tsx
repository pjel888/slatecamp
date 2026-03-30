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
          isCorrect ? 'bg-[#EDFAF4] border-[#2D9F6F]/20' : 'bg-[#FEF8ED] border-[#D4951A]/20',
        )}
      >
        <div className='flex items-center gap-2'>
          {isCorrect ? (
            <CheckCircle size={18} weight="fill" className="text-[#2D9F6F]" />
          ) : (
            <ArrowRight size={18} weight="bold" className="text-[#D4951A]" />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              isCorrect ? 'text-[#2D9F6F]' : 'text-[#D4951A]'
            )}
          >
            {isCorrect ? 'Correct' : 'To review'}
          </span>
        </div>

        {/* Choice comparison */}
        {!isCorrect && (
          <p className="text-xs text-[#4A5568] leading-relaxed">
            You chose <span className="font-medium text-[#1A2332]">{String.fromCharCode(65 + selectedIndex)}. {selectedText}</span>.
            The correct answer is <span className="font-medium text-[#1A2332]">{String.fromCharCode(65 + question.correct_answer_index)}. {correctText}</span>.
          </p>
        )}

        {/* Rationale */}
        <p className="text-sm text-[#4A5568] leading-relaxed">
          {question.rationale.correct || question.rationale.takeaway}
        </p>
      </div>

      {/* Trap warning */}
      {trapsForQuestion.length > 0 && (
        <div className='flex flex-col gap-2'>
          {trapsForQuestion.map((trap) => (
            <div
              key={trap.trap_id}
              className='flex items-start gap-2 rounded-md border border-[#D4951A]/20 px-3 py-2.5'
              style={{ background: '#FEF8ED' }}
            >
              <Warning size={14} style={{ color: '#D4951A' }} weight='fill' className='shrink-0 mt-0.5' />
              <div className='flex flex-col gap-1'>
                <span className='text-[10px] font-semibold text-[#D4951A] uppercase tracking-wide'>
                  TRAP: {trap.description}
                </span>
                <p className='text-xs text-[#1A2332] leading-relaxed'>{trap.trap_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Solution steps */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-3'>
        <div className="flex items-center gap-2">
          <Lightbulb size={14} weight="fill" className="text-[#1B3FC4]" />
          <h4 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide'>Solution Steps</h4>
        </div>
        <ol className='flex flex-col gap-1.5'>
          {question.solution_steps.map((step, idx) => (
            <li key={idx} className='flex items-start gap-2'>
              <span className='shrink-0 font-mono text-[10px] font-bold text-[#8896A7] w-4 mt-0.5'>
                {idx + 1}.
              </span>
              <span className='text-xs text-[#4A5568] leading-relaxed'>{step}</span>
            </li>
          ))}
        </ol>

        {/* Code citation */}
        <div className='pt-2 border-t border-[#F8F7F5] flex items-center justify-between'>
          <span className='text-[10px] font-medium px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#1B3FC4]'>
            {question.code_citation}
          </span>
          
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[10px] text-[#1B3FC4] hover:underline"
          >
            <ArrowSquareOut size={12} />
            Check Wiki
          </button>
        </div>
      </div>

      {/* Takeaway callout */}
      <div
        className='rounded-sm px-3 py-2.5 border border-[#D4DAE3] bg-[#F8F7F5]'
      >
        <span className='text-[10px] font-semibold text-[#8896A7] uppercase tracking-wide'>Key Takeaway — </span>
        <span className='text-xs text-[#1A2332] leading-relaxed'>{question.rationale.takeaway}</span>
      </div>

      {/* Next button */}
      <div className='flex justify-end pt-2'>
        <button
          type='button'
          onClick={onNext}
          className='rounded-sm bg-[#1B3FC4] px-6 py-2 text-xs font-medium text-white hover:bg-[#1535A8] transition-all duration-150 ease-out shadow-sm active:scale-[0.98]'
        >
          {isLast ? 'See Results' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}

