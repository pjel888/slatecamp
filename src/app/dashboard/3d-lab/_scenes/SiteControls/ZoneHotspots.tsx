'use client'

import { Html } from '@react-three/drei'
import { useSiteControlsStore, type ActiveZone } from '../../_stores/siteControlsStore'
import { SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'

function Hotspot({
  position,
  label,
  value,
  citation,
  zone,
}: {
  position: [number, number, number]
  label: string
  value: string
  citation: string
  zone: ActiveZone
}) {
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)
  const isActive = activeZone === zone

  return (
    <Html position={position} center distanceFactor={10} zIndexRange={[10, 0]}>
      <div
        className="cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation()
          setActiveZone(isActive ? null : zone)
        }}
      >
        {/* Badge (always visible) */}
        <div
          className={`rounded-sm px-2 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-sm transition-colors duration-150 ${
            isActive
              ? 'bg-[#1B3FC4] text-white'
              : 'bg-white/90 text-[#1A2332] border border-[#D4DAE3] hover:border-[#1B3FC4]'
          }`}
        >
          {label}
        </div>

        {/* Detail popover (when active) */}
        {isActive && (
          <div className="mt-1 w-56 rounded-md border border-[#1B3FC4] bg-white p-2.5 shadow-md">
            <p className="font-mono text-xs font-semibold text-[#1B3FC4] mb-1">{value}</p>
            <p className="font-mono text-[9px] text-[#8896A7]">{citation}</p>
          </div>
        )}
      </div>
    </Html>
  )
}

/**
 * Html hotspot markers positioned on each zone in 3D space.
 * Max 6 visible simultaneously. Each shows live computed values + IRR citations.
 */
export function ZoneHotspots() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const computed = useSiteControlsStore((s) => s.computed)

  const {
    tla, ambf, pso, isa, usa, setbacks,
    buildableWidth, buildableDepth, buildingHeight,
    isaPercent, usaPercent, ambf_by_setbacks, ambf_by_pso,
  } = computed

  const constraint = ambf_by_setbacks <= ambf_by_pso ? 'setback-limited' : 'zoning-capped'

  return (
    <group>
      {/* TLA — center of lot at ground */}
      <Hotspot
        position={[lotWidth / 2, 0.3, lotDepth / 2]}
        label="TLA"
        value={`${tla.toFixed(1)} sqm = ${lotWidth.toFixed(1)}m x ${lotDepth.toFixed(1)}m`}
        citation={SITE_CONTROL_CITATIONS.tla}
        zone="tla"
      />

      {/* AMBF — above building top */}
      {ambf > 0 && (
        <Hotspot
          position={[
            setbacks.left + buildableWidth / 2,
            buildingHeight + 1.5,
            setbacks.front + buildableDepth / 2,
          ]}
          label="AMBF"
          value={`${ambf.toFixed(1)} sqm — PSO ${(pso * 100).toFixed(1)}% (${constraint})`}
          citation={SITE_CONTROL_CITATIONS.ambf}
          zone="ambf"
        />
      )}

      {/* Setbacks — front edge */}
      <Hotspot
        position={[lotWidth / 2, 0.5, setbacks.front / 2]}
        label="SETBACKS"
        value={`F: ${setbacks.front}m · S: ${setbacks.left}m · R: ${setbacks.rear}m`}
        citation={SITE_CONTROL_CITATIONS.setbacks}
        zone="setbacks"
      />

      {/* ISA — front zone */}
      {isa > 0.1 && (
        <Hotspot
          position={[lotWidth * 0.25, 0.3, setbacks.front * 0.4]}
          label="ISA"
          value={`${isa.toFixed(1)} sqm (${(isaPercent * 100).toFixed(0)}% table ref)`}
          citation={SITE_CONTROL_CITATIONS.isa}
          zone="isa"
        />
      )}

      {/* USA — rear zone */}
      {usa > 0.1 && (
        <Hotspot
          position={[lotWidth * 0.75, 0.3, lotDepth - setbacks.rear * 0.4]}
          label="USA"
          value={`${usa.toFixed(1)} sqm (${(usaPercent * 100).toFixed(0)}% table ref)`}
          citation={SITE_CONTROL_CITATIONS.usa}
          zone="usa"
        />
      )}
    </group>
  )
}
