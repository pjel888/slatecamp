'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FloorTilesResult } from '@/types/tools'

const PRESET_TILE_SIZES = [300, 400, 600] as const
type PresetTileSize = (typeof PRESET_TILE_SIZES)[number]

interface FloorTilesFormProps {
  onCalculate: (results: FloorTilesResult) => void
}

interface FormErrors {
  roomLength?: string
  roomWidth?: string
  tileSize?: string
  groutWidth?: string
}

const calculateTiles = (
  roomLength: number,
  roomWidth: number,
  tileSize: number,
  groutWidth: number,
): FloorTilesResult => {
  const totalArea = roomLength * roomWidth
  const tileSizeM = tileSize / 1000
  const groutM = groutWidth / 1000
  const effectiveTileSize = tileSizeM + groutM
  const tilesPerRow = Math.ceil(roomLength / effectiveTileSize)
  const tilesPerCol = Math.ceil(roomWidth / effectiveTileSize)
  const wholeTilesPerRow = Math.floor(roomLength / effectiveTileSize)
  const wholeTilesPerCol = Math.floor(roomWidth / effectiveTileSize)
  const wholeTiles = wholeTilesPerRow * wholeTilesPerCol
  const totalTiles = tilesPerRow * tilesPerCol
  const cutTiles = totalTiles - wholeTiles
  const wastePercentage =
    ((totalTiles * tileSizeM * tileSizeM - totalArea) / totalArea) * 100

  return {
    totalArea,
    wholeTiles,
    cutTiles,
    totalTiles,
    wastePercentage,
  }
}

export const FloorTilesForm = ({ onCalculate }: FloorTilesFormProps) => {
  const [roomLength, setRoomLength] = useState('5')
  const [roomWidth, setRoomWidth] = useState('4')
  const [tileSizePreset, setTileSizePreset] = useState<PresetTileSize | 'custom'>(600)
  const [customTileSize, setCustomTileSize] = useState('')
  const [groutWidth, setGroutWidth] = useState('3')
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const next: FormErrors = {}

    const len = parseFloat(roomLength)
    if (!roomLength || isNaN(len) || len <= 0) {
      next.roomLength = 'Room length must be greater than 0'
    } else if (len > 100) {
      next.roomLength = 'Room length cannot exceed 100 m'
    }

    const wid = parseFloat(roomWidth)
    if (!roomWidth || isNaN(wid) || wid <= 0) {
      next.roomWidth = 'Room width must be greater than 0'
    } else if (wid > 100) {
      next.roomWidth = 'Room width cannot exceed 100 m'
    }

    if (tileSizePreset === 'custom') {
      const custom = parseFloat(customTileSize)
      if (!customTileSize || isNaN(custom) || custom < 50) {
        next.tileSize = 'Custom tile size must be at least 50 mm'
      } else if (custom > 1200) {
        next.tileSize = 'Custom tile size cannot exceed 1200 mm'
      }
    }

    const grout = parseFloat(groutWidth)
    if (groutWidth === '' || isNaN(grout) || grout < 0) {
      next.groutWidth = 'Grout width must be 0 or greater'
    } else if (grout > 20) {
      next.groutWidth = 'Grout width cannot exceed 20 mm'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleCalculate = () => {
    if (!validate()) return

    const len = parseFloat(roomLength)
    const wid = parseFloat(roomWidth)
    const tileSize =
      tileSizePreset === 'custom' ? parseFloat(customTileSize) : tileSizePreset
    const grout = parseFloat(groutWidth)

    const results = calculateTiles(len, wid, tileSize, grout)
    onCalculate(results)
  }

  const resolvedTileSize =
    tileSizePreset === 'custom' ? parseFloat(customTileSize) : tileSizePreset

  return (
    <Card className='shadow-none'>
      <CardHeader>
        <CardTitle className='text-sm font-semibold text-foreground'>
          Floor Tiles Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
        {/* Room Dimensions */}
        <section className='flex flex-col gap-4'>
          <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
            Room Dimensions
          </p>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='room-length'>Room Length (m)</Label>
            <Input
              id='room-length'
              type='number'
              step='0.01'
              min='0.1'
              max='100'
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              aria-invalid={!!errors.roomLength}
              placeholder='e.g. 5'
            />
            {errors.roomLength && (
              <span className='text-[12px] text-destructive'>{errors.roomLength}</span>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='room-width'>Room Width (m)</Label>
            <Input
              id='room-width'
              type='number'
              step='0.01'
              min='0.1'
              max='100'
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              aria-invalid={!!errors.roomWidth}
              placeholder='e.g. 4'
            />
            {errors.roomWidth && (
              <span className='text-[12px] text-destructive'>{errors.roomWidth}</span>
            )}
          </div>
        </section>

        {/* Tile Settings */}
        <section className='flex flex-col gap-4'>
          <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
            Tile Settings
          </p>

          <div className='flex flex-col gap-1.5'>
            <Label>Tile Size</Label>
            <div className='grid grid-cols-4 gap-2'>
              {PRESET_TILE_SIZES.map((size) => (
                <button
                  key={size}
                  type='button'
                  onClick={() => setTileSizePreset(size)}
                  className={cn(
                    'h-8 rounded-sm border text-[13px] font-medium transition-colors duration-150',
                    tileSizePreset === size
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  {size}mm
                </button>
              ))}
              <button
                type='button'
                onClick={() => setTileSizePreset('custom')}
                className={cn(
                  'h-8 rounded-sm border text-[13px] font-medium transition-colors duration-150',
                  tileSizePreset === 'custom'
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card text-foreground hover:bg-muted',
                )}
              >
                Custom
              </button>
            </div>
            {errors.tileSize && (
              <span className='text-[12px] text-destructive'>{errors.tileSize}</span>
            )}
          </div>

          {tileSizePreset === 'custom' && (
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='custom-tile-size'>Custom Tile Size (mm)</Label>
              <Input
                id='custom-tile-size'
                type='number'
                step='1'
                min='50'
                max='1200'
                value={customTileSize}
                onChange={(e) => setCustomTileSize(e.target.value)}
                aria-invalid={!!errors.tileSize}
                placeholder='e.g. 450'
              />
            </div>
          )}

          {!isNaN(resolvedTileSize) && resolvedTileSize > 0 && (
            <p className='text-[12px] text-muted-foreground'>
              Effective tile: {(resolvedTileSize / 1000).toFixed(3)} m × {(resolvedTileSize / 1000).toFixed(3)} m
            </p>
          )}

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='grout-width'>Grout Width (mm)</Label>
            <Input
              id='grout-width'
              type='number'
              step='0.5'
              min='0'
              max='20'
              value={groutWidth}
              onChange={(e) => setGroutWidth(e.target.value)}
              aria-invalid={!!errors.groutWidth}
              placeholder='e.g. 3'
            />
            {errors.groutWidth && (
              <span className='text-[12px] text-destructive'>{errors.groutWidth}</span>
            )}
          </div>
        </section>

        <Button
          variant='default'
          size='default'
          className='w-full'
          onClick={handleCalculate}
        >
          Calculate Tiles
        </Button>
      </CardContent>
    </Card>
  )
}
