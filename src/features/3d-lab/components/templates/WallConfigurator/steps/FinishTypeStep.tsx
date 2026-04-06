'use client'

import { useWallLabStore } from '@/features/3d-lab/stores/useWallLabStore'
import { TILE_SIZES } from '@/features/wall-configurator/types/wall.types'
import type { FinishType, TileConfig } from '@/features/wall-configurator/types/wall.types'

interface FinishOption {
  value: FinishType
  name: string
  description: string
  disabled?: boolean
}

const FINISH_OPTIONS: FinishOption[] = [
  { value: 'paint', name: 'Paint', description: 'Primer + topcoat paint finish' },
  { value: 'tiles', name: 'Tiles', description: 'Ceramic or porcelain wall tiles' },
  { value: 'wallpaper', name: 'Wallpaper', description: 'Decorative wallpaper', disabled: true },
  { value: 'exposed', name: 'Exposed', description: 'No finish — exposed brick or concrete' },
]

const COAT_OPTIONS = [1, 2, 3]

export function FinishTypeStep() {
  const finishType = useWallLabStore((s) => s.finishType)
  const tileConfig = useWallLabStore((s) => s.tileConfig)
  const topcoatCoats = useWallLabStore((s) => s.topcoatCoats)
  const setFinishType = useWallLabStore((s) => s.setFinishType)
  const setTileConfig = useWallLabStore((s) => s.setTileConfig)
  const setTopcoatCoats = useWallLabStore((s) => s.setTopcoatCoats)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {FINISH_OPTIONS.map((opt) => {
          const isSelected = finishType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && setFinishType(opt.value)}
              className={[
                'flex flex-col items-start gap-1 border rounded-md p-3 text-left transition-colors duration-150',
                opt.disabled
                  ? 'opacity-50 cursor-not-allowed border-[#D4DAE3] bg-white'
                  : isSelected
                  ? 'border-[#1B3FC4] bg-[#EEF2FC] cursor-pointer'
                  : 'border-[#D4DAE3] bg-white hover:border-[#1B3FC4] cursor-pointer',
              ].join(' ')}
            >
              <span className="text-[13px] font-medium text-[#1A2332] leading-tight">
                {opt.name}
                {opt.disabled && (
                  <span className="ml-1.5 text-[10px] text-[#8896A7] font-normal">soon</span>
                )}
              </span>
              <span className="text-[11px] text-[#4A5568] leading-snug">{opt.description}</span>
            </button>
          )
        })}
      </div>

      {/* Paint extras */}
      {finishType === 'paint' && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] text-[#4A5568]">Topcoat coats:</span>
          <div className="flex gap-1.5">
            {COAT_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setTopcoatCoats(c)}
                className={[
                  'w-9 h-9 text-[13px] font-medium rounded-sm border transition-colors duration-150',
                  topcoatCoats === c
                    ? 'border-[#1B3FC4] bg-[#1B3FC4] text-white'
                    : 'border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4]',
                ].join(' ')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tile extras */}
      {finishType === 'tiles' && (
        <TileExtras tileConfig={tileConfig} onTileConfig={setTileConfig} />
      )}
    </div>
  )
}

interface TileExtrasProps {
  tileConfig: TileConfig
  onTileConfig: (tc: TileConfig) => void
}

function TileExtras({ tileConfig, onTileConfig }: TileExtrasProps) {
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-[#4A5568]">Tile size:</span>
        <div className="flex gap-1.5 flex-wrap">
          {TILE_SIZES.map((ts) => {
            const isSelected =
              ts.widthMM === tileConfig.widthMM && ts.heightMM === tileConfig.heightMM
            return (
              <button
                key={ts.sizeLabel}
                type="button"
                onClick={() => onTileConfig(ts)}
                className={[
                  'text-[12px] font-mono px-2.5 py-1.5 rounded-sm border transition-colors duration-150',
                  isSelected
                    ? 'border-[#1B3FC4] bg-[#1B3FC4] text-white'
                    : 'border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4]',
                ].join(' ')}
              >
                {ts.sizeLabel}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-[#4A5568]">Grout gap (mm):</label>
        <input
          type="number"
          step={1}
          min={1}
          max={20}
          value={tileConfig.groutGapMM}
          onChange={(e) =>
            onTileConfig({ ...tileConfig, groutGapMM: parseInt(e.target.value, 10) || 3 })
          }
          className="border border-[#D4DAE3] rounded-sm px-2 py-1.5 text-[13px] font-mono w-24 focus:outline-none focus:border-[#1B3FC4] transition-colors duration-150"
        />
      </div>
    </div>
  )
}
