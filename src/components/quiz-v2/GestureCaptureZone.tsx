'use client'

import { useCallback, useRef } from 'react'
import type { GestureSignalEvent } from '@/types/patent'

/**
 * Targeted signal capture wrapper for SlideToSubmit.
 *
 * Captures pointer events ONLY within the slide gesture track area —
 * not the entire quiz body. This avoids interfering with answer option
 * clicks, scrolling, or other pointer interactions.
 *
 * On pointerUp, the captured signal buffer is passed to onBufferReady
 * so that the parent can include it in the submission.
 *
 * Patent Claims 1(a-b), 6, 14: Instrumented interaction region with
 * high-frequency signal capture.
 */

const MAX_BUFFER = 500

interface GestureCaptureZoneProps {
  children: React.ReactNode
  onBufferReady: (buffer: GestureSignalEvent[]) => void
}

export const GestureCaptureZone = ({ children, onBufferReady }: GestureCaptureZoneProps) => {
  const bufferRef = useRef<GestureSignalEvent[]>([])
  const capturingRef = useRef(false)
  const zoneRef = useRef<HTMLDivElement>(null)

  const captureEvent = useCallback(
    (e: React.PointerEvent, type: GestureSignalEvent['type']) => {
      const rect = zoneRef.current?.getBoundingClientRect()
      if (!rect) return

      const event: GestureSignalEvent = {
        timestamp: performance.now(),
        type,
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }

      // Touch pressure/contact area — Claim 6
      if (e.pressure > 0) event.pressure = e.pressure
      if (e.width > 0) event.contactWidth = e.width
      if (e.height > 0) event.contactHeight = e.height

      if (bufferRef.current.length >= MAX_BUFFER) {
        bufferRef.current.shift()
      }
      bufferRef.current.push(event)
    },
    [],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      capturingRef.current = true
      bufferRef.current = []
      captureEvent(e, 'start')
    },
    [captureEvent],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!capturingRef.current) return
      captureEvent(e, 'move')
    },
    [captureEvent],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!capturingRef.current) return
      captureEvent(e, 'end')
      capturingRef.current = false

      // Pass buffer to parent immediately
      if (bufferRef.current.length > 0) {
        onBufferReady([...bufferRef.current])
      }
    },
    [captureEvent, onBufferReady],
  )

  const handlePointerCancel = useCallback(() => {
    capturingRef.current = false
  }, [])

  return (
    <div
      ref={zoneRef}
      className="select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
    </div>
  )
}
