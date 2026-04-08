'use client'

import { useEffect, useRef, useState } from 'react'
import { useOverlayStore } from '../../stores/useOverlayStore'
import { useWorldToScreen } from '../../hooks/useWorldToScreen'
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
  const [, forceUpdate] = useState(0)

  // Sync with render loop via rAF
  useEffect(() => {
    let rafId: number
    const loop = () => {
      forceUpdate((n) => n + 1)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

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
