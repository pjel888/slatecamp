// src/app/dashboard/3d-lab/_components/ComplianceReportPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Right-side compliance report panel for multi-law parametric modules.
// ALL law cards always show. Inactive laws display "NOT APPLICABLE".
// Active laws show COMPLIANT or violation count with per-dimension checks.
// ─────────────────────────────────────────────────────────────────────────────
'use client'

import { memo, useMemo } from 'react'
import {
  CheckCircle,
  XCircle,
  Warning,
  Info,
} from '@phosphor-icons/react/dist/ssr'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { ViolationRule } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

const MONO = 'var(--font-dm-mono), monospace'

// ─── Law Metadata Registry ──────────────────────────────────────────────────

type P = Record<string, number | boolean | string>

interface LawMeta {
  label: string
  shortLabel: string
  description: string
  color: string
  priority: number
  isActive: (params: P) => boolean
}

function isBP220Project(params: P): boolean {
  const pt = String(params.projectType ?? '')
  return pt === 'bp220_socialized' || pt === 'bp220_economic'
}

const LAWS: Record<string, LawMeta> = {
  ra9514: {
    label: 'RA 9514 — Fire Code',
    shortLabel: 'RA 9514',
    description: 'Fire Code checks for stairs used as exits. In this module, it focuses on safe egress dimensions such as exit-stair riser height, tread depth, clear width, and vertical rise per flight.',
    color: '#E74C3C',
    priority: 4,
    isActive: (p) => p.isExitStair === true || p.isExitStair === 'true',
  },
  bp344: {
    label: 'BP 344 — Accessibility',
    shortLabel: 'BP 344',
    description: 'Accessibility Law checks for stairs that form part of an accessible route. In this module, it highlights accessible stair proportions, clear stair width, and dual handrail height.',
    color: '#D97706',
    priority: 3,
    isActive: (p) => p.isAccessibleRoute === true || p.isAccessibleRoute === 'true',
  },
  pd1096: {
    label: 'PD 1096 — NBCP',
    shortLabel: 'PD 1096',
    description: 'National Building Code checks for general stair safety and habitability. In this module, it tests core stair proportions such as riser height, tread depth, headroom, clear width, handrail height, and rise per flight.',
    color: '#4A7FAD',
    priority: 2,
    isActive: (p) => !isBP220Project(p),
  },
  bp220: {
    label: 'BP 220 — Housing',
    shortLabel: 'BP 220',
    description: 'Economic and socialized housing checks. It applies when the project type is set to BP 220 housing and uses its own minimum stair dimensions for compact residential planning.',
    color: '#16A34A',
    priority: 1,
    isActive: (p) => isBP220Project(p),
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLawPrefix(id: string): string {
  return id.split('-')[0]
}

const REQUIREMENT_LABELS: Record<string, { description: string; value: string }> = {
  'pd1096-max-riser': { description: 'Riser height', value: '≤ 200 mm' },
  'pd1096-min-tread': { description: 'Tread depth', value: '≥ 200 mm' },
  'pd1096-min-headroom': { description: 'Headroom', value: '≥ 2,000 mm' },
  'pd1096-max-vertical': { description: 'Vertical rise per flight', value: '≤ 3,600 mm' },
  'pd1096-min-width': { description: 'Width by occupancy', value: '≥ 750 / 900 / 1,100 mm' },
  'pd1096-handrail-range': { description: 'Handrail height', value: '800–900 mm' },
  'ra9514-max-riser': { description: 'Exit stair riser', value: '≤ 180 mm' },
  'ra9514-min-width': { description: 'Exit stair width', value: '≥ 900 mm' },
  'ra9514-min-tread': { description: 'Exit stair tread', value: '≥ 200 mm' },
  'ra9514-max-vertical': { description: 'Vertical rise per flight', value: '≤ 3,000 mm' },
  'bp220-max-riser': { description: 'Riser height', value: '≤ 250 mm' },
  'bp220-min-tread': { description: 'Tread depth', value: '≥ 200 mm' },
  'bp220-min-width': { description: 'Clear width', value: '≥ 600 mm' },
  'bp344-max-riser': { description: 'Accessible stair riser', value: '≤ 150 mm' },
  'bp344-min-tread': { description: 'Accessible stair tread', value: '≥ 300 mm' },
  'bp344-min-width': { description: 'Accessible stair width', value: '≥ 1,500 mm' },
  'bp344-handrail-upper': { description: 'Upper handrail height', value: '900 mm' },
}

function requirementLabel(rule: ViolationRule): string {
  const label = REQUIREMENT_LABELS[rule.id]
  return label ? `${label.description} ${label.value}` : rule.message.replace(/^(PD 1096|RA 9514|BP 220|BP 344):\s*/i, '')
}

function requirementParts(rule: ViolationRule): { description: string; value: string } {
  return REQUIREMENT_LABELS[rule.id] ?? { description: requirementLabel(rule), value: '' }
}

// ─── Internal Types ─────────────────────────────────────────────────────────

interface EvaluatedViolation {
  rule: ViolationRule
  active: boolean
  lawPrefix: string
}

interface LawGroup {
  prefix: string
  meta: LawMeta
  violations: EvaluatedViolation[]
  activeCount: number
  /** Whether this law applies to the current project configuration */
  applicable: boolean
}

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({
  allPass,
  activeCount,
}: {
  allPass: boolean
  activeCount: number
}) {
  if (allPass) {
    return (
      <span
        className="shrink-0 rounded-full px-2 py-0.5 font-semibold"
        style={{
          fontSize: 10,
          backgroundColor: 'rgba(46, 204, 113, 0.12)',
          color: '#2ECC71',
          fontFamily: MONO,
        }}
      >
        COMPLIANT
      </span>
    )
  }

  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 font-semibold"
      style={{
        fontSize: 10,
        backgroundColor: 'rgba(220, 38, 38, 0.12)',
        color: '#DC2626',
        fontFamily: MONO,
      }}
    >
      {activeCount} {activeCount === 1 ? 'ISSUE' : 'ISSUES'}
    </span>
  )
}

// ─── Check Row ──────────────────────────────────────────────────────────────

function CheckRow({
  ev,
}: {
  ev: EvaluatedViolation
}) {
  const { rule, active } = ev
  const isError = active && rule.severity === 'error'
  const isWarning = active && rule.severity === 'warning'
  const isInfo = active && rule.severity === 'info'
  const isViolation = isError || isWarning || isInfo
  const label = requirementParts(rule)

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1', isViolation && 'bg-red-50/80')}>
      <div className="shrink-0 mt-px">
        {isError && (
          <span className="text-red-600">
            <SCIcon icon={XCircle} size="xs" />
          </span>
        )}
        {isWarning && (
          <SCIcon icon={Warning} size="xs" className="text-red-600" />
        )}
        {isInfo && (
          <SCIcon icon={Info} size="xs" className="text-red-600" />
        )}
        {!active && (
          <SCIcon icon={CheckCircle} size="xs" className="text-emerald" />
        )}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <div
          className={cn(
            'truncate leading-snug',
            isViolation ? 'font-medium text-red-700' : 'text-muted-foreground'
          )}
          style={{ fontSize: 11 }}
          title={requirementLabel(rule)}
        >
          {label.description}
        </div>
        <div
          className={cn(
            'shrink-0 whitespace-nowrap text-right font-semibold tabular-nums leading-snug',
            isViolation ? 'text-red-700' : 'text-foreground'
          )}
          style={{ fontSize: 11, fontFamily: MONO }}
        >
          {label.value}
        </div>
      </div>
    </div>
  )
}

// ─── Law Card ───────────────────────────────────────────────────────────────

function LawInfoButton({ meta }: { meta: LawMeta }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label={`Explain ${meta.shortLabel}`}
        >
          <SCIcon icon={Info} size="xs" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" sideOffset={8} className="w-72 max-w-[300px]">
        <PopoverHeader>
          <PopoverTitle>{meta.label}</PopoverTitle>
          <PopoverDescription className="text-xs leading-relaxed">
            {meta.description}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

function LawCard({ group }: { group: LawGroup }) {
  const { meta, violations, activeCount } = group
  const allPass = activeCount === 0

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-card shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 px-3 py-2">
        <div
          className="w-[3px] h-7 rounded-full shrink-0"
          style={{ backgroundColor: meta.color }}
        />
        <LawInfoButton meta={meta} />
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-foreground"
            style={{ fontSize: 11, letterSpacing: '0.02em' }}
          >
            {meta.label}
          </div>
        </div>
        <StatusBadge
          allPass={allPass}
          activeCount={activeCount}
        />
      </div>

      {/* Dimension checks */}
      <div className="min-h-0 flex-1 border-t border-border">
        {violations.map((ev) => (
          <CheckRow key={ev.rule.id} ev={ev} />
        ))}
      </div>
    </div>
  )
}

// ─── Conflict Banner ────────────────────────────────────────────────────────

function ConflictBanner({
  conflicts,
}: {
  conflicts: EvaluatedViolation[]
}) {
  if (conflicts.length === 0) return null

  return (
    <div className="rounded-md border border-amber-300/40 bg-amber-50/60 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <SCIcon icon={Warning} size="xs" className="text-amber-600" />
        <span
          className="font-bold text-amber-700"
          style={{ fontSize: 11, fontFamily: MONO }}
        >
          CONFLICT DETECTED
        </span>
      </div>
      {conflicts.map((c) => (
        <p
          key={c.rule.id}
          className="text-muted-foreground leading-snug mt-1.5"
          style={{ fontSize: 11 }}
        >
          {c.rule.message}
        </p>
      ))}
      <div className="border-t border-amber-200/50 mt-2.5 pt-2">
        <p
          className="text-muted-foreground/70 leading-relaxed"
          style={{ fontSize: 10 }}
        >
          A conflict does not automatically mean noncompliance. Different laws
          apply to different project types. Verify which regime governs your
          project before proceeding.
        </p>
      </div>
    </div>
  )
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface ComplianceReportPanelProps {
  violations: ViolationRule[]
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  /** When true, renders without absolute positioning (for use inside LabPanelLayout) */
  embedded?: boolean
}

export const ComplianceReportPanel = memo(function ComplianceReportPanel({
  violations,
  useStore,
  embedded = false,
}: ComplianceReportPanelProps) {
  const params = useStore((s) => s.params)

  const { lawGroups, conflicts } = useMemo(() => {
    // Each law card evaluates its violations INDEPENDENTLY — as if that law
    // is active — so the card always reflects whether the current geometry
    // would pass or fail that code. This bypasses the project-type toggles
    // in the check functions by providing modified params per law.
    function evalParamsFor(prefix: string): P {
      switch (prefix) {
        case 'ra9514':
          return { ...params, isExitStair: true }
        case 'bp344':
          return { ...params, isAccessibleRoute: true }
        case 'pd1096':
          // Force non-BP220 so PD 1096 checks fire; preserve project type for width tiers
          if (isBP220Project(params)) return { ...params, projectType: 'general_residential' }
          return params
        case 'bp220':
          // Force BP220 so BP 220 checks fire
          if (!isBP220Project(params)) return { ...params, projectType: 'bp220_socialized' }
          return params
        default:
          return params
      }
    }

    // Group violations by law prefix first
    const groupMap = new Map<string, ViolationRule[]>()
    const conflictRules: ViolationRule[] = []
    for (const rule of violations) {
      const prefix = getLawPrefix(rule.id)
      if (prefix === 'conflict') {
        conflictRules.push(rule)
      } else {
        const existing = groupMap.get(prefix)
        if (existing) existing.push(rule)
        else groupMap.set(prefix, [rule])
      }
    }

    // Evaluate each law group with that law's eval params
    const groups: LawGroup[] = []
    for (const [prefix, rules] of groupMap) {
      const meta = LAWS[prefix]
      if (!meta) continue
      const applicable = meta.isActive(params)
      const evalP = evalParamsFor(prefix)
      const evs: EvaluatedViolation[] = rules.map((rule) => ({
        rule,
        active: rule.check(evalP),
        lawPrefix: prefix,
      }))
      const activeCount = evs.filter((e) => e.active).length
      groups.push({ prefix, meta, violations: evs, activeCount, applicable })
    }
    groups.sort((a, b) =>
      b.violations.length - a.violations.length || b.meta.priority - a.meta.priority
    )

    // Conflicts use original params (they depend on actual project config)
    const conflictViolations: EvaluatedViolation[] = conflictRules
      .map((rule) => ({
        rule,
        active: rule.check(params),
        lawPrefix: 'conflict',
      }))
      .filter((ev) => ev.active)

    return { lawGroups: groups, conflicts: conflictViolations }
  }, [violations, params])

  return (
    <div
      className={cn(
        embedded
          ? 'h-full overflow-hidden'
          : cn(
              'absolute right-0 top-0 bottom-0 z-10 min-w-[384px] overflow-hidden',
              'bg-card border-l border-border',
              'max-md:hidden'
            )
      )}
      role="complementary"
      aria-label="Compliance report"
    >
      <div className="grid h-full min-h-0 grid-rows-4 gap-1.5 p-1.5">
        {lawGroups.map((group) => (
          <LawCard key={group.prefix} group={group} />
        ))}
      </div>
      <ConflictBanner conflicts={conflicts} />
    </div>
  )
})
