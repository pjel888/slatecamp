'use client'

import { useWallConfigStore } from '../../store/useWallConfigStore'

function TogglePill({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative w-8 h-[18px] rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0 ${
        enabled ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-[left] duration-150 ${
          enabled ? 'left-[16px]' : 'left-[2px]'
        }`}
      />
    </button>
  )
}

export function Step6Finish() {
  const layers = useWallConfigStore((s) => s.config.layers)
  const topcoatCoats = useWallConfigStore((s) => s.config.topcoatCoats ?? 2)
  const paintCoverage = useWallConfigStore((s) => s.config.paintCoverageSqmPerL ?? 7)
  const toggleLayer = useWallConfigStore((s) => s.toggleLayer)
  const setLayerWaste = useWallConfigStore((s) => s.setLayerWaste)
  const setTopcoatCoats = useWallConfigStore((s) => s.setTopcoatCoats)
  const setPaintCoverage = useWallConfigStore((s) => s.setPaintCoverage)
  const nextStep = useWallConfigStore((s) => s.nextStep)
  const prevStep = useWallConfigStore((s) => s.prevStep)

  const primerLayer = layers.find((l) => l.code === 'PRIMER')
  const topcoatLayer = layers.find((l) => l.code === 'TOPCOAT')

  const primerWaste = Math.round((primerLayer?.wasteFactor ?? 0.1) * 100)
  const topcoatWaste = Math.round((topcoatLayer?.wasteFactor ?? 0.1) * 100)

  function handleCoats(delta: number) {
    const next = Math.min(4, Math.max(1, topcoatCoats + delta))
    setTopcoatCoats(next)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">Finish layers</h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Configure primer and topcoat. Coverage rate is shared across both layers.
        </p>
      </div>

      <div>
        {/* Primer card */}
        {primerLayer && (
          <div
            className={`flex items-center gap-3 px-3.5 py-[11px] border border-border rounded-lg bg-white mb-1.5 transition-opacity duration-150 ${
              !primerLayer.enabled ? 'opacity-45' : ''
            }`}
          >
            <TogglePill
              enabled={primerLayer.enabled}
              onToggle={() => toggleLayer('PRIMER', !primerLayer.enabled)}
            />

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-primary">Primer (1 coat)</div>
              <div className="text-[11px] text-text-secondary">Coverage {paintCoverage} sqm/L</div>
            </div>

            <span className="font-mono text-[8px] font-medium uppercase tracking-[0.08em] px-[7px] py-[3px] rounded bg-[#F2F0EB] text-text-secondary whitespace-nowrap">
              AREA / SIDE
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <label className="font-mono text-[9px] uppercase text-text-tertiary">Waste</label>
              <input
                type="text"
                value={`${primerWaste}%`}
                onChange={(e) => {
                  const raw = e.target.value.replace('%', '').trim()
                  const v = parseInt(raw, 10)
                  if (!isNaN(v) && v >= 0 && v <= 99) {
                    setLayerWaste('PRIMER', v / 100)
                  }
                }}
                className="font-mono text-[12px] w-11 border border-border rounded px-1.5 py-[3px] text-right bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Topcoat card */}
        {topcoatLayer && (
          <div
            className={`flex items-center gap-3 px-3.5 py-[11px] border border-border rounded-lg bg-white mb-1.5 transition-opacity duration-150 ${
              !topcoatLayer.enabled ? 'opacity-45' : ''
            }`}
          >
            <TogglePill
              enabled={topcoatLayer.enabled}
              onToggle={() => toggleLayer('TOPCOAT', !topcoatLayer.enabled)}
            />

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-primary">
                Topcoat Paint ({topcoatCoats} coats)
              </div>
              <div className="text-[11px] text-text-secondary">Coverage {paintCoverage} sqm/L</div>
            </div>

            <span className="font-mono text-[8px] font-medium uppercase tracking-[0.08em] px-[7px] py-[3px] rounded bg-[#F2F0EB] text-text-secondary whitespace-nowrap">
              AREA / SIDE
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <label className="font-mono text-[9px] uppercase text-text-tertiary">Waste</label>
              <input
                type="text"
                value={`${topcoatWaste}%`}
                onChange={(e) => {
                  const raw = e.target.value.replace('%', '').trim()
                  const v = parseInt(raw, 10)
                  if (!isNaN(v) && v >= 0 && v <= 99) {
                    setLayerWaste('TOPCOAT', v / 100)
                  }
                }}
                className="font-mono text-[12px] w-11 border border-border rounded px-1.5 py-[3px] text-right bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Topcoat coat count stepper */}
        {topcoatLayer && (
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="font-mono text-[9px] uppercase text-text-tertiary">Coats</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCoats(-1)}
                disabled={topcoatCoats <= 1}
                className="w-6 h-6 flex items-center justify-center rounded-sm border border-border bg-white text-text-secondary text-sm transition-colors duration-150 hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease coat count"
              >
                −
              </button>
              <span className="font-mono text-[12px] text-text-primary w-4 text-center">
                {topcoatCoats}
              </span>
              <button
                type="button"
                onClick={() => handleCoats(1)}
                disabled={topcoatCoats >= 4}
                className="w-6 h-6 flex items-center justify-center rounded-sm border border-border bg-white text-text-secondary text-sm transition-colors duration-150 hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase coat count"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Shared coverage rate input */}
        <div className="flex items-center gap-2 px-1 mt-3">
          <label className="font-mono text-[9px] uppercase text-text-tertiary">Coverage rate</label>
          <input
            type="number"
            min={1}
            max={20}
            step={0.5}
            value={paintCoverage}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v > 0) setPaintCoverage(v)
            }}
            className="font-mono text-[12px] w-14 border border-border rounded px-1.5 py-[3px] bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="font-mono text-[9px] uppercase text-text-tertiary">sqm/L/coat</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-border pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-sm border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-light"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-600"
        >
          View Results
        </button>
      </div>
    </div>
  )
}
