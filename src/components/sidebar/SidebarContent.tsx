'use client'

import { useSidebar } from './SidebarProvider'

// ---------------------------------------------------------------------------
// SidebarContent — main content area wrapper
// On desktop (lg+): margin-left is 52px to clear the fixed collapsed sidebar.
// On mobile: margin-left is 0 and padding-top is 42px to clear MobileTopBar.
// The sidebar is position: fixed so it is removed from document flow.
// When sidebar is expanded, content receives inert="" to trap focus in sidebar.
// Inert is managed by SidebarProvider's useEffect (contentRef).
// ---------------------------------------------------------------------------

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  const { contentRef } = useSidebar()

  return (
    <div
      ref={contentRef}
      className="flex min-h-0 flex-1 flex-col pt-[42px] lg:pt-0 ml-0 lg:ml-[52px]"
    >
      {children}
    </div>
  )
}
