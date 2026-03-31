// canvas/materials.ts
// ─── Shared singleton materials + ViolationMaterial shader ─────────────────
// Materials are created ONCE at module scope — never reinstantiated in components.

import * as THREE from 'three'
import { COLOR, OPACITY } from './constants'

// ─── Singleton Materials ────────────────────────────────────────────────────

export const GREYSCALE_MATERIAL = new THREE.MeshStandardMaterial({
  color: COLOR.GREYSCALE,
  roughness: 0.9,
  metalness: 0.0,
})

export const SELECTION_MATERIAL = new THREE.MeshStandardMaterial({
  color: COLOR.SELECTION,
  roughness: 0.6,
  metalness: 0.0,
  emissive: new THREE.Color(COLOR.SELECTION),
  emissiveIntensity: 0.15,
})

// ─── Material Cache ─────────────────────────────────────────────────────────
// Populated on scene load via cacheMaterials(). Used to restore originals.

export interface CachedMaterialEntry {
  originalMaterial: THREE.Material | THREE.Material[]
  originalColor: THREE.Color | null
}

const materialCache = new Map<string, CachedMaterialEntry>()

export function cacheMaterials(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && !materialCache.has(obj.uuid)) {
      materialCache.set(obj.uuid, {
        originalMaterial: Array.isArray(obj.material)
          ? obj.material.map(m => m.clone())
          : obj.material.clone(),
        originalColor: (obj.material as THREE.MeshStandardMaterial).color?.clone() ?? null,
      })
      obj.userData.originalMaterial = materialCache.get(obj.uuid)?.originalMaterial
    }
  })
}

export function restoreMaterial(mesh: THREE.Mesh): void {
  const cached = materialCache.get(mesh.uuid)
  if (cached) mesh.material = cached.originalMaterial
}

export function clearMaterialCache(): void {
  materialCache.clear()
}

// ─── Zone Material Factory ──────────────────────────────────────────────────
// Creates transparent zone overlay materials with correct blending.

export function createZoneMaterial(color: string, opacity: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    roughness: 0.8,
    metalness: 0.0,
  })
}

// ─── ViolationMaterial Uniforms ─────────────────────────────────────────────
// Custom shader with 1.5Hz red pulse. uTime updated via useFrame ref mutation.
// CRITICAL: uTime must NEVER trigger a React re-render.

export const VIOLATION_UNIFORMS = {
  uBaseColor: { value: new THREE.Color(COLOR.VIOLATION_BASE) },
  uViolationColor: { value: new THREE.Color(COLOR.VIOLATION) },
  uViolationAmount: { value: 0.0 },    // 0 = compliant, 1 = violation
  uTime: { value: 0.0 },
  uOpacity: { value: 0.85 },
}

export const VIOLATION_VERTEX_SHADER = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const VIOLATION_FRAGMENT_SHADER = `
  uniform vec3 uBaseColor;
  uniform vec3 uViolationColor;
  uniform float uViolationAmount;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  void main() {
    float light = dot(vNormal, normalize(vec3(1.0, 1.5, 1.0))) * 0.4 + 0.6;
    // 1.5 Hz pulse — noticeable but not distracting
    float pulse = sin(uTime * 9.42) * 0.5 + 0.5;
    float intensity = uViolationAmount * (0.6 + 0.4 * pulse);
    vec3 color = mix(uBaseColor, uViolationColor, intensity);
    gl_FragColor = vec4(color * light, uOpacity);
  }
`
