'use client'

// canvas/SceneLighting.tsx
// ─── Self-contained architectural studio lighting ──────────────────────────
// Does NOT use shared StudioLighting. Custom rig for site development scene.

import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'

export function SceneLighting() {
  return (
    <>
      {/* Ambient — ensures no pure black anywhere */}
      <ambientLight intensity={0.35} />

      {/* Key light — warm, upper-right, casts shadows */}
      <directionalLight
        position={[8, 10, 4]}
        intensity={1.2}
        color="#FFF5E6"
      />

      {/* Fill light — cool, opposite side, softens shadows */}
      <directionalLight
        position={[-6, 8, -3]}
        intensity={0.4}
        color="#E6EFFF"
      />

      {/* Hemisphere — neutral sky/ground tint for the white viewport */}
      <hemisphereLight
        args={[SCENE_COLORS.skyWhite, SCENE_COLORS.groundNeutral, 0.2]}
      />
    </>
  )
}
