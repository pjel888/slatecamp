'use client'

/**
 * StudioLighting — architectural studio lighting rig (UX Plan §02).
 *
 * Matches how physical architectural models are photographed:
 * - Warm key light from upper-right (#FFF5E6, 1.2 intensity)
 * - Cool fill light from opposite side (#E6EFFF, 0.4 intensity)
 * - Ambient at 0.35 — ensures no pure black shadows (quality gate)
 *
 * Replaces the generic ambient(0.6) + directional(1.2) setup.
 */
export function StudioLighting() {
  return (
    <group>
      <ambientLight intensity={0.35} />

      {/* Warm key — upper right, primary light source */}
      <directionalLight
        position={[8, 10, 4]}
        intensity={1.2}
        color="#FFF5E6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Cool fill — opposite side, softens shadows */}
      <directionalLight
        position={[-6, 8, -3]}
        intensity={0.4}
        color="#E6EFFF"
      />
    </group>
  )
}
