# Source Card Schema and Approval Workflow — Parking Lot Requirements

Purpose: define how source truth becomes implementation truth. This must be complete before code starts.

## Source card contract

Each learner-visible rule must resolve to one or more source cards.

Required fields:

```ts
type ParkingSourceStatus =
  | 'SOURCE_PENDING'
  | 'SOURCE_REVIEW'
  | 'SOURCE_READY'
  | 'SOURCE_REJECTED'
  | 'DEFERRED'

type ParkingRuleCard = {
  sourceRuleId: string
  sourceCardId: string
  lawFamily: 'PD_1096' | 'BP_344' | 'BP_220' | 'PD_957' | 'RA_9514' | 'LGU' | 'INTERNATIONAL_COMPARATIVE'
  rawSourcePath: string
  sha256: string
  pageLocator: string
  sectionLocator: string
  tableOrFigureLocator?: string
  extractedQuote: string
  normalizedRule: string
  unit?: 'mm' | 'm' | 'slots' | 'percent' | 'ratio' | 'text'
  numericThreshold?: number
  comparison?: 'min' | 'max' | 'exact' | 'band' | 'qualitative' | 'review'
  applicability: string
  interpretationNotes: string
  approvedBy?: string
  approvedAt?: string
  status: ParkingSourceStatus
}
```

## Approval rules

- `SOURCE_PENDING`: locator or quote incomplete. Implementation may compute internal preview only; no compliance wording.
- `SOURCE_REVIEW`: locator complete but reviewer has not approved interpretation.
- `SOURCE_READY`: source reviewer approved raw locator, quote, normalized rule, applicability, and formula interpretation.
- `SOURCE_REJECTED`: source was wrong, superseded, unofficial, or contradicted by better source.
- `DEFERRED`: excluded from MVP; cannot affect compliance result.

## Who can approve

For now, approval is manual and must be recorded in the future source card artifact:
- Philip or a delegated SlateCamp source/legal-code reviewer can approve `SOURCE_READY`.
- Implementation agent cannot approve its own source interpretation.
- If two reviewers disagree, keep `SOURCE_REVIEW` and return `REVIEW` in UI.

## Runtime behavior

| Source status | UI result labels allowed | Compliance labels allowed? |
|---|---|---|
| SOURCE_PENDING | `CALCULATION OK`, `FORMULA ISSUE`, `REVIEW` | No |
| SOURCE_REVIEW | `CALCULATION OK`, `FORMULA ISSUE`, `REVIEW` | No |
| SOURCE_READY | `COMPLIANT`, `VIOLATION`, `AT LIMIT`, `REVIEW` | Yes, only for approved rule |
| SOURCE_REJECTED | `REVIEW` | No |
| DEFERRED | hidden or `Not in this module version` | No |

## Planned artifact location

During future implementation, source cards should live beside the module, likely:

- `src/features/3d-lab/config/modules/16-site-dev/parking-lot-requirements-source.ts`

Before that file exists, the source locator workbook remains the temporary source-card staging area.

## Required tests later

- Every source-ready rule ID resolves to a card.
- Missing source card fails closed.
- Source-pending rule never emits `COMPLIANT`, `VIOLATION`, or `AT LIMIT`.
- Source-ready rule can emit compliance labels only through the approved computation path.
- International comparative rows cannot be used by pass/fail logic.
