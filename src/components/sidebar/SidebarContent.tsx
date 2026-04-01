'use client'

import { useSidebar } from './SidebarProvider'

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  const { contentRef } = useSidebar()

  return (
    <div
      ref={contentRef}
      className="flex min-h-0 min-w-0 flex-1 flex-col pt-[42px] lg:pt-0"
    >
      {children}
    </div>
  )
}
