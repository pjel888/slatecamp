'use client'

import { type ReactNode } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

interface BottomSheetTab {
  id: string
  label: string
  content: ReactNode
}

interface ViewportBottomSheetProps {
  tabs: BottomSheetTab[]
}

/**
 * ViewportBottomSheet — Mobile replacement for sidebars.
 * Each sidebar becomes a tab. Shown only on < md breakpoint.
 * Replaces DevControlsModule's BottomSheet + MobileSheetContent pattern.
 */
export const ViewportBottomSheet = ({ tabs }: ViewportBottomSheetProps) => {
  const activeTab = useViewportShellStore((s) => s.mobileActiveTab)
  const setTab = useViewportShellStore((s) => s.setMobileTab)
  const open = useViewportShellStore((s) => s.bottomSheetOpen)
  const setOpen = useViewportShellStore((s) => s.setBottomSheetOpen)

  // Default to first tab if none active
  const resolvedTab = activeTab || tabs[0]?.id || ''

  if (tabs.length === 0) return null

  return (
    <div className="md:hidden flex flex-col border-t border-border bg-card">
      {/* Tab bar + collapse toggle */}
      <div className="flex items-center border-b border-border">
        <div className="flex flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setTab(tab.id)
                if (!open) setOpen(true)
              }}
              className={`shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 ${
                resolvedTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="px-3 py-2 text-muted-foreground hover:text-foreground"
          aria-label={open ? 'Collapse panel' : 'Expand panel'}
        >
          <span className="text-[10px]">{open ? '▼' : '▲'}</span>
        </button>
      </div>

      {/* Tab content */}
      {open && (
        <div className="max-h-[40vh] overflow-y-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={resolvedTab === tab.id ? 'block' : 'hidden'}
            >
              {tab.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
