'use client'

import { SPONSOR_BRANDS } from '../../_stores/useWallLabStore'

interface SponsorPaletteProps {
  sponsorId: string
  onColorSelect: (hex: string, name: string) => void
  selectedHex: string
}

export function SponsorPalette({ sponsorId, onColorSelect, selectedHex }: SponsorPaletteProps) {
  const sponsor = SPONSOR_BRANDS.find((b) => b.id === sponsorId)

  if (!sponsor) {
    return (
      <p className="text-[11px] text-[#8896A7]">No sponsor palette available.</p>
    )
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {sponsor.colors.map((color) => {
        const isSelected = color.hex.toLowerCase() === selectedHex.toLowerCase()
        return (
          <button
            key={color.hex}
            type="button"
            title={color.name}
            onClick={() => onColorSelect(color.hex, color.name)}
            className="flex flex-col items-center gap-0.5 focus:outline-none"
          >
            <span
              className={[
                'w-8 h-8 rounded-full border border-[#D4DAE3] block transition-transform duration-150 hover:scale-110',
                isSelected ? 'ring-2 ring-[#1B3FC4] ring-offset-1' : '',
              ].join(' ')}
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-[9px] text-[#8896A7] text-center truncate w-8 leading-tight">
              {color.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
