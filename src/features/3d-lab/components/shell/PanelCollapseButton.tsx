'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PanelCollapseButtonProps {
  side: 'left' | 'right'
  collapsed: boolean
  onToggle: () => void
}

/**
 * PanelCollapseButton — THE single collapse/expand handle for all 3D Lab sidebars.
 * 20px-wide vertical strip between sidebar and viewport.
 * Replaces all divergent collapse mechanisms across templates.
 */
export const PanelCollapseButton = ({
  side,
  collapsed,
  onToggle,
}: PanelCollapseButtonProps) => {
  const Icon =
    side === 'left'
      ? collapsed ? ChevronRight : ChevronLeft
      : collapsed ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${side} panel`}
      aria-expanded={!collapsed}
      className="group flex h-full w-5 items-center justify-center border-x border-border bg-muted/30 text-muted-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
    >
      <Icon size={14} className="transition-transform duration-150 group-hover:scale-110" />
    </button>
  )
}
