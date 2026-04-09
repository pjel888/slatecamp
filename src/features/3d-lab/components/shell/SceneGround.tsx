'use client'

// SceneGround — ground grid + axis gizmo for spatial orientation
// Rendered inside every 3D scene via template renderers.
// Grid toggled by useViewportShellStore.gridVisible.

import { GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

const GroundGrid = () => {
  return (
    <Grid
      position={[0, 0, 0]}
      infiniteGrid
      fadeDistance={500}
      fadeStrength={5}
      cellSize={1}
      sectionSize={5}
      cellColor="#cccccc"
      sectionColor="#aaaaaa"
      cellThickness={0.5}
      sectionThickness={1}
    />
  )
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
