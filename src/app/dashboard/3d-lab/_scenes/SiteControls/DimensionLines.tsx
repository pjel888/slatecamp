'use client'

import { Line, Text } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

function DimLine({
  start,
  end,
  label,
}: {
  start: [number, number, number]
  end: [number, number, number]
  label: string
}) {
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    Math.max(start[1], end[1]) + 0.4,
    (start[2] + end[2]) / 2,
  ]

  return (
    <group>
      {/* Main line */}
      <Line points={[start, end]} color="#1B3FC4" lineWidth={1.5} />

      {/* Start tick */}
      <Line
        points={[
          [start[0], start[1] - 0.15, start[2]],
          [start[0], start[1] + 0.25, start[2]],
        ]}
        color="#1B3FC4"
        lineWidth={1.5}
      />

      {/* End tick */}
      <Line
        points={[
          [end[0], end[1] - 0.15, end[2]],
          [end[0], end[1] + 0.25, end[2]],
        ]}
        color="#1B3FC4"
        lineWidth={1.5}
      />

      {/* Label */}
      <Text
        position={mid}
        fontSize={0.35}
        color="#1B3FC4"
        anchorX="center"
        anchorY="bottom"
      >
        {label}
      </Text>
    </group>
  )
}

/**
 * Dimension annotations using drei Line + Text.
 * Only visible when showDimensions is toggled on.
 * Shows: lot width/depth, front setback, buildable width/depth.
 */
export function DimensionLines() {
  const showDimensions = useSiteControlsStore((s) => s.showDimensions)
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const computed = useSiteControlsStore((s) => s.computed)

  if (!showDimensions) return null

  const { setbacks, buildableWidth, buildableDepth } = computed
  const y = 0.02

  return (
    <group>
      {/* Lot width — along front edge, offset in front */}
      <DimLine
        start={[0, y, -1.5]}
        end={[lotWidth, y, -1.5]}
        label={`${lotWidth.toFixed(1)}m`}
      />

      {/* Lot depth — along left edge, offset to the left */}
      <DimLine
        start={[-1.5, y, 0]}
        end={[-1.5, y, lotDepth]}
        label={`${lotDepth.toFixed(1)}m`}
      />

      {/* Front setback — right edge, from 0 to setback depth */}
      {setbacks.front > 0 && (
        <DimLine
          start={[lotWidth + 1, y, 0]}
          end={[lotWidth + 1, y, setbacks.front]}
          label={`${setbacks.front.toFixed(1)}m`}
        />
      )}

      {/* Buildable width — along rear, between setback lines */}
      {buildableWidth > 0 && (
        <DimLine
          start={[setbacks.left, y, lotDepth + 1]}
          end={[lotWidth - setbacks.right, y, lotDepth + 1]}
          label={`${buildableWidth.toFixed(1)}m`}
        />
      )}

      {/* Buildable depth — far right, between setback lines */}
      {buildableDepth > 0 && (
        <DimLine
          start={[lotWidth + 2.5, y, setbacks.front]}
          end={[lotWidth + 2.5, y, lotDepth - setbacks.rear]}
          label={`${buildableDepth.toFixed(1)}m`}
        />
      )}
    </group>
  )
}
