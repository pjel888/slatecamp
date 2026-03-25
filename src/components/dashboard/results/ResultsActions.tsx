'use client'

import {
  ArrowRight,
  ArrowCounterClockwise,
  SquaresFour,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'

interface ResultsActionsProps {
  onExit: () => void
  onRestart: () => void
  wrongQuestionIds: string[]
  onRetryWrongAnswers?: (questionIds: string[]) => void
}

export const RetryWrongAnswers = ({
  wrongQuestionIds,
  onRetryWrongAnswers,
}: {
  wrongQuestionIds: string[]
  onRetryWrongAnswers: (questionIds: string[]) => void
}) => (
  <div className='mb-10 p-5 bg-[#EEF2FC] border border-camp-cobalt/20 rounded-md'>
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
      <div className='flex items-start gap-3'>
        <div className='w-10 h-10 rounded-md bg-white border border-camp-cobalt/10 flex items-center justify-center shrink-0'>
          <SCIcon icon={ArrowCounterClockwise} size='md' className='text-primary' />
        </div>
        <div>
          <h3 className='text-sm font-semibold text-text-primary'>
            Retry missed questions
          </h3>
          <p className='text-sm text-text-secondary mt-0.5'>
            {wrongQuestionIds.length} question{wrongQuestionIds.length !== 1 ? 's' : ''} to revisit.
            Retrieval practice on missed items produces the strongest memory consolidation.
          </p>
        </div>
      </div>
      <button
        onClick={() => onRetryWrongAnswers(wrongQuestionIds)}
        className='w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-sm font-semibold text-sm hover:bg-[#1535A8] transition-all flex items-center justify-center gap-2 group whitespace-nowrap'
      >
        Retry {wrongQuestionIds.length} Questions
        <SCIcon icon={ArrowRight} size='sm' className='group-hover:translate-x-0.5 transition-transform' />
      </button>
    </div>
  </div>
)

export const ResultsActions = ({ onExit, onRestart }: { onExit: () => void; onRestart: () => void }) => (
  <div className='pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4'>
    <Button
      onClick={onExit}
      variant='outline'
      className='h-14 rounded-sm border-border text-text-secondary hover:bg-[#F5F5F5] font-bold uppercase tracking-widest text-[11px] gap-2'
    >
      <SCIcon icon={SquaresFour} size='sm' />
      Back to Testing Hub
    </Button>
    <Button
      onClick={onRestart}
      className='h-14 rounded-sm bg-primary hover:bg-[#1535A8] text-white font-bold uppercase tracking-widest text-[11px] gap-2'
    >
      <SCIcon icon={ArrowCounterClockwise} size='sm' />
      Start New Session
    </Button>
  </div>
)
