'use client'

import { ImpersonationPanel } from '@/components/dev/impersonation-panel'
import { FeatureFlagBoard } from '@/components/dev/feature-flag-board'
import { SystemInfo } from '@/components/dev/system-info'
import type { FeatureFlagKey } from '@/config/feature-flags'
import type { DevConnectionState } from '@/lib/dev/dev-mode'

interface ConsoleClientProps {
  systemInfo: {
    env: string
    nextVersion: string
    userId: string
    userEmail: string
    userRole: string
    connectionState: DevConnectionState
  }
  dbFlags: Partial<Record<FeatureFlagKey, boolean>>
}

export function ConsoleClient({ systemInfo, dbFlags }: ConsoleClientProps) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Developer Console</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Impersonate users, toggle feature flags, and inspect system state.
        </p>
      </div>

      <ImpersonationPanel />

      <div className="border-t border-border" />

      <FeatureFlagBoard dbFlags={dbFlags} />

      <div className="border-t border-border" />

      <SystemInfo {...systemInfo} />
    </div>
  )
}
