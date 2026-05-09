'use client'

import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type {
  SourceGateStatus,
  SourceTruthConfig,
  SourceTruthRule,
  ViolationRule,
} from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

const MONO = 'var(--font-dm-mono), monospace'
const HUMAN_APPROVED_STATUS = 'HUMAN_APPROVED'
type Params = Record<string, number | boolean | string>

const gateTone: Record<SourceGateStatus, string> = {
  SOURCE_READY: 'border-emerald/30 bg-emerald/10 text-emerald',
  SOURCE_PENDING: 'border-warning/30 bg-warning/10 text-warning',
  SOURCE_INCOMPLETE: 'border-destructive/30 bg-destructive/10 text-destructive',
}

function hasCompleteSourceRule(rule: SourceTruthRule): boolean {
  return Boolean(
    rule.source_rule_id &&
      rule.source_card_id &&
      rule.source_candidate_id &&
      rule.source_sha256 &&
      rule.document_path &&
      rule.page_locator &&
      rule.section_locator &&
      rule.exact_quote &&
      rule.normalized_rule &&
      rule.classification &&
      rule.compliance_scope &&
      rule.human_review_status &&
      rule.fail_closed_when_source_missing,
  )
}

function evaluateGate(sourceTruth: SourceTruthConfig) {
  const missingMetadataCount = sourceTruth.sourceRules.filter((rule) => !hasCompleteSourceRule(rule)).length
  const pendingCount = sourceTruth.sourceRules.filter(
    (rule) => rule.human_review_status !== HUMAN_APPROVED_STATUS,
  ).length

  if (missingMetadataCount > 0) {
    return {
      status: 'SOURCE_INCOMPLETE' as const,
      canShowSourceBackedCompliance: false,
      pendingCount,
      missingMetadataCount,
    }
  }

  if (pendingCount > 0 || !sourceTruth.canShowSourceBackedCompliance) {
    return {
      status: 'SOURCE_PENDING' as const,
      canShowSourceBackedCompliance: false,
      pendingCount,
      missingMetadataCount,
    }
  }

  return {
    status: 'SOURCE_READY' as const,
    canShowSourceBackedCompliance: true,
    pendingCount,
    missingMetadataCount,
  }
}

function sourceRuleLabel(rule: SourceTruthRule) {
  const locator = `p.${rule.page_locator} · ${rule.section_locator}`
  return `${rule.normalized_rule} (${locator})`
}

interface SourceCompliancePanelProps {
  sourceTruth: SourceTruthConfig
  violations?: ViolationRule[]
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  embedded?: boolean
}

export const SourceCompliancePanel = memo(function SourceCompliancePanel({
  sourceTruth,
  violations = [],
  useStore,
  embedded = false,
}: SourceCompliancePanelProps) {
  const params = useStore((state) => state.params)
  const evaluated = useMemo(() => evaluateGate(sourceTruth), [sourceTruth])
  const sourceRulesById = useMemo(
    () => new Map(sourceTruth.sourceRules.map((rule) => [rule.source_rule_id, rule])),
    [sourceTruth.sourceRules],
  )
  const evaluatedRules = useMemo(
    () => violations.map((rule) => ({
      rule,
      sourceRule: rule.sourceRuleId ? sourceRulesById.get(rule.sourceRuleId) : undefined,
      active: rule.check(params as Params),
    })),
    [params, sourceRulesById, violations],
  )

  const activeErrors = evaluatedRules.filter((item) => item.active && item.rule.severity === 'error')
  const activeWarnings = evaluatedRules.filter((item) => item.active && item.rule.severity !== 'error')

  return (
    <div
      className={cn(
        embedded
          ? 'h-full overflow-y-auto'
          : 'absolute right-0 top-0 bottom-0 z-10 w-[320px] overflow-y-auto bg-card border-l border-border max-md:hidden',
      )}
      role="complementary"
      aria-label="Source compliance checklist"
    >
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-muted-foreground uppercase"
            style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em' }}
          >
            Source / Compliance
          </span>
          <span
            className={cn('rounded-full border px-2 py-0.5 font-semibold', gateTone[evaluated.status])}
            style={{ fontFamily: MONO, fontSize: 10 }}
          >
            {evaluated.status.replace('_', ' ')}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Compliance logic fails closed until source metadata is complete and human-approved.
        </p>
      </div>

      <div className="space-y-3 p-3">
        <section className="rounded-md border border-border bg-card p-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Runtime status
          </h3>
          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
            <p>Active errors: {activeErrors.length}</p>
            <p>Active review warnings: {activeWarnings.length}</p>
            <p>Pending source rules: {evaluated.pendingCount}</p>
            <p>Missing metadata: {evaluated.missingMetadataCount}</p>
          </div>
          {evaluated.status !== 'SOURCE_READY' && (
            <div className="mt-3 rounded-sm border border-warning/25 bg-warning/10 p-2 text-[11px] leading-relaxed text-warning">
              Do not label this view as source-backed for learners yet. Use it for dashboard/source QA only.
            </div>
          )}
        </section>

        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Ramp checklist
            </h3>
          </div>
          <div className="divide-y divide-border">
            {evaluatedRules.map(({ rule, sourceRule, active }) => (
              <div key={rule.id} className="px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-[11px] leading-snug', active ? 'font-medium text-destructive' : 'text-foreground')}>
                    {rule.message}
                  </p>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 font-semibold',
                      active ? 'bg-destructive/10 text-destructive' : 'bg-emerald/10 text-emerald',
                    )}
                    style={{ fontFamily: MONO, fontSize: 9 }}
                  >
                    {active ? rule.severity.toUpperCase() : evaluated.status === 'SOURCE_READY' ? 'PASS' : 'CALC OK'}
                  </span>
                </div>
                {sourceRule && (
                  <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                    Source pending: {sourceRule.source_card_id} · p.{sourceRule.page_locator}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Source rules
            </h3>
          </div>
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
            {sourceTruth.sourceRules.map((rule) => (
              <details key={rule.source_rule_id} className="px-3 py-2">
                <summary className="cursor-pointer text-[11px] leading-snug text-foreground">
                  {sourceRuleLabel(rule)}
                </summary>
                <blockquote className="mt-2 border-l-2 border-primary/25 pl-2 text-[10px] leading-relaxed text-muted-foreground">
                  {rule.exact_quote}
                </blockquote>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
})

interface SourceComplianceStatusBarProps {
  sourceTruth: SourceTruthConfig
  violations?: ViolationRule[]
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

export const SourceComplianceStatusBar = memo(function SourceComplianceStatusBar({
  sourceTruth,
  violations = [],
  useStore,
}: SourceComplianceStatusBarProps) {
  const params = useStore((state) => state.params)
  const evaluated = useMemo(() => evaluateGate(sourceTruth), [sourceTruth])
  const activeErrors = useMemo(
    () => violations.filter((rule) => rule.check(params as Params) && rule.severity === 'error').length,
    [params, violations],
  )
  const activeWarnings = useMemo(
    () => violations.filter((rule) => rule.check(params as Params) && rule.severity !== 'error').length,
    [params, violations],
  )

  return (
    <div className="flex w-full items-center justify-between gap-3 px-3 text-[11px] text-muted-foreground">
      <span>BP 344 ramp QA: {activeErrors} errors · {activeWarnings} review warnings</span>
      <span style={{ fontFamily: MONO }}>Source gate: {evaluated.status}</span>
    </div>
  )
})
