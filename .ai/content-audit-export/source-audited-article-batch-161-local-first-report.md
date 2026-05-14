# Batch 161 Local-First Source-Audited Report

Generated: 2026-05-14T17:10:00+08:00

## Status

Batch 161 is local-first complete for five selected NSCP-supported residual clusters. No Supabase push, deploy, production DB mutation, main merge, force-push, staging, commit, or push was performed.

## Selected clusters

- lea-strc-004-02 (lea-strc-004-02-core-concept): NSCP seismic Zone 2 / Zone 4 Z factors; linked questions 10/10; blockers 0; anchors: page-0240.md lines 16-26: Section 208.4.4.1 and Table 208-3.
- lea-strc-007-03 (lea-strc-007-03-core-concept): NSCP Section 424 serviceability and deflection checks; linked questions 10/10; blockers 0; anchors: page-0482.md lines 7-89: Section 424.1, 424.2, Table 424.2.2; page-0483.md lines 36-68: Table 424.2.4.1.3.
- lea-strc-007-05 (lea-strc-007-05-core-concept): NSCP embedments, pipe reinforcement, cover, and review; linked questions 10/10; blockers 0; anchors: page-0463.md lines 60-81: Section 420.7; page-0508.md lines 3-27: Section 426.8 continuation.
- lea-strc-012-01 (lea-strc-012-01-core-concept): NSCP wind speed, exposure, enclosure, low-rise, and flexible definitions; linked questions 10/10; blockers 0; anchors: page-0060.md lines 21-82: building definitions; page-0080.md lines 37-81: procedures and basic wind speed; page-0081.md lines 9-17: wind parameter outline; page-0092.md lines 5-13: Occupancy II wind-map probability note; page-0095.md lines 49-79: Exposure B/C/D; page-0121.md lines 5-59: MWFRS pressure context.
- lea-strc-009-01 (lea-strc-009-01-core-concept): NSCP Section 605 timber decay and termite protection conditions; linked questions 10/10; blockers 0; anchors: page-0870.md lines 13-113: Section 605.1 through 605.7; page-0871.md lines 3-16 and 35-42: wood-earth separation and treated-wood moisture content.

## Source basis

- Valid local PDF: vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National-Structural-Code-of-Ph-7th-Ed.pdf
- Valid PDF hash: sha256:2cd83a4f520e16a48b558ccc60c50e85f16c2547e34850c60669e7a9e0763e03
- OCR conversion: vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition
- Rejected source: the older National Structural Code of the Philippines 2015 PDF remains null-byte corrupted and was not used as evidence.

## Question edits

- Linked questions selected: 50
- Question-edit JSON files: 50
- Answer-key changes: 0
- Policy: correct_option_id, correct_value, and accepted_answers preserved unless source audit proves correction. No answer-key correction was needed in Batch 161.

## Unselected residuals

- lea-strc-009-02: SOURCEABLE_DEFERRED. Exact NSCP support exists in Table 615.2-1 and machine-graded lumber provisions, but Batch 161 was capped at five clusters to preserve the requested small-batch shape. Next source need: Use NSCP OCR page-0889.md lines 5-65 and page-0943.md lines 51-96 in a later batch; rewrite unsupported hardboard/fiberboard/nominal-size questions or source them separately.
- lea-util-004-05: UNSUPPORTED_FOR_BATCH_161. Linked questions require mixed authority beyond the checked NSCP conversion: flood contamination, RA 10121 resilience, PD 1096, ASTM rooftop fasteners, emergency transfer timing, generator autonomy, emergency communications, and MEPF operational resilience. NSCP OCR alone does not exactly support all linked questions. Next source need: Exact local anchors for RA 10121, PD 1096, applicable ASTM/ASCE/NSCP MEPF anchorage provisions, and utility/emergency-system standards before article and 15 linked-question edits.
- lea-util-004-08: UNSUPPORTED_FOR_BATCH_161. Linked questions mix gas shutoff valve mechanics, emergency generator inspection, positive mechanical connection/friction claims, flexible transitions across expansion joints, generator auto-start timing, equipment restraints, corrosion inspections, and Zone 4 Z factor. The current NSCP OCR has partial seismic anchors, but not exact support for every linked operational/MEPF claim. Next source need: Exact NSCP nonstructural component/mechanical-electrical anchorage pages plus local standards or manufacturer/operational sources for gas valves, generators, flexible couplings, and post-earthquake inspection requirements.

## Validation summary

- Compose dry-run strict: PASS for 5/5 selected bundles.
- Diff dry-run strict: PASS for 5/5 selected bundles, safe=true.
- Official validate: PASS for 5/5 in a temporary scoped validation root, blockers=0, warnings=0. Shared sync-state stayed untouched because it is off-limits and already dirty.
- Source verification invariants: PASS, 7 tests.
- Linked-question scan: PASS, 50 linked questions equals 50 question edits, answer-key changes 0.
- Marker/internal-note scan: PASS on selected normalized/candidate files.
- Final JSON parse and scoped git diff checks are recorded in the scoped checks artifact.
