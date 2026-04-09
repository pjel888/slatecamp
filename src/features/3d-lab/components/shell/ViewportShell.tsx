'use client'

import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { ViewportHeader } from './ViewportHeader'
import { ViewportSidebar } from './ViewportSidebar'
import { ViewportToolbar } from './ViewportToolbar'
import { ViewportStatusBar } from './ViewportStatusBar'
import { ViewportBottomSheet } from './ViewportBottomSheet'
import { PanelCollapseButton } from './PanelCollapseButton'
import type {
  SidebarConfig,
  ViewportShellConfig,
  ViewportCapabilities,
  ViewportShellContent,
} from '@/features/3d-lab/types/templates'

// ─── Constants ──────────────────────────────────────────────────────────────

const HANDLE_WIDTH = 20
const GRID_TRANSITION = 'grid-template-columns 200ms cubic-bezier(0.4, 0, 0.2, 1)'

// ─── Helpers ────────────────────────────────────────────────────────────────

const resolveSidebar = (
  cfg: boolean | SidebarConfig | undefined,
): SidebarConfig | null => {
  if (!cfg) return null
  if (cfg === true) return {}
  return cfg
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ViewportShellProps {
  /** Module title for header */
  title: string
  /** Code reference (e.g., 'PD 1096 §4.08') */
  codeReference?: string
  /** Hotspot visit progress */
  visitedCount?: number
  totalCount?: number
  /** Back button handler */
  onBack: () => void

  /** Shell layout configuration */
  shellConfig: ViewportShellConfig
  /** Toolbar capabilities */
  capabilities: ViewportCapabilities

  /** Slot content from template */
  content: ViewportShellContent

  /** Additional children (onboarding overlay, context card, etc.) */
  children?: ReactNode
}

/**
 * ViewportShell — THE unified layout container for all 3D Lab modules.
 * CSS Grid with collapsible sidebars (DevControls-proven pattern).
 *
 * Replaces: LabModuleShell, LabPanelLayout, and all per-template layout assembly.
 *
 * Grid: [left-sidebar] [left-handle] [viewport 1fr] [right-handle] [right-sidebar]
 * Panel collapse: grid-template-columns transitions from Npx to 0px (200ms CSS).
 * Mobile: grid hidden, flex column with ViewportBottomSheet.
 */
export const ViewportShell = ({
  title,
  codeReference,
  visitedCount,
  totalCount,
  onBack,
  shellConfig,
  capabilities,
  content,
  children,
}: ViewportShellProps) => {
  const leftCollapsed = useViewportShellStore((s) => s.leftSidebarCollapsed)
  const rightCollapsed = useViewportShellStore((s) => s.rightSidebarCollapsed)
  const toggleLeft = useViewportShellStore((s) => s.toggleLeftSidebar)
  const toggleRight = useViewportShellStore((s) => s.toggleRightSidebar)
  const reset = useViewportShellStore((s) => s.reset)

  // Reset shell state on unmount
  useEffect(() => {
    return () => { reset() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resolve sidebar configs
  const leftCfg = resolveSidebar(shellConfig.leftSidebar)
  const rightCfg = resolveSidebar(shellConfig.rightSidebar)

  const leftWidth = leftCfg?.width ?? 280
  const rightWidth = rightCfg?.width ?? 320

  // Build CSS grid columns
  const gridTemplateColumns = useMemo(() => {
    const leftCol = leftCfg ? (leftCollapsed ? '0px' : `${leftWidth}px`) : ''
    const leftHandle = leftCfg ? `${HANDLE_WIDTH}px` : ''
    const rightHandle = rightCfg ? `${HANDLE_WIDTH}px` : ''
    const rightCol = rightCfg ? (rightCollapsed ? '0px' : `${rightWidth}px`) : ''

    const parts = [leftCol, leftHandle, '1fr', rightHandle, rightCol].filter(Boolean)
    return parts.join(' ')
  }, [leftCfg, rightCfg, leftCollapsed, rightCollapsed, leftWidth, rightWidth])

  // Apply default collapsed state on mount
  useEffect(() => {
    if (leftCfg?.defaultCollapsed) useViewportShellStore.getState().toggleLeftSidebar()
    if (rightCfg?.defaultCollapsed) useViewportShellStore.getState().toggleRightSidebar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial mobile tab
  useEffect(() => {
    const tabs = buildMobileTabs()
    if (tabs.length > 0) {
      useViewportShellStore.getState().setMobileTab(tabs[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Build mobile bottom sheet tabs
  const buildMobileTabs = useCallback(() => {
    const tabs: Array<{ id: string; label: string; content: ReactNode }> = []

    if (rightCfg && content.rightSidebarContent) {
      tabs.push({
        id: 'right',
        label: rightCfg.mobileTabLabel ?? 'Controls',
        content: content.rightSidebarContent,
      })
    }
    if (leftCfg && content.leftSidebarContent) {
      tabs.push({
        id: 'left',
        label: leftCfg.mobileTabLabel ?? 'Info',
        content: content.leftSidebarContent,
      })
    }
    return tabs
  }, [leftCfg, rightCfg, content.leftSidebarContent, content.rightSidebarContent])

  const mobileTabs = buildMobileTabs()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-surface-light">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <ViewportHeader
        title={title}
        codeReference={codeReference}
        visitedCount={visitedCount}
        totalCount={totalCount}
        onBack={onBack}
        className="flex-none z-20 shadow-md"
      />

      {/* ── Desktop: CSS Grid Layout ───────────────────────────────── */}
      <div
        className="hidden md:grid flex-1 min-h-0"
        style={{ gridTemplateColumns, gridTemplateRows: '1fr', transition: GRID_TRANSITION }}
      >
        {/* Left Sidebar */}
        {leftCfg && (
          <>
            <div
              className="overflow-hidden"
              style={{ display: leftCollapsed ? 'none' : undefined }}
            >
              <ViewportSidebar title={leftCfg.title}>
                {content.leftSidebarContent}
              </ViewportSidebar>
            </div>
            {leftCollapsed && <div />}
            <PanelCollapseButton side="left" collapsed={leftCollapsed} onToggle={toggleLeft} />
          </>
        )}

        {/* Viewport (1fr) */}
        <div className="relative overflow-hidden min-h-0 min-w-0">
          {/* Canvas content from template */}
          {content.canvasContent}

          {/* Floating toolbar */}
          <ViewportToolbar
            capabilities={capabilities}
            extras={content.toolbarExtras}
          />

          {/* Status bar */}
          {shellConfig.statusBar && content.statusBarContent && (
            <ViewportStatusBar>
              {content.statusBarContent}
            </ViewportStatusBar>
          )}
        </div>

        {/* Right Sidebar */}
        {rightCfg && (
          <>
            <PanelCollapseButton side="right" collapsed={rightCollapsed} onToggle={toggleRight} />
            <div
              className="overflow-hidden"
              style={{ display: rightCollapsed ? 'none' : undefined }}
            >
              <ViewportSidebar title={rightCfg.title}>
                {content.rightSidebarContent}
              </ViewportSidebar>
            </div>
            {rightCollapsed && <div />}
          </>
        )}
      </div>

      {/* ── Mobile: Flex Column + Bottom Sheet ─────────────────────── */}
      <div className="flex flex-1 flex-col min-h-0 md:hidden">
        {/* Canvas fills available space */}
        <div className="relative flex-1 overflow-hidden min-h-0">
          {content.canvasContent}

          <ViewportToolbar
            capabilities={capabilities}
            extras={content.toolbarExtras}
          />
        </div>

        {/* Bottom sheet replaces sidebars */}
        <ViewportBottomSheet tabs={mobileTabs} />
      </div>

      {/* Overlay children (onboarding, context card, etc.) */}
      {children}
    </div>
  )
}
