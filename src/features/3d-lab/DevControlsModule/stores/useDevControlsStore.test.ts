import { beforeEach, describe, expect, test } from 'bun:test'
import { useDevControlsStore } from './useDevControlsStore'

describe('useDevControlsStore camera commands', () => {
  beforeEach(() => {
    useDevControlsStore.getState().reset()
  })

  test('issues a fresh command token even when the same preset is selected twice', () => {
    const store = useDevControlsStore.getState()

    store.setCameraPreset('front')
    const firstState = useDevControlsStore.getState()
    expect(firstState.cameraPreset).toBe('front')
    expect(firstState.cameraCommandPreset).toBe('front')
    expect(firstState.cameraCommandId).toBe(1)

    store.setCameraPreset('front')
    const secondState = useDevControlsStore.getState()
    expect(secondState.cameraPreset).toBe('front')
    expect(secondState.cameraCommandPreset).toBe('front')
    expect(secondState.cameraCommandId).toBe(2)
  })
})
