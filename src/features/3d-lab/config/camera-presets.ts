// ─── Camera Preset Registry ───────────────────────────────────────────────────
//
// Named camera positions for the 3D Lab viewport.
// Use getCameraPreset(name) to retrieve a preset by name.
// Each preset defines position, FOV, and an optional look-at target.

export interface CameraPreset {
  /** World-space camera position [x, y, z] */
  position: [number, number, number]
  /** Perspective camera FOV in degrees */
  fov: number
  /** Optional OrbitControls target [x, y, z]. Defaults to [0, 0, 0] if omitted. */
  target?: [number, number, number]
}

export type CameraPresetName = 'front' | 'top' | 'isometric' | 'close-up' | 'wide'

const CAMERA_PRESETS: Record<CameraPresetName, CameraPreset> = {
  /** Straight-on elevation view — good for facade and section reading */
  front: {
    position: [0, 2, 8],
    fov: 35,
    target: [0, 0, 0],
  },

  /** Overhead plan view — good for layout and area visualization */
  top: {
    position: [0, 12, 0.01],
    fov: 45,
    target: [0, 0, 0],
  },

  /** 3-quarter isometric view — default lab perspective */
  isometric: {
    position: [6, 6, 6],
    fov: 35,
    target: [0, 0, 0],
  },

  /** Close-up detail view — good for hotspot inspection and small elements */
  'close-up': {
    position: [2, 2, 3],
    fov: 28,
    target: [0, 0.5, 0],
  },

  /** Wide establishing view — good for site context and large assemblies */
  wide: {
    position: [10, 8, 10],
    fov: 50,
    target: [0, 0, 0],
  },
}

/**
 * Returns the camera preset for the given name.
 * Falls back to 'isometric' if the name is not found.
 */
export const getCameraPreset = (name: string): CameraPreset => {
  return CAMERA_PRESETS[name as CameraPresetName] ?? CAMERA_PRESETS.isometric
}

export { CAMERA_PRESETS }
