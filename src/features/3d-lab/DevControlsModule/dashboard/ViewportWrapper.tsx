'use client'

import type { ReactNode } from 'react'
import { SceneToolbar } from '@/features/3d-lab/components/shell/SceneToolbar'
import { CameraNavigationBar } from '@/features/3d-lab/components/shell/CameraNavigationBar'
import { LayersPanel } from '@/features/3d-lab/components/shell/LayersPanel'
import { DevControlsLayerToggles } from './DevControlsLayerToggles'
import { SharedToolbarBridge } from './SharedToolbarBridge'
import { KpiBar } from './KpiBar'
import { ViolationBanner } from './ViolationBanner'
// useViewportShellStore not needed here — LayersPanel reads its own open state internally

// ─── Viewport Wrapper ──────────────────────────────────────────────────────
// Relative-positioned container around the 3D Canvas.
// Hosts BOTH shared viewport controls AND DevControls-specific overlays.
//
// WHY here and not in ViewportShell?
// DevControls is a "bespoke" module — ViewportShell receives shellConfig: {} (no sidebars).
// That makes the ViewportShell viewport column span the FULL width, but DevControls
// renders its OWN 480px left + 300px right sidebars inside LabViewport → DevControlsLabV2.
// If SceneToolbar were in ViewportShell, it would be at left-4 of the full-width container
// (overlapping with the left panel). By rendering it HERE, it's positioned relative to
// the actual 3D canvas area within DevControls' internal grid layout.

interface ViewportWrapperProps {
  children: ReactNode
}

export const ViewportWrapper = ({ children }: ViewportWrapperProps) => {
  return (
    <div
      className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-surface-focused"
      data-viewport-wrapper
      data-viewport-shell
    >
      {children}
      <SharedToolbarBridge />
      {/* Shared viewport controls — positioned relative to THIS container (the actual 3D canvas area) */}
      <SceneToolbar />
      {/* Layers panel — shared component (generic layers) + DevControls-specific layers as children */}
      <LayersPanel>
        <DevControlsLayerToggles />
      </LayersPanel>
      <CameraNavigationBar />
      {/* DevControls-specific overlays */}
      <KpiBar />
      <ViolationBanner />
    </div>
  )
}
