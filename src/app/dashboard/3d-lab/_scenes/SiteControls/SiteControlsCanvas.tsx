'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SceneBase, SKY_COLOR } from '../../_components/SceneBase'
import { StudioLighting } from '../../_components/StudioLighting'
import { LotPlane } from './LotPlane'
import { SetbackZones } from './SetbackZones'
import { AMBFVolume } from './AMBFVolume'
import { BHLCeiling } from './BHLCeiling'
import { OpenSpaceZones } from './OpenSpaceZones'
import { UrbanGrid } from './UrbanGrid'

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
      <SceneBase showGround={false} showFog={false} />
      <StudioLighting />

      {/* Subject lot and its development controls */}
      <LotPlane />
      {showSetbacks && <SetbackZones />}
      {showAMBF && <AMBFVolume />}
      {showBHL && <BHLCeiling />}
      {showOpenSpace && <OpenSpaceZones />}

      {/* Urban context: procedural city grid with roads, sidewalks, buildings */}
      {showContext && <UrbanGrid />}

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
        camera={{ position: [cx + 60, 40, cz + 70], fov: 45 }}
        shadows
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
            minDistance={1}
            maxDistance={800}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
