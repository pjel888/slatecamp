'use client'

import { type ReactNode } from 'react'
import {
  RotateCcw,
  Box,
  Layers,
  Maximize2,
  Grid3x3,
  Scan,
  PersonStanding,
} from 'lucide-react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { useLabViewStore } from '@/features/3d-lab/stores/useLabViewStore'
import type { ViewportCapabilities, ViewMode } from '@/features/3d-lab/types/templates'

interface ViewportToolbarProps {
  capabilities: ViewportCapabilities
  /** Template-specific extra controls (e.g., explode slider, timeline) */
  extras?: ReactNode
}

const VIEW_MODE_ICONS: Record<ViewMode, typeof Box> = {
  perspective: Box,
  orthographic: Grid3x3,
  isometric: Maximize2,
  'top-down': Scan,
}

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  perspective: 'Perspective',
  orthographic: 'Ortho',
  isometric: 'Iso',
  'top-down': 'Top',
}

/**
 * ViewportToolbar — Floating toolbar for all 3D Lab modules.
 * Config-driven: only shows buttons for capabilities the module declares.
 * Position: bottom-center of viewport, above canvas content.
 * DOM-rendered — zero WebGL cost.
 */
export const ViewportToolbar = ({
  capabilities,
  extras,
}: ViewportToolbarProps) => {
  const activeViewMode = useViewportShellStore((s) => s.activeViewMode)
  const setViewMode = useViewportShellStore((s) => s.setViewMode)
  const crossSectionEnabled = useLabViewStore((s) => s.crossSectionEnabled)
  const toggleCrossSection = useLabViewStore((s) => s.toggleCrossSection)
  const explodedViewEnabled = useLabViewStore((s) => s.explodedViewEnabled)
  const toggleExplodedView = useLabViewStore((s) => s.toggleExplodedView)
  const resetCamera = useLabViewStore((s) => s.resetCamera)

  const viewModes = capabilities.viewModes ?? []
  const showCrossSection = !!capabilities.crossSection
  const showExplodedView = !!capabilities.explodedView
  const showHumanScale = !!capabilities.humanScale
  const showReset = capabilities.resetCamera !== false

  const hasViewModes = viewModes.length > 1
  const hasToggles = showCrossSection || showExplodedView || showHumanScale
  const hasActions = showReset

  // Don't render if nothing to show
  if (!hasViewModes && !hasToggles && !hasActions && !extras) return null

  return (
    <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 pointer-events-auto">
      <div className="flex items-center gap-0.5 rounded-sm border border-border bg-card/95 backdrop-blur-sm px-1 py-0.5 shadow-md">
        {/* Group 1: View Modes */}
        {hasViewModes && (
          <>
            {viewModes.map((mode) => {
              const Icon = VIEW_MODE_ICONS[mode]
              const isActive = activeViewMode === mode
              return (
                <ToolbarButton
                  key={mode}
                  icon={<Icon size={14} />}
                  label={VIEW_MODE_LABELS[mode]}
                  active={isActive}
                  onClick={() => setViewMode(mode)}
                />
              )
            })}
            {(hasToggles || hasActions || extras) && <ToolbarDivider />}
          </>
        )}

        {/* Group 2: Scene Toggles */}
        {showCrossSection && (
          <ToolbarButton
            icon={<Layers size={14} />}
            label="Section"
            active={crossSectionEnabled}
            onClick={toggleCrossSection}
          />
        )}
        {showExplodedView && (
          <ToolbarButton
            icon={<Maximize2 size={14} />}
            label="Explode"
            active={explodedViewEnabled}
            onClick={toggleExplodedView}
          />
        )}
        {showHumanScale && (
          <ToolbarButton
            icon={<PersonStanding size={14} />}
            label="Scale"
            active={false}
            onClick={() => {/* TODO: wire human scale toggle */}}
          />
        )}
        {hasToggles && (hasActions || extras) && <ToolbarDivider />}

        {/* Template extras */}
        {extras}

        {/* Group 3: Actions */}
        {showReset && (
          <ToolbarButton
            icon={<RotateCcw size={14} />}
            label="Reset"
            active={false}
            onClick={resetCamera}
          />
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

const ToolbarButton = ({ icon, label, active, onClick }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className={`flex items-center justify-center w-7 h-7 rounded-xs transition-colors duration-150 ${
      active
        ? 'bg-primary text-white'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    {icon}
  </button>
)

const ToolbarDivider = () => (
  <div className="mx-0.5 h-4 w-px bg-border" />
)
