'use client'

// FirstTimeTooltip — shows once per user on first 3D module visit
// Explains basic controls: Orbit, Pan, Zoom, toolbar

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'slatecamp-viewport-onboarding-seen'

export const FirstTimeTooltip = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        setVisible(true)
        // Auto-dismiss after 8 seconds
        const timer = setTimeout(() => {
          setVisible(false)
          localStorage.setItem(STORAGE_KEY, 'true')
        }, 8000)
        return () => clearTimeout(timer)
      }
    } catch { /* localStorage unavailable */ }
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
  }

  if (!visible) return null

  return (
    <div
      className="absolute top-16 left-1/2 z-30 -translate-x-1/2 rounded-md border border-border bg-card px-4 py-3 shadow-lg pointer-events-auto"
      onClick={handleDismiss}
      onKeyDown={(e) => { if (e.key === 'Escape') handleDismiss() }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><strong className="text-foreground">Orbit:</strong> drag</span>
        <span className="h-3 w-px bg-border" />
        <span><strong className="text-foreground">Pan:</strong> middle-click</span>
        <span className="h-3 w-px bg-border" />
        <span><strong className="text-foreground">Zoom:</strong> scroll</span>
        <span className="h-3 w-px bg-border" />
        <span className="text-[10px]">Toolbar: top-left</span>
      </div>
    </div>
  )
}
