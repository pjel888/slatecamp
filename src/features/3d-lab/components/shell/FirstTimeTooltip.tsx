'use client'

// FirstTimeTooltip — shows once per user on first 3D module visit
// Explains basic controls: Orbit, Pan, Zoom, toolbar

import { useState, useEffect } from 'react'
import {
  hasSeen3DLabViewportTooltip,
  mark3DLabViewportTooltipSeen,
} from '../onboarding/state'

interface FirstTimeTooltipProps {
  disabled?: boolean
}

export const FirstTimeTooltip = ({ disabled = false }: FirstTimeTooltipProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (disabled) {
      setVisible(false)
      return undefined
    }

    if (hasSeen3DLabViewportTooltip()) return undefined

    setVisible(true)
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      mark3DLabViewportTooltipSeen()
    }, 8000)
    return () => clearTimeout(timer)
  }, [disabled])

  const handleDismiss = () => {
    setVisible(false)
    mark3DLabViewportTooltipSeen()
  }

  if (!visible) return null

  return (
    <div
      data-testid="3dlab-first-time-tooltip"
      data-3dlab-onboarding-stage="viewport"
      className="absolute top-16 left-1/2 z-30 -translate-x-1/2 rounded-md border border-border bg-card px-4 py-3 shadow-lg pointer-events-auto"
      onClick={handleDismiss}
      onKeyDown={(e) => { if (e.key === 'Escape') handleDismiss() }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><strong className="text-foreground">Orbit:</strong> drag</span>
        <span className="h-3 w-px bg-border" />
        <span><strong className="text-foreground">Pan:</strong> middle-click</span>
        <span className="h-3 w-px bg-border" />
        <span><strong className="text-foreground">Zoom:</strong> scroll</span>
        <span className="h-3 w-px bg-border" />
        <span className="text-[10px]">Toolbar: top-left</span>
      </div>
    </div>
  )
}
