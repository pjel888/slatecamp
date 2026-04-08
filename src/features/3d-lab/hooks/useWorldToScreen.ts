import { useCallback } from 'react'
import * as THREE from 'three'
import { useOverlayStore } from '../stores/useOverlayStore'

interface ScreenPosition {
  x: number
  y: number
  visible: boolean
}

export const useWorldToScreen = () => {
  const cameraRef = useOverlayStore((s) => s.cameraRef)

  return useCallback(
    (
      worldPosition: THREE.Vector3,
      containerWidth: number,
      containerHeight: number,
    ): ScreenPosition => {
      if (!cameraRef) return { x: 0, y: 0, visible: false }

      const projected = worldPosition.clone().project(cameraRef)

      // z > 1 means behind camera
      if (projected.z > 1) return { x: 0, y: 0, visible: false }

      // NDC [-1, 1] -> pixel coordinates
      const x = (projected.x * 0.5 + 0.5) * containerWidth
      const y = (-projected.y * 0.5 + 0.5) * containerHeight

      // Margin check — hide items near edge to prevent clipping
      const margin = 40
      const visible =
        x > margin &&
        x < containerWidth - margin &&
        y > margin &&
        y < containerHeight - margin

      return { x, y, visible }
    },
    [cameraRef],
  )
}
