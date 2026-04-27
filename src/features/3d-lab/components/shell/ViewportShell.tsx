'use client'

import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { ViewportHeader } from './ViewportHeader'
import { ViewportSidebar } from './ViewportSidebar'
// ViewportToolbar import removed — DEPRECATED in Phase 5. SceneToolbar + CameraNavigationBar replace it.
// File kept at ./ViewportToolbar.tsx for reference during toolbarExtras migration.
import { SceneToolbar } from './SceneToolbar'
import { CameraNavigationBar } from './CameraNavigationBar'
import { LayersPanel } from './LayersPanel'
import { ViewportStatusBar } from './ViewportStatusBar'
import { ViewportBottomSheet } from './ViewportBottomSheet'
import { PanelCollapseButton } from './PanelCollapseButton'
import { useViewportShortcuts } from '@/features/3d-lab/hooks/useViewportShortcuts'
import { WebGLRecovery } from './WebGLRecovery'
import { ViewportToast } from './ViewportToast'
import { ViewportContextMenu } from './ViewportContextMenu'
import { CommandPalette } from './CommandPalette'
import { FirstTimeTooltip } from './FirstTimeTooltip'
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

  /** Suppress first-run viewport tooltip while a higher-priority tutorial owns focus */
  suppressFirstTimeTooltip?: boolean
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
  capabilities: _capabilities,
  content,
  children,
  suppressFirstTimeTooltip = false,
}: ViewportShellProps) => {
  useViewportShortcuts()

  const leftCollapsed = useViewportShellStore((s) => s.leftSidebarCollapsed)
  const rightCollapsed = useViewportShellStore((s) => s.rightSidebarCollapsed)
  const toggleLeft = useViewportShellStore((s) => s.toggleLeftSidebar)
  const toggleRight = useViewportShellStore((s) => s.toggleRightSidebar)
  const reset = useViewportShellStore((s) => s.reset)
  const navMode = useViewportShellStore((s) => s.navMode)
  const activeInteraction = useViewportShellStore((s) => s.activeInteraction)

  // ─── Dynamic cursor based on nav mode + active interaction ─────────────────
  // 16×16 SVG data-URI cursors matching the CameraNavigationBar icons
  // Orbit: Lucide Rotate3d icon | Pan: native grab/grabbing
  const ORBIT_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2'/%3E%3Cpath d='m15.194 13.707 3.814 1.86-1.86 3.814'/%3E%3Cpath d='M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4'/%3E%3C/svg%3E") 8 8, all-scroll`
  const ORBITING_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231B3FC4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2'/%3E%3Cpath d='m15.194 13.707 3.814 1.86-1.86 3.814'/%3E%3Cpath d='M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4'/%3E%3C/svg%3E") 8 8, all-scroll`

  const viewportCursor = useMemo(() => {
    // During active interaction, show the engaged cursor
    if (activeInteraction === 'panning') return 'grabbing'
    if (activeInteraction === 'orbiting') return ORBITING_CURSOR
    // Idle cursors per mode
    if (navMode === 'pan') return 'grab'
    return ORBIT_CURSOR
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navMode, activeInteraction])

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

  // Build mobile bottom sheet tabs — defined before useEffects that reference it
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-surface-light" data-viewport-shell>
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
        <div className="relative overflow-hidden min-h-0 min-w-0" style={{ cursor: viewportCursor }}>
          {/* Canvas content from template */}
          {content.canvasContent}

          {/* Viewport controls — rendered here ONLY when ViewportShell manages sidebars.
              For bespoke modules (DevControls) that manage their own internal layout,
              these controls are positioned in their own ViewportWrapper instead,
              so they align with the actual 3D canvas area, not the full shell width. */}
          {(leftCfg || rightCfg) && (
            <>
              <SceneToolbar />
              <LayersPanel />
              <CameraNavigationBar />
            </>
          )}

          {/* WebGL context loss recovery overlay */}
          <WebGLRecovery />

          {/* Non-blocking viewport toasts (warnings, errors) */}
          <ViewportToast />

          {/* First-time onboarding tooltip — auto-dismisses after 8s, stored in localStorage */}
          <FirstTimeTooltip disabled={suppressFirstTimeTooltip} />

          {/* DEPRECATED: Old ViewportToolbar replaced by SceneToolbar (top-left) + CameraNavigationBar (bottom-center) in Phase 0A.
              Template-specific extras (explode slider, cut depth) need migration to SceneToolbar popover — tracked as Phase 3 follow-up.
              Keeping import but not rendering to avoid breaking toolbarExtras consumers during transition. */}
          {content.toolbarExtras && (
            <div className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 pointer-events-auto">
              {content.toolbarExtras}
            </div>
          )}

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
        <div className="relative flex-1 overflow-hidden min-h-0" style={{ cursor: viewportCursor }}>
          {content.canvasContent}

          {/* Viewport controls — only when shell manages sidebars (see desktop comment) */}
          {(leftCfg || rightCfg) && (
            <>
              <SceneToolbar />
              <LayersPanel />
              <CameraNavigationBar />
            </>
          )}

          {/* WebGL context loss recovery overlay */}
          <WebGLRecovery />

          {/* Non-blocking viewport toasts (warnings, errors) */}
          <ViewportToast />

          {/* DEPRECATED: See desktop viewport comment above */}
          {content.toolbarExtras && (
            <div className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 pointer-events-auto">
              {content.toolbarExtras}
            </div>
          )}
        </div>

        {/* Bottom sheet replaces sidebars */}
        <ViewportBottomSheet tabs={mobileTabs} />
      </div>

      {/* Overlay children (onboarding, context card, etc.) */}
      {children}

      {/* Right-click context menu */}
      <ViewportContextMenu />

      {/* Command palette — Ctrl+K or F3 */}
      <CommandPalette />
    </div>
  )
}
