'use client'

import { useState } from 'react'
import {
  calculate,
  DEFAULT_INPUTS,
  OCCUPANCY_TYPES,
  type SiteInputs,
  type CalculatedOutputs,
  type OccupancyKey,
} from '@/lib/area-c-calculations'

// ─── Token constants ────────────────────────────────────────────────────────
const COBALT = 'var(--primary)'
const EMERALD = 'var(--success)'
const WARM_RED = 'var(--destructive)'
const EMERALD_50 = 'var(--success-50)'
const RED_50 = 'var(--destructive-50)'
const SURFACE_LIGHT = 'var(--background)'
const INK_PRIMARY = 'var(--foreground)'
const INK_SECONDARY = 'var(--text-secondary, var(--muted-foreground))'
const INK_TERTIARY = 'var(--muted-foreground)'
const BORDER = 'var(--border)'

// ─── Sub-components ─────────────────────────────────────────────────────────

interface LabeledInputProps {
  label: string
  id: string
  type?: 'number' | 'text'
  value: string | number
  onChange: (val: string) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  hint?: string
}

const LabeledInput = ({
  label,
  id,
  type = 'number',
  value,
  onChange,
  min,
  max,
  step,
  unit,
  hint,
}: LabeledInputProps) => (
  <div className='flex flex-col gap-1'>
    <label
      htmlFor={id}
      className='text-sm font-medium'
      style={{ color: INK_PRIMARY }}
    >
      {label}
      {unit && (
        <span className='ml-1 font-normal text-xs' style={{ color: INK_TERTIARY }}>
          ({unit})
        </span>
      )}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      className='h-9 w-full px-3 text-sm bg-card focus:outline-none focus:ring-2 transition-shadow duration-150'
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        color: INK_PRIMARY,
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onFocus={(e: any) => { e.target.style.borderColor = COBALT }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onBlur={(e: any) => { e.target.style.borderColor = BORDER }}
    />
    {hint && (
      <span className='text-xs' style={{ color: INK_TERTIARY }}>{hint}</span>
    )}
  </div>
)

interface SelectInputProps {
  label: string
  id: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
}

const SelectInput = ({ label, id, value, onChange, options }: SelectInputProps) => (
  <div className='flex flex-col gap-1'>
    <label htmlFor={id} className='text-sm font-medium' style={{ color: INK_PRIMARY }}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='h-9 w-full px-3 text-sm bg-card focus:outline-none transition-shadow duration-150 appearance-none'
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        color: INK_PRIMARY,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)

interface CheckboxInputProps {
  label: string
  id: string
  checked: boolean
  onChange: (val: boolean) => void
  description?: string
}

const CheckboxInput = ({ label, id, checked, onChange, description }: CheckboxInputProps) => (
  <label htmlFor={id} className='flex items-start gap-3 cursor-pointer'>
    <input
      id={id}
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className='mt-0.5 h-4 w-4 shrink-0 cursor-pointer'
      style={{ accentColor: COBALT }}
    />
    <span className='flex flex-col gap-0.5'>
      <span className='text-sm font-medium' style={{ color: INK_PRIMARY }}>{label}</span>
      {description && (
        <span className='text-xs' style={{ color: INK_TERTIARY }}>{description}</span>
      )}
    </span>
  </label>
)

interface ResultCardProps {
  label: string
  value: string
  unit: string
  codeRef: string
  status?: 'ok' | 'warn' | 'neutral'
}

const ResultCard = ({ label, value, unit, codeRef, status = 'neutral' }: ResultCardProps) => {
  const valueColor =
    status === 'ok' ? EMERALD :
    status === 'warn' ? WARM_RED :
    INK_PRIMARY

  const bg = status === 'ok' ? EMERALD_50 : status === 'warn' ? RED_50 : 'var(--card)'

  return (
    <div
      className='flex flex-col gap-1 p-3'
      style={{
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
        background: bg,
      }}
    >
      <span className='text-xs font-medium uppercase tracking-wide' style={{ color: INK_TERTIARY }}>
        {label}
      </span>
      <div className='flex items-baseline gap-1'>
        <span className='text-2xl font-semibold tabular-nums' style={{ color: valueColor }}>
          {value}
        </span>
        <span className='text-xs' style={{ color: INK_SECONDARY }}>{unit}</span>
      </div>
      <span className='text-[10px] leading-tight' style={{ color: INK_TERTIARY }}>
        {codeRef}
      </span>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

const occupancyOptions = Object.entries(OCCUPANCY_TYPES).map(([key, cfg]) => ({
  value: key,
  label: cfg.label,
}))

const buildingTypeOptions: { value: SiteInputs['buildingType']; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'industrial', label: 'Industrial' },
]

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('en-PH', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-PH')

export const DevControlsCalculator = () => {
  const [inputs, setInputs] = useState<SiteInputs>(DEFAULT_INPUTS)

  const set = <K extends keyof SiteInputs>(key: K, value: SiteInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }))

  const setNum = (key: keyof SiteInputs, raw: string, fallback = 0) => {
    const parsed = parseFloat(raw)
    set(key, (isNaN(parsed) ? fallback : parsed) as SiteInputs[typeof key])
  }

  const results: CalculatedOutputs = calculate(inputs)

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* ── Input form ─────────────────────────────────────────────────── */}
      <section
        className='rounded-md p-4 sm:p-6'
        style={{ background: SURFACE_LIGHT, border: `1px solid ${BORDER}` }}
      >
        <h2 className='text-base font-semibold mb-4' style={{ color: INK_PRIMARY }}>
          Site Parameters
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <LabeledInput
            id='lotArea'
            label='Lot Area'
            value={inputs.lotArea}
            onChange={(v) => setNum('lotArea', v)}
            min={1}
            step={1}
            unit='sqm'
          />
          <LabeledInput
            id='lotCoverage'
            label='Lot Coverage'
            value={inputs.lotCoverage}
            onChange={(v) => setNum('lotCoverage', v)}
            min={1}
            max={100}
            step={1}
            unit='%'
            hint='Typically 50–70% per PD 1096'
          />
          <LabeledInput
            id='floorAreaRatio'
            label='Floor Area Ratio (FAR)'
            value={inputs.floorAreaRatio}
            onChange={(v) => setNum('floorAreaRatio', v)}
            min={0.1}
            step={0.1}
            hint='Check local zoning ordinance'
          />
          <LabeledInput
            id='buildingHeight'
            label='Building Height'
            value={inputs.buildingHeight}
            onChange={(v) => setNum('buildingHeight', v)}
            min={0}
            step={0.5}
            unit='m'
          />
          <LabeledInput
            id='numberOfFloors'
            label='Number of Floors'
            value={inputs.numberOfFloors}
            onChange={(v) => setNum('numberOfFloors', v, 1)}
            min={1}
            step={1}
          />
          <SelectInput
            id='buildingType'
            label='Building Type'
            value={inputs.buildingType}
            onChange={(v) => set('buildingType', v as SiteInputs['buildingType'])}
            options={buildingTypeOptions}
          />
          <div className='sm:col-span-2 lg:col-span-1'>
            <SelectInput
              id='occupancyType'
              label='Occupancy Group'
              value={inputs.occupancyType}
              onChange={(v) => set('occupancyType', v as OccupancyKey)}
              options={occupancyOptions}
            />
          </div>
        </div>

        <div className='mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4' style={{ borderTop: `1px solid ${BORDER}` }}>
          <CheckboxInput
            id='isSprinklered'
            label='Sprinklered building'
            description='RA 9514 — allows +50% travel distance'
            checked={inputs.isSprinklered}
            onChange={(v) => set('isSprinklered', v)}
          />
          <CheckboxInput
            id='isAccessible'
            label='BP 344 accessibility applies'
            description='Requires accessible parking slots'
            checked={inputs.isAccessible}
            onChange={(v) => set('isAccessible', v)}
          />
          <CheckboxInput
            id='parkingRequired'
            label='Parking required'
            description='PD 1096 Rule XIX'
            checked={inputs.parkingRequired}
            onChange={(v) => set('parkingRequired', v)}
          />
        </div>
      </section>

      {/* ── Results grid ───────────────────────────────────────────────── */}
      <section>
        <h2 className='text-base font-semibold mb-3' style={{ color: INK_PRIMARY }}>
          Development Controls
        </h2>

        {/* Area calculations */}
        <div className='mb-2'>
          <p className='text-xs font-medium uppercase tracking-wide mb-2' style={{ color: INK_TERTIARY }}>
            Design Calculations
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
            <ResultCard
              label='PSO'
              value={fmt(results.pso, 1)}
              unit='%'
              codeRef={results.codeRefs.pso}
              status={results.pso <= inputs.lotCoverage ? 'ok' : 'warn'}
            />
            <ResultCard
              label='AMBF'
              value={fmt(results.ambf)}
              unit='sqm'
              codeRef={results.codeRefs.ambf}
              status='neutral'
            />
            <ResultCard
              label='TGFA'
              value={fmt(results.tgfa)}
              unit='sqm'
              codeRef={results.codeRefs.tgfa}
              status='neutral'
            />
          </div>
        </div>

        {/* Occupancy & egress */}
        <div className='mb-2'>
          <p className='text-xs font-medium uppercase tracking-wide mb-2 mt-4' style={{ color: INK_TERTIARY }}>
            Occupancy &amp; Egress
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
            <ResultCard
              label='Occupant Load'
              value={fmtInt(results.occupantLoad)}
              unit='persons'
              codeRef={results.codeRefs.occupantLoad}
              status='neutral'
            />
            <ResultCard
              label='Max Travel Distance'
              value={fmt(results.travelDistance, 0)}
              unit='m'
              codeRef={results.codeRefs.travelDistance}
              status='ok'
            />
            <ResultCard
              label='Exit Width Required'
              value={fmt(results.exitWidthRequired)}
              unit='m'
              codeRef={results.codeRefs.exitWidthRequired}
              status='neutral'
            />
          </div>
        </div>

        {/* Parking */}
        {inputs.parkingRequired && (
          <div className='mb-2'>
            <p className='text-xs font-medium uppercase tracking-wide mb-2 mt-4' style={{ color: INK_TERTIARY }}>
              Parking
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              <ResultCard
                label='Required Parking'
                value={fmtInt(results.requiredParking)}
                unit='slots'
                codeRef={results.codeRefs.requiredParking}
                status='neutral'
              />
              {inputs.isAccessible && (
                <ResultCard
                  label='Accessible Parking'
                  value={fmtInt(results.accessibleParking)}
                  unit='slots'
                  codeRef={results.codeRefs.accessibleParking}
                  status='neutral'
                />
              )}
            </div>
          </div>
        )}

        {/* Setbacks */}
        <div>
          <p className='text-xs font-medium uppercase tracking-wide mb-2 mt-4' style={{ color: INK_TERTIARY }}>
            Minimum Setbacks
          </p>
          <div className='grid grid-cols-3 gap-2'>
            <ResultCard
              label='Front'
              value={fmt(results.setbacks.front, 1)}
              unit='m'
              codeRef={results.codeRefs.setbacks}
              status='neutral'
            />
            <ResultCard
              label='Rear'
              value={fmt(results.setbacks.rear, 1)}
              unit='m'
              codeRef={results.codeRefs.setbacks}
              status='neutral'
            />
            <ResultCard
              label='Side'
              value={fmt(results.setbacks.side, 1)}
              unit='m'
              codeRef={results.codeRefs.setbacks}
              status='neutral'
            />
          </div>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────────── */}
      <p className='text-xs leading-relaxed' style={{ color: INK_TERTIARY }}>
        Results are reference values based on PD 1096, BP 344, and RA 9514 defaults.
        Always verify against current local zoning ordinances and consult a licensed
        professional for design submissions.
      </p>
    </div>
  )
}
