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
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { SceneLighting } from './SceneLighting'
import { InvalidateBridge } from './InvalidateBridge'
import { CAMERA_PRESETS, SCENE } from './constants'
import { resetCursor } from './cursor'

// Scene layers
import { SceneGround } from '@/features/3d-lab/components/shell/SceneGround'
import { LotGround } from './layers/LotGround'
import { DevControlsLayers } from './layers/DevControlsLayers'
import { RROWIndicator } from './layers/RROWIndicator'
import { FirewallMarkers } from './layers/FirewallMarkers'

// Annotations
import { DimensionLines } from './annotations/DimensionLines'

// Context meshes removed — road-only context via RROWIndicator

// ─── Camera Controls (disabled during ISA/USA drag) ─────────────────────────

function CameraControls({ target }: { target: [number, number, number] }) {
  const isDragging = useDevControlsStore((s) => s.isDraggingZone)
  const navMode = useViewportShellStore((s) => s.navMode)
  return (
    <OrbitControls
      target={target}
      enabled={!isDragging}
      enableRotate={navMode === 'orbit' || navMode === 'look'}
      enablePan={navMode === 'pan' || navMode === 'orbit'}
      rotateSpeed={navMode === 'look' ? 0.3 : 1}
      mouseButtons={{
        LEFT: navMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: -1 as unknown as THREE.MOUSE, // DISABLED — right-click reserved for context menu
      }}
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
  const { invalidate } = useThree()
  useEffect(() => {
    invalidate()
    return () => resetCursor() // clean up cursor on unmount
  }, [invalidate])
  return <color attach="background" args={[SCENE.SKY_COLOR]} />
}

// ─── Camera Snap Bridge (shared toolbar -> DevControls camera) ──────────────

function CameraSnapBridge() {
  const { camera, controls, invalidate } = useThree()

  useEffect(() => {
    let prevPreset: string | null = useViewportShellStore.getState().activeCameraPreset
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      const preset = state.activeCameraPreset
      if (!preset || preset === prevPreset) {
        prevPreset = preset
        return
      }
      prevPreset = preset

      // Map shared preset names to DevControls camera presets.
      // DevControls supports: perspective, orbit, top, front, iso-ne, iso-nw, iso-se, iso-sw.
      // For left/right/rear (not native to DevControls), we animate directly.
      const PRESET_MAP: Record<string, string> = {
        'front': 'front',
        'top': 'top',
        'iso': 'iso-ne',
        'iso-ne': 'iso-ne',
        'iso-nw': 'iso-nw',
        'iso-se': 'iso-se',
        'iso-sw': 'iso-sw',
        'perspective': 'perspective',
        'reset': 'perspective',
      }

      // Presets that DevControls doesn't have natively — animate camera directly
      const DIRECT_PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
        'left': { position: [-20, 8, 7.5], target: [10, 4, 7.5] },
        'right': { position: [40, 8, 7.5], target: [10, 4, 7.5] },
        'rear': { position: [10, 8, -25], target: [10, 4, 7.5] },
      }

      const devPreset = PRESET_MAP[preset]
      if (devPreset) {
        useDevControlsStore.getState().setCameraPreset(devPreset as 'perspective' | 'top' | 'front' | 'iso-ne' | 'iso-nw' | 'iso-se' | 'iso-sw' | 'orbit')
      } else if (DIRECT_PRESETS[preset]) {
        // Directly animate camera for presets not in DevControls store
        const target = DIRECT_PRESETS[preset]
        camera.position.set(...target.position)
        if (controls && 'target' in controls) {
          const orbitCtrl = controls as unknown as { target: THREE.Vector3; update: () => void }
          orbitCtrl.target.set(...target.target)
          orbitCtrl.update()
        }
        invalidate()
      }

      // Handle zoom-in/zoom-out by moving camera along look direction
      if (preset === 'zoom-in' || preset === 'zoom-out') {
        const direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        const step = preset === 'zoom-in' ? 1.5 : -1.5
        camera.position.addScaledVector(direction, step)
        if (controls && 'update' in controls) {
          (controls as { update: () => void }).update()
        }
        invalidate()
      }

      // Reset shared preset so it can be triggered again
      useViewportShellStore.setState({ activeCameraPreset: null })
    })
    return unsubscribe
  }, [camera, controls, invalidate])

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
      <CameraSnapBridge />
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

      {/* Context meshes removed — road rendered via RROWIndicator below */}

      {/* Scene ground — grid + axis gizmo */}
      <SceneGround />

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
