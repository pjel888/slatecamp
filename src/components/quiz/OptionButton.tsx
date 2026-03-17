'use client'

import { Check, XCircle, Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OptionState =
  | 'default'        // not selected, not checked
  | 'selected'       // selected, not yet checked
  | 'struck'         // struck through, not selected
  | 'correct'        // post-check: this is the correct answer
  | 'wrong'          // post-check: selected + incorrect
  | 'faded'          // post-check: not selected, not correct

interface OptionButtonProps {
  letter: string     // 'A' | 'B' | 'C' | 'D'
  text: string
  state: OptionState
  isChecked: boolean // whether the question has been checked (locks selection)
  onSelect: () => void
  onStrike: (e: React.MouseEvent | React.KeyboardEvent) => void
}

export function OptionButton({
  letter,
  text,
  state,
  isChecked,
  onSelect,
  onStrike,
}: OptionButtonProps) {
  const isInteractive = !isChecked && state !== 'correct' && state !== 'wrong' && state !== 'faded'

  return (
    <button
      type="button"
      disabled={isChecked}
      onClick={isInteractive ? onSelect : undefined}
      aria-pressed={state === 'selected'}
      aria-label={`Option ${letter}: ${text}${state === 'struck' ? ' (eliminated)' : ''}`}
      className={cn(
        // Base — 44px min height per WCAG, flex layout
        'relative flex items-center gap-4 w-full min-h-[52px] p-4 rounded-sm border text-left',
        'transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',

        // Default
        state === 'default' && [
          'bg-white border-zinc-200 text-zinc-800',
          'hover:border-zinc-300 hover:bg-zinc-50',
          'cursor-pointer',
        ],

        // Selected (pre-check)
        state === 'selected' && [
          'bg-blue-600 border-blue-600 text-white',
          'cursor-pointer shadow-sm',
        ],

        // Struck through (pre-check)
        state === 'struck' && [
          'bg-white border-zinc-200 text-zinc-400 opacity-50',
          'cursor-pointer hover:opacity-60',
        ],

        // Post-check: correct answer
        state === 'correct' && [
          'bg-green-50 border-green-400 text-green-900',
          'cursor-default',
        ],

        // Post-check: selected + wrong
        state === 'wrong' && [
          'bg-red-50 border-red-400 text-red-900',
          'cursor-default',
        ],

        // Post-check: not selected, not correct
        state === 'faded' && [
          'bg-white border-zinc-100 text-zinc-300 opacity-40',
          'cursor-default',
        ],
      )}
    >
      {/* Strikethrough overlay */}
      {state === 'struck' && (
        <div
          className="absolute inset-0 flex items-center px-4 pointer-events-none"
          aria-hidden
        >
          <div className="w-full h-[1.5px] bg-zinc-400/60" />
        </div>
      )}

      {/* Letter badge */}
      <div
        aria-hidden
        className={cn(
          'shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black border transition-colors',
          state === 'default'  && 'bg-zinc-50 border-zinc-200 text-zinc-400',
          state === 'selected' && 'bg-white/20 border-white/30 text-white',
          state === 'struck'   && 'bg-zinc-50 border-zinc-200 text-zinc-300',
          state === 'correct'  && 'bg-green-500 border-green-400 text-white',
          state === 'wrong'    && 'bg-red-500 border-red-400 text-white',
          state === 'faded'    && 'bg-zinc-50 border-zinc-100 text-zinc-200',
        )}
      >
        {letter}
      </div>

      {/* Option text */}
      <span className="text-[15px] font-medium leading-snug flex-1">{text}</span>

      {/* Right-side: strike button (pre-check) or result icon (post-check) */}
      {!isChecked && state !== 'struck' && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onStrike(e) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onStrike(e) } }}
          aria-label="Eliminate this option"
          className={cn(
            'shrink-0 p-1.5 rounded-sm transition-colors',
            state === 'selected'
              ? 'text-white/50 hover:text-white hover:bg-white/10'
              : 'text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100',
          )}
        >
          <Delete className="h-4 w-4" aria-hidden />
        </span>
      )}
      {!isChecked && state === 'struck' && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onStrike(e) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onStrike(e) } }}
          aria-label="Restore this option"
          className="shrink-0 p-1.5 rounded-sm text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 transition-colors"
        >
          <Delete className="h-4 w-4" aria-hidden />
        </span>
      )}

      {state === 'correct' && (
        <Check className="shrink-0 h-4 w-4 text-green-600" strokeWidth={3} aria-hidden />
      )}
      {state === 'wrong' && (
        <XCircle className="shrink-0 h-4 w-4 text-red-500" strokeWidth={3} aria-hidden />
      )}
    </button>
  )
}
