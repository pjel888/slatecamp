import { beforeEach, describe, expect, test } from 'bun:test'
import { useViewportShellStore } from './useViewportShellStore'

describe('useViewportShellStore camera commands', () => {
  beforeEach(() => {
    useViewportShellStore.getState().reset()
  })

  test('normalizes the generic iso command to the canonical iso preset', () => {
    useViewportShellStore.getState().snapToPreset('iso')

    const state = useViewportShellStore.getState()
    expect(state.selectedCameraPreset).toBe('iso-ne')
    expect(state.cameraCommandPreset).toBe('iso-ne')
    expect(state.projectionMode).toBe('orthographic')
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
})
