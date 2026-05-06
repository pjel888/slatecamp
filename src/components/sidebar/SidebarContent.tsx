'use client'

export const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-[42px] lg:pt-0">
      {children}
    </div>
  )
}
