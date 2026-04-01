'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Panel Collapse Handle ─────────────────────────────────────────────────
// Edge-mounted toggle on panel border facing the viewport.
// Left panel: right edge. Right panel: left edge.

interface PanelCollapseHandleProps {
  side: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
}

export function PanelCollapseHandle({ side, collapsed, onToggle }: PanelCollapseHandleProps) {
  // When left panel is open → show ChevronLeft (collapse direction)
  // When left panel is collapsed → show ChevronRight (expand direction)
  // Right panel is the inverse
  const Icon =
    side === 'left'
      ? collapsed ? ChevronRight : ChevronLeft
      : collapsed ? ChevronLeft : ChevronRight

  const positionClasses =
    side === 'left'
      ? 'right-0 translate-x-1/2'
      : 'left-0 -translate-x-1/2'

  return (
    <button
      onClick={onToggle}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${side} panel`}
      aria-expanded={!collapsed}
      className={`absolute top-1/2 z-20 flex h-12 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground ${positionClasses}`}
    >
      <Icon size={14} />
    </button>
  )
}
