import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_ISO_PRESET,
  getProjectionModeForSelectedPreset,
  getSelectedCameraPresetAfterCommand,
  isIsoPreset,
  normalizeCameraCommandPreset,
  shouldClearManualOrbitForCommand,
} from './camera-presets'

describe('camera preset helpers', () => {
  test('normalizes iso aliases to the canonical default iso preset', () => {
    expect(normalizeCameraCommandPreset('iso')).toBe(DEFAULT_ISO_PRESET)
    expect(isIsoPreset('iso-ne')).toBe(true)
    expect(isIsoPreset('rear')).toBe(false)
  })

  test('preserves the current selection for zoom commands and resets to perspective for reset', () => {
    expect(getSelectedCameraPresetAfterCommand('front', 'zoom-in')).toBe('front')
    expect(getSelectedCameraPresetAfterCommand('iso-sw', 'zoom-to-fit')).toBe('iso-sw')
    expect(getSelectedCameraPresetAfterCommand('rear', 'reset')).toBe('perspective')
  })

  test('derives projection mode from the selected preset family', () => {
    expect(getProjectionModeForSelectedPreset('left')).toBe('perspective')
    expect(getProjectionModeForSelectedPreset('iso-ne')).toBe('orthographic')
    expect(getProjectionModeForSelectedPreset(null)).toBe('perspective')
  })

  test('tracks which commands should clear manual orbit state', () => {
    expect(shouldClearManualOrbitForCommand('front')).toBe(true)
    expect(shouldClearManualOrbitForCommand('zoom-out')).toBe(false)
  })
})
