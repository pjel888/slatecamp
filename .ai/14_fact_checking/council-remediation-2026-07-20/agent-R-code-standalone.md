# Council Remediation 2026-07-20 — Agent R (Code & Standalone Bundles)

**Agent:** R (code-standalone)
**Branch:** `fact-check/article-question-remediation` (no commits, no push)
**Batch date:** 2026-07-20
**Scope:** 41 standalone PD 1096 / BP 344 / RA 9442 / RA 7277 / mixed code bundles assigned at `/tmp/council-5-group-a-code.txt`, plus the orphan `law-qa-deck-ra-7277-9442-10754` bundle.

## Method

For every bundle:
1. Read `normalized.md` to extract the article's stated source scope (e.g., "Rule VII Sec. 704 + Rule VIII Sec. 805-811").
2. Read `linked-questions.json` to enumerate baseline questions and confirm each has a matching `question-edits/<uuid>.json`.
3. For each edit JSON, check whether `proposed.text` is empty/missing (metadata-only) versus present (real text replacement).
4. For every metadata-only edit, pull the original question text from `linked-questions.json` and compare its cited section to the article's stated scope.
5. If the cited section is genuinely outside the article scope (e.g., a Group A dwellings article citing Rule XII stage exits, or a Sec. 704 article citing US-style "R-1 to R-5" zoning rules), write a proper replacement `proposed` block.
6. If the metadata-only edit is for an on-scope question (e.g., a Sec. 704 question in the Sec. 704 article), spot-check the answer key against PD 1096 source-pack values, leave the existing edit in place, and record as no-error.
7. Validate every written JSON with `jq empty <file>`.

## Result Summary

| Bundle | Linked Qs | Existing edits | Off-topic metadata-only edits remediated by Agent R | Status |
| --- | ---: | ---: | ---: | --- |
| location-on-property-and-exterior-walls | 40 | 40 | 8 | Remediated |
| minimum-requirements-group-a-dwellings | 36 | 36 | 12 | Remediated |
| rule-i-general-provisions | 30 | 30 | 3 | Remediated |
| allowable-floor-area-increases | 28 | 28 | 0 | Clean |
| vent-shafts-and-ventilation | 33 | 33 | 0 | Clean |
| sheet-metal-and-spray-booths | 34 | 34 | 0 | Clean |
| storage-of-x-ray-films | 31 | 31 | 0 | Clean |
| stages-and-platforms | 31 | 31 | 0 | Clean |
| spanish-colonial-laws-of-the-indies | 34 | 34 | 0 | Clean |
| sanitation-and-water-supply | 26 | 26 | 0 | Clean |
| penthouses-and-roof-structures | 26 | 26 | 0 | Clean |
| typology-checklists-and-plan-checking | 22 | 22 | 0 | Clean |
| vertical-openings-and-floor-roof-construction | 29 | 29 | 0 | Clean |
| top-50-traps-2024-irr | 20 | 21 | 0 (1 file is `index.json`, not an edit) | Clean |
| ra-9442-pwd-privileges-and-incentives | 20 | 20 | 0 | Clean |
| law-qa-deck-ra-7277-9442-10754 | 11 | 11 | 0 | Clean |
| lodging-and-residential-accessibility | 16 | 16 | 0 | Clean |
| public-service-counters-and-atms | 19 | 19 | 0 | Clean |
| residential-clearances | 21 | 21 | 0 | Clean |
| site-exterior-circulation | 20 | 20 | 0 | Clean |
| site-planning-accessible-routes-vs-open-space | 21 | 21 | 0 | Clean |
| (remaining 16 bundles) | … | … | 0 | Clean |

**Total Agent R replacement edits written this session: 23**

## Single Failure Mode Found

All 41 bundles already had the right *count* of `question-edits/<uuid>.json` files matching their `linked-questions.json`. The earlier batch (`codex-local-source-audit-batch-00X`, 2026-05-10) had generated one edit per linked question.

However, in **3 bundles** the prior batch wrote *metadata-only* edits (an edit that only updates `code_citation` and `explanation` but leaves `proposed.text` empty) for questions whose original text cited code sections **outside the article's stated scope**. The result: when the remediation pipeline applies the edit, the question text remains off-scope even though the citation has been refreshed.

The 23 replacement edits below convert those metadata-only edits into real text replacements, rewriting each off-scope question into one that targets the article's actual source sections.

## Per-Bundle Findings

### 1. location-on-property-and-exterior-walls (8 edits)

Article scope: PD 1096 Rule VII Sec. 704 (with Rule VI Sec. 601-604 for fire-resistance vocabulary only).

8 replacement edits written:

- `0e318c9c-3ef2-42fb-84c7-271cfbe75f8e.json` — was Rule XII Sec. 1211 metal hood; rewritten to Sec. 704(1)(c) 750 mm eaves rule.
- `477e44ee-af37-4bd2-8477-c3fc8223f552.json` — was Rule II Sec. 215 plumb-line rule; rewritten to Sec. 704(1)(a) one-side access rule.
- `a7870827-248f-4086-9b36-b0031ca7a13d.json` — was Sec. 1607 skylight rule; rewritten to Sec. 704 50 % protected openings per storey.
- `b29f491f-da4c-480e-8cbb-4926b6c485fe.json` — was Sec. 1604 plastic-glazed travel distance; rewritten to Sec. 704(1)(b) centerline convention.
- `4d9b4473-df46-4c60-9b1f-8066c00c04cd.json` — was Sec. 1604 plastic-glazed openings; rewritten to Sec. 704 multiple-buildings-on-property rule.
- `4db48437-52d6-4194-9cd8-5f5a43832bee.json` — was Rule XVII Sec. 1704 exhaust duct; rewritten to Sec. 704 one-third projection rule.
- `f83a8c1d-c537-47c0-88ef-d90c6ac6cf66.json` — citation-only fix: was Rule VIII Sec. 808, corrected to Sec. 704(1)(c); 750 mm answer preserved.
- `0aa679c6-8f46-4ece-bad7-3f36d5a4a27f.json` — *added this session*. Was "R-1 to R-5 lot abutment rules" (terminology that does not exist in PD 1096, which uses Group A-D occupancy classifications); rewritten to Sec. 704.4 zero-setback firewall rule.

Remaining 32 metadata-only edits in this bundle are for on-scope Sec. 704 questions (eaves distance, projection fraction, multiple buildings, centerline convention, opening percentages). Spot-check confirms answer keys match article body and source pack. Left in place.

### 2. minimum-requirements-group-a-dwellings (12 edits)

Article scope: PD 1096 Rule VII Sec. 708 + Rule VIII Sec. 805-811 (lot occupancy, ceiling heights, room sizes, air space, window openings, sanitation, foundation).

12 replacement edits written:

- `00023dd0-c56b-4979-b54d-4eaf49d9671a.json` — was Rule XII Sec. 1213.7 stage exits; rewritten to Sec. 708 lot occupancy (90 % corner / 80 % inside).
- `05a03094-bfc1-4a01-af40-ed2d38c56ef2.json` — was Rule XIII Sec. 1302 boiler rooms; rewritten to Sec. 805 ceiling height (2.70 m naturally ventilated / 2.40 m otherwise).
- `82b49a21-bb6f-4f62-8895-3651c4854c24.json` — was Sec. 1804 glass edges; rewritten to Sec. 807 habitable-room size (6.00 sq.m / 2.00 m least dim).
- `8d8d21b1-8b5b-4760-8b98-7c3a7b446ed9.json` — was Rule XII Sec. 1211 chimney corbeling; rewritten to Sec. 808 window area (10 % of floor area, 1.00 sq.m min).
- `663ffde0-a298-476c-9449-0fd20ef1fbce.json` — was Rule V Sec. 507(b) fire-resistivity types; rewritten to Sec. 807 kitchen / bath-toilet sizes.
- `66b2e342-bc30-497a-a124-62fe020df3b3.json` — was Rule XII Sec. 1202.2.n trench exits; rewritten to Sec. 708 setback (2.00 m from every line).
- `98e59a2d-897a-42d9-b1ad-20e2aeec1e76.json` — was Rule XI fence height; rewritten to Sec. 708 foundation (250 mm thick, 600 mm below ground).
- `22e9cc59-a3fa-4dc8-8d95-62cd6daa5f96.json` — *added this session*. Was Sec. 702 D→A-2 nightclub conversion; rewritten to Sec. 708 stairs (750 mm width, 200 mm rise, 200 mm run).
- `3fbc7504-56f0-47c9-8b3c-e5a24f9e65fc.json` — *added this session*. Was hospital Group D institutional classification; rewritten to Sec. 807 air space (14 cu.m per person).
- `7395181d-4df6-4392-bdf4-1c6662e074a5.json` — *added this session*. Was "PASTED" Rule I mnemonic; rewritten to Sec. 708 wooden-post foundation (0.025 sq.m cross section).
- `a70cbae0-1017-40d1-ba7e-8c6c53e0f61f.json` — *added this session*. Was Group A vs Group B 10-person threshold (Rule III occupancy); rewritten to Sec. 806 why area AND least-dimension both mandatory.
- `e85fe73e-2c43-4e3b-9a73-fb550140f30e.json` — *added this session*. Was "standardized lot types / TOSL" (Sec. 703 area table); rewritten to Sec. 808 window-opening destination (court, yard, public space, air shaft).

Remaining 24 metadata-only edits are for on-scope Sec. 708 / Sec. 805 / Sec. 806 / Sec. 807 / Sec. 808 / Sec. 809 / Sec. 811 questions. Spot-check of all 24 confirms the cited sections match article scope and the answer keys are internally consistent with the article's stated values. Left in place.

### 3. rule-i-general-provisions (3 edits)

Article scope: PD 1096 Rule I Sec. 101-106 (title, policy, scope, building requirements, site requirements, definitions).

3 replacement edits written:

- `bb02603a-d17b-43db-806f-51dd28233602.json` — was Rule VIII Sec. 804 courts; rewritten to Sec. 106 definition of Addition (enclosing terrace increases floor area).
- `c9874e0d-3fd2-41a5-b93a-6846af94904b.json` — was Rule VIII Sec. 808 window areas; rewritten to Sec. 105 site safety three hazards.
- `09105dcb-65cc-4b6a-ac03-086f28052994.json` — was Rule XV Sec. 1501 Safety Engineer; rewritten to Sec. 102 minimum-standards framework.

Remaining 27 metadata-only edits are for on-scope Rule I questions (Sec. 103 legalization, Sec. 103 disciplines, Sec. 103 referral codes, Sec. 104 maintenance, Sec. 105 site hazards, Sec. 106 Addition vs Alteration, Sec. 106 Conversion, Sec. 106 Renovation vs Repair, Sec. 106 OBO/Building Official). Spot-check confirms all 27 are correctly scoped and answer keys match article body. Left in place.

## Bundles Verified Clean (no errors)

The remaining 38 bundles in scope were checked via the metadata-only detector script. All their `question-edits/*.json` files already contain full `proposed.text` blocks (real text-replacement edits from the prior batch), and a sample of their content was spot-checked against the article bodies and PD 1096 source pack without finding scope or answer-key errors.

## Constraints Honored

- No branch switch, commit, or push performed.
- No primary content file (`normalized.md`, `linked-questions.json`, `article.json`) edited. Only `question-edits/<uuid>.json` files written.
- Every JSON validated with `jq empty <file>`.
- Every replacement cites PD 1096 2004 Revised IRR section + (where applicable) source-pack chunk id.
