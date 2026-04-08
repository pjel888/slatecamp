'use client'

// ─── Types ───────────────────────────────────────────────────────────────────

export type LightingPreset = 'studio' | 'clinical' | 'dramatic' | 'flat'

export interface StudioLightingProps {
  /**
   * Lighting preset controlling intensity, color, and shadow behaviour.
   * - `studio` (default): warm key + cool fill, soft shadows — architectural viz
   * - `clinical`: bright neutral lights, high ambient — detail inspection
   * - `dramatic`: strong key, minimal fill, low ambient — presentation / hero
   * - `flat`: even two-light setup, no shadows — diagram / calculator scenes
   */
  preset?: LightingPreset
}

// ─── Preset definitions ───────────────────────────────────────────────────────

interface LightingConfig {
  ambientIntensity: number
  keyIntensity: number
  keyColor: string
  keyPosition: [number, number, number]
  castShadow: boolean
  fillIntensity: number
  fillColor?: string
  fillPosition: [number, number, number]
}

const PRESETS: Record<LightingPreset, LightingConfig> = {
  /** Original hardcoded values — zero visual regression when no preset given */
  studio: {
    ambientIntensity: 0.35,
    keyIntensity: 1.2,
    keyColor: '#FFF5E6',
    keyPosition: [8, 10, 4],
    castShadow: true,
    fillIntensity: 0.4,
    fillColor: '#E6EFFF',
    fillPosition: [-6, 8, -3],
  },
  /** Bright, neutral, high ambient — for detail inspection */
  clinical: {
    ambientIntensity: 0.7,
    keyIntensity: 1.0,
    keyColor: '#FFFFFF',
    keyPosition: [8, 10, 4],
    castShadow: false,
    fillIntensity: 0.6,
    fillColor: '#FFFFFF',
    fillPosition: [-6, 8, -3],
  },
  /** Strong key, minimal fill, low ambient — for presentation / hero shots */
  dramatic: {
    ambientIntensity: 0.1,
    keyIntensity: 2.0,
    keyColor: '#FFF5E6',
    keyPosition: [8, 10, 4],
    castShadow: true,
    fillIntensity: 0.1,
    fillColor: '#E6EFFF',
    fillPosition: [-6, 8, -3],
  },
  /**
   * Even two-light setup, no shadows — calculator / diagram scenes.
   * Values match the deprecated CalculatorLighting component.
   */
  flat: {
    ambientIntensity: 0.6,
    keyIntensity: 0.8,
    keyColor: '#FFFFFF',
    keyPosition: [5, 8, 3],
    castShadow: false,
    fillIntensity: 0,
    fillPosition: [-5, 8, -3],
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * StudioLighting — configurable lighting rig for 3D Lab scenes (UX Plan 02 / Phase 4).
 *
 * Defaults to `studio` preset which reproduces the original hardcoded values:
 *   - Warm key light from upper-right (#FFF5E6, 1.2 intensity)
 *   - Cool fill light from opposite side (#E6EFFF, 0.4 intensity)
 *   - Ambient at 0.35 — ensures no pure black shadows
 *
 * Pass `preset` to switch lighting mood without additional configuration.
 */
export const StudioLighting = ({ preset = 'studio' }: StudioLightingProps) => {
  const cfg = PRESETS[preset]

  return (
    <group>
      <ambientLight intensity={cfg.ambientIntensity} />

      {/* Key light — primary light source */}
      <directionalLight
        position={cfg.keyPosition}
        intensity={cfg.keyIntensity}
        color={cfg.keyColor}
        castShadow={cfg.castShadow}
        shadow-mapSize={1024}
        shadow-bias={-0.0001}
      />

      {/* Fill light — softens shadows (skipped when intensity is 0) */}
      {cfg.fillIntensity > 0 && (
        <directionalLight
          position={cfg.fillPosition}
          intensity={cfg.fillIntensity}
          color={cfg.fillColor}
        />
      )}
    </group>
  )
}
