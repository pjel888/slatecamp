'use client'

// canvas/DevControlsCanvas.tsx
// ─── Self-contained R3F Canvas for the Development Controls module ─────────
// frameloop="demand" — GPU renders ONLY on invalidate().
// Does NOT use shared CanvasWrapper or SceneBase.

import { Suspense, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { SceneLighting } from './SceneLighting'
import { InvalidateBridge } from './InvalidateBridge'
import { CAMERA_PRESETS, SCENE } from './constants'
import { resetCursor } from './cursor'

// Scene layers
import { LotGround } from './layers/LotGround'
import { SetbackZones } from './layers/SetbackZones'
import { ISALayer } from './layers/ISALayer'
import { USALayer } from './layers/USALayer'
import { TOSLOverlayLayer } from './layers/TOSLOverlayLayer'
import { AMBFFootprintLayer } from './layers/AMBFFootprintLayer'
import { BuildableEnvelope } from './layers/BuildableEnvelope'
import { AMBFGhostCandidates } from './layers/AMBFGhostCandidates'
import { BHLCeiling } from './layers/BHLCeiling'
import { FLARCeiling } from './layers/FLARCeiling'
import { FloorSlabs } from './layers/FloorSlabs'
import { RROWIndicator } from './layers/RROWIndicator'
import { FirewallMarkers } from './layers/FirewallMarkers'
import { ViolationOverlay } from './layers/ViolationOverlay'

// Annotations
import { DimensionLines } from './annotations/DimensionLines'
// ZoneHotspots removed — info displayed in right panel instead

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
      minDistance={5}
      maxDistance={80}
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
  const preset = CAMERA_PRESETS[cameraPreset] ?? CAMERA_PRESETS.orbit

  return (
    <>
      <SceneSetup />
      <InvalidateBridge />
      <SceneLighting />

      <PerspectiveCamera
        makeDefault
        position={preset.position}
        fov={preset.fov}
        near={0.1}
        far={500}
      />

      <CameraControls target={preset.target} />

      {/* Context layers — togglable */}
      {visibleLayers.has('rrow') && <UrbanGrid />}
      {visibleLayers.has('building') && <ContextBuildings />}

      {/* Ground & zone layers — togglable */}
      <LotGround />
      {visibleLayers.has('setbacks') && <SetbackZones />}
      {visibleLayers.has('isa') && <ISALayer />}
      {visibleLayers.has('usa') && <USALayer />}
      {visibleLayers.has('tosl') && <TOSLOverlayLayer />}
      {visibleLayers.has('ambf') && <AMBFFootprintLayer />}

      {/* Building layers */}
      {visibleLayers.has('ambf') && <BuildableEnvelope />}
      {visibleLayers.has('ambf') && <AMBFGhostCandidates />}
      {visibleLayers.has('bhl') && <BHLCeiling />}
      {visibleLayers.has('flar') && <FLARCeiling />}
      {visibleLayers.has('floors') && <FloorSlabs />}
      {visibleLayers.has('rrow') && <RROWIndicator />}
      {visibleLayers.has('firewall') && <FirewallMarkers />}

      {/* Violation overlay */}
      <ViolationOverlay />

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
      shadows
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
