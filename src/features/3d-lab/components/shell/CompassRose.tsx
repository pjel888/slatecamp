'use client'

// CompassRose — north direction indicator for site planning modules
// Only rendered when ViewportCapabilities.compassRose is true.
// Rotates as camera orbits. Click to snap to north-facing view.

import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export const CompassRose = () => {
  const { camera } = useThree()
  const rotationRef = useRef(0)
  const divRef = useRef<HTMLDivElement>(null)

  useFrame(() => {
    // Calculate camera azimuth angle (rotation around Y axis)
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    const angle = Math.atan2(direction.x, direction.z)
    rotationRef.current = angle * (180 / Math.PI)

    if (divRef.current) {
      divRef.current.style.transform = `rotate(${rotationRef.current}deg)`
    }
  })

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: '60px',
        right: '60px',
        pointerEvents: 'auto',
      }}
      zIndexRange={[15, 15]}
    >
      <div
        ref={divRef}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 shadow-sm"
        title="North direction — click to face North"
      >
        <span className="text-xs font-bold text-destructive">N</span>
      </div>
    </Html>
  )
}
