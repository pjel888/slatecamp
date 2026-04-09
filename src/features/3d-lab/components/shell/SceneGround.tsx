'use client'

// SceneGround — ground grid + axis gizmo for spatial orientation
// Rendered inside every 3D scene via template renderers.
// Grid toggled by useViewportShellStore.gridVisible.

import * as THREE from 'three'
import { useMemo } from 'react'
import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

/**
 * Simple GridHelper-based ground grid.
 * drei's declarative <Grid> can silently fail depending on version/camera setup,
 * so we use THREE.GridHelper which is guaranteed visible and lightweight.
 */
const GroundGrid = () => {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(20, 20, '#aaaaaa', '#cccccc')
    g.material = new THREE.LineBasicMaterial({ color: '#cccccc', transparent: true, opacity: 0.6 })
    return g
  }, [])

  return <primitive object={grid} position={[0, 0, 0]} />
}

export const SceneGround = () => {
  const gridVisible = useViewportShellStore((s) => s.gridVisible)

  return (
    <>
      {/* Ground grid — XZ plane */}
      {gridVisible && <GroundGrid />}

      {/* Axis gizmo — bottom-right corner, shows camera orientation */}
      <GizmoHelper
        alignment="bottom-right"
        margin={[60, 60]}
      >
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="white"
        />
      </GizmoHelper>
    </>
  )
}
