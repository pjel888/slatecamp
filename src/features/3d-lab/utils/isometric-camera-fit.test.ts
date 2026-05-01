import { describe, expect, test } from 'bun:test'
import * as THREE from 'three'
import {
  applyOrthographicClippingPlanesForBounds,
  computeOrthographicClippingPlanesForBounds,
  computeOrthographicGroundFootprint,
  fitIsometricCameraToContent,
  expandBoundsByGroundFootprint,
  getBoxCorners,
  getSafeCameraClipBounds,
  getSafeContentBounds,
} from './isometric-camera-fit'

const EPSILON = 1e-6
const ISO_DIRECTION = new THREE.Vector3(1, 0.75, -1).normalize()

const makeBounds = (size: number) => new THREE.Box3(
  new THREE.Vector3(-size / 2, -size / 3, -size / 2),
  new THREE.Vector3(size / 2, size / 3, size / 2),
)

const makeCamera = () => new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000)

const placeCameraForBounds = (camera: THREE.OrthographicCamera, bounds: THREE.Box3) => {
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())
  camera.position.copy(sphere.center).addScaledVector(ISO_DIRECTION, Math.max(1, sphere.radius * 4))
  camera.lookAt(sphere.center)
  camera.updateMatrixWorld()
  return sphere.center
}

const expectAllCornersInsideClip = (camera: THREE.OrthographicCamera, bounds: THREE.Box3) => {
  camera.updateMatrixWorld()
  const viewMatrix = camera.matrixWorld.clone().invert()

  for (const corner of getBoxCorners(bounds)) {
    const depth = -corner.applyMatrix4(viewMatrix).z
    expect(depth).toBeGreaterThanOrEqual(camera.near - EPSILON)
    expect(depth).toBeLessThanOrEqual(camera.far + EPSILON)
  }
}

describe('isometric orthographic camera fitting', () => {
  for (const [label, size] of [
    ['small', 0.5],
    ['medium', 8],
    ['very large', 1200],
  ] as const) {
    test(`computes near/far planes that contain all ${label} scene corners`, () => {
      const camera = makeCamera()
      const bounds = makeBounds(size)
      const target = placeCameraForBounds(camera, bounds)

      applyOrthographicClippingPlanesForBounds({
        camera,
        bounds,
        position: camera.position,
        target,
      })

      expect(camera.near).toBeGreaterThanOrEqual(0)
      expect(camera.far).toBeGreaterThan(camera.near)
      expectAllCornersInsideClip(camera, bounds)
    })
  }

  test('allows a zero near plane when foreground content needs it', () => {
    const camera = makeCamera()
    const bounds = new THREE.Box3(
      new THREE.Vector3(-1, -1, -1),
      new THREE.Vector3(1, 1, 1),
    )
    const target = new THREE.Vector3(0, 0, 0)
    camera.position.set(0, 0, 2)
    camera.lookAt(target)
    camera.updateMatrixWorld()

    const planes = computeOrthographicClippingPlanesForBounds({
      camera,
      bounds,
      position: camera.position,
      target,
    })

    expect(planes.near).toBe(0)
    expect(planes.far).toBeGreaterThan(planes.near)
  })

  test('fits an orthographic camera to object content and updates controls', () => {
    const camera = makeCamera()
    const contentRoot = new THREE.Group()
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2, 6),
      new THREE.MeshBasicMaterial(),
    )
    mesh.position.set(10, 3, -5)
    contentRoot.add(mesh)
    contentRoot.updateMatrixWorld(true)

    const controls = {
      target: new THREE.Vector3(),
      updateCalls: 0,
      update() {
        this.updateCalls += 1
      },
    }

    fitIsometricCameraToContent({
      camera,
      controls,
      contentRoot,
      viewportAspect: 16 / 9,
      isoDirection: ISO_DIRECTION,
    })

    const bounds = new THREE.Box3().setFromObject(contentRoot, true)
    const sphere = bounds.getBoundingSphere(new THREE.Sphere())
    expect(controls.target.distanceTo(sphere.center)).toBeLessThan(EPSILON)
    expect(controls.updateCalls).toBe(1)
    expect(camera.zoom).toBeGreaterThan(0)
    expectAllCornersInsideClip(camera, bounds)

    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
  })

  test('content bounds exclude grid/helper chrome and explicit fit exclusions', () => {
    const contentRoot = new THREE.Group()
    const lessonMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial(),
    )
    lessonMesh.position.set(5, 0, 0)
    const excludedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1000, 1, 1000),
      new THREE.MeshBasicMaterial(),
    )
    excludedMesh.userData.slatecampCameraFitExclude = true
    contentRoot.add(new THREE.GridHelper(5000, 10), lessonMesh, excludedMesh)

    const bounds = getSafeContentBounds(contentRoot)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())

    expect(center.x).toBeCloseTo(5)
    expect(size.x).toBeCloseTo(2)
    expect(size.z).toBeCloseTo(2)

    lessonMesh.geometry.dispose()
    ;(lessonMesh.material as THREE.Material).dispose()
    excludedMesh.geometry.dispose()
    ;(excludedMesh.material as THREE.Material).dispose()
  })

  test('clip bounds can include visible grid chrome without using it for content fit', () => {
    const contentRoot = new THREE.Group()
    const lessonMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial(),
    )
    const grid = new THREE.GridHelper(1000, 10)
    grid.userData.slatecampCameraFitExclude = true
    grid.userData.slatecampCameraClipInclude = true
    grid.userData.slatecampCameraClipRadius = 500
    grid.userData.slatecampCameraClipHeight = 1
    contentRoot.add(lessonMesh, grid)

    const contentBounds = getSafeContentBounds(contentRoot)
    const clipBounds = getSafeCameraClipBounds(contentRoot)
    const contentSize = contentBounds.getSize(new THREE.Vector3())
    const clipSize = clipBounds.getSize(new THREE.Vector3())

    expect(contentSize.x).toBeCloseTo(2)
    expect(contentSize.z).toBeCloseTo(2)
    expect(clipSize.x).toBeCloseTo(1000)
    expect(clipSize.z).toBeCloseTo(1000)

    lessonMesh.geometry.dispose()
    ;(lessonMesh.material as THREE.Material).dispose()
    grid.dispose()
  })

  test('clip fitting contains a finite grid without moving the orthographic camera', () => {
    const camera = makeCamera()
    const contentRoot = new THREE.Group()
    const lessonMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial(),
    )
    const grid = new THREE.GridHelper(180, 18)
    grid.userData.slatecampCameraFitExclude = true
    grid.userData.slatecampCameraClipInclude = true
    grid.userData.slatecampCameraClipRadius = 90
    grid.userData.slatecampCameraClipHeight = 1
    contentRoot.add(lessonMesh, grid)
    contentRoot.updateMatrixWorld(true)

    camera.position.copy(ISO_DIRECTION.clone().multiplyScalar(400))
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
    const originalPosition = camera.position.clone()

    const clipBounds = getSafeCameraClipBounds(contentRoot)
    applyOrthographicClippingPlanesForBounds({
      camera,
      bounds: clipBounds,
    })

    expect(camera.position.distanceTo(originalPosition)).toBe(0)
    expectAllCornersInsideClip(camera, clipBounds)

    lessonMesh.geometry.dispose()
    ;(lessonMesh.material as THREE.Material).dispose()
    grid.dispose()
  })

  test('ground footprint expands when orthographic zooms out in isometric view', () => {
    const camera = makeCamera()
    camera.position.copy(ISO_DIRECTION.clone().multiplyScalar(1000))
    camera.lookAt(0, 0, 0)
    camera.zoom = 1
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const zoomedInFootprint = computeOrthographicGroundFootprint({
      camera,
      minRadius: 1,
      maxRadius: 2000,
    })

    camera.zoom = 0.05
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const zoomedOutFootprint = computeOrthographicGroundFootprint({
      camera,
      minRadius: 1,
      maxRadius: 2000,
    })

    expect(zoomedInFootprint.usedFallback).toBe(false)
    expect(zoomedOutFootprint.usedFallback).toBe(false)
    expect(zoomedOutFootprint.radius).toBeGreaterThan(zoomedInFootprint.radius * 10)
  })

  test('ground footprint returns finite bounded coverage for SE and non-square frustums', () => {
    const camera = new THREE.OrthographicCamera(-20, 20, 8, -8, 0, 1000)
    camera.position.set(800, 600, -800)
    camera.lookAt(0, 1, 0)
    camera.zoom = 0.05
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const footprint = computeOrthographicGroundFootprint({
      camera,
      minRadius: 50,
      maxRadius: 900,
      padding: 1.4,
    })

    expect(footprint.usedFallback).toBe(false)
    expect(footprint.radius).toBeGreaterThanOrEqual(50)
    expect(footprint.radius).toBeLessThanOrEqual(900)
    expect(footprint.bounds.isEmpty()).toBe(false)

    for (const corner of footprint.corners) {
      expect(Number.isFinite(corner.x)).toBe(true)
      expect(Number.isFinite(corner.y)).toBe(true)
      expect(Number.isFinite(corner.z)).toBe(true)
    }
  })

  test('ground footprint envelope is included in orthographic clip planes', () => {
    const camera = makeCamera()
    camera.position.set(8, 6, -8)
    camera.lookAt(0, 1, 0)
    camera.zoom = 0.05
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const contentBounds = new THREE.Box3(
      new THREE.Vector3(-1, -1, -1),
      new THREE.Vector3(1, 1, 1),
    )
    const clipBounds = contentBounds.clone()
    const footprint = computeOrthographicGroundFootprint({
      camera,
      minRadius: 50,
      maxRadius: 900,
      padding: 1.4,
    })

    expandBoundsByGroundFootprint(clipBounds, footprint)
    applyOrthographicClippingPlanesForBounds({
      camera,
      bounds: clipBounds,
      ensureBoundsInFront: true,
    })

    expectAllCornersInsideClip(camera, clipBounds)
  })
})
