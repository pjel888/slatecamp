# Source-Audited Production-Line Coordination

Updated: 2026-05-12T13:45:00+08:00
Workspace: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Mode: controlled serial final-gate production line; reservation only for this run.

## Current Committed Baseline

- Current HEAD: 3957e8c08
- 3957e8c08 chore(content): accept source-audited batch 089
- c31d7db15 chore(content): accept source-audited batch 088
- 3f0c61a88 chore(content): accept source-audited batch 087
- 16e474454 chore(content): reserve production-line batches 087-089
- dd531e9df chore(content): record source-audited local-first batches

Batches 087-089 are committed and pushed as the accepted baseline. These Batch 090-092 entries are reservations only and must not be read as completion state. Batch 090 can start only after this reservation is committed and pushed.

## Accepted Batches

| Batch | State | Focus | Articles | Linked questions | Source blockers | Manifest |
|---|---|---:|---:|---:|---:|---|
| 087 | Accepted, committed at 3f0c61a88 | Planning theory, Philippine urban-structure models, and DRRM-aware planning | 5 | 50 | 0 | production-line-batch-087-manifest.json |
| 088 | Accepted, committed at c31d7db15 | Site-planning usability, management, maintenance, native planting, and prefabricated construction | 5 | 54 | 0 | production-line-batch-088-manifest.json |
| 089 | Accepted, committed at 3957e8c08 | Accessibility/PWD law decks plus Philippine planning figures, smart city, and sustainable urban development | 5 | 61 | 0 | production-line-batch-089-manifest.json |

## Reservation Table

| Batch | State | Focus | Articles | Linked questions | Source blockers to resolve | Reserved article clusters | Manifest |
|---|---|---:|---:|---:|---:|---|---|
| 090 | Reserved pre-start, not complete | PD 1096 core building code: property location, ceilings, Group A dwellings, general provisions, parking | 5 | 171 | 1 | location-on-property-and-exterior-walls (16ba355e-811c-4191-98c2-c7fac22ca59b)<br>ceiling-heights-and-room-sizes (915c1016-2ed6-4b47-b2ca-f12965c6bc9f)<br>minimum-requirements-group-a-dwellings (42eb0c36-da27-4b7e-a1e3-4ed915bfca8d)<br>rule-i-general-provisions (3ad2ad2a-e525-44c3-8edf-bf7036d9c31a)<br>minimum-parking-requirements (850a66f9-db5d-4068-a763-0bc4c1d9872a) | production-line-batch-090-manifest.json |
| 091 | Reserved pre-start, not complete | Construction systems and fire safety: excavation, glazing, fire zones, certificate of occupancy, dangerous buildings | 5 | 168 | 0 | excavation-foundation-and-veneer (bd009a97-21fe-400e-8717-615d5a877cfd)<br>glass-and-glazing-area-limits (3a28da11-0053-4b2f-85a8-f675a3d10a43)<br>fire-zones-and-existing-buildings (9437579a-377e-41ec-8527-4c0399348746)<br>certificate-of-occupancy (68eeacdb-a61b-4f53-bbe9-e2459fa8d152)<br>dangerous-and-ruinous-buildings (ad9732f1-f733-4bc1-acb5-72b4bb53555d) | production-line-batch-091-manifest.json |
| 092 | Reserved pre-start, not complete | Accessibility, fire code, and professional practice: pedestrian protection, signs, light/ventilation, fire alarms, UAP SPP | 5 | 130 | 0 | pedestrian-protection-during-construction (e6c2a686-5b8c-477d-b5e4-d02bef987743)<br>signs-design-and-construction (16a0bc40-d538-4e4a-8408-cd41dd7aa7aa)<br>pd-1096-rule-viii-light-and-ventilation (cb947ab1-7737-4bde-8a47-606b5d305ed6)<br>lea-util-004-04-when-fire-alarm-systems-are-mandatory-ra-9514-irr (1d37a355-c8bf-4d5e-a41b-07a9817a4427)<br>uap-spp-doc-standards-of-professional-practice-for-philippine-architects (f2c105fd-51fc-4b48-b53a-77242dbb91b0) | production-line-batch-092-manifest.json |

## Worker Instructions

- Work one accepted batch at a time: 090, then 091, then 092. Parallel article work inside a batch is allowed only if each worker owns disjoint article folders and question-edit paths from that batch manifest.
- Before editing, re-run the prior-batch exclusion check against Batches 001 through the latest accepted batch (089 at commit 3957e8c08) plus these reservation manifests.
- Use local raw PDFs under /Users/philiplewis/slatecamp/vitruvius-connection/001_Raw-Source-Layer as primary evidence. Internet lookup may only discover candidate source names or official copies for later local-source acquisition; it cannot be cited as primary evidence.
- Do not permanently skip difficult articles. If a selected article has missing or weak source families, keep the reservation and mark blocker-resolution-needed with the exact source family and recommended path.
- Do not edit article content or question edits until the batch is started by the serial coordinator. Reservation work may update only /Users/philiplewis/slatecamp/.ai/03_plans.

## Reviewer Instructions

- Verify that every selected article ID is absent from Batches 001-089 and any earlier accepted reservation batch.
- Review raw-source evidence before prose quality. Claims must be traceable to local raw/source-conversion locators, not web snippets.
- Confirm linked-question count equals created question-edit count for each article.
- Check for placeholders, internal notes, source gaps, stale compose-error files, JSON parse failures, unsafe diffs, and scenario enrichment status.
- Return a concise pass/fail verdict per batch with blockers, affected article IDs, and exact remediation path.

## Serial Final-Gate Protocol

1. Batch worker completes local raw-PDF-first audit, article repairs, source evidence, and question edits only within the manifest scope.
2. Worker runs the full validation gate list from the manifest.
3. Independent reviewer validates the artifacts and source traceability.
4. Coordinator accepts or rejects the batch. Acceptance requires blockers=0, source gaps=0, linked-question/question-edit counts matching, and scoped git diff --check passing.
5. Only after coordinator acceptance may the next batch begin. Batch 091 waits for accepted Batch 090; Batch 092 waits for accepted Batches 090 and 091.

## Commit/Push Rule

After each accepted batch, stage only that batch's accepted article folders, question-edit files, batch report, ledger, scoped checks, and handoff/coordination updates. Commit with the Lore Commit Protocol and push the branch. Do not combine batches in one commit unless the coordinator explicitly records a batch-combination exception. This reservation run itself must not commit or push.

## Handoff Notes

- Batch 090 manifest: /Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-090-manifest.json
- Batch 091 manifest: /Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-091-manifest.json
- Batch 092 manifest: /Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-092-manifest.json
- Global handoff completion state for Batches 087-089: committed and pushed at 3957e8c08.
- Expected source gaps are intentional blocker-resolution entries, not skip permissions.
- Batch 090 blocker note: `minimum-parking-requirements` has 28 linked questions but 29 question-edit files; verify correspondence and remove orphaned file before acceptance.
