'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { StudioLighting } from './StudioLighting'
import type { LightingPreset } from './StudioLighting'
import { SceneBase } from './SceneBase'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SceneConfigProps {
  /** Camera position [x, y, z]. Default: [6, 6, 6] */
  cameraPosition?: [number, number, number]
  /** Perspective camera FOV in degrees. Default: 35 */
  cameraFov?: number
  /** Use orthographic camera instead of perspective. Default: false */
  orthographic?: boolean
  /** Orthographic camera zoom factor. Default: 1 */
  cameraZoom?: number
  /** Minimum polar angle for OrbitControls (radians). Default: 0 */
  minPolarAngle?: number
  /** Maximum polar angle for OrbitControls (radians). Default: Math.PI / 1.75 */
  maxPolarAngle?: number
  /** Minimum zoom distance for OrbitControls. Default: 3 */
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
  orthographic = false,
  cameraZoom = 1,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI / 1.75,
  minDistance = 3,
  maxDistance = Infinity,
  showGround = true,
  disableLighting = false,
  lightingPreset,
  disableSceneBase = false,
  clearColor,
  flat = false,
}: SceneConfigProps) => {
  return (
    <>
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

      {/* Controls */}
      <OrbitControls
        makeDefault
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />

      {/* Lighting */}
      {!disableLighting && <StudioLighting preset={lightingPreset} />}

      {/* Scene environment (ground, fog, tone mapping) */}
      {!disableSceneBase && <SceneBase showGround={showGround} />}

      {/* Clear color / tone mapping overrides (only when explicitly set) */}
      {(clearColor != null || flat) && (
        <SceneOverrides clearColor={clearColor} flat={flat} />
      )}
    </>
  )
}
