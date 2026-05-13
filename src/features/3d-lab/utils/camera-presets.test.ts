import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_ISO_PRESET,
  DEFAULT_VIEW_PRESET,
  getEffectiveCameraProjectionMode,
  getProjectionModeAfterCommand,
  getSelectedCameraPresetAfterCommand,
  isIsoPreset,
  normalizeCameraCommandPreset,
  shouldClearManualOrbitForCommand,
} from './camera-presets'

describe('camera preset helpers', () => {
  test('keeps projection commands separate from view orientation presets', () => {
    expect(normalizeCameraCommandPreset('iso')).toBe('iso')
    expect(DEFAULT_ISO_PRESET).toBe('iso-ne')
    expect(DEFAULT_VIEW_PRESET).toBe('iso-se')
    expect(isIsoPreset('iso-ne')).toBe(true)
    expect(isIsoPreset('rear')).toBe(false)
  })

  test('preserves the current selection for zoom commands and resets to the home SE view for reset', () => {
    expect(getSelectedCameraPresetAfterCommand('front', 'zoom-in')).toBe('front')
    expect(getSelectedCameraPresetAfterCommand('front', 'zoom-delta')).toBe('front')
    expect(getSelectedCameraPresetAfterCommand('front', 'iso')).toBe('front')
    expect(getSelectedCameraPresetAfterCommand('iso-ne', 'perspective')).toBe('iso-ne')
    expect(getSelectedCameraPresetAfterCommand('iso-sw', 'zoom-to-fit')).toBe('iso-sw')
    expect(getSelectedCameraPresetAfterCommand('rear', 'reset')).toBe(DEFAULT_VIEW_PRESET)
  })

  test('preserves projection for labeled orientation view commands', () => {
    expect(getProjectionModeAfterCommand('perspective', 'iso-ne')).toBe('perspective')
    expect(getProjectionModeAfterCommand('perspective', 'iso-nw')).toBe('perspective')
    expect(getProjectionModeAfterCommand('orthographic', 'iso-nw')).toBe('orthographic')
    expect(getProjectionModeAfterCommand('orthographic', 'front')).toBe('orthographic')
    expect(getProjectionModeAfterCommand('perspective', 'iso')).toBe('perspective')
    expect(getProjectionModeAfterCommand('orthographic', 'perspective')).toBe('perspective')
    expect(getProjectionModeAfterCommand('orthographic', 'reset')).toBe('perspective')
  })

  test('lets preset projection upgrade the shared scene camera to orthographic', () => {
    expect(getEffectiveCameraProjectionMode(false, 'orthographic')).toBe('orthographic')
    expect(getEffectiveCameraProjectionMode(false, 'perspective')).toBe('perspective')
    expect(getEffectiveCameraProjectionMode(true, 'perspective')).toBe('orthographic')
  })

  test('tracks which commands should clear manual orbit state', () => {
    expect(shouldClearManualOrbitForCommand('front')).toBe(true)
    expect(shouldClearManualOrbitForCommand('iso')).toBe(false)
    expect(shouldClearManualOrbitForCommand('perspective')).toBe(false)
    expect(shouldClearManualOrbitForCommand('zoom-out')).toBe(false)
    expect(shouldClearManualOrbitForCommand('zoom-delta')).toBe(false)
  })
})
