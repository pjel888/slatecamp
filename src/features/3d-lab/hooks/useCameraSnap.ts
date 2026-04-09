'use client'

// useCameraSnap — bridges DOM store → R3F camera animation.
// Subscribes to activeCameraPreset in useViewportShellStore.
// When preset changes, animates OrbitControls camera to target position.

import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import * as THREE from 'three'

// Camera preset positions — target [0, 1.5, 0] centers on typical scene
const PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 2, 10], target: [0, 1.5, 0] },
  top: { position: [0, 12, 0.01], target: [0, 0, 0] }, // 0.01 avoids gimbal lock
  left: { position: [-10, 2, 0], target: [0, 1.5, 0] },
  right: { position: [10, 2, 0], target: [0, 1.5, 0] },
  rear: { position: [0, 2, -10], target: [0, 1.5, 0] },
  iso: { position: [8, 6, 8], target: [0, 1, 0] },
  'iso-ne': { position: [8, 6, 8], target: [0, 1, 0] },
  'iso-nw': { position: [-8, 6, 8], target: [0, 1, 0] },
  'iso-se': { position: [8, 6, -8], target: [0, 1, 0] },
  'iso-sw': { position: [-8, 6, -8], target: [0, 1, 0] },
  perspective: { position: [7, 2.5, 5.5], target: [0, 1.5, 0] },
  'zoom-to-fit': { position: [4, 3, 4], target: [0, 1, 0] },
  reset: { position: [7, 2.5, 5.5], target: [0, 1.5, 0] },
}

interface AnimState {
  active: boolean
  startPosition: THREE.Vector3
  endPosition: THREE.Vector3
  startTarget: THREE.Vector3
  endTarget: THREE.Vector3
  startTime: number
  duration: number
}

export const useCameraSnap = () => {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const invalidate = useThree((s) => s.invalidate)
  const animRef = useRef<AnimState>({
    active: false,
    startPosition: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    startTime: 0,
    duration: 600,
  })
  const prevPresetRef = useRef<string | null>(null)

  // Drive animation via useFrame — works with demand frameloop
  useFrame(() => {
    const anim = animRef.current
    if (!anim.active) return

    const elapsed = performance.now() - anim.startTime
    const t = Math.min(elapsed / anim.duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)

    camera.position.lerpVectors(anim.startPosition, anim.endPosition, eased)

    if (controls && 'target' in controls) {
      const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
      const currentTarget = new THREE.Vector3().lerpVectors(anim.startTarget, anim.endTarget, eased)
      orbitControls.target.copy(currentTarget)
      orbitControls.update()
    }

    if (t >= 1) {
      anim.active = false
      // Reset preset so same button can be clicked again
      useViewportShellStore.setState({ activeCameraPreset: null })
    } else {
      invalidate() // Keep rendering during transition
    }
  })

  useEffect(() => {
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      const preset = state.activeCameraPreset
      // Only react when preset actually changed to a non-null value
      if (!preset || preset === prevPresetRef.current) {
        prevPresetRef.current = preset
        return
      }
      prevPresetRef.current = preset

      // Step zoom: move camera 20% closer/farther along current look direction
      if (preset === 'zoom-in' || preset === 'zoom-out') {
        const direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        const step = preset === 'zoom-in' ? 1.5 : -1.5
        camera.position.addScaledVector(direction, step)
        if (controls && 'target' in controls) {
          const orbitControls = controls as unknown as { update: () => void }
          orbitControls.update()
        }
        invalidate()
        useViewportShellStore.setState({ activeCameraPreset: null })
        return
      }

      const target = PRESETS[preset]
      if (!target) return

      // Check for prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) {
        // Instant snap — no animation
        camera.position.set(...target.position)
        if (controls && 'target' in controls) {
          const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
          orbitControls.target.set(...target.target)
          orbitControls.update()
        }
        invalidate()
        useViewportShellStore.setState({ activeCameraPreset: null })
        return
      }

      // Start animated snap
      const anim = animRef.current
      anim.startPosition.copy(camera.position)
      anim.endPosition.set(...target.position)

      if (controls && 'target' in controls) {
        const orbitControls = controls as unknown as { target: THREE.Vector3 }
        anim.startTarget.copy(orbitControls.target)
      } else {
        anim.startTarget.set(0, 0, 0)
      }
      anim.endTarget.set(...target.target)

      anim.startTime = performance.now()
      anim.duration = 600
      anim.active = true
      invalidate() // Kick off first frame
    })

    return unsubscribe
  }, [camera, controls, invalidate])
}
