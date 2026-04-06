'use client'

import { cn } from '@/lib/utils'

interface LabTopBarProps {
  title: string
  codeReference: string
  visitedCount: number
  totalCount: number
  onBack: () => void
  className?: string
}

/**
 * LabTopBar — Refactored to use Tailwind and semantic tokens.
 * Provides module navigation and progress at the top of the viewer.
 */
export const LabTopBar = ({
  title,
  codeReference,
  visitedCount,
  totalCount,
  onBack,
  className,
}: LabTopBarProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 shrink-0 h-9 bg-camp-black text-white/60 border-b border-white/5",
        className
      )}
    >
      {/* Left: Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 transition-colors duration-150 ease-out cursor-pointer bg-transparent border-0 p-0 font-mono text-[10px] uppercase tracking-wider text-white/40 hover:text-white/80"
      >
        <span>←</span>
        <span>Back to Browser</span>
      </button>

      {/* Center: Module title + code reference */}
      <div className="flex items-center gap-2.5">
        <span className="font-sans text-[12px] font-semibold text-white/90 tracking-tight">
          {title}
        </span>
        <div className="h-3 w-px bg-white/10" />
        <span className="font-mono text-[10px] font-bold text-white/30 uppercase tracking-widest">
          {codeReference}
        </span>
      </div>

      {/* Right: Hotspot progress */}
      <div className="flex items-center gap-2">
        <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden hidden sm:block">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${totalCount > 0 ? (visitedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-tighter">
          {visitedCount} / {totalCount} hotspots
        </span>
      </div>
    </div>
  )
}
