'use client'

import { useDevControlsStore, PRESETS } from '../stores/useDevControlsStore'

export function PresetSelector() {
  const applyPreset = useDevControlsStore((s) => s.applyPreset)
  const reset = useDevControlsStore((s) => s.reset)

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Presets
      </label>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            title={p.description}
            className="rounded-sm border border-[#D4DAE3] px-2 py-1 text-[10px] font-medium text-[#1A2332] transition-colors duration-150 hover:bg-[#EEF2FC] hover:border-[#1B3FC4]"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={reset}
          className="rounded-sm border border-[#D4DAE3] px-2 py-1 text-[10px] font-medium text-[#8896A7] transition-colors duration-150 hover:bg-[#F8F7F5] hover:text-[#1A2332]"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
