'use client'

import { useEffect, useState } from 'react'
import { SlatecampLoader } from '@/components/shared/SlatecampLoader'

// ─── Component ───────────────────────────────────────────────────────────────

const MESSAGES = [
  'Syncing final interactions...',
  'Analyzing subject mastery...',
  'Computing Readiness Score...',
  'Curating recommendations...',
]

/**
 * Full-screen blurred overlay shown during the results calculation transition.
 * Provides an emotional buffer and visual feedback while the server processes
 * the session and the results page is loading.
 */
export const CalculatingResultsOverlay = () => {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <SlatecampLoader />
      <p className="mt-4 text-sm font-medium text-text-secondary animate-pulse">
        {MESSAGES[messageIndex]}
      </p>
    </div>
  )
}
