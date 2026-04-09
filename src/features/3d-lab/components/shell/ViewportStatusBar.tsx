'use client'

import type { ReactNode } from 'react'

interface ViewportStatusBarProps {
  children: ReactNode
}

/**
 * ViewportStatusBar — Optional status strip at bottom of the canvas area.
 * Used for compliance summaries, dimension readouts, violation counts.
 * DOM-rendered, no WebGL cost.
 */
export const ViewportStatusBar = ({ children }: ViewportStatusBarProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-auto border-t border-border bg-card/90 backdrop-blur-sm px-3 py-1.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
