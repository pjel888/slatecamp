'use client'

import Link from 'next/link'
import type { DesignScenario } from '@/lib/design-scenarios'

type AnswerRecord = {
  questionNumber: number
  selectedIndex: number
  correct: boolean
  trapAffected: boolean
}

type ScenarioResultsProps = {
  scenario: DesignScenario
  answers: AnswerRecord[]
}

export const ScenarioResults = ({ scenario, answers }: ScenarioResultsProps) => {
  const correctCount = answers.filter((a) => a.correct).length
  const total = answers.length
  const accuracyPercent = total > 0 ? Math.round((correctCount / total) * 100) : 0

  const trapsTriggered = answers.filter((a) => a.trapAffected && !a.correct).length
  const trapsAvoided = scenario.trap_count - trapsTriggered

  return (
    <div className='flex flex-col gap-4'>
      {/* Score summary */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-5 flex flex-col gap-4'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-base font-semibold text-[#1A2332]'>Session complete</h2>
          <p className='text-xs text-[#4A5568]'>{scenario.title}</p>
        </div>

        {/* Accuracy bar */}
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-[#4A5568]'>
              {correctCount} of {total} correct
            </span>
            <span className='text-xs font-semibold font-mono text-[#1B3FC4]'>{accuracyPercent}%</span>
          </div>
          <div className='h-2 rounded-full bg-[#D4DAE3] overflow-hidden'>
            <div
              className='h-full rounded-full bg-[#1B3FC4] transition-all duration-150 ease-out'
              style={{ width: `${accuracyPercent}%` }}
            />
          </div>
        </div>

        {/* Trap summary */}
        {scenario.trap_count > 0 && (
          <div className='flex flex-col gap-1 pt-1 border-t border-[#D4DAE3]'>
            <div className='flex justify-between items-center'>
              <span className='text-xs text-[#4A5568]'>Traps avoided</span>
              <span className='text-xs font-medium text-[#2D9F6F] font-mono'>
                {Math.max(0, trapsAvoided)} / {scenario.trap_count}
              </span>
            </div>
            {trapsTriggered > 0 && (
              <p className='text-[11px] text-[#D4951A]'>
                {trapsTriggered} {trapsTriggered === 1 ? 'trap' : 'traps'} affected your answers — review the solution steps above.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Per-question summary */}
      <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-2'>
        <h3 className='text-xs font-semibold text-[#1A2332] uppercase tracking-wide mb-1'>Question Summary</h3>
        {answers.map((answer, idx) => {
          const question = scenario.questions[idx]
          return (
            <div
              key={answer.questionNumber}
              className='flex items-start gap-3 py-2 border-b border-[#D4DAE3]/60 last:border-0'
            >
              <span
                className='shrink-0 w-5 h-5 rounded-sm text-[10px] font-bold flex items-center justify-center font-mono'
                style={{
                  background: answer.correct ? '#EDFAF4' : '#FDF0F0',
                  color: answer.correct ? '#2D9F6F' : '#D64545',
                }}
              >
                {answer.questionNumber}
              </span>
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-[#1A2332] leading-snug line-clamp-2'>
                  {question?.question_stem ?? `Question ${answer.questionNumber}`}
                </p>
                <div className='flex items-center gap-2 mt-0.5'>
                  <span
                    className='text-[10px] font-medium'
                    style={{ color: answer.correct ? '#2D9F6F' : '#D64545' }}
                  >
                    {answer.correct ? 'Correct' : 'To review'}
                  </span>
                  {answer.trapAffected && (
                    <span className='text-[10px] text-[#D4951A]'>· trap</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className='flex justify-end'>
        <Link
          href='/dashboard/area-c/design-quiz'
          className='rounded-sm bg-[#1B3FC4] px-5 py-2 text-xs font-medium text-white hover:bg-[#1535A8] transition-colors duration-150 ease-out'
        >
          Try Another Scenario →
        </Link>
      </div>
    </div>
  )
}
