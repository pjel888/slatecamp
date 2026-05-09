'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE_COLORS } from '../../constants/scene-colors'

// ─── Scene Constants (from UX Plan §01) ──────────────────────────────────────

/** Sky / canvas clear color — pure white viewport background. */
export const SKY_COLOR = SCENE_COLORS.skyWhite
/** Ground plane — slightly darker than white for spatial separation. */
export const GROUND_COLOR = SCENE_COLORS.groundLight

// ─── Sky + Tone Mapping + Fog (must attach to scene, not group) ──────────────

/**
 * Sets sky color, tone mapping, and fog on the scene.
 * Must be a direct child of the Canvas (or inside Suspense) — NOT inside a group,
 * because fog must attach to the THREE.Scene object.
 */
function SceneSetup({ showFog, fogNear, fogFar }: { showFog: boolean; fogNear: number; fogFar: number }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    // Sky clear color
    gl.setClearColor(new THREE.Color(SKY_COLOR), 1)
    // Tone mapping
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.outputColorSpace = THREE.SRGBColorSpace
    // Fog — attached directly to scene, not via JSX attach
    if (showFog) {
      scene.fog = new THREE.Fog(SKY_COLOR, fogNear, fogFar)
    } else {
      scene.fog = null
    }
    invalidate()
    return () => { scene.fog = null }
  }, [gl, scene, invalidate, showFog, fogNear, fogFar])

  return null
}

// ─── SceneBase ───────────────────────────────────────────────────────────────

interface SceneBaseProps {
  groundSize?: number
  showGround?: boolean
  showFog?: boolean
  fogNear?: number
  fogFar?: number
}

/**
 * SceneBase — universal scene foundation for all 3D Lab modules.
 *
 * Implements the architectural diagram visual language (UX Plan §01):
 * - Sky: white via gl.setClearColor
 * - Ground: slightly darker explicit mesh
 * - Fog: attached directly to scene object (not via JSX attach)
 * - ContactShadows: soft ground contact
 * - ACESFilmicToneMapping + SRGBColorSpace
 */
export function SceneBase({
  groundSize = 80,
  showGround = true,
  showFog = true,
  fogNear = 40,
  fogFar = 80,
}: SceneBaseProps) {
  return (
    <>
      <SceneSetup showFog={showFog} fogNear={fogNear} fogFar={fogFar} />

      {/* Ground plane — explicit light neutral geometry */}
      {showGround && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
          userData={{ slatecampCameraFitExclude: true }}
        >
          <planeGeometry args={[groundSize, groundSize]} />
          <meshStandardMaterial
            color={GROUND_COLOR}
            roughness={0.92}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Ground shadow plane - simple darkened disc instead of ContactShadows (avoids worker) */}
      {showGround && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, 0]}
          userData={{ slatecampCameraFitExclude: true }}
        >
          <circleGeometry args={[12, 64]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}
