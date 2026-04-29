import { beforeEach, describe, expect, test } from 'bun:test'
import { useViewportShellStore } from './useViewportShellStore'

describe('useViewportShellStore camera commands', () => {
  beforeEach(() => {
    useViewportShellStore.getState().reset()
  })


  test('defaults to SE perspective fit-to-view on module load', () => {
    const state = useViewportShellStore.getState()

    expect(state.selectedCameraPreset).toBe('iso-se')
    expect(state.cameraCommandPreset).toBe('zoom-to-fit')
    expect(state.cameraCommandId).toBe(1)
    expect(state.projectionMode).toBe('perspective')
    expect(state.manualOrbit).toBe(false)
  })

  test('keeps view direction and projection mode independent', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('iso-ne')

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe('iso-ne')
    expect(state.cameraCommandPreset).toBe('iso-ne')
    expect(state.projectionMode).toBe('perspective')
    expect(state.manualOrbit).toBe(false)
  })

  test('projection commands do not replace the current named view', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('iso-ne')
    store.snapToPreset('iso')
    const orthographicState = useViewportShellStore.getState()

    expect(orthographicState.selectedCameraPreset).toBe('iso-ne')
    expect(orthographicState.cameraCommandPreset).toBe('iso')
    expect(orthographicState.projectionMode).toBe('orthographic')

    store.snapToPreset('perspective')
    const perspectiveState = useViewportShellStore.getState()

    expect(perspectiveState.selectedCameraPreset).toBe('iso-ne')
    expect(perspectiveState.cameraCommandPreset).toBe('perspective')
    expect(perspectiveState.projectionMode).toBe('perspective')
  })


  test('reset returns to perspective SE fit home state', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('left')
    store.snapToPreset('iso')
    store.snapToPreset('reset')

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe('iso-se')
    expect(state.cameraCommandPreset).toBe('reset')
    expect(state.projectionMode).toBe('perspective')
    expect(state.manualOrbit).toBe(false)
  })

  test('replays the same preset by issuing a fresh command id', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('left')
    const first = useViewportShellStore.getState().cameraCommandId

    store.snapToPreset('left')
    const secondState = useViewportShellStore.getState()

    expect(secondState.cameraCommandPreset).toBe('left')
    expect(secondState.selectedCameraPreset).toBe('left')
    expect(secondState.cameraCommandId).toBe(first + 1)
  })

  test('preserves the current named view when zoom-to-fit is triggered', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('rear')
    store.setManualOrbit(false)
    store.snapToPreset('zoom-to-fit')

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe('rear')
    expect(state.cameraCommandPreset).toBe('zoom-to-fit')
    expect(state.projectionMode).toBe('perspective')
  })

  test('issues repeatable slider zoom commands without clearing the active view', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('iso-ne')
    store.snapToPreset('iso')
    const firstCommandId = useViewportShellStore.getState().cameraCommandId
    store.zoomByDelta(12)

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe('iso-ne')
    expect(state.cameraCommandPreset).toBe('zoom-delta')
    expect(state.cameraZoomDelta).toBe(12)
    expect(state.cameraCommandId).toBe(firstCommandId + 1)
    expect(state.projectionMode).toBe('orthographic')
  })

  test('manual camera movement clears active preset without leaving orthographic mode', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('iso')
    store.markManualOrbit()

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe(null)
    expect(state.cameraCommandPreset).toBe(null)
    expect(state.manualOrbit).toBe(true)
    expect(state.projectionMode).toBe('orthographic')
  })

  test('zoom commands preserve projection mode after manual orthographic movement', () => {
    const store = useViewportShellStore.getState()

    store.snapToPreset('iso')
    store.markManualOrbit()
    store.snapToPreset('zoom-in')

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe(null)
    expect(state.cameraCommandPreset).toBe('zoom-in')
    expect(state.manualOrbit).toBe(true)
    expect(state.projectionMode).toBe('orthographic')
  })
})
