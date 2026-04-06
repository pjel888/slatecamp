'use client'

import { usePaintStore } from '@/app/calculators/_stores/paintStore'

// ─── Shared input helpers ────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-xs text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-20 rounded-sm border border-border bg-background px-2 py-1 text-right font-mono text-xs text-foreground outline-none transition-colors duration-150 focus:border-primary"
        />
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </label>
  )
}

function Separator() {
  return <hr className="my-3 border-border" />
}

// ─── Color presets ───────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Ivory', hex: '#FFFFF0' },
  { label: 'Linen', hex: '#FAF0E6' },
  { label: 'Sky', hex: '#87CEEB' },
  { label: 'Sage', hex: '#B2C9AB' },
  { label: 'Blush', hex: '#F5C6C6' },
  { label: 'Slate', hex: '#708090' },
  { label: 'Charcoal', hex: '#36454F' },
]

// ─── Input Mode Toggle ──────────────────────────────────────────────────────

function InputModeToggle() {
  const inputMode = usePaintStore((s) => s.inputMode)
  const setInput = usePaintStore((s) => s.setInput)

  return (
    <FieldGroup label="Input mode">
      <div className="flex rounded-sm border border-border">
        <button
          onClick={() => setInput('inputMode', 'room')}
          className={`flex-1 py-1.5 text-xs transition-colors duration-150 ${
            inputMode === 'room'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Room
        </button>
        <button
          onClick={() => setInput('inputMode', 'wall-by-wall')}
          className={`flex-1 border-l border-border py-1.5 text-xs transition-colors duration-150 ${
            inputMode === 'wall-by-wall'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Wall-by-wall
        </button>
      </div>
    </FieldGroup>
  )
}

// ─── Room Dimensions ─────────────────────────────────────────────────────────

function RoomDimensions() {
  const inputMode = usePaintStore((s) => s.inputMode)
  const roomLengthMm = usePaintStore((s) => s.roomLengthMm)
  const roomWidthMm = usePaintStore((s) => s.roomWidthMm)
  const wallHeightMm = usePaintStore((s) => s.wallHeightMm)
  const setInput = usePaintStore((s) => s.setInput)

  if (inputMode !== 'room') return null

  return (
    <FieldGroup label="Room dimensions">
      <NumberField label="Room length" value={roomLengthMm} onChange={(v) => setInput('roomLengthMm', v)} unit="mm" />
      <NumberField label="Room width" value={roomWidthMm} onChange={(v) => setInput('roomWidthMm', v)} unit="mm" />
      <NumberField label="Wall height" value={wallHeightMm} onChange={(v) => setInput('wallHeightMm', v)} unit="mm" />
    </FieldGroup>
  )
}

// ─── Wall-by-Wall Segments ──────────────────────────────────────────────────

function WallSegmentsSection() {
  const inputMode = usePaintStore((s) => s.inputMode)
  const wallSegments = usePaintStore((s) => s.wallSegments)
  const setInput = usePaintStore((s) => s.setInput)

  if (inputMode !== 'wall-by-wall') return null

  const addWall = () => {
    setInput('wallSegments', [...wallSegments, { id: `wall-${Date.now()}`, lengthMm: 3000, heightMm: 2700 }])
  }

  const removeWall = (id: string) => {
    setInput('wallSegments', wallSegments.filter((w) => w.id !== id))
  }

  const updateWall = (id: string, field: 'lengthMm' | 'heightMm', value: number) => {
    setInput('wallSegments', wallSegments.map((w) => (w.id === id ? { ...w, [field]: value } : w)))
  }

  return (
    <FieldGroup label="Wall segments">
      {wallSegments.map((seg, i) => (
        <div key={seg.id} className="rounded-sm border border-border bg-background p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Wall {i + 1}</span>
            <button
              onClick={() => removeWall(seg.id)}
              className="text-xs text-muted-foreground transition-colors duration-150 hover:text-destructive"
              aria-label={`Remove wall ${i + 1}`}
            >
              &times;
            </button>
          </div>
          <div className="space-y-1.5">
            <NumberField label="Length" value={seg.lengthMm} onChange={(v) => updateWall(seg.id, 'lengthMm', v)} unit="mm" />
            <NumberField label="Height" value={seg.heightMm} onChange={(v) => updateWall(seg.id, 'heightMm', v)} unit="mm" />
          </div>
        </div>
      ))}
      <button
        onClick={addWall}
        className="w-full rounded-sm border border-border py-1.5 text-xs text-foreground transition-colors duration-150 hover:bg-muted"
      >
        + Add Wall
      </button>
    </FieldGroup>
  )
}

// ─── Ceiling Area Override ───────────────────────────────────────────────────

function CeilingAreaOverride() {
  const ceilingAreaOverrideSqm = usePaintStore((s) => s.ceilingAreaOverrideSqm)
  const setInput = usePaintStore((s) => s.setInput)

  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-xs text-foreground">Ceiling area override</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={ceilingAreaOverrideSqm ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            setInput('ceilingAreaOverrideSqm', raw === '' ? null : Number(raw))
          }}
          min={0}
          step={0.1}
          placeholder="Auto"
          className="w-20 rounded-sm border border-border bg-background px-2 py-1 text-right font-mono text-xs text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus:border-primary"
        />
        <span className="text-[10px] text-muted-foreground">sq.m.</span>
      </div>
    </label>
  )
}

// ─── Paint Configuration ─────────────────────────────────────────────────────

function PaintConfiguration() {
  const includeCeiling = usePaintStore((s) => s.includeCeiling)
  const substrateType = usePaintStore((s) => s.substrateType)
  const coatsTopcoat = usePaintStore((s) => s.coatsTopcoat)
  const coatsPrimer = usePaintStore((s) => s.coatsPrimer)
  const setInput = usePaintStore((s) => s.setInput)

  return (
    <>
      <Separator />
      <FieldGroup label="Paint configuration">
        <label className="flex items-center justify-between">
          <span className="text-xs text-foreground">Include ceiling</span>
          <input
            type="checkbox"
            checked={includeCeiling}
            onChange={(e) => setInput('includeCeiling', e.target.checked)}
            className="h-4 w-4 rounded-sm border-border accent-primary"
          />
        </label>

        {includeCeiling && (
          <CeilingAreaOverride />
        )}

        <label className="flex items-center justify-between gap-2">
          <span className="text-xs text-foreground">Substrate type</span>
          <select
            value={substrateType}
            onChange={(e) => setInput('substrateType', e.target.value as 'new-concrete' | 'repaint' | 'exterior')}
            className="rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground outline-none transition-colors duration-150 focus:border-primary"
          >
            <option value="new-concrete">New concrete</option>
            <option value="repaint">Repaint</option>
            <option value="exterior">Exterior</option>
          </select>
        </label>

        <NumberField label="Topcoat coats" value={coatsTopcoat} onChange={(v) => setInput('coatsTopcoat', v)} min={1} max={3} />
        <NumberField label="Primer coats" value={coatsPrimer} onChange={(v) => setInput('coatsPrimer', v)} min={0} max={2} />
      </FieldGroup>
    </>
  )
}

// ─── Coverage ────────────────────────────────────────────────────────────────

function CoverageSection() {
  const topcoatCoverage = usePaintStore((s) => s.topcoatCoverageSqmPerLiter)
  const primerCoverage = usePaintStore((s) => s.primerCoverageSqmPerLiter)
  const wastePercent = usePaintStore((s) => s.wastePercent)
  const setInput = usePaintStore((s) => s.setInput)

  return (
    <>
      <Separator />
      <FieldGroup label="Coverage">
        <NumberField label="Topcoat coverage" value={topcoatCoverage} onChange={(v) => setInput('topcoatCoverageSqmPerLiter', v)} min={1} step={0.5} unit="sq.m./L" />
        <NumberField label="Primer coverage" value={primerCoverage} onChange={(v) => setInput('primerCoverageSqmPerLiter', v)} min={1} step={0.5} unit="sq.m./L" />
        <NumberField label="Waste" value={wastePercent} onChange={(v) => setInput('wastePercent', v)} min={0} max={25} unit="%" />
      </FieldGroup>
    </>
  )
}

// ─── Color Selection ─────────────────────────────────────────────────────────

function ColorSelection() {
  const selectedColorHex = usePaintStore((s) => s.selectedColorHex)
  const setInput = usePaintStore((s) => s.setInput)

  return (
    <>
      <Separator />
      <FieldGroup label="Color">
        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => setInput('selectedColorHex', preset.hex)}
              title={preset.label}
              className={`h-6 w-6 rounded-sm border transition-colors duration-150 ${
                selectedColorHex === preset.hex
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-foreground'
              }`}
              style={{ backgroundColor: preset.hex }}
            />
          ))}
        </div>
        <label className="flex items-center justify-between gap-2">
          <span className="text-xs text-foreground">Custom</span>
          <input
            type="color"
            value={selectedColorHex}
            onChange={(e) => setInput('selectedColorHex', e.target.value)}
            className="h-7 w-10 cursor-pointer rounded-sm border border-border bg-transparent"
          />
        </label>
      </FieldGroup>
    </>
  )
}

// ─── PaintInputPanel (main export) ───────────────────────────────────────────

export function PaintInputPanel() {
  return (
    <div>
      <InputModeToggle />
      <RoomDimensions />
      <WallSegmentsSection />
      <PaintConfiguration />
      <CoverageSection />
      <ColorSelection />
    </div>
  )
}
