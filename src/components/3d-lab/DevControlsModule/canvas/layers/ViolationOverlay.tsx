'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR } from '../constants'
import {
  VIOLATION_UNIFORMS,
  VIOLATION_VERTEX_SHADER,
  VIOLATION_FRAGMENT_SHADER,
} from '../materials'

// Violation overlay — pulsing red shader on the building footprint
// when the proposed building exceeds the AMBF limit.
// Uses a custom ShaderMaterial with 1.5Hz pulse via uTime uniform.
// CRITICAL: uTime is updated via useFrame ref mutation — no React re-renders.

export function ViolationOverlay() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const fpW = useDevControlsStore((s) => s.building.proposedFootprintWidth)
  const fpD = useDevControlsStore((s) => s.building.proposedFootprintDepth)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)
  const overallCompliant = useDevControlsStore((s) => s.result.overallCompliant)

  const visW = Math.min(fpW, buildableW > 0 ? buildableW : fpW)
  const visD = Math.min(fpD, buildableD > 0 ? buildableD : fpD)
  const hasViolation = !overallCompliant

  const uniforms = useMemo(() => ({
    uBaseColor: { value: new THREE.Color(COLOR.VIOLATION_BASE) },
    uViolationColor: { value: new THREE.Color(COLOR.VIOLATION) },
    uViolationAmount: { value: hasViolation ? 1.0 : 0.0 },
    uTime: { value: 0.0 },
    uOpacity: { value: 0.7 },
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update violation amount when compliance changes
  useFrame((state, delta) => {
    if (!materialRef.current) return
    const mat = materialRef.current

    // Update time for pulse animation
    mat.uniforms.uTime.value = state.clock.elapsedTime

    // Lerp violation amount
    const target = hasViolation ? 1.0 : 0.0
    const current = mat.uniforms.uViolationAmount.value
    mat.uniforms.uViolationAmount.value = THREE.MathUtils.lerp(current, target, delta * 5)

    // Self-schedule only when animating
    if (Math.abs(current - target) > 0.01 || hasViolation) {
      state.invalidate()
    }
  })

  if (visW <= 0 || visD <= 0) return null

  return (
    <mesh
      ref={meshRef}
      position={[
        setbacks.left + visW / 2,
        GEOMETRY_Y.AMBF_FOOTPRINT + 0.002,
        setbacks.front + visD / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[visW, visD]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VIOLATION_VERTEX_SHADER}
        fragmentShader={VIOLATION_FRAGMENT_SHADER}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
