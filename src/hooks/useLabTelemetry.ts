// src/hooks/useLabTelemetry.ts — Behavioral event tracking hook
// Tracks signals that drive adaptive scaffolding (disorientation, idle, expertise).

'use client'

import { useRef, useCallback, useEffect } from 'react'
import { labEvents } from '@/lib/lab-analytics'

interface TelemetryConfig {
  moduleSlug: string
  // Configurable thresholds for future A/B testing
  disorientation1Ms?: number   // First intervention (default: 90s)
  disorientation2Ms?: number   // Second intervention (default: 180s)
  idleThresholdMs?: number     // Idle detection (default: 10s)
  lingerThresholdMs?: number   // Linger on hotspot (default: 45s)
  erraticVelocityDeg?: number  // Erratic rotation threshold (default: 90°/s)
  zoomCycleCount?: number      // Zoom cycle detection (default: 3 in 5s)
  zoomCycleWindowMs?: number   // Zoom cycle window (default: 5000ms)
}

interface TelemetryCallbacks {
  onDisorientation1?: () => void
  onDisorientation2?: () => void
  onIdle?: () => void
  onLinger?: () => void
  onExpertSignal?: () => void
}

export const useLabTelemetry = (
  config: TelemetryConfig,
  callbacks?: TelemetryCallbacks
) => {
  const {
    moduleSlug,
    disorientation1Ms = 90_000,
    disorientation2Ms = 180_000,
    idleThresholdMs = 10_000,
    lingerThresholdMs = 45_000,
    erraticVelocityDeg = 90,
    zoomCycleCount = 3,
    zoomCycleWindowMs = 5_000,
  } = config

  const moduleLoadTime = useRef(Date.now())
  const lastInteractionTime = useRef(Date.now())
  const firstHotspotClicked = useRef(false)
  const hotspotOpenTime = useRef<number | null>(null)
  const zoomTimestamps = useRef<number[]>([])
  const disorientation1Fired = useRef(false)
  const disorientation2Fired = useRef(false)
  const idleFired = useRef(false)
  const consecutiveDirectZooms = useRef(0)

  // Track any user interaction
  const recordInteraction = useCallback(() => {
    lastInteractionTime.current = Date.now()
    idleFired.current = false
  }, [])

  // Track first hotspot click (time-to-first-hotspot metric)
  const recordHotspotOpen = useCallback((hotspotId: string, type: string, sequenceOrder: number) => {
    recordInteraction()
    if (!firstHotspotClicked.current) {
      firstHotspotClicked.current = true
      const durationMs = Date.now() - moduleLoadTime.current
      labEvents.timeToFirstHotspot(moduleSlug, durationMs)
    }
    hotspotOpenTime.current = Date.now()
    labEvents.hotspotOpened(moduleSlug, hotspotId, type, sequenceOrder)
  }, [moduleSlug, recordInteraction])

  // Track orbit velocity for disorientation detection
  const recordOrbitVelocity = useCallback((angularVelocityDeg: number) => {
    recordInteraction()
    if (angularVelocityDeg > erraticVelocityDeg) {
      labEvents.orbitVelocity(moduleSlug, angularVelocityDeg)
    }
  }, [moduleSlug, erraticVelocityDeg, recordInteraction])

  // Track zoom events for cycle detection
  const recordZoom = useCallback(() => {
    recordInteraction()
    const now = Date.now()
    zoomTimestamps.current.push(now)
    // Clean old timestamps outside window
    zoomTimestamps.current = zoomTimestamps.current.filter(
      (t) => now - t < zoomCycleWindowMs
    )
    if (zoomTimestamps.current.length >= zoomCycleCount) {
      labEvents.zoomCycle(moduleSlug, zoomTimestamps.current.length, zoomCycleWindowMs)
      zoomTimestamps.current = []
    }
  }, [moduleSlug, zoomCycleCount, zoomCycleWindowMs, recordInteraction])

  // Track direct zoom to element (expert signal)
  const recordDirectZoom = useCallback(() => {
    consecutiveDirectZooms.current += 1
    if (consecutiveDirectZooms.current >= 3) {
      callbacks?.onExpertSignal?.()
      consecutiveDirectZooms.current = 0
    }
  }, [callbacks])

  // Reset direct zoom counter on non-direct interaction
  const resetDirectZoomCounter = useCallback(() => {
    consecutiveDirectZooms.current = 0
  }, [])

  // Idle and disorientation detection interval
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteractionTime.current
      const timeSinceLoad = Date.now() - moduleLoadTime.current

      // Idle detection
      if (timeSinceInteraction > idleThresholdMs && !idleFired.current) {
        idleFired.current = true
        labEvents.idleDetected(moduleSlug, timeSinceInteraction)
        callbacks?.onIdle?.()
      }

      // Disorientation detection (time since load without first hotspot)
      if (!firstHotspotClicked.current) {
        if (timeSinceLoad > disorientation2Ms && !disorientation2Fired.current) {
          disorientation2Fired.current = true
          callbacks?.onDisorientation2?.()
        } else if (timeSinceLoad > disorientation1Ms && !disorientation1Fired.current) {
          disorientation1Fired.current = true
          callbacks?.onDisorientation1?.()
        }
      }

      // Linger detection (time on single hotspot)
      if (hotspotOpenTime.current) {
        const lingerTime = Date.now() - hotspotOpenTime.current
        if (lingerTime > lingerThresholdMs) {
          callbacks?.onLinger?.()
          hotspotOpenTime.current = null // Only fire once per hotspot
        }
      }
    }, 1_000)

    return () => clearInterval(interval)
  }, [
    moduleSlug,
    idleThresholdMs,
    disorientation1Ms,
    disorientation2Ms,
    lingerThresholdMs,
    callbacks,
  ])

  // Track module exit on unmount
  useEffect(() => {
    return () => {
      const totalTimeMs = Date.now() - moduleLoadTime.current
      labEvents.moduleExited(moduleSlug, 0, totalTimeMs)
    }
  }, [moduleSlug])

  return {
    recordInteraction,
    recordHotspotOpen,
    recordOrbitVelocity,
    recordZoom,
    recordDirectZoom,
    resetDirectZoomCounter,
  }
}
