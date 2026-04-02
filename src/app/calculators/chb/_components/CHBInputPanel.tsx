'use client'

import { useCHBStore } from '@/app/calculators/_stores/chbStore'

// ─── Shared Helpers ─────────────────────────────────────────────────────────

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

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded-sm border-border accent-primary"
      />
      <span className="text-xs text-foreground">{label}</span>
    </div>
  )
}

// ─── CHB Size Presets ───────────────────────────────────────────────────────

const CHB_SIZE_PRESETS = [
  { label: '4" CHB', value: '4-inch' as const, thicknessMm: 100 },
  { label: '6" CHB', value: '6-inch' as const, thicknessMm: 150 },
  { label: '8" CHB', value: '8-inch' as const, thicknessMm: 200 },
] as const

const MORTAR_MIX_PRESETS = [
  { label: '1:3', value: 3 },
  { label: '1:4', value: 4 },
  { label: '1:5', value: 5 },
] as const

const HORIZONTAL_INTERVAL_PRESETS = [
  { label: 'Every 2nd', value: 2 },
  { label: 'Every 3rd', value: 3 },
  { label: 'Every 4th', value: 4 },
] as const

// ─── CHBInputPanel ──────────────────────────────────────────────────────────

export function CHBInputPanel() {
  const wallLengthMm = useCHBStore((s) => s.wallLengthMm)
  const wallHeightMm = useCHBStore((s) => s.wallHeightMm)
  const chbSize = useCHBStore((s) => s.chbSize)
  const mortarJointMm = useCHBStore((s) => s.mortarJointMm)
  const mortarMixRatio = useCHBStore((s) => s.mortarMixRatio)
  const includeVerticalRebar = useCHBStore((s) => s.includeVerticalRebar)
  const verticalRebarSpacingMm = useCHBStore((s) => s.verticalRebarSpacingMm)
  const verticalRebarDiaMm = useCHBStore((s) => s.verticalRebarDiaMm)
  const includeHorizontalRebar = useCHBStore((s) => s.includeHorizontalRebar)
  const horizontalRebarCourseInterval = useCHBStore((s) => s.horizontalRebarCourseInterval)
  const horizontalRebarDiaMm = useCHBStore((s) => s.horizontalRebarDiaMm)
  const wastePercent = useCHBStore((s) => s.wastePercent)
  const setInput = useCHBStore((s) => s.setInput)

  return (
    <div className="space-y-3">
      {/* ── Wall Dimensions ────────────────────────────────────────────────── */}
      <SectionLabel>Wall Dimensions</SectionLabel>

      <div>
        <FieldLabel>Wall length (mm)</FieldLabel>
        <NumberInput
          value={wallLengthMm}
          onChange={(v) => setInput('wallLengthMm', v)}
          min={100}
        />
      </div>

      <div>
        <FieldLabel>Wall height (mm)</FieldLabel>
        <NumberInput
          value={wallHeightMm}
          onChange={(v) => setInput('wallHeightMm', v)}
          min={100}
        />
      </div>

      {/* ── CHB Block Size ─────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>CHB Block Size</SectionLabel>

      <div className="mt-1 flex gap-1.5">
        {CHB_SIZE_PRESETS.map((preset) => (
          <PresetButton
            key={preset.value}
            label={preset.label}
            active={chbSize === preset.value}
            onClick={() => setInput('chbSize', preset.value)}
          />
        ))}
      </div>

      {/* ── Mortar ─────────────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Mortar</SectionLabel>

      <div>
        <FieldLabel>Mortar joint (mm)</FieldLabel>
        <NumberInput
          value={mortarJointMm}
          onChange={(v) => setInput('mortarJointMm', v)}
          min={5}
        />
      </div>

      <div>
        <FieldLabel>Mix ratio</FieldLabel>
        <div className="mt-1 flex gap-1.5">
          {MORTAR_MIX_PRESETS.map((preset) => (
            <PresetButton
              key={preset.value}
              label={preset.label}
              active={mortarMixRatio === preset.value}
              onClick={() => setInput('mortarMixRatio', preset.value)}
            />
          ))}
        </div>
      </div>

      {/* ── Reinforcement ──────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Reinforcement</SectionLabel>

      <ToggleSwitch
        label="Include vertical rebar"
        checked={includeVerticalRebar}
        onChange={(v) => setInput('includeVerticalRebar', v)}
      />

      {includeVerticalRebar && (
        <>
          <div>
            <FieldLabel>Vertical spacing (mm)</FieldLabel>
            <NumberInput
              value={verticalRebarSpacingMm}
              onChange={(v) => setInput('verticalRebarSpacingMm', v)}
              min={200}
            />
          </div>

          <div>
            <FieldLabel>Vertical diameter</FieldLabel>
            <div className="mt-1 flex gap-1.5">
              <PresetButton
                label="10mm"
                active={verticalRebarDiaMm === 10}
                onClick={() => setInput('verticalRebarDiaMm', 10)}
              />
              <PresetButton
                label="12mm"
                active={verticalRebarDiaMm === 12}
                onClick={() => setInput('verticalRebarDiaMm', 12)}
              />
            </div>
          </div>
        </>
      )}

      <ToggleSwitch
        label="Include horizontal rebar"
        checked={includeHorizontalRebar}
        onChange={(v) => setInput('includeHorizontalRebar', v)}
      />

      {includeHorizontalRebar && (
        <>
          <div>
            <FieldLabel>Horizontal interval</FieldLabel>
            <div className="mt-1 flex gap-1.5">
              {HORIZONTAL_INTERVAL_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.value}
                  label={preset.label}
                  active={horizontalRebarCourseInterval === preset.value}
                  onClick={() => setInput('horizontalRebarCourseInterval', preset.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Horizontal diameter</FieldLabel>
            <div className="mt-1 flex gap-1.5">
              <PresetButton
                label="10mm"
                active={horizontalRebarDiaMm === 10}
                onClick={() => setInput('horizontalRebarDiaMm', 10)}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Waste ──────────────────────────────────────────────────────────── */}
      <Separator />
      <SectionLabel>Waste</SectionLabel>

      <div>
        <FieldLabel>Waste %</FieldLabel>
        <NumberInput
          value={wastePercent}
          onChange={(v) => setInput('wastePercent', v)}
          min={0}
        />
      </div>
    </div>
  )
}
