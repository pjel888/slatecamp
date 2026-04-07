'use client'

import { useEffect } from 'react'

interface NavigationGuardProps {
  /** Whether the quiz session is active (show warning on leave) */
  active: boolean
}

/**
 * Warns users before leaving during an active quiz session.
 * Uses beforeunload event — browser shows native confirmation dialog.
 */
export const NavigationGuard = ({ active }: NavigationGuardProps) => {
  useEffect(() => {
    if (!active) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [active])

  return null
}
