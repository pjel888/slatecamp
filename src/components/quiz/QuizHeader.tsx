'use client'

import { Flag, ChatCircle, X } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
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
  camp: 'bg-[#EEF2FC] text-[#1535A8] border-[#1535A8]/20',
  chill: 'bg-[#F5F5F5] text-text-secondary border-border',
  storm: 'bg-text-primary text-white border-text-primary',
  proof_sim: 'bg-text-primary text-white border-text-primary',
  blindspot: 'bg-[#FEF8ED] text-warning border-warning/20',
  custom: 'bg-[#F5F5F5] text-text-secondary border-border',
  endurance: 'bg-[#F5F5F5] text-text-secondary border-border',
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
  questionMap?: React.ReactNode
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
  questionMap,
}: QuizHeaderProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isStrict = mode === 'storm' || mode === 'proof_sim'
  const label = isSubjectMode ? 'Subject Practice' : MODE_LABELS[mode]

  return (
    <header className="shrink-0 border-b border-border bg-[#F5F7FA]">
      <div className="max-w-[900px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {/* Left: mode + counter */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              'shrink-0 px-2 py-0.5 rounded-sm border text-[11px] font-black uppercase tracking-widest',
              MODE_STYLES[mode],
            )}
          >
            {label}
          </span>
          {isTargeted && (
            <span className="hidden sm:block shrink-0 px-2 py-0.5 rounded-sm border text-[11px] font-black uppercase tracking-widest bg-[#EEF2FC] text-[#1535A8] border-[#1535A8]/20">
              Targeted
            </span>
          )}
          <span className="text-[11px] font-bold text-text-tertiary tracking-wide whitespace-nowrap">
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
              'flex items-center gap-1.5 h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
              isFlagged
                ? 'bg-[#FEF8ED] text-warning border border-warning/20'
                : 'text-text-tertiary hover:bg-[#EEF2FC] hover:text-text-secondary',
            )}
          >
            <SCIcon icon={Flag} size="xs" weight={isFlagged ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Review later'}</span>
          </button>

          <button
            onClick={onAI}
            aria-label="Open AI tutor"
            className="flex items-center gap-1.5 h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-widest text-text-tertiary hover:bg-[#EEF2FC] hover:text-text-secondary transition-colors"
          >
            <SCIcon icon={ChatCircle} size="xs" />
            <span className="hidden sm:inline">AI</span>
          </button>

          {questionMap}

          <div className="w-px h-4 bg-border mx-1" aria-hidden />

          <button
            onClick={onExit}
            aria-label="Exit quiz session"
            className="h-8 w-8 flex items-center justify-center rounded-sm text-text-tertiary hover:text-text-secondary hover:bg-[#EEF2FC] transition-colors"
          >
            <SCIcon icon={X} size="sm" />
          </button>
        </div>
      </div>

      {/* Progress bar — 4px, Cobalt fill, fraction display above */}
      <div className="h-1 w-full bg-[#EEF2FC]" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={totalQuestions} aria-label="Quiz progress">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            isStrict ? 'bg-text-primary' : 'bg-primary',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}
