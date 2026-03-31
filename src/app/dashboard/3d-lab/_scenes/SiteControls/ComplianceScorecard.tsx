'use client'

import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'

/**
 * Pass/fail compliance readout for PD 1096 site development controls.
 * Reads from the store's computed compliance and violations fields.
 * This is a 2D React component, not a 3D component.
 */
export function ComplianceScorecard() {
  const computed = useSiteControlsStore((s) => s.computed)
  const { compliance, violations, ambf, tosl, tla, isa, usa, maca, pso, setbacks, zoningData } = computed

  const checks = [
    {
      label: `AMBF ${ambf.toFixed(1)} sqm`,
      pass: compliance.ambfOk,
      citation: SITE_CONTROL_CITATIONS.ambf,
      detail: compliance.ambfOk
        ? `Within ${(zoningData.maxPSO * 100).toFixed(0)}% PSO limit`
        : `Exceeds max ${(zoningData.maxPSO * tla).toFixed(1)} sqm`,
    },
    {
      label: `TOSL ${tosl.toFixed(1)} sqm`,
      pass: compliance.toslOk,
      citation: SITE_CONTROL_CITATIONS.tosl,
      detail: compliance.toslOk
        ? `Open space meets minimum`
        : `Below minimum required`,
    },
    {
      label: `TLA identity`,
      pass: compliance.identityOk,
      citation: 'AMBF + TOSL = TLA',
      detail: `${ambf.toFixed(1)} + ${tosl.toFixed(1)} = ${tla.toFixed(1)}`,
    },
    {
      label: `Front setback ${setbacks.front.toFixed(1)}m`,
      pass: compliance.setbacksOk,
      citation: SITE_CONTROL_CITATIONS.setbacks,
      detail: compliance.setbacksOk ? 'Meets requirement' : 'Buildable area = 0',
    },
  ]

  const passCount = checks.filter((c) => c.pass).length
  const allPass = passCount === checks.length

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          Compliance Check
        </span>
        <span
          className={`font-mono text-xs font-semibold ${
            allPass ? 'text-emerald-600' : 'text-muted-foreground'
          }`}
        >
          {allPass ? 'All requirements met' : `${passCount}/${checks.length} met`}
        </span>
      </div>

      {/* Check items */}
      <div className="space-y-1.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2">
            <span
              className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                check.pass ? 'bg-emerald-500' : 'bg-red-400'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs font-medium text-foreground">
                  {check.label}
                </span>
                <span className={`text-[10px] font-medium ${check.pass ? 'text-emerald-600' : 'text-red-500'}`}>
                  {check.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{check.detail}</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">{check.citation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="border-t pt-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <MetricRow label="PSO" value={`${(pso * 100).toFixed(1)}%`} />
          <MetricRow label="ISA" value={`${isa.toFixed(1)} sqm`} />
          <MetricRow label="USA" value={`${usa.toFixed(1)} sqm`} />
          <MetricRow label="MACA" value={`${maca.toFixed(1)} sqm`} />
        </div>
      </div>

      {/* Violation messages */}
      {violations.length > 0 && (
        <div className="space-y-1 rounded-md bg-red-50 p-2">
          {violations.map((v, i) => (
            <p key={i} className="text-[10px] text-red-700">
              {v.message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[11px] font-medium text-foreground">{value}</span>
    </div>
  )
}
