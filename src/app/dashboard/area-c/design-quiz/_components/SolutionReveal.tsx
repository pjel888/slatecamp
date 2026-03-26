'use client'

import { Warning } from '@phosphor-icons/react'
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

  return (
    <div className='flex flex-col gap-3'>
      {/* Answer result */}
      <div
        className='rounded-md border p-4 flex flex-col gap-3'
        style={{
          borderColor: isCorrect ? '#2D9F6F' : '#D64545',
          background: isCorrect ? '#EDFAF4' : '#FDF0F0',
        }}
      >
        <div className='flex items-center gap-2'>
          <span
            className='text-xs font-semibold'
            style={{ color: isCorrect ? '#2D9F6F' : '#D64545' }}
          >
            {isCorrect ? 'Correct' : 'To review'}
          </span>
        </div>

        {/* Options review */}
        <div className='flex flex-col gap-1.5'>
          {question.options.map((option, idx) => {
            const isSelected = selectedIndex === idx
            const isAnswerCorrect = idx === question.correct_answer_index
            let borderColor = '#D4DAE3'
            let bgColor = 'transparent'
            let textColor = '#4A5568'

            if (isAnswerCorrect) {
              borderColor = '#2D9F6F'
              bgColor = '#EDFAF4'
              textColor = '#2D9F6F'
            } else if (isSelected && !isCorrect) {
              borderColor = '#D64545'
              bgColor = '#FDF0F0'
              textColor = '#D64545'
            }

            return (
              <div
                key={idx}
                className='flex items-start gap-3 rounded-sm border px-3 py-2 text-xs'
                style={{ borderColor, background: bgColor }}
              >
                <span
                  className='shrink-0 w-5 h-5 rounded-sm border text-[10px] font-bold flex items-center justify-center'
                  style={{ borderColor, color: textColor }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ color: textColor }}>{option}</span>
              </div>
            )
          })}
        </div>
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
        <h4 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide'>Solution Steps</h4>
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
        <div className='pt-1 border-t border-[#D4DAE3]'>
          <span className='text-[10px] font-medium px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#1B3FC4]'>
            {question.code_citation}
          </span>
        </div>
      </div>

      {/* Takeaway callout */}
      <div
        className='rounded-sm px-3 py-2.5'
        style={{ background: '#F8F7F5', border: '1px solid #D4DAE3' }}
      >
        <span className='text-[10px] font-semibold text-[#8896A7] uppercase tracking-wide'>Takeaway  </span>
        <span className='text-xs text-[#1A2332] leading-relaxed'>{question.rationale.takeaway}</span>
      </div>

      {/* Next button */}
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={onNext}
          className='rounded-sm bg-[#1B3FC4] px-5 py-2 text-xs font-medium text-white hover:bg-[#1535A8] transition-colors duration-150 ease-out'
        >
          {isLast ? 'See Results' : 'Next Question →'}
        </button>
      </div>
    </div>
  )
}
