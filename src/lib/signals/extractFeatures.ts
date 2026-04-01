// src/lib/signals/extractFeatures.ts
// CONFIDENTIAL — Trade Secret. Patent Claims 1(f), 4, 5, 8, 9, 12.
// Feature extraction formulas and thresholds are core trade secrets.
// SERVER-ONLY — must never run in client bundles.

import './server-only-guard'
import type { GestureSignalEvent, BehavioralFeatureVector } from '@/types/patent'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Euclidean distance between two points */
const dist = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

/** Standard deviation of an array of numbers */
const stdDev = (values: number[]): number => {
  if (values.length < 2) return 0
  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

// ─── Feature Extraction Pipeline ─────────────────────────────────────────────

/**
 * Extract behavioral features from raw gesture signal events.
 * This is the core trade-secret pipeline. All formulas, thresholds,
 * and normalization constants are proprietary.
 *
 * @param events - Raw gesture signal events from useGestureSignalCapture
 * @param assessmentContext - Item-level context for multi-signal fusion (Claim 12)
 */
export function extractFeatures(
  events: GestureSignalEvent[],
  assessmentContext: {
    timeOnTaskMs: number
    answerChangeCount: number
    itemDifficulty: number
  },
): BehavioralFeatureVector {
  const moveEvents = events.filter((e) => e.type === 'move')
  const startEvent = events.find((e) => e.type === 'start')
  const endEvent = events.findLast((e) => e.type === 'end')

  // ── Claim 1(f)(i): Interaction path metric ──────────────────────────────
  // Total displacement magnitude across interaction region
  let totalDisplacement = 0
  for (let i = 1; i < moveEvents.length; i++) {
    totalDisplacement += dist(
      moveEvents[i - 1].x,
      moveEvents[i - 1].y,
      moveEvents[i].x,
      moveEvents[i].y,
    )
  }

  // ── Claim 1(f)(ii): Temporal metric ─────────────────────────────────────
  // Duration from first event to last event
  const firstTs = startEvent?.timestamp ?? events[0]?.timestamp ?? 0
  const lastTs = endEvent?.timestamp ?? events[events.length - 1]?.timestamp ?? 0
  const temporalMetric = lastTs - firstTs

  // ── Claim 4: Velocity profile ───────────────────────────────────────────
  const velocities: number[] = []
  for (let i = 1; i < moveEvents.length; i++) {
    const dt = moveEvents[i].timestamp - moveEvents[i - 1].timestamp
    if (dt > 0) {
      const d = dist(
        moveEvents[i - 1].x,
        moveEvents[i - 1].y,
        moveEvents[i].x,
        moveEvents[i].y,
      )
      velocities.push(d / dt)
    }
  }
  const velocityMean =
    velocities.length > 0
      ? velocities.reduce((s, v) => s + v, 0) / velocities.length
      : 0
  const velocityMax = velocities.length > 0 ? Math.max(...velocities) : 0
  const velocityStdDev = stdDev(velocities)
  // Deliberate gestures have moderate, consistent velocity
  const isDeliberate = velocityMean > 0.0005 && velocityMean < 0.05 && velocityStdDev < velocityMean * 2

  // ── Claim 5(i): Path deviation ──────────────────────────────────────────
  // Deviation from straight-line trajectory (start → end)
  let pathDeviation = 0
  if (startEvent && endEvent && moveEvents.length > 2) {
    const lineStartX = startEvent.x
    const lineStartY = startEvent.y
    const lineEndX = endEvent.x
    const lineEndY = endEvent.y
    const lineLen = dist(lineStartX, lineStartY, lineEndX, lineEndY)

    if (lineLen > 0) {
      // Sum of perpendicular distances from each point to the ideal line
      let totalDeviation = 0
      for (const evt of moveEvents) {
        // Point-to-line distance formula
        const numerator = Math.abs(
          (lineEndY - lineStartY) * evt.x -
            (lineEndX - lineStartX) * evt.y +
            lineEndX * lineStartY -
            lineEndY * lineStartX,
        )
        totalDeviation += numerator / lineLen
      }
      pathDeviation = totalDeviation / moveEvents.length
    }
  }

  // ── Claim 5(ii): Dwell-time in sub-regions ──────────────────────────────
  // Divide interaction region into 4 equal zones (0-25%, 25-50%, 50-75%, 75-100%)
  const zones = [
    { zone: 'start', min: 0, max: 0.25 },
    { zone: 'early', min: 0.25, max: 0.5 },
    { zone: 'late', min: 0.5, max: 0.75 },
    { zone: 'end', min: 0.75, max: 1.0 },
  ]
  const dwellTimes = zones.map(({ zone, min, max }) => {
    let totalMs = 0
    for (let i = 1; i < events.length; i++) {
      if (events[i - 1].x >= min && events[i - 1].x < max) {
        totalMs += events[i].timestamp - events[i - 1].timestamp
      }
    }
    return { zone, ms: totalMs }
  })

  // ── Claim 5(iii): Reversal count ────────────────────────────────────────
  // Number of direction changes along the primary axis (x)
  let reversalCount = 0
  for (let i = 2; i < moveEvents.length; i++) {
    const prevDx = moveEvents[i - 1].x - moveEvents[i - 2].x
    const currDx = moveEvents[i].x - moveEvents[i - 1].x
    if ((prevDx > 0 && currDx < 0) || (prevDx < 0 && currDx > 0)) {
      reversalCount++
    }
  }

  // ── Claim 6: Pressure profile ───────────────────────────────────────────
  const pressures = events.filter((e) => e.pressure != null).map((e) => e.pressure!)
  const pressureMean =
    pressures.length > 0 ? pressures.reduce((s, v) => s + v, 0) / pressures.length : 0
  const pressureVariance =
    pressures.length > 1
      ? pressures.reduce((s, v) => s + (v - pressureMean) ** 2, 0) / (pressures.length - 1)
      : 0

  // ── Claim 8: Jerk metric ───────────────────────────────────────────────
  // Rate of change of acceleration → motor control smoothness
  const accelerations: number[] = []
  for (let i = 1; i < velocities.length; i++) {
    const dt = moveEvents[i + 1]
      ? moveEvents[i + 1].timestamp - moveEvents[i].timestamp
      : 1
    if (dt > 0) {
      accelerations.push((velocities[i] - velocities[i - 1]) / dt)
    }
  }
  let jerkMetric = 0
  for (let i = 1; i < accelerations.length; i++) {
    const dt = moveEvents[i + 2]
      ? moveEvents[i + 2].timestamp - moveEvents[i + 1].timestamp
      : 1
    if (dt > 0) {
      jerkMetric += Math.abs((accelerations[i] - accelerations[i - 1]) / dt)
    }
  }
  if (accelerations.length > 1) {
    jerkMetric /= accelerations.length - 1
  }

  // ── Claim 9: Sliding window micropatterns ───────────────────────────────
  // Detect micro-pauses, velocity bursts, and directional oscillations
  let pauseCount = 0
  let burstCount = 0
  let oscillationCount = 0
  const windowSize = 5

  for (let i = 0; i <= velocities.length - windowSize; i++) {
    const window = velocities.slice(i, i + windowSize)
    const windowMean = window.reduce((s, v) => s + v, 0) / windowSize

    // Micro-pause: window mean velocity near zero
    if (windowMean < 0.0001) pauseCount++

    // Velocity burst: sudden spike above 3x overall mean
    if (windowMean > velocityMean * 3 && velocityMean > 0) burstCount++

    // Oscillation: 3+ direction changes within window
    let windowReversals = 0
    for (let j = 1; j < window.length; j++) {
      if ((window[j] > window[j - 1] && j > 1 && window[j - 1] < window[j - 2]) ||
          (window[j] < window[j - 1] && j > 1 && window[j - 1] > window[j - 2])) {
        windowReversals++
      }
    }
    if (windowReversals >= 3) oscillationCount++
  }

  // ── Assemble feature vector ─────────────────────────────────────────────
  return {
    interactionPathMetric: totalDisplacement,
    temporalMetric,
    velocityProfile: {
      mean: velocityMean,
      max: velocityMax,
      stdDev: velocityStdDev,
      isDeliberate,
    },
    pathDeviation,
    dwellTimes,
    reversalCount,
    pressureProfile: {
      mean: pressureMean,
      variance: pressureVariance,
      available: pressures.length > 0,
    },
    jerkMetric,
    micropatterns: {
      pauseCount,
      burstCount,
      oscillationCount,
    },
    assessmentContext,
  }
}
