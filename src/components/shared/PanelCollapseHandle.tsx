'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PanelCollapseHandleProps {
  side: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
}

export const PanelCollapseHandle = ({
  side,
  collapsed,
  onToggle,
}: PanelCollapseHandleProps) => {
  const Icon =
    side === 'left'
      ? collapsed
        ? ChevronRight
        : ChevronLeft
      : collapsed
        ? ChevronLeft
        : ChevronRight

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${side} panel`}
      aria-expanded={!collapsed}
      className="group flex h-full w-full items-center justify-center border-x border-border bg-muted/30 text-muted-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
    >
      <Icon size={14} className="transition-transform duration-150 group-hover:scale-110" />
    </button>
  )
}

export type { PanelCollapseHandleProps }
