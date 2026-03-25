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
        // Base — 48px min height per WCAG, flex layout
        'relative flex items-center gap-4 w-full min-h-[48px] p-4 rounded-md border text-left',
        'transition-all duration-150 outline-none motion-reduce:transition-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',

        // Default
        state === 'default' && [
          'bg-white border-border text-text-primary',
          'hover:border-primary/20 hover:bg-[#EEF2FC]/50',
          'cursor-pointer',
        ],

        // Selected (pre-check) — calm cobalt tint, not full fill
        state === 'selected' && [
          'bg-[#EEF2FC] border-primary text-text-primary',
          'cursor-pointer',
        ],

        // Struck through (pre-check)
        state === 'struck' && [
          'bg-white border-border text-text-tertiary opacity-50',
          'cursor-pointer hover:opacity-60',
        ],

        // Post-check: correct answer
        state === 'correct' && [
          'bg-[#EDFAF4] border-emerald text-text-primary',
          'cursor-default ring-2 ring-emerald/30 shadow-[0_0_12px_rgba(45,159,111,0.15)]',
        ],

        // Post-check: selected + wrong
        state === 'wrong' && [
          'bg-[#FDF0F0] border-destructive/50 text-text-primary',
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
          state === 'default'  && 'bg-zinc-50 border-border text-text-tertiary',
          state === 'selected' && 'bg-primary/10 border-primary/30 text-primary',
          state === 'struck'   && 'bg-zinc-50 border-border text-text-tertiary',
          state === 'correct'  && 'bg-emerald border-emerald text-white',
          state === 'wrong'    && 'bg-destructive border-destructive text-white',
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
          title="Eliminate this option"
          className={cn(
            'shrink-0 p-1.5 rounded-sm transition-colors',
            state === 'selected'
              ? 'text-primary/40 hover:text-primary hover:bg-primary/10'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-[#EEF2FC]/50',
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
          title="Restore this option"
          className="shrink-0 p-1.5 rounded-sm text-text-tertiary hover:text-text-secondary hover:bg-[#EEF2FC]/50 transition-colors"
        >
          <SCIcon icon={Backspace} size="sm" />
        </span>
      )}

      {state === 'correct' && (
        <SCIcon icon={CheckCircle} size="sm" className="shrink-0 text-emerald" />
      )}
      {state === 'wrong' && (
        <SCIcon icon={XCircle} size="sm" className="shrink-0 text-destructive" />
      )}
    </button>
  )
}
