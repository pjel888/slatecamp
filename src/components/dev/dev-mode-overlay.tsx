'use client'

import { useEffect, useState } from 'react'
import {
  DEV_MODE_BORDER_CHANGE_EVENT,
  readDevModeBorderVisible,
} from '@/lib/dev/dev-mode-visuals'

export function DevModeOverlay() {
  const [showBorder, setShowBorder] = useState(true)

  useEffect(() => {
    const syncBorderPreference = () => {
      setShowBorder(readDevModeBorderVisible(window.localStorage))
    }

    syncBorderPreference()
    window.addEventListener(DEV_MODE_BORDER_CHANGE_EVENT, syncBorderPreference)
    window.addEventListener('storage', syncBorderPreference)

    return () => {
      window.removeEventListener(DEV_MODE_BORDER_CHANGE_EVENT, syncBorderPreference)
      window.removeEventListener('storage', syncBorderPreference)
    }
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      {/* Amber border overlay */}
      {showBorder && (
        <div
          className="fixed inset-0 pointer-events-none z-[9999]"
          style={{
            border: '4px solid #D4951A', // Amber - warning/caution
            boxShadow: 'inset 0 0 20px rgba(212, 149, 26, 0.1)',
          }}
        />
      )}

      {/* Corner badge */}
      {showBorder && (
        <div className="fixed top-0 left-0 z-[10000]">
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
            DEV
          </span>
        </div>
      )}
    </>
  )
}
