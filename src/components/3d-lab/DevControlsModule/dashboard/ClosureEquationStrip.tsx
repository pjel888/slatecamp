'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// Visual proportional bar: TLA = AMBF + ISA + USA
// Each segment width proportional to its share of TLA.

export function ClosureEquationStrip() {
  const tla = useDevControlsStore((s) => s.result.tla)
  const ambf = useDevControlsStore((s) => s.result.ambf)
  const isa = useDevControlsStore((s) => s.result.isa)
  const usa = useDevControlsStore((s) => s.result.usa)
  const valid = useDevControlsStore((s) => s.result.closureIdentityValid)

  const pAMBF = tla > 0 ? (ambf / tla) * 100 : 0
  const pISA = tla > 0 ? (isa / tla) * 100 : 0
  const pUSA = tla > 0 ? (usa / tla) * 100 : 0

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Area Closure Identity
        </label>
        <span className={`text-[9px] font-medium ${valid ? 'text-success' : 'text-destructive'}`}>
          {valid ? 'VERIFIED' : 'FAILED'}
        </span>
      </div>

      {/* Proportional bar */}
      <div className="flex h-5 w-full overflow-hidden rounded-sm border border-border">
        <div
          className="flex items-center justify-center text-[8px] font-mono font-medium text-white"
          style={{ width: `${pAMBF}%`, backgroundColor: 'var(--primary)' }}
          title={`AMBF: ${ambf.toFixed(1)} sqm`}
        >
          {pAMBF >= 12 && 'AMBF'}
        </div>
        <div
          className="flex items-center justify-center text-[8px] font-mono font-medium text-white"
          style={{ width: `${pISA}%`, backgroundColor: 'var(--camp-amber)' }}
          title={`ISA: ${isa.toFixed(1)} sqm`}
        >
          {pISA >= 10 && 'ISA'}
        </div>
        <div
          className="flex items-center justify-center text-[8px] font-mono font-medium text-white"
          style={{ width: `${pUSA}%`, backgroundColor: 'var(--camp-green)' }}
          title={`USA: ${usa.toFixed(1)} sqm`}
        >
          {pUSA >= 10 && 'USA'}
        </div>
      </div>

      {/* Equation text */}
      <p className="mt-1 text-center font-mono text-[10px] text-text-secondary">
        <span className="text-primary">{ambf.toFixed(0)}</span>
        {' + '}
        <span className="text-warning">{isa.toFixed(0)}</span>
        {' + '}
        <span className="text-camp-green">{usa.toFixed(0)}</span>
        {' = '}
        <span className="font-semibold text-foreground">{tla.toFixed(0)}</span>
        <span className="text-muted-foreground"> sqm</span>
      </p>
    </div>
  )
}
