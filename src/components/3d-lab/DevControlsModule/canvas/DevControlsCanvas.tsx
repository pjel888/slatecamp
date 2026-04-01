'use client'

// canvas/DevControlsCanvas.tsx
// ─── Self-contained R3F Canvas for the Development Controls module ─────────
// frameloop="demand" — GPU renders ONLY on invalidate().
// Does NOT use shared CanvasWrapper or SceneBase.

import { Suspense, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor, PerspectiveCamera, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { SceneLighting } from './SceneLighting'
import { InvalidateBridge } from './InvalidateBridge'
import { CAMERA_PRESETS, SCENE } from './constants'
import { resetCursor } from './cursor'

// Scene layers
import { LotGround } from './layers/LotGround'
import { DevControlsLayers } from './layers/DevControlsLayers'
import { RROWIndicator } from './layers/RROWIndicator'
import { FirewallMarkers } from './layers/FirewallMarkers'

// Annotations
import { DimensionLines } from './annotations/DimensionLines'

// Context
import { UrbanGrid } from './context/UrbanGrid'
import { ContextBuildings } from './context/ContextBuildings'

// ─── Camera Controls (disabled during ISA/USA drag) ─────────────────────────

function CameraControls({ target }: { target: [number, number, number] }) {
  const isDragging = useDevControlsStore((s) => s.isDraggingZone)
  return (
    <OrbitControls
      target={target}
      enabled={!isDragging}
      enablePan={true}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={1}
      maxDistance={500}
      enableDamping={false}
    />
  )
}

// ─── Scene Background + Initial Invalidate ──────────────────────────────────

function SceneSetup() {
  const { scene, gl, invalidate } = useThree()
  useEffect(() => {
    const bgColor = new THREE.Color(SCENE.SKY_COLOR)
    scene.background = bgColor
    gl.setClearColor(bgColor, 1)
    invalidate()
    return () => resetCursor() // clean up cursor on unmount
  }, [scene, gl, invalidate])
  return null
}

// ─── Scene Content ──────────────────────────────────────────────────────────

function SceneContent() {
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const cameraPreset = useDevControlsStore((s) => s.cameraPreset)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const preset = CAMERA_PRESETS[cameraPreset] ?? CAMERA_PRESETS.perspective
  const isOrtho = preset.isOrtho === true

  // Auto-frame orthographic zoom: fit the lot bounding box with padding
  // zoom = viewport / scene_size — higher zoom = closer. We use the larger lot dimension.
  const orthoZoom = Math.max(lotW, lotD, 10) * 1.4

  return (
    <>
      <SceneSetup />
      <InvalidateBridge />
      <SceneLighting />

      {/* Perspective camera — default for free orbit */}
      {!isOrtho && (
        <PerspectiveCamera
          makeDefault
          position={preset.position}
          fov={preset.fov}
          near={0.1}
          far={500}
        />
      )}

      {/* Orthographic camera — for isometric/plan views, auto-framed to lot */}
      {isOrtho && (
        <OrthographicCamera
          makeDefault
          position={preset.position}
          zoom={Math.max(8, 800 / orthoZoom)}
          near={-500}
          far={500}
        />
      )}

      <CameraControls target={preset.target} />

      {/* Context layers — togglable */}
      {visibleLayers.has('rrow') && <UrbanGrid />}
      {visibleLayers.has('building') && <ContextBuildings />}

      {/* Lot ground — handles both modes internally */}
      <LotGround />

      {/* Development control layers — rectangular lot */}
      <DevControlsLayers />

      {/* Context overlays — shared by both modes */}
      {visibleLayers.has('rrow') && <RROWIndicator />}
      {visibleLayers.has('firewall') && <FirewallMarkers />}

      {/* Annotations */}
      {showDimensions && <DimensionLines />}
    </>
  )
}

// ─── Canvas Shell ───────────────────────────────────────────────────────────

export function DevControlsCanvas() {
  const setDpr = useDevControlsStore((s) => s.setDpr)
  const clearSelection = useSelectionStore((s) => s.clearSelection)

  const handlePointerMissed = useCallback(() => {
    clearSelection()
    useDevControlsStore.getState().setActiveHotspot(null)
  }, [clearSelection])

  return (
    <Canvas
      frameloop="demand"
      dpr={SCENE.DPR_RANGE}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'default',
        stencil: false,
        depth: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: SCENE.SKY_COLOR }}
      onPointerMissed={handlePointerMissed}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.5)}
      />
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  )
}
