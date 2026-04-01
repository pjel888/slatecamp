'use client'

import type { ReactNode } from 'react'
import { ViewportToolbar } from './ViewportToolbar'
import { KpiBar } from './KpiBar'
import { ViolationBanner } from './ViolationBanner'

// ─── Viewport Wrapper ──────────────────────────────────────────────────────
// Relative-positioned container around the 3D Canvas.
// Hosts all viewport overlays: toolbar, KPI bar, layers, violation banner.

interface ViewportWrapperProps {
  children: ReactNode
}

export function ViewportWrapper({ children }: ViewportWrapperProps) {
  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden bg-[#F5F7FA]"
      data-viewport-wrapper
    >
      {children}
      <ViewportToolbar />
      <KpiBar />
      <ViolationBanner />
    </div>
  )
}
