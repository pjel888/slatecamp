'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
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
  /** Minimum polar angle for OrbitControls (radians). Default: 0 (allows directly overhead) */
  minPolarAngle?: number
  /** Maximum polar angle for OrbitControls (radians). Default: Math.PI - 0.05 (allows orbit below ground plane) */
  maxPolarAngle?: number
  /** Minimum zoom distance for OrbitControls. Default: 0.5 (allows close inspection) */
  minDistance?: number
  /** Maximum zoom distance for OrbitControls. Default: Infinity */
  maxDistance?: number
  /** Show ground plane in SceneBase. Default: true */
  showGround?: boolean
  /** Disable StudioLighting. Default: false */
  disableLighting?: boolean
  /** Lighting preset passed to StudioLighting. Default: 'studio' */
  lightingPreset?: LightingPreset
  /** Disable SceneBase (ground, fog, tone mapping). Default: false */
  disableSceneBase?: boolean
  /** Shared camera preset contract for reset/snap/fit commands. */
  cameraControls?: ThreeDLabCameraControlConfig
  /** Override canvas clear color. Default: undefined (uses SceneBase) */
  clearColor?: string
  /** Flat shading mode (NoToneMapping). Default: false */
  flat?: boolean
}

// ─── CameraSetup ─────────────────────────────────────────────────────────────

/**
 * Imperatively configures the existing perspective camera.
 * Uses useEffect (not declarative props) to avoid fighting with OrbitControls
 * on parent re-renders — OrbitControls modifies camera.position directly,
 * and declarative position props would reset it.
 */
const CameraSetup = ({
  position,
  fov,
}: {
  position: [number, number, number]
  fov: number
}) => {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const [x, y, z] = position

  useEffect(() => {
    camera.position.set(x, y, z)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    invalidate()
  }, [camera, x, y, z, fov, invalidate])

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
  minPolarAngle = 0,
  maxPolarAngle = Math.PI - 0.05,
  minDistance = 0.5,
  maxDistance = Infinity,
  showGround = true,
  disableLighting = false,
  lightingPreset,
  disableSceneBase = false,
  cameraControls,
  clearColor,
  flat = false,
}: SceneConfigProps) => {
  const navMode = useViewportShellStore((s) => s.navMode)
  const setActiveInteraction = useViewportShellStore((s) => s.setActiveInteraction)

  // Track which mouse button started the interaction to distinguish orbit vs pan
  const mouseButtonRef = useRef<number>(-1)

  // Capture mouse button on pointerdown so we know which button started the control interaction
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
    // Middle mouse (1) = always pan; Left mouse (0) = depends on navMode
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

  const controlConfig = cameraControls ?? {
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
  }

  return (
    <ThreeDLabControlsProvider config={controlConfig}>
      <group
        userData={{
          slatecampControlMapping: THREE_D_LAB_CONTROL_MAPPING,
          slatecampControlProvider: 'ThreeDLabControlsProvider',
        }}
      />
      {/* Camera — orthographic uses drei component; perspective uses imperative setup */}
      {orthographic ? (
        <OrthographicCamera
          makeDefault
          position={cameraPosition}
          zoom={cameraZoom}
        />
      ) : (
        <CameraSetup position={cameraPosition} fov={cameraFov} />
      )}

      {/* Controls — orbit/pan behavior */}
      <OrbitControls
        makeDefault
        target={cameraTarget}
        minDistance={controlConfig.minDistance ?? minDistance}
        maxDistance={controlConfig.maxDistance ?? maxDistance}
        minPolarAngle={controlConfig.minPolarAngle ?? minPolarAngle}
        maxPolarAngle={controlConfig.maxPolarAngle ?? maxPolarAngle}
        enableDamping={true}
        dampingFactor={0.08}
        enableRotate={navMode === 'orbit'}
        enablePan={true}
        zoomToCursor={true}
        panSpeed={1}
        mouseButtons={{
          LEFT: navMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: -1 as unknown as THREE.MOUSE, // DISABLED — right-click reserved for context menu
        }}
        onStart={handleControlStart}
        onEnd={handleControlEnd}
      />

      {/* Lighting */}
      {!disableLighting && <StudioLighting preset={lightingPreset} />}

      {/* Scene environment (ground, fog, tone mapping) */}
      {!disableSceneBase && <SceneBase showGround={showGround} />}

      {/* Clear color / tone mapping overrides (only when explicitly set) */}
      {(clearColor != null || flat) && (
        <SceneOverrides clearColor={clearColor} flat={flat} />
      )}
    </ThreeDLabControlsProvider>
  )
}
