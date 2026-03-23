'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ArrowsClockwise,
  Scissors,
  ArrowsOut,
  ArrowCounterClockwise,
  TextT,
  Question,
} from '@phosphor-icons/react'
import { useLabStore } from '@/stores/useLabStore'

interface ToolPaletteProps {
  supportsCrossSection: boolean
  supportsExplodedView: boolean
  onResetCamera: () => void
}

interface TooltipState {
  visible: boolean
  label: string
  buttonIndex: number
}

const PILL_BG = 'rgba(20,23,36,0.92)'
const BTN_DEFAULT_BG = 'rgba(255,255,255,0.06)'
const BTN_HOVER_BG = 'rgba(255,255,255,0.12)'
const BTN_ACTIVE_BG = '#1B3FC4'
const BTN_DISABLED_BG = 'rgba(255,255,255,0.02)'
const ICON_DEFAULT = 'rgba(255,255,255,0.55)'
const ICON_HOVER = 'rgba(255,255,255,0.85)'
const ICON_ACTIVE = '#ffffff'
const ICON_DISABLED = 'rgba(255,255,255,0.2)'
const TOOLTIP_BG = 'rgba(20,23,36,0.95)'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  isDisabled?: boolean
  isFlash?: boolean
  onClick: () => void
  buttonIndex: number
  onTooltipShow: (index: number, label: string) => void
  onTooltipHide: () => void
}

const ToolButton = ({
  icon,
  label,
  isActive = false,
  isDisabled = false,
  isFlash = false,
  onClick,
  buttonIndex,
  onTooltipShow,
  onTooltipHide,
}: ToolButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getBg = () => {
    if (isDisabled) return BTN_DISABLED_BG
    if (isActive || isFlash) return BTN_ACTIVE_BG
    if (isHovered) return BTN_HOVER_BG
    return BTN_DEFAULT_BG
  }

  const getIconColor = () => {
    if (isDisabled) return ICON_DISABLED
    if (isActive || isFlash) return ICON_ACTIVE
    if (isHovered) return ICON_HOVER
    return ICON_DEFAULT
  }

  const handleMouseEnter = () => {
    if (isDisabled) return
    setIsHovered(true)
    tooltipTimerRef.current = setTimeout(() => {
      onTooltipShow(buttonIndex, label)
    }, 200)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
      tooltipTimerRef.current = null
    }
    onTooltipHide()
  }

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    }
  }, [])

  return (
    /* 44px touch target via padding, 36px visible via inner div */
    <button
      aria-label={label}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        background: 'transparent',
        border: 'none',
        padding: '4px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '7px',
          backgroundColor: getBg(),
          color: getIconColor(),
          transition: 'background-color 150ms ease-out, color 150ms ease-out',
        }}
      >
        {icon}
      </div>
    </button>
  )
}

export const ToolPalette = ({
  supportsCrossSection,
  supportsExplodedView,
  onResetCamera,
}: ToolPaletteProps) => {
  const crossSectionEnabled = useLabStore((s) => s.crossSectionEnabled)
  const explodedViewEnabled = useLabStore((s) => s.explodedViewEnabled)
  const labelsVisible = useLabStore((s) => s.labelsVisible)
  const toggleCrossSection = useLabStore((s) => s.toggleCrossSection)
  const toggleExplodedView = useLabStore((s) => s.toggleExplodedView)
  const toggleLabels = useLabStore((s) => s.toggleLabels)

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    label: '',
    buttonIndex: -1,
  })
  const [resetFlash, setResetFlash] = useState(false)
  const [helpFlash, setHelpFlash] = useState(false)

  const handleResetCamera = () => {
    onResetCamera()
    setResetFlash(true)
    setTimeout(() => setResetFlash(false), 300)
  }

  const handleHelp = () => {
    setHelpFlash(true)
    setTimeout(() => setHelpFlash(false), 300)
  }

  const showTooltip = (index: number, label: string) => {
    setTooltip({ visible: true, label, buttonIndex: index })
  }

  const hideTooltip = () => {
    setTooltip({ visible: false, label: '', buttonIndex: -1 })
  }

  const buttons = [
    {
      icon: <ArrowsClockwise size={16} weight="regular" />,
      label: 'Orbit',
      isActive: true,
      isDisabled: false,
      isFlash: false,
      onClick: () => {},
    },
    {
      icon: <Scissors size={16} weight="regular" />,
      label: 'Cross-section',
      isActive: crossSectionEnabled,
      isDisabled: !supportsCrossSection,
      isFlash: false,
      onClick: toggleCrossSection,
    },
    {
      icon: <ArrowsOut size={16} weight="regular" />,
      label: 'Explode view',
      isActive: explodedViewEnabled,
      isDisabled: !supportsExplodedView,
      isFlash: false,
      onClick: toggleExplodedView,
    },
    {
      icon: <ArrowCounterClockwise size={16} weight="regular" />,
      label: 'Reset camera',
      isActive: false,
      isDisabled: false,
      isFlash: resetFlash,
      onClick: handleResetCamera,
    },
    {
      icon: <TextT size={16} weight="regular" />,
      label: 'Toggle labels',
      isActive: labelsVisible,
      isDisabled: false,
      isFlash: false,
      onClick: toggleLabels,
    },
    {
      icon: <Question size={16} weight="regular" />,
      label: 'Controls help',
      isActive: false,
      isDisabled: false,
      isFlash: helpFlash,
      onClick: handleHelp,
    },
  ]

  return (
    <div
      style={{ zIndex: 50 }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '8px',
          gap: '6px',
          backgroundColor: PILL_BG,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
        }}
      >
        {/* Tooltip rendered inside the pill container */}
        {tooltip.visible && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: `${tooltip.buttonIndex * 50 + 22}px`,
              transform: 'translateX(-50%)',
              backgroundColor: TOOLTIP_BG,
              color: '#ffffff',
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 60,
            }}
          >
            {tooltip.label}
          </div>
        )}

        {buttons.map((btn, i) => (
          <ToolButton
            key={btn.label}
            icon={btn.icon}
            label={btn.label}
            isActive={btn.isActive}
            isDisabled={btn.isDisabled}
            isFlash={btn.isFlash}
            onClick={btn.onClick}
            buttonIndex={i}
            onTooltipShow={showTooltip}
            onTooltipHide={hideTooltip}
          />
        ))}
      </div>
    </div>
  )
}
