'use client'

// ---------------------------------------------------------------------------
// SidebarPanel
// ---------------------------------------------------------------------------
// Layout shell for the expanded overlay panel. Composes header, scrollable
// nav area, and a pinned footer slot. Content is injected via named slots
// so that the final wiring (Plan 05) can compose user data at the top level.
// ---------------------------------------------------------------------------

interface SidebarPanelProps {
  header: React.ReactNode
  nav: React.ReactNode
  footer: React.ReactNode
}

export const SidebarPanel = ({ header, nav, footer }: SidebarPanelProps) => {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header: logo + collapse toggle */}
      <div className="shrink-0">{header}</div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {nav}
      </div>

      {/* Footer: CTA + Settings (pinned outside scroll) */}
      <div className="shrink-0 border-t border-border px-3 py-2">
        {footer}
      </div>
    </div>
  )
}
