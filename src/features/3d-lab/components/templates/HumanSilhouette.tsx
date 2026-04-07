'use client'

import { Html } from '@react-three/drei'

interface HumanSilhouetteProps {
  position?: [number, number, number]
  opacity?: number
}

export const HumanSilhouette = ({ position = [0, 0, 0], opacity = 0.5 }: HumanSilhouetteProps) => {
  return (
    <group position={position}>
      {/* Body — capsule centered at torso height */}
      <mesh position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
        <meshStandardMaterial color="#6b7280" transparent opacity={opacity} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#6b7280" transparent opacity={opacity} />
      </mesh>
      {/* Scale label — 1.7m */}
      <Html position={[0.25, 0.85, 0]} distanceFactor={8} occlude={false}>
        <div style={{ pointerEvents: 'none' }} className="whitespace-nowrap">
          <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground bg-card/80 backdrop-blur-sm px-1 py-0.5 rounded">
            1.7m
          </span>
        </div>
      </Html>
    </group>
  )
}
