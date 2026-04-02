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
            className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-[#8896A7]"
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
            className="w-[110px] rounded-[6px] border border-[#D4DAE3] px-2.5 py-[7px] font-mono text-[13px] text-[#1A2332] outline-none transition-colors duration-150 ease-out focus:border-[#1B3FC4] focus:ring-1 focus:ring-[#1B3FC4]"
          />
        </div>

        {/* Height */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="geo-height"
            className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-[#8896A7]"
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
            className="w-[110px] rounded-[6px] border border-[#D4DAE3] px-2.5 py-[7px] font-mono text-[13px] text-[#1A2332] outline-none transition-colors duration-150 ease-out focus:border-[#1B3FC4] focus:ring-1 focus:ring-[#1B3FC4]"
          />
        </div>

        {/* Wall Count */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="geo-wallcount"
            className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-[#8896A7]"
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
            className="w-[110px] rounded-[6px] border border-[#D4DAE3] px-2.5 py-[7px] font-mono text-[13px] text-[#1A2332] outline-none transition-colors duration-150 ease-out focus:border-[#1B3FC4] focus:ring-1 focus:ring-[#1B3FC4]"
          />
        </div>

        {/* Gross Area (computed, read-only) */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-[#8896A7]">
            Gross Area
          </span>
          <div className="w-[110px] rounded-[6px] border border-[#1B3FC4] bg-[#EEF2FC] px-2.5 py-[7px] font-mono text-[13px] font-semibold text-[#1B3FC4]">
            {isValid ? `${grossAreaSqm.toFixed(2)} m²` : '—'}
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-2 border-t border-[#D4DAE3] pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="rounded-sm border border-[#D4DAE3] bg-white px-4 py-2 text-[13px] font-medium text-[#4A5568] transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!isValid}
          className="rounded-sm bg-[#1B3FC4] px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-[#1535A8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
