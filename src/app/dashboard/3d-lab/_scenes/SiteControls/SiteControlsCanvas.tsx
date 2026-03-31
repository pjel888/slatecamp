'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { useInvalidateOnStoreChange } from './useInvalidateOnStoreChange'
import { SceneBase, SKY_COLOR } from '../../_components/SceneBase'
import { StudioLighting } from '../../_components/StudioLighting'
import { LotPlane } from './LotPlane'
import { SetbackZones } from './SetbackZones'
import { AMBFVolume } from './AMBFVolume'
import { BHLCeiling } from './BHLCeiling'
import { OpenSpaceZones } from './OpenSpaceZones'
import { ContextBuildings } from './ContextBuildings'
import { ZoneHotspots } from './ZoneHotspots'
import { DimensionLines } from './DimensionLines'
import { InCanvasQuiz } from './InCanvasQuiz'

function StoreInvalidateBridge() {
  useInvalidateOnStoreChange()
  return null
}

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

function SceneContent() {
  const tourStep = useSiteControlsStore((s) => s.tourStep)

  const showSetbacks = tourStep === null || tourStep >= 1
  const showAMBF = tourStep === null || tourStep >= 2
  const showBHL = tourStep === null || tourStep >= 3
  const showOpenSpace = tourStep === null || tourStep >= 4
  const showContext = tourStep === null || tourStep >= 4

  return (
    <>
      <StoreInvalidateBridge />
      <SceneBase />
      <StudioLighting />

      <LotPlane />
      {showSetbacks && <SetbackZones />}
      {showAMBF && <AMBFVolume />}
      {showBHL && <BHLCeiling />}
      {showOpenSpace && <OpenSpaceZones />}
      {showContext && <ContextBuildings />}
      <ZoneHotspots />
      <DimensionLines />
      <InCanvasQuiz />
      <CanvasMissHandler />
    </>
  )
}

export function SiteControlsCanvas() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)

  const cx = lotWidth / 2
  const cz = lotDepth / 2

  return (
    <div className="h-full w-full" style={{ backgroundColor: SKY_COLOR }}>
      <Canvas
        camera={{ position: [cx + 15, 12, cz + 18], fov: 35 }}
        shadows
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={(state) => {
          state.gl.setClearColor(new THREE.Color(SKY_COLOR), 1)
          state.gl.toneMapping = THREE.ACESFilmicToneMapping
          state.gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        onPointerMissed={() => {
          useSiteControlsStore.getState().setActiveZone(null)
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
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
    </div>
  )
}
