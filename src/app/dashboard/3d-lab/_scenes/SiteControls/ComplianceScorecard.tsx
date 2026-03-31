'use client'

import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'

/**
 * Pass/fail compliance readout for PD 1096 site development controls.
 * Enhanced with floorHeight check, TGFA/BHL metrics, and severity-aware violations.
 */
export function ComplianceScorecard() {
  const computed = useSiteControlsStore((s) => s.computed)
  const floorHeight = useSiteControlsStore((s) => s.inputs.floorHeight)
  const { compliance, violations, ambf, tosl, tla, isa, usa, maca, pso, tgfa, bhl, setbacks, zoningData } = computed

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
    {
      label: `Floor height ${floorHeight.toFixed(1)}m`,
      pass: compliance.floorHeightOk,
      citation: 'PD 1096 IRR Rule VIII §808',
      detail: compliance.floorHeightOk ? 'Meets 2.7m minimum' : 'Below 2.7m habitable minimum',
    },
  ]

  const passCount = checks.filter((c) => c.pass).length
  const allPass = passCount === checks.length

  // Separate violations by severity
  const errors = violations.filter((v) => v.severity === 'error')
  const warnings = violations.filter((v) => v.severity === 'warning')

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-wider text-[#8896A7]">
          Compliance Check
        </span>
        <span
          className={`font-mono text-xs font-semibold ${
            allPass ? 'text-[#2D9F6F]' : 'text-[#8896A7]'
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
                check.pass ? 'bg-[#2D9F6F]' : 'bg-[#D64545]'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs font-medium text-[#1A2332]">
                  {check.label}
                </span>
                <span className={`text-[10px] font-medium ${check.pass ? 'text-[#2D9F6F]' : 'text-[#D64545]'}`}>
                  {check.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-[10px] text-[#4A5568]">{check.detail}</p>
              <p className="font-mono text-[9px] text-[#8896A7]/60">{check.citation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="border-t border-[#D4DAE3] pt-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <MetricRow label="PSO" value={`${(pso * 100).toFixed(1)}%`} />
          <MetricRow label="TGFA" value={`${tgfa.toFixed(1)} sqm`} />
          <MetricRow label="BHL" value={`${bhl.toFixed(1)} m`} />
          <MetricRow label="ISA" value={`${isa.toFixed(1)} sqm`} />
          <MetricRow label="USA" value={`${usa.toFixed(1)} sqm`} />
          <MetricRow label="MACA" value={`${maca.toFixed(1)} sqm`} />
        </div>
      </div>

      {/* Error violations */}
      {errors.length > 0 && (
        <div className="space-y-1 rounded-md bg-[#FDF0F0] p-2">
          {errors.map((v, i) => (
            <p key={i} className="text-[10px] text-[#D64545]">
              {v.message}
            </p>
          ))}
        </div>
      )}

      {/* Warning violations */}
      {warnings.length > 0 && (
        <div className="space-y-1 rounded-md bg-[#FEF8ED] p-2">
          {warnings.map((v, i) => (
            <p key={i} className="text-[10px] text-[#D4951A]">
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
      <span className="text-[10px] text-[#8896A7]">{label}</span>
      <span className="font-mono text-[11px] font-medium text-[#1A2332]">{value}</span>
    </div>
  )
}
