'use client'

import { ROUTES } from '@/lib/routes'
import { useEffect, useCallback } from 'react'
import { X } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useDevStore } from '@/stores/dev-store'
import { ImpersonationPanel } from './impersonation-panel'
import { FeatureFlagBoard } from './feature-flag-board'
import { SystemInfo } from './system-info'
import type { FeatureFlagKey } from '@/config/feature-flags'
import type { DevConnectionState } from '@/lib/dev/dev-mode'

interface DevOverlayProps {
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

export function DevOverlay({ systemInfo, dbFlags }: DevOverlayProps) {
  const isOpen = useDevStore((s) => s.isOverlayOpen)
  const setOverlayOpen = useDevStore((s) => s.setOverlayOpen)

  const handleClose = useCallback(() => setOverlayOpen(false), [setOverlayOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border border-border bg-background shadow-lg mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Developer Console</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Ctrl+Shift+D to toggle &middot; Esc to close
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ROUTES.developer.root}
              className="rounded-md bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              Full Console
            </a>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <SCIcon icon={X} size="sm" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          <ImpersonationPanel />
          <div className="border-t border-border" />
          <FeatureFlagBoard dbFlags={dbFlags} />
          <div className="border-t border-border" />
          <SystemInfo {...systemInfo} />
        </div>
      </div>
    </div>
  )
}
