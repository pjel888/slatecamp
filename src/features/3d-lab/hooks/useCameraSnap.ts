'use client'

// useCameraSnap - bridges DOM store -> R3F camera animation.
// Subscribes to cameraCommandPreset in useViewportShellStore.
// When the command changes, animates OrbitControls camera to target position.

import { useCallback, useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import {
  DEFAULT_ISO_PRESET,
  DEFAULT_VIEW_PRESET,
  isProjectionCommandPreset,
  normalizeCameraCommandPreset,
  type CameraSelectionPreset,
} from '@/features/3d-lab/utils/camera-presets'
import {
  applyOrthographicClippingPlanesForBounds,
  computeOrthographicZoomForBounds as computeFittedOrthographicZoom,
  computeOrthographicGroundFootprint,
  expandBoundsByGroundFootprint,
  expandCameraClipBoundsByObject,
  shouldIncludeObjectInCameraFit,
} from '@/features/3d-lab/utils/isometric-camera-fit'
import type { ThreeDLabCameraPreset } from '@/features/3d-lab/components/controls/ThreeDLabControlsProvider'
import * as THREE from 'three'

// Camera preset positions - target [0, 1.5, 0] centers on typical scene
const PRESETS: Record<CameraSelectionPreset, ThreeDLabCameraPreset> = {
  front: { position: [0, 2, 10], target: [0, 1.5, 0], zoom: 55 },
  top: { position: [0, 12, 0.01], target: [0, 0, 0], zoom: 55 },
  left: { position: [-10, 2, 0], target: [0, 1.5, 0], zoom: 55 },
  right: { position: [10, 2, 0], target: [0, 1.5, 0], zoom: 55 },
  rear: { position: [0, 2, -10], target: [0, 1.5, 0], zoom: 55 },
  orbit: { position: [7, 2.5, 5.5], target: [0, 1.5, 0], fov: 35 },
  'iso-ne': { position: [8, 6, 8], target: [0, 1, 0], zoom: 50 },
  'iso-nw': { position: [-8, 6, 8], target: [0, 1, 0], zoom: 50 },
  'iso-se': { position: [8, 6, -8], target: [0, 1, 0], zoom: 50 },
  'iso-sw': { position: [-8, 6, -8], target: [0, 1, 0], zoom: 50 },
  perspective: { position: [7, 2.5, 5.5], target: [0, 1.5, 0], fov: 35 },
}

const ZOOM_TO_FIT_TARGET: ThreeDLabCameraPreset = {
  position: [4, 3, 4],
  target: [0, 1, 0],
}

const CAMERA_FIT_MARGIN = 1.25
const MIN_FIT_RADIUS = 0.5
const MAX_ORTHOGRAPHIC_ZOOM = 500
const MIN_ORTHOGRAPHIC_ZOOM = 0.05
const MIN_GRID_CLIP_RADIUS = 160
const MAX_GRID_CLIP_RADIUS = 1200
const GRID_CLIP_PADDING = 1.4
const FITTED_VIEW_PRESETS = new Set<CameraSelectionPreset>([
  'front',
  'top',
  'left',
  'right',
  'rear',
  'iso-ne',
  'iso-nw',
  'iso-se',
  'iso-sw',
])

const PRESET_VIEW_DIRECTIONS: Partial<Record<CameraSelectionPreset, [number, number, number]>> = {
  front: [0, 0, 1],
  top: [0, 1, 0.001],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  rear: [0, 0, -1],
  'iso-ne': [1, 0.75, 1],
  'iso-nw': [-1, 0.75, 1],
  'iso-se': [1, 0.75, -1],
  'iso-sw': [-1, 0.75, -1],
}

const getZoomToFitTarget = () =>
  useViewportShellStore.getState().cameraControlConfig.zoomToFit ?? ZOOM_TO_FIT_TARGET

interface AnimState {
  active: boolean
  commandId: number | null
  startPosition: THREE.Vector3
  endPosition: THREE.Vector3
  startTarget: THREE.Vector3
  endTarget: THREE.Vector3
  startTime: number
  duration: number
  currentTarget: THREE.Vector3
}

interface ProjectionTransitionFrame {
  commandId: number
  targetProjection: 'perspective' | 'orthographic'
  position: [number, number, number]
  target: [number, number, number]
  direction: [number, number, number]
  viewHeight: number
  fov?: number
}

type CameraFrame = Omit<ProjectionTransitionFrame, 'commandId' | 'targetProjection'> & {
  projection: 'perspective' | 'orthographic'
}

const isZoomCommand = (preset: string | null): preset is 'zoom-in' | 'zoom-out' =>
  preset === 'zoom-in' || preset === 'zoom-out'

const isZoomDeltaCommand = (preset: string | null): preset is 'zoom-delta' => preset === 'zoom-delta'

const isZoomToFitCommand = (preset: string | null): preset is 'zoom-to-fit' => preset === 'zoom-to-fit'

const isResetCommand = (preset: string | null): preset is 'reset' => preset === 'reset'

const isFittedViewPreset = (preset: CameraSelectionPreset): boolean => FITTED_VIEW_PRESETS.has(preset)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const isFiniteVector = (vector: THREE.Vector3) =>
  Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z)

const getOrbitTarget = (controls: unknown) =>
  controls && typeof controls === 'object' && 'target' in controls
    ? (controls as { target: THREE.Vector3 }).target
    : null

const setOrbitTarget = (controls: unknown, target: THREE.Vector3) => {
  if (!controls || typeof controls !== 'object' || !('target' in controls)) return

  const orbitControls = controls as {
    target: THREE.Vector3
    target0?: THREE.Vector3
    update: () => void
  }
  orbitControls.target.copy(target)
  orbitControls.target0?.copy(target)
  orbitControls.update()
}

const getCameraProjection = (camera: THREE.Camera): 'perspective' | 'orthographic' =>
  camera instanceof THREE.OrthographicCamera ? 'orthographic' : 'perspective'

const shouldSkipCameraFitObject = (object: THREE.Object3D) => !shouldIncludeObjectInCameraFit(object)

const expandBoundsByVisibleGeometry = (
  scene: THREE.Scene,
  bounds: THREE.Box3,
  objectBounds: THREE.Box3,
) => {
  bounds.makeEmpty()

  scene.updateMatrixWorld(true)
  scene.traverse((object) => {
    if (shouldSkipCameraFitObject(object)) return

    const geometry = (object as THREE.Mesh | THREE.Line | THREE.Points).geometry
    if (!geometry) return

    objectBounds.setFromObject(object)
    if (objectBounds.isEmpty()) return

    const size = objectBounds.getSize(new THREE.Vector3())
    const largestDimension = Math.max(size.x, size.y, size.z)

    if (!Number.isFinite(largestDimension) || largestDimension <= 0) return

    bounds.union(objectBounds)
  })

  return !bounds.isEmpty()
}

const expandClipBoundsByVisibleGeometry = (
  scene: THREE.Scene,
  bounds: THREE.Box3,
  objectBounds: THREE.Box3,
) => {
  bounds.makeEmpty()

  scene.updateMatrixWorld(true)
  scene.traverse((object) => {
    expandCameraClipBoundsByObject(object, bounds, objectBounds)
  })

  return !bounds.isEmpty()
}

const syncCameraClip = (camera: THREE.Camera, radius: number, distance: number) => {
  const safeRadius = Math.max(MIN_FIT_RADIUS, radius)
  const safeDistance = Math.max(safeRadius * 2, distance)

  if (camera instanceof THREE.PerspectiveCamera || camera instanceof THREE.OrthographicCamera) {
    camera.near = camera instanceof THREE.OrthographicCamera ? 0 : 0.01
    camera.far = Math.max(5000, safeDistance + safeRadius * 20)
    camera.updateProjectionMatrix()
  }
}

const syncOrthographicCameraClipToBounds = ({
  camera,
  bounds,
  position,
  target,
  ensureBoundsInFront = false,
}: {
  camera: THREE.OrthographicCamera
  bounds: THREE.Box3
  position?: THREE.Vector3
  target?: THREE.Vector3
  ensureBoundsInFront?: boolean
}) => {
  applyOrthographicClippingPlanesForBounds({
    camera,
    bounds,
    position,
    target,
    ensureBoundsInFront,
  })
}

const syncCameraLens = (camera: THREE.Camera, target: ThreeDLabCameraPreset) => {
  if (camera instanceof THREE.PerspectiveCamera && target.fov != null) {
    camera.fov = target.fov
    camera.updateProjectionMatrix()
    return
  }

  if (camera instanceof THREE.OrthographicCamera && target.zoom != null) {
    camera.zoom = target.zoom
    camera.updateProjectionMatrix()
  }
}

const resolveFallbackZoomToFitTarget = ({
  camera,
  controls,
  viewPreset,
}: {
  camera: THREE.Camera
  controls: unknown
  viewPreset?: CameraSelectionPreset | null
}): ThreeDLabCameraPreset => {
  const configuredTarget = getZoomToFitTarget()
  const center = new THREE.Vector3().fromArray(configuredTarget.target)
  const configuredPosition = new THREE.Vector3().fromArray(configuredTarget.position)
  const configuredDistance = Math.max(
    MIN_FIT_RADIUS * 4,
    configuredPosition.distanceTo(center),
  )
  const controlTarget = getOrbitTarget(controls)
  const currentDistance = controlTarget ? camera.position.distanceTo(controlTarget) : NaN
  const distance = Number.isFinite(currentDistance) && currentDistance > 0.01
    ? currentDistance
    : configuredDistance
  const direction = new THREE.Vector3()
  const presetDirection = viewPreset ? PRESET_VIEW_DIRECTIONS[viewPreset] : undefined

  if (presetDirection) {
    direction.fromArray(presetDirection)
  } else {
    direction.copy(camera.position).sub(controlTarget ?? center)
  }

  if (direction.lengthSq() < 0.0001) {
    direction.copy(configuredPosition).sub(center)
  }
  if (direction.lengthSq() < 0.0001) {
    direction.fromArray(PRESET_VIEW_DIRECTIONS[DEFAULT_VIEW_PRESET] ?? [1, 0.75, -1])
  }
  direction.normalize()

  const position = center.clone().addScaledVector(direction, distance)

  return {
    ...configuredTarget,
    position: position.toArray() as [number, number, number],
    target: center.toArray() as [number, number, number],
    ...(camera instanceof THREE.OrthographicCamera ? { zoom: camera.zoom } : {}),
    ...(camera instanceof THREE.PerspectiveCamera ? { fov: camera.fov } : {}),
  }
}

const captureCameraFrame = ({
  camera,
  controls,
}: {
  camera: THREE.Camera
  controls: unknown
}): CameraFrame => {
  const controlTarget = getOrbitTarget(controls)
  const target = controlTarget?.clone() ?? new THREE.Vector3(0, 0, 0)
  const direction = new THREE.Vector3().copy(camera.position).sub(target)
  let distance = direction.length()

  if (!Number.isFinite(distance) || distance < 0.001) {
    camera.getWorldDirection(direction).multiplyScalar(-1)
    distance = MIN_FIT_RADIUS * 4
  }
  direction.normalize()

  const viewHeight = camera instanceof THREE.PerspectiveCamera
    ? Math.max(
      MIN_FIT_RADIUS,
      2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2),
    )
    : camera instanceof THREE.OrthographicCamera
      ? Math.max(
        MIN_FIT_RADIUS,
        Math.max(0.01, camera.top - camera.bottom) / Math.max(MIN_ORTHOGRAPHIC_ZOOM, camera.zoom),
      )
      : Math.max(MIN_FIT_RADIUS, distance)

  return {
    projection: getCameraProjection(camera),
    position: camera.position.toArray() as [number, number, number],
    target: target.toArray() as [number, number, number],
    direction: direction.toArray() as [number, number, number],
    viewHeight,
    fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : undefined,
  }
}

const captureProjectionTransitionFrame = ({
  commandId,
  targetProjection,
  camera,
  controls,
  sourceFrame,
}: {
  commandId: number
  targetProjection: 'perspective' | 'orthographic'
  camera: THREE.Camera
  controls: unknown
  sourceFrame?: CameraFrame | null
}): ProjectionTransitionFrame => {
  const frame = sourceFrame ?? captureCameraFrame({ camera, controls })
  return {
    commandId,
    targetProjection,
    position: frame.position,
    target: frame.target,
    direction: frame.direction,
    viewHeight: frame.viewHeight,
    fov: frame.fov,
  }
}

const applyProjectionTransitionFrame = ({
  frame,
  camera,
  controls,
}: {
  frame: ProjectionTransitionFrame
  camera: THREE.Camera
  controls: unknown
}) => {
  const currentProjection = getCameraProjection(camera)
  if (currentProjection !== frame.targetProjection) return false

  const target = new THREE.Vector3().fromArray(frame.target)
  const direction = new THREE.Vector3().fromArray(frame.direction)
  if (direction.lengthSq() < 0.0001) direction.fromArray(PRESET_VIEW_DIRECTIONS[DEFAULT_VIEW_PRESET] ?? [1, 0.75, -1])
  direction.normalize()

  if (camera instanceof THREE.OrthographicCamera) {
    const sourceDistance = new THREE.Vector3().fromArray(frame.position).distanceTo(target)
    const distance = Math.max(MIN_FIT_RADIUS * 4, sourceDistance)
    camera.position.copy(target).addScaledVector(direction, distance)
    camera.zoom = clamp(
      Math.max(0.01, camera.top - camera.bottom) / Math.max(MIN_FIT_RADIUS, frame.viewHeight),
      MIN_ORTHOGRAPHIC_ZOOM,
      MAX_ORTHOGRAPHIC_ZOOM,
    )
    camera.lookAt(target)
    syncCameraClip(camera, frame.viewHeight / 2, distance)
    setOrbitTarget(controls, target)
    return true
  }

  if (camera instanceof THREE.PerspectiveCamera) {
    const fov = frame.fov ?? camera.fov
    camera.fov = fov
    const distance = Math.max(
      MIN_FIT_RADIUS * 4,
      frame.viewHeight / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2)),
    )
    camera.position.copy(target).addScaledVector(direction, distance)
    camera.lookAt(target)
    syncCameraClip(camera, frame.viewHeight / 2, distance)
    setOrbitTarget(controls, target)
    return true
  }

  return false
}

const resolveScenePresetTarget = ({
  presetKey,
  configuredTarget,
  hasExplicitPreset,
  camera,
  controls,
  scene,
  bounds,
  sphere,
  direction,
  objectBounds,
}: {
  presetKey: CameraSelectionPreset
  configuredTarget: ThreeDLabCameraPreset
  hasExplicitPreset: boolean
  camera: THREE.Camera
  controls: unknown
  scene: THREE.Scene
  bounds: THREE.Box3
  sphere: THREE.Sphere
  direction: THREE.Vector3
  objectBounds: THREE.Box3
}): ThreeDLabCameraPreset => {
  if (!isFittedViewPreset(presetKey)) return configuredTarget
  const hasVisibleBounds = expandBoundsByVisibleGeometry(scene, bounds, objectBounds)
  if (hasVisibleBounds) bounds.getBoundingSphere(sphere)

  const controlTarget = controls && typeof controls === 'object' && 'target' in controls
    ? (controls as { target: THREE.Vector3 }).target
    : null
  const configuredCenter = new THREE.Vector3().fromArray(configuredTarget.target)
  const center = hasVisibleBounds && isFiniteVector(sphere.center)
    ? sphere.center.clone()
    : controlTarget?.clone() ?? configuredCenter
  const radius = hasVisibleBounds && isFiniteVector(sphere.center)
    ? Math.max(MIN_FIT_RADIUS, sphere.radius)
    : MIN_FIT_RADIUS
  const presetDirection = PRESET_VIEW_DIRECTIONS[presetKey]

  if (hasExplicitPreset) {
    direction
      .fromArray(configuredTarget.position)
      .sub(new THREE.Vector3().fromArray(configuredTarget.target))
  } else if (presetDirection) {
    direction.fromArray(presetDirection)
  } else {
    direction.copy(camera.position).sub(center)
  }

  if (direction.lengthSq() < 0.0001) {
    direction.fromArray(presetDirection ?? [1, 0.75, 1])
  }
  direction.normalize()

  const configuredDistance = new THREE.Vector3()
    .fromArray(configuredTarget.position)
    .distanceTo(new THREE.Vector3().fromArray(configuredTarget.target))
  const currentDistance = camera.position.distanceTo(center)
  const distance = Math.max(
    Number.isFinite(currentDistance) && currentDistance > 0.01 ? currentDistance : 0,
    configuredDistance,
    radius * 4,
  )
  const position = center.clone().addScaledVector(direction, distance)

  if (camera instanceof THREE.OrthographicCamera) {
    if (hasVisibleBounds) {
      syncOrthographicCameraClipToBounds({
        camera,
        bounds,
        position,
        target: center,
      })
    } else {
      syncCameraClip(camera, radius, distance)
    }

    return {
      position: position.toArray() as [number, number, number],
      target: center.toArray() as [number, number, number],
      zoom: camera.zoom,
    }
  }

  if (camera instanceof THREE.PerspectiveCamera) {
    syncCameraClip(camera, radius, distance)

    return {
      position: position.toArray() as [number, number, number],
      target: center.toArray() as [number, number, number],
      fov: camera.fov,
    }
  }

  return configuredTarget
}

const resolveSceneZoomToFitTarget = ({
  camera,
  scene,
  controls,
  viewportSize,
  viewPreset,
  bounds,
  sphere,
  direction,
  objectBounds,
}: {
  camera: THREE.Camera
  scene: THREE.Scene
  controls: unknown
  viewportSize: { width: number; height: number }
  viewPreset?: CameraSelectionPreset | null
  bounds: THREE.Box3
  sphere: THREE.Sphere
  direction: THREE.Vector3
  objectBounds: THREE.Box3
}): ThreeDLabCameraPreset | null => {
  if (!expandBoundsByVisibleGeometry(scene, bounds, objectBounds)) return null

  bounds.getBoundingSphere(sphere)
  if (!isFiniteVector(sphere.center)) return null

  const radius = Math.max(MIN_FIT_RADIUS, sphere.radius)
  const center = sphere.center
  const controlTarget = getOrbitTarget(controls)
  const presetDirection = viewPreset ? PRESET_VIEW_DIRECTIONS[viewPreset] : undefined

  if (presetDirection) {
    direction.fromArray(presetDirection)
  } else {
    direction.copy(camera.position).sub(controlTarget ?? center)
  }
  if (direction.lengthSq() < 0.0001) camera.getWorldDirection(direction).multiplyScalar(-1)
  direction.normalize()

  if (camera instanceof THREE.PerspectiveCamera) {
    const verticalFov = THREE.MathUtils.degToRad(camera.fov)
    const aspect = viewportSize.height > 0 ? viewportSize.width / viewportSize.height : 1
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect)
    const distance = CAMERA_FIT_MARGIN * Math.max(
      radius / Math.sin(verticalFov / 2),
      radius / Math.sin(horizontalFov / 2),
    )
    const position = center.clone().addScaledVector(direction, distance)
    syncCameraClip(camera, radius, distance)

    return {
      position: position.toArray() as [number, number, number],
      target: center.toArray() as [number, number, number],
      fov: camera.fov,
    }
  }

  if (camera instanceof THREE.OrthographicCamera) {
    const distance = Math.max(camera.position.distanceTo(center), radius * 4)
    const position = center.clone().addScaledVector(direction, distance)
    const zoom = clamp(computeFittedOrthographicZoom({
      camera,
      bounds,
      position,
      target: center,
      padding: CAMERA_FIT_MARGIN,
    }), MIN_ORTHOGRAPHIC_ZOOM, MAX_ORTHOGRAPHIC_ZOOM)
    syncOrthographicCameraClipToBounds({
      camera,
      bounds,
      position,
      target: center,
    })

    return {
      position: position.toArray() as [number, number, number],
      target: center.toArray() as [number, number, number],
      zoom,
    }
  }

  return null
}

export const useCameraSnap = () => {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const scene = useThree((s) => s.scene)
  const viewportSize = useThree((s) => s.size)
  const getThree = useThree((s) => s.get)
  const invalidate = useThree((s) => s.invalidate)
  const animRef = useRef<AnimState>({
    active: false,
    commandId: null,
    startPosition: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    startTime: 0,
    duration: 600,
    currentTarget: new THREE.Vector3(),
  })
  const zoomDirectionRef = useRef(new THREE.Vector3())
  const fitBoundsRef = useRef(new THREE.Box3())
  const fitObjectBoundsRef = useRef(new THREE.Box3())
  const clipBoundsRef = useRef(new THREE.Box3())
  const clipObjectBoundsRef = useRef(new THREE.Box3())
  const fitSphereRef = useRef(new THREE.Sphere())
  const fitDirectionRef = useRef(new THREE.Vector3())
  const prevCommandIdRef = useRef<number | null>(null)
  const projectionTransitionRef = useRef<ProjectionTransitionFrame | null>(null)
  const lastCameraFrameRef = useRef<CameraFrame | null>(null)
  const fitRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fitRetryAttemptRef = useRef(0)

  const syncOrthographicClipToVisibleScene = useCallback(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return false
    if (!expandClipBoundsByVisibleGeometry(scene, clipBoundsRef.current, clipObjectBoundsRef.current)) return false

    expandBoundsByGroundFootprint(
      clipBoundsRef.current,
      computeOrthographicGroundFootprint({
        camera,
        padding: GRID_CLIP_PADDING,
        minRadius: MIN_GRID_CLIP_RADIUS,
        maxRadius: MAX_GRID_CLIP_RADIUS,
      }),
    )
    syncOrthographicCameraClipToBounds({
      camera,
      bounds: clipBoundsRef.current,
      ensureBoundsInFront: true,
    })
    return true
  }, [camera, scene])

  // Drive animation via useFrame - works with demand frameloop
  useFrame(() => {
    const writeLastCameraFrame = () => {
      const state = useViewportShellStore.getState()
      const projectionCommandPending =
        state.cameraCommandPreset != null
        && isProjectionCommandPreset(state.cameraCommandPreset)
        && state.cameraCommandId !== prevCommandIdRef.current

      if (!projectionCommandPending) {
        lastCameraFrameRef.current = captureCameraFrame({ camera, controls })
      }
    }

    const anim = animRef.current
    if (!anim.active) {
      syncOrthographicClipToVisibleScene()
      writeLastCameraFrame()
      return
    }

    const state = useViewportShellStore.getState()
    if (state.manualOrbit || state.cameraCommandId !== anim.commandId) {
      anim.active = false
      anim.commandId = null
      writeLastCameraFrame()
      return
    }

    const elapsed = performance.now() - anim.startTime
    const t = Math.min(elapsed / anim.duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3)

    camera.position.lerpVectors(anim.startPosition, anim.endPosition, eased)

    if (controls && 'target' in controls) {
      const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
      anim.currentTarget.lerpVectors(anim.startTarget, anim.endTarget, eased)
      orbitControls.target.copy(anim.currentTarget)
      orbitControls.update()
    }

    if (t >= 1) {
      anim.active = false
      anim.commandId = null
    } else {
      invalidate()
    }
    syncOrthographicClipToVisibleScene()
    writeLastCameraFrame()
  })

  useEffect(() => {
    if (!controls || typeof controls !== 'object' || !('addEventListener' in controls)) return

    const controlEvents = controls as {
      addEventListener: (type: 'change', listener: () => void) => void
      removeEventListener: (type: 'change', listener: () => void) => void
    }
    const handleChange = () => {
      if (syncOrthographicClipToVisibleScene()) invalidate()
    }

    controlEvents.addEventListener('change', handleChange)
    handleChange()

    return () => {
      controlEvents.removeEventListener('change', handleChange)
    }
  }, [controls, invalidate, syncOrthographicClipToVisibleScene])

  useEffect(() => {
    const clearFitRetry = () => {
      if (fitRetryRef.current != null) {
        clearTimeout(fitRetryRef.current)
        fitRetryRef.current = null
      }
      fitRetryAttemptRef.current = 0
    }

    const replayProjectionTransitionFrame = (frame: ProjectionTransitionFrame) => {
      const replay = () => {
        const state = useViewportShellStore.getState()
        if (
          state.cameraCommandId !== frame.commandId
          || state.cameraCommandPreset == null
          || !isProjectionCommandPreset(state.cameraCommandPreset)
        ) {
          return
        }

        const current = getThree()
        if (getCameraProjection(current.camera) !== frame.targetProjection) return

        const applied = applyProjectionTransitionFrame({
          frame,
          camera: current.camera,
          controls: current.controls,
        })
        if (applied) invalidate()
      }

      requestAnimationFrame(() => requestAnimationFrame(replay))
      setTimeout(replay, 80)
    }

    const applyZoomScale = (zoomFactor: number) => {
      if (!Number.isFinite(zoomFactor) || zoomFactor <= 0) return

      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom = clamp(camera.zoom * zoomFactor, MIN_ORTHOGRAPHIC_ZOOM, MAX_ORTHOGRAPHIC_ZOOM)
        camera.updateProjectionMatrix()
        syncOrthographicClipToVisibleScene()
      } else if (camera instanceof THREE.PerspectiveCamera) {
        const orbitTarget = controls && typeof controls === 'object' && 'target' in controls
          ? (controls as { target: THREE.Vector3 }).target
          : null
        const direction = zoomDirectionRef.current

        if (orbitTarget) {
          direction.copy(camera.position).sub(orbitTarget)
          let currentDistance = direction.length()

          if (currentDistance < 0.001) {
            camera.getWorldDirection(direction).multiplyScalar(-1)
            currentDistance = Math.max(
              MIN_FIT_RADIUS,
              useViewportShellStore.getState().cameraControlConfig.minPanTargetDistance ?? MIN_FIT_RADIUS,
            )
          }

          direction.normalize()
          const maxDistance = Math.max(5000, camera.far * 0.9)
          const nextDistance = clamp(currentDistance / zoomFactor, 0.01, maxDistance)
          camera.position.copy(orbitTarget).addScaledVector(direction, nextDistance)
        } else {
          camera.getWorldDirection(direction)
          camera.position.addScaledVector(direction, zoomFactor > 1 ? 1.5 : -1.5)
        }
      }

      if (controls && 'update' in controls) {
        (controls as { update: () => void }).update()
      }
      invalidate()
    }

    const applyCameraCommand = (state: ReturnType<typeof useViewportShellStore.getState>, force = false) => {
      const commandId = state.cameraCommandId
      const commandPreset = state.cameraCommandPreset

      if (!commandPreset || (!force && commandId === prevCommandIdRef.current)) return
      prevCommandIdRef.current = commandId

      const normalizedPreset = normalizeCameraCommandPreset(commandPreset)

      if (isProjectionCommandPreset(commandPreset)) {
        const targetProjection = state.projectionMode
        const currentProjection = getCameraProjection(camera)

        if (
          projectionTransitionRef.current?.commandId !== commandId
          || projectionTransitionRef.current.targetProjection !== targetProjection
        ) {
          const sourceFrame =
            currentProjection === targetProjection
            && lastCameraFrameRef.current?.projection !== targetProjection
              ? lastCameraFrameRef.current
              : null
          projectionTransitionRef.current = captureProjectionTransitionFrame({
            commandId,
            targetProjection,
            camera,
            controls,
            sourceFrame,
          })
        }

        if (
          currentProjection === targetProjection
          && projectionTransitionRef.current?.commandId === commandId
        ) {
          const frame = projectionTransitionRef.current
          const applied = applyProjectionTransitionFrame({
            frame,
            camera,
            controls,
          })
          if (applied) {
            replayProjectionTransitionFrame(frame)
            projectionTransitionRef.current = null
          }
        }

        invalidate()
        return
      }

      if (isZoomCommand(commandPreset)) {
        applyZoomScale(commandPreset === 'zoom-in' ? 1.2 : 1 / 1.2)
        return
      }

      if (isZoomDeltaCommand(commandPreset)) {
        applyZoomScale(Math.exp(state.cameraZoomDelta * 0.018))
        return
      }

      if (isZoomToFitCommand(commandPreset)) {
        const viewPreset = state.manualOrbit ? null : state.selectedCameraPreset
        const sceneTarget = resolveSceneZoomToFitTarget({
          camera,
          scene,
          controls,
          viewportSize,
          viewPreset,
          bounds: fitBoundsRef.current,
          sphere: fitSphereRef.current,
          direction: fitDirectionRef.current,
          objectBounds: fitObjectBoundsRef.current,
        })
        const target = sceneTarget ?? resolveFallbackZoomToFitTarget({ camera, controls, viewPreset })

        if (sceneTarget != null) clearFitRetry()
        else if (!state.manualOrbit && fitRetryRef.current == null && fitRetryAttemptRef.current < 6) {
          const attempt = fitRetryAttemptRef.current + 1
          fitRetryAttemptRef.current = attempt
          fitRetryRef.current = setTimeout(() => {
            fitRetryRef.current = null
            const nextState = useViewportShellStore.getState()
            if (
              nextState.cameraCommandId === commandId
              && nextState.cameraCommandPreset === 'zoom-to-fit'
              && !nextState.manualOrbit
            ) {
              applyCameraCommand(nextState, true)
            }
          }, 120 * attempt)
        }

        syncCameraLens(camera, target)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
          camera.position.set(...target.position)
          if (controls && 'target' in controls) {
            const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
            orbitControls.target.set(...target.target)
            orbitControls.update()
          }
          syncOrthographicClipToVisibleScene()
          invalidate()
          return
        }

        const anim = animRef.current
        anim.commandId = commandId
        anim.startPosition.copy(camera.position)
        anim.endPosition.set(...target.position)

        if (controls && 'target' in controls) {
          const orbitControls = controls as unknown as { target: THREE.Vector3 }
          anim.startTarget.copy(orbitControls.target)
        } else {
          anim.startTarget.set(0, 0, 0)
        }
        anim.endTarget.set(...target.target)

        anim.startTime = performance.now()
        anim.duration = 600
        anim.active = true
        invalidate()
        return
      }

      const presetKey = (normalizedPreset ?? DEFAULT_ISO_PRESET) as CameraSelectionPreset
      const controlConfig = useViewportShellStore.getState().cameraControlConfig
      const activePresets = { ...PRESETS, ...(controlConfig.presets ?? {}) }
      const configuredTarget = activePresets[presetKey] ?? PRESETS[presetKey]
      const target = isResetCommand(commandPreset)
        ? resolveSceneZoomToFitTarget({
          camera,
          scene,
          controls,
          viewportSize,
          viewPreset: DEFAULT_VIEW_PRESET,
          bounds: fitBoundsRef.current,
          sphere: fitSphereRef.current,
          direction: fitDirectionRef.current,
          objectBounds: fitObjectBoundsRef.current,
        }) ?? resolveFallbackZoomToFitTarget({
          camera,
          controls,
          viewPreset: DEFAULT_VIEW_PRESET,
        })
        : resolveScenePresetTarget({
          presetKey,
          configuredTarget,
          hasExplicitPreset: controlConfig.presets?.[presetKey] != null,
          camera,
          controls,
          scene,
          bounds: fitBoundsRef.current,
          sphere: fitSphereRef.current,
          direction: fitDirectionRef.current,
          objectBounds: fitObjectBoundsRef.current,
        })
      syncCameraLens(camera, target)

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) {
        camera.position.set(...target.position)
        if (controls && 'target' in controls) {
          const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void }
          orbitControls.target.set(...target.target)
          orbitControls.update()
        }
        syncOrthographicClipToVisibleScene()
        invalidate()
        return
      }

      const anim = animRef.current
      anim.commandId = commandId
      anim.startPosition.copy(camera.position)
      anim.endPosition.set(...target.position)

      if (controls && 'target' in controls) {
        const orbitControls = controls as unknown as { target: THREE.Vector3 }
        anim.startTarget.copy(orbitControls.target)
      } else {
        anim.startTarget.set(0, 0, 0)
      }
      anim.endTarget.set(...target.target)

      anim.startTime = performance.now()
      anim.duration = 600
      anim.active = true
      invalidate()
    }

    const unsubscribe = useViewportShellStore.subscribe((state) => {
      applyCameraCommand(state)
    })

    applyCameraCommand(useViewportShellStore.getState(), true)

    return () => {
      clearFitRetry()
      unsubscribe()
    }
  }, [camera, controls, scene, viewportSize, getThree, invalidate, syncOrthographicClipToVisibleScene])
}
