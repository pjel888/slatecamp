'use client'

import { useEffect } from 'react'
import { useDevStore } from '@/stores/dev-store'
import { DevOverlay } from './dev-overlay'
import { DevBadge } from './dev-badge'
import type { FeatureFlagKey } from '@/config/feature-flags'
import type { DevConnectionState } from '@/lib/dev/dev-mode'

interface DevKeyboardProviderProps {
  systemInfo: {
    env: string
    nextVersion: string
    userId: string
    userEmail: string
    userRole: string
    connectionState: DevConnectionState
  }
  dbFlags?: Partial<Record<FeatureFlagKey, boolean>>
}

export function DevKeyboardProvider({ systemInfo, dbFlags }: DevKeyboardProviderProps) {
  const toggleOverlay = useDevStore((s) => s.toggleOverlay)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleOverlay()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleOverlay])

  return (
    <>
      <DevOverlay systemInfo={systemInfo} dbFlags={dbFlags} />
      <DevBadge />
    </>
  )
}
