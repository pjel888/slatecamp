<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# pd1096

## Purpose

The `pd1096` directory implements the **PD 1096 computation engine**: a deterministic calculator for Philippine building code compliance (2004 Revised IRR). It encodes setback rules, zoning tables, floor area ratios (FLAR), building height limits (BHL), and site geometry validation for the 3D Lab's parametric architecture design module. Zero framework dependencies—pure TypeScript.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports: computation engine, setback calculator, zoning lookup functions, types |
| `types.ts` | Canonical TypeScript interfaces: ZoneClass, LotParams, ZoningParams, DevControlsResult, ComplianceCheck (no npm dependencies) |
| `computationEngine.ts` | Main entry point: `computeDevControls()` orchestrates site area, floor area, volumetric, and compliance calculations |
| `computeSetbacks.ts` | Setback calculator: front/rear/side setbacks by zone class, lot type (interior/corner/through), firewall rules |
| `zoningTables.ts` | Zoning lookup tables: FLAR ranges, PSO%, BHL storeys, ISA/USA percentages, TGFA multipliers (sourced from 2004 IRR §§ VII–VIII) |
| `errors.ts` | Error types: `ClosureIdentityViolationError` (TLA ≠ AMBF + ISA + USA) |
| `__tests__/computationEngine.test.ts` | Unit tests for setback and compliance calculations |

## For AI Agents

### Working In This Directory

**PD 1096 Compliance Rules (CRITICAL):**
- All values sourced exclusively from 2004 Revised IRR (DPWH, April 2005). Do not hallucinate zone rules.
- Setback rules vary by zone class (R-1, R-2, R-3, R-4, R-5, Com-1 to Com-3, Ind-1 to Ind-3, Institutional, Cultural).
- Lot type affects setbacks: interior, corner (two front exposures), through (two opposite sides), corner-through.
- Firewall presence alters setback requirements on specified sides (front/rear/left/right).

**Key Calculations:**
1. **Total Lot Area (TLA):** Width × Depth (or provided override). Polygon lots use bounding box.
2. **Setbacks:** Base setback from zone tables; §804.6 adds incremental setback based on zone class. Effective setback = base + incremental.
3. **Allowable Building Footprint Area (AMBF):** min(by setbacks, by PSO%). "By setbacks" = (width - L - R) × (depth - F - Rear). "By PSO" = PSO% × TLA.
4. **Floor Area Ratio (FLAR):** GFA = FLAR × TLA. FLAR range varies by zone; typically 1.0–4.0.
5. **Total Gross Floor Area (TGFA):** min(FLAR-based, BHL-based). FLAR-based = GFA × multiplier. BHL-based = BHL storeys × AMBF.
6. **Building Height Limit (BHL):** Determined by zoning or RROW (Road Right-of-Way). Higher value = more restrictive.
7. **Open Space (TOSL):** 1 - (ISA + USA)/TLA. Must meet PSO% requirement.
8. **Compliance Checks:** Verify proposed GFA ≤ TGFA, proposed storeys ≤ BHL storeys, AMBF ≥ required parking, etc.
9. **Closure Identity:** TLA = AMBF + ISA + USA (±0.01 tolerance). If violated → `ClosureIdentityViolationError`.

**Type Safety:**
- All zone classes, lot types, and layer keys are union types (not strings).
- Use `ZoneClass`, `LotType`, `LayerKey` enums from `types.ts`.
- `DevControlsInput` and `DevControlsResult` are the canonical I/O shapes.

**Audit Flags:**
- AMVB (Angular Plane Volume Block) calculation is marked ⚠️ — not yet fully validated against 3D geometry.
- Store audit flags in `result.buildableWidth` and `result.buildableDepth` for R3F sizing feedback.

### Common Patterns

**Computing Setbacks:**
```typescript
import { computeSetbacks } from '@/lib/pd1096'

const result = computeSetbacks({
  lot: { width: 30, depth: 40, type: 'corner' },
  zoning: { zoneClass: 'Com-1', firewallActive: true, firewallSides: ['rear'] },
  building: { proposedFootprintWidth: 25, proposedFootprintDepth: 35, proposedStoreys: 5, floorHeight: 3.5 },
  rrow: { width: 20 },
})
// result.effective gives front/rear/left/right meters
```

**Full Development Controls:**
```typescript
import { computeDevControls } from '@/lib/pd1096'

const devResult = computeDevControls({
  lot: { width: 50, depth: 60, area: 3000 },
  zoning: { zoneClass: 'R-2-max', firewallActive: false, firewallSides: [] },
  building: { proposedFootprintWidth: 40, proposedFootprintDepth: 50, proposedStoreys: 8, floorHeight: 3.5 },
  rrow: { width: 20 },
})

if (!devResult.overallCompliant) {
  devResult.checks.forEach((check) => {
    if (!check.compliant) {
      console.log(`${check.label}: need ${check.required}${check.unit}, have ${check.actual}`)
    }
  })
}
```

**Zoning Lookup:**
```typescript
import { getZoningEntry, lookupFLAR, lookupBHL } from '@/lib/pd1096'

const entry = getZoningEntry('Com-2')
const flarRange = lookupFLAR('Com-2')
const bhlStoreys = lookupBHL('Com-2', 20) // zone, RROW width in meters
```

## Dependencies

### Internal

- **Types:** `ZoneClass`, `LotType`, `LabMode`, `CameraPreset`, `LayerKey`, `FirewallSide` from `types.ts`.
- **Errors:** `ClosureIdentityViolationError` from `errors.ts`.
- **Zoning Tables:** Canonical lookup tables from `zoningTables.ts`.

### External

- **Zero external npm dependencies.** Pure TypeScript for deterministic, offline computation.
- **Target runtime:** Node.js (Server Actions) or browser (3D Lab R3F scene).

---

**Last Updated:** 2026-04-02

**For questions about PD 1096 rules, consult `.claude/agents/ph-arch-professional-context.md` in the repository root.**
