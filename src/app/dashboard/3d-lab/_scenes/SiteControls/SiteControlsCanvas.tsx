'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { useInvalidateOnStoreChange } from './useInvalidateOnStoreChange'
import { SceneBase } from '../../_components/SceneBase'
import { StudioLighting } from '../../_components/StudioLighting'
import { LotPlane } from './LotPlane'
import { SetbackZones } from './SetbackZones'
import { AMBFVolume } from './AMBFVolume'
import { BHLCeiling } from './BHLCeiling'
import { OpenSpaceZones } from './OpenSpaceZones'
import { ContextBuildings } from './ContextBuildings'
import { ZoneHotspots } from './ZoneHotspots'
import { DimensionLines } from './DimensionLines'

/** Registers the invalidate bridge inside the Canvas tree. */
function StoreInvalidateBridge() {
  useInvalidateOnStoreChange()
  return null
}

/** Deselects active zone when clicking empty canvas space. */
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

/** Scene content — visibility gated by tourStep. */
function SceneContent() {
  const tourStep = useSiteControlsStore((s) => s.tourStep)

  // tourStep visibility gates per spec:
  // 0: only LotPlane
  // 1: LotPlane + SetbackZones
  // 2: LotPlane + SetbackZones + AMBFVolume (flat slab)
  // 3: LotPlane + SetbackZones + AMBFVolume (full height) + BHLCeiling
  // 4: all above + OpenSpaceZones + ContextBuildings
  // 5 or null: everything

  const showSetbacks = tourStep === null || tourStep >= 1
  const showAMBF = tourStep === null || tourStep >= 2
  const showBHL = tourStep === null || tourStep >= 3
  const showOpenSpace = tourStep === null || tourStep >= 4
  const showContext = tourStep === null || tourStep >= 4

  return (
    <>
      <StoreInvalidateBridge />
      <SceneBase shadowScale={30} />
      <StudioLighting />

      <LotPlane />
      {showSetbacks && <SetbackZones />}
      {showAMBF && <AMBFVolume />}
      {showBHL && <BHLCeiling />}
      {showOpenSpace && <OpenSpaceZones />}
      {showContext && <ContextBuildings />}
      <ZoneHotspots />
      <DimensionLines />
      <CanvasMissHandler />
    </>
  )
}

export function SiteControlsCanvas() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)

  // Center camera target on lot
  const cx = lotWidth / 2
  const cz = lotDepth / 2

  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 35 }}
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => {
        useSiteControlsStore.getState().setActiveZone(null)
      }}
    >
      <Suspense fallback={null}>
        <SceneContent />

        {/* Controls */}
        <OrbitControls
          makeDefault
          target={[cx, 0, cz]}
          minDistance={3}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
        />
      </Suspense>
    </Canvas>
  )
}
