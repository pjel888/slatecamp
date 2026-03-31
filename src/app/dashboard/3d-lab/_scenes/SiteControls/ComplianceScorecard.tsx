'use client'

import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'

interface ScorecardItem {
  label: string
  pass: boolean
  value: string
  citation: string
}

/**
 * 5-item compliance scorecard with pass/fail indicators and IRR citations.
 * Checks: AMBF, TOSL, identity (AMBF+ISA+USA=TLA), front setback, side/rear setbacks.
 */
export function ComplianceScorecard() {
  const computed = useSiteControlsStore((s) => s.computed)
  const { compliance, ambf, ambf_by_pso, tosl, tla, isa, usa, setbacks, lotCoverageMax } = computed

  const minTosl = (1 - lotCoverageMax) * tla

  const items: ScorecardItem[] = [
    {
      label: 'AMBF compliance',
      pass: compliance.ambfOk,
      value: `${ambf.toFixed(1)} <= ${ambf_by_pso.toFixed(1)} sqm`,
      citation: SITE_CONTROL_CITATIONS.ambf,
    },
    {
      label: 'TOSL compliance',
      pass: compliance.toslOk,
      value: `${tosl.toFixed(1)} >= ${minTosl.toFixed(1)} sqm`,
      citation: SITE_CONTROL_CITATIONS.tosl,
    },
    {
      label: 'Identity (AMBF+ISA+USA=TLA)',
      pass: compliance.identityOk,
      value: `${(ambf + isa + usa).toFixed(1)} = ${tla.toFixed(1)}`,
      citation: SITE_CONTROL_CITATIONS.tla,
    },
    {
      label: 'Front setback',
      pass: compliance.setbacksOk,
      value: `${setbacks.front.toFixed(1)}m provided`,
      citation: SITE_CONTROL_CITATIONS.setbacks,
    },
    {
      label: 'Side/Rear setbacks',
      pass: compliance.setbacksOk,
      value: `S: ${setbacks.left.toFixed(1)}m / R: ${setbacks.rear.toFixed(1)}m`,
      citation: SITE_CONTROL_CITATIONS.setbacks,
    },
  ]

  const passCount = items.filter((i) => i.pass).length
  const allPass = passCount === items.length

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Compliance
        </span>
        <span className={`text-xs font-medium ${allPass ? 'text-[#2D9F6F]' : 'text-[#D64545]'}`}>
          {allPass ? 'All requirements met' : `${passCount}/${items.length} met`}
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 rounded-sm border border-[#D4DAE3] px-2.5 py-2"
          >
            <span className={`mt-0.5 text-xs leading-none ${item.pass ? 'text-[#2D9F6F]' : 'text-[#D64545]'}`}>
              {item.pass ? '\u25CF' : '\u25CB'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#1A2332]">{item.label}</p>
              <p className="font-mono text-[10px] text-[#4A5568]">{item.value}</p>
              <p className="font-mono text-[9px] text-[#8896A7]">{item.citation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
