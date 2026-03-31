'use client'

// DevControlsModule — Entry Point
// PD 1096 IRR Rules VII & VIII — Site Development Controls
// Three-layer architecture: Computation → State → R3F/DOM

import { DevControlsCanvas } from './canvas/DevControlsCanvas'
import { DesktopSidebar, MobileBottomSheet } from './dashboard/DevControlsDashboard'
import { TourOverlay } from './dashboard/TourOverlay'

export default function DevControlsModule() {
  return (
    <div className="flex h-full w-full">
      {/* 3D Canvas — flex-1 on desktop, full width on mobile */}
      <div className="relative min-h-0 flex-1">
        <DevControlsCanvas />
        <TourOverlay />
      </div>

      {/* Controls sidebar — desktop only (360px) */}
      <div className="hidden w-[360px] shrink-0 border-l border-[#D4DAE3] bg-white md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile bottom sheet */}
      <MobileBottomSheet />
    </div>
  )
}
