'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useOverlayStore } from '../../stores/useOverlayStore'
import { useWorldToScreen } from '../../hooks/useWorldToScreen'
import { useViewportShellStore } from '../../stores/useViewportShellStore'
import { LabelOverlay } from './LabelOverlay'
import { HotspotCard } from './HotspotCard'
import { ViolationBadge } from './ViolationBadge'
import { DimensionLabel } from './DimensionLabel'
import type {
  LabelPayload,
  HotspotPayload,
  ViolationPayload,
  DimensionPayload,
} from '../../stores/useOverlayStore'

interface DOMOverlayLayerProps {
  className?: string
}

export const DOMOverlayLayer = ({ className }: DOMOverlayLayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useOverlayStore((s) => s.items)
  const worldToScreen = useWorldToScreen()
  const activeInteraction = useViewportShellStore((s) => s.activeInteraction)
  const cameraCommandId = useViewportShellStore((s) => s.cameraCommandId)
  const [, forceUpdate] = useState(0)

  const hasVisibleItems = useMemo(
    () => Array.from(items.values()).some((item) => item.visible),
    [items],
  )

  // Immediate refresh when overlay content changes.
  useEffect(() => {
    forceUpdate((n) => n + 1)
  }, [items, worldToScreen, cameraCommandId])

  // Only animate overlay projection while the camera is actively moving:
  // user orbit/pan interactions or a short preset-transition window.
  useEffect(() => {
    if (!hasVisibleItems) {
      return undefined
    }

    let rafId: number | null = null
    let stopTimer: number | null = null

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }

      if (stopTimer !== null) {
        window.clearTimeout(stopTimer)
        stopTimer = null
      }
    }

    const loop = () => {
      forceUpdate((n) => n + 1)
      rafId = requestAnimationFrame(loop)
    }

    if (activeInteraction !== 'idle') {
      rafId = requestAnimationFrame(loop)
      return stopLoop
    }

    if (cameraCommandId > 0) {
      rafId = requestAnimationFrame(loop)
      stopTimer = window.setTimeout(stopLoop, 900)
      return stopLoop
    }

    return stopLoop
  }, [activeInteraction, cameraCommandId, hasVisibleItems])

  const container = containerRef.current
  const w = container?.clientWidth ?? 0
  const h = container?.clientHeight ?? 0

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className ?? ''}`}
      aria-live="polite"
    >
      {Array.from(items.values()).map((item) => {
        if (!item.visible) return null
        const { x, y, visible } = worldToScreen(item.worldPosition, w, h)
        if (!visible) return null

        const style: React.CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          zIndex: item.zIndex ?? 10,
          pointerEvents: item.type === 'hotspot' ? 'auto' : 'none',
        }

        switch (item.type) {
          case 'label':
          case 'area-tag':
            return (
              <LabelOverlay
                key={item.id}
                style={style}
                payload={item.payload as LabelPayload}
              />
            )
          case 'hotspot':
            return (
              <HotspotCard
                key={item.id}
                id={item.id}
                style={style}
                payload={item.payload as HotspotPayload}
              />
            )
          case 'violation':
            return (
              <ViolationBadge
                key={item.id}
                style={style}
                payload={item.payload as ViolationPayload}
              />
            )
          case 'dimension':
            return (
              <DimensionLabel
                key={item.id}
                style={style}
                payload={item.payload as DimensionPayload}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
