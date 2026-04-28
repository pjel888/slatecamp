// src/components/r3f/useDisposeOnUnmount.ts
// Disposes imperative THREE objects attached to a group ref on unmount.
//
// R3F automatically disposes declarative JSX geometry/material/texture nodes
// when those components unmount. This hook is ONLY for imperative objects that
// were created outside of R3F's reconciler (e.g. manually constructed geometries,
// materials, or textures that were attached via ref.current = new THREE.X()).
//
// Do NOT use this on scenes that are purely declarative R3F JSX — R3F handles
// those automatically. This hook is a safety net for hybrid scenes.
//
// ImageBitmap leak: textures backed by ImageBitmap must call .close() to free
// the bitmap memory. R3F does not do this automatically.

import { useEffect } from 'react'
import type { RefObject } from 'react'
import type { Group, Object3D, BufferGeometry, Material, Texture } from 'three'

/**
 * Traverses a Three.js Group and disposes any imperative geometry, materials,
 * and textures attached to its descendants. Safe to call on declarative R3F
 * scenes — it will find nothing to dispose and exit quickly.
 *
 * @param groupRef - React ref to the root THREE.Group of the scene
 */
export const useDisposeOnUnmount = (groupRef: RefObject<Group | null>): void => {
  useEffect(() => {
    return () => {
      const group = groupRef.current
      if (!group) return

      group.traverse((object: Object3D) => {
        // Dispose geometry
        const geo = (object as { geometry?: BufferGeometry }).geometry
        if (geo?.dispose) {
          geo.dispose()
        }

        // Dispose materials (single or array)
        const mat = (object as { material?: Material | Material[] }).material
        if (mat) {
          const materials: Material[] = Array.isArray(mat) ? mat : [mat]
          for (const m of materials) {
            // Dispose any map textures attached to the material
            const anyMat = m as unknown as Record<string, unknown>
            const textureKeys = [
              'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap',
              'normalMap', 'displacementMap', 'roughnessMap', 'metalnessMap',
              'alphaMap', 'envMap', 'matcap', 'gradientMap',
            ]
            for (const key of textureKeys) {
              const tex = anyMat[key] as Texture | undefined
              if (tex?.dispose) {
                // Handle ImageBitmap leak — R3F does not close these automatically
                const source = tex.source as { data?: { close?: () => void } } | undefined
                source?.data?.close?.()
                tex.dispose()
              }
            }
            m.dispose()
          }
        }
      })
    }

  }, [])
}
