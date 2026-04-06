'use client'

import type { ReactNode } from 'react'
import { Edges, Outlines } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'

// ─── Constants (from UX Plan §02) ────────────────────────────────────────────

/** Edge color — dark charcoal, NOT black */
const EDGE_COLOR = '#3A3A3A'
/** Edge threshold angle (degrees) */
const EDGE_THRESHOLD = 15
/** Edge scale offset to prevent z-fighting */
const EDGE_SCALE = 1.002

/** Context building color — ghost white */
export const CONTEXT_COLOR = '#EDEAE4'
/** Active/proposed element color — SlateCamp cobalt */
export const ACTIVE_COLOR = '#1B3FC4'
/** Selection outline color — lighter cobalt */
const OUTLINE_COLOR = '#4A6FE8'

// ─── ArchMass ────────────────────────────────────────────────────────────────

interface ArchMassProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  /** Material color. Defaults to ghost white for context buildings. */
  color?: string
  /** Whether this is the active/proposed element (cobalt + outlines). */
  isActive?: boolean
  /** Whether this is a context building (ghost white, no castShadow). */
  isContext?: boolean
  /** Material roughness. Active=0.4, context=0.85 by default. */
  roughness?: number
  /** Material opacity. 1.0 by default. */
  opacity?: number
  /** Show Outlines even when not active (e.g. hover state). */
  showOutline?: boolean
  /** Geometry children (boxGeometry, cylinderGeometry, etc.) */
  children: ReactNode
}

/**
 * ArchMass — reusable architectural mesh with clean dark edges.
 *
 * The single design decision that transforms 3D from "app" to
 * "architectural diagram" (UX Plan §02). Every structural mesh
 * in the 3D Lab should use this component.
 *
 * Modes:
 * - **Context**: ghost white #EDEAE4, roughness 0.85, no castShadow, edges only
 * - **Active**: cobalt #1B3FC4, roughness 0.4, Outlines on selection
 * - **Default**: custom color with edges
 */
export function ArchMass({
  position,
  rotation,
  scale,
  onClick,
  onPointerOver,
  onPointerOut,
  color,
  isActive = false,
  isContext = false,
  roughness,
  opacity = 1,
  showOutline = false,
  children,
}: ArchMassProps) {
  const effectiveColor = isActive ? ACTIVE_COLOR : (color ?? CONTEXT_COLOR)
  const effectiveRoughness = roughness ?? (isActive ? 0.4 : 0.85)

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      castShadow={!isContext}
      receiveShadow
    >
      {children}
      <meshStandardMaterial
        color={effectiveColor}
        roughness={effectiveRoughness}
        metalness={0.0}
        transparent={opacity < 1}
        opacity={opacity}
      />
      <Edges
        threshold={EDGE_THRESHOLD}
        color={EDGE_COLOR}
        lineWidth={1.0}
        scale={EDGE_SCALE}
      />
      {(isActive || showOutline) && (
        <Outlines
          thickness={0.02}
          color={OUTLINE_COLOR}
          screenspace={false}
        />
      )}
    </mesh>
  )
}
