'use client'

// canvas/DevControlsCanvas.tsx
// Scene content for the Site Development Controls module.
// Canvas, camera setup, OrbitControls, DPR, and pointer/control mapping are owned by
// the shared 3D Lab shell (`LabViewportFrame` + `CanvasWrapper` + `SceneConfig`).

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { SCENE } from './constants'
import { SceneLighting } from './SceneLighting'
import { InvalidateBridge } from './InvalidateBridge'
import { resetCursor } from './cursor'

// Scene layers
import { LotGround } from './layers/LotGround'
import { DevControlsLayers } from './layers/DevControlsLayers'
import { RROWIndicator } from './layers/RROWIndicator'
import { FirewallMarkers } from './layers/FirewallMarkers'

// Annotations
import { DimensionLines } from './annotations/DimensionLines'

function SceneSetup() {
  const { gl, invalidate } = useThree()
  const clearSelection = useSelectionStore((s) => s.clearSelection)

  useEffect(() => {
    invalidate()
    gl.setClearColor(SCENE.SKY_COLOR, 1)

    const canvas = gl.domElement
    const handlePointerMissed = (event: PointerEvent) => {
      if (event.target !== canvas) return
      clearSelection()
      useDevControlsStore.getState().setActiveHotspot(null)
    }

    canvas.addEventListener('pointerdown', handlePointerMissed)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerMissed)
      resetCursor()
    }
  }, [clearSelection, gl, invalidate])

  return null
}

export function DevControlsSceneContent() {
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)

  return (
    <>
      <SceneSetup />
      <InvalidateBridge />
      <SceneLighting />
      <LotGround />
      <DevControlsLayers />
      {visibleLayers.has('rrow') && <RROWIndicator />}
      {visibleLayers.has('firewall') && <FirewallMarkers />}
      {showDimensions && <DimensionLines />}
    </>
  )
}

// Backward-compatible export name for any legacy imports. This no longer owns a Canvas.
export function DevControlsCanvas() {
  return <DevControlsSceneContent />
}
