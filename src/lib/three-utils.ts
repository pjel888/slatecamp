// src/lib/three-utils.ts
import * as THREE from 'three'

/**
 * Standardized recursive disposal for Three.js objects.
 * Cleans up geometries, materials, and textures to prevent VRAM leaks.
 */
export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child: any) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose()
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => disposeMaterial(m))
        } else {
          disposeMaterial(child.material)
        }
      }
    }
  })
}

function disposeMaterial(mat: any) {
  mat.dispose()
  // Dispose textures if they exist
  for (const key of Object.keys(mat)) {
    if (mat[key] && mat[key].isTexture) {
      mat[key].dispose()
    }
  }
}
