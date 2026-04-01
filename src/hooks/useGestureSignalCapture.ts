'use client'

import { useRef, useCallback } from 'react'
import type { GestureSignalEvent } from '@/types/patent'

interface UseGestureSignalCaptureReturn {
  /** Attach to the gesture element's onPointerDown */
  handlePointerDown: (e: React.PointerEvent) => void
  /** Attach to the gesture element's onPointerMove */
  handlePointerMove: (e: React.PointerEvent) => void
  /** Attach to the gesture element's onPointerUp */
  handlePointerUp: (e: React.PointerEvent) => void
  /** Get the current signal buffer (call on submission) */
  getSignalBuffer: () => GestureSignalEvent[]
  /** Reset the buffer (call on new question) */
  resetBuffer: () => void
  /** Whether capture is currently active */
  isCapturing: boolean
}

const MAX_BUFFER_SIZE = 500 // Ring buffer cap

export function useGestureSignalCapture(): UseGestureSignalCaptureReturn {
  const bufferRef = useRef<GestureSignalEvent[]>([])
  const capturingRef = useRef(false)
  const regionRectRef = useRef<DOMRect | null>(null)

  const captureEvent = useCallback((e: React.PointerEvent, type: GestureSignalEvent['type']) => {
    // Normalize coordinates to interaction region
    const rect = regionRectRef.current
    const x = rect ? (e.clientX - rect.left) / rect.width : e.clientX
    const y = rect ? (e.clientY - rect.top) / rect.height : e.clientY

    const event: GestureSignalEvent = {
      timestamp: performance.now(),
      type,
      x,
      y,
    }

    // Touch/pointer pressure — Claim 6
    if (e.pressure !== undefined && e.pressure > 0) {
      event.pressure = e.pressure
    }
    if (e.width !== undefined && e.width > 0) {
      event.contactWidth = e.width
    }
    if (e.height !== undefined && e.height > 0) {
      event.contactHeight = e.height
    }

    // Ring buffer — cap at MAX_BUFFER_SIZE
    if (bufferRef.current.length >= MAX_BUFFER_SIZE) {
      bufferRef.current.shift()
    }
    bufferRef.current.push(event)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    capturingRef.current = true
    regionRectRef.current = (e.currentTarget as HTMLElement).getBoundingClientRect()
    bufferRef.current = [] // Reset on new gesture
    captureEvent(e, 'start')
  }, [captureEvent])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!capturingRef.current) return
    captureEvent(e, 'move')
  }, [captureEvent])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!capturingRef.current) return
    captureEvent(e, 'end')
    capturingRef.current = false
  }, [captureEvent])

  const getSignalBuffer = useCallback(() => [...bufferRef.current], [])

  const resetBuffer = useCallback(() => {
    bufferRef.current = []
    capturingRef.current = false
    regionRectRef.current = null
  }, [])

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getSignalBuffer,
    resetBuffer,
    get isCapturing() { return capturingRef.current },
  }
}
