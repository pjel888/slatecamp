'use client'

import { useWallLabStore, SPONSOR_BRANDS } from '@/features/3d-lab/stores/useWallLabStore'

interface TilePattern {
  value: string
  label: string
  symbol: string
}

const TILE_PATTERNS: TilePattern[] = [
  { value: 'grid', label: 'Grid', symbol: '⊞' },
  { value: 'brick', label: 'Brick/Offset', symbol: '▤' },
  { value: 'herringbone', label: 'Herringbone', symbol: '⫲' },
  { value: 'diagonal', label: 'Diagonal', symbol: '◪' },
]

export function ColorSponsorStep() {
  const finishType = useWallLabStore((s) => s.finishType)
  const activeSponsorId = useWallLabStore((s) => s.activeSponsorId)
  const selectedColorHex = useWallLabStore((s) => s.selectedColorHex)
  const selectedColorName = useWallLabStore((s) => s.selectedColorName)
  const tilePattern = useWallLabStore((s) => s.tilePattern)
  const setColor = useWallLabStore((s) => s.setColor)
  const setSponsor = useWallLabStore((s) => s.setSponsor)
  const setTilePattern = useWallLabStore((s) => s.setTilePattern)

  const activeSponsor = SPONSOR_BRANDS.find((b) => b.id === activeSponsorId) ?? SPONSOR_BRANDS[0]

  if (finishType === 'tiles') {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">Tile Pattern</span>
        <div className="grid grid-cols-2 gap-2">
          {TILE_PATTERNS.map((p) => {
            const isSelected = tilePattern === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setTilePattern(p.value)}
                className={[
                  'flex flex-col items-center justify-center gap-1.5 border rounded-md p-3 cursor-pointer transition-colors duration-150',
                  isSelected
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-white hover:border-primary',
                ].join(' ')}
              >
                <span className="text-[22px] leading-none" aria-hidden="true">
                  {p.symbol}
                </span>
                <span className="text-[12px] font-medium text-foreground">{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Sponsor tabs */}
      <div className="flex border-b border-border gap-0">
        {SPONSOR_BRANDS.map((brand) => {
          const isActive = activeSponsor.id === brand.id
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => setSponsor(brand.id)}
              className={[
                'px-3 py-2 text-[12px] font-medium transition-colors duration-150 -mb-px border-b-2',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-text-secondary',
              ].join(' ')}
            >
              {brand.name}
            </button>
          )
        })}
      </div>

      {/* Color swatches */}
      <div className="grid grid-cols-6 gap-2">
        {activeSponsor.colors.map((color) => {
          const isSelected = color.hex.toLowerCase() === selectedColorHex.toLowerCase()
          return (
            <button
              key={color.hex}
              type="button"
              title={color.name}
              onClick={() => {
                setColor(color.hex, color.name)
                setSponsor(activeSponsor.id)
              }}
              className="flex flex-col items-center gap-0.5 focus:outline-none"
            >
              <span
                className={[
                  'w-8 h-8 rounded-full border border-border block transition-transform duration-150 hover:scale-110',
                  isSelected ? 'ring-2 ring-primary ring-offset-2' : '',
                ].join(' ')}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[9px] text-muted-foreground text-center truncate w-8 leading-tight">
                {color.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected indicator */}
      {selectedColorName && (
        <div className="flex items-center gap-2 pt-1">
          <span
            className="w-4 h-4 rounded-full border border-border shrink-0"
            style={{ backgroundColor: selectedColorHex }}
          />
          <span className="text-[12px] text-text-secondary">
            {selectedColorName}{' '}
            <span className="font-mono text-[11px] text-muted-foreground">({selectedColorHex})</span>
          </span>
        </div>
      )}
    </div>
  )
}
