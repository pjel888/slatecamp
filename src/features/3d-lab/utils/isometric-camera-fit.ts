import * as THREE from 'three'

const FALLBACK_BOUNDS_MIN = new THREE.Vector3(-1, -1, -1)
const FALLBACK_BOUNDS_MAX = new THREE.Vector3(1, 1, 1)
const DEFAULT_ISOMETRIC_DIRECTION = new THREE.Vector3(1, 1, 1).normalize()
const MIN_VIEW_SIZE = 0.01
const MIN_CAMERA_DISTANCE = 1
const DEFAULT_CLIP_CHROME_HEIGHT = 1
const DEFAULT_GRID_PLANE_Y = 0
const DEFAULT_GRID_FOOTPRINT_PADDING = 1.35
const MIN_GROUND_DIRECTION_Y = 0.0001

export interface OrbitLikeControls {
  target: THREE.Vector3
  update: () => void
}

export interface OrthographicClippingPlanes {
  near: number
  far: number
  minDepth: number
  maxDepth: number
  margin: number
}

export interface OrthographicZoomForBoundsInput {
  camera: THREE.OrthographicCamera
  bounds: THREE.Box3
  position: THREE.Vector3
  target: THREE.Vector3
  padding?: number
}

export interface OrthographicClippingInput {
  camera: THREE.OrthographicCamera
  bounds: THREE.Box3
  position?: THREE.Vector3
  target?: THREE.Vector3
  margin?: number
  controls?: OrbitLikeControls
  ensureBoundsInFront?: boolean
}

export interface FitIsometricCameraInput {
  camera: THREE.OrthographicCamera
  controls?: OrbitLikeControls
  contentRoot: THREE.Object3D
  viewportAspect: number
  padding?: number
  isoDirection?: THREE.Vector3
}

export interface OrthographicGroundFootprintInput {
  camera: THREE.OrthographicCamera
  planeY?: number
  padding?: number
  minRadius?: number
  maxRadius?: number
  fallbackRadius?: number
}

export interface OrthographicGroundFootprint {
  center: THREE.Vector3
  bounds: THREE.Box3
  radius: number
  corners: THREE.Vector3[]
  usedFallback: boolean
}

const getCameraClipChrome = (object: THREE.Object3D) => {
  const radius = Number(object.userData?.slatecampCameraClipRadius)
  if (!object.userData?.slatecampCameraClipInclude || !Number.isFinite(radius) || radius <= 0) {
    return null
  }

  const height = Number(object.userData?.slatecampCameraClipHeight)
  return {
    radius,
    height: Number.isFinite(height) && height > 0 ? height : DEFAULT_CLIP_CHROME_HEIGHT,
  }
}

export const shouldIncludeObjectInCameraFit = (object: THREE.Object3D): boolean => {
  if (!object.visible) return false
  if (object instanceof THREE.Camera || object instanceof THREE.Light) return false
  if (object instanceof THREE.GridHelper || object instanceof THREE.AxesHelper) return false
  if (object.type.endsWith('Helper')) return false

  let current: THREE.Object3D | null = object
  while (current) {
    if (current.userData?.slatecampCameraFitExclude) return false
    current = current.parent
  }

  return true
}

export const expandCameraClipBoundsByObject = (
  object: THREE.Object3D,
  bounds: THREE.Box3,
  objectBounds: THREE.Box3,
): boolean => {
  const geometry = (object as THREE.Mesh | THREE.Line | THREE.Points).geometry

  if (geometry && shouldIncludeObjectInCameraFit(object)) {
    objectBounds.setFromObject(object, true)
    if (!objectBounds.isEmpty()) {
      bounds.union(objectBounds)
      return true
    }
  }

  const clipChrome = getCameraClipChrome(object)
  if (!clipChrome || !object.visible) return false

  const center = object.getWorldPosition(new THREE.Vector3())
  objectBounds.set(
    new THREE.Vector3(
      center.x - clipChrome.radius,
      center.y - clipChrome.height / 2,
      center.z - clipChrome.radius,
    ),
    new THREE.Vector3(
      center.x + clipChrome.radius,
      center.y + clipChrome.height / 2,
      center.z + clipChrome.radius,
    ),
  )
  bounds.union(objectBounds)
  return true
}

export const getBoxCorners = (bounds: THREE.Box3): THREE.Vector3[] => [
  new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
  new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z),
  new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z),
  new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z),
  new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z),
  new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z),
  new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z),
  new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z),
]

const isFiniteNumber = (value: number) => Number.isFinite(value)

const isFiniteVector = (vector: THREE.Vector3) =>
  isFiniteNumber(vector.x) && isFiniteNumber(vector.y) && isFiniteNumber(vector.z)

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const createGroundFootprint = ({
  center,
  halfSize,
  minRadius,
  maxRadius,
  planeY,
  usedFallback,
}: {
  center: THREE.Vector3
  halfSize: number
  minRadius: number
  maxRadius: number
  planeY: number
  usedFallback: boolean
}): OrthographicGroundFootprint => {
  const radius = clamp(halfSize, minRadius, maxRadius)
  const bounds = new THREE.Box3(
    new THREE.Vector3(center.x - radius, planeY, center.z - radius),
    new THREE.Vector3(center.x + radius, planeY, center.z + radius),
  )

  return {
    center: new THREE.Vector3(center.x, planeY, center.z),
    bounds,
    radius,
    corners: getBoxCorners(bounds),
    usedFallback,
  }
}

export const computeOrthographicGroundFootprint = ({
  camera,
  planeY = DEFAULT_GRID_PLANE_Y,
  padding = DEFAULT_GRID_FOOTPRINT_PADDING,
  minRadius = 90,
  maxRadius = 1200,
  fallbackRadius,
}: OrthographicGroundFootprintInput): OrthographicGroundFootprint => {
  camera.updateMatrixWorld()

  const safeZoom = Math.max(MIN_VIEW_SIZE, camera.zoom)
  const frustumWidth = Math.max(MIN_VIEW_SIZE, Math.abs(camera.right - camera.left) / safeZoom)
  const frustumHeight = Math.max(MIN_VIEW_SIZE, Math.abs(camera.top - camera.bottom) / safeZoom)
  const fallbackHalfSize = Math.max(
    minRadius,
    fallbackRadius ?? Math.sqrt(frustumWidth * frustumWidth + frustumHeight * frustumHeight) * 0.5 * padding,
  )
  const cameraGroundCenter = new THREE.Vector3(camera.position.x, planeY, camera.position.z)
  const direction = camera.getWorldDirection(new THREE.Vector3())

  if (!isFiniteVector(direction) || Math.abs(direction.y) < MIN_GROUND_DIRECTION_Y) {
    return createGroundFootprint({
      center: cameraGroundCenter,
      halfSize: fallbackHalfSize,
      minRadius,
      maxRadius,
      planeY,
      usedFallback: true,
    })
  }

  const bounds = new THREE.Box3().makeEmpty()
  const intersections: THREE.Vector3[] = []
  const cameraRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize()
  const cameraUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize()

  for (const x of [camera.left / safeZoom, camera.right / safeZoom]) {
    for (const y of [camera.bottom / safeZoom, camera.top / safeZoom]) {
      const origin = camera.position.clone()
        .addScaledVector(cameraRight, x)
        .addScaledVector(cameraUp, y)
      const distanceToPlane = (planeY - origin.y) / direction.y

      if (!isFiniteNumber(distanceToPlane) || distanceToPlane < 0) {
        return createGroundFootprint({
          center: cameraGroundCenter,
          halfSize: fallbackHalfSize,
          minRadius,
          maxRadius,
          planeY,
          usedFallback: true,
        })
      }

      const intersection = origin.addScaledVector(direction, distanceToPlane)
      if (!isFiniteVector(intersection)) {
        return createGroundFootprint({
          center: cameraGroundCenter,
          halfSize: fallbackHalfSize,
          minRadius,
          maxRadius,
          planeY,
          usedFallback: true,
        })
      }

      intersection.y = planeY
      intersections.push(intersection)
      bounds.expandByPoint(intersection)
    }
  }

  if (bounds.isEmpty()) {
    return createGroundFootprint({
      center: cameraGroundCenter,
      halfSize: fallbackHalfSize,
      minRadius,
      maxRadius,
      planeY,
      usedFallback: true,
    })
  }

  const center = bounds.getCenter(new THREE.Vector3())
  center.y = planeY
  const size = bounds.getSize(new THREE.Vector3())
  const halfSize = Math.max(size.x, size.z, MIN_VIEW_SIZE) * 0.5 * padding

  return createGroundFootprint({
    center,
    halfSize,
    minRadius,
    maxRadius,
    planeY,
    usedFallback: false,
  })
}

export const expandBoundsByGroundFootprint = (
  bounds: THREE.Box3,
  footprint: OrthographicGroundFootprint,
  height = DEFAULT_CLIP_CHROME_HEIGHT,
): THREE.Box3 => {
  const halfHeight = Math.max(MIN_VIEW_SIZE, height) / 2
  bounds.union(new THREE.Box3(
    new THREE.Vector3(footprint.bounds.min.x, footprint.center.y - halfHeight, footprint.bounds.min.z),
    new THREE.Vector3(footprint.bounds.max.x, footprint.center.y + halfHeight, footprint.bounds.max.z),
  ))
  return bounds
}

export const getSafeContentBounds = (contentRoot: THREE.Object3D): THREE.Box3 => {
  const bounds = new THREE.Box3().makeEmpty()
  const objectBounds = new THREE.Box3()

  contentRoot.updateMatrixWorld(true)
  contentRoot.traverse((object) => {
    if (!shouldIncludeObjectInCameraFit(object)) return

    const geometry = (object as THREE.Mesh | THREE.Line | THREE.Points).geometry
    if (!geometry) return

    objectBounds.setFromObject(object, true)
    if (!objectBounds.isEmpty()) bounds.union(objectBounds)
  })

  if (!bounds.isEmpty()) return bounds

  return new THREE.Box3(FALLBACK_BOUNDS_MIN.clone(), FALLBACK_BOUNDS_MAX.clone())
}

export const getSafeCameraClipBounds = (contentRoot: THREE.Object3D): THREE.Box3 => {
  const bounds = new THREE.Box3().makeEmpty()
  const objectBounds = new THREE.Box3()

  contentRoot.updateMatrixWorld(true)
  contentRoot.traverse((object) => {
    expandCameraClipBoundsByObject(object, bounds, objectBounds)
  })

  if (!bounds.isEmpty()) return bounds

  return new THREE.Box3(FALLBACK_BOUNDS_MIN.clone(), FALLBACK_BOUNDS_MAX.clone())
}

const getOrthographicViewMatrix = ({
  camera,
  position,
  target,
}: {
  camera: THREE.OrthographicCamera
  position?: THREE.Vector3
  target?: THREE.Vector3
}) => {
  if (position && target) {
    return new THREE.Matrix4()
      .lookAt(position, target, camera.up)
      .setPosition(position)
      .invert()
  }

  camera.updateMatrixWorld()
  return new THREE.Matrix4().copy(camera.matrixWorld).invert()
}

export const computeOrthographicZoomForBounds = ({
  camera,
  bounds,
  position,
  target,
  padding = 1.25,
}: OrthographicZoomForBoundsInput): number => {
  const viewMatrix = getOrthographicViewMatrix({ camera, position, target })
  const corner = new THREE.Vector3()
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const boxCorner of getBoxCorners(bounds)) {
    corner.copy(boxCorner).applyMatrix4(viewMatrix)
    minX = Math.min(minX, corner.x)
    maxX = Math.max(maxX, corner.x)
    minY = Math.min(minY, corner.y)
    maxY = Math.max(maxY, corner.y)
  }

  const width = Math.max(maxX - minX, MIN_VIEW_SIZE) * padding
  const height = Math.max(maxY - minY, MIN_VIEW_SIZE) * padding
  const frustumWidth = Math.max(MIN_VIEW_SIZE, camera.right - camera.left)
  const frustumHeight = Math.max(MIN_VIEW_SIZE, camera.top - camera.bottom)

  return Math.min(frustumWidth / width, frustumHeight / height)
}

export const computeOrthographicClippingPlanesForBounds = ({
  camera,
  bounds,
  position,
  target,
  margin,
}: OrthographicClippingInput): OrthographicClippingPlanes => {
  const viewMatrix = getOrthographicViewMatrix({ camera, position, target })
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())
  const resolvedMargin = margin ?? Math.max(1, sphere.radius * 0.25)
  const corner = new THREE.Vector3()
  let minDepth = Infinity
  let maxDepth = -Infinity

  for (const boxCorner of getBoxCorners(bounds)) {
    corner.copy(boxCorner).applyMatrix4(viewMatrix)
    const depth = -corner.z
    minDepth = Math.min(minDepth, depth)
    maxDepth = Math.max(maxDepth, depth)
  }

  const near = Math.max(0, minDepth - resolvedMargin)
  const far = Math.max(near + 1, maxDepth + resolvedMargin)

  return { near, far, minDepth, maxDepth, margin: resolvedMargin }
}

export const applyOrthographicClippingPlanesForBounds = (
  input: OrthographicClippingInput,
): OrthographicClippingPlanes => {
  let planes = computeOrthographicClippingPlanesForBounds(input)

  if (
    input.ensureBoundsInFront
    && !input.position
    && !input.target
    && planes.minDepth < planes.margin
  ) {
    const direction = input.camera.getWorldDirection(new THREE.Vector3())
    if (direction.lengthSq() > MIN_GROUND_DIRECTION_Y) {
      input.camera.position.addScaledVector(direction.normalize(), -(planes.margin - planes.minDepth))
      input.camera.updateMatrixWorld()
      input.controls?.update()
      planes = computeOrthographicClippingPlanesForBounds(input)
    }
  }

  input.camera.near = planes.near
  input.camera.far = planes.far
  input.camera.updateProjectionMatrix()
  return planes
}

export function fitIsometricCameraToContent({
  camera,
  controls,
  contentRoot,
  viewportAspect,
  padding = 1.25,
  isoDirection = DEFAULT_ISOMETRIC_DIRECTION,
}: FitIsometricCameraInput): OrthographicClippingPlanes {
  const bounds = getSafeContentBounds(contentRoot)
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())
  const center = sphere.center
  const direction = isoDirection.clone()

  if (direction.lengthSq() < 0.0001) {
    direction.copy(DEFAULT_ISOMETRIC_DIRECTION)
  }
  direction.normalize()

  const distance = Math.max(MIN_CAMERA_DISTANCE, sphere.radius * 4)
  camera.position.copy(center).addScaledVector(direction, distance)
  camera.lookAt(center)

  const aspect = Number.isFinite(viewportAspect) && viewportAspect > 0 ? viewportAspect : 1
  const frustumHeight = Math.max(MIN_VIEW_SIZE, camera.top - camera.bottom)
  const frustumWidth = frustumHeight * aspect
  camera.left = -frustumWidth / 2
  camera.right = frustumWidth / 2
  camera.top = frustumHeight / 2
  camera.bottom = -frustumHeight / 2
  camera.zoom = computeOrthographicZoomForBounds({
    camera,
    bounds,
    position: camera.position,
    target: center,
    padding,
  })

  if (controls) {
    controls.target.copy(center)
    controls.update()
  }

  camera.updateMatrixWorld()
  return applyOrthographicClippingPlanesForBounds({
    camera,
    bounds,
    position: camera.position,
    target: center,
  })
}
