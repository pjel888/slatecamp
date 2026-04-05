'use client'

import { useState, useEffect } from 'react'
import { useWallConfigStore } from '../../store/useWallConfigStore'
import { useWallComputation } from '../../hooks/useWallComputation'

export function Step2Geometry() {
  const geometry = useWallConfigStore((s) => s.config.geometry)
  const setGeometry = useWallConfigStore((s) => s.setGeometry)
  const nextStep = useWallConfigStore((s) => s.nextStep)
  const prevStep = useWallConfigStore((s) => s.prevStep)

  const [lengthM, setLengthM] = useState(geometry.lengthM)
  const [heightM, setHeightM] = useState(geometry.heightM)
  const [wallCount, setWallCount] = useState(geometry.wallCount)

  const { areaState } = useWallComputation()
  const { grossAreaSqm } = areaState

  useEffect(() => {
    if (lengthM > 0 && heightM > 0 && wallCount > 0) {
      setGeometry(lengthM, heightM, wallCount)
    }
  }, [lengthM, heightM, wallCount, setGeometry])

  const isValid = lengthM > 0 && heightM > 0 && wallCount > 0

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-3">
        {/* Length */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="geo-length"
            className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-text-tertiary"
          >
            Length (m)
          </label>
          <input
            id="geo-length"
            type="number"
            min={0.01}
            step={0.1}
            value={lengthM}
            onChange={(e) => setLengthM(parseFloat(e.target.value) || 0)}
            className="w-[110px] rounded-[6px] border border-border px-2.5 py-[7px] font-mono text-[13px] text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Height */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="geo-height"
            className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-text-tertiary"
          >
            Height (m)
          </label>
          <input
            id="geo-height"
            type="number"
            min={0.01}
            step={0.1}
            value={heightM}
            onChange={(e) => setHeightM(parseFloat(e.target.value) || 0)}
            className="w-[110px] rounded-[6px] border border-border px-2.5 py-[7px] font-mono text-[13px] text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Wall Count */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="geo-wallcount"
            className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-text-tertiary"
          >
            Wall Count
          </label>
          <input
            id="geo-wallcount"
            type="number"
            min={1}
            step={1}
            value={wallCount}
            onChange={(e) => setWallCount(parseInt(e.target.value, 10) || 0)}
            className="w-[110px] rounded-[6px] border border-border px-2.5 py-[7px] font-mono text-[13px] text-text-primary outline-none transition-colors duration-150 ease-out focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Gross Area (computed, read-only) */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
            Gross Area
          </span>
          <div className="w-[110px] rounded-[6px] border border-primary bg-primary-50 px-2.5 py-[7px] font-mono text-[13px] font-semibold text-primary">
            {isValid ? `${grossAreaSqm.toFixed(2)} m²` : '—'}
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-sm border border-border bg-white px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-surface-light"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!isValid}
          className="rounded-sm bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
