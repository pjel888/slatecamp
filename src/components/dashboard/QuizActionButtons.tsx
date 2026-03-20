'use client'

import { cn } from '@/lib/utils'
import { ConfidenceToggle } from '@/components/quiz'
import type { ConfidenceLevel } from '@/components/quiz/ConfidenceToggle'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizActionButtonsProps {
  mode: string
  strictMode: boolean
  isChecked: boolean
  isRationaleVisible: boolean
  selectedAnswer: string | undefined
  isSaving: boolean
  confidence: ConfidenceLevel
  currentIndex: number
  totalQuestions: number
  dwellTimeRemaining: number
  onConfidenceChange: (level: ConfidenceLevel) => void
  onShowRationale: () => void
  onCheckAnswer: () => void
  onNext: () => void
  onFinish: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const QuizActionButtons = ({
  mode,
  strictMode,
  isChecked,
  isRationaleVisible,
  selectedAnswer,
  isSaving,
  confidence,
  currentIndex,
  totalQuestions,
  dwellTimeRemaining,
  onConfidenceChange,
  onShowRationale,
  onCheckAnswer,
  onNext,
  onFinish,
}: QuizActionButtonsProps) => (
  <div
    className={cn(
      'flex items-center gap-3',
      isChecked && !isRationaleVisible ? 'justify-between' : 'justify-between',
    )}
  >
    {/* Left: confidence toggle + show rationale */}
    <div className='flex items-center gap-3'>
      {!isChecked && !strictMode && (
        <ConfidenceToggle
          value={confidence}
          onChange={onConfidenceChange}
          disabled={isChecked}
        />
      )}
      {isChecked && !isRationaleVisible && (
        <button
          onClick={onShowRationale}
          className='h-11 px-5 rounded-sm border border-primary/20 text-primary hover:bg-[#EEF2FC] text-[11px] font-black uppercase tracking-widest transition-colors'
        >
          Show Rationale
        </button>
      )}
    </div>

    {/* Right: check/next button */}
    {mode !== 'chill' && !isChecked ? (
      <button
        onClick={onCheckAnswer}
        disabled={!selectedAnswer || isSaving}
        className={cn(
          'h-11 px-8 rounded-sm font-black text-xs uppercase tracking-[0.15em] transition-all',
          selectedAnswer && !isSaving
            ? 'bg-primary text-white hover:bg-[#1535A8] shadow-sm'
            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed',
        )}
      >
        {isSaving
          ? 'Saving…'
          : strictMode
            ? 'Confirm & Next'
            : 'Check Answer'}
      </button>
    ) : (
      <div className='relative'>
        <button
          onClick={
            currentIndex === totalQuestions - 1
              ? onFinish
              : onNext
          }
          className='h-11 px-8 rounded-sm font-black text-xs uppercase tracking-[0.15em] transition-all bg-primary text-white hover:bg-[#1535A8] shadow-sm'
        >
          {currentIndex === totalQuestions - 1
            ? 'Finish Session'
            : 'Next Question'}
        </button>
        {dwellTimeRemaining > 0 && (
          <div
            className='absolute -inset-1 rounded-sm pointer-events-none'
            aria-hidden
            title={`${dwellTimeRemaining}s — take a moment to let this sink in`}
          >
            <svg className='w-full h-full' viewBox='0 0 100 100' fill='none'>
              <rect
                x='1' y='1' width='98' height='98' rx='3'
                stroke='currentColor' strokeWidth='2'
                className='text-primary/20'
                strokeDasharray='392' strokeDashoffset='0'
              />
            </svg>
          </div>
        )}
      </div>
    )}
  </div>
)
