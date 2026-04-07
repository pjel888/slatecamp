'use client'

import { memo } from 'react'
import { Warning } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { ControlPanel, type ControlDef } from '@/features/3d-lab/components/templates/ControlPanel'
import { FARScene } from './FARScene'
import { useLabStore } from '@/features/3d-lab/stores/legacyLabStore'

const FAR_CONTROLS: ControlDef[] = [
  {
    key: 'lotArea',
    label: 'Lot Area',
    min: 100,
    max: 2000,
    step: 50,
    unit: 'sqm',
  },
  {
    key: 'far',
    label: 'Floor Area Ratio',
    min: 0.5,
    max: 8.0,
    step: 0.1,
    unit: '×',
    decimalPlaces: 1,
  },
  {
    key: 'bhl',
    label: 'Bldg Height Limit',
    min: 6,
    max: 60,
    step: 1,
    unit: 'm',
  },
  {
    key: 'setbackFront',
    label: 'Front Setback',
    min: 0,
    max: 10,
    step: 0.5,
    unit: 'm',
    decimalPlaces: 1,
  },
  {
    key: 'setbackSide',
    label: 'Side Setback',
    min: 0,
    max: 8,
    step: 0.5,
    unit: 'm',
    decimalPlaces: 1,
  },
]

const MAX_ZONE_FAR = 4.0
const FLOOR_HEIGHT_M = 3

function Row({ label, desc, value, state = 'normal', sub }: {
  label: string
  desc: string
  value: string
  state?: 'normal' | 'red' | 'amber' | 'green'
  sub?: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-foreground">{label}</span>
          <div className="text-[11px] text-muted-foreground leading-tight">{desc}</div>
        </div>
        <div className="text-right shrink-0">
          <span className={cn(
            'text-[11px] font-bold tabular-nums font-mono',
            state === 'red'    && 'text-red-600',
            state === 'amber'  && 'text-amber-600',
            state === 'green'  && 'text-green-600',
            state === 'normal' && 'text-foreground',
          )}>
            {value}
          </span>
          {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
        </div>
      </div>
    </div>
  )
}

const FARTelemetry = memo(function FARTelemetry() {
  const { lotArea, far, bhl, setbackFront, setbackSide } = useLabStore()

  const lotSideM = Math.sqrt(lotArea)
  const footprintSideM = Math.max(3, lotSideM - (setbackFront + setbackSide) * 2)
  const footprintAreaM2 = footprintSideM ** 2
  const maxGFA = lotArea * far
  const floors = Math.max(1, Math.round(maxGFA / footprintAreaM2))
  const buildingHeightM = floors * FLOOR_HEIGHT_M

  const isFARViolation = far > MAX_ZONE_FAR
  const isBHLViolation = buildingHeightM > bhl
  const footprintPct = footprintAreaM2 / lotArea

  const fmt = (n: number, dp = 2) => n.toFixed(dp)

  const violations: string[] = []
  if (isFARViolation) violations.push(`FAR ${far.toFixed(1)}× exceeds zone max ${MAX_ZONE_FAR}× — PD 1096 §708`)
  if (isBHLViolation) violations.push(`Height ${buildingHeightM.toFixed(1)}m exceeds BHL ${bhl}m — PD 1096 §805`)

  return (
    <div className="absolute right-4 top-4 bottom-4 z-10 w-64 overflow-y-auto
      bg-card/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-2">

      <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
        FAR Calculator
      </span>

      <Row
        label="Lot Area"
        desc="Total lot area for development"
        value={`${fmt(lotArea, 0)} sqm`}
      />
      <Row
        label="Lot Side"
        desc="Equivalent square lot dimension"
        value={`${fmt(lotSideM, 1)}m × ${fmt(lotSideM, 1)}m`}
      />
      <Row
        label="Footprint"
        desc="Buildable area after setbacks"
        value={`${fmt(footprintAreaM2, 0)} sqm`}
        state={footprintPct > 0.7 ? 'amber' : 'normal'}
        sub={`${(footprintPct * 100).toFixed(0)}% of lot`}
      />
      <Row
        label="FAR"
        desc="Floor Area Ratio applied"
        value={`${fmt(far, 1)}×`}
        state={isFARViolation ? 'red' : 'normal'}
        sub={isFARViolation ? `Exceeds zone max ${MAX_ZONE_FAR}×` : `Zone max ${MAX_ZONE_FAR}×`}
      />
      <Row
        label="Max GFA"
        desc="Maximum gross floor area (Lot × FAR)"
        value={`${fmt(maxGFA, 0)} sqm`}
      />
      <Row
        label="Storeys"
        desc="Floors derived from GFA ÷ footprint"
        value={`${floors}F × ${FLOOR_HEIGHT_M}m = ${buildingHeightM}m`}
        state={isBHLViolation ? 'red' : 'normal'}
      />
      <Row
        label="BHL"
        desc="Building Height Limit"
        value={`${bhl}m`}
        state={isBHLViolation ? 'red' : 'normal'}
        sub={isBHLViolation ? `Exceeded by ${(buildingHeightM - bhl).toFixed(1)}m` : 'Compliant'}
      />
      <Row
        label="Setbacks"
        desc="Front/rear and side clearances"
        value={`F/R ${fmt(setbackFront, 1)}m · S ${fmt(setbackSide, 1)}m`}
      />

      {violations.length > 0 && (
        <div className="pt-1 border-t border-red-200 space-y-1.5">
          {violations.map((v, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded px-2 py-1.5 flex gap-1.5">
              <SCIcon icon={Warning} size="xs" className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-700">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

/**
 * Full FAR Playground scene: Canvas + parametric geometry + control panel + telemetry.
 * Dynamically imported (ssr: false) to prevent Three.js SSR errors.
 */
export default function FARPlayground() {
  return (
    <div className="relative h-full w-full">
      <CanvasWrapper
        cameraPosition={[7, 7, 7]}
        cameraFov={40}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={25}
        showGround={false}
      >
        <FARScene />
      </CanvasWrapper>
      <ControlPanel controls={FAR_CONTROLS} title="Zoning Parameters" />
      <FARTelemetry />
    </div>
  )
}
