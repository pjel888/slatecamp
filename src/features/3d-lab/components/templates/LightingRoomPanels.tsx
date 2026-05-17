'use client'

import { memo, useMemo, type ReactNode } from 'react'
import { Gauge, Info, Lightbulb, Ruler, Zap } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'
import {
  LIGHTING_LAMP_EFFICACY,
  computeLightingRoomState,
  lumensForLampWatts,
  type LightingLampType,
  type LightingParamRecord,
  type LightingRoomState,
  type LightingRoomType,
} from '@/features/3d-lab/config/modules/06-electrical/lighting-computation'
import { lightingRoomPresets } from '@/features/3d-lab/config/modules/06-electrical/lighting-room-simulator'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import { cn } from '@/lib/utils'
import type { StoreApi, UseBoundStore } from 'zustand'

const MONO = 'var(--font-dm-mono), monospace'

interface LightingRoomPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const LAMP_OPTIONS: Array<{ value: LightingLampType; label: string }> = [
  { value: 'incandescent', label: 'Incandescent' },
  { value: 'fluorescent', label: 'Fluorescent' },
  { value: 'led', label: 'LED' },
]

const ROOM_OPTIONS: Array<{ value: LightingRoomType; label: string }> = [
  { value: 'office', label: 'Office work area' },
  { value: 'reading', label: 'Reading / study table' },
  { value: 'drafting', label: 'Drafting / detailed work' },
  { value: 'corridor', label: 'Corridor / circulation' },
  { value: 'custom', label: 'Custom teaching setup' },
]

export const LightingRoomLeftPanel = memo(function LightingRoomLeftPanel({ useStore }: LightingRoomPanelProps) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const setParams = useStore((s) => s.setParams)
  const state = useMemo(() => computeLightingRoomState(params as LightingParamRecord), [params])

  const setNumber = (key: string) => (value: number) => setParam(key, value)
  const setWattage = (value: number) => {
    setParams({
      wattage: value,
      lumens: lumensForLampWatts(state.lampType, value),
    })
  }
  const setLampType = (lampType: LightingLampType) => {
    setParams({
      lampType,
      lumens: lumensForLampWatts(lampType, state.wattage),
    })
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden bg-muted/25 p-1.5"
      role="complementary"
      aria-label="Lighting room controls"
    >
      <InspectorSection title="Live result" className="bg-card/95">
        <div className="grid grid-cols-2 gap-1.5">
          <MetricTile icon={<Lightbulb className="size-3.5" />} label="Average" value={`${state.averageLux} lx`} />
          <MetricTile icon={<Zap className="size-3.5" />} label="LPD" value={`${state.lpdWattsPerSqm.toFixed(1)} W/m^2`} />
          <MetricTile icon={<Gauge className="size-3.5" />} label="Efficacy" value={`${state.efficacyLumensPerWatt.toFixed(1)} lm/W`} />
          <MetricTile icon={<Ruler className="size-3.5" />} label="Beam floor" value={`${state.beamDiameterM.toFixed(1)} m`} />
        </div>
      </InspectorSection>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid gap-1.5">
          <InspectorSection title="Scenario presets">
            <SelectRow
              label="Preset"
              value=""
              options={[
                { value: '', label: 'Choose a scenario' },
                ...lightingRoomPresets.map((preset) => ({
                  value: preset.id ?? preset.label,
                  label: preset.label,
                })),
              ]}
              onChange={(presetId) => {
                const preset = lightingRoomPresets.find((item) => (item.id ?? item.label) === presetId)
                if (preset) setParams(preset.values)
              }}
              note="Loads source-gated learner scenarios from the module config."
            />
          </InspectorSection>

          <InspectorSection title="Light source">
            <SelectRow
              label="Lamp type"
              value={state.lampType}
              options={LAMP_OPTIONS}
              onChange={setLampType}
              note={`${LIGHTING_LAMP_EFFICACY[state.lampType]} lm/W teaching preset`}
            />
            <SliderRow>
              <LabSlider
                compact
                label="Watts"
                max={300}
                min={5}
                onChange={setWattage}
                step={1}
                unit=" W"
                value={state.wattage}
              />
            </SliderRow>
            <SliderRow>
              <LabSlider
                compact
                label="Lumens"
                max={18000}
                min={100}
                onChange={setNumber('lumens')}
                step={50}
                unit=" lm"
                value={state.lumens}
              />
            </SliderRow>
          </InspectorSection>

          <InspectorSection title="Teaching target">
            <SelectRow
              label="Room use"
              value={state.roomType}
              options={ROOM_OPTIONS}
              onChange={(value) => setParam('roomType', value)}
              note={state.targetLux == null ? 'No source-backed target selected' : `${state.targetLux} lx located reference`}
            />
            <InlineInfoItem
              label="Suggested lumens"
              value={state.lumensNeededForTarget == null ? 'Select target' : `${state.lumensNeededForTarget.toLocaleString()} lm`}
              title="Target-driven lumens"
              description="This is target lux multiplied by room area and rounded to the nearest 50 lumens. It is a teaching estimate, not a fixture schedule."
            />
          </InspectorSection>

          <InspectorSection title="Room">
            <SliderRow>
              <LabSlider
                compact
                label="Width"
                max={8}
                min={2}
                onChange={setNumber('roomWidth')}
                step={0.1}
                unit=" m"
                value={state.roomWidthM}
              />
            </SliderRow>
            <SliderRow>
              <LabSlider
                compact
                label="Depth"
                max={8}
                min={2}
                onChange={setNumber('roomDepth')}
                step={0.1}
                unit=" m"
                value={state.roomDepthM}
              />
            </SliderRow>
            <InlineInfoItem
              label="Floor area"
              value={`${state.roomAreaSqm.toFixed(1)} m^2`}
              title="Room area"
              description="Average illuminance decreases as the same lumen package spreads across a larger room."
            />
          </InspectorSection>

          <InspectorSection title="Fixture">
            <SliderRow>
              <LabSlider
                compact
                label="Height"
                max={3.6}
                min={2.1}
                onChange={setNumber('mountingHeight')}
                step={0.1}
                unit=" m"
                value={state.mountingHeightM}
              />
            </SliderRow>
            <SliderRow>
              <LabSlider
                compact
                label="Beam"
                max={120}
                min={15}
                onChange={setNumber('beamAngle')}
                step={5}
                unit=" deg"
                value={state.beamAngleDeg}
              />
            </SliderRow>
            <ToggleRow
              checked={state.showBeamCone}
              label="Beam cone"
              onChange={(checked) => setParam('showBeamCone', checked)}
            />
          </InspectorSection>
        </div>
      </div>
    </div>
  )
})

export const LightingRoomChecksPanel = memo(function LightingRoomChecksPanel({ useStore }: LightingRoomPanelProps) {
  const params = useStore((s) => s.params)
  const state = useMemo(() => computeLightingRoomState(params as LightingParamRecord), [params])
  const targetTone = state.targetLux == null
    ? 'border-border-default/60 bg-muted/20 text-muted-foreground'
    : state.isBelowTeachingTarget
      ? 'border-amber-500/20 bg-amber-500/8 text-amber-700'
      : 'border-emerald/15 bg-emerald/5 text-emerald'
  const energyTone = state.exceedsLocatedLpdReference
    ? 'border-amber-500/20 bg-amber-500/8 text-amber-700'
    : 'border-primary/15 bg-primary/5 text-primary'

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden bg-muted/25 p-1.5"
      role="complementary"
      aria-label="Lighting room source-gated checks"
    >
      <InspectorSection
        title="Target review"
        badge={<SourcePill status={state.targetSourceStatus} />}
      >
        <ReviewCard
          className={targetTone}
          label={state.targetReviewLabel}
          value={state.targetLux == null ? `${state.averageLux} lx` : `${state.averageLux} / ${state.targetLux} lx`}
        >
          {state.targetLux == null
            ? 'Custom mode shows the teaching formula without comparing it to a source target.'
            : state.isBelowTeachingTarget
              ? `Raise delivered lumens toward ${state.lumensNeededForTarget?.toLocaleString() ?? 'the target'} lm or reduce the lit area.`
              : 'The current setup reaches the selected teaching target, but source approval is still required before legal wording can appear.'}
        </ReviewCard>
      </InspectorSection>

      <InspectorSection
        title="Energy reference"
        badge={<SourcePill status={state.lpdSourceStatus} />}
      >
        <ReviewCard
          className={energyTone}
          label={state.energyReviewLabel}
          value={`${state.lpdWattsPerSqm.toFixed(1)} W/m^2`}
        >
          Located PGBC office reference is {state.locatedLpdReferenceWattsPerSqm.toFixed(1)} W/m^2. This panel shows a review cue only.
        </ReviewCard>
      </InspectorSection>

      <InspectorSection title="Learner readout" className="min-h-0 flex-1">
        <div className="grid gap-1.5 text-[12px] leading-relaxed text-muted-foreground">
          <FormulaLine left="Average lux" right={`${state.lumens.toLocaleString()} lm / ${state.roomAreaSqm.toFixed(1)} m^2`} />
          <FormulaLine left="Watts per area" right={`${state.wattage.toFixed(0)} W / ${state.roomAreaSqm.toFixed(1)} m^2`} />
          <FormulaLine left="Beam spread" right={`${state.beamAngleDeg.toFixed(0)} deg at ${state.mountingHeightM.toFixed(1)} m`} />
          <FormulaLine left="Lamp story" right={`${state.lampType} at ${state.efficacyLumensPerWatt.toFixed(1)} lm/W`} />
        </div>
        <Separator className="my-2" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Source gates: {state.targetSourceId} and {state.lpdSourceId} are located but not approved.
          Until approved, the module can teach cause and effect but cannot display legal result language.
        </p>
      </InspectorSection>
    </div>
  )
})

export const LightingRoomStatusBar = memo(function LightingRoomStatusBar({ useStore }: LightingRoomPanelProps) {
  const params = useStore((s) => s.params)
  const state = useMemo(() => computeLightingRoomState(params as LightingParamRecord), [params])

  return (
    <div className="flex h-full min-w-0 items-center gap-3 overflow-hidden px-3 text-[11px] text-muted-foreground">
      <StatusMetric label="Avg" value={`${state.averageLux} lx`} />
      <StatusMetric label="Target" value={state.targetLux == null ? 'Teaching only' : `${state.targetLux} lx`} />
      <StatusMetric label="LPD" value={`${state.lpdWattsPerSqm.toFixed(1)} W/m^2`} />
      <StatusMetric label="Source" value="QA preview" />
    </div>
  )
})

function InspectorSection({
  title,
  badge,
  children,
  className,
}: {
  title: string
  badge?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('min-w-0 rounded-lg bg-card shadow-sm', className)}>
      <div className="flex min-h-5 items-center justify-between gap-2 px-2.5 pt-2">
        <div
          className="truncate uppercase tracking-[0.12em] text-muted-foreground"
          style={{ fontFamily: MONO, fontSize: 10.5 }}
        >
          {title}
        </div>
        {badge}
      </div>
      <div className="px-2.5 pb-2 pt-1.5">{children}</div>
    </section>
  )
}

function MetricTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border-default/50 bg-background/70 p-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="truncate text-[10px] font-medium">{label}</span>
      </div>
      <div className="mt-1 truncate text-[13px] font-semibold tabular-nums text-foreground" style={{ fontFamily: MONO }}>
        {value}
      </div>
    </div>
  )
}

function SelectRow<TValue extends string>({
  label,
  value,
  options,
  onChange,
  note,
}: {
  label: string
  value: TValue
  options: Array<{ value: TValue; label: string }>
  onChange: (value: TValue) => void
  note?: string
}) {
  return (
    <label className="grid gap-1 py-1">
      <span className="text-[11px] font-medium text-foreground">{label}</span>
      <select
        className="h-8 min-w-0 rounded-md border border-border-default/60 bg-background px-2 text-[12px] text-foreground outline-none transition-colors focus-visible:border-primary/50"
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {note && <span className="truncate text-[10px] text-muted-foreground">{note}</span>}
    </label>
  )
}

function ToggleRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-8 items-center justify-between gap-3 rounded-md border border-border-default/50 bg-background/70 px-2 text-[12px]">
      <span className="font-medium text-foreground">{label}</span>
      <input
        checked={checked}
        className="size-4 accent-primary"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

function InlineInfoItem({
  label,
  value,
  title,
  description,
}: {
  label: string
  value: string
  title: string
  description: string
}) {
  return (
    <div className="grid min-w-0 grid-cols-[12px_max-content_1fr_max-content] items-baseline gap-2 py-1" title={description}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative top-[1px] inline-flex size-3 items-center justify-center rounded-full text-muted-foreground/45 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={`Explain ${label}`}
          >
            <Info className="size-3" aria-hidden="true" strokeWidth={1.8} />
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={8} className="w-72 max-w-[300px]">
          <PopoverHeader>
            <PopoverTitle>{title}</PopoverTitle>
            <PopoverDescription className="text-xs leading-relaxed">
              {description}
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      <span className="truncate font-medium text-foreground" style={{ fontSize: 11 }}>
        {label}
      </span>
      <span className="min-w-0 translate-y-[-3px] border-b border-dotted border-muted-foreground/25" aria-hidden="true" />
      <span
        className="truncate text-right font-medium tabular-nums text-foreground"
        style={{ fontFamily: MONO, fontSize: 12 }}
      >
        {value}
      </span>
    </div>
  )
}

function ReviewCard({
  label,
  value,
  children,
  className,
}: {
  label: string
  value: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border p-2.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[12px] font-semibold">{label}</span>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums" style={{ fontFamily: MONO }}>
          {value}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed opacity-85">{children}</p>
    </div>
  )
}

function FormulaLine({ left, right }: { left: string; right: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[max-content_1fr] gap-2">
      <span className="font-medium text-foreground">{left}</span>
      <span className="truncate text-right tabular-nums" style={{ fontFamily: MONO }}>
        {right}
      </span>
    </div>
  )
}

function SourcePill({ status }: { status: LightingRoomState['targetSourceStatus'] }) {
  return (
    <span className="rounded border border-warning/20 bg-warning/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning">
      {sourceStatusLabel(status)}
    </span>
  )
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 items-baseline gap-1">
      <span className="shrink-0 uppercase tracking-[0.12em]" style={{ fontFamily: MONO, fontSize: 9 }}>
        {label}
      </span>
      <span className="truncate font-semibold tabular-nums text-foreground" style={{ fontFamily: MONO }}>
        {value}
      </span>
    </span>
  )
}

function SliderRow({ children }: { children: ReactNode }) {
  return <div className="min-w-0 py-1.5">{children}</div>
}

function sourceStatusLabel(status: LightingRoomState['targetSourceStatus']): string {
  switch (status) {
    case 'APPROVED':
      return 'Approved'
    case 'APPROVED_INTERNAL':
      return 'Teaching'
    case 'LOCATED':
      return 'Located'
    case 'SOURCE_PENDING':
      return 'Pending'
    case 'CONFLICT':
      return 'Conflict'
    case 'PEDAGOGICAL_ONLY':
      return 'Teaching'
  }
}
