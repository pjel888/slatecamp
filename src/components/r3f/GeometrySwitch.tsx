// src/components/r3f/GeometrySwitch.tsx
// Pure geometry element factory — shared between 3D Lab and Calculator Suite.
// Returns the correct Three.js geometry JSX intrinsic for a given type.
// No mesh wrapping, no materials — compose with your own <mesh>.
//
// IMPORTANT: This function must remain HOOK-FREE for the 7 original types.
// The extruded-profile case delegates to a separate component with useMemo.

import { useMemo } from 'react'
import * as THREE from 'three'
import type { GeometryType } from '@/features/3d-lab/types/templates'

interface GeometrySwitchProps {
  type: GeometryType
  args: number[]
  profilePoints?: [number, number][]
  extrudeDepth?: number
}

/**
 * Sub-component for extruded-profile geometry.
 * Isolated so useMemo hook only runs for extruded-profile instructions,
 * keeping the main GeometrySwitch hook-free for the 7 original types.
 */
const ExtrudedProfileGeometry = ({
  profilePoints,
  extrudeDepth,
}: {
  profilePoints: [number, number][]
  extrudeDepth: number
}) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(profilePoints[0][0], profilePoints[0][1])
    for (let i = 1; i < profilePoints.length; i++) {
      shape.lineTo(profilePoints[i][0], profilePoints[i][1])
    }
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: extrudeDepth, bevelEnabled: false })
  }, [profilePoints, extrudeDepth])

  return <primitive object={geometry} attach="geometry" />
}

/**
 * Renders the correct Three.js geometry element for a given type.
 * Wrap in your own `<mesh>` to add materials and transforms.
 *
 * NO HOOKS in this function — it is a pure switch over geometry types.
 * The extruded-profile case delegates to ExtrudedProfileGeometry.
 */
export const GeometrySwitch = ({ type, args, profilePoints, extrudeDepth }: GeometrySwitchProps) => {
  switch (type) {
    case 'box':
      return <boxGeometry args={args as [number, number, number]} />
    case 'cylinder':
      return <cylinderGeometry args={args as [number, number, number, number]} />
    case 'plane':
      return <planeGeometry args={args as [number, number]} />
    case 'ring':
      return <ringGeometry args={args as [number, number]} />
    case 'sphere':
      return <sphereGeometry args={args as [number, number, number]} />
    case 'cone':
      return <coneGeometry args={args as [number, number, number]} />
    case 'line':
      return <bufferGeometry />
    case 'extruded-profile':
      if (!profilePoints || !extrudeDepth) return null
      return <ExtrudedProfileGeometry profilePoints={profilePoints} extrudeDepth={extrudeDepth} />
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`GeometrySwitch: unknown geometry type "${type}"`)
      }
      return null
  }
}
