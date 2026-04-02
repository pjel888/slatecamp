// src/components/r3f/GeometrySwitch.tsx
// Pure geometry element factory — shared between 3D Lab and Calculator Suite.
// Returns the correct Three.js geometry JSX intrinsic for a given type.
// No mesh wrapping, no materials — compose with your own <mesh>.

export type GeometryType =
  | 'box'
  | 'cylinder'
  | 'plane'
  | 'line'
  | 'ring'
  | 'sphere'
  | 'cone'

interface GeometrySwitchProps {
  type: GeometryType
  args: number[]
}

/**
 * Renders the correct Three.js geometry element for a given type.
 * Wrap in your own `<mesh>` to add materials and transforms.
 */
export function GeometrySwitch({ type, args }: GeometrySwitchProps) {
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
    default:
      return <boxGeometry args={[0.1, 0.1, 0.1]} />
  }
}
