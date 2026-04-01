'use client'

// ─── Output Panel (Right Panel — Priority-Ordered) ─────────────────────────
// Replaces the single-scroll RightToolbar with 5 priority-ordered sections:
//   1. Compliance Status (always visible, never collapses)
//   2. AMBF Three-Way Check (expanded by default)
//   3. Area Closure Identity (expanded by default)
//   4. Detailed Scorecard (collapsed by default — compact grid when collapsed)
//   5. Code Reference (collapsed by default)

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { ComplianceSummary } from './ComplianceSummary'
import { AMBFThreeWayPanel } from './AMBFThreeWayPanel'
import { ClosureEquationStrip } from './ClosureEquationStrip'
import { ComplianceScorecard } from './ComplianceScorecard'
import { CompactScorecardGrid } from './CompactScorecardGrid'
import { CollapsibleSection } from './CollapsibleSection'

export function OutputPanel() {
  const checks = useDevControlsStore((s) => s.result.checks)
  const failCount = checks.filter((c) => !c.compliant).length

  return (
    <div className="flex h-full flex-col">
      {/* Section 1: Compliance Status — always visible, never collapses */}
      <ComplianceSummary />

      {/* Scrollable sections below */}
      <div className="flex-1 overflow-y-auto">
        {/* Section 2: AMBF Three-Way Check */}
        <CollapsibleSection
          title="AMBF Three-Way Check"
          defaultOpen
          persistKey="ambf-check"
        >
          <AMBFThreeWayPanel />
        </CollapsibleSection>

        {/* Section 3: Area Closure Identity */}
        <CollapsibleSection
          title="Area Closure Identity"
          defaultOpen
          persistKey="closure-identity"
        >
          <ClosureEquationStrip />
        </CollapsibleSection>

        {/* Section 4: Detailed Scorecard — collapsed by default */}
        <CollapsibleSection
          title="Detailed Scorecard"
          badge={
            failCount > 0 ? (
              <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 font-mono text-[9px] font-medium text-red-800">
                {failCount} &#9888;
              </span>
            ) : undefined
          }
          defaultOpen={false}
          persistKey="scorecard-detail"
        >
          <ComplianceScorecard />
        </CollapsibleSection>

        {/* Compact grid shown between scorecard sections (always visible) */}
        <div className="border-b border-border px-4 py-2">
          <CompactScorecardGrid checks={checks} />
        </div>

        {/* Section 5: Code Reference — collapsed by default */}
        <CollapsibleSection
          title="Code Reference"
          defaultOpen={false}
          persistKey="code-ref"
        >
          <div>
            <p className="text-xs text-foreground">
              PD 1096 Rules VII & VIII — Site Development Controls
            </p>
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">
              2004 Revised IRR (DPWH, April 2005)
            </p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Rule VII — Classification of All Buildings by Use or Type of Occupancy (Sections 701–709)
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Rule VIII — Types of Construction (Sections 801–811)
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Table VIII.1 — Percentages of Site Occupancy
            </p>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  )
}
