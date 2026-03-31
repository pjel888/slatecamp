// src/lib/pd1096/errors.ts
// ─── Custom errors for the PD 1096 computation engine ──────────────────────

export class ClosureIdentityViolationError extends Error {
  public readonly tla: number
  public readonly ambf: number
  public readonly isa: number
  public readonly usa: number
  public readonly diff: number

  constructor(tla: number, ambf: number, isa: number, usa: number) {
    const sum = ambf + isa + usa
    const diff = Math.abs(tla - sum)
    super(
      `Area closure identity violated: TLA=${tla.toFixed(4)}, ` +
      `AMBF+ISA+USA=${sum.toFixed(4)}, delta=${diff.toFixed(6)}. ` +
      `Identity requires TLA = AMBF + ISA + USA within ±0.01 sqm.`
    )
    this.name = 'ClosureIdentityViolationError'
    this.tla = tla
    this.ambf = ambf
    this.isa = isa
    this.usa = usa
    this.diff = diff
  }
}
