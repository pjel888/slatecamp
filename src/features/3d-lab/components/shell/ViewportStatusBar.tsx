'use client'

import type { ReactNode } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

interface ViewportStatusBarProps {
  children?: ReactNode
  testId?: string
}

/**
 * ViewportStatusBar — Optional status strip at bottom of the canvas area.
 * Used for compliance summaries, dimension readouts, violation counts.
 * When no children are provided, shows default status: ready state + selection summary.
 * DOM-rendered, no WebGL cost.
 */
export const ViewportStatusBar = ({ children, testId }: ViewportStatusBarProps) => {
  const selectedIds = useViewportShellStore((s) => s.selectedIds)
  const selectionCount = selectedIds.size

  return (
    <div data-testid={testId} className="absolute bottom-0 left-0 right-0 z-10 pointer-events-auto border-t border-border bg-card/90 backdrop-blur-sm px-3 py-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        {children ?? (
          <div className="flex items-center justify-between w-full">
            <span className="text-muted-foreground">Ready</span>
            {selectionCount > 0 && (
              <span className="text-muted-foreground">
                {selectionCount} element{selectionCount !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
