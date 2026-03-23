'use client'

import { useState } from 'react'

interface PresetViewButtonsProps {
  presetViews: {
    plan?: [number, number, number]
    section?: [number, number, number]
    elevation?: [number, number, number]
  }
  activeView: string
  onViewChange: (view: string, position: [number, number, number]) => void
  defaultCameraPosition: [number, number, number]
}

const PILL_BG = 'rgba(20,23,36,0.92)'
const BTN_ACTIVE_BG = '#1B3FC4'
const BTN_HOVER_BG = 'rgba(255,255,255,0.12)'
const TEXT_DEFAULT = 'rgba(255,255,255,0.55)'
const TEXT_ACTIVE = '#ffffff'

interface ViewButtonProps {
  label: string
  viewKey: string
  isActive: boolean
  onClick: () => void
}

const ViewButton = ({ label, viewKey, isActive, onClick }: ViewButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const getBg = () => {
    if (isActive) return BTN_ACTIVE_BG
    if (isHovered) return BTN_HOVER_BG
    return 'transparent'
  }

  const getColor = () => {
    if (isActive) return TEXT_ACTIVE
    if (isHovered) return 'rgba(255,255,255,0.85)'
    return TEXT_DEFAULT
  }

  return (
    <button
      aria-label={`Switch to ${label} view`}
      aria-pressed={isActive}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '36px',
        paddingLeft: '12px',
        paddingRight: '12px',
        borderRadius: '6px',
        backgroundColor: getBg(),
        color: getColor(),
        fontFamily: '"DM Mono", monospace',
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background-color 150ms ease-out, color 150ms ease-out',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}

export const PresetViewButtons = ({
  presetViews,
  activeView,
  onViewChange,
  defaultCameraPosition,
}: PresetViewButtonsProps) => {
  // Build the list of available buttons — "3D" is always shown
  const buttons: Array<{ label: string; viewKey: string; position: [number, number, number] }> = []

  if (presetViews.plan) {
    buttons.push({ label: 'Plan', viewKey: 'plan', position: presetViews.plan })
  }

  if (presetViews.section) {
    buttons.push({ label: 'Section', viewKey: 'section', position: presetViews.section })
  }

  if (presetViews.elevation) {
    buttons.push({ label: 'Elevation', viewKey: 'elevation', position: presetViews.elevation })
  }

  // Always include 3D
  buttons.push({ label: '3D', viewKey: '3d', position: defaultCameraPosition })

  // Only render if there's more than just the 3D button
  if (buttons.length <= 1) return null

  return (
    <div
      style={{
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '8px',
          gap: '4px',
          backgroundColor: PILL_BG,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
        }}
      >
        {buttons.map((btn) => (
          <ViewButton
            key={btn.viewKey}
            label={btn.label}
            viewKey={btn.viewKey}
            isActive={activeView === btn.viewKey}
            onClick={() => onViewChange(btn.viewKey, btn.position)}
          />
        ))}
      </div>
    </div>
  )
}
