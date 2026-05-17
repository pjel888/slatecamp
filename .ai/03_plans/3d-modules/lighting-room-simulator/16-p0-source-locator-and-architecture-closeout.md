# P0 Source Locator And Architecture Closeout

Date: 2026-05-15
Status: `HIDDEN_QA_GATE_CLEARED`

This closeout answers what the implementation was waiting for.

## Result

The two pre-code gates are cleared for hidden QA implementation:

1. P0 source rows are now populated as `LOCATED`, `CONFLICT`, or internal/pedagogical.
2. The architecture bridge is accepted for v0 Option A: module-specific `LightingRoomScene`.

This does **not** mean learner-facing legal pass/fail is approved. `LOCATED` is traceability for hidden QA. `APPROVED` still requires SME review.

## Source Locator Decisions

| Source family | Decision | Implementation meaning |
|---|---|---|
| DOE Guidelines on Energy Conserving Design of Buildings | v0 source family for general illuminance targets | Use source-pending target cards; no legal pass/fail until SME approval. |
| Philippine Green Building Code | v0 source family for office LPD limit | Use source-pending LPD review; no legal pass/fail until SME approval. |
| RA 9514 RIRR 2019 | source family for emergency egress illumination | Resolve value as 10.7 lux; keep emergency egress contextual unless displayed. |
| PEC Rule 9.50.4 | not located as a primary source in this pass | Do not show PEC as v0 source-backed law card. |
| SlateCamp teaching model | internal model for `lux = lumens / area` | Display as simplified teaching model, not professional photometric simulation. |

## Evidence Notes

DOE illuminance:
- Official DOE source family URL: `https://www.doe.gov.ph/sites/default/files/pdf/energy_efficiency/guidelines_energy_conserving_design_buildings_v2008.pdf`
- Corroborated locator: BERDE user guide lines 2920-2936 reproduces DOE Table 3.1.
- Existing local audit evidence: `.ai/content-audit-export/articles/lea-util-006-05-recommended-illumination-levels-by-space-type--f815c409-77f7-4489-b3b9-7cb2f3010ad9/source-audit-evidence.json`
- Important values:
  - corridors / circulation: 50-150 lux
  - general offices / typing / computing: 300-750 lux
  - drawing offices: 500-1,000 lux
  - proofreading: 500-1,000 lux
  - designing / architecture: 750-1,500 lux

PGB Code LPD:
- Official DPWH source family URL: `https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/pgbcbooklet23march.pdf`
- Corroborated locator: BERDE user guide lines 949-959 reproduces Philippine Green Building Code Table 11.
- Important values:
  - Business: Office: 10.80 W/m2
  - Educational: School: 12.90 W/m2

RA 9514 emergency egress:
- Official BFP source family page: `https://bfp.gov.ph/revised-irr-of-ra-9514-the-fire-code-of-the-philippines/`
- Local locator: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/ra-9514-means-of-egress-width-count-and-illumination--dryrun-03-ra9514-means-of-egress-width-and-count/normalized.md`
- Section: 2019 RIRR Rule 10, Division 5, Section 10.2.5.11, PDF p.113.
- Resolved value: 10.7 lux.

## Architecture Decision

Accepted v0 architecture:

```tsx
canvasWrapper(
  <LightingRoomScene useStore={useStore} />,
  { disableLighting: true, showGround: false },
)
```

Rules:
- `LightingRoomScene` owns live `pointLight` / `spotLight` behavior.
- `computeLightingState()` remains pure and shared by panels and scene.
- The scene never decides legal wording.
- `ParametricSceneRenderer` does not need to support light instructions for v0.

## Hidden QA Readiness

Hidden QA implementation may start after this closeout if the implementation keeps:
- all legal/source checks fail-closed
- no `LOCATED` source rendered as learner-facing legal pass/fail
- no PEC law card until PEC primary text is obtained
- source cards visible as `Source pending` / `Located, pending SME`

Learner release remains blocked until SME approval turns applicable cards from `LOCATED` into `APPROVED`.
