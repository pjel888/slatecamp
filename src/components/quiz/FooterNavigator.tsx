'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  strictMode: boolean           // disables dot jump navigation
  onPrev: () => void
  onNext: () => void
  onJump: (index: number) => void
}

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
  return (
    <footer className="shrink-0 border-t border-zinc-100 bg-[#FAFAF9]">
      <div className="max-w-[900px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={!canGoBack}
          aria-label="Previous question"
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors',
            canGoBack
              ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-200 cursor-not-allowed',
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Dot navigator */}
        <nav
          aria-label="Question navigator"
          className="flex items-center gap-1.5 overflow-x-auto max-w-[60vw] py-1 scrollbar-hide"
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
                'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                !strictMode && dot.state !== 'current' && 'cursor-pointer hover:scale-125',
                strictMode && 'cursor-default',

                // Sizing
                dot.state === 'current'
                  ? 'w-4 h-4 ring-2 ring-blue-500 ring-offset-1'
                  : 'w-2.5 h-2.5',

                // Colors
                dot.state === 'current'   && 'bg-blue-600',
                dot.state === 'answered'  && 'bg-blue-400',
                dot.state === 'flagged'   && 'bg-amber-400',
                dot.state === 'unanswered'&& 'bg-zinc-200',
              )}
            />
          ))}
        </nav>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!canGoForward}
          aria-label="Next question"
          className={cn(
            'flex items-center gap-2 h-9 px-4 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors',
            canGoForward
              ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-200 cursor-not-allowed',
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </footer>
  )
}
