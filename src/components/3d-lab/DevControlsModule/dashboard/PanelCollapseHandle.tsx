'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Panel Collapse Handle ─────────────────────────────────────────────────
// Grid cell between panel and viewport. Chevron centered vertically.
// Parent grid handles responsive visibility (hidden md:grid).

interface PanelCollapseHandleProps {
  side: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
}

export function PanelCollapseHandle({ side, collapsed, onToggle }: PanelCollapseHandleProps) {
  const Icon =
    side === 'left'
      ? collapsed ? ChevronRight : ChevronLeft
      : collapsed ? ChevronLeft : ChevronRight

  return (
    <button
      onClick={onToggle}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${side} panel`}
      aria-expanded={!collapsed}
      className="group flex items-center justify-center border-x border-border bg-muted/30 text-muted-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
    >
      <Icon size={14} className="transition-transform duration-150 group-hover:scale-110" />
    </button>
  )
}
