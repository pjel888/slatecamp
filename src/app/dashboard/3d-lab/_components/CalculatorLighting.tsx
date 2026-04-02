// src/app/dashboard/3d-lab/_components/CalculatorLighting.tsx
// Minimal lighting for Calculator Suite scenes.
// No shadows, uniform readability — calculators are diagrams, not arch-viz.
'use client'

/**
 * Lightweight two-light setup for Calculator Suite scenes.
 * Ambient at 0.6 provides base illumination.
 * Single directional at 0.8 from upper-right for subtle depth cues.
 * No shadow casting — keeps draw calls minimal.
 */
export function CalculatorLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={0.8} />
    </>
  )
}
