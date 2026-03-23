'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ComplianceState, ParametricControl } from '@/types/3d-lab'

interface ViolationVisualizerProps {
  sceneRef: React.RefObject<THREE.Group | null>
  complianceState: ComplianceState
  controls: ParametricControl[]
  parametricValues: Record<string, number>
}

const COLOR_VIOLATION = new THREE.Color('#E63329')   // Signal Red
const COLOR_COMPLIANT = new THREE.Color('#F5F3EE')   // Off-white (restore)
const COLOR_AT_LIMIT = new THREE.Color('#F5A623')    // Gold

// Violation visualization: when a dimension is non-compliant, the affected
// geometry highlights red and pulses to show WHY it fails.
// Research basis: Becker et al. 2025 — insight moments nearly double retention.
export const ViolationVisualizer = ({
  sceneRef,
  complianceState,
  controls,
  parametricValues,
}: ViolationVisualizerProps) => {
  const pulsePhase = useRef(0)
  const [violatingMeshes, setViolatingMeshes] = useState<string[]>([])

  // Determine which meshes are in violation
  useEffect(() => {
    const violating: string[] = []

    for (const control of controls) {
      const value = parametricValues[control.id]
      if (value === undefined) continue

      const rounded = Math.round(value)
      const isViolation =
        (control.codeMin !== undefined && rounded < control.codeMin) ||
        (control.codeMax !== undefined && rounded > control.codeMax)

      if (isViolation) {
        violating.push(...control.affectsMeshes)
      }
    }

    setViolatingMeshes([...new Set(violating)])
  }, [controls, parametricValues])

  // Animate violation pulse
  useFrame((_, delta) => {
    if (!sceneRef.current) return

    if (complianceState === 'violation') {
      pulsePhase.current += delta * 3 // Pulse frequency
      const pulseIntensity = (Math.sin(pulsePhase.current) + 1) / 2 // 0 to 1

      sceneRef.current.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        if (!child.material) return

        const mat = child.material as THREE.MeshStandardMaterial
        if (!mat.color) return

        if (violatingMeshes.includes(child.name)) {
          // Pulse between red and slightly less red
          const intensity = 0.3 + pulseIntensity * 0.15
          mat.color.copy(COLOR_VIOLATION)
          mat.opacity = 1 - intensity * 0.3
          mat.transparent = true
          mat.needsUpdate = true
        }
      })
    } else if (complianceState === 'at-limit') {
      // Gold tint for at-limit meshes (static, no pulse)
      sceneRef.current.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        const mat = child.material as THREE.MeshStandardMaterial
        if (!mat.color) return

        if (violatingMeshes.includes(child.name)) {
          mat.color.copy(COLOR_AT_LIMIT)
          mat.opacity = 0.85
          mat.transparent = true
          mat.needsUpdate = true
        }
      })
    } else {
      // Restore all meshes to default
      pulsePhase.current = 0
      sceneRef.current.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        const mat = child.material as THREE.MeshStandardMaterial
        if (!mat.color) return

        mat.color.copy(COLOR_COMPLIANT)
        mat.opacity = 1
        mat.transparent = false
        mat.needsUpdate = true
      })
    }
  })

  return null // Only manipulates existing materials
}
