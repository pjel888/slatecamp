'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { ArchMass } from '../../_components/ArchMass'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

// Color targets
const COLOR_COBALT = new THREE.Color('#1B3FC4')
const COLOR_VIOLATION = new THREE.Color('#D64545')
const COLOR_WARNING = new THREE.Color('#D4951A')
const COLOR_MONOCHROME = new THREE.Color('#B0B0B0')

/**
 * Building footprint extruded box with real-time violation feedback.
 *
 * When the building exceeds AMBF/PSO limits, the mesh lerps to red.
 * When floor height is below minimum, lerps to amber.
 * Monochrome when another zone is selected; cobalt blue when this zone is active.
 */
export function AMBFVolume() {
  const buildableWidth = useSiteControlsStore((s) => s.computed.buildableWidth)
  const buildableDepth = useSiteControlsStore((s) => s.computed.buildableDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)
  const buildingHeight = useSiteControlsStore((s) => s.computed.buildingHeight)
  const numFloors = useSiteControlsStore((s) => s.inputs.numFloors)
  const floorHeight = useSiteControlsStore((s) => s.inputs.floorHeight)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)
  const tourStep = useSiteControlsStore((s) => s.tourStep)
  const violations = useSiteControlsStore((s) => s.computed.violations)
  const compliance = useSiteControlsStore((s) => s.computed.compliance)

  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const pulseRef = useRef(0)

  // Determine violation state
  const ambfViolations = violations.filter((v) => v.field === 'ambf')
  const floorViolation = violations.find((v) => v.field === 'floorHeight')
  const hasError = ambfViolations.length > 0
  const hasWarning = !!floorViolation && !hasError
  const hasAnyViolation = hasError || hasWarning

  const isActive = activeZone === 'ambf'
  const dimmed = activeZone !== null && !isActive

  // Target color based on zone selection and violation state
  const targetColor = isActive
    ? COLOR_COBALT
    : dimmed
      ? COLOR_MONOCHROME
      : hasError
        ? COLOR_VIOLATION
        : hasWarning
          ? COLOR_WARNING
          : COLOR_COBALT

  // Animate color lerp + violation pulse (only when no zone is selected)
  useFrame((_, delta) => {
    if (!materialRef.current) return

    // Lerp material color toward target
    materialRef.current.color.lerp(targetColor, delta * 4)

    // Pulse emissive on violation only when no zone is actively selected
    if (hasAnyViolation && activeZone === null) {
      pulseRef.current += delta * 3
      const pulse = (Math.sin(pulseRef.current) + 1) * 0.5 // 0-1
      materialRef.current.emissive.copy(hasError ? COLOR_VIOLATION : COLOR_WARNING)
      materialRef.current.emissiveIntensity = pulse * 0.3
    } else {
      materialRef.current.emissiveIntensity = 0
      pulseRef.current = 0
    }
  })

  if (buildableWidth <= 0 || buildableDepth <= 0) return null

  const isSlab = tourStep === 2
  const effectiveHeight = isSlab ? 0.3 : buildingHeight

  const px = setbacks.left + buildableWidth / 2
  const py = effectiveHeight / 2
  const pz = setbacks.front + buildableDepth / 2

  // Floor division lines
  const floorLines = useMemo(() => {
    if (isSlab) return []
    const lines: Array<{ key: string; points: [number, number, number][] }> = []
    const x0 = setbacks.left
    const x1 = setbacks.left + buildableWidth
    const z0 = setbacks.front
    const z1 = setbacks.front + buildableDepth

    for (let i = 1; i < numFloors; i++) {
      const y = floorHeight * i
      lines.push({
        key: `floor-${i}`,
        points: [
          [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0],
        ],
      })
    }
    return lines
  }, [isSlab, numFloors, floorHeight, buildableWidth, buildableDepth, setbacks])

  return (
    <group>
      {/* Building volume with animated material */}
      <mesh
        position={[px, py, pz]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          setActiveZone(isActive ? null : 'ambf')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[buildableWidth, effectiveHeight, buildableDepth]} />
        <meshStandardMaterial
          ref={materialRef}
          color={isActive ? '#1B3FC4' : dimmed ? '#B0B0B0' : hasError ? '#D64545' : hasWarning ? '#D4951A' : '#1B3FC4'}
          roughness={0.4}
          metalness={0.0}
          transparent={dimmed}
          opacity={dimmed ? 0.25 : 1.0}
        />
      </mesh>

      {/* Floor division lines */}
      {floorLines.map((fl) => (
        <Line
          key={fl.key}
          points={fl.points}
          color={dimmed ? '#B0B0B0' : hasError ? '#D64545' : '#1B3FC4'}
          lineWidth={0.5}
          transparent
          opacity={dimmed ? 0.15 : 0.45}
        />
      ))}
    </group>
  )
}
