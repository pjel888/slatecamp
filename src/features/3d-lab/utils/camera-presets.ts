import type { CameraPreset } from '@/lib/pd1096/types'

export type CameraSelectionPreset = CameraPreset

export type CameraCommandPreset =
  | CameraSelectionPreset
  | 'iso'
  | 'reset'
  | 'zoom-to-fit'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-delta'

export const DEFAULT_ISO_PRESET: CameraSelectionPreset = 'iso-ne'
export const DEFAULT_VIEW_PRESET: CameraSelectionPreset = 'iso-se'

export const isIsoPreset = (preset: CameraSelectionPreset | null | undefined): boolean =>
  typeof preset === 'string' && preset.startsWith('iso-')

export const normalizeCameraCommandPreset = (
  preset: CameraCommandPreset,
): CameraSelectionPreset | 'iso' | 'reset' | 'zoom-to-fit' | 'zoom-in' | 'zoom-out' | 'zoom-delta' =>
  preset

export const isProjectionCommandPreset = (preset: CameraCommandPreset): boolean =>
  preset === 'perspective' || preset === 'iso'

export const getSelectedCameraPresetAfterCommand = (
  currentSelected: CameraSelectionPreset | null,
  commandPreset: CameraCommandPreset,
): CameraSelectionPreset | null => {
  const normalized = normalizeCameraCommandPreset(commandPreset)

  switch (normalized) {
    case 'reset':
      return DEFAULT_VIEW_PRESET
    case 'zoom-to-fit':
    case 'zoom-in':
    case 'zoom-out':
    case 'zoom-delta':
    case 'iso':
    case 'perspective':
      return currentSelected
    default:
      return normalized
  }
}

export const getProjectionModeAfterCommand = (
  currentProjection: 'perspective' | 'orthographic',
  commandPreset: CameraCommandPreset,
): 'perspective' | 'orthographic' => {
  switch (commandPreset) {
    case 'reset':
    case 'perspective':
      return 'perspective'
    case 'iso':
      return 'orthographic'
    default:
      return currentProjection
  }
}

export const getProjectionModeForSelectedPreset = (
  selectedPreset: CameraSelectionPreset | null,
): 'perspective' | 'orthographic' =>
  selectedPreset != null && selectedPreset !== 'perspective' && selectedPreset !== 'orbit'
    ? 'orthographic'
    : 'perspective'

export const getEffectiveCameraProjectionMode = (
  sceneOrthographic: boolean,
  selectedProjectionMode: 'perspective' | 'orthographic',
): 'perspective' | 'orthographic' =>
  sceneOrthographic || selectedProjectionMode === 'orthographic'
    ? 'orthographic'
    : 'perspective'

export const shouldClearManualOrbitForCommand = (commandPreset: CameraCommandPreset): boolean => {
  const normalized = normalizeCameraCommandPreset(commandPreset)
  return normalized !== 'zoom-to-fit'
    && normalized !== 'zoom-in'
    && normalized !== 'zoom-out'
    && normalized !== 'zoom-delta'
    && normalized !== 'iso'
    && normalized !== 'perspective'
}
