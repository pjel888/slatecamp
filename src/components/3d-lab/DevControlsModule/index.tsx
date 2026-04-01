'use client'

// DevControlsModule — Entry Point
// PD 1096 IRR Rules VII & VIII — Site Development Controls
// Three-layer architecture: Computation → State → R3F/DOM
// Layout: Left Toolbar (inputs) → 3D Viewport → Right Toolbar (outputs)

import { DevControlsCanvas } from './canvas/DevControlsCanvas'
import { LeftToolbar, RightToolbar, MobileBottomSheet } from './dashboard/DevControlsDashboard'
import { TourOverlay } from './dashboard/TourOverlay'
import { FloatingCameraBar } from './dashboard/CameraPresetBar'

export default function DevControlsModule() {
  return (
    <div className="flex h-full w-full">
      {/* Left toolbar — input configuration (desktop only, 280px) */}
      <div className="hidden w-[280px] shrink-0 border-r border-[#D4DAE3] bg-white md:block">
        <LeftToolbar />
      </div>

      {/* 3D Canvas — fills remaining space */}
      <div className="relative min-h-0 flex-1">
        <DevControlsCanvas />
        <FloatingCameraBar />
        <TourOverlay />
      </div>

      {/* Right toolbar — output & analysis (desktop only, 320px) */}
      <div className="hidden w-[320px] shrink-0 border-l border-[#D4DAE3] bg-white md:block">
        <RightToolbar />
      </div>

      {/* Mobile bottom sheet — combines both toolbars */}
      <MobileBottomSheet />
    </div>
  )
}
