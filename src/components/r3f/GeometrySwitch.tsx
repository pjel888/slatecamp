// src/components/r3f/GeometrySwitch.tsx
// Pure geometry element factory — shared between 3D Lab and Calculator Suite.
// Returns the correct Three.js geometry JSX intrinsic for a given type.
// No mesh wrapping, no materials — compose with your own <mesh>.

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
 * Renders the correct Three.js geometry element for a given type.
 * Wrap in your own `<mesh>` to add materials and transforms.
 */
export const GeometrySwitch = ({ type, args, profilePoints, extrudeDepth }: GeometrySwitchProps) => {
  // Memoize extruded-profile shape to avoid allocating THREE.Shape every render
  const extrudeArgs = useMemo(() => {
    if (type !== 'extruded-profile' || !profilePoints || !extrudeDepth) return null
    const shape = new THREE.Shape()
    shape.moveTo(profilePoints[0][0], profilePoints[0][1])
    for (let i = 1; i < profilePoints.length; i++) {
      shape.lineTo(profilePoints[i][0], profilePoints[i][1])
    }
    shape.closePath()
    return [shape, { depth: extrudeDepth, bevelEnabled: false }] as const
  }, [type, profilePoints, extrudeDepth])

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
      if (!extrudeArgs) return null
      return <extrudeGeometry args={extrudeArgs as unknown as ConstructorParameters<typeof THREE.ExtrudeGeometry>} />
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`GeometrySwitch: unknown geometry type "${type}"`)
      }
      return null
  }
}
