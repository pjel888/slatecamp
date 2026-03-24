// src/lib/lab-analytics.ts — Telemetry event definitions and dispatch
// Every behavioral threshold is instrumented for future A/B testing.

import type { TelemetryEvent } from '@/types/3d-lab'

const IS_DEV = process.env.NODE_ENV === 'development'

const eventQueue: TelemetryEvent[] = []
const FLUSH_INTERVAL_MS = 5_000
const MAX_QUEUE_SIZE = 50

// Dispatch a telemetry event. Batches and sends to analytics endpoint in production.
export const trackLabEvent = (
  moduleSlug: string,
  event: string,
  payload: Record<string, unknown> = {}
) => {
  const telemetryEvent: TelemetryEvent = {
    moduleSlug,
    event,
    timestamp: Date.now(),
    payload,
  }

  eventQueue.push(telemetryEvent)

  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents()
  }
}

// Flush queued events to the analytics endpoint
const flushEvents = async () => {
  if (eventQueue.length === 0) return

  const batch = eventQueue.splice(0, eventQueue.length)

  try {
    // TODO: Replace with actual analytics endpoint
    if (!IS_DEV) {
      await fetch('/api/analytics/3d-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      })
    }
  } catch {
    // Re-queue failed events (capped to prevent memory leak)
    if (eventQueue.length < MAX_QUEUE_SIZE * 2) {
      eventQueue.unshift(...batch)
    }
  }
}

// Start periodic flush
if (typeof window !== 'undefined') {
  setInterval(flushEvents, FLUSH_INTERVAL_MS)

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    flushEvents()
  })
}

// Pre-defined event helpers for type safety
export const labEvents = {
  moduleLoaded: (slug: string, loadTimeMs: number, modelSizeMB: number) =>
    trackLabEvent(slug, 'module_loaded', { loadTimeMs, modelSizeMB }),

  timeToFirstHotspot: (slug: string, durationMs: number) =>
    trackLabEvent(slug, 'time_to_first_hotspot', { durationMs }),

  hotspotOpened: (slug: string, hotspotId: string, type: string, sequenceOrder: number) =>
    trackLabEvent(slug, 'hotspot_opened', { hotspotId, type, sequenceOrder }),

  questionAnswered: (slug: string, questionId: string, correct: boolean, selectedOptionId: string, timeMs: number) =>
    trackLabEvent(slug, 'question_answered', { questionId, correct, selectedOptionId, timeMs }),

  sliderAdjusted: (slug: string, controlId: string, value: number, isViolation: boolean) =>
    trackLabEvent(slug, 'slider_adjusted', { controlId, value, isViolation }),

  orbitVelocity: (slug: string, angularVelocity: number) =>
    trackLabEvent(slug, 'orbit_velocity', { angularVelocity }),

  zoomCycle: (slug: string, count: number, windowMs: number) =>
    trackLabEvent(slug, 'zoom_cycle', { count, windowMs }),

  idleDetected: (slug: string, durationMs: number) =>
    trackLabEvent(slug, 'idle_detected', { durationMs }),

  modeSwitch: (slug: string, from: string, to: string, trigger: string) =>
    trackLabEvent(slug, 'mode_switch', { from, to, trigger }),

  presetViewUsed: (slug: string, viewName: string) =>
    trackLabEvent(slug, 'preset_view_used', { viewName }),

  quizCompleted: (slug: string, score: number, total: number, timeMs: number) =>
    trackLabEvent(slug, 'quiz_completed', { score, total, timeMs }),

  moduleExited: (slug: string, completionPercent: number, totalTimeMs: number) =>
    trackLabEvent(slug, 'module_exited', { completionPercent, totalTimeMs }),
}
