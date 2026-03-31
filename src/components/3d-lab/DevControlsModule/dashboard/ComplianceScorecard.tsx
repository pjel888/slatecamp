'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

export function ComplianceScorecard() {
  const checks = useDevControlsStore((s) => s.result.checks)
  const overallCompliant = useDevControlsStore((s) => s.result.overallCompliant)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Compliance Scorecard
        </label>
        <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-medium ${
          overallCompliant
            ? 'bg-[#EDFAF4] text-[#2D9F6F]'
            : 'bg-[#FDF0F0] text-[#D64545]'
        }`}>
          {overallCompliant ? 'COMPLIANT' : 'VIOLATION'}
        </span>
      </div>

      <div className="space-y-1.5">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`rounded-sm border p-2 ${
              check.compliant
                ? 'border-[#2D9F6F]/20 bg-[#EDFAF4]'
                : 'border-[#D64545]/20 bg-[#FDF0F0]'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-medium text-[#1A2332]">{check.label}</span>
              <span className={`text-[9px] font-medium ${
                check.compliant ? 'text-[#2D9F6F]' : 'text-[#D64545]'
              }`}>
                {check.compliant ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 text-[10px]">
              <span className="text-[#8896A7]">Required:</span>
              <span className="font-mono text-[#1A2332]">{check.required.toFixed(1)} {check.unit}</span>
              <span className="text-[#8896A7]">Actual:</span>
              <span className={`font-mono ${check.compliant ? 'text-[#1A2332]' : 'text-[#D64545]'}`}>
                {check.actual.toFixed(1)} {check.unit}
              </span>
            </div>
            {!check.compliant && check.excess !== undefined && check.excess > 0 && (
              <p className="mt-0.5 text-[9px] text-[#D64545]">
                Excess: {check.excess.toFixed(1)} {check.unit}
              </p>
            )}
            {!check.compliant && check.shortfall !== undefined && check.shortfall > 0 && (
              <p className="mt-0.5 text-[9px] text-[#D64545]">
                Shortfall: {check.shortfall.toFixed(1)} {check.unit}
              </p>
            )}
            <p className="mt-0.5 font-mono text-[8px] text-[#8896A7]">{check.codeReference}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
