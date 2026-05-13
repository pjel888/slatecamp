'use client'

import { memo, useMemo, type ReactNode } from 'react'
import { Info } from 'lucide-react'
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
  computeParallelDimensionFailures,
  computeStairState,
} from '@/features/3d-lab/config/modules/08-vertical/stairway-computation'
import type { StairDimensionKey, StairParams } from '@/features/3d-lab/config/modules/08-vertical/stairway-types'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import { cn } from '@/lib/utils'

const MONO = 'var(--font-dm-mono), monospace'

type ParamValue = number | boolean | string

interface StairwayWorkbenchLeftPanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  embedded?: boolean
}

function mm(value: number): string {
  return `${Math.round(value).toLocaleString()} mm`
}

function deg(value: number): string {
  return `${value.toFixed(1)}°`
}

function num(params: Record<string, ParamValue>, key: string, fallback: number): number {
  const value = params[key]
  return typeof value === 'number' ? value : Number(value ?? fallback)
}

function SectionTitle({ title, badge }: { title: string; badge?: ReactNode }) {
  return (
    <div className="flex min-h-5 items-center justify-between gap-2 px-2.5 pt-2">
      <div
        className="truncate uppercase tracking-[0.12em] text-muted-foreground"
        style={{ fontFamily: MONO, fontSize: 10.5 }}
      >
        {title}
      </div>
      {badge}
    </div>
  )
}

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
      <SectionTitle title={title} badge={badge} />
      <div className="px-2.5 pb-2 pt-1.5">{children}</div>
    </section>
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
    <div className="grid min-w-0 grid-cols-[12px_max-content_1fr_max-content] items-baseline gap-2" title={description}>
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
      <span className="min-w-0 border-b border-dotted border-muted-foreground/25 translate-y-[-3px]" aria-hidden="true" />
      <span
        className="truncate text-right font-medium tabular-nums text-foreground"
        style={{ fontFamily: MONO, fontSize: 12 }}
      >
        {value}
      </span>
    </div>
  )
}

function SliderRow({ children }: { children: ReactNode }) {
  return <div className="min-w-0 py-1.5">{children}</div>
}

export const StairwayWorkbenchLeftPanel = memo(function StairwayWorkbenchLeftPanel({
  useStore,
  embedded = false,
}: StairwayWorkbenchLeftPanelProps) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)

  const state = useMemo(() => computeStairState(params), [params])
  const dimensionFailures = useMemo(
    () => computeParallelDimensionFailures(params as StairParams),
    [params],
  )
  const dimensionViolates = (dimension: StairDimensionKey) =>
    dimensionFailures[dimension]

  const riserHeight = num(params, 'riserHeight', state.riserHeight)
  const treadDepth = num(params, 'treadDepth', state.treadDepth)
  const stairWidth = num(params, 'stairWidth', state.stairWidth)
  const headroom = num(params, 'headroom', state.headroom)
  const handrailHeight = num(params, 'handrailHeight', state.handrailHeight)
  const numRisers = num(params, 'numRisers', state.numRisers)

  const setNumber = (key: string) => (value: number) => setParam(key, value)

  return (
    <div
      className={cn(
        embedded
          ? 'flex h-full min-h-0 flex-col gap-1.5 overflow-hidden bg-muted/25 p-1.5'
          : 'absolute bottom-0 left-0 top-0 z-10 flex min-w-[384px] flex-col gap-1.5 overflow-hidden bg-muted/25 p-1.5',
      )}
      role="complementary"
      aria-label="Stairway controls"
    >
      <InspectorSection
        title="Stair information"
        className="bg-card/95"
      >
        <div className="grid min-w-0 grid-cols-1 gap-0.5">
          <InlineInfoItem
            label="Clear width"
            value={mm(state.stairWidth)}
            title="Clear stair width"
            description="The unobstructed walking width of the stair. In this module, changing it immediately affects the width-related checks in the compliance panel."
          />
          <InlineInfoItem
            label="Tread depth"
            value={mm(state.treadDepth)}
            title="Tread depth"
            description="The horizontal depth of one step where the foot lands. Deeper treads usually feel safer and less cramped; the law cards show the exact minimums being tested."
          />
          <InlineInfoItem
            label="Riser height"
            value={mm(state.riserHeight)}
            title="Riser height"
            description="The vertical height from one tread to the next. Higher risers make the stair steeper and harder to climb; the right panel flags when the value exceeds code limits."
          />
          <InlineInfoItem
            label="Headroom"
            value={mm(state.headroom)}
            title="Headroom clearance"
            description="The vertical clearance above the walking line near the stair and landing. Too little headroom creates a collision hazard and triggers clearance violations."
          />
          <InlineInfoItem
            label="Handrail height"
            value={mm(state.handrailHeight)}
            title="Handrail height"
            description="The height of the handrail above the stair pitch line. This helps learners see whether the rail is within the usable accessibility and safety range."
          />
          <InlineInfoItem
            label="Floor rise"
            value={mm(state.actualTotalRise)}
            title="Floor-to-floor rise"
            description="The total vertical rise generated by the current riser height and number of risers. This is the actual ground-floor-to-second-floor height represented by the model."
          />
          <InlineInfoItem
            label="Total run"
            value={mm(state.totalRun)}
            title="Total stair run"
            description="The total horizontal distance occupied by all treads. A longer run usually creates a gentler stair; a shorter run makes the stair more compact and steeper."
          />
          <InlineInfoItem
            label="Pitch angle"
            value={deg(state.pitchAngle)}
            title="Stair pitch angle"
            description="The angle of the stair slope. It is calculated from riser height and tread depth, so it changes whenever the step proportions change."
          />
          <InlineInfoItem
            label="2R+T comfort"
            value={mm(state.twoRPlusT)}
            title="2R + T comfort formula"
            description="A stair-comfort rule of thumb: two risers plus one tread. It estimates whether the step rhythm feels cramped, comfortable, or stretched. It is a learning aid, not the final legal compliance check."
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Step body">
        <div className="divide-y divide-border/60">
          <SliderRow>
            <LabSlider
              label="Riser height"
              labelInfoTitle="Riser height"
              labelInfoDescription="Controls the vertical height from one tread to the next. Increase it to see how steep stairs begin to violate PD 1096, RA 9514, or BP 220 limits."
              value={riserHeight}
              min={50}
              max={900}
              step={5}
              unit="mm"
              showRangeLabels={false}
              isViolating={dimensionViolates('riserHeight')}
              onChange={setNumber('riserHeight')}
            />
          </SliderRow>
          <SliderRow>
            <LabSlider
              label="Tread depth"
              labelInfoTitle="Tread depth"
              labelInfoDescription="Controls the horizontal foot-landing depth of each step. Shallow treads make stairs feel unsafe and trigger minimum-depth violations in the law cards."
              value={treadDepth}
              min={50}
              max={900}
              step={5}
              unit="mm"
              showRangeLabels={false}
              isViolating={dimensionViolates('treadDepth')}
              onChange={setNumber('treadDepth')}
            />
          </SliderRow>
          <SliderRow>
            <LabSlider
              label="Clear stair width"
              labelInfoTitle="Clear stair width"
              labelInfoDescription="Controls the unobstructed walking width of the stair. Wider stairs serve more occupants and satisfy stricter public, exit, or accessible-route requirements."
              value={stairWidth}
              min={300}
              max={2400}
              step={25}
              unit="mm"
              showRangeLabels={false}
              isViolating={dimensionViolates('stairWidth')}
              onChange={setNumber('stairWidth')}
            />
          </SliderRow>
          <SliderRow>
            <LabSlider
              label="Vertical rise per flight"
              labelInfoTitle="Vertical rise per flight"
              labelInfoDescription="Controls the number of risers in this straight flight. Increase it to push the total vertical rise beyond the PD 1096 3,600 mm landing threshold shown in the legal card."
              value={numRisers}
              min={3}
              max={24}
              step={1}
              unit="risers"
              showRangeLabels={false}
              isViolating={dimensionViolates('verticalRise')}
              onChange={setNumber('numRisers')}
            />
          </SliderRow>
        </div>
      </InspectorSection>

      <InspectorSection title="Headroom clearance">
        <LabSlider
          label="Headroom"
          labelInfoTitle="Headroom clearance"
          labelInfoDescription="Controls the vertical clearance above the walking line near the stair and landing. Lower values show how collision hazards appear in the model and compliance panel."
          value={headroom}
          min={1200}
          max={3200}
          step={50}
          unit="mm"
          showRangeLabels={false}
          isViolating={dimensionViolates('headroom')}
          onChange={setNumber('headroom')}
        />
      </InspectorSection>

      <InspectorSection title="Handrail height">
        <LabSlider
          label="Handrail"
          labelInfoTitle="Handrail height"
          labelInfoDescription="Controls the handrail height above the stair pitch line. Move it outside the usable range to see the accessibility and safety feedback turn into violations."
          value={handrailHeight}
          min={300}
          max={1600}
          step={25}
          unit="mm"
          showRangeLabels={false}
          isViolating={dimensionViolates('handrailHeight')}
          onChange={setNumber('handrailHeight')}
        />
      </InspectorSection>

      <Separator className="mt-auto bg-transparent" />
    </div>
  )
})
