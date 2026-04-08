'use client'

import { useEffect } from 'react'
import { Vector3 } from 'three'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'

interface HumanSilhouetteProps {
  position?: [number, number, number]
  opacity?: number
}

export const HumanSilhouette = ({ position = [0, 0, 0], opacity = 0.5 }: HumanSilhouetteProps) => {
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `human-scale-${position[0]}-${position[2]}`

  useEffect(() => {
    upsertItem({
      id: overlayId,
      worldPosition: new Vector3(position[0] + 0.25, position[1] + 0.85, position[2]),
      type: 'dimension',
      payload: {
        value: 1.7,
        unit: 'm',
        isViolating: false,
      },
      visible: true,
    })
    return () => removeItem(overlayId)
  }, [position, upsertItem, removeItem, overlayId])

  return (
    <group position={position}>
      {/* Body — capsule centered at torso height */}
      <mesh position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.15, 0.9, 4, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.humanBody} transparent opacity={opacity} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.humanBody} transparent opacity={opacity} />
      </mesh>
    </group>
  )
}
