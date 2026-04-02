'use client'

import { useWallLabStore, CORE_THICKNESS_OPTIONS } from '../../../_stores/useWallLabStore'
import { ToggleSwitch } from '../ToggleSwitch'
import type { CoreType } from '@/features/wall-configurator/types/wall.types'

const CORE_OPTIONS: Array<{ value: CoreType; label: string }> = [
  { value: 'chb', label: 'CHB (Concrete Hollow Block)' },
  { value: 'drywall', label: 'Drywall (Gypsum Board)' },
  { value: 'plywood', label: 'Plywood Partition' },
  { value: 'cement-board', label: 'Cement Board (HardieFlex)' },
  { value: 'brick', label: 'Brick Masonry' },
  { value: 'solid-concrete', label: 'Solid Concrete' },
  { value: 'existing-wall', label: 'Existing Wall (Repaint)' },
]

export function CoreTypeStep() {
  const coreType = useWallLabStore((s) => s.coreType)
  const coreThicknessMM = useWallLabStore((s) => s.coreThicknessMM)
  const coreMoistureResistant = useWallLabStore((s) => s.coreMoistureResistant)
  const setCoreType = useWallLabStore((s) => s.setCoreType)
  const setCoreThickness = useWallLabStore((s) => s.setCoreThickness)
  const setCoreMoistureResistant = useWallLabStore((s) => s.setCoreMoistureResistant)

  const thicknessOptions = CORE_THICKNESS_OPTIONS[coreType]
  const showMoistureToggle = coreType === 'drywall' || coreType === 'cement-board'

  return (
    <div className="flex flex-col gap-3">
      {/* Core type dropdown */}
      <select
        value={coreType}
        onChange={(e) => setCoreType(e.target.value as CoreType)}
        className="w-full border border-[#D4DAE3] rounded-sm px-2 py-1.5 text-[13px] text-[#1A2332] bg-white focus:outline-none focus:border-[#1B3FC4] transition-colors duration-150"
      >
        {CORE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Thickness selector */}
      {thicknessOptions.length > 1 && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#4A5568]">Thickness</label>
          <select
            value={coreThicknessMM}
            onChange={(e) => setCoreThickness(Number(e.target.value))}
            className="w-full border border-[#D4DAE3] rounded-sm px-2 py-1.5 text-[13px] text-[#1A2332] bg-white focus:outline-none focus:border-[#1B3FC4] transition-colors duration-150"
          >
            {thicknessOptions.map((opt) => (
              <option key={opt.mm} value={opt.mm}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Moisture resistant toggle (drywall / cement board) */}
      {showMoistureToggle && (
        <label className="flex items-center justify-between gap-2 py-1.5 cursor-pointer">
          <span className="text-[12px] text-[#1A2332]">Moisture resistant</span>
          <ToggleSwitch
            checked={coreMoistureResistant}
            onChange={setCoreMoistureResistant}
          />
        </label>
      )}
    </div>
  )
}
