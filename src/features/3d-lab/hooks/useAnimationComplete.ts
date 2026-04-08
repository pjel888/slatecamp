import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'

/**
 * Wraps useFrame with completion detection.
 *
 * When `isComplete()` returns true the animation callback stops firing,
 * and `invalidate()` is called one final time so the last frame is rendered.
 * Call `reset()` to restart the animation (e.g. when parameters change).
 *
 * Designed for `frameloop="demand"` canvases — prevents stale useFrame
 * callbacks from keeping the GPU busy after an animation has settled.
 */
export const useAnimationComplete = (
  callback: (state: RootState, delta: number) => void,
  isComplete: () => boolean,
): { reset: () => void } => {
  const { invalidate } = useThree()
  const doneRef = useRef(false)

  useFrame((state, delta) => {
    if (doneRef.current) return

    callback(state, delta)

    if (isComplete()) {
      doneRef.current = true
      invalidate()
    }
  })

  const reset = useCallback(() => {
    doneRef.current = false
  }, [])

  return { reset }
}
