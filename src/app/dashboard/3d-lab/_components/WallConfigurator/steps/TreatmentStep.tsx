'use client'

import { useWallLabStore } from '../../../_stores/useWallLabStore'
import { MASONRY_CORE_TYPES } from '@/features/wall-configurator/store/layer-defaults'
import { Switch } from '@/components/ui/switch'

const TREATMENT_LAYER_CODES = new Set(['PLASTER', 'SKIM_COAT', 'LASON'])

export function TreatmentStep() {
  const coreType = useWallLabStore((s) => s.coreType)
  const sides = useWallLabStore((s) => s.sides)
  const layers = useWallLabStore((s) => s.layers)
  const lason = useWallLabStore((s) => s.lason)
  const setSides = useWallLabStore((s) => s.setSides)
  const setLason = useWallLabStore((s) => s.setLason)
  const toggleLayer = useWallLabStore((s) => s.toggleLayer)

  const isMasonry = MASONRY_CORE_TYPES.has(coreType)
  const treatmentLayers = layers.filter((l) => TREATMENT_LAYER_CODES.has(l.code))

  return (
    <div className="flex flex-col gap-4">
      {/* Sides selector */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium text-[#4A5568] uppercase tracking-wide">Sides to Finish</span>
        <div className="grid grid-cols-2 gap-2">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSides(s)}
              className={[
                'flex flex-col items-center justify-center border rounded-md p-3 cursor-pointer transition-colors duration-150 gap-1',
                sides === s
                  ? 'border-[#1B3FC4] bg-[#EEF2FC]'
                  : 'border-[#D4DAE3] bg-white hover:border-[#1B3FC4]',
              ].join(' ')}
            >
              <span className="text-[13px] font-medium text-[#1A2332]">
                {s === 1 ? '1 Side' : 'Both Sides'}
              </span>
              <span className="text-[11px] text-[#4A5568]">
                {s === 1 ? 'Single face finish' : 'Finish both faces'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Treatment layer toggles */}
      {treatmentLayers.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium text-[#4A5568] uppercase tracking-wide">Treatment Layers</span>
          <div className="flex flex-col gap-2">
            {treatmentLayers.map((layer) => (
              <label
                key={layer.code}
                className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 border border-[#D4DAE3] rounded-md bg-white hover:border-[#1B3FC4] transition-colors duration-150"
              >
                <div className="min-w-0">
                  <span className="block text-[13px] font-medium text-[#1A2332]">{layer.label}</span>
                  <span className="block text-[11px] text-[#4A5568]">
                    {LAYER_DESCRIPTIONS[layer.code] ?? ''}
                  </span>
                </div>
                <div className="shrink-0">
                  <Switch
                    size="sm"
                    checked={layer.enabled}
                    onCheckedChange={(v) => toggleLayer(layer.code, v)}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Lason section */}
      {isMasonry && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-px bg-[#D4DAE3]" />
          <span className="text-[11px] font-medium text-[#4A5568] uppercase tracking-wide">Concrete Neutralizer (Lason)</span>
          <label className="flex items-center justify-between gap-3 cursor-pointer py-2 px-3 border border-[#D4DAE3] rounded-md bg-white hover:border-[#1B3FC4] transition-colors duration-150">
            <div className="min-w-0">
              <span className="block text-[13px] font-medium text-[#1A2332]">Apply Neutralizer</span>
              <span className="block text-[11px] text-[#4A5568]">
                Neutralizes alkalinity before painting
              </span>
            </div>
            <div className="shrink-0">
              <Switch
                size="sm"
                checked={lason.enabled}
                onCheckedChange={(v) => setLason({ ...lason, enabled: v })}
              />
            </div>
          </label>

          {lason.enabled && (
            <div className="flex flex-col gap-1.5 pl-3">
              <span className="text-[11px] text-[#4A5568]">Product type:</span>
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    { value: 'muriatic-acid', label: 'Muriatic Acid (diluted)' },
                    { value: 'commercial-neutralizer', label: 'Commercial Neutralizer' },
                  ] as const
                ).map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lason-product"
                      checked={lason.productType === opt.value}
                      onChange={() => setLason({ ...lason, productType: opt.value })}
                      className="accent-[#1B3FC4]"
                    />
                    <span className="text-[12px] text-[#1A2332]">{opt.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-[#8896A7] mt-1">
                Applied after plaster cures to neutralize alkalinity before painting.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const LAYER_DESCRIPTIONS: Record<string, string> = {
  PLASTER: 'Cement-sand plaster scratch and finish coat',
  SKIM_COAT: 'Thin putty coat for smooth surface',
  LASON: 'Concrete neutralizer treatment',
}
