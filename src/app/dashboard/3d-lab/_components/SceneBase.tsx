'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ─── Scene Constants (from UX Plan §01) ──────────────────────────────────────

/** Cool blue-white sky — canvas clear color + fog target */
export const SKY_COLOR = '#EEF2FA'
/** Warm stone-travertine ground plane */
export const GROUND_COLOR = '#D4CFC4'

// ─── Sky Color Setter ────────────────────────────────────────────────────────

/** Sets the WebGL clear color to sky. Must be inside Canvas tree. */
function SkyColor() {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    gl.setClearColor(new THREE.Color(SKY_COLOR), 1)
    invalidate()
  }, [gl, invalidate])
  return null
}

// ─── Tone Mapping ────────────────────────────────────────────────────────────

/** Sets ACESFilmic tone mapping + sRGB color space (quality gate requirement). */
function ToneMapping() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.outputColorSpace = THREE.SRGBColorSpace
  }, [gl])
  return null
}

// ─── SceneBase ───────────────────────────────────────────────────────────────

interface SceneBaseProps {
  /** Size of the ground plane in world units. Default 80. */
  groundSize?: number
  /** Show the ground plane mesh. Default true. */
  showGround?: boolean
  /** Show depth fog for atmospheric recession. Default true. */
  showFog?: boolean
  /** Fog near distance. Default 30. */
  fogNear?: number
  /** Fog far distance. Default 80. */
  fogFar?: number
  /** Contact shadow opacity. Default 0.28. */
  shadowOpacity?: number
  /** Contact shadow scale. Default 20. */
  shadowScale?: number
}

/**
 * SceneBase — universal scene foundation for all 3D Lab modules.
 *
 * Implements the architectural diagram visual language (UX Plan §01):
 * - Sky: #EEF2FA (cool blue-white) via gl.setClearColor
 * - Ground: #D4CFC4 (warm stone-travertine) explicit mesh geometry
 * - Fog: sky-color depth fog for atmospheric recession
 * - ContactShadows: soft ground contact (not shadow mapping)
 * - ACESFilmicToneMapping + SRGBColorSpace
 *
 * Must be placed inside a Canvas tree. Applied globally to ALL modules.
 */
export function SceneBase({
  groundSize = 80,
  showGround = true,
  showFog = true,
  fogNear = 30,
  fogFar = 80,
  shadowOpacity = 0.28,
  shadowScale = 20,
}: SceneBaseProps) {
  return (
    <group>
      <SkyColor />
      <ToneMapping />

      {/* Ground plane — explicit warm stone geometry, not just a shadow receiver */}
      {showGround && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[groundSize, groundSize]} />
          <meshStandardMaterial
            color={GROUND_COLOR}
            roughness={0.92}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Soft contact shadow on top of ground */}
      {showGround && (
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={shadowOpacity}
          scale={shadowScale}
          blur={3.0}
          far={6}
          frames={1}
        />
      )}

      {/* Depth fog — sky color creates atmospheric recession */}
      {showFog && <fog attach="fog" args={[SKY_COLOR, fogNear, fogFar]} />}
    </group>
  )
}
