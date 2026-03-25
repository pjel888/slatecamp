'use client'

import { useState, useCallback } from 'react'
import { Plus, X } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SurveyLine, LotPlotterResult } from '@/types/tools'

interface LotPlotterFormProps {
  onCalculate: (results: LotPlotterResult) => void
}

const makeLine = (): SurveyLine => ({
  id: crypto.randomUUID(),
  bearing: { from: 'N', degrees: 0, minutes: 0, to: 'E' },
  distance: 0,
})

const DEFAULT_LINES: SurveyLine[] = [makeLine(), makeLine(), makeLine()]

interface ValidationError {
  [lineId: string]: Partial<{
    degrees: string
    minutes: string
    distance: string
  }>
}

const bearingToAngle = (from: 'N' | 'S', degrees: number, minutes: number, to: 'E' | 'W'): number => {
  const decimalDeg = degrees + minutes / 60
  if (from === 'N' && to === 'E') return 90 - decimalDeg
  if (from === 'N' && to === 'W') return 90 + decimalDeg
  if (from === 'S' && to === 'E') return 270 + decimalDeg
  // S W
  return 270 - decimalDeg
}

const computeResults = (lines: SurveyLine[]): LotPlotterResult => {
  const coords: { x: number; y: number }[] = [{ x: 0, y: 0 }]
  let perimeter = 0

  for (const line of lines) {
    const { from, degrees, minutes, to } = line.bearing
    const angle = bearingToAngle(from, degrees, minutes, to)
    const rad = angle * (Math.PI / 180)
    const prev = coords[coords.length - 1]
    coords.push({
      x: prev.x + line.distance * Math.cos(rad),
      y: prev.y + line.distance * Math.sin(rad),
    })
    perimeter += line.distance
  }

  // Shoelace formula for area
  const n = coords.length
  let areaSum = 0
  for (let i = 0; i < n - 1; i++) {
    areaSum += coords[i].x * coords[i + 1].y - coords[i + 1].x * coords[i].y
  }
  const totalArea = Math.abs(areaSum) / 2

  // Closure check: distance from last point back to origin
  const last = coords[coords.length - 1]
  const closureGap = Math.sqrt(last.x * last.x + last.y * last.y)
  const isClosed = closureGap < 0.5

  return { coordinates: coords, totalArea, perimeter, isClosed }
}

const validateLines = (lines: SurveyLine[]): ValidationError => {
  const errors: ValidationError = {}
  for (const line of lines) {
    const lineErrors: ValidationError[string] = {}
    if (line.bearing.degrees < 0 || line.bearing.degrees > 90 || !Number.isInteger(line.bearing.degrees)) {
      lineErrors.degrees = 'Must be 0–90'
    }
    if (line.bearing.minutes < 0 || line.bearing.minutes > 59 || !Number.isInteger(line.bearing.minutes)) {
      lineErrors.minutes = 'Must be 0–59'
    }
    if (line.distance <= 0) {
      lineErrors.distance = 'Required'
    }
    if (Object.keys(lineErrors).length > 0) {
      errors[line.id] = lineErrors
    }
  }
  return errors
}

export const LotPlotterForm = ({ onCalculate }: LotPlotterFormProps) => {
  const [lines, setLines] = useState<SurveyLine[]>(DEFAULT_LINES)
  const [errors, setErrors] = useState<ValidationError>({})
  const [closureInfo, setClosureInfo] = useState<{ isClosed: boolean; gap: number } | null>(null)

  const updateLine = useCallback((id: string, patch: Partial<Omit<SurveyLine, 'id'>>) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }, [])

  const updateBearing = useCallback((id: string, bearingPatch: Partial<SurveyLine['bearing']>) => {
    setLines(prev =>
      prev.map(l => l.id === id ? { ...l, bearing: { ...l.bearing, ...bearingPatch } } : l)
    )
  }, [])

  const addLine = useCallback(() => {
    setLines(prev => [...prev, makeLine()])
  }, [])

  const removeLine = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id))
  }, [])

  const handlePlot = useCallback(() => {
    const validationErrors = validateLines(lines)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    const results = computeResults(lines)
    const last = results.coordinates[results.coordinates.length - 1]
    const gap = Math.sqrt(last.x * last.x + last.y * last.y)
    setClosureInfo({ isClosed: results.isClosed, gap })
    onCalculate(results)
  }, [lines, onCalculate])

  return (
    <div className='flex flex-col gap-4'>
      {/* Line table */}
      <div className='rounded-md border border-border overflow-hidden'>
        {/* Column headers */}
        <div className='hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_1fr_1.5fr_auto] gap-2 items-center px-3 py-2 bg-muted/40 border-b border-border'>
          <span className='text-[11px] text-muted-foreground w-6'>#</span>
          <span className='text-[11px] text-muted-foreground'>Dir</span>
          <span className='text-[11px] text-muted-foreground'>Deg</span>
          <span className='text-[11px] text-muted-foreground'>Min</span>
          <span className='text-[11px] text-muted-foreground'>Dir</span>
          <span className='text-[11px] text-muted-foreground'>Distance (m)</span>
          <span className='w-6' />
        </div>

        {/* Scrollable rows */}
        <div className='max-h-[420px] overflow-y-auto'>
          {lines.map((line, index) => {
            const lineErrors = errors[line.id]
            return (
              <div
                key={line.id}
                className={cn(
                  'px-3 py-2.5',
                  index < lines.length - 1 && 'border-b border-border',
                )}
              >
                {/* Mobile label row */}
                <div className='flex items-center justify-between mb-2 sm:hidden'>
                  <span className='text-[12px] font-medium text-muted-foreground'>
                    Line {index + 1}
                  </span>
                  {lines.length > 2 && (
                    <button
                      type='button'
                      onClick={() => removeLine(line.id)}
                      className='flex items-center justify-center size-6 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150'
                      aria-label={`Remove line ${index + 1}`}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Mobile: bearing row */}
                <div className='flex items-center gap-2 sm:hidden mb-2'>
                  {/* FROM toggle */}
                  <div className='flex rounded-sm border border-border overflow-hidden shrink-0'>
                    {(['N', 'S'] as const).map(dir => (
                      <button
                        key={dir}
                        type='button'
                        onClick={() => updateBearing(line.id, { from: dir })}
                        className={cn(
                          'px-2.5 h-8 text-[12px] font-medium transition-colors duration-150',
                          line.bearing.from === dir
                            ? 'bg-primary text-white'
                            : 'bg-background text-muted-foreground hover:bg-muted',
                        )}
                        aria-pressed={line.bearing.from === dir}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>

                  {/* Degrees */}
                  <div className='flex flex-col gap-0.5 flex-1'>
                    <span className='text-[11px] text-muted-foreground sm:hidden'>Degrees</span>
                    <Input
                      type='number'
                      min={0}
                      max={90}
                      step={1}
                      value={line.bearing.degrees || ''}
                      placeholder='0'
                      aria-invalid={!!lineErrors?.degrees}
                      onChange={e => updateBearing(line.id, { degrees: Math.floor(Number(e.target.value)) })}
                      className='w-full'
                    />
                  </div>

                  {/* Minutes */}
                  <div className='flex flex-col gap-0.5 flex-1'>
                    <span className='text-[11px] text-muted-foreground sm:hidden'>Minutes</span>
                    <Input
                      type='number'
                      min={0}
                      max={59}
                      step={1}
                      value={line.bearing.minutes || ''}
                      placeholder='0'
                      aria-invalid={!!lineErrors?.minutes}
                      onChange={e => updateBearing(line.id, { minutes: Math.floor(Number(e.target.value)) })}
                      className='w-full'
                    />
                  </div>

                  {/* TO toggle */}
                  <div className='flex rounded-sm border border-border overflow-hidden shrink-0'>
                    {(['E', 'W'] as const).map(dir => (
                      <button
                        key={dir}
                        type='button'
                        onClick={() => updateBearing(line.id, { to: dir })}
                        className={cn(
                          'px-2.5 h-8 text-[12px] font-medium transition-colors duration-150',
                          line.bearing.to === dir
                            ? 'bg-primary text-white'
                            : 'bg-background text-muted-foreground hover:bg-muted',
                        )}
                        aria-pressed={line.bearing.to === dir}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile: distance row */}
                <div className='flex items-center gap-2 sm:hidden'>
                  <div className='flex flex-col gap-0.5 flex-1'>
                    <span className='text-[11px] text-muted-foreground'>Distance (m)</span>
                    <Input
                      type='number'
                      min={0.01}
                      step={0.01}
                      value={line.distance || ''}
                      placeholder='0.00'
                      aria-invalid={!!lineErrors?.distance}
                      onChange={e => updateLine(line.id, { distance: Number(e.target.value) })}
                      className='w-full'
                    />
                  </div>
                  {lineErrors?.distance && (
                    <span className='text-[11px] text-destructive mt-3'>{lineErrors.distance}</span>
                  )}
                </div>

                {/* Desktop: single row */}
                <div className='hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_1fr_1.5fr_auto] gap-2 items-center'>
                  {/* Line number */}
                  <span className='text-[12px] font-medium text-muted-foreground w-6 text-center'>
                    {index + 1}
                  </span>

                  {/* FROM toggle */}
                  <div className='flex rounded-sm border border-border overflow-hidden'>
                    {(['N', 'S'] as const).map(dir => (
                      <button
                        key={dir}
                        type='button'
                        onClick={() => updateBearing(line.id, { from: dir })}
                        className={cn(
                          'flex-1 h-8 text-[12px] font-medium transition-colors duration-150',
                          line.bearing.from === dir
                            ? 'bg-primary text-white'
                            : 'bg-background text-muted-foreground hover:bg-muted',
                        )}
                        aria-pressed={line.bearing.from === dir}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>

                  {/* Degrees */}
                  <div>
                    <Input
                      type='number'
                      min={0}
                      max={90}
                      step={1}
                      value={line.bearing.degrees || ''}
                      placeholder='0'
                      aria-invalid={!!lineErrors?.degrees}
                      onChange={e => updateBearing(line.id, { degrees: Math.floor(Number(e.target.value)) })}
                    />
                    {lineErrors?.degrees && (
                      <p className='text-[11px] text-destructive mt-0.5'>{lineErrors.degrees}</p>
                    )}
                  </div>

                  {/* Minutes */}
                  <div>
                    <Input
                      type='number'
                      min={0}
                      max={59}
                      step={1}
                      value={line.bearing.minutes || ''}
                      placeholder='0'
                      aria-invalid={!!lineErrors?.minutes}
                      onChange={e => updateBearing(line.id, { minutes: Math.floor(Number(e.target.value)) })}
                    />
                    {lineErrors?.minutes && (
                      <p className='text-[11px] text-destructive mt-0.5'>{lineErrors.minutes}</p>
                    )}
                  </div>

                  {/* TO toggle */}
                  <div className='flex rounded-sm border border-border overflow-hidden'>
                    {(['E', 'W'] as const).map(dir => (
                      <button
                        key={dir}
                        type='button'
                        onClick={() => updateBearing(line.id, { to: dir })}
                        className={cn(
                          'flex-1 h-8 text-[12px] font-medium transition-colors duration-150',
                          line.bearing.to === dir
                            ? 'bg-primary text-white'
                            : 'bg-background text-muted-foreground hover:bg-muted',
                        )}
                        aria-pressed={line.bearing.to === dir}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>

                  {/* Distance */}
                  <div>
                    <Input
                      type='number'
                      min={0.01}
                      step={0.01}
                      value={line.distance || ''}
                      placeholder='0.00'
                      aria-invalid={!!lineErrors?.distance}
                      onChange={e => updateLine(line.id, { distance: Number(e.target.value) })}
                    />
                    {lineErrors?.distance && (
                      <p className='text-[11px] text-destructive mt-0.5'>{lineErrors.distance}</p>
                    )}
                  </div>

                  {/* Remove */}
                  <div className='w-6 flex justify-center'>
                    {lines.length > 2 && (
                      <button
                        type='button'
                        onClick={() => removeLine(line.id)}
                        className='flex items-center justify-center size-6 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150'
                        aria-label={`Remove line ${index + 1}`}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls row */}
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='default'
          onClick={addLine}
          className='gap-1.5'
        >
          <Plus size={14} />
          Add Line
        </Button>

        <Button
          variant='default'
          size='default'
          onClick={handlePlot}
          className='ml-auto'
        >
          Plot Boundary
        </Button>
      </div>

      {/* Closure status */}
      {closureInfo !== null && (
        <div
          className={cn(
            'rounded-sm border px-3 py-2 text-[13px] font-medium',
            closureInfo.isClosed
              ? 'border-emerald/30 bg-emerald/5 text-emerald'
              : 'border-destructive/30 bg-destructive/5 text-destructive',
          )}
        >
          {closureInfo.isClosed
            ? 'Lot closes \u2713'
            : `Lot does not close \u2014 ${closureInfo.gap.toFixed(3)}m gap`}
        </div>
      )}
    </div>
  )
}
