'use client'

import { useSidebar } from './SidebarProvider'

// ---------------------------------------------------------------------------
// SidebarContent
// ---------------------------------------------------------------------------
// Thin client wrapper for the main content area. Applies contentRef from
// SidebarProvider for inert management when the overlay is open.
// ---------------------------------------------------------------------------

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  const { contentRef } = useSidebar()

  return (
    <div
      ref={contentRef}
      className="flex flex-1 flex-col overflow-hidden border-l border-border"
    >
      {children}
    </div>
  )
}
