'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// Renders 4 setback zone planes using individual meshes.
// Each plane represents the exclusion zone between the lot boundary
// and the buildable area on one side (front, rear, left, right).

export function SetbackZones() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const setSelection = useSelectionStore((s) => s.setSelection)

  const handleClick = (side: string) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setSelection(`setback-${side}`, {
      objectId: `setback-${side}`,
      layerType: 'setback',
      displayName: `Setback — ${side.charAt(0).toUpperCase() + side.slice(1)}`,
      codeReference: CITATIONS.setbacks,
      computedValues: {
        'Front': `${setbacks.front.toFixed(2)} m`,
        'Rear': `${setbacks.rear.toFixed(2)} m`,
        'Left': `${setbacks.left.toFixed(2)} m`,
        'Right': `${setbacks.right.toFixed(2)} m`,
      },
      violations: [],
    })
  }

  // polygonOffset pushes setback fragments behind in depth buffer,
  // preventing z-fighting with the lot surface at Y=0.100 vs Y=0.101.
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.SETBACK,
    transparent: true,
    opacity: OPACITY.SETBACK_ZONE,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  }), [])

  const y = GEOMETRY_Y.SETBACK_ZONE

  return (
    <group>
      {/* Front setback — along Z=0 edge */}
      {setbacks.front > 0 && (
        <mesh
          position={[lotW / 2, y, setbacks.front / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={material}
          onClick={handleClick('front')}
        >
          <planeGeometry args={[lotW, setbacks.front]} />
        </mesh>
      )}

      {/* Rear setback — along Z=lotD edge */}
      {setbacks.rear > 0 && (
        <mesh
          position={[lotW / 2, y, lotD - setbacks.rear / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={material}
          onClick={handleClick('rear')}
        >
          <planeGeometry args={[lotW, setbacks.rear]} />
        </mesh>
      )}

      {/* Left setback — along X=0 edge */}
      {setbacks.left > 0 && (
        <mesh
          position={[setbacks.left / 2, y, lotD / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={material}
          onClick={handleClick('left')}
        >
          <planeGeometry args={[setbacks.left, lotD]} />
        </mesh>
      )}

      {/* Right setback — along X=lotW edge */}
      {setbacks.right > 0 && (
        <mesh
          position={[lotW - setbacks.right / 2, y, lotD / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={material}
          onClick={handleClick('right')}
        >
          <planeGeometry args={[setbacks.right, lotD]} />
        </mesh>
      )}
    </group>
  )
}
