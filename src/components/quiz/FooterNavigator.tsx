'use client'

import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

export type QuestionDotState = 'unanswered' | 'answered' | 'flagged' | 'current'

interface QuestionDot {
  index: number
  state: QuestionDotState
}

interface FooterNavigatorProps {
  dots: QuestionDot[]
  currentIndex: number
  canGoBack: boolean
  canGoForward: boolean
  strictMode: boolean
  onPrev: () => void
  onNext: () => void
  onJump: (index: number) => void
}

const DOT_OVERFLOW_THRESHOLD = 40

export function FooterNavigator({
  dots,
  currentIndex,
  canGoBack,
  canGoForward,
  strictMode,
  onPrev,
  onNext,
  onJump,
}: FooterNavigatorProps) {
  const showCount = dots.length > DOT_OVERFLOW_THRESHOLD

  return (
    <footer className='shrink-0 border-t border-border bg-[#F5F7FA]'>
      <div className='max-w-[900px] mx-auto px-5 py-3 flex items-center justify-between gap-4'>
        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={!canGoBack}
          aria-label='Previous question'
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
            canGoBack
              ? 'border border-border text-[#4A5568] hover:bg-[#EEF2FC]/50 hover:text-primary'
              : 'border border-border/50 text-[#8896A7]/40 cursor-not-allowed',
          )}
        >
          <SCIcon icon={CaretLeft} size='sm' />
          <span className='hidden sm:inline'>Previous</span>
        </button>

        {/* Dot navigator */}
        <div className='flex flex-col items-center gap-1 min-w-0'>
          <nav
            aria-label='Question navigator'
            aria-roledescription='question navigator'
            className='flex items-center gap-1.5 overflow-x-auto max-w-[60vw] py-1 scrollbar-hide'
          >
            {dots.map((dot) => (
              <button
                key={dot.index}
                onClick={() => !strictMode && onJump(dot.index)}
                disabled={strictMode}
                aria-label={`Question ${dot.index + 1}${dot.state === 'flagged' ? ', flagged' : ''}${dot.state === 'answered' ? ', answered' : ''}${dot.state === 'current' ? ', current' : ''}`}
                aria-current={dot.state === 'current' ? 'true' : undefined}
                className={cn(
                  'shrink-0 rounded-full transition-all duration-150 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  !strictMode &&
                    dot.state !== 'current' &&
                    'cursor-pointer hover:scale-125',
                  strictMode && 'cursor-default',
                  dot.state === 'current'
                    ? 'w-4 h-4 ring-2 ring-primary ring-offset-1'
                    : 'w-2.5 h-2.5',
                  dot.state === 'current' && 'bg-primary',
                  dot.state === 'answered' && 'bg-[#5B7FE0]',
                  dot.state === 'flagged' && 'bg-[#D4951A]',
                  dot.state === 'unanswered' && 'bg-zinc-200',
                )}
              />
            ))}
          </nav>
          {showCount && (
            <span className='text-[11px] font-bold text-[#8896A7] tracking-wide'>
              Q{currentIndex + 1} of {dots.length}
            </span>
          )}
        </div>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!canGoForward}
          aria-label='Next question'
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
            canGoForward
              ? 'bg-primary hover:bg-[#1535A8] text-white'
              : 'bg-zinc-100 text-zinc-300 cursor-not-allowed',
          )}
        >
          <span className='hidden sm:inline'>Next</span>
          <SCIcon icon={CaretRight} size='sm' />
        </button>
      </div>
    </footer>
  )
}
