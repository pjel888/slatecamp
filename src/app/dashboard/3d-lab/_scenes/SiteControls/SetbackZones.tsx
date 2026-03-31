'use client'

import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Four transparent amber planes at Y=0.005 representing required setbacks.
 * Front/rear span full lot width; sides span between front and rear to avoid overlap.
 */
export function SetbackZones() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const computed = useSiteControlsStore((s) => s.computed)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const { setbacks } = computed
  const isActive = activeZone === 'setbacks'
  const opacity = isActive ? 0.35 : 0.20
  const toggle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setActiveZone(isActive ? null : 'setbacks')
  }

  // Inner zone height (between front and rear setbacks)
  const innerDepth = Math.max(0, lotDepth - setbacks.front - setbacks.rear)
  const innerCenterZ = setbacks.front + innerDepth / 2

  return (
    <group>
      {/* Front setback — full lot width */}
      {setbacks.front > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth / 2, 0.005, setbacks.front / 2]}
          onClick={toggle}
        >
          <planeGeometry args={[lotWidth, setbacks.front]} />
          <meshStandardMaterial color="#F5A623" transparent opacity={opacity} depthWrite={false} />
        </mesh>
      )}

      {/* Rear setback — full lot width */}
      {setbacks.rear > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth / 2, 0.005, lotDepth - setbacks.rear / 2]}
          onClick={toggle}
        >
          <planeGeometry args={[lotWidth, setbacks.rear]} />
          <meshStandardMaterial color="#F5A623" transparent opacity={opacity} depthWrite={false} />
        </mesh>
      )}

      {/* Left setback — spans inner zone only (no corner overlap) */}
      {setbacks.left > 0 && innerDepth > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[setbacks.left / 2, 0.005, innerCenterZ]}
          onClick={toggle}
        >
          <planeGeometry args={[setbacks.left, innerDepth]} />
          <meshStandardMaterial color="#F5A623" transparent opacity={opacity} depthWrite={false} />
        </mesh>
      )}

      {/* Right setback — spans inner zone only */}
      {setbacks.right > 0 && innerDepth > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth - setbacks.right / 2, 0.005, innerCenterZ]}
          onClick={toggle}
        >
          <planeGeometry args={[setbacks.right, innerDepth]} />
          <meshStandardMaterial color="#F5A623" transparent opacity={opacity} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
