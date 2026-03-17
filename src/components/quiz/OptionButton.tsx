'use client'

import { CheckCircle, XCircle, Backspace } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
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
        'transition-all duration-150 outline-none motion-reduce:transition-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',

        // Default
        state === 'default' && [
          'bg-white border-zinc-200 text-zinc-800',
          'hover:border-zinc-300 hover:bg-zinc-50',
          'cursor-pointer',
        ],

        // Selected (pre-check)
        state === 'selected' && [
          'bg-primary border-primary text-white',
          'cursor-pointer shadow-sm scale-[1.01]',
        ],

        // Struck through (pre-check)
        state === 'struck' && [
          'bg-white border-zinc-200 text-zinc-400 opacity-50',
          'cursor-pointer hover:opacity-60',
        ],

        // Post-check: correct answer
        state === 'correct' && [
          'bg-[#EDFAF4] border-[#2D9F6F] text-[#1A2332]',
          'cursor-default ring-2 ring-[#2D9F6F]/30 shadow-[0_0_12px_rgba(45,159,111,0.15)]',
        ],

        // Post-check: selected + wrong
        state === 'wrong' && [
          'bg-[#FDF0F0] border-[#D64545]/50 text-[#1A2332]',
          'cursor-default opacity-80',
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
          'shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-black border transition-colors',
          state === 'default'  && 'bg-zinc-50 border-zinc-200 text-zinc-400',
          state === 'selected' && 'bg-white/20 border-white/30 text-white',
          state === 'struck'   && 'bg-zinc-50 border-zinc-200 text-zinc-300',
          state === 'correct'  && 'bg-[#2D9F6F] border-[#2D9F6F] text-white',
          state === 'wrong'    && 'bg-[#D64545] border-[#D64545] text-white',
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
          <SCIcon icon={Backspace} size="sm" />
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
          <SCIcon icon={Backspace} size="sm" />
        </span>
      )}

      {state === 'correct' && (
        <SCIcon icon={CheckCircle} size="sm" className="shrink-0 text-[#2D9F6F]" />
      )}
      {state === 'wrong' && (
        <SCIcon icon={XCircle} size="sm" className="shrink-0 text-[#D64545]" />
      )}
    </button>
  )
}
