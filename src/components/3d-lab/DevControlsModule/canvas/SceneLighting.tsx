'use client'

// canvas/SceneLighting.tsx
// ─── Self-contained architectural studio lighting ──────────────────────────
// Does NOT use shared StudioLighting. Custom rig for site development scene.

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
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.001}
      />

      {/* Fill light — cool, opposite side, softens shadows */}
      <directionalLight
        position={[-6, 8, -3]}
        intensity={0.4}
        color="#E6EFFF"
      />

      {/* Hemisphere — subtle sky/ground tint for natural feel */}
      <hemisphereLight
        args={['#E8F0FF', '#D4CFC4', 0.2]}
      />
    </>
  )
}
