'use client'

import { ArrowLeft, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewportHeaderProps {
  title: string
  codeReference?: string
  visitedCount?: number
  totalCount?: number
  onBack: () => void
  className?: string
  desktopGridTemplateColumns?: string
}

/**
 * ViewportHeader — Unified top bar for all 3D Lab modules.
 * Absorbs LabTopBar functionality into the ViewportShell system.
 */
export const ViewportHeader = ({
  title,
  codeReference,
  visitedCount = 0,
  totalCount = 0,
  onBack,
  className,
  desktopGridTemplateColumns,
}: ViewportHeaderProps) => {
  return (
    <div
      className={cn(
        'grid shrink-0 h-10 bg-card text-muted-foreground border-b border-border',
        className,
      )}
      style={{ gridTemplateColumns: desktopGridTemplateColumns ?? '384px 20px minmax(0, 1fr) 20px 384px' }}
    >
      {/* Left: Back link */}
      <div className="flex min-w-0 items-center px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 transition-colors duration-150 ease-out cursor-pointer bg-transparent border-0 p-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Browser</span>
        </button>
      </div>
      <div aria-hidden="true" />

      {/* Center: Module title + code reference */}
      <div className="flex min-w-0 items-center justify-center gap-2.5 px-3 text-center">
        <span className="font-sans text-[12px] font-semibold text-foreground tracking-tight">
          {title}
        </span>
        {codeReference && (
          <>
            <div className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {codeReference}
            </span>
          </>
        )}
      </div>
      <div aria-hidden="true" />

      {/* Right: Progress + Settings */}
      <div className="flex min-w-0 items-center justify-end gap-2 px-4">
        {totalCount > 0 && (
          <>
            <div className="h-1 w-16 bg-muted rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(visitedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
              {visitedCount} / {totalCount} hotspots
            </span>
          </>
        )}
        <button
          type="button"
          aria-label="Settings"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground hover:bg-muted"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
