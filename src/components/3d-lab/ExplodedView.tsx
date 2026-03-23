'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ExplodedComponent {
  meshName: string
  offset: [number, number, number]  // Separation direction and distance
}

interface ExplodedViewProps {
  enabled: boolean
  components: ExplodedComponent[]
  sceneRef: React.RefObject<THREE.Group | null>
}

// Exploded view: separates model components with a 600ms ease-out animation.
// Hotspot dots maintain positions relative to their component (move with the explosion).
// Separation distances are configured per-module.
export const ExplodedView = ({
  enabled,
  components,
  sceneRef,
}: ExplodedViewProps) => {
  const progress = useRef(0)
  const targetProgress = useRef(0)
  const originalPositions = useRef<Map<string, THREE.Vector3>>(new Map())
  const initialized = useRef(false)

  // Capture original positions on first render
  useEffect(() => {
    if (!sceneRef.current || initialized.current) return

    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        originalPositions.current.set(child.name, child.position.clone())
      }
    })
    initialized.current = true
  }, [sceneRef])

  useEffect(() => {
    targetProgress.current = enabled ? 1 : 0
  }, [enabled])

  useFrame((_, delta) => {
    if (!sceneRef.current) return

    const target = targetProgress.current
    if (Math.abs(progress.current - target) < 0.001) {
      progress.current = target
      return
    }

    // 600ms ease-out animation
    const duration = 0.6
    const speed = 1 / duration

    if (progress.current < target) {
      // Ease-out: fast start, slow end
      const remaining = target - progress.current
      const step = Math.max(remaining * speed * delta * 4, speed * delta * 0.5)
      progress.current = Math.min(progress.current + step, target)
    } else {
      const remaining = progress.current - target
      const step = Math.max(remaining * speed * delta * 4, speed * delta * 0.5)
      progress.current = Math.max(progress.current - step, target)
    }

    // Apply offsets to each configured component
    const t = progress.current
    for (const comp of components) {
      sceneRef.current.traverse((child) => {
        if (child.name === comp.meshName) {
          const original = originalPositions.current.get(child.name)
          if (original) {
            child.position.set(
              original.x + comp.offset[0] * t,
              original.y + comp.offset[1] * t,
              original.z + comp.offset[2] * t
            )
          }
        }
      })
    }
  })

  return null // This component only manipulates existing scene objects
}
