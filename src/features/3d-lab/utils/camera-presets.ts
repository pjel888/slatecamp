import type { CameraPreset } from '@/lib/pd1096/types'

export type CameraSelectionPreset = CameraPreset

export type CameraCommandPreset =
  | CameraSelectionPreset
  | 'iso'
  | 'reset'
  | 'zoom-to-fit'
  | 'zoom-in'
  | 'zoom-out'

export const DEFAULT_ISO_PRESET: CameraSelectionPreset = 'iso-ne'

export const isIsoPreset = (preset: CameraSelectionPreset | null | undefined): boolean =>
  typeof preset === 'string' && preset.startsWith('iso-')

export const normalizeCameraCommandPreset = (
  preset: CameraCommandPreset,
): CameraSelectionPreset | 'reset' | 'zoom-to-fit' | 'zoom-in' | 'zoom-out' =>
  preset === 'iso'
    ? DEFAULT_ISO_PRESET
    : preset as CameraSelectionPreset | 'reset' | 'zoom-to-fit' | 'zoom-in' | 'zoom-out'

export const getSelectedCameraPresetAfterCommand = (
  currentSelected: CameraSelectionPreset | null,
  commandPreset: CameraCommandPreset,
): CameraSelectionPreset | null => {
  const normalized = normalizeCameraCommandPreset(commandPreset)

  switch (normalized) {
    case 'reset':
      return 'perspective'
    case 'zoom-to-fit':
    case 'zoom-in':
    case 'zoom-out':
      return currentSelected
    default:
      return normalized
  }
}

export const getProjectionModeForSelectedPreset = (
  selectedPreset: CameraSelectionPreset | null,
): 'perspective' | 'orthographic' =>
  selectedPreset != null && (selectedPreset === 'top' || selectedPreset === 'front' || isIsoPreset(selectedPreset))
    ? 'orthographic'
    : 'perspective'

export const shouldClearManualOrbitForCommand = (commandPreset: CameraCommandPreset): boolean => {
  const normalized = normalizeCameraCommandPreset(commandPreset)
  return normalized !== 'zoom-to-fit' && normalized !== 'zoom-in' && normalized !== 'zoom-out'
}
