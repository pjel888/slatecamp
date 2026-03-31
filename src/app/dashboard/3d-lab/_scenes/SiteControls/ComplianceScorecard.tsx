'use client'

import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Pass/fail compliance readout for PD 1096 site development controls.
 * 5 items per the spec, with correct IRR citations from Rule VII/VIII.
 */
export function ComplianceScorecard() {
  const computed = useSiteControlsStore((s) => s.computed)
  const floorHeight = useSiteControlsStore((s) => s.inputs.floorHeight)
  const {
    compliance, violations, ambf, tosl, tla, isa, usa, maca, pso, tgfa, bhl,
    setbacks, zoningData, lotCoverageMax, isaPercent, usaPercent,
  } = computed

  const checks = [
    {
      label: `AMBF ${ambf.toFixed(1)} sqm`,
      pass: compliance.ambfOk,
      citation: 'Rule VIII, Sec. 803, Table VIII.1',
      detail: compliance.ambfOk
        ? `Within ${(lotCoverageMax * 100).toFixed(0)}% PSO limit (max ${(lotCoverageMax * tla).toFixed(1)} sqm)`
        : `Exceeds max ${(lotCoverageMax * tla).toFixed(1)} sqm`,
    },
    {
      label: `TOSL ${tosl.toFixed(1)} sqm`,
      pass: compliance.toslOk,
      citation: 'Rule VIII, Sec. 803, Table VIII.1 (note d)',
      detail: compliance.toslOk
        ? `Open space meets ${((1 - lotCoverageMax) * 100).toFixed(0)}% minimum`
        : `Below minimum ${((1 - lotCoverageMax) * tla).toFixed(1)} sqm`,
    },
    {
      label: 'TLA identity',
      pass: compliance.identityOk,
      citation: 'Rule VIII, Sec. 803 (AMBF + ISA + USA = TLA)',
      detail: `${ambf.toFixed(1)} + ${isa.toFixed(1)} + ${usa.toFixed(1)} = ${(ambf + isa + usa).toFixed(1)} (TLA: ${tla.toFixed(1)})`,
    },
    {
      label: `Front setback ${setbacks.front.toFixed(1)}m`,
      pass: compliance.setbacksOk,
      citation: 'Rule VII, Sec. 704 + Rule VIII, Sec. 804',
      detail: compliance.setbacksOk
        ? `Buildable: ${computed.buildableWidth.toFixed(1)}m x ${computed.buildableDepth.toFixed(1)}m`
        : 'Setbacks consume entire lot - no buildable area',
    },
    {
      label: `Floor height ${floorHeight.toFixed(1)}m`,
      pass: compliance.floorHeightOk,
      citation: 'Rule VIII, Sec. 805',
      detail: compliance.floorHeightOk ? 'Meets 2.7m habitable minimum' : 'Below 2.7m habitable minimum',
    },
  ]

  const passCount = checks.filter((c) => c.pass).length
  const allPass = passCount === checks.length

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

      {/* Live computed values - all 7 metrics from the spec */}
      <div className="border-t border-[#D4DAE3] pt-2">
        <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-[#8896A7]">
          Computed Values
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <MetricRow label="TLA" value={`${tla.toFixed(1)} sqm`} />
          <MetricRow label="AMBF" value={`${ambf.toFixed(1)} sqm`} />
          <MetricRow label="PSO" value={`${(pso * 100).toFixed(1)}%`} sub="ratio" />
          <MetricRow label="TOSL" value={`${tosl.toFixed(1)} sqm`} />
          <MetricRow label="ISA" value={`${isa.toFixed(1)} sqm`} sub={`${(isaPercent * 100).toFixed(0)}% table`} />
          <MetricRow label="USA" value={`${usa.toFixed(1)} sqm`} sub={`${(usaPercent * 100).toFixed(0)}% table`} />
          <MetricRow label="MACA" value={`${maca.toFixed(1)} sqm`} sub="AMBF+ISA" />
          <MetricRow label="TGFA" value={`${tgfa.toFixed(1)} sqm`} />
          <MetricRow label="BHL" value={`${bhl.toFixed(1)} m`} />
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

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <span className="text-[10px] text-[#8896A7]">{label}</span>
        {sub && <span className="ml-1 text-[8px] text-[#8896A7]/50">{sub}</span>}
      </div>
      <span className="font-mono text-[11px] font-medium text-[#1A2332]">{value}</span>
    </div>
  )
}
