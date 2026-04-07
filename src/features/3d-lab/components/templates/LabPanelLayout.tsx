// src/app/dashboard/3d-lab/_components/LabPanelLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable 3D Lab panel layout — CSS Grid with collapsible sidebars.
// Matches Site Development Controls pattern. Use for any module that needs
// left panel + viewport + optional right panel with collapse handles.
// ─────────────────────────────────────────────────────────────────────────────
'use client'

import { useState, type ReactNode } from 'react'
import { PanelCollapseHandle } from '@/components/shared/PanelCollapseHandle'

interface LabPanelLayoutProps {
  /** Left panel content (controls, inputs) */
  leftPanel: ReactNode
  /** Left panel width in px (default 240) */
  leftWidth?: number
  /** Right panel content (compliance, output) — omit to hide */
  rightPanel?: ReactNode
  /** Right panel width in px (default 280) */
  rightWidth?: number
  /** Center viewport content (canvas) */
  children: ReactNode
}

export function LabPanelLayout({
  leftPanel,
  leftWidth = 240,
  rightPanel,
  rightWidth = 280,
  children,
}: LabPanelLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const hasRight = rightPanel != null

  // Build grid columns: [left] [handle] [viewport 1fr] [handle?] [right?]
  const leftCol = leftCollapsed ? '0px' : `${leftWidth}px`
  const handleW = '20px'
  const rightCol = hasRight ? (rightCollapsed ? '0px' : `${rightWidth}px`) : ''
  const rightHandle = hasRight ? handleW : ''

  const gridTemplateColumns = hasRight
    ? `${leftCol} ${handleW} 1fr ${rightHandle} ${rightCol}`
    : `${leftCol} ${handleW} 1fr`

  return (
    <div
      className="h-full w-full grid max-md:flex max-md:flex-col"
      style={{ gridTemplateColumns, gridTemplateRows: '1fr' }}
    >
      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div
        className="overflow-y-auto overflow-x-hidden bg-card border-r border-border max-md:hidden"
        style={{ display: leftCollapsed ? 'none' : undefined }}
      >
        {leftPanel}
      </div>
      {leftCollapsed && <div className="max-md:hidden" />}

      {/* ── Left Handle ─────────────────────────────────────────────────── */}
      <div className="max-md:hidden">
        <PanelCollapseHandle
          side="left"
          collapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed((v) => !v)}
        />
      </div>

      {/* ── Viewport (1fr — absorbs remaining space) ────────────────────── */}
      <div className="relative overflow-hidden max-md:flex-1">
        {children}
      </div>

      {/* ── Right Handle + Panel ────────────────────────────────────────── */}
      {hasRight && (
        <>
          <div className="max-md:hidden">
            <PanelCollapseHandle
              side="right"
              collapsed={rightCollapsed}
              onToggle={() => setRightCollapsed((v) => !v)}
            />
          </div>
          <div
            className="overflow-y-auto overflow-x-hidden bg-card border-l border-border max-md:hidden"
            style={{ display: rightCollapsed ? 'none' : undefined }}
          >
            {rightPanel}
          </div>
          {rightCollapsed && <div className="max-md:hidden" />}
        </>
      )}
    </div>
  )
}
