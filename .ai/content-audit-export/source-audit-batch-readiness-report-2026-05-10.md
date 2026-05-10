# Source-Audited Batch Editing Readiness Report - 2026-05-10

## Verdict

READY for controlled batch article improvement, with mandatory source-audit gates.

This means the repo is ready to batch edit articles only under the controlled lane: edit locally, compose/diff/validate, verify legal/code claims against raw PDFs, write source-audit evidence, then apply only items with passing evidence. It is not a blind whole-resource mutation lane.

## Mechanical gates now active

- Article Supabase apply is blocked for legal/code candidates unless `source-audit-evidence.json` exists and passes.
- Question Supabase apply is blocked unless the parent article has passing `source-audit-evidence.json` and the question/model is included in audited claims.
- Dry-runs still work and report warnings/blockers without mutation.
- Missing, stale, or incomplete source evidence parks the item instead of uploading it.

## Verification evidence

- `bun test scripts/content-audit/content-audit.test.ts`: PASS, 27 tests.
- `git diff --check -- scripts/content-audit/push-question-to-supabase.ts`: PASS.
- Article apply blocker test: unaudited legal/code article apply produced blocker `Missing source-audit-evidence.json for legal/code candidate` and did not push.
- Question apply blocker test: unaudited question edit produced blocker `Missing source-audit-evidence.json in parent article folder` and did not push.
- Supabase was not mutated during readiness testing.

## Pilot evidence

Passing source-audit artifacts exist for:

- `bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de/source-audit-evidence.json`
- `spp-doc-201-pre-design-services--16bb270e-6887-4bbe-a62e-eace6c4d3fdb/source-audit-evidence.json`

Parked evidence exists where source truth was not safely complete:

- `pd-1096-rule-vii-area-metrics--85bcd328-436d-49ba-9d37-7b202d0d38d4/source-audit-evidence.PARKED.json`
- `lea-prac-frm-005-foreign-architects-in-the-philippines--ae4bdc43-1451-4aa5-8c12-65283f4bbdfd/source-audit-evidence.PARKED.json`
- `bp-344-accessible-washrooms--6d5e0e55-215a-4806-a679-dac7aea5a99b/source-audit-evidence.PARKED.json`
- `spp-doc-204-a-fulltime-supervision-services--c534d94f-967a-48bb-babf-419fa6d35ec7/source-audit-evidence.PARKED.json`
- `spp-doc-204-b-construction-management-services--f5ed9c09-3191-4cd4-b1b0-9e6364212c36/source-audit-evidence.PARKED.json`
- `spp-doc-205-post-construction-services--875396fa-1704-47b7-abb5-29f49c75fc78/source-audit-evidence.PARKED.json`

The parked results are expected and acceptable: they prove the gate blocks unsafe content instead of forcing a pass.

## Source layer confirmed

Raw source inventory confirmed 341 PDFs under `vitruvius-connection/001_Raw-Source-Layer`, including PD 1096, BP 344, RA 9514, RA 9266, UAP/SPP, PD 957, BP 220, plumbing, electrical, NSCP, DHSUD/HLURB, and LGU zoning sources.

## Operating rule for scaling

For each article batch:

1. Select controlled batch.
2. Edit locally only.
3. Compose/diff/validate.
4. Extract legal/code claims from article, UI blocks, scenario, and linked questions.
5. Verify against raw PDFs and record exact source evidence.
6. Write `source-audit-evidence.json` only for PASS.
7. Write `source-audit-evidence.PARKED.json` for unresolved claims.
8. Apply only PASS items.
9. Verify live hash, zero placeholders, linked question edits, duplicate detector, and browser QA.

## Readiness boundary

Ready means the batch system can safely improve and apply eligible items while parking unsafe items with evidence. It does not mean every existing article is already source-clean or ready for immediate upload.
