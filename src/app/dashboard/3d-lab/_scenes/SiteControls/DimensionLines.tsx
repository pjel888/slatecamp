'use client'

import { Line, Text, Billboard } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Dimension annotation lines and labels.
 * Shows lot width/depth on perimeter and buildable width/depth on AMBF top face.
 * Visible only when showDimensions === true.
 */
export function DimensionLines() {
  const showDimensions = useSiteControlsStore((s) => s.showDimensions)
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const buildingHeight = useSiteControlsStore((s) => s.inputs.buildingHeight)
  const buildableWidth = useSiteControlsStore((s) => s.computed.buildableWidth)
  const buildableDepth = useSiteControlsStore((s) => s.computed.buildableDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)

  if (!showDimensions) return null

  const lineColor = '#4A5568'
  const offset = 1.5 // Distance from lot edge for dimension lines

  return (
    <group>
      {/* Lot Width — along front edge, offset outside */}
      <Line
        points={[
          [0, 0.05, -offset],
          [lotWidth, 0.05, -offset],
        ]}
        color={lineColor}
        lineWidth={1.5}
      />
      <Billboard position={[lotWidth / 2, 0.05, -offset - 0.5]}>
        <Text fontSize={0.6} color={lineColor} anchorX="center" anchorY="middle">
          {`${lotWidth.toFixed(1)}m`}
        </Text>
      </Billboard>

      {/* Lot Depth — along left edge, offset outside */}
      <Line
        points={[
          [-offset, 0.05, 0],
          [-offset, 0.05, lotDepth],
        ]}
        color={lineColor}
        lineWidth={1.5}
      />
      <Billboard position={[-offset - 0.5, 0.05, lotDepth / 2]}>
        <Text fontSize={0.6} color={lineColor} anchorX="center" anchorY="middle">
          {`${lotDepth.toFixed(1)}m`}
        </Text>
      </Billboard>

      {/* Buildable Width — on top of AMBF */}
      {buildableWidth > 0 && buildableDepth > 0 && (
        <>
          <Line
            points={[
              [setbacks.left, buildingHeight + 0.2, setbacks.front + buildableDepth / 2],
              [setbacks.left + buildableWidth, buildingHeight + 0.2, setbacks.front + buildableDepth / 2],
            ]}
            color="#1B3FC4"
            lineWidth={1.5}
          />
          <Billboard
            position={[
              setbacks.left + buildableWidth / 2,
              buildingHeight + 0.7,
              setbacks.front + buildableDepth / 2,
            ]}
          >
            <Text fontSize={0.5} color="#1B3FC4" anchorX="center" anchorY="middle">
              {`${buildableWidth.toFixed(1)}m`}
            </Text>
          </Billboard>

          {/* Buildable Depth — on side of AMBF */}
          <Line
            points={[
              [setbacks.left + buildableWidth / 2, buildingHeight + 0.2, setbacks.front],
              [setbacks.left + buildableWidth / 2, buildingHeight + 0.2, setbacks.front + buildableDepth],
            ]}
            color="#1B3FC4"
            lineWidth={1.5}
          />
          <Billboard
            position={[
              setbacks.left + buildableWidth + 1.0,
              buildingHeight + 0.7,
              setbacks.front + buildableDepth / 2,
            ]}
          >
            <Text fontSize={0.5} color="#1B3FC4" anchorX="center" anchorY="middle">
              {`${buildableDepth.toFixed(1)}m`}
            </Text>
          </Billboard>
        </>
      )}
    </group>
  )
}
