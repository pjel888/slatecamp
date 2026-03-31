'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SceneBase, SKY_COLOR } from '../../_components/SceneBase'
import { StudioLighting } from '../../_components/StudioLighting'
import InvalidateOnChange from './useInvalidateOnStoreChange'
import { LotPlane } from './LotPlane'
import { SetbackZones } from './SetbackZones'
import { AMBFVolume } from './AMBFVolume'
import { BHLCeiling } from './BHLCeiling'
import { OpenSpaceZones } from './OpenSpaceZones'
import { UrbanGrid } from './UrbanGrid'
import { ContextBuildings } from './ContextBuildings'
import { DimensionLines } from './DimensionLines'
import { ZoneHotspots } from './ZoneHotspots'

/** Invisible click-away handler — deselects active zone on Canvas background click */
function CanvasMissHandler() {
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)
  return (
    <mesh
      visible={false}
      position={[0, -0.1, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMissed={() => setActiveZone(null)}
    >
      <planeGeometry args={[200, 200]} />
    </mesh>
  )
}

/** Scene content — progressive reveal driven by tour step */
function SceneContent() {
  const tourStep = useSiteControlsStore((s) => s.tourStep)

  const showSetbacks = tourStep === null || tourStep >= 1
  const showAMBF = tourStep === null || tourStep >= 2
  const showBHL = tourStep === null || tourStep >= 3
  const showOpenSpace = tourStep === null || tourStep >= 4
  const showContext = tourStep === null || tourStep >= 4

  return (
    <>
      <SceneBase showGround={false} showFog={false} />
      <StudioLighting />

      {/* Subject lot and development controls */}
      <LotPlane />
      {showSetbacks && <SetbackZones />}
      {showAMBF && <AMBFVolume />}
      {showBHL && <BHLCeiling />}
      {showOpenSpace && <OpenSpaceZones />}

      {/* Urban context */}
      {showContext && (
        <>
          <UrbanGrid />
          <ContextBuildings />
        </>
      )}

      {/* Annotations — always available but may be individually toggled */}
      <DimensionLines />
      <ZoneHotspots />

      {/* R3F bridge */}
      <InvalidateOnChange />
      <CanvasMissHandler />
    </>
  )
}

/**
 * PD 1096 Canvas — demand-mode rendering, ACES tone mapping, isometric camera.
 *
 * frameloop="demand" is REQUIRED — renders only on invalidate().
 * Without it, GPU runs at 60fps continuously even when idle.
 */
export function SiteControlsCanvas() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)

  const cx = lotWidth / 2
  const cz = lotDepth / 2

  return (
    <div className="h-full w-full" style={{ backgroundColor: SKY_COLOR }}>
      <Canvas
        frameloop="demand"
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={(state) => {
          state.gl.setClearColor(new THREE.Color(SKY_COLOR), 1)
          state.gl.toneMapping = THREE.ACESFilmicToneMapping
          state.gl.toneMappingExposure = 1.0
          state.gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        onPointerMissed={() => {
          useSiteControlsStore.getState().setActiveZone(null)
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[cx + 25, 20, cz + 30]}
          fov={35}
        />
        <Suspense fallback={null}>
          <SceneContent />
          <OrbitControls
            makeDefault
            target={[cx, 1.5, cz]}
            enablePan={false}
            minDistance={3}
            maxDistance={120}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
