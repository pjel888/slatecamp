'use client'

// canvas/DevControlsCanvas.tsx
// - Self-contained R3F Canvas for the Development Controls module
// frameloop="demand" - GPU renders ONLY on invalidate().
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

function CameraControls({ target }: { target: [number, number, number] }) {
  const isDragging = useDevControlsStore((s) => s.isDraggingZone)
  const navMode = useViewportShellStore((s) => s.navMode)
  const setActiveInteraction = useViewportShellStore((s) => s.setActiveInteraction)

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
      useViewportShellStore.getState().markManualOrbit()
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
        RIGHT: -1 as unknown as THREE.MOUSE,
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

function SceneSetup() {
  const { invalidate } = useThree()
  useEffect(() => {
    invalidate()
    return () => resetCursor()
  }, [invalidate])
  return <color attach="background" args={[SCENE.SKY_COLOR]} />
}

function CameraSnapBridge() {
  const { camera, controls, invalidate } = useThree()

  useEffect(() => {
    let prevCommandId = useViewportShellStore.getState().cameraCommandId
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      const preset = state.cameraCommandPreset
      if (!preset || state.cameraCommandId === prevCommandId) return
      prevCommandId = state.cameraCommandId

      const { lot } = useDevControlsStore.getState()
      const cx = lot.width / 2
      const cz = lot.depth / 2
      const maxDim = Math.max(lot.width, lot.depth)
      const dist = maxDim * 1.5
      const fitDist = maxDim * 1.8
      const lotTarget: [number, number, number] = [cx, 0, cz]
      const selectedPreset = state.selectedCameraPreset ?? 'perspective'
      const setCamera = (pos: [number, number, number], tgt: [number, number, number]) => {
        camera.position.set(...pos)
        if (controls && 'target' in controls) {
          const orbitCtrl = controls as unknown as { target: THREE.Vector3; update: () => void }
          orbitCtrl.target.set(...tgt)
          orbitCtrl.update()
        }
        invalidate()
      }

      const LOT_CAMERAS: Record<string, [number, number, number]> = {
        perspective: [cx + dist * 0.5, dist * 0.7, cz + dist * 0.6],
        front: [cx, dist * 0.4, cz + dist],
        top: [cx, dist * 1.5, cz],
        left: [cx - dist, dist * 0.4, cz],
        right: [cx + dist, dist * 0.4, cz],
        rear: [cx, dist * 0.4, cz - dist],
        'iso-ne': [cx + dist * 0.8, dist * 0.8, cz + dist * 0.8],
        'iso-nw': [cx - dist * 0.8, dist * 0.8, cz + dist * 0.8],
        'iso-se': [cx + dist * 0.8, dist * 0.8, cz - dist * 0.8],
        'iso-sw': [cx - dist * 0.8, dist * 0.8, cz - dist * 0.8],
      }

      if (preset === 'zoom-in' || preset === 'zoom-out') {
        const direction = new THREE.Vector3()
        camera.getWorldDirection(direction)
        const step = preset === 'zoom-in' ? 1.5 : -1.5
        camera.position.addScaledVector(direction, step)
        if (controls && 'update' in controls) {
          (controls as { update: () => void }).update()
        }
        invalidate()
        return
      }

      if (preset === 'zoom-to-fit') {
        const anchorPosition = LOT_CAMERAS[selectedPreset] ?? LOT_CAMERAS.perspective
        const targetVector = new THREE.Vector3(...lotTarget)
        const fitOffset = new THREE.Vector3(...anchorPosition).sub(targetVector)

        if (fitOffset.lengthSq() === 0) {
          fitOffset.set(0, fitDist, 0)
        } else {
          fitOffset.setLength(fitDist)
        }

        setCamera(
          [lotTarget[0] + fitOffset.x, lotTarget[1] + fitOffset.y, lotTarget[2] + fitOffset.z],
          lotTarget,
        )
        return
      }

      if (preset === 'reset') {
        useViewportShellStore.getState().setManualOrbit(false)
        useDevControlsStore.getState().setCameraPreset('perspective')
        setCamera(LOT_CAMERAS.perspective, lotTarget)
        return
      }

      if (preset === 'iso') {
        useViewportShellStore.getState().setManualOrbit(false)
        useDevControlsStore.getState().setCameraPreset('iso-ne')
        setCamera(LOT_CAMERAS['iso-ne'], lotTarget)
        return
      }

      useViewportShellStore.getState().setManualOrbit(false)
      useDevControlsStore.getState().setCameraPreset(selectedPreset)
      const pos = LOT_CAMERAS[selectedPreset] ?? CAMERA_PRESETS[selectedPreset]?.position
      if (pos) {
        setCamera(pos, lotTarget)
      }
    })

    return unsubscribe
  }, [camera, controls, invalidate])

  return null
}

function SceneContent() {
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const cameraPreset = useDevControlsStore((s) => s.cameraPreset)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const preset = CAMERA_PRESETS[cameraPreset] ?? CAMERA_PRESETS.perspective
  const projectionMode = useViewportShellStore((s) => s.projectionMode)
  const isOrtho = projectionMode === 'orthographic'

  const cx = lotW / 2
  const cz = lotD / 2
  const maxDim = Math.max(lotW, lotD)
  const dist = maxDim * 1.5
  const lotTarget: [number, number, number] = [cx, 0, cz]

  const LOT_CAMERAS: Record<string, [number, number, number]> = {
    perspective: [cx + dist * 0.5, dist * 0.7, cz + dist * 0.6],
    orbit: [cx + dist * 0.5, dist * 0.7, cz + dist * 0.6],
    front: [cx, dist * 0.4, cz + dist],
    top: [cx, dist * 1.5, cz],
    left: [cx - dist, dist * 0.4, cz],
    right: [cx + dist, dist * 0.4, cz],
    rear: [cx, dist * 0.4, cz - dist],
    'iso-ne': [cx + dist * 0.8, dist * 0.8, cz + dist * 0.8],
    'iso-nw': [cx - dist * 0.8, dist * 0.8, cz + dist * 0.8],
    'iso-se': [cx + dist * 0.8, dist * 0.8, cz - dist * 0.8],
    'iso-sw': [cx - dist * 0.8, dist * 0.8, cz - dist * 0.8],
  }

  const camPos = LOT_CAMERAS[cameraPreset] ?? LOT_CAMERAS.perspective
  const orthoZoom = Math.max(lotW, lotD, 10) * 1.4

  return (
    <>
      <SceneSetup />
      <InvalidateBridge />
      <CameraSnapBridge />
      <SceneLighting />

      {!isOrtho && (
        <PerspectiveCamera
          makeDefault
          position={camPos}
          fov={preset.fov}
          near={0.1}
          far={500}
        />
      )}

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
      <SceneGround />
      <LotGround />
      <DevControlsLayers />
      {visibleLayers.has('rrow') && <RROWIndicator />}
      {visibleLayers.has('firewall') && <FirewallMarkers />}
      {showDimensions && <DimensionLines />}
    </>
  )
}

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
