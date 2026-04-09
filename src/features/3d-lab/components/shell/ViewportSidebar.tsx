'use client'

import type { ReactNode } from 'react'

interface ViewportSidebarProps {
  /** Panel header title */
  title?: string
  /** Slot content injected by templates */
  children: ReactNode
  /** Additional className for the scroll container */
  className?: string
}

/**
 * ViewportSidebar — THE single sidebar container for all 3D Lab modules.
 * Provides consistent panel header, scroll behavior, and styling.
 * Templates inject CONTENT only — they never create their own sidebar containers.
 *
 * Collapse/expand is handled by ViewportShell's CSS grid + PanelCollapseButton.
 * This component only renders the inner content with proper scroll and header.
 */
export const ViewportSidebar = ({
  title,
  children,
  className,
}: ViewportSidebarProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      {title && (
        <div className="flex-none border-b border-border px-3 py-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden ${className ?? ''}`}>
        {children}
      </div>
    </div>
  )
}
