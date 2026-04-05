'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

export function ComplianceScorecard() {
  const checks = useDevControlsStore((s) => s.result.checks)
  const overallCompliant = useDevControlsStore((s) => s.result.overallCompliant)
  const fpW = useDevControlsStore((s) => s.building.proposedFootprintWidth)
  const fpD = useDevControlsStore((s) => s.building.proposedFootprintDepth)
  // Use computed buildable dimensions (works for both rectangular and polygon lots)
  const buildableW = useDevControlsStore((s) => s.result.buildableWidth)
  const buildableD = useDevControlsStore((s) => s.result.buildableDepth)

  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const sbF = useDevControlsStore((s) => s.result.setbacks.effective.front)
  const sbL = useDevControlsStore((s) => s.result.setbacks.effective.left)

  // Setback encroachment — footprint exceeds buildable area within setbacks
  const setbackOverflowW = fpW > buildableW
  const setbackOverflowD = fpD > buildableD
  const hasSetbackOverflow = setbackOverflowW || setbackOverflowD

  // Lot boundary encroachment — footprint + setback origin exceeds lot boundary
  const lotOverflowW = sbL + fpW > lotW
  const lotOverflowD = sbF + fpD > lotD
  const hasLotOverflow = lotOverflowW || lotOverflowD

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
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Compliance Scorecard
        </label>
        <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-medium ${
          overallCompliant
            ? 'bg-success-50 text-success'
            : 'bg-destructive-50 text-destructive'
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
                ? 'border-success/20 bg-success-50'
                : 'border-destructive/20 bg-destructive-50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-medium text-foreground">{check.label}</span>
              <span className={`text-[9px] font-medium ${
                check.compliant ? 'text-success' : 'text-destructive'
              }`}>
                {check.compliant ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 text-[10px]">
              <span className="text-muted-foreground">Required:</span>
              <span className="font-mono text-foreground">{check.required.toFixed(1)} {check.unit}</span>
              <span className="text-muted-foreground">Actual:</span>
              <span className={`font-mono ${check.compliant ? 'text-foreground' : 'text-destructive'}`}>
                {check.actual.toFixed(1)} {check.unit}
              </span>
            </div>
            {!check.compliant && check.excess !== undefined && check.excess > 0 && (
              <p className="mt-0.5 text-[9px] text-destructive">
                Excess: {check.excess.toFixed(1)} {check.unit}
              </p>
            )}
            {!check.compliant && check.shortfall !== undefined && check.shortfall > 0 && (
              <p className="mt-0.5 text-[9px] text-destructive">
                Shortfall: {check.shortfall.toFixed(1)} {check.unit}
              </p>
            )}
            <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">{check.codeReference}</p>
          </div>
        ))}
      </div>

      {/* Lot Boundary Encroachment — critical violation */}
      {hasLotOverflow && (
        <div className="mt-2 rounded-sm border border-destructive-700/30 bg-destructive-50 p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-destructive-700" />
            <span className="text-[10px] font-medium text-destructive-700">LOT BOUNDARY ENCROACHMENT</span>
          </div>
          <p className="text-[9px] text-text-secondary leading-relaxed">
            Building footprint ({fpW.toFixed(1)}m × {fpD.toFixed(1)}m) extends beyond the lot boundary ({lotW.toFixed(1)}m × {lotD.toFixed(1)}m).
            {lotOverflowW && ` Width exceeds lot by ${(sbL + fpW - lotW).toFixed(1)}m.`}
            {lotOverflowD && ` Depth exceeds lot by ${(sbF + fpD - lotD).toFixed(1)}m.`}
          </p>
          <p className="mt-1 font-mono text-[8px] text-muted-foreground">PD 1096 — Building must be contained within property lines</p>
        </div>
      )}

      {/* Setback Non-Compliant warning — shown when footprint overflows setback boundaries */}
      {hasSetbackOverflow && (
        <div className="mt-2 rounded-sm border border-warning/30 bg-warning-50 p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-[10px] font-medium text-warning">SETBACK NON-COMPLIANT</span>
          </div>
          <p className="text-[9px] text-text-secondary leading-relaxed">
            Proposed footprint ({fpW.toFixed(1)}m × {fpD.toFixed(1)}m) exceeds the setback-limited buildable area ({buildableW.toFixed(1)}m × {buildableD.toFixed(1)}m).
            {setbackOverflowW && ` Width exceeds by ${(fpW - buildableW).toFixed(1)}m.`}
            {setbackOverflowD && ` Depth exceeds by ${(fpD - buildableD).toFixed(1)}m.`}
          </p>
          <p className="mt-1 font-mono text-[8px] text-muted-foreground">PD 1096 IRR Rule VIII, Sec. 804 — Minimum Setback Requirements</p>
        </div>
      )}

      {/* FLAR Limit Exceeded warning */}
      {hasFlarViolation && (
        <div className="mt-2 rounded-sm border border-warning/30 bg-warning-50 p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-[10px] font-medium text-warning">FLAR LIMIT EXCEEDED</span>
          </div>
          <p className="text-[9px] text-text-secondary leading-relaxed">
            Proposed GFA ({proposedGFA.toFixed(0)} sqm) exceeds the allowable TGFA ({tgfa.toFixed(0)} sqm) at FLAR {flar.toFixed(2)}.
            Maximum compliant floors: {maxFloors}F. Currently proposing {proposedFloors}F — reduce by {proposedFloors - maxFloors} floor{proposedFloors - maxFloors !== 1 ? 's' : ''}.
          </p>
          <p className="mt-1 font-mono text-[8px] text-muted-foreground">PD 1096 IRR Rule VII, Sec. 705, Table VII.G.1</p>
        </div>
      )}
    </div>
  )
}
