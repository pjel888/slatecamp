'use client'

import { useLotStore } from '../stores/useLotStore'
import type { LotMode } from '@/types/lot'

// Segmented control: Basic Lot / Surveyor Plot
// Binary mode switch — not tabs. Both states persist independently.

export function LotModeToggle() {
  const mode = useLotStore((s) => s.mode)
  const setMode = useLotStore((s) => s.setMode)

  return (
    <div className="flex h-9 rounded-md bg-[#F2F0EB] p-0.5">
      <ModeButton
        active={mode === 'rectangle'}
        onClick={() => setMode('rectangle')}
        icon={<GridIcon />}
        label="Basic Lot"
      />
      <ModeButton
        active={mode === 'surveyor'}
        onClick={() => setMode('surveyor')}
        icon={<CompassIcon />}
        label="Surveyor Plot"
      />
    </div>
  )
}

function ModeButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md font-mono text-[11px] font-medium transition-all duration-200 ${
        active
          ? 'bg-white text-[#1A2332] shadow-sm'
          : 'bg-transparent text-[#8896A7]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="10" height="10" rx="1" />
      <line x1="7" y1="2" x2="7" y2="12" />
      <line x1="2" y1="7" x2="12" y2="7" />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="5" />
      <circle cx="7" cy="7" r="1" />
      <line x1="7" y1="2" x2="7" y2="4" />
      <line x1="7" y1="10" x2="7" y2="12" />
      <line x1="2" y1="7" x2="4" y2="7" />
      <line x1="10" y1="7" x2="12" y2="7" />
    </svg>
  )
}
