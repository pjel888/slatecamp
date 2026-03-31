'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { Slider } from './LotInputPanel'

export function ProposedBuildingPanel() {
  const building = useDevControlsStore((s) => s.building)
  const setBuilding = useDevControlsStore((s) => s.setBuilding)
  const bhlStoreys = useDevControlsStore((s) => s.result.bhlStoreys)

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Proposed Building
      </label>
      <div className="space-y-3">
        <Slider
          label="Footprint Width"
          value={building.proposedFootprintWidth}
          min={2} max={80} step={0.5} unit="m"
          onChange={(v) => setBuilding({ proposedFootprintWidth: v })}
        />
        <Slider
          label="Footprint Depth"
          value={building.proposedFootprintDepth}
          min={2} max={80} step={0.5} unit="m"
          onChange={(v) => setBuilding({ proposedFootprintDepth: v })}
        />
        <Slider
          label="Number of Floors"
          value={building.proposedStoreys}
          min={1} max={50} step={1} unit=""
          warning={building.proposedStoreys > bhlStoreys ? `Exceeds BHL (${bhlStoreys} storeys)` : undefined}
          onChange={(v) => setBuilding({ proposedStoreys: v })}
        />
        <Slider
          label="Floor-to-Floor Height"
          value={building.floorHeight}
          min={2.4} max={6.0} step={0.1} unit="m"
          warning={building.floorHeight < 2.7 ? 'Below 2.7m habitable minimum' : undefined}
          onChange={(v) => setBuilding({ floorHeight: v })}
        />
      </div>
    </div>
  )
}
