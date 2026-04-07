'use client'

import { useWallConfigStore } from '../../store/useWallConfigStore'
import { useWallComputation } from '../../hooks/useWallComputation'
import type { Opening } from '../../types/wall.types'

export function Step3Openings() {
  const openings = useWallConfigStore((s) => s.config.openings)
  const addOpening = useWallConfigStore((s) => s.addOpening)
  const removeOpening = useWallConfigStore((s) => s.removeOpening)
  const updateOpening = useWallConfigStore((s) => s.updateOpening)
  const nextStep = useWallConfigStore((s) => s.nextStep)
  const prevStep = useWallConfigStore((s) => s.prevStep)

  const { areaState } = useWallComputation()
  const { grossAreaSqm, openingAreaSqm } = areaState

  const openingAreaExceeds = openingAreaSqm >= grossAreaSqm && grossAreaSqm > 0

  function handleAdd() {
    addOpening({
      id: crypto.randomUUID(),
      label: 'Opening',
      widthM: 0.9,
      heightM: 2.1,
      quantity: 1,
    })
  }

  function handleUpdate(id: string, patch: Partial<Opening>) {
    updateOpening(id, patch)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-text-primary">Openings</h2>
        <span className="rounded-sm border border-border px-1.5 py-0.5 text-xs text-text-tertiary">
          optional
        </span>
      </div>

      {openingAreaExceeds && (
        <div className="rounded-md border border-destructive bg-destructive-50 px-3 py-2">
          <p className="text-xs font-medium text-destructive">
            Opening area exceeds wall area
          </p>
        </div>
      )}

      {openings.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_80px_80px_56px_72px_32px] gap-2 px-0.5">
            {['Label', 'Width (m)', 'Height (m)', 'Qty', 'Area', ''].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-wide text-text-tertiary">
                {h}
              </span>
            ))}
          </div>

          {openings.map((opening) => {
            const area = opening.widthM * opening.heightM * opening.quantity
            return (
              <div
                key={opening.id}
                className="grid grid-cols-[1fr_80px_80px_56px_72px_32px] items-center gap-2"
              >
                {/* Label */}
                <input
                  type="text"
                  value={opening.label}
                  onChange={(e) => handleUpdate(opening.id, { label: e.target.value })}
                  className="rounded-sm border border-border px-2 py-1.5 text-sm text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {/* Width */}
                <input
                  type="number"
                  min={0.01}
                  step={0.05}
                  value={opening.widthM}
                  onChange={(e) =>
                    handleUpdate(opening.id, { widthM: parseFloat(e.target.value) || 0 })
                  }
                  className="rounded-sm border border-border px-2 py-1.5 font-mono text-sm tabular-nums text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {/* Height */}
                <input
                  type="number"
                  min={0.01}
                  step={0.05}
                  value={opening.heightM}
                  onChange={(e) =>
                    handleUpdate(opening.id, { heightM: parseFloat(e.target.value) || 0 })
                  }
                  className="rounded-sm border border-border px-2 py-1.5 font-mono text-sm tabular-nums text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {/* Quantity */}
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={opening.quantity}
                  onChange={(e) =>
                    handleUpdate(opening.id, { quantity: parseInt(e.target.value, 10) || 1 })
                  }
                  className="rounded-sm border border-border px-2 py-1.5 font-mono text-sm tabular-nums text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {/* Computed area */}
                <span className="font-mono text-sm tabular-nums text-text-secondary">
                  {area.toFixed(2)} sqm
                </span>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeOpening(opening.id)}
                  aria-label={`Remove ${opening.label}`}
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 ease-out hover:bg-destructive-50 hover:text-destructive"
                >
                  <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path
                      d="M2 2l8 8M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )
          })}

          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-text-secondary">Total opening area:</span>
            <span className="font-mono text-sm tabular-nums font-medium text-text-primary">
              {openingAreaSqm.toFixed(2)} sqm
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-light"
      >
        + Add Opening
      </button>

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-light"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={nextStep}
            className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-light"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={nextStep}
            disabled={openingAreaExceeds}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
