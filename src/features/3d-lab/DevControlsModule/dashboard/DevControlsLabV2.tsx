'use client'

// ─── DevControlsLabV2 — UX Overhaul Main Wrapper ───────────────────────────
// CSS Grid layout — resolves the flex overflow bug where the R3F canvas
// would establish an intrinsic minimum width and push the right panel offscreen.
// Grid columns: [left panel] [left handle] [viewport 1fr] [right handle] [right panel]
// The 1fr column always absorbs remaining space — no overflow possible.

import { useCallback } from 'react'
import { DevControlsCanvas } from '../canvas/DevControlsCanvas'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { ViewportWrapper } from './ViewportWrapper'
import { PanelCollapseHandle } from '@/components/shared/PanelCollapseHandle'
import { StatusBar } from './StatusBar'
import { TourOverlay } from './TourOverlay'
import { BottomSheet } from './BottomSheet'
import { MobileSheetContent } from './MobileSheetContent'
import { usePanelState } from '../hooks/usePanelState'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const LEFT_WIDTH = 480
const RIGHT_WIDTH = 300
const HANDLE_WIDTH = 20

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

  const toggleLayers = useCallback(() => {
    window.dispatchEvent(new CustomEvent('slatecamp:toggle-layers'))
  }, [])

  useKeyboardShortcuts({ toggleLeft, toggleRight, toggleBoth, toggleLayers })

  // Grid template: panel widths transition via CSS, 1fr absorbs all remaining space
  const leftCol = leftCollapsed ? '0px' : `${LEFT_WIDTH}px`
  const rightCol = rightCollapsed ? '0px' : `${RIGHT_WIDTH}px`
  const gridTemplate = `${leftCol} ${HANDLE_WIDTH}px 1fr ${HANDLE_WIDTH}px ${rightCol}`

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Main grid — 5 columns: left-panel | left-handle | viewport | right-handle | right-panel */}
      <div
        className="hidden min-h-0 flex-1 md:grid"
        style={{
          gridTemplateColumns: gridTemplate,
          gridTemplateRows: '1fr',
          transition: 'grid-template-columns 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Col 1: Left Panel */}
        <div className="overflow-hidden border-r border-border bg-card">
          <div className="h-full" style={{ width: LEFT_WIDTH }} aria-hidden={leftCollapsed}>
            <InputPanel activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Col 2: Left Handle */}
        <PanelCollapseHandle side="left" collapsed={leftCollapsed} onToggle={toggleLeft} />

        {/* Col 3: 3D Viewport (1fr — always fills remaining space) */}
        <ViewportWrapper>
          <DevControlsCanvas />
          <TourOverlay />
        </ViewportWrapper>

        {/* Col 4: Right Handle */}
        <PanelCollapseHandle side="right" collapsed={rightCollapsed} onToggle={toggleRight} />

        {/* Col 5: Right Panel */}
        <div className="overflow-hidden border-l border-border bg-card">
          <div className="h-full overflow-y-auto" style={{ width: RIGHT_WIDTH }} aria-hidden={rightCollapsed}>
            <OutputPanel />
          </div>
        </div>
      </div>

      {/* Mobile: viewport + bottom sheet (no grid, just stacked) */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <ViewportWrapper>
          <DevControlsCanvas />
        </ViewportWrapper>
      </div>

      {/* ─── Status Bar (desktop) ─── */}
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
