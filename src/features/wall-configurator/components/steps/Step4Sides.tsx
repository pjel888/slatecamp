'use client'

import { useWallConfigStore } from '../../store/useWallConfigStore'
import { useWallComputation } from '../../hooks/useWallComputation'
import type { SideCount } from '../../types/wall.types'

export function Step4Sides() {
  const sides = useWallConfigStore((s) => s.config.sides)
  const setSides = useWallConfigStore((s) => s.setSides)
  const nextStep = useWallConfigStore((s) => s.nextStep)
  const prevStep = useWallConfigStore((s) => s.prevStep)

  const { areaState } = useWallComputation()
  const { netAreaSqm } = areaState

  const oneFaceArea = netAreaSqm.toFixed(2)

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Segmented toggle */}
      <div
        className="flex w-fit overflow-hidden rounded-lg border border-[#D4DAE3]"
        role="group"
        aria-label="Number of sides to finish"
      >
        {([1, 2] as SideCount[]).map((value) => {
          const isActive = sides === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSides(value)}
              aria-pressed={isActive}
              className={[
                'px-5 py-2 text-[13px] font-medium cursor-pointer transition-colors duration-150 ease-out',
                isActive
                  ? 'bg-[#1B3FC4] text-white'
                  : 'bg-white text-[#8896A7] hover:bg-[#F8F7F5]',
              ].join(' ')}
            >
              {value === 1 ? '1 Side' : 'Both Sides'}
            </button>
          )
        })}
      </div>

      {/* Contextual note */}
      <p className="mt-2 text-[12px] italic text-[#4A5568]">
        Plaster, primer, and paint quantities apply to{' '}
        <strong>1 face ({oneFaceArea} sqm)</strong>. Select &ldquo;Both Sides&rdquo; to double
        finish area quantities.
      </p>

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
          className="rounded-sm bg-[#1B3FC4] px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
