// src/components/r3f/useWebGLMemoryMonitor.ts
// Dev-only WebGL memory monitor hook.
// Reads gl.info.memory on an interval and logs a warning if geometry or texture
// counts grow monotonically over N consecutive samples — a signal of a leak.
//
// This hook is a no-op in production. It is safe to include in all scenes.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

const SAMPLE_INTERVAL_MS = 5_000
const LEAK_THRESHOLD_SAMPLES = 4 // warn after 4 consecutive increases (~20s)

/**
 * Watches WebGL memory counters in development mode.
 * Logs a warning to the console if geometries or textures grow monotonically
 * over several samples (indicative of a memory leak).
 *
 * No-op in production.
 */
export const useWebGLMemoryMonitor = (): void => {
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    let geometriesHistory: number[] = []
    let texturesHistory: number[] = []
    let consecutiveGeomIncreases = 0
    let consecutiveTexIncreases = 0

    const intervalId = setInterval(() => {
      const { geometries, textures } = gl.info.memory

      // Check geometry growth
      if (geometriesHistory.length > 0) {
        const prev = geometriesHistory[geometriesHistory.length - 1]
        if (geometries > prev) {
          consecutiveGeomIncreases++
          if (consecutiveGeomIncreases >= LEAK_THRESHOLD_SAMPLES) {
            console.warn(
              `[useWebGLMemoryMonitor] Geometry count growing monotonically: ${JSON.stringify(geometriesHistory.slice(-LEAK_THRESHOLD_SAMPLES))} → ${geometries}. Possible geometry leak.`,
            )
          }
        } else {
          consecutiveGeomIncreases = 0
        }
      }

      // Check texture growth
      if (texturesHistory.length > 0) {
        const prev = texturesHistory[texturesHistory.length - 1]
        if (textures > prev) {
          consecutiveTexIncreases++
          if (consecutiveTexIncreases >= LEAK_THRESHOLD_SAMPLES) {
            console.warn(
              `[useWebGLMemoryMonitor] Texture count growing monotonically: ${JSON.stringify(texturesHistory.slice(-LEAK_THRESHOLD_SAMPLES))} → ${textures}. Possible texture leak.`,
            )
          }
        } else {
          consecutiveTexIncreases = 0
        }
      }

      // Keep last N+1 samples for log context
      geometriesHistory = [...geometriesHistory, geometries].slice(-(LEAK_THRESHOLD_SAMPLES + 1))
      texturesHistory = [...texturesHistory, textures].slice(-(LEAK_THRESHOLD_SAMPLES + 1))
    }, SAMPLE_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [gl])
}
