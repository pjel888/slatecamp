# Source-Audited Production-Line Coordination

Updated: 2026-05-12T09:55:00+08:00
Workspace: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Mode: controlled serial final-gate production line; reservation only for this run.

## Current Committed Baseline

- Current HEAD: dd531e9df
- dd531e9df chore(content): record source-audited local-first batches
- ff0e552b8 feat(landing): refine interactive marketing surface
- 41bce18b4 docs(content): park source-audited batch 003 blockers
- c0f73011e docs(content): park source-audited batch 002 blockers
- 4224ac156 chore(content): apply source-audited batch 001 questions

Batch 086 is the committed baseline for this reservation run. The existing handoff records Batch 086 as complete with blockers=0. These Batch 087-089 entries are reservations only and must not be read as completion state.

## Reservation Table

| Batch | State | Focus | Articles | Linked questions | Source blockers to resolve | Reserved article clusters | Manifest |
|---|---|---:|---:|---:|---:|---|---|
| 087 | Reserved pre-start, not complete | Planning theory, Philippine urban-structure models, and DRRM-aware planning | 5 | 50 | 4 | lea-plan-002-01-core-concept (50d41d7e-57cd-4280-b850-e6d2f89414a6)<br>lea-plan-002-02-core-concept (4f38604e-70a2-4b6f-9710-b166fe83cbe6)<br>lea-plan-002-05-core-concept (1a6a6df8-8f58-42aa-a38b-e59fe737716f)<br>lea-plan-002-07-core-concept (dbac0a4a-cff7-4cb1-8e66-dcd6fb224283)<br>lea-plan-005-04-core-concept (f6b1d119-9ba2-436b-ba39-d62abceef5ed) | production-line-batch-087-manifest.json |
| 088 | Reserved pre-start, not complete | Site-planning usability, management, maintenance, native planting, and prefabricated construction | 5 | 54 | 4 | lea-plan-004-03-what-you-need-to-know-for-the-lea (d2246ae0-2def-4144-b42d-f56172b13f67)<br>lea-plan-004-04-what-you-need-to-know-for-the-lea (b9ae0f63-0d28-4a66-b2bf-51641e6db739)<br>lea-plan-004-05-what-you-need-to-know-for-the-lea (f22ba499-94ce-41a3-999a-2d9ffdbc0b57)<br>lea-plan-005-02-what-you-need-to-know-for-the-lea (e59c8abc-5938-47ab-8009-97424baa78c7)<br>prefabricated-constructions (ba36cb75-5bb4-4d12-802c-f5ab921f7949) | production-line-batch-088-manifest.json |
| 089 | Reserved pre-start, not complete | Accessibility/PWD law decks plus Philippine planning figures, smart city, and sustainable urban development | 5 | 61 | 3 | ra-9442-pwd-privileges-and-incentives (1262fe88-bb8f-4005-a9e8-0e8d6c03fe64)<br>law-qa-deck-ra-7277-9442-10754 (cd893cd9-7427-4093-bc07-edabf41a6cd7)<br>lea-plan-007-06-core-concept (fc0f6b12-8d7e-4309-b83c-daba0863ff30)<br>lea-plan-008-02-core-concept (4bb1957d-f513-47e1-b253-c7cbc65912b3)<br>lea-plan-008-03-core-concept (5d49cedb-dc14-445a-b075-41fe56873081) | production-line-batch-089-manifest.json |

## Worker Instructions

- Work one accepted batch at a time: 087, then 088, then 089. Parallel article work inside a batch is allowed only if each worker owns disjoint article folders and question-edit paths from that batch manifest.
- Before editing, re-run the prior-batch exclusion check against Batches 001 through the latest accepted batch plus these reservation manifests.
- Use local raw PDFs under /Users/philiplewis/slatecamp/vitruvius-connection/001_Raw-Source-Layer as primary evidence. Internet lookup may only discover candidate source names or official copies for later local-source acquisition; it cannot be cited as primary evidence.
- Do not permanently skip difficult articles. If a selected article has missing or weak source families, keep the reservation and mark blocker-resolution-needed with the exact source family and recommended path.
- Do not edit article content or question edits until the batch is started by the serial coordinator. Reservation work may update only /Users/philiplewis/slatecamp/.ai/03_plans.

## Reviewer Instructions

- Verify that every selected article ID is absent from Batches 001-086 and any earlier accepted reservation batch.
- Review raw-source evidence before prose quality. Claims must be traceable to local raw/source-conversion locators, not web snippets.
- Confirm linked-question count equals created question-edit count for each article.
- Check for placeholders, internal notes, source gaps, stale compose-error files, JSON parse failures, unsafe diffs, and scenario enrichment status.
- Return a concise pass/fail verdict per batch with blockers, affected article IDs, and exact remediation path.

## Serial Final-Gate Protocol

1. Batch worker completes local raw-PDF-first audit, article repairs, source evidence, and question edits only within the manifest scope.
2. Worker runs the full validation gate list from the manifest.
3. Independent reviewer validates the artifacts and source traceability.
4. Coordinator accepts or rejects the batch. Acceptance requires blockers=0, source gaps=0, linked-question/question-edit counts matching, and scoped git diff --check passing.
5. Only after coordinator acceptance may the next batch begin. Batch 088 waits for accepted Batch 087; Batch 089 waits for accepted Batches 087 and 088.

## Commit/Push Rule

After each accepted batch, stage only that batch's accepted article folders, question-edit files, batch report, ledger, scoped checks, and handoff/coordination updates. Commit with the Lore Commit Protocol and push the branch. Do not combine batches in one commit unless the coordinator explicitly records a batch-combination exception. This reservation run itself must not commit or push.

## Handoff Notes

- Batch 087 manifest: /Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-087-manifest.json
- Batch 088 manifest: /Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-088-manifest.json
- Batch 089 manifest: /Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-089-manifest.json
- Global handoff completion state for Batches 087-089 was not modified.
- Expected source gaps are intentional blocker-resolution entries, not skip permissions.
