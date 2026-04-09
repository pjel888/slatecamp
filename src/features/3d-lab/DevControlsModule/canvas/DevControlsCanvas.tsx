'use client'

// canvas/DevControlsCanvas.tsx
// ─── Self-contained R3F Canvas for the Development Controls module ─────────
// frameloop="demand" — GPU renders ONLY on invalidate().
// Does NOT use shared CanvasWrapper or SceneBase.

import { Suspense, useCallback, useEffect, useRef } from 'react'
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
  const setActiveInteraction = useViewportShellStore((s) => s.setActiveInteraction)

  // Track which mouse button started the interaction
  const mouseButtonRef = useRef<number>(-1)
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const handleDown = (e: PointerEvent) => { mouseButtonRef.current = e.button }
    const handleUp = () => { mouseButtonRef.current = -1 }
    canvas.addEventListener('pointerdown', handleDown)
    canvas.addEventListener('pointerup', handleUp)
    return () => {
      canvas.removeEventListener('pointerdown', handleDown)
      canvas.removeEventListener('pointerup', handleUp)
    }
  }, [gl])

  const handleControlStart = useCallback(() => {
    const button = mouseButtonRef.current
    if (button === 1 || navMode === 'pan') {
      setActiveInteraction('panning')
    } else {
      setActiveInteraction('orbiting')
      // Mark that user has manually orbited — deactivates view preset buttons
      // but does NOT change camera position or projection mode
      useViewportShellStore.getState().setManualOrbit(true)
    }
  }, [navMode, setActiveInteraction])

  const handleControlEnd = useCallback(() => {
    setActiveInteraction('idle')
  }, [setActiveInteraction])

  return (
    <OrbitControls
      target={target}
      enabled={!isDragging}
      enableRotate={navMode === 'orbit'}
      enablePan={true}
      zoomToCursor={true}
      panSpeed={1}
      mouseButtons={{
        LEFT: navMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: -1 as unknown as THREE.MOUSE, // DISABLED — right-click reserved for context menu
      }}
      minPolarAngle={0}
      maxPolarAngle={Math.PI - 0.05}
      minDistance={0.5}
      maxDistance={500}
      enableDamping={false}
      onStart={handleControlStart}
      onEnd={handleControlEnd}
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
      }

      // Presets that require direct camera manipulation (not just store update)
      const DIRECT_PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
        'left': { position: [-20, 8, 7.5], target: [10, 4, 7.5] },
        'right': { position: [40, 8, 7.5], target: [10, 4, 7.5] },
        'rear': { position: [10, 8, -25], target: [10, 4, 7.5] },
      }

      // Helper to directly set camera + orbit controls
      const setCamera = (pos: [number, number, number], tgt: [number, number, number]) => {
        camera.position.set(...pos)
        if (controls && 'target' in controls) {
          const orbitCtrl = controls as unknown as { target: THREE.Vector3; update: () => void }
          orbitCtrl.target.set(...tgt)
          orbitCtrl.update()
        }
        invalidate()
      }

      // Lot-anchored camera positions: all views center on the current lot
      const { lot } = useDevControlsStore.getState()
      const cx = lot.width / 2
      const cz = lot.depth / 2
      const maxDim = Math.max(lot.width, lot.depth)
      const dist = maxDim * 1.5
      const lotTarget: [number, number, number] = [cx, 0, cz]

      // Lot-relative camera positions keyed by preset name
      const LOT_CAMERAS: Record<string, [number, number, number]> = {
        'perspective': [cx + dist * 0.5, dist * 0.7, cz + dist * 0.6],
        'front':       [cx, dist * 0.4, cz + dist],
        'top':         [cx, dist * 1.5, cz],
        'left':        [cx - dist, dist * 0.4, cz],
        'right':       [cx + dist, dist * 0.4, cz],
        'rear':        [cx, dist * 0.4, cz - dist],
        'iso-ne':      [cx + dist * 0.8, dist * 0.8, cz + dist * 0.8],
        'iso-nw':      [cx - dist * 0.8, dist * 0.8, cz + dist * 0.8],
        'iso-se':      [cx + dist * 0.8, dist * 0.8, cz - dist * 0.8],
        'iso-sw':      [cx - dist * 0.8, dist * 0.8, cz - dist * 0.8],
      }

      // Ortho presets — these views use orthographic projection
      const ORTHO_PRESETS = new Set(['top', 'front', 'iso-ne', 'iso-nw', 'iso-se', 'iso-sw'])

      // Clear manual orbit flag + set projection mode on any snap
      const clearOrbitAndSetProjection = (presetName: string) => {
        useViewportShellStore.getState().setManualOrbit(false)
        const isOrtho = ORTHO_PRESETS.has(presetName)
        useViewportShellStore.getState().setProjectionMode(isOrtho ? 'orthographic' : 'perspective')
      }

      // Reset — return camera to default perspective position anchored to lot
      if (preset === 'reset') {
        useDevControlsStore.getState().setCameraPreset('perspective')
        clearOrbitAndSetProjection('perspective')
        setCamera(LOT_CAMERAS['perspective'], lotTarget)
        useViewportShellStore.setState({ activeCameraPreset: null })
        return
      }

      // Zoom-to-fit — frame the lot with padding (keep current projection mode)
      if (preset === 'zoom-to-fit') {
        const fitDist = maxDim * 1.8
        useViewportShellStore.getState().setManualOrbit(false)
        setCamera([cx, fitDist * 0.7, cz + fitDist * 0.6], lotTarget)
        useViewportShellStore.setState({ activeCameraPreset: null })
        return
      }

      const devPreset = PRESET_MAP[preset]
      if (devPreset || DIRECT_PRESETS[preset]) {
        const key = devPreset || preset
        if (devPreset) {
          useDevControlsStore.getState().setCameraPreset(devPreset as 'perspective' | 'top' | 'front' | 'iso-ne' | 'iso-nw' | 'iso-se' | 'iso-sw' | 'orbit')
        }
        clearOrbitAndSetProjection(key)
        // Use lot-anchored position if available, otherwise fall back to hardcoded
        const pos = LOT_CAMERAS[key] ?? DIRECT_PRESETS[preset]?.position ?? CAMERA_PRESETS[key]?.position
        if (pos) {
          setCamera(pos as [number, number, number], lotTarget)
        }
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
  const projectionMode = useViewportShellStore((s) => s.projectionMode)
  const isOrtho = projectionMode === 'orthographic'

  // Lot-anchored camera: position + target computed from current lot dimensions
  const cx = lotW / 2
  const cz = lotD / 2
  const maxDim = Math.max(lotW, lotD)
  const dist = maxDim * 1.5
  const lotTarget: [number, number, number] = [cx, 0, cz]

  const LOT_CAMERAS: Record<string, [number, number, number]> = {
    'perspective': [cx + dist * 0.5, dist * 0.7, cz + dist * 0.6],
    'orbit':       [cx + dist * 0.5, dist * 0.7, cz + dist * 0.6],
    'front':       [cx, dist * 0.4, cz + dist],
    'top':         [cx, dist * 1.5, cz],
    'iso-ne':      [cx + dist * 0.8, dist * 0.8, cz + dist * 0.8],
    'iso-nw':      [cx - dist * 0.8, dist * 0.8, cz + dist * 0.8],
    'iso-se':      [cx + dist * 0.8, dist * 0.8, cz - dist * 0.8],
    'iso-sw':      [cx - dist * 0.8, dist * 0.8, cz - dist * 0.8],
  }

  const camPos = LOT_CAMERAS[cameraPreset] ?? LOT_CAMERAS['perspective']

  // Auto-frame orthographic zoom: fit the lot bounding box with padding
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
          position={camPos}
          fov={preset.fov}
          near={0.1}
          far={500}
        />
      )}

      {/* Orthographic camera — for isometric/plan views, auto-framed to lot */}
      {isOrtho && (
        <OrthographicCamera
          makeDefault
          position={camPos}
          zoom={Math.max(8, 800 / orthoZoom)}
          near={-500}
          far={500}
        />
      )}

      <CameraControls target={lotTarget} />

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
