// src/features/3d-lab/hooks/useCameraTransition.ts
// Animated camera transition hook with demand-frameloop invalidation.
// During transition, calls invalidate() every frame to drive the lerp.
// After transition completes, stops calling invalidate() (returns to demand mode).

import { useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'

interface CameraTransitionTarget {
  position: [number, number, number]
  target?: [number, number, number]
  duration?: number // ms, default 800
}

export const useCameraTransition = () => {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const isTransitioning = useRef(false)
  const startTimeRef = useRef(0)
  const fromPos = useRef<[number, number, number]>([0, 0, 0])
  const toTarget = useRef<CameraTransitionTarget | null>(null)
  const durationRef = useRef(800)

  useFrame(() => {
    if (!isTransitioning.current || !toTarget.current) return

    const elapsed = performance.now() - startTimeRef.current
    const progress = Math.min(elapsed / durationRef.current, 1)
    // Ease-out cubic: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - progress, 3)

    const to = toTarget.current
    camera.position.set(
      fromPos.current[0] + (to.position[0] - fromPos.current[0]) * eased,
      fromPos.current[1] + (to.position[1] - fromPos.current[1]) * eased,
      fromPos.current[2] + (to.position[2] - fromPos.current[2]) * eased,
    )
    camera.updateProjectionMatrix()

    if (progress >= 1) {
      isTransitioning.current = false
    } else {
      invalidate() // Keep rendering during transition
    }
  })

  const transitionTo = useCallback(
    (target: CameraTransitionTarget) => {
      fromPos.current = [camera.position.x, camera.position.y, camera.position.z]
      toTarget.current = target
      durationRef.current = target.duration ?? 800
      startTimeRef.current = performance.now()
      isTransitioning.current = true
      invalidate() // Kick off first frame
    },
    [camera, invalidate],
  )

  const cancelTransition = useCallback(() => {
    isTransitioning.current = false
  }, [])

  return { transitionTo, cancelTransition, isTransitioning }
}
