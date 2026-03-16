'use client'

import { Flag, MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TestMode } from '@/types/app'
import { SaveIndicator } from './SaveIndicator'

const MODE_LABELS: Record<TestMode, string> = {
  camp: 'Camp',
  chill: 'Chill',
  storm: 'Storm',
  proof_sim: 'Proof Sim',
  blindspot: 'Blindspot',
  custom: 'Custom',
  endurance: 'Endurance',
}

const MODE_STYLES: Record<TestMode, string> = {
  camp: 'bg-teal-50 text-teal-700 border-teal-200',
  chill: 'bg-blue-50 text-blue-700 border-blue-200',
  storm: 'bg-zinc-900 text-white border-zinc-900',
  proof_sim: 'bg-zinc-900 text-white border-zinc-900',
  blindspot: 'bg-amber-50 text-amber-700 border-amber-200',
  custom: 'bg-purple-50 text-purple-700 border-purple-200',
  endurance: 'bg-orange-50 text-orange-700 border-orange-200',
}

interface QuizHeaderProps {
  mode: TestMode
  currentIndex: number
  totalQuestions: number
  isFlagged: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  isSubjectMode?: boolean
  isTargeted?: boolean
  onFlag: () => void
  onAI: () => void
  onExit: () => void
}

export function QuizHeader({
  mode,
  currentIndex,
  totalQuestions,
  isFlagged,
  saveStatus,
  isSubjectMode,
  isTargeted,
  onFlag,
  onAI,
  onExit,
}: QuizHeaderProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isStrict = mode === 'storm' || mode === 'proof_sim'
  const label = isSubjectMode ? 'Subject Drill' : MODE_LABELS[mode]

  return (
    <header className="shrink-0 border-b border-zinc-100 bg-[#FAFAF9]">
      <div className="max-w-[900px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {/* Left: mode + counter */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              'shrink-0 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest',
              MODE_STYLES[mode],
            )}
          >
            {label}
          </span>
          {isTargeted && (
            <span className="hidden sm:block shrink-0 px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 border-purple-200">
              Targeted
            </span>
          )}
          <span className="text-[11px] font-bold text-zinc-400 tracking-wide whitespace-nowrap">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Center: save indicator */}
        <div className="hidden sm:flex flex-1 justify-center">
          <SaveIndicator status={saveStatus} />
        </div>

        {/* Right: tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={onFlag}
            aria-label={isFlagged ? 'Remove flag' : 'Flag for review'}
            aria-pressed={isFlagged}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-sm text-[9px] font-black uppercase tracking-widest transition-colors',
              isFlagged
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600',
            )}
          >
            <Flag className={cn('h-3.5 w-3.5', isFlagged && 'fill-current')} />
            <span className="hidden sm:inline">Flag</span>
          </button>

          <button
            onClick={onAI}
            aria-label="Open AI tutor"
            className="flex items-center gap-1.5 h-8 px-3 rounded-sm text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI</span>
          </button>

          <div className="w-px h-4 bg-zinc-200 mx-1" aria-hidden />

          <button
            onClick={onExit}
            aria-label="Exit quiz session"
            className="h-8 w-8 flex items-center justify-center rounded-sm text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full bg-zinc-100" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={totalQuestions}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            isStrict ? 'bg-zinc-700' : 'bg-blue-500',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}
