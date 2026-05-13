'use client'

// SceneGround — ground grid + axis gizmo for spatial orientation
// Rendered inside every 3D scene via template renderers.
// Grid toggled by useViewportShellStore.gridVisible.

import { GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'

const GRID_RADIUS = 1200
// Keep the visual grid just below stair/landing slabs while preserving the
// floor-reference read. The stair landing is 0.03 m thick and extends below
// y=0, so -0.01 would still sit inside the landing and shimmer through it.
const GRID_Y_OFFSET = -0.04
const BACKGROUND_GRID_Y_OFFSET = GRID_Y_OFFSET - 0.005
const GIZMO_MARGIN: [number, number] = [60, 150]

const GroundGrid = () => {
  return (
    <>
      <Grid
        position={[0, GRID_Y_OFFSET, 0]}
        userData={{
          slatecampCameraFitExclude: true,
          slatecampCameraClipInclude: true,
          slatecampCameraClipRadius: GRID_RADIUS,
          slatecampCameraClipHeight: 1,
        }}
        args={[GRID_RADIUS * 2, GRID_RADIUS * 2]}
        fadeDistance={260}
        fadeFrom={0}
        fadeStrength={3.5}
        side={THREE.DoubleSide}
        cellSize={1}
        sectionSize={5}
        cellColor="#e5e7eb"
        sectionColor="#d1d5db"
        cellThickness={0.25}
        sectionThickness={0.55}
      />
      <Grid
        position={[0, BACKGROUND_GRID_Y_OFFSET, 0]}
        userData={{ slatecampCameraFitExclude: true }}
        args={[GRID_RADIUS * 2, GRID_RADIUS * 2]}
        fadeDistance={GRID_RADIUS}
        fadeFrom={0}
        fadeStrength={1.4}
        side={THREE.DoubleSide}
        cellSize={10}
        sectionSize={50}
        cellColor={SCENE_COLORS.groundGridCell}
        sectionColor={SCENE_COLORS.groundGridSection}
        cellThickness={0.18}
        sectionThickness={0.55}
      />
    </>
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
        margin={GIZMO_MARGIN}
        userData={{ slatecampCameraFitExclude: true }}
      >
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="white"
        />
      </GizmoHelper>
    </>
  )
}
