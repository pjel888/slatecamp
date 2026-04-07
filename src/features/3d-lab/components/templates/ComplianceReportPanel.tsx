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
  color: string
  scope: string
  citation: string
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
    color: '#E74C3C',
    scope: 'Exit stair · Life-safety overlay',
    citation: 'RA 9514 IRR · BFP',
    priority: 4,
    isActive: (p) => p.isExitStair === true || p.isExitStair === 'true',
  },
  bp344: {
    label: 'BP 344 — Accessibility',
    color: '#3498DB',
    scope: 'Accessible route overlay',
    citation: 'BP 344 IRR · DPWH',
    priority: 3,
    isActive: (p) => p.isAccessibleRoute === true || p.isAccessibleRoute === 'true',
  },
  pd1096: {
    label: 'PD 1096 — NBCP',
    color: '#4A7FAD',
    scope: 'Baseline · All buildings',
    citation: 'PD 1096 · DPWH',
    priority: 2,
    isActive: (p) => !isBP220Project(p),
  },
  bp220: {
    label: 'BP 220 — Housing',
    color: '#F5A623',
    scope: 'Economic / Socialized Housing',
    citation: 'BP 220 IRR · DHSUD',
    priority: 1,
    isActive: (p) => isBP220Project(p),
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLawPrefix(id: string): string {
  return id.split('-')[0]
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

// ─── Total Badge ────────────────────────────────────────────────────────────

function TotalBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span
        className="rounded-full px-2 py-0.5 font-semibold"
        style={{
          fontSize: 10,
          backgroundColor: 'rgba(46, 204, 113, 0.12)',
          color: '#2ECC71',
          fontFamily: MONO,
        }}
      >
        ALL PASS
      </span>
    )
  }

  return (
    <span
      className="rounded-full px-2 py-0.5 font-semibold"
      style={{
        fontSize: 10,
        backgroundColor: 'rgba(231, 76, 60, 0.12)',
        color: '#E74C3C',
        fontFamily: MONO,
      }}
    >
      {count} {count === 1 ? 'VIOLATION' : 'VIOLATIONS'}
    </span>
  )
}

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({
  allPass,
  activeCount,
  color,
}: {
  allPass: boolean
  activeCount: number
  color: string
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
        backgroundColor: `${color}18`,
        color,
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
  lawColor,
}: {
  ev: EvaluatedViolation
  lawColor: string
}) {
  const { rule, active } = ev
  const isError = active && rule.severity === 'error'
  const isWarning = active && rule.severity === 'warning'
  const isInfo = active && rule.severity === 'info'

  return (
    <div className="flex items-start gap-2 px-3 py-1.5 border-t border-border first:border-t-0">
      <div className="shrink-0 mt-px">
        {isError && (
          <span style={{ color: lawColor }}>
            <SCIcon icon={XCircle} size="xs" />
          </span>
        )}
        {isWarning && (
          <SCIcon icon={Warning} size="xs" className="text-amber-500" />
        )}
        {isInfo && (
          <SCIcon icon={Info} size="xs" className="text-blue-400" />
        )}
        {!active && (
          <SCIcon icon={CheckCircle} size="xs" className="text-emerald" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'leading-snug',
            isError ? 'font-medium' : 'text-muted-foreground'
          )}
          style={{ fontSize: 11, color: isError ? lawColor : undefined }}
        >
          {rule.message}
        </div>
      </div>
    </div>
  )
}

// ─── Law Card ───────────────────────────────────────────────────────────────

function LawCard({ group }: { group: LawGroup }) {
  const { meta, violations, activeCount } = group
  const allPass = activeCount === 0

  return (
    <div className="rounded-md border border-border overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div
          className="w-[3px] h-8 rounded-full shrink-0"
          style={{ backgroundColor: meta.color }}
        />
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-foreground"
            style={{ fontSize: 11, letterSpacing: '0.02em' }}
          >
            {meta.label}
          </div>
          <div className="text-muted-foreground truncate" style={{ fontSize: 10 }}>
            {meta.scope}
          </div>
        </div>
        <StatusBadge
          allPass={allPass}
          activeCount={activeCount}
          color={meta.color}
        />
      </div>

      {/* Dimension checks */}
      <div className="border-t border-border">
        {violations.map((ev) => (
          <CheckRow key={ev.rule.id} ev={ev} lawColor={meta.color} />
        ))}
      </div>

      {/* Citation */}
      <div
        className="border-t border-border px-3 py-1.5 flex items-center gap-1"
        style={{ fontSize: 10 }}
      >
        <span className="text-muted-foreground/50">Source:</span>
        <span className="text-muted-foreground">{meta.citation}</span>
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

  const { lawGroups, conflicts, totalActive } = useMemo(() => {
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
    groups.sort((a, b) => b.meta.priority - a.meta.priority)

    // Conflicts use original params (they depend on actual project config)
    const conflictViolations: EvaluatedViolation[] = conflictRules
      .map((rule) => ({
        rule,
        active: rule.check(params),
        lawPrefix: 'conflict',
      }))
      .filter((ev) => ev.active)

    // Total counts only errors from applicable (governing) laws
    const total = groups
      .filter((g) => g.applicable)
      .reduce(
        (sum, g) =>
          sum + g.violations.filter((e) => e.active && e.rule.severity === 'error').length,
        0
      )

    return { lawGroups: groups, conflicts: conflictViolations, totalActive: total }
  }, [violations, params])

  return (
    <div
      className={cn(
        embedded
          ? 'h-full overflow-y-auto'
          : cn(
              'absolute right-0 top-0 bottom-0 z-10 w-[280px] overflow-y-auto',
              'bg-card border-l border-border',
              'max-md:hidden'
            )
      )}
      role="complementary"
      aria-label="Compliance report"
    >
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <span
            className="text-muted-foreground uppercase"
            style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em' }}
          >
            Compliance Report
          </span>
          <TotalBadge count={totalActive} />
        </div>
      </div>

      <div className="p-3 space-y-3">
        {lawGroups.map((group) => (
          <LawCard key={group.prefix} group={group} />
        ))}

        <ConflictBanner conflicts={conflicts} />

        <div
          className="rounded-sm bg-background px-3 py-2 leading-relaxed text-muted-foreground/60"
          style={{ fontSize: 10 }}
        >
          Visual design aid only. Final authority rests with your LGU Building
          Official and the Bureau of Fire Protection.
        </div>
      </div>
    </div>
  )
})
