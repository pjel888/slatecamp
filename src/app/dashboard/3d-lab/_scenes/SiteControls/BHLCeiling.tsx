'use client'

import { Line, Html } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Dashed horizontal plane at the Building Height Limit.
 * Uses Html instead of Text/Billboard to avoid worker init errors.
 */
export function BHLCeiling() {
  const bhl = useSiteControlsStore((s) => s.computed.bhl)
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)

  if (bhl <= 0) return null

  const x0 = setbacks.left
  const x1 = lotWidth - setbacks.right
  const z0 = setbacks.front
  const z1 = lotDepth - setbacks.rear

  if (x1 <= x0 || z1 <= z0) return null

  const y = bhl

  const ceilingPoints: [number, number, number][] = [
    [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0],
  ]

  const crossA: [number, number, number][] = [[x0, y, z0], [x1, y, z1]]
  const crossB: [number, number, number][] = [[x1, y, z0], [x0, y, z1]]

  return (
    <group>
      <Line points={ceilingPoints} color="#D64545" lineWidth={1.5} dashed dashSize={0.4} gapSize={0.3} />
      <Line points={crossA} color="#D64545" lineWidth={0.5} dashed dashSize={0.6} gapSize={0.4} transparent opacity={0.3} />
      <Line points={crossB} color="#D64545" lineWidth={0.5} dashed dashSize={0.6} gapSize={0.4} transparent opacity={0.3} />

      <Html position={[x1 + 0.8, y, (z0 + z1) / 2]} center distanceFactor={12}>
        <div style={{ color: '#D64545', fontSize: 11, fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          BHL: {bhl.toFixed(1)}m
        </div>
      </Html>
    </group>
  )
}
