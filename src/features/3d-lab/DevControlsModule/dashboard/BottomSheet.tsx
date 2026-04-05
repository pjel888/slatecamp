'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'

// ─── Bottom Sheet ──────────────────────────────────────────────────────────
// Mobile-only draggable bottom sheet with 3 snap points.
// Peek (80px): drag handle + tab buttons visible, viewport maximized
// Half (50vh): tabs + compact content
// Full (85vh): full scrollable content

type SnapPoint = 'peek' | 'half' | 'full'

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: '80px',
  half: '50vh',
  full: '85vh',
}

interface BottomSheetProps {
  children: ReactNode
}

export function BottomSheet({ children }: BottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>('peek')
  const touchStartY = useRef(0)
  const sheetStartHeight = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    if (sheetRef.current) {
      sheetStartHeight.current = sheetRef.current.getBoundingClientRect().height
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY
    const threshold = 40

    if (deltaY > threshold) {
      // Swiped up → expand
      setSnap((prev) => {
        if (prev === 'peek') return 'half'
        if (prev === 'half') return 'full'
        return prev
      })
    } else if (deltaY < -threshold) {
      // Swiped down → collapse
      setSnap((prev) => {
        if (prev === 'full') return 'half'
        if (prev === 'half') return 'peek'
        return prev
      })
    }
  }, [])

  const handleDragHandleClick = useCallback(() => {
    setSnap((prev) => {
      if (prev === 'peek') return 'half'
      if (prev === 'half') return 'full'
      return 'peek'
    })
  }, [])

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-label="Controls and results panel"
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-xl border-t border-border bg-card shadow-lg transition-[height] duration-300 ease-out md:hidden"
      style={{ height: SNAP_HEIGHTS[snap] }}
    >
      {/* Drag handle */}
      <div
        role="separator"
        aria-label="Drag to resize panel"
        className="flex shrink-0 cursor-grab items-center justify-center py-2.5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleDragHandleClick}
      >
        <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
