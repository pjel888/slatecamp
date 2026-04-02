'use client'

import { useDrywallStore } from '@/app/calculators/_stores/drywallStore'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

function Separator() {
  return <hr className="my-3 border-border" />
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-foreground">
      {children}
    </label>
  )
}

function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none transition-colors duration-150 focus:border-primary"
    />
  )
}

function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-colors duration-150 ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-sm border py-1.5 font-mono text-[10px] transition-colors duration-150 ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

// ─── DrywallInputPanel ───────────────────────────────────────────────────────

export function DrywallInputPanel() {
  const wallLengthMm = useDrywallStore((s) => s.wallLengthMm)
  const wallHeightMm = useDrywallStore((s) => s.wallHeightMm)
  const studSpacingMm = useDrywallStore((s) => s.studSpacingMm)
  const includeCornerStudAllowance = useDrywallStore((s) => s.includeCornerStudAllowance)
  const cornerStudExtraCount = useDrywallStore((s) => s.cornerStudExtraCount)
  const includeOpeningFramingAllowance = useDrywallStore((s) => s.includeOpeningFramingAllowance)
  const extraStudsPerOpening = useDrywallStore((s) => s.extraStudsPerOpening)
  const boardLengthMm = useDrywallStore((s) => s.boardLengthMm)
  const boardWidthMm = useDrywallStore((s) => s.boardWidthMm)
  const boardOrientation = useDrywallStore((s) => s.boardOrientation)
  const boardLayersPerSide = useDrywallStore((s) => s.boardLayersPerSide)
  const sidesBoarded = useDrywallStore((s) => s.sidesBoarded)
  const wastePercent = useDrywallStore((s) => s.wastePercent)
  const trackStockLengthMm = useDrywallStore((s) => s.trackStockLengthMm)
  const drywallViewMode = useDrywallStore((s) => s.drywallViewMode)
  const setInput = useDrywallStore((s) => s.setInput)
  const toggleDrywallView = useDrywallStore((s) => s.toggleDrywallView)

  const BOARD_PRESETS = [
    { label: 'Hardiflex 4mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Hardiflex 6mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Gypsum 9.5mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Gypsum 12.5mm', lengthMm: 2440, widthMm: 1220 },
    { label: 'Gypsum 12.5mm (tall)', lengthMm: 2740, widthMm: 1220 },
  ]

  const isStandardBoardSize = BOARD_PRESETS.some(
    (p) => p.lengthMm === boardLengthMm && p.widthMm === boardWidthMm,
  )

  const isStandardSpacing = studSpacingMm === 400 || studSpacingMm === 600

  return (
    <div className="space-y-3">
      {/* ── Wall Dimensions ────────────────────────────────────────────────── */}
      <SectionLabel>Wall Dimensions</SectionLabel>

      <div>
        <FieldLabel>Wall length (mm)</FieldLabel>
        <NumberInput
          value={wallLengthMm}
          onChange={(v) => setInput('wallLengthMm', v)}
        />
      </div>

      <div>
        <FieldLabel>Wall height (mm)</FieldLabel>
        <NumberInput
          value={wallHeightMm}
          onChange={(v) => setInput('wallHeightMm', v)}
        />
      </div>

      {/* ── Framing ────────────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Framing</SectionLabel>

      <div>
        <FieldLabel>Stud spacing</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <PresetButton
            label="400mm"
            active={studSpacingMm === 400}
            onClick={() => setInput('studSpacingMm', 400)}
          />
          <PresetButton
            label="600mm"
            active={studSpacingMm === 600}
            onClick={() => setInput('studSpacingMm', 600)}
          />
        </div>
        {!isStandardSpacing && (
          <NumberInput
            value={studSpacingMm}
            onChange={(v) => setInput('studSpacingMm', v)}
            min={100}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={includeCornerStudAllowance}
          onChange={(e) => setInput('includeCornerStudAllowance', e.target.checked)}
          className="h-3.5 w-3.5 rounded-sm border-border accent-primary"
        />
        <span className="text-xs text-foreground">Corner stud allowance</span>
      </div>
      {includeCornerStudAllowance && (
        <div>
          <FieldLabel>Extra corner studs</FieldLabel>
          <NumberInput
            value={cornerStudExtraCount}
            onChange={(v) => setInput('cornerStudExtraCount', v)}
            min={0}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={includeOpeningFramingAllowance}
          onChange={(e) => setInput('includeOpeningFramingAllowance', e.target.checked)}
          className="h-3.5 w-3.5 rounded-sm border-border accent-primary"
        />
        <span className="text-xs text-foreground">Opening framing allowance</span>
      </div>
      {includeOpeningFramingAllowance && (
        <div>
          <FieldLabel>Extra studs per opening</FieldLabel>
          <NumberInput
            value={extraStudsPerOpening}
            onChange={(v) => setInput('extraStudsPerOpening', v)}
            min={0}
          />
        </div>
      )}

      {/* ── Board Configuration ────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Board Configuration</SectionLabel>

      <div>
        <FieldLabel>Board size</FieldLabel>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {BOARD_PRESETS.map((preset) => (
            <PresetButton
              key={preset.label}
              label={preset.label}
              active={boardLengthMm === preset.lengthMm && boardWidthMm === preset.widthMm}
              onClick={() => {
                setInput('boardLengthMm', preset.lengthMm)
                setInput('boardWidthMm', preset.widthMm)
              }}
            />
          ))}
        </div>
        {!isStandardBoardSize && (
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Length (mm)</FieldLabel>
              <NumberInput
                value={boardLengthMm}
                onChange={(v) => setInput('boardLengthMm', v)}
                min={100}
              />
            </div>
            <div>
              <FieldLabel>Width (mm)</FieldLabel>
              <NumberInput
                value={boardWidthMm}
                onChange={(v) => setInput('boardWidthMm', v)}
                min={100}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Orientation</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <ToggleButton
            label="Vertical"
            active={boardOrientation === 'vertical'}
            onClick={() => setInput('boardOrientation', 'vertical')}
          />
          <ToggleButton
            label="Horizontal"
            active={boardOrientation === 'horizontal'}
            onClick={() => setInput('boardOrientation', 'horizontal')}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Layers per side</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <PresetButton
            label="1"
            active={boardLayersPerSide === 1}
            onClick={() => setInput('boardLayersPerSide', 1)}
          />
          <PresetButton
            label="2"
            active={boardLayersPerSide === 2}
            onClick={() => setInput('boardLayersPerSide', 2)}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Sides boarded</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          <ToggleButton
            label="One side"
            active={sidesBoarded === 'one-side'}
            onClick={() => setInput('sidesBoarded', 'one-side')}
          />
          <ToggleButton
            label="Two sides"
            active={sidesBoarded === 'two-side'}
            onClick={() => setInput('sidesBoarded', 'two-side')}
          />
        </div>
      </div>

      {/* ── Other ──────────────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Other</SectionLabel>

      <div>
        <FieldLabel>Waste %</FieldLabel>
        <NumberInput
          value={wastePercent}
          onChange={(v) => setInput('wastePercent', v)}
          min={0}
        />
      </div>

      <div>
        <FieldLabel>Track stock length (mm)</FieldLabel>
        <NumberInput
          value={trackStockLengthMm}
          onChange={(v) => setInput('trackStockLengthMm', v)}
          min={100}
        />
      </div>

      {/* ── View Toggle ────────────────────────────────────────────────────── */}
      <Separator />
      <div className="flex gap-1.5">
        <ToggleButton
          label="Frame"
          active={drywallViewMode === 'frame'}
          onClick={toggleDrywallView}
        />
        <ToggleButton
          label="Boarded"
          active={drywallViewMode === 'boarded'}
          onClick={toggleDrywallView}
        />
      </div>
    </div>
  )
}
