'use client'

// NULL-RENDER component. Mounts inside <Canvas>.
// Writes camera ref to useOverlayStore every frame.
// This is the ENTIRE bridge between 3D and DOM overlay system.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useOverlayStore } from '../../stores/useOverlayStore'

export const CameraSync = () => {
  const camera = useThree((s) => s.camera)
  const setCameraRef = useOverlayStore((s) => s.setCameraRef)

  useEffect(() => {
    setCameraRef(camera)
    return () => setCameraRef(null)
  }, [camera, setCameraRef])

  return null
}
