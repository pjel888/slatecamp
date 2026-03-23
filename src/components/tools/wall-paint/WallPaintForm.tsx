'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { WallPaintInput, WallPaintResult } from '@/types/tools'

const DOOR_AREA = 0.90 * 2.10   // 1.89 m²
const WINDOW_AREA = 1.20 * 1.20  // 1.44 m²

const DEFAULT_STATE: WallPaintInput = {
  wallHeight: 3,
  wallWidth: 4,
  doorCount: 1,
  windowCount: 1,
  coats: 2,
  coverageRate: 12,
}

interface WallPaintFormProps {
  onCalculate: (results: WallPaintResult) => void
}

export const WallPaintForm = ({ onCalculate }: WallPaintFormProps) => {
  const [form, setForm] = useState<WallPaintInput>(DEFAULT_STATE)
  const [errors, setErrors] = useState<Partial<Record<keyof WallPaintInput, string>>>({})

  const setField = <K extends keyof WallPaintInput>(key: K, value: WallPaintInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof WallPaintInput, string>> = {}
    if (!form.wallHeight || form.wallHeight <= 0) next.wallHeight = 'Height must be greater than 0'
    if (!form.wallWidth || form.wallWidth <= 0) next.wallWidth = 'Width must be greater than 0'
    if (!form.coverageRate || form.coverageRate <= 0) next.coverageRate = 'Coverage rate must be greater than 0'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleCalculate = () => {
    if (!validate()) return

    const grossArea = form.wallHeight * form.wallWidth
    const openingsArea = (form.doorCount * DOOR_AREA) + (form.windowCount * WINDOW_AREA)
    const netPaintableArea = Math.max(0, grossArea - openingsArea)
    const litersNeeded = Math.ceil((netPaintableArea * form.coats) / form.coverageRate)

    onCalculate({ grossArea, openingsArea, netPaintableArea, litersNeeded })
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Wall Dimensions */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-[13px] font-semibold text-foreground uppercase tracking-wide'>
          Wall Dimensions
        </h2>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='wall-height' className='text-[13px] text-text-secondary'>
            Wall Height (m)
          </Label>
          <Input
            id='wall-height'
            type='number'
            step={0.01}
            min={0.1}
            max={20}
            value={form.wallHeight}
            onChange={(e) => setField('wallHeight', parseFloat(e.target.value) || 0)}
            aria-invalid={!!errors.wallHeight}
          />
          {errors.wallHeight && (
            <span className='text-destructive text-[12px]'>{errors.wallHeight}</span>
          )}
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='wall-width' className='text-[13px] text-text-secondary'>
            Wall Width (m)
          </Label>
          <Input
            id='wall-width'
            type='number'
            step={0.01}
            min={0.1}
            max={100}
            value={form.wallWidth}
            onChange={(e) => setField('wallWidth', parseFloat(e.target.value) || 0)}
            aria-invalid={!!errors.wallWidth}
          />
          {errors.wallWidth && (
            <span className='text-destructive text-[12px]'>{errors.wallWidth}</span>
          )}
        </div>
      </section>

      {/* Openings */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-[13px] font-semibold text-foreground uppercase tracking-wide'>
          Openings
        </h2>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='door-count' className='text-[13px] text-text-secondary'>
            Number of Doors
          </Label>
          <Input
            id='door-count'
            type='number'
            step={1}
            min={0}
            max={20}
            value={form.doorCount}
            onChange={(e) => setField('doorCount', parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='window-count' className='text-[13px] text-text-secondary'>
            Number of Windows
          </Label>
          <Input
            id='window-count'
            type='number'
            step={1}
            min={0}
            max={20}
            value={form.windowCount}
            onChange={(e) => setField('windowCount', parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <p className='text-muted-foreground text-[12px]'>
          Standard door: 0.90 × 2.10 m · Standard window: 1.20 × 1.20 m
        </p>
      </section>

      {/* Paint Settings */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-[13px] font-semibold text-foreground uppercase tracking-wide'>
          Paint Settings
        </h2>

        <div className='flex flex-col gap-1.5'>
          <Label className='text-[13px] text-text-secondary'>Number of Coats</Label>
          <div className='flex gap-2'>
            {([1, 2, 3] as const).map((coat) => (
              <Button
                key={coat}
                variant='outline'
                size='default'
                onClick={() => setField('coats', coat)}
                className={cn(
                  'flex-1',
                  form.coats === coat && 'bg-primary text-white border-primary hover:brightness-90 hover:bg-primary',
                )}
              >
                {coat}
              </Button>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='coverage-rate' className='text-[13px] text-text-secondary'>
            Coverage Rate (m²/L)
          </Label>
          <Input
            id='coverage-rate'
            type='number'
            step={0.1}
            min={1}
            max={30}
            value={form.coverageRate}
            onChange={(e) => setField('coverageRate', parseFloat(e.target.value) || 0)}
            aria-invalid={!!errors.coverageRate}
          />
          <span className='text-muted-foreground text-[12px]'>(typical: 10–14 m²/L)</span>
          {errors.coverageRate && (
            <span className='text-destructive text-[12px]'>{errors.coverageRate}</span>
          )}
        </div>
      </section>

      <Button variant='default' size='default' onClick={handleCalculate} className='w-full'>
        Calculate Paint
      </Button>
    </div>
  )
}
