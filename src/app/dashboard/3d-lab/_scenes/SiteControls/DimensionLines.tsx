'use client'

import { Line, Html } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Dimension annotation lines and labels.
 * Uses Html instead of Text/Billboard to avoid worker init errors.
 */
export function DimensionLines() {
  const showDimensions = useSiteControlsStore((s) => s.showDimensions)
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const buildingHeight = useSiteControlsStore((s) => s.computed.buildingHeight)
  const buildableWidth = useSiteControlsStore((s) => s.computed.buildableWidth)
  const buildableDepth = useSiteControlsStore((s) => s.computed.buildableDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)

  if (!showDimensions) return null

  const lineColor = '#4A5568'
  const offset = 1.5

  const labelStyle = { color: '#4A5568', fontSize: 11, fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap' as const }
  const blueLabelStyle = { ...labelStyle, color: '#1B3FC4' }

  return (
    <group>
      {/* Lot Width */}
      <Line points={[[0, 0.05, -offset], [lotWidth, 0.05, -offset]]} color={lineColor} lineWidth={1.5} />
      <Html position={[lotWidth / 2, 0.05, -offset - 0.5]} center distanceFactor={12}>
        <div style={labelStyle}>{lotWidth.toFixed(1)}m</div>
      </Html>

      {/* Lot Depth */}
      <Line points={[[-offset, 0.05, 0], [-offset, 0.05, lotDepth]]} color={lineColor} lineWidth={1.5} />
      <Html position={[-offset - 0.5, 0.05, lotDepth / 2]} center distanceFactor={12}>
        <div style={labelStyle}>{lotDepth.toFixed(1)}m</div>
      </Html>

      {/* Buildable Width */}
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
          <Html
            position={[setbacks.left + buildableWidth / 2, buildingHeight + 0.7, setbacks.front + buildableDepth / 2]}
            center
            distanceFactor={12}
          >
            <div style={blueLabelStyle}>{buildableWidth.toFixed(1)}m</div>
          </Html>

          {/* Buildable Depth */}
          <Line
            points={[
              [setbacks.left + buildableWidth / 2, buildingHeight + 0.2, setbacks.front],
              [setbacks.left + buildableWidth / 2, buildingHeight + 0.2, setbacks.front + buildableDepth],
            ]}
            color="#1B3FC4"
            lineWidth={1.5}
          />
          <Html
            position={[setbacks.left + buildableWidth + 1.0, buildingHeight + 0.7, setbacks.front + buildableDepth / 2]}
            center
            distanceFactor={12}
          >
            <div style={blueLabelStyle}>{buildableDepth.toFixed(1)}m</div>
          </Html>
        </>
      )}
    </group>
  )
}
