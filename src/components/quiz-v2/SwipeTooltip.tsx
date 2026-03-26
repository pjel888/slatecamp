'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'slatecamp_seen_swipe_tutorial'
const DISMISS_DELAY_MS = 5000

interface SwipeTooltipProps {
  targetRef: React.RefObject<HTMLDivElement | null>
  onDismiss: () => void
}

export const SwipeTooltip = ({ targetRef, onDismiss }: SwipeTooltipProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      dismiss()
    }, DISMISS_DELAY_MS)
    return () => clearTimeout(timer)
  }, [visible])

  const dismiss = () => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1')
    }
    onDismiss()
  }

  if (!visible) return null

  return (
    <div
      role="tooltip"
      className="absolute -top-10 left-0 right-0 z-10 flex justify-center"
      aria-live="polite"
    >
      <div
        className="bg-[#1B3FC4] text-white text-xs font-normal rounded-sm px-3 py-1.5 whitespace-nowrap shadow-md"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        Swipe right to submit or tap Check Answer below
      </div>
    </div>
  )
}

export const markSwipeTutorialSeen = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, '1')
  }
}
