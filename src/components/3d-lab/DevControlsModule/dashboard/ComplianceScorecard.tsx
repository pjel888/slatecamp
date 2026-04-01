'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

export function ComplianceScorecard() {
  const checks = useDevControlsStore((s) => s.result.checks)
  const overallCompliant = useDevControlsStore((s) => s.result.overallCompliant)
  const fpW = useDevControlsStore((s) => s.building.proposedFootprintWidth)
  const fpD = useDevControlsStore((s) => s.building.proposedFootprintDepth)
  const setbacks = useDevControlsStore((s) => s.result.setbacks.effective)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)

  // Check if the proposed footprint visually overflows the setback boundaries
  const buildableW = lotW - setbacks.left - setbacks.right
  const buildableD = lotD - setbacks.front - setbacks.rear
  const setbackOverflowW = fpW > buildableW
  const setbackOverflowD = fpD > buildableD
  const hasSetbackOverflow = setbackOverflowW || setbackOverflowD

  // FLAR/TGFA violation — proposed GFA exceeds allowable
  const proposedGFA = useDevControlsStore((s) => s.result.proposedGFA)
  const tgfa = useDevControlsStore((s) => s.result.tgfa)
  const flar = useDevControlsStore((s) => s.result.flar)
  const maxFloors = useDevControlsStore((s) => s.result.maxCompliantFloors)
  const proposedFloors = useDevControlsStore((s) => s.building.proposedStoreys)
  const hasFlarViolation = proposedGFA > tgfa + 0.01

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

      {/* Setback Non-Compliant warning — shown when footprint overflows setback boundaries */}
      {hasSetbackOverflow && (
        <div className="mt-2 rounded-sm border border-[#D4951A]/30 bg-[#FEF8ED] p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-[#D4951A]" />
            <span className="text-[10px] font-medium text-[#D4951A]">SETBACK NON-COMPLIANT</span>
          </div>
          <p className="text-[9px] text-[#4A5568] leading-relaxed">
            Proposed footprint ({fpW.toFixed(1)}m × {fpD.toFixed(1)}m) exceeds the setback-limited buildable area ({buildableW.toFixed(1)}m × {buildableD.toFixed(1)}m).
            {setbackOverflowW && ` Width exceeds by ${(fpW - buildableW).toFixed(1)}m.`}
            {setbackOverflowD && ` Depth exceeds by ${(fpD - buildableD).toFixed(1)}m.`}
          </p>
          <p className="mt-1 font-mono text-[8px] text-[#8896A7]">PD 1096 IRR Rule VIII, Sec. 804 — Minimum Setback Requirements</p>
        </div>
      )}

      {/* FLAR Limit Exceeded warning */}
      {hasFlarViolation && (
        <div className="mt-2 rounded-sm border border-[#D4951A]/30 bg-[#FEF8ED] p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-[#D4951A]" />
            <span className="text-[10px] font-medium text-[#D4951A]">FLAR LIMIT EXCEEDED</span>
          </div>
          <p className="text-[9px] text-[#4A5568] leading-relaxed">
            Proposed GFA ({proposedGFA.toFixed(0)} sqm) exceeds the allowable TGFA ({tgfa.toFixed(0)} sqm) at FLAR {flar.toFixed(2)}.
            Maximum compliant floors: {maxFloors}F. Currently proposing {proposedFloors}F — reduce by {proposedFloors - maxFloors} floor{proposedFloors - maxFloors !== 1 ? 's' : ''}.
          </p>
          <p className="mt-1 font-mono text-[8px] text-[#8896A7]">PD 1096 IRR Rule VII, Sec. 705, Table VII.G.1</p>
        </div>
      )}
    </div>
  )
}
