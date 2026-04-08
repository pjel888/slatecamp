import { SCENE_COLORS } from '../../constants/scene-colors'

interface GroundPlaneProps {
  size?: [number, number]
  color?: string
  position?: [number, number, number]
}

export const GroundPlane = ({
  size = [5, 5],
  color = SCENE_COLORS.groundLight,
  position = [0, -0.005, 0],
}: GroundPlaneProps) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}
