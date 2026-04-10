import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type {
  GeometryValidationFinding,
  GeometryValidationReport,
} from './stairway-types'

interface AxisAlignedBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

const EPSILON = 0.001

const getBoxBounds = (instruction: GeometryInstruction): AxisAlignedBounds | null => {
  if (instruction.type !== 'box') {
    return null
  }

  const [width, height, depth] = instruction.args
  const [x, y, z] = instruction.position

  return {
    minX: x - width / 2,
    maxX: x + width / 2,
    minY: y - height / 2,
    maxY: y + height / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  }
}

const getAxisPenetration = (
  firstMin: number,
  firstMax: number,
  secondMin: number,
  secondMax: number,
): number => Math.min(firstMax, secondMax) - Math.max(firstMin, secondMin)

const createFinding = (
  code: string,
  message: string,
  ids: string[],
  severity: GeometryValidationFinding['severity'] = 'error',
): GeometryValidationFinding => ({
  code,
  message,
  ids,
  severity,
})

const getInstruction = (
  geometry: GeometryInstruction[],
  id: string,
): GeometryInstruction | undefined => geometry.find((instruction) => instruction.id === id)

const validateStraightLandings = (geometry: GeometryInstruction[]): GeometryValidationFinding[] => {
  const findings: GeometryValidationFinding[] = []
  const bottomLanding = getInstruction(geometry, 'base-platform')
  const firstTread = getInstruction(geometry, 'tread-0')
  const topLanding = getInstruction(geometry, 'top-landing')
  const treadIds = geometry
    .filter((instruction) => /^tread-\d+$/.test(instruction.id))
    .map((instruction) => instruction.id)
  const lastTread = treadIds.length > 0
    ? getInstruction(geometry, treadIds[treadIds.length - 1])
    : undefined

  if (!firstTread || treadIds.length === 0) {
    return findings
  }

  if (bottomLanding && firstTread) {
    const landingBounds = getBoxBounds(bottomLanding)
    const treadBounds = getBoxBounds(firstTread)

    if (landingBounds && treadBounds) {
      const penetration = getAxisPenetration(
        landingBounds.minZ,
        landingBounds.maxZ,
        treadBounds.minZ,
        treadBounds.maxZ,
      )

      if (penetration > EPSILON) {
        findings.push(
          createFinding(
            'straight-bottom-landing-overlap',
            'Bottom landing overlaps the first tread instead of joining at a boundary plane.',
            [bottomLanding.id, firstTread.id],
          ),
        )
      }
    }
  }

  if (topLanding && lastTread) {
    const landingBounds = getBoxBounds(topLanding)
    const treadBounds = getBoxBounds(lastTread)

    if (landingBounds && treadBounds) {
      const penetration = getAxisPenetration(
        landingBounds.minZ,
        landingBounds.maxZ,
        treadBounds.minZ,
        treadBounds.maxZ,
      )

      if (penetration > EPSILON) {
        findings.push(
          createFinding(
            'straight-top-landing-overlap',
            'Top landing overlaps the last tread instead of joining at a boundary plane.',
            [topLanding.id, lastTread.id],
          ),
        )
      }
    }
  }

  return findings
}

const validateIntermediateLandingCenter = (geometry: GeometryInstruction[]): GeometryValidationFinding[] => {
  const findings: GeometryValidationFinding[] = []
  const landing = getInstruction(geometry, 'landing-intermediate')
  const firstFlightTread = getInstruction(geometry, 'tread-f1-0')
  const secondFlightTread = getInstruction(geometry, 'tread-f2-0')

  if (!landing || !firstFlightTread || !secondFlightTread) {
    return findings
  }

  if ((landing.args[0] ?? 0) <= (firstFlightTread.args[0] ?? 0) + EPSILON) {
    return findings
  }

  const expectedCenterX = (firstFlightTread.position[0] + secondFlightTread.position[0]) / 2
  if (Math.abs(landing.position[0] - expectedCenterX) > EPSILON) {
    findings.push(
      createFinding(
        'turning-landing-off-center',
        'Intermediate landing is not centered between the two turning flights.',
        [landing.id, firstFlightTread.id, secondFlightTread.id],
      ),
    )
  }

  return findings
}

export const validateStairGeometry = (
  geometry: GeometryInstruction[],
): GeometryValidationReport => {
  const findings = [
    ...validateStraightLandings(geometry),
    ...validateIntermediateLandingCenter(geometry),
  ]

  return {
    findings,
    hasErrors: findings.some((finding) => finding.severity === 'error'),
  }
}
