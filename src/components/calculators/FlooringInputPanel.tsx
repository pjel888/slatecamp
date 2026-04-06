'use client'

import { useFlooringStore } from '@/app/calculators/_stores/flooringStore'
import type { TilePattern } from '@/app/calculators/_lib/flooring-engine'
import { Lock, X } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

// ─── Tile Presets ────────────────────────────────────────────────────────────

const TILE_PRESETS = [
  { label: '20x20', length: 200, width: 200 },
  { label: '30x30', length: 300, width: 300 },
  { label: '40x40', length: 400, width: 400 },
  { label: '60x60', length: 600, width: 600 },
  { label: '30x60', length: 300, width: 600 },
  { label: '80x80', length: 800, width: 800 },
] as const

const PATTERNS: { value: TilePattern; label: string; icon: React.ReactNode }[] = [
  {
    value: 'straight',
    label: 'Straight',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="17" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="17" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="17" y="17" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'brick',
    label: 'Brick',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="17" y="1" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="12" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="23" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="17" y="23" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'diagonal',
    label: 'Diagonal',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="30" height="30" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="1" y1="16" x2="16" y2="1" stroke="currentColor" strokeWidth="1" />
        <line x1="1" y1="31" x2="31" y2="1" stroke="currentColor" strokeWidth="1" />
        <line x1="16" y1="31" x2="31" y2="16" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    value: 'herringbone-lite',
    label: 'Herringbone',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 1v14h8V1M20 1v14h8V1M4 17v14h8V17M20 17v14h8V17" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8h8M12 24h8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

// ─── Shared Input Components ─────────────────────────────────────────────────

function GroupSeparator({ label }: { label: string }) {
  return (
    <div className="mt-5 mb-3">
      <div className="h-px bg-border" />
      <p className="mt-3 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string
  unit: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mt-2">
      <label className="font-sans text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type="number"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-10 w-full rounded-sm border border-border bg-background px-3 pr-14 font-mono text-sm tabular-nums text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  )
}

// ─── FlooringInputPanel ──────────────────────────────────────────────────────

export function FlooringInputPanel() {
  const roomMode = useFlooringStore((s) => s.roomMode)
  const roomLengthMm = useFlooringStore((s) => s.roomLengthMm)
  const roomWidthMm = useFlooringStore((s) => s.roomWidthMm)
  const tileLengthMm = useFlooringStore((s) => s.tileLengthMm)
  const tileWidthMm = useFlooringStore((s) => s.tileWidthMm)
  const groutJointMm = useFlooringStore((s) => s.groutJointMm)
  const pattern = useFlooringStore((s) => s.pattern)
  const orientationDeg = useFlooringStore((s) => s.orientationDeg)
  const wastePercent = useFlooringStore((s) => s.wastePercent)
  const includeSparePercent = useFlooringStore((s) => s.includeSparePercent)
  const boxCoverageSqm = useFlooringStore((s) => s.boxCoverageSqm)
  const exclusions = useFlooringStore((s) => s.exclusions)
  const setInput = useFlooringStore((s) => s.setInput)
  const addExclusion = useFlooringStore((s) => s.addExclusion)
  const removeExclusion = useFlooringStore((s) => s.removeExclusion)

  const isPresetActive = (preset: (typeof TILE_PRESETS)[number]) =>
    tileLengthMm === preset.length && tileWidthMm === preset.width

  return (
    <div>
      {/* Room Mode Toggle */}
      <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        Room mode
      </p>
      <div className="mt-1.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => setInput('roomMode', 'rectangle')}
          className={cn(
            'flex-1 rounded-sm py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors duration-150',
            roomMode === 'rectangle'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:bg-muted',
          )}
        >
          Rectangle
        </button>
        <button
          type="button"
          disabled
          className="flex-1 rounded-sm py-1.5 font-mono text-[10px] uppercase tracking-wider border border-border text-muted-foreground opacity-60 cursor-not-allowed flex items-center justify-center gap-1"
        >
          <Lock size={10} weight="bold" />
          L-Shape
          <span className="text-[8px] font-bold bg-muted px-1 rounded">Pro</span>
        </button>
      </div>

      {/* Room Dimensions */}
      <GroupSeparator label="Room dimensions" />
      <NumberField
        label="Room length"
        unit="mm"
        value={roomLengthMm}
        onChange={(v) => setInput('roomLengthMm', v)}
      />
      <NumberField
        label="Room width"
        unit="mm"
        value={roomWidthMm}
        onChange={(v) => setInput('roomWidthMm', v)}
      />

      {/* Exclusions */}
      <GroupSeparator label="Exclusions" />
      {exclusions.map((excl) => (
        <div key={excl.id} className="mt-2 flex items-end gap-1">
          <div className="flex-1">
            <label className="font-sans text-[10px] font-medium text-muted-foreground">X</label>
            <input
              type="number"
              inputMode="decimal"
              value={excl.xMm || ''}
              onChange={(e) => {
                const updated = exclusions.map((ex) =>
                  ex.id === excl.id ? { ...ex, xMm: Number(e.target.value) || 0 } : ex,
                )
                setInput('exclusions', updated)
              }}
              className="h-8 w-full rounded-sm border border-border bg-background px-1.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="font-sans text-[10px] font-medium text-muted-foreground">Y</label>
            <input
              type="number"
              inputMode="decimal"
              value={excl.yMm || ''}
              onChange={(e) => {
                const updated = exclusions.map((ex) =>
                  ex.id === excl.id ? { ...ex, yMm: Number(e.target.value) || 0 } : ex,
                )
                setInput('exclusions', updated)
              }}
              className="h-8 w-full rounded-sm border border-border bg-background px-1.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="font-sans text-[10px] font-medium text-muted-foreground">W</label>
            <input
              type="number"
              inputMode="decimal"
              value={excl.widthMm || ''}
              onChange={(e) => {
                const updated = exclusions.map((ex) =>
                  ex.id === excl.id ? { ...ex, widthMm: Number(e.target.value) || 0 } : ex,
                )
                setInput('exclusions', updated)
              }}
              className="h-8 w-full rounded-sm border border-border bg-background px-1.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="font-sans text-[10px] font-medium text-muted-foreground">H</label>
            <input
              type="number"
              inputMode="decimal"
              value={excl.heightMm || ''}
              onChange={(e) => {
                const updated = exclusions.map((ex) =>
                  ex.id === excl.id ? { ...ex, heightMm: Number(e.target.value) || 0 } : ex,
                )
                setInput('exclusions', updated)
              }}
              className="h-8 w-full rounded-sm border border-border bg-background px-1.5 font-mono text-xs tabular-nums text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => removeExclusion(excl.id)}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors duration-150 hover:border-destructive hover:text-destructive"
          >
            <X size={12} weight="bold" />
          </button>
        </div>
      ))}
      {exclusions.length >= 2 ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Upgrade to Pro for more exclusions
        </p>
      ) : (
        <button
          type="button"
          onClick={() =>
            addExclusion({
              id: `excl-${Date.now()}`,
              xMm: 0,
              yMm: 0,
              widthMm: 500,
              heightMm: 500,
            })
          }
          className="mt-2 rounded-sm border border-dashed border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors duration-150 hover:border-primary/50 hover:text-foreground"
        >
          + Add Exclusion
        </button>
      )}

      {/* Tile Configuration */}
      <GroupSeparator label="Tile configuration" />

      <p className="mt-2 font-sans text-xs font-medium text-foreground">
        PH tile presets
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {TILE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setInput('tileLengthMm', preset.length)
              setInput('tileWidthMm', preset.width)
            }}
            className={`rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-150 ${
              isPresetActive(preset)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <NumberField
        label="Custom tile length"
        unit="mm"
        value={tileLengthMm}
        onChange={(v) => setInput('tileLengthMm', v)}
      />
      <NumberField
        label="Custom tile width"
        unit="mm"
        value={tileWidthMm}
        onChange={(v) => setInput('tileWidthMm', v)}
      />
      <NumberField
        label="Grout joint"
        unit="mm"
        value={groutJointMm}
        onChange={(v) => setInput('groutJointMm', v)}
      />

      {/* Pattern & Waste */}
      <GroupSeparator label="Pattern & waste" />

      <p className="mt-2 font-sans text-xs font-medium text-foreground">
        Pattern
      </p>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        {PATTERNS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setInput('pattern', p.value)}
            className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-colors duration-150 ${
              pattern === p.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {p.icon}
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground">
              {p.label}
            </span>
          </button>
        ))}
      </div>

      {/* Orientation */}
      <p className="mt-3 font-sans text-xs font-medium text-foreground">
        Orientation
      </p>
      <div className="mt-1.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => setInput('orientationDeg', 0)}
          className={cn(
            'flex-1 rounded-sm py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors duration-150',
            orientationDeg === 0
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:bg-muted',
          )}
        >
          0°
        </button>
        <button
          type="button"
          onClick={() => setInput('orientationDeg', 90)}
          className={cn(
            'flex-1 rounded-sm py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors duration-150',
            orientationDeg === 90
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:bg-muted',
          )}
        >
          90°
        </button>
      </div>

      <NumberField
        label="Waste"
        unit="%"
        value={wastePercent}
        onChange={(v) => setInput('wastePercent', v)}
      />
      <NumberField
        label="Spare"
        unit="%"
        value={includeSparePercent}
        onChange={(v) => setInput('includeSparePercent', v)}
      />

      {/* Procurement */}
      <GroupSeparator label="Procurement" />

      <NumberField
        label="Box coverage"
        unit="sq.m."
        value={boxCoverageSqm ?? 0}
        onChange={(v) => setInput('boxCoverageSqm', v > 0 ? v : null)}
      />
    </div>
  )
}
