'use client'

import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

// Material colour constants — Campfire design system
const COLOR_PRIMARY = '#F5F3EE'   // matte off-white for main geometry
const COLOR_STRUCTURAL = '#C8C5BE' // light gray for structural elements
const COLOR_HIGHLIGHT = '#1B3FC4'  // Camp Cobalt for active hotspot mesh

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>
  materials: Record<string, THREE.Material>
}

interface ToiletModelProps {
  modelUrl: string
  highlightMeshName?: string | null
  dimNonActive?: boolean
}

export const ToiletModel = ({
  modelUrl,
  highlightMeshName,
  dimNonActive = false,
}: ToiletModelProps) => {
  const { scene } = useGLTF(modelUrl) as unknown as GLTFResult
  const clonedScene = useRef<THREE.Group | null>(null)

  // Clone scene once so we own the materials and can mutate them safely
  if (!clonedScene.current) {
    clonedScene.current = scene.clone(true)
  }

  // Apply material overrides whenever highlight or dim state changes
  useEffect(() => {
    if (!clonedScene.current) return

    clonedScene.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const isHighlighted =
        highlightMeshName != null && child.name === highlightMeshName

      const isStructural =
        child.name.startsWith('wall_') ||
        child.name.startsWith('floor_') ||
        child.name.startsWith('ceiling_')

      const baseColor = isStructural ? COLOR_STRUCTURAL : COLOR_PRIMARY

      // Replace material with a fresh MeshStandardMaterial we fully control
      if (
        !(child.material instanceof THREE.MeshStandardMaterial) ||
        (child.material as THREE.MeshStandardMaterial).userData?.managed !== true
      ) {
        child.material = new THREE.MeshStandardMaterial()
        ;(child.material as THREE.MeshStandardMaterial).userData.managed = true
      }

      const mat = child.material as THREE.MeshStandardMaterial

      if (isHighlighted) {
        mat.color.set(COLOR_HIGHLIGHT)
        mat.opacity = 1
        mat.transparent = false
        mat.emissive.set(COLOR_HIGHLIGHT)
        mat.emissiveIntensity = 0.08
      } else {
        mat.color.set(baseColor)
        mat.emissive.set('#000000')
        mat.emissiveIntensity = 0

        if (dimNonActive && highlightMeshName != null) {
          mat.opacity = 0.3
          mat.transparent = true
        } else {
          mat.opacity = 1
          mat.transparent = false
        }
      }

      mat.needsUpdate = true
    })
  }, [highlightMeshName, dimNonActive])

  // Dispose cloned scene geometry and materials on unmount
  useEffect(() => {
    return () => {
      if (!clonedScene.current) return
      clonedScene.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }
  }, [])

  if (!clonedScene.current) return null

  return <primitive object={clonedScene.current} />
}

// Preload the model so it is ready before the canvas mounts
useGLTF.preload('/models/3d-lab/accessible-toilet.glb')
