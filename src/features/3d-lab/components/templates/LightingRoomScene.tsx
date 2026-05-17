'use client'

import { memo, useMemo } from 'react'
import {
  computeLightingRoomState,
  type LightingParamRecord,
} from '@/features/3d-lab/config/modules/06-electrical/lighting-computation'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

interface LightingRoomSceneProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const NEUTRAL_ROOM_COLORS = {
  beam: '#ffffff',
  ceiling: '#ffffff',
  floor: '#e6e6e6',
  gridPrimary: '#cfcfcf',
  gridSecondary: '#eeeeee',
  leftWall: '#f2f2f2',
  lens: '#f7f7f7',
  light: '#ffffff',
  luminaire: '#555555',
  rearWall: '#fafafa',
  rightWall: '#f7f7f7',
  targetPlane: '#d6d6d6',
} as const

export const LightingRoomScene = memo(function LightingRoomScene({ useStore }: LightingRoomSceneProps) {
  const params = useStore((s) => s.params)
  const state = useMemo(() => computeLightingRoomState(params as LightingParamRecord), [params])
  const beamRadius = Math.min(state.beamDiameterM / 2, Math.max(state.roomWidthM, state.roomDepthM) * 0.9)
  const spotAngle = Math.min(Math.PI / 2, Math.max(Math.PI / 12, (state.beamAngleDeg * Math.PI) / 360))
  const roomHalfWidth = state.roomWidthM / 2
  const roomHalfDepth = state.roomDepthM / 2

  return (
    <group>
      <ambientLight intensity={0.12} />
      <pointLight
        color={NEUTRAL_ROOM_COLORS.light}
        decay={1.35}
        distance={Math.max(state.roomWidthM, state.roomDepthM) * 1.8}
        intensity={state.visualLightIntensity * 0.42}
        position={[0, state.mountingHeightM - 0.16, 0]}
      />
      <spotLight
        angle={spotAngle}
        color={NEUTRAL_ROOM_COLORS.light}
        decay={1.25}
        distance={state.mountingHeightM * 2.6}
        intensity={state.visualLightIntensity * 1.2}
        penumbra={0.52}
        position={[0, state.mountingHeightM - 0.12, 0]}
      />

      <gridHelper
        args={[
          Math.max(state.roomWidthM, state.roomDepthM),
          8,
          NEUTRAL_ROOM_COLORS.gridPrimary,
          NEUTRAL_ROOM_COLORS.gridSecondary,
        ]}
        position={[0, 0.004, 0]}
      />

      <mesh position={[0, -0.035, 0]} receiveShadow>
        <boxGeometry args={[state.roomWidthM, 0.07, state.roomDepthM]} />
        <meshStandardMaterial color={NEUTRAL_ROOM_COLORS.floor} roughness={0.72} />
      </mesh>

      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[state.roomWidthM * 0.92, 0.012, state.roomDepthM * 0.92]} />
        <meshBasicMaterial
          color={NEUTRAL_ROOM_COLORS.targetPlane}
          depthWrite={false}
          opacity={state.targetLux == null ? 0.08 : 0.14}
          transparent
        />
      </mesh>

      <mesh position={[0, state.mountingHeightM / 2, -roomHalfDepth]}>
        <boxGeometry args={[state.roomWidthM, state.mountingHeightM, 0.08]} />
        <meshStandardMaterial color={NEUTRAL_ROOM_COLORS.rearWall} roughness={0.82} />
      </mesh>

      <mesh position={[-roomHalfWidth, state.mountingHeightM / 2, 0]}>
        <boxGeometry args={[0.08, state.mountingHeightM, state.roomDepthM]} />
        <meshStandardMaterial color={NEUTRAL_ROOM_COLORS.leftWall} roughness={0.85} />
      </mesh>

      <mesh position={[roomHalfWidth, state.mountingHeightM / 2, 0]}>
        <boxGeometry args={[0.04, state.mountingHeightM, state.roomDepthM]} />
        <meshStandardMaterial
          color={NEUTRAL_ROOM_COLORS.rightWall}
          opacity={0.22}
          roughness={0.85}
          transparent
        />
      </mesh>

      <mesh position={[0, state.mountingHeightM + 0.03, 0]}>
        <boxGeometry args={[state.roomWidthM, 0.06, state.roomDepthM]} />
        <meshStandardMaterial
          color={NEUTRAL_ROOM_COLORS.ceiling}
          opacity={0.45}
          roughness={0.88}
          transparent
        />
      </mesh>

      <mesh position={[0, state.mountingHeightM - 0.08, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.12, 40]} />
        <meshStandardMaterial color={NEUTRAL_ROOM_COLORS.luminaire} metalness={0.35} roughness={0.32} />
      </mesh>

      <mesh position={[0, state.mountingHeightM - 0.155, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.025, 40]} />
        <meshBasicMaterial color={NEUTRAL_ROOM_COLORS.lens} opacity={0.86} transparent />
      </mesh>

      {state.showBeamCone && (
        <mesh position={[0, state.mountingHeightM / 2, 0]} renderOrder={2}>
          <coneGeometry args={[beamRadius, state.mountingHeightM, 56, 1, true]} />
          <meshBasicMaterial
            color={NEUTRAL_ROOM_COLORS.beam}
            depthWrite={false}
            opacity={0.16}
            side={2}
            transparent
          />
        </mesh>
      )}
    </group>
  )
})
