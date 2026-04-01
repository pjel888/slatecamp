'use client'

// DevControlsModule — Entry Point
// PD 1096 IRR Rules VII & VIII — Site Development Controls
// Three-layer architecture: Computation → State → R3F/DOM
// Layout: Left Toolbar (resizable) → 3D Viewport → Right Toolbar (resizable)

import { useRef } from 'react'
import { DevControlsCanvas } from './canvas/DevControlsCanvas'
import { LeftToolbar, RightToolbar, MobileBottomSheet } from './dashboard/DevControlsDashboard'
import { TourOverlay } from './dashboard/TourOverlay'
import { FloatingCameraBar } from './dashboard/CameraPresetBar'
import { PanelResizer } from './dashboard/PanelResizer'

export default function DevControlsModule() {
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-full w-full">
      {/* Left toolbar — resizable, input configuration (desktop only) */}
      <div
        ref={leftPanelRef}
        className="relative hidden shrink-0 border-r border-[#D4DAE3] bg-white md:block"
        style={{ width: 280 }}
      >
        <LeftToolbar />
        <PanelResizer side="left" panelRef={leftPanelRef} minWidth={220} maxWidth={450} />
      </div>

      {/* 3D Canvas — fills remaining space */}
      <div className="relative min-h-0 flex-1">
        <DevControlsCanvas />
        <FloatingCameraBar />
        <TourOverlay />
      </div>

      {/* Right toolbar — resizable, output & analysis (desktop only) */}
      <div
        ref={rightPanelRef}
        className="relative hidden shrink-0 border-l border-[#D4DAE3] bg-white md:block"
        style={{ width: 320 }}
      >
        <PanelResizer side="right" panelRef={rightPanelRef} minWidth={250} maxWidth={500} />
        <RightToolbar />
      </div>

      {/* Mobile bottom sheet — combines both toolbars */}
      <MobileBottomSheet />
    </div>
  )
}
