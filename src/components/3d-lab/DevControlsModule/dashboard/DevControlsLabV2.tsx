'use client'

// ─── DevControlsLabV2 — UX Overhaul Main Wrapper ───────────────────────────
// Replaces the old flexbox 3-column layout.
// Left panel: 240px fixed, tabbed inputs (InputPanel)
// Center: 3D viewport with floating toolbar, KPI bar, layers overlay
// Right panel: 280px fixed, priority-ordered outputs (OutputPanel)
// Status bar: full-width bottom context bar
// Mobile (<768px): viewport + bottom sheet (Phase 6)

import { useCallback } from 'react'
import { DevControlsCanvas } from '../canvas/DevControlsCanvas'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { ViewportWrapper } from './ViewportWrapper'
import { PanelCollapseHandle } from './PanelCollapseHandle'
import { StatusBar } from './StatusBar'
import { TourOverlay } from './TourOverlay'
import { BottomSheet } from './BottomSheet'
import { MobileSheetContent } from './MobileSheetContent'
import { usePanelState } from '../hooks/usePanelState'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const LEFT_WIDTH = 240
const RIGHT_WIDTH = 280
const COLLAPSE_DURATION = '200ms'
const COLLAPSE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

export default function DevControlsLabV2() {
  const {
    leftCollapsed,
    rightCollapsed,
    activeTab,
    toggleLeft,
    toggleRight,
    toggleBoth,
    setActiveTab,
  } = usePanelState()

  // Layers overlay toggle is managed by ViewportToolbar internally,
  // but keyboard shortcut needs a no-op placeholder here (L key is handled in ViewportToolbar)
  const toggleLayers = useCallback(() => {
    // Dispatched via DOM event so ViewportToolbar can pick it up
    window.dispatchEvent(new CustomEvent('slatecamp:toggle-layers'))
  }, [])

  useKeyboardShortcuts({ toggleLeft, toggleRight, toggleBoth, toggleLayers })

  return (
    <div className="flex h-full w-full flex-col">
      {/* Main 3-column area */}
      <div className="flex min-h-0 flex-1">
        {/* ─── Left Panel (Tabbed Input Configuration) ─── */}
        <div
          className="relative hidden shrink-0 overflow-hidden border-r border-border bg-card md:block"
          style={{
            width: leftCollapsed ? 0 : LEFT_WIDTH,
            transition: `width ${COLLAPSE_DURATION} ${COLLAPSE_EASING}`,
          }}
        >
          <div
            className="h-full"
            style={{ width: LEFT_WIDTH }}
            aria-hidden={leftCollapsed}
          >
            <InputPanel activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <PanelCollapseHandle
            side="left"
            collapsed={leftCollapsed}
            onToggle={toggleLeft}
          />
        </div>

        {/* ─── 3D Viewport (Center) ─── */}
        <ViewportWrapper>
          <DevControlsCanvas />
          <TourOverlay />
        </ViewportWrapper>

        {/* ─── Right Panel (Priority-Ordered Output) ─── */}
        <div
          className="relative hidden shrink-0 overflow-hidden border-l border-border bg-card md:block"
          style={{
            width: rightCollapsed ? 0 : RIGHT_WIDTH,
            transition: `width ${COLLAPSE_DURATION} ${COLLAPSE_EASING}`,
          }}
        >
          <PanelCollapseHandle
            side="right"
            collapsed={rightCollapsed}
            onToggle={toggleRight}
          />
          <div
            className="h-full overflow-y-auto"
            style={{ width: RIGHT_WIDTH }}
            aria-hidden={rightCollapsed}
          >
            <OutputPanel />
          </div>
        </div>
      </div>

      {/* ─── Status Bar (desktop only) ─── */}
      <div className="hidden md:block">
        <StatusBar />
      </div>

      {/* ─── Mobile Bottom Sheet ─── */}
      <BottomSheet>
        <MobileSheetContent />
      </BottomSheet>
    </div>
  )
}
