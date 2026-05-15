'use client'

import { useEffect, useCallback, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { StudioLighting } from './StudioLighting'
import type { LightingPreset } from './StudioLighting'
import { SceneBase } from './SceneBase'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import {
  THREE_D_LAB_CONTROL_MAPPING,
  ThreeDLabControlsProvider,
  type ThreeDLabCameraControlConfig,
} from '@/features/3d-lab/components/controls/ThreeDLabControlsProvider'
import {
  getEffectiveCameraProjectionMode,
} from '@/features/3d-lab/utils/camera-presets'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SceneConfigProps {
  /** Camera position [x, y, z]. Default: [6, 6, 6] */
  cameraPosition?: [number, number, number]
  /** Perspective camera FOV in degrees. Default: 35 */
  cameraFov?: number
  /** Orbit target [x, y, z]. Defaults to shared module center. */
  cameraTarget?: [number, number, number]
  /** Use orthographic camera instead of perspective. Default: false */
  orthographic?: boolean
  /** Orthographic camera zoom factor. Default: 1 */
  cameraZoom?: number
  /** Camera near clipping plane. Default: 0.01 for close architectural inspection */
  cameraNear?: number
  /** Camera far clipping plane. Default: 5000 for broad site diagrams */
  cameraFar?: number
  /** Minimum polar angle for OrbitControls (radians). Default: 0 (allows directly overhead) */
  minPolarAngle?: number
  /** Maximum polar angle for OrbitControls (radians). Default: Math.PI (unconstrained modeling orbit) */
  maxPolarAngle?: number
  /** Minimum zoom distance for OrbitControls. Default: 0.01 (allows close inspection) */
  minDistance?: number
  /** Maximum zoom distance for OrbitControls. Default: Infinity */
  maxDistance?: number
  /** Minimum camera-target radius used for pan math. Default: 8 scene units. */
  minPanTargetDistance?: number
  /** Show ground plane in SceneBase. Default: true */
  showGround?: boolean
  /** Disable StudioLighting. Default: false */
  disableLighting?: boolean
  /** Lighting preset passed to StudioLighting. Default: 'studio' */
  lightingPreset?: LightingPreset
  /** Disable SceneBase (ground, fog, tone mapping). Default: false */
  disableSceneBase?: boolean
  /** Show atmospheric fog. Default: false because fog hides large site models when zooming out. */
  showFog?: boolean
  /** Shared camera preset contract for reset/snap/fit commands. */
  cameraControls?: ThreeDLabCameraControlConfig
  /** Override canvas clear color. Default: undefined (uses SceneBase) */
  clearColor?: string
  /** Flat shading mode (NoToneMapping). Default: false */
  flat?: boolean
}

const DEFAULT_MIN_PAN_TARGET_DISTANCE = 8
const MIN_ORTHOGRAPHIC_ZOOM = 0.05
const MAX_ORTHOGRAPHIC_ZOOM = 500

type CameraDiagnosticsSnapshot = {
  ready: true
  projection: 'perspective' | 'orthographic' | 'unknown'
  projectionMode: 'perspective' | 'orthographic'
  selectedCameraPreset: string | null
  manualOrbit: boolean
  navMode: 'orbit' | 'pan' | 'look'
  activeInteraction: 'idle' | 'orbiting' | 'panning'
  commandId: number
  commandPreset: string | null
  position: [number, number, number]
  target: [number, number, number] | null
  distance: number | null
  viewHeight: number | null
  fov: number | null
  zoom: number | null
  near: number | null
  far: number | null
}

type CameraDiagnosticsWindow = Window & {
  __slatecamp3dLabCamera?: {
    read: () => CameraDiagnosticsSnapshot
    last: CameraDiagnosticsSnapshot
  }
}

const getControlsTarget = (controls: unknown) =>
  controls && typeof controls === 'object' && 'target' in controls
    ? (controls as { target: THREE.Vector3 }).target
    : null

const readCameraDiagnosticsSnapshot = (
  camera: THREE.Camera,
  controls: unknown,
): CameraDiagnosticsSnapshot => {
  const state = useViewportShellStore.getState()
  const target = getControlsTarget(controls)?.clone() ?? null
  const distance = target ? camera.position.distanceTo(target) : null
  const projection = camera instanceof THREE.OrthographicCamera
    ? 'orthographic'
    : camera instanceof THREE.PerspectiveCamera
      ? 'perspective'
      : 'unknown'
  const viewHeight = camera instanceof THREE.PerspectiveCamera && distance != null
    ? 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    : camera instanceof THREE.OrthographicCamera
      ? Math.max(0.01, camera.top - camera.bottom) / Math.max(0.01, camera.zoom)
      : null

  return {
    ready: true,
    projection,
    projectionMode: state.projectionMode,
    selectedCameraPreset: state.selectedCameraPreset,
    manualOrbit: state.manualOrbit,
    navMode: state.navMode,
    activeInteraction: state.activeInteraction,
    commandId: state.cameraCommandId,
    commandPreset: state.cameraCommandPreset,
    position: camera.position.toArray() as [number, number, number],
    target: target ? target.toArray() as [number, number, number] : null,
    distance,
    viewHeight,
    fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : null,
    zoom: camera instanceof THREE.OrthographicCamera ? camera.zoom : null,
    near: camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera ? camera.near : null,
    far: camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera ? camera.far : null,
  }
}

const CameraDiagnostics = () => {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)

  const readSnapshot = useCallback(
    () => readCameraDiagnosticsSnapshot(camera, controls),
    [camera, controls],
  )

  useEffect(() => {
    const windowWithDiagnostics = window as CameraDiagnosticsWindow
    const diagnostics = {
      read: readSnapshot,
      last: readSnapshot(),
    }
    windowWithDiagnostics.__slatecamp3dLabCamera = diagnostics

    return () => {
      if (windowWithDiagnostics.__slatecamp3dLabCamera?.read === readSnapshot) {
        delete windowWithDiagnostics.__slatecamp3dLabCamera
      }
    }
  }, [readSnapshot])

  useFrame(() => {
    const diagnostics = (window as CameraDiagnosticsWindow).__slatecamp3dLabCamera
    if (diagnostics?.read === readSnapshot) diagnostics.last = readSnapshot()
  })

  return null
}

const ControlsTargetSetup = ({
  target,
  manualInteractionRef,
}: {
  target: [number, number, number]
  manualInteractionRef: MutableRefObject<boolean>
}) => {
  const controls = useThree((s) => s.controls)
  const invalidate = useThree((s) => s.invalidate)
  const [x, y, z] = target
  const initializedTargetKeyRef = useRef<string | null>(null)
  const targetKey = `${x}:${y}:${z}`

  useEffect(() => {
    if (!controls || !('target' in controls)) return

    const targetChanged = initializedTargetKeyRef.current !== targetKey
    if (!targetChanged && initializedTargetKeyRef.current != null) return
    if (manualInteractionRef.current && !targetChanged) return

    if (targetChanged) manualInteractionRef.current = false

    const orbitControls = controls as unknown as {
      target: THREE.Vector3
      target0?: THREE.Vector3
      update: () => void
    }
    orbitControls.target.set(x, y, z)
    orbitControls.target0?.set(x, y, z)
    orbitControls.update()
    initializedTargetKeyRef.current = targetKey
    invalidate()
  }, [controls, x, y, z, targetKey, manualInteractionRef, invalidate])

  return null
}

const syncPanTargetRadius = ({
  camera,
  controls,
  minPanTargetDistance,
  direction,
  invalidate,
}: {
  camera: THREE.Camera
  controls: unknown
  minPanTargetDistance: number
  direction: THREE.Vector3
  invalidate: () => void
}) => {
  if (!controls || typeof controls !== 'object' || !('target' in controls)) return

  const orbitControls = controls as {
    target: THREE.Vector3
    target0?: THREE.Vector3
    update: () => void
  }
  const currentDistance = camera.position.distanceTo(orbitControls.target)
  const safeDistance = Math.max(0.01, minPanTargetDistance)

  if (Number.isFinite(currentDistance) && currentDistance >= safeDistance) return

  camera.getWorldDirection(direction)
  if (direction.lengthSq() < 0.0001) return

  // OrbitControls scales perspective pan by camera-target distance. When zoom-to-cursor
  // leaves the target almost on top of the camera, pan feels artificially clamped.
  // Move only the invisible focus point farther along the current view ray; the rendered
  // camera direction is unchanged, but subsequent pan deltas regain SketchUp-like range.
  orbitControls.target.copy(camera.position).addScaledVector(direction, safeDistance)
  orbitControls.target0?.copy(orbitControls.target)
  orbitControls.update()
  invalidate()
}

const CustomPanOverride = ({
  navMode,
  manualInteractionRef,
  minPanTargetDistance,
}: {
  navMode: 'orbit' | 'pan' | 'look'
  manualInteractionRef: MutableRefObject<boolean>
  minPanTargetDistance: number
}) => {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const setActiveInteraction = useViewportShellStore((s) => s.setActiveInteraction)
  const panStateRef = useRef({ active: false, pointerId: -1, x: 0, y: 0 })
  const panOffsetRef = useRef(new THREE.Vector3())
  const panAxisRef = useRef(new THREE.Vector3())
  const panUpRef = useRef(new THREE.Vector3())
  const panDirectionRef = useRef(new THREE.Vector3())

  useEffect(() => {
    const canvas = gl.domElement
    const panState = panStateRef.current
    const panOffset = panOffsetRef.current
    const panAxis = panAxisRef.current
    const panUp = panUpRef.current
    const panDirection = panDirectionRef.current

    const getOrbitControls = () => {
      if (!controls || typeof controls !== 'object' || !('target' in controls)) return null
      return controls as unknown as { target: THREE.Vector3; target0?: THREE.Vector3; update: () => void }
    }

    const panLeft = (distance: number) => {
      panAxis.setFromMatrixColumn(camera.matrix, 0)
      panAxis.multiplyScalar(-distance)
      panOffset.add(panAxis)
    }

    const panUpBy = (distance: number) => {
      panUp.setFromMatrixColumn(camera.matrix, 1)
      panUp.multiplyScalar(distance)
      panOffset.add(panUp)
    }

    const applyPanDelta = (deltaX: number, deltaY: number) => {
      const orbitControls = getOrbitControls()
      if (!orbitControls) return

      panOffset.set(0, 0, 0)
      const height = Math.max(1, canvas.clientHeight)
      const width = Math.max(1, canvas.clientWidth)

      if (camera instanceof THREE.PerspectiveCamera) {
        const targetDistance = Math.max(
          minPanTargetDistance,
          camera.position.distanceTo(orbitControls.target),
        )
        const scaledDistance = targetDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        panLeft((2 * deltaX * scaledDistance) / height)
        panUpBy((2 * deltaY * scaledDistance) / height)
      } else if (camera instanceof THREE.OrthographicCamera) {
        panLeft((deltaX * (camera.right - camera.left)) / camera.zoom / width)
        panUpBy((deltaY * (camera.top - camera.bottom)) / camera.zoom / height)
      } else {
        return
      }

      camera.position.add(panOffset)
      orbitControls.target.add(panOffset)
      orbitControls.target0?.copy(orbitControls.target)
      orbitControls.update()
      invalidate()
    }

    const shouldStartPan = (event: PointerEvent) => {
      if (event.button === 2) return false
      const modifierPan = navMode === 'orbit' && (event.shiftKey || event.ctrlKey || event.metaKey)
      const explicitPan = navMode === 'pan'
      return explicitPan || modifierPan
    }

    const stopNativeControls = (event: PointerEvent) => {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    const finishPan = (event?: PointerEvent) => {
      if (!panState.active) return
      if (event && event.pointerId !== panState.pointerId) return
      if (event) stopNativeControls(event)

      panState.active = false
      panState.pointerId = -1
      setActiveInteraction('idle')
      if (event) {
        try { canvas.releasePointerCapture?.(event.pointerId) } catch {}
      }
      canvas.ownerDocument.removeEventListener('pointermove', handlePointerMove, true)
      canvas.ownerDocument.removeEventListener('pointerup', finishPan, true)
      canvas.ownerDocument.removeEventListener('pointercancel', finishPan, true)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!panState.active || event.pointerId !== panState.pointerId) return
      stopNativeControls(event)
      const deltaX = event.clientX - panState.x
      const deltaY = event.clientY - panState.y
      panState.x = event.clientX
      panState.y = event.clientY
      applyPanDelta(deltaX, deltaY)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!shouldStartPan(event)) return
      const orbitControls = getOrbitControls()
      if (!orbitControls) return

      stopNativeControls(event)
      syncPanTargetRadius({
        camera,
        controls: orbitControls,
        minPanTargetDistance,
        direction: panDirection,
        invalidate,
      })
      manualInteractionRef.current = true
      useViewportShellStore.getState().markManualOrbit()
      setActiveInteraction('panning')
      panState.active = true
      panState.pointerId = event.pointerId
      panState.x = event.clientX
      panState.y = event.clientY
      canvas.setPointerCapture?.(event.pointerId)
      canvas.ownerDocument.addEventListener('pointermove', handlePointerMove, true)
      canvas.ownerDocument.addEventListener('pointerup', finishPan, true)
      canvas.ownerDocument.addEventListener('pointercancel', finishPan, true)
    }

    canvas.addEventListener('pointerdown', handlePointerDown, true)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown, true)
      canvas.ownerDocument.removeEventListener('pointermove', handlePointerMove, true)
      canvas.ownerDocument.removeEventListener('pointerup', finishPan, true)
      canvas.ownerDocument.removeEventListener('pointercancel', finishPan, true)
    }
  }, [camera, controls, gl, invalidate, manualInteractionRef, minPanTargetDistance, navMode, setActiveInteraction])

  return null
}

// ─── SceneOverrides ──────────────────────────────────────────────────────────

/**
 * Applies clear color and tone mapping overrides.
 * Only rendered when clearColor or flat is explicitly set.
 */
const SceneOverrides = ({
  clearColor,
  flat,
}: {
  clearColor?: string
  flat: boolean
}) => {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (clearColor) {
      gl.setClearColor(new THREE.Color(clearColor), 1)
    }
    gl.toneMapping = flat ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
    invalidate()
  }, [clearColor, flat, gl, invalidate])

  return null
}

// ─── SceneConfig ─────────────────────────────────────────────────────────────

/**
 * SceneConfig — configures camera, controls, lighting, and scene environment.
 *
 * Rendered inside the R3F Canvas via SceneTunnel (through CanvasWrapper).
 * Default values match the previous hardcoded LabViewportFrame configuration
 * to ensure zero visual regression when no overrides are provided.
 *
 * Templates override only the values they need via `sceneConfig={{ ... }}`.
 */
export const SceneConfig = ({
  cameraPosition = [6, 6, 6],
  cameraFov = 35,
  cameraTarget = [0, 1, 0],
  orthographic = false,
  cameraZoom = 1,
  cameraNear = 0.01,
  cameraFar = 5000,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI,
  minDistance = 0.01,
  maxDistance = Infinity,
  minPanTargetDistance = DEFAULT_MIN_PAN_TARGET_DISTANCE,
  showGround = true,
  disableLighting = false,
  lightingPreset,
  disableSceneBase = false,
  showFog = false,
  cameraControls,
  clearColor,
  flat = false,
}: SceneConfigProps) => {
  const navMode = useViewportShellStore((s) => s.navMode)
  const projectionMode = useViewportShellStore((s) => s.projectionMode)
  const setActiveInteraction = useViewportShellStore((s) => s.setActiveInteraction)
  const getThree = useThree((s) => s.get)
  const invalidate = useThree((s) => s.invalidate)
  const useOrthographicCamera = getEffectiveCameraProjectionMode(orthographic, projectionMode) === 'orthographic'
  const [cameraX, cameraY, cameraZ] = cameraPosition
  const [targetX, targetY, targetZ] = cameraTarget

  // Track the input that started the interaction so OrbitControls visual state
  // matches SketchUp-style modifiers: Orbit + Shift temporarily pans.
  const mouseButtonRef = useRef<number>(-1)
  const modifierPanRef = useRef(false)
  const hasManualControlRef = useRef(false)
  const panDirectionRef = useRef(new THREE.Vector3())

  // Capture mouse button/modifiers on pointerdown so onStart can classify
  // OrbitControls' actual action without fighting its internal event handler.
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const handleDown = (e: PointerEvent) => {
      mouseButtonRef.current = e.button
      modifierPanRef.current = e.shiftKey || e.ctrlKey || e.metaKey
    }
    const handleUp = () => {
      mouseButtonRef.current = -1
      modifierPanRef.current = false
    }
    canvas.addEventListener('pointerdown', handleDown)
    canvas.addEventListener('pointerup', handleUp)
    return () => {
      canvas.removeEventListener('pointerdown', handleDown)
      canvas.removeEventListener('pointerup', handleUp)
    }
  }, [gl])

  const handleControlStart = useCallback(() => {
    const button = mouseButtonRef.current
    const isModifierPan = modifierPanRef.current && navMode === 'orbit'
    const isPanModeDrag = button === 0 && navMode === 'pan'

    hasManualControlRef.current = true

    if (isModifierPan || isPanModeDrag) {
      const state = getThree()
      syncPanTargetRadius({
        camera: state.camera,
        controls: state.controls,
        minPanTargetDistance: cameraControls?.minPanTargetDistance ?? minPanTargetDistance,
        direction: panDirectionRef.current,
        invalidate,
      })
      setActiveInteraction('panning')
    } else {
      setActiveInteraction('orbiting')
    }

    useViewportShellStore.getState().markManualOrbit()
  }, [cameraControls?.minPanTargetDistance, getThree, invalidate, minPanTargetDistance, navMode, setActiveInteraction])

  const handleControlEnd = useCallback(() => {
    setActiveInteraction('idle')
  }, [setActiveInteraction])

  const controlConfig = useMemo(() => (
    cameraControls ?? {
      presets: {
        perspective: { position: cameraPosition, target: cameraTarget, fov: cameraFov },
        orbit: { position: cameraPosition, target: cameraTarget, fov: cameraFov },
      },
      zoomToFit: { position: cameraPosition, target: cameraTarget, fov: cameraFov },
      resetPreset: 'perspective' as const,
      minDistance,
      maxDistance,
      minPolarAngle,
      maxPolarAngle,
      minPanTargetDistance,
    }
  ), [
    cameraControls,
    cameraX,
    cameraY,
    cameraZ,
    targetX,
    targetY,
    targetZ,
    cameraFov,
    minDistance,
    maxDistance,
    minPolarAngle,
    maxPolarAngle,
    minPanTargetDistance,
  ])

  return (
    <ThreeDLabControlsProvider config={controlConfig}>
      <group
        userData={{
          slatecampControlMapping: THREE_D_LAB_CONTROL_MAPPING,
          slatecampControlProvider: 'ThreeDLabControlsProvider',
        }}
      />
      {/* Camera — keep both projection modes as explicit makeDefault cameras.
          Without a makeDefault perspective camera, switching back from the
          OrthographicCamera can leave R3F/OrbitControls bound to the old
          orthographic camera, making the model appear permanently gone. */}
      {useOrthographicCamera ? (
        <OrthographicCamera
          key="orthographic-camera"
          makeDefault
          position={cameraPosition}
          zoom={cameraZoom}
          near={cameraNear}
          far={cameraFar}
        />
      ) : (
        <PerspectiveCamera
          key="perspective-camera"
          makeDefault
          position={cameraPosition}
          fov={cameraFov}
          near={cameraNear}
          far={cameraFar}
        />
      )}

      {/* Controls — deterministic pan override + OrbitControls orbit/zoom fallback */}
      <CustomPanOverride
        navMode={navMode}
        manualInteractionRef={hasManualControlRef}
        minPanTargetDistance={cameraControls?.minPanTargetDistance ?? minPanTargetDistance}
      />
      <ControlsTargetSetup target={cameraTarget} manualInteractionRef={hasManualControlRef} />
      <OrbitControls
        key={useOrthographicCamera ? 'orthographic-controls' : 'perspective-controls'}
        makeDefault
        minDistance={useOrthographicCamera ? undefined : controlConfig.minDistance ?? minDistance}
        maxDistance={useOrthographicCamera ? undefined : controlConfig.maxDistance ?? maxDistance}
        minPolarAngle={controlConfig.minPolarAngle ?? minPolarAngle}
        maxPolarAngle={controlConfig.maxPolarAngle ?? maxPolarAngle}
        minZoom={useOrthographicCamera ? controlConfig.minZoom ?? MIN_ORTHOGRAPHIC_ZOOM : undefined}
        maxZoom={useOrthographicCamera ? controlConfig.maxZoom ?? MAX_ORTHOGRAPHIC_ZOOM : undefined}
        enableDamping={true}
        dampingFactor={0.08}
        enableRotate={true}
        enablePan={true}
        screenSpacePanning={true}
        zoomToCursor={true}
        panSpeed={1.25}
        rotateSpeed={0.75}
        mouseButtons={{
          LEFT: navMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.ROTATE,
          RIGHT: -1 as unknown as THREE.MOUSE, // DISABLED — right-click reserved for context menu
        }}
        touches={{
          ONE: navMode === 'pan' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        onStart={handleControlStart}
        onEnd={handleControlEnd}
      />
      <CameraDiagnostics />

      {/* Lighting */}
      {!disableLighting && <StudioLighting preset={lightingPreset} />}

      {/* Scene environment (ground, fog, tone mapping) */}
      {!disableSceneBase && <SceneBase showGround={showGround} showFog={showFog} />}

      {/* Clear color / tone mapping overrides (only when explicitly set) */}
      {(clearColor != null || flat) && (
        <SceneOverrides clearColor={clearColor} flat={flat} />
      )}
    </ThreeDLabControlsProvider>
  )
}
