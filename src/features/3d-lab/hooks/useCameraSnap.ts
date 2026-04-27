'use client'

// useCameraSnap - bridges DOM store -> R3F camera animation.
// Subscribes to cameraCommandPreset in useViewportShellStore.
// When the command changes, animates OrbitControls camera to target position.

import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import {
  DEFAULT_ISO_PRESET,
  normalizeCameraCommandPreset,
  type CameraSelectionPreset,
} from '@/features/3d-lab/utils/camera-presets'
import * as THREE from 'three'

// Camera preset positions - target [0, 1.5, 0] centers on typical scene
const PRESETS: Record<CameraSelectionPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 2, 10], target: [0, 1.5, 0] },
  top: { position: [0, 12, 0.01], target: [0, 0, 0] },
  left: { position: [-10, 2, 0], target: [0, 1.5, 0] },
  right: { position: [10, 2, 0], target: [0, 1.5, 0] },
  rear: { position: [0, 2, -10], target: [0, 1.5, 0] },
  orbit: { position: [7, 2.5, 5.5], target: [0, 1.5, 0] },
  'iso-ne': { position: [8, 6, 8], target: [0, 1, 0] },
  'iso-nw': { position: [-8, 6, 8], target: [0, 1, 0] },
  'iso-se': { position: [8, 6, -8], target: [0, 1, 0] },
  'iso-sw': { position: [-8, 6, -8], target: [0, 1, 0] },
  perspective: { position: [7, 2.5, 5.5], target: [0, 1.5, 0] },
}

const ZOOM_TO_FIT_TARGET = { position: [4, 3, 4] as [number, number, number], target: [0, 1, 0] as [number, number, number] }

const getActivePresets = () => {
  const config = useViewportShellStore.getState().cameraControlConfig
  return { ...PRESETS, ...(config.presets ?? {}) }
}

const getZoomToFitTarget = () =>
  useViewportShellStore.getState().cameraControlConfig.zoomToFit ?? ZOOM_TO_FIT_TARGET

interface AnimState {
  active: boolean
  commandId: number | null
  startPosition: THREE.Vector3
  endPosition: THREE.Vector3
  startTarget: THREE.Vector3
  endTarget: THREE.Vector3
  startTime: number
  duration: number
}

const isZoomCommand = (preset: string | null): preset is 'zoom-in' | 'zoom-out' =>
  preset === 'zoom-in' || preset === 'zoom-out'

const isZoomToFitCommand = (preset: string | null): preset is 'zoom-to-fit' => preset === 'zoom-to-fit'

const isResetCommand = (preset: string | null): preset is 'reset' => preset === 'reset'

export const useCameraSnap = () => {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const invalidate = useThree((s) => s.invalidate)
  const animRef = useRef<AnimState>({
    active: false,
    commandId: null,
    startPosition: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    startTime: 0,
    duration: 600,
  })
  const prevCommandIdRef = useRef<number | null>(null)

  // Drive animation via useFrame - works with demand frameloop
  useFrame(() => {
    const anim = animRef.current
    if (!anim.active) return

    const state = useViewportShellStore.getState()
    if (state.manualOrbit || state.cameraCommandId !== anim.commandId) {
      anim.active = false
      anim.commandId = null
      return
    }

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
      anim.commandId = null
    } else {
      invalidate()
    }
  })

  useEffect(() => {
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      const commandId = state.cameraCommandId
      const commandPreset = state.cameraCommandPreset

      if (!commandPreset || commandId === prevCommandIdRef.current) return
      prevCommandIdRef.current = commandId

      const normalizedPreset = normalizeCameraCommandPreset(commandPreset)

      if (isZoomCommand(commandPreset)) {
        const direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        const step = commandPreset === 'zoom-in' ? 1.5 : -1.5
        camera.position.addScaledVector(direction, step)
        if (controls && 'update' in controls) {
          (controls as { update: () => void }).update()
        }
        invalidate()
        return
      }

      if (isZoomToFitCommand(commandPreset)) {
        const target = getZoomToFitTarget()
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
          camera.position.set(...target.position)
          if (controls && 'target' in controls) {
            const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
            orbitControls.target.set(...target.target)
            orbitControls.update()
          }
          invalidate()
          return
        }

        const anim = animRef.current
        anim.commandId = commandId
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
        invalidate()
        return
      }

      const presetKey = (normalizedPreset ?? DEFAULT_ISO_PRESET) as CameraSelectionPreset
      const activePresets = getActivePresets()
      const resetPreset = useViewportShellStore.getState().cameraControlConfig.resetPreset ?? 'perspective'
      const target = isResetCommand(commandPreset)
        ? activePresets[resetPreset] ?? PRESETS.perspective
        : activePresets[presetKey] ?? PRESETS[presetKey]

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) {
        camera.position.set(...target.position)
        if (controls && 'target' in controls) {
          const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
          orbitControls.target.set(...target.target)
          orbitControls.update()
        }
        invalidate()
        return
      }

      const anim = animRef.current
      anim.commandId = commandId
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
      invalidate()
    })

    return unsubscribe
  }, [camera, controls, invalidate])
}
