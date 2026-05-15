'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { evaluateParkingChecks, getParkingRequirementTypology, parkingLotRequirementsConfig, parkingRequirementTypologies } from '@/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import { Buildings, CaretDown, Check, Factory, ForkKnife, Hospital, HouseLine, OfficeChair, ShoppingBagOpen } from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'

const MONO = 'var(--font-dm-mono), monospace'
type ParamValue = number | boolean | string

const sectionTitleStyle = { fontFamily: MONO, fontSize: 10.5 }
const valueStyle = { fontFamily: MONO, fontSize: 12 }
const LAW_COLORS = {
  PD_1096: '#4A7FAD',
  BP_220: '#F5A623',
  BP_344: '#D97706',
  RA_11697: '#0F766E',
} as const

function formatBasis(value: number, unit?: string) {
  if (unit?.startsWith('sqm')) return `${value.toLocaleString()} sqm`
  if (unit === 'living units') return `${value.toLocaleString()} units`
  return `${value.toLocaleString()} ${unit ?? ''}`.trim()
}

function formatRatio(per: number, unit?: string) {
  const ratioUnit = unit?.startsWith('sqm') ? 'sqm' : unit === 'living units' ? 'units' : unit
  return `1 per ${per.toLocaleString()} ${ratioUnit ?? 'units'}`.trim()
}

function formatLegalLocator(sectionLocator?: string, sourceRuleId?: string) {
  if (!sectionLocator) return 'Section pending'
  if (sourceRuleId === 'PARK-BP344-ACCESSIBLE-COUNT') return 'Sec. A.6, Table A.6.1'
  if (sourceRuleId === 'PARK-BP344-ACCESSIBLE-GEOM') return 'Sec. A.6, Fig. A.6.1'
  if (sourceRuleId === 'PARK-BP220-RATIO') return 'Sec. D.3(g)'
  if (sourceRuleId === 'PARK-RA11697-EV-COUNT') return 'Sec. 17'
  if (sectionLocator.includes('Table VII.4')) return 'Rule VII, Table VII.4'
  if (sectionLocator.includes('Section 804')) return 'Rule VIII, Sec. 804 4(b)'
  return sectionLocator.split(';')[0].replace('Section ', 'Sec. ').replace('item ', '')
}

function formatSlotCount(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? 'slot' : 'slots'}`
}

function formatAccessibleBand(totalStalls: number) {
  if (totalStalls <= 0) return '0 total slots'
  if (totalStalls <= 25) return '1-25 total slots'
  if (totalStalls <= 50) return '26-50 total slots'
  if (totalStalls <= 75) return '51-75 total slots'
  if (totalStalls <= 100) return '76-100 total slots'
  if (totalStalls <= 150) return '101-150 total slots'
  if (totalStalls <= 200) return '151-200 total slots'
  if (totalStalls <= 300) return '201-300 total slots'
  if (totalStalls <= 400) return '301-400 total slots'
  if (totalStalls <= 500) return '401-500 total slots'
  if (totalStalls <= 1000) return '501-1,000 total slots'
  return '1,001+ total slots'
}

function formatEvBand(totalStalls: number) {
  return totalStalls >= 20 ? '20+ total slots' : '<20 total slots'
}

interface PanelProps {
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

const TYPOLOGY_ICONS: Record<string, Icon> = {
  dining: ForkKnife,
  retail: ShoppingBagOpen,
  office: OfficeChair,
  hotel: Buildings,
  healthcare: Hospital,
  industrial: Factory,
  housing: HouseLine,
}

function ParkingTypologySelect({
  selectedId,
  onSelect,
}: {
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrollState, setScrollState] = useState({ canScrollUp: false, canScrollDown: false })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const selected = getParkingRequirementTypology(selectedId) ?? parkingRequirementTypologies[2]
  const SelectedIcon = TYPOLOGY_ICONS[selected.iconKey]

  const updateScrollState = () => {
    const node = scrollRef.current
    if (!node) return
    const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight)
    setScrollState({
      canScrollUp: node.scrollTop > 2,
      canScrollDown: node.scrollTop < maxScrollTop - 2,
    })
  }

  useEffect(() => {
    if (!isOpen) return
    const frame = window.requestAnimationFrame(updateScrollState)
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen])

  return (
    <div onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
    }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="group flex min-h-[68px] w-full items-center gap-3 rounded-md bg-transparent px-0 py-1.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/15 bg-primary/8 text-primary">
          <SelectedIcon size={19} weight="duotone" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap text-[11px] font-medium leading-tight text-foreground">{selected.displayLabel}</span>
          <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">{selected.selectorHint}</span>
        </span>
        <CaretDown size={16} weight="bold" className={`shrink-0 text-muted-foreground transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 box-border w-full overflow-hidden rounded-lg border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-xl shadow-slate-950/12">
          <div className="relative">
            {scrollState.canScrollUp && <div className="parking-selector-scroll-cue parking-selector-scroll-cue-top" aria-hidden="true" />}
            <div
              ref={scrollRef}
              className="parking-selector-scrollbar max-h-[324px] overflow-y-scroll py-1 pl-1 pr-3"
              style={{ scrollbarGutter: 'stable' }}
              role="listbox"
              aria-label="Project typology"
              onScroll={updateScrollState}
            >
              {parkingRequirementTypologies.map((item, index) => {
              const ItemIcon = TYPOLOGY_ICONS[item.iconKey]
              const isSelected = item.id === selected.id
              const previous = parkingRequirementTypologies[index - 1]
              const startsNewGroup = index === 0 || previous?.selectorGroup !== item.selectorGroup
              return (
                <div key={item.id}>
                  {startsNewGroup && (
                    <div className={index === 0 ? 'pb-1' : 'border-t border-border/70 pb-1 pt-2'}>
                      <div className="px-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground" style={{ fontFamily: MONO }}>
                        {item.selectorGroup}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelect(item.id)
                      setIsOpen(false)
                      triggerRef.current?.focus()
                    }}
                    className={`grid min-h-[64px] w-full grid-cols-[32px_minmax(0,1fr)_16px] items-center gap-2 rounded-md px-2 text-left outline-none transition ${isSelected ? 'bg-primary/9 text-foreground' : 'hover:bg-muted/70'}`}
                  >
                    <span className={`grid size-8 place-items-center rounded-md border ${isSelected ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}>
                      <ItemIcon size={16} weight="duotone" />
                    </span>
                    <span className="min-w-0 py-1">
                      <span className="block break-words text-[11px] font-medium leading-tight">{item.displayLabel}</span>
                      <span className="mt-1 block break-words text-[10px] leading-tight text-muted-foreground">{item.selectorHint}</span>
                    </span>
                    <span className="grid size-4 place-items-center">
                      {isSelected && <Check size={15} weight="bold" className="text-primary" />}
                    </span>
                  </button>
                </div>
              )
              })}
            </div>
            {scrollState.canScrollDown && (
              <div className="parking-selector-scroll-cue parking-selector-scroll-cue-bottom" aria-hidden="true">
                <CaretDown size={16} weight="bold" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function num(params: Record<string, ParamValue>, key: string, fallback: number) {
  const value = params[key]
  return typeof value === 'number' ? value : Number(value ?? fallback)
}

function DottedResultRow({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="grid min-w-0 grid-cols-[max-content_1fr_minmax(0,max-content)] items-baseline gap-2">
      <span className={`${emphasis ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'} whitespace-nowrap text-[11px] leading-snug`}>
        {label}
      </span>
      <span className="min-w-0 translate-y-[-3px] border-b border-dotted border-muted-foreground/25" aria-hidden="true" />
      <span
        className={`${emphasis ? 'font-bold text-foreground' : 'font-medium text-foreground'} whitespace-nowrap text-right tabular-nums`}
        style={{ fontFamily: MONO, fontSize: emphasis ? 13 : 12 }}
      >
        {value}
      </span>
    </div>
  )
}

function CompactLawCard({
  law,
  title,
  color,
  rows,
}: {
  law: string
  title: string
  color: string
  rows: Array<{ label: string; value: string }>
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-lg bg-card p-3 shadow-sm">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-[38px] items-start gap-2">
          <div className="mt-0.5 h-9 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.14em]" style={{ fontFamily: MONO, color }}>
              {law}
            </div>
            <div className="mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight text-foreground">
              {title}
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-1.5">
          {rows.map((row) => (
            <DottedResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </div>
    </section>
  )
}

export const ParkingLotRequirementsLeftPanel = memo(function ParkingLotRequirementsLeftPanel({ useStore }: PanelProps) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const selectedId = String(params.typology ?? 'office-condominium-large')
  const selectedTypology = getParkingRequirementTypology(selectedId) ?? parkingRequirementTypologies[2]
  const rawBasisValue = params.basisValue
  const basisValue = num(params, 'basisValue', selectedTypology.defaultBasisValue)
  const basisInputValue = rawBasisValue === '' ? '' : basisValue

  return (
    <div className="flex h-full min-h-0 flex-col items-stretch justify-start gap-2 overflow-hidden bg-muted/25 p-1.5" role="complementary" aria-label="Parking requirement inputs">
      <section className="relative rounded-lg bg-card p-2.5 shadow-sm">
        <span className="mb-1.5 block uppercase tracking-[0.12em] text-muted-foreground" style={sectionTitleStyle}>Project type</span>
        <ParkingTypologySelect
          selectedId={selectedTypology.id}
          onSelect={(id) => {
            const next = getParkingRequirementTypology(id) ?? parkingRequirementTypologies[2]
            setParam('typology', next.id)
            setParam('basisValue', next.defaultBasisValue)
          }}
        />
      </section>

      <label className="rounded-lg bg-card p-2.5 shadow-sm">
        <span className="mb-1.5 block uppercase tracking-[0.12em] text-muted-foreground" style={sectionTitleStyle}>{selectedTypology.basisLabel}</span>
        <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-border bg-background focus-within:border-primary">
          <input
            type="number"
            min={0}
            max={selectedTypology.maxBasisValue}
            step={1}
            value={basisInputValue}
            onChange={(event) => {
              const rawValue = event.target.value
              if (rawValue === '') {
                setParam('basisValue', '')
                return
              }

              const value = Number(rawValue)
              setParam('basisValue', Number.isFinite(value) ? Math.max(0, value) : '')
            }}
            className="h-10 min-w-0 bg-transparent px-2 font-medium tabular-nums text-foreground outline-none"
            style={valueStyle}
          />
          <span className="flex h-10 items-center border-l border-border bg-muted/40 px-2 text-[11px] text-muted-foreground">
            {selectedTypology.basisUnit}
          </span>
        </div>
      </label>

    </div>
  )
})

export const ParkingLotRequirementsRightPanel = memo(function ParkingLotRequirementsRightPanel({ useStore }: PanelProps) {
  const params = useStore((s) => s.params)
  const checks = useMemo(() => evaluateParkingChecks(params), [params])
  const selectedTypology = checks.selectedTypology
  const sourceRules = parkingLotRequirementsConfig.sourceTruth?.sourceRules ?? []
  const selectedSource = sourceRules.find((rule) => rule.source_rule_id === selectedTypology?.sourceRuleId)
  const bp344CountSource = sourceRules.find((rule) => rule.source_rule_id === 'PARK-BP344-ACCESSIBLE-COUNT')
  const ra11697EvSource = sourceRules.find((rule) => rule.source_rule_id === 'PARK-RA11697-EV-COUNT')
  const basisValue = num(params, 'basisValue', selectedTypology?.defaultBasisValue ?? 1)
  const isBp220 = selectedSource?.source_rule_id.startsWith('PARK-BP220') ?? false
  const primaryLaw = isBp220 ? 'BP 220' : 'PD 1096'
  const primaryLawColor = isBp220 ? LAW_COLORS.BP_220 : LAW_COLORS.PD_1096
  const primaryLawTitle = isBp220 ? 'Economic housing rule' : 'National Building Code'

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-muted/25 p-1.5" role="complementary" aria-label="Parking requirement result">
      <section className="min-w-0 shrink-0 rounded-lg bg-card p-2.5 shadow-sm">
        <div className="uppercase tracking-[0.12em] text-muted-foreground" style={sectionTitleStyle}>Parking requirement</div>

        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground" style={{ fontFamily: MONO }}>
              Project type
            </div>
            <div className="mt-1 whitespace-nowrap text-[12.5px] font-semibold leading-none text-foreground">
              {selectedTypology?.displayLabel ?? 'Selected project'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[50px] font-bold leading-[1.1] tabular-nums text-primary" style={{ fontFamily: MONO }}>
              {checks.requiredParkingSlots}
            </div>
            <div className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">total slots</div>
          </div>
        </div>

        <div className="mt-2 grid gap-1.5 rounded-md bg-muted/45 px-2.5 py-1.5">
          <DottedResultRow label={selectedTypology?.basisLabel ?? 'Basis'} value={formatBasis(basisValue, selectedTypology?.basisUnit)} />
          <DottedResultRow label="Rate" value={selectedTypology ? formatRatio(selectedTypology.per, selectedTypology.basisUnit) : '1 per unit'} />
          <DottedResultRow label="Accessible included" value={formatSlotCount(checks.requiredAccessible)} />
          <DottedResultRow label="EV included" value={formatSlotCount(checks.requiredEvSlots)} />
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-rows-3 gap-2">
        <CompactLawCard
          law={primaryLaw}
          title={primaryLawTitle}
          color={primaryLawColor}
          rows={[
            { label: 'Rate', value: selectedTypology ? formatRatio(selectedTypology.per, selectedTypology.basisUnit) : 'Selected ratio' },
            { label: 'Basis', value: formatBasis(basisValue, selectedTypology?.basisUnit) },
            { label: 'Section', value: formatLegalLocator(selectedSource?.section_locator, selectedSource?.source_rule_id) },
          ]}
        />
        <CompactLawCard
          law="BP 344"
          title="Accessibility Law"
          color={LAW_COLORS.BP_344}
          rows={[
            { label: 'Band', value: formatAccessibleBand(checks.requiredParkingSlots) },
            { label: 'Required', value: formatSlotCount(checks.requiredAccessible) },
            { label: 'Section', value: formatLegalLocator(bp344CountSource?.section_locator, bp344CountSource?.source_rule_id) },
          ]}
        />
        <CompactLawCard
          law="RA 11697"
          title="EV allocation"
          color={LAW_COLORS.RA_11697}
          rows={[
            { label: 'Band', value: formatEvBand(checks.requiredParkingSlots) },
            { label: 'Required', value: formatSlotCount(checks.requiredEvSlots) },
            { label: 'Section', value: formatLegalLocator(ra11697EvSource?.section_locator, ra11697EvSource?.source_rule_id) },
          ]}
        />
      </div>
    </div>
  )
})
