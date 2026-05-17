# Source Card Schema And Approval - Lighting Room Simulator

The Lighting Room Simulator must treat source truth as a first-class data model. This file defines the source-card schema and approval workflow future implementation must follow.

## Source Statuses

| Status | Learner-facing behavior |
|---|---|
| `SOURCE_PENDING` | Show `Review` or `Source pending`; no pass/fail legal language. |
| `LOCATED` | Source found but not SME-approved; show source family and review status only. |
| `APPROVED` | Can support learner-facing legal threshold language. |
| `CONFLICT` | Show review warning; do not calculate legal pass/fail. |
| `PEDAGOGICAL_ONLY` | Can support learning copy, formulas, and examples; cannot support legal compliance. |
| `RETIRED` | Must not appear in learner-facing UI. |

## Required Source Card Fields

```json
{
  "sourceId": "SRC-DOE-ILLUM-001",
  "lawFamily": "DOE Energy Code",
  "sourceStatus": "SOURCE_PENDING",
  "valueFamily": "illuminance",
  "learnerLabel": "Office work area illuminance",
  "value": {
    "amount": 300,
    "unit": "lux",
    "operator": ">="
  },
  "sourceLocator": {
    "title": "",
    "section": "",
    "table": "",
    "page": "",
    "urlOrPath": ""
  },
  "quote": "",
  "interpretation": "",
  "displayRule": "Do not render pass/fail until APPROVED.",
  "approvedBy": "",
  "approvedAt": "",
  "notes": ""
}
```

## Display Rules

### Approved source-backed check

Allowed labels:
- `Pass`
- `Needs adjustment`
- `Below approved target`
- `Source approved`

Allowed color:
- success for pass
- destructive for approved functional failure
- neutral text for explanation

### Source-pending check

Allowed labels:
- `Review`
- `Source pending`
- `Target not yet approved`

Forbidden labels:
- `Compliant`
- `Violation`
- `Fail`
- `Illegal`
- `Code violation`

Allowed color:
- warning/review styling
- neutral text
- no destructive red in the 3D surface overlay

### Pedagogical-only value

Allowed labels:
- `Teaching model`
- `Typical reference`
- `Approximate`
- `For learning`

Forbidden labels:
- `Per code`
- `Required`
- `Compliant`
- `Violation`

## Approval Workflow

1. Researcher locates source and fills source workbook row.
2. Researcher creates source card with locator, quote, and interpretation.
3. SME checks the exact source, value, and learner interpretation.
4. Product checks whether the value belongs in v0 or should be contextual only.
5. Approved card becomes eligible for learner-facing legal language.
6. Any later conflict reverts the card to `CONFLICT` until resolved.

## Source Card Families For v0

| Source ID | Required for hidden QA | Required for learner release |
|---|---:|---:|
| `SRC-SLATE-PHOTOMETRY-001` simplified average-lux model | yes | yes |
| `SRC-DOE-ILLUM-001` office illuminance | yes | yes |
| `SRC-DOE-ILLUM-002` reading/library illuminance | no | only if displayed |
| `SRC-DOE-ILLUM-003` corridor illuminance | no | only if displayed |
| `SRC-DOE-ILLUM-004` drawing/drafting illuminance | yes if drafting preset is shown | yes if displayed |
| `SRC-PEC-ILLUM-001` PEC ownership of artificial illumination | no for v0 hidden QA; yes only if PEC is shown | yes if PEC shown |
| `SRC-PGBC-LPD-001` office LPD limit | yes if LPD pass/fail shown | yes |
| `SRC-RA9514-EGRESS-001` emergency egress illumination | no | only if displayed |
| `SRC-PD1096-LV-001` ceiling height | no | only if legal citation shown |
| lamp efficacy references | yes as pedagogical | yes as pedagogical |

## Implementation Contract

Future code should treat source status as a display guard:

```typescript
type SourceStatus =
  | 'SOURCE_PENDING'
  | 'LOCATED'
  | 'APPROVED'
  | 'CONFLICT'
  | 'PEDAGOGICAL_ONLY'
  | 'RETIRED'

interface LightingCheckDisplayState {
  sourceId: string
  sourceStatus: SourceStatus
  canRenderPassFail: boolean
  label: string
  tone: 'neutral' | 'review' | 'pass' | 'fail'
}
```

Rule: `canRenderPassFail` is true only when `sourceStatus === 'APPROVED'` or when the check is explicitly internal/pedagogical and not framed as legal compliance.

## QA Assertions

- [ ] No `SOURCE_PENDING` or `LOCATED` card contains "compliant", "violation", "pass", or "fail".
- [ ] Every `APPROVED` card includes a source locator and approval metadata.
- [ ] Every legal threshold shown in the right panel has a source id.
- [ ] Every formula popover distinguishes teaching model from law/source status.
