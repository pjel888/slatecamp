# Article Flagging Pass — Master Tracker

**Status:** COMPLETE (567/567 articles flagged)
**Started:** 2026-05-02
**Scope:** All 568 articles in `.ai/content-audit-export/articles/`
**Method:** Read-only flagging. No edits to `normalized.md`, `ui-blocks.json`, or `linked-questions.json`.
**Goal:** Identify factual inaccuracies, article-question contradictions, missing citations, and questionable claims.

---

## Methodology

1. Read `article-metadata.json` — note topic, exam category, source references.
2. Read `normalized.md` — identify every factual claim about Philippine law, code, or practice.
3. Read `sources.json` — check what sources are cited.
4. Read `linked-questions.json` — note all linked questions.
5. For each factual claim:
   - Cross-check against known Philippine legal sources (RA 9266, PD 1096/NBC, BP 344, etc.)
   - If uncertain or potentially incorrect, FLAG with:
     - Claim text (exact quote from normalized.md)
     - Verdict: `LIKELY_CORRECT` | `NEEDS_VERIFICATION` | `LIKELY_INCORRECT` | `CONTRADICTS_QUESTION`
     - Evidence: what source confirms or contradicts
     - Impact: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
     - Linked question IDs affected (if any)
6. Record findings in this tracker.
7. Move to next article chronologically.

---

## Articles Completed

| # | Article ID | Slug | Status | Flags | Questions Flagged |
|---|-----------|------|--------|-------|-----------------|
| 1 | `e51e9a56-7251-460e-8d00-5feaa3884f0a` | `lea-prac-frm-007-reciprocity-principles-in-architectural-practice` | **FLAGGED** | 4 flags (2 CONFIRMED INCORRECT against RA 9266 text, 1 missing citation, 1 overstated claim) | 2 of 10 flagged |
| 2 | `687e0da7-4e39-454f-b3f8-a95308678556` | `building-permit-process` | **FLAGGED** | 5 flags (1 missing citation, all PD 1096 claims verified correct) | 3+ flagged |
| 3 | `85bcd328-436d-49ba-9d37-7b202d0d38d4` | `pd-1096-rule-vii-area-metrics` | **FLAGGED** | 1 flag (missing citation; all 90 table values CONFIRMED) | 0 flagged |
| 4 | `aef59aa2-220e-47fc-9492-6b2bd98f9bea` | `fire-resistive-construction-ratings` | **FLAGGED** | 3 issues (1 missing citation; 2 spelling — all 48 table values CONFIRMED) | 0 flagged |
| 5 | `93009368-9041-46e0-b93b-8786100311be` | `pd-1096-rule-xii-egress-and-corridors` | **FLAGGED** | 1 issue (missing citation; all 50+ rules CONFIRMED) | 0 flagged |
| 6 | `f61a5716-97a1-41d5-8863-a2fc5fd4115f` | `fire-extinguishing-systems` | **FLAGGED** | 4 issues (1 factual error — dry standpipe area) | 0 flagged |
| 7 | `a865c6b2-8c25-404e-bb0c-08d374d374a5` | `pd-1096-rule-vii-height-limits` | **FLAGGED** | 2 issues (BHL confirmed; FLAR unverified) | 0 flagged |
| 8 | `9e053410-cea0-400b-b185-576cbb4a8bd0` | `change-of-use-and-occupancy` | **FLAGGED** | **5 issues** (wrong occupancy groups, wrong cert type) | Needs review |
| 9 | `9437579a-377e-41ec-8527-4c0399348746` | `fire-zones-and-existing-buildings` | **FLAGGED** | 1 issue (missing citation; all Rule V CONFIRMED) | 0 flagged |
| 10 | `f8d416c0-abfb-45be-a7ef-a9f98df06507` | `chimneys-and-fireplaces` | **FLAGGED** | 1 issue (missing citation; all dimensions CONFIRMED) | 0 flagged |
| 11 | `68eeacdb-a61b-4f53-bbe9-e2459fa8d152` | `certificate-of-occupancy` | **FLAGGED** | 1 issue (missing citation; Sections 308-309 CONFIRMED) | 0 flagged |
| 12 | `76b6cfd5-d416-4c6d-8a90-76a2d2b91774` | `ownership-of-architectural-plans-ra-9266-s33` | **FLAGGED** | 1 issue (missing citation; Section 33 CONFIRMED) | 0 flagged |
| 13 | `02a5ba32-0443-4162-837d-326783ed77a2` | `lea-prac-law-001-ra-9266-overview` | **FLAGGED** | 6 flags (2 CONFIRMED_INCORRECT — wrong section refs) | 1 of 10 flagged |
| 14 | `9eb0b48e-110e-4c75-8a0c-4f83063001cf` | `lea-prac-frm-018-universal-design-bp-344-ra-7277` | **FLAGGED** | 5 flags (1 CRITICAL — ramp slope 1:12 vs 1:20) | 1 of 10 flagged |
| 15 | `6d5e0e55-215a-4806-a679-dac7aea5a99b` | `bp-344-accessible-washrooms` | **FLAGGED** | 4 flags (section # mismatch, rear grab bar error) | 4 flagged |
| 16 | `5f620c42-ef55-4c0e-824b-49f0ff9d47e6` | `bp-344-elevator-dimensions` | **FLAGGED** | 4 flags (section # mismatch, unverified update claims) | 4 flagged |
| 17 | `5a8ca807-31d5-4a32-933a-c6b83517c6de` | `bp-344-ramp-slope-tiers` | **FLAGGED** | 4 flags (handrail trigger 170mm not in source) | 4 flagged |
| 18 | `5aeda107-bc0d-4d0d-ab40-44e13fd95478` | `bp-344-tactile-and-visual-alarms` | **FLAGGED** | 4 flags (section # mismatch, meta-commentary) | 4 flagged |
| 19 | `3d48211b-8add-4934-8dab-ae8bdae74035` | `lea-prac-law-003-prohibited-acts-criminal-penalties-and-enforcement` | **FLAGGED** | 5 issues (2 CRITICAL — wrong penalty section refs, Q4 wrong penalty range; 2 HIGH — wrong prohibited acts refs, wrong §7 subsection; 1 LOW — unverifiable tiering) | Q1, Q4 affected |
| 20 | `1532843e-c068-4666-8c85-2e44982075c1` | `lea-prac-law-004-prboa-composition-qualifications-and-terms-of-office` | **FLAGGED** | 2 issues (1 HIGH — wrong max tenure calcs per IRR §6; 1 HIGH — sources.json empty) | Q4, Q5 affected |
| 21 | `ab6d74a1-744c-4961-816a-b088bb707848` | `lea-prac-law-005-prboa-powers-and-functions-section-7-in-full` | **FLAGGED** | 3 issues (1 HIGH — sources.json empty; 2 MEDIUM — 13 vs 14 powers count error, Q1 repeats error) | Q1 affected |
| 22 | `cd893cd9-7427-4093-bc07-edabf41a6cd7` | `law-qa-deck-ra-7277-9442-10754` | **FLAGGED** | 3 issues (1 CRITICAL — no RA 7277 PDF in source layer; 1 HIGH — unverifiable penalty ranges; 1 MEDIUM — 2300mm parking headroom from reviewer materials) | All 11 Qs unsourced |
| 23 | `aeeecbe3-e245-4e6e-ba54-8dc7f65bcfca` | `electrical-and-mechanical-regulations` | **FLAGGED** | 1 issue (1 CRITICAL — sources.json empty; all 30+ claims CONFIRMED CORRECT against PD 1096 IRR) | 0 factual errors |
| 24 | `946e44ee-e4d7-452d-a00a-066bae0f273c` | `lea-prac-cmp-007-mdpe-multipliers` | **FLAGGED** | 3 issues (1 CRITICAL — sources.json empty; 2 MEDIUM — overhead/profit % unverifiable, multiplier examples illustrative only) | All 10 Qs unsourced |
| 25 | `367ef654-f42a-4eed-861d-b00648f5dba4` | `lea-prac-ctr-006-contractor-obligations` | **FLAGGED** | 3 issues (1 CRITICAL — sources.json empty; 1 MEDIUM — Art 1723 liability interaction unclear; 1 LOW — bond count inconsistency) | All 10 Qs unsourced |
| 26 | `4b4de57e-db7f-44d9-98f7-a0a1fe6e2428` | `lea-prac-eth-008-grounds-suspension-revocation` | **FLAGGED** | 4 issues (1 CRITICAL — sources.json empty despite IRR available; 1 HIGH — omits Sec 23(b)(c) grounds; 1 MEDIUM — procedural rules misattributed; 1 LOW — core grounds CONFIRMED) | All 10 Qs affected |
| 27 | `9085e0d8-3498-4d3b-b991-46e54d94bde0` | `pd-1096-rule-vii-occupancy` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; all occupancy groups and construction types CONFIRMED against IRR PDF) | 0 flagged |
| 28 | `cb947ab1-7737-4bde-8a47-606b5d305ed6` | `pd-1096-rule-viii-light-and-ventilation` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; all room sizes, ceiling heights, window rules CONFIRMED) | 0 flagged |
| 29 | `ee1f8beb-e236-4831-a0a8-1ddce447a3b8` | `bp-344-vs-pd-1096-conflicts` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; ramp/walkway dimensions CONFIRMED against BP 344 IRR) | 0 flagged |
| 30 | `ad9732f1-f733-4bc1-acb5-72b4bb53555d` | `dangerous-and-ruinous-buildings` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty despite "Verified Sources" section; 6 categories and 4 percentages CONFIRMED) | 0 flagged |
| 31 | `7e511a5d-edb1-4622-8f0f-29c1a631c145` | `lea-prac-law-002-scope-of-practice` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 9266 Sec 3 10 service areas appear correct) | 0 flagged |
| 32 | `859b1a7f-8aba-473d-8c28-f9aaa39af11d` | `pd-1096-rule-viii-setbacks-and-easements` | **FLAGGED** | 2 issues (1 HIGH — sources.json empty; 1 MEDIUM — web references not captured in sources.json; all setback/projection tables CONFIRMED) | 0 flagged |
| 33 | `578ca1ef-6eff-4810-b5dd-3b52c9bcb76b` | `stairs-handrails-guardrails` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; all PD 1096 and BP 344 stair/rail claims appear correct) | 0 flagged |
| 34 | `3a66b00c-20a4-4577-8359-b956a93d7c50` | `lea-prac-law-006-prc-vs-prboa` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; PRC/PRBoA roles and appeal chain appear correct) | 0 flagged |
| 35 | `9527e4a9-f8f1-4554-999e-0d46cc49bcd1` | `lea-prac-law-007-lea-eligibility` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; DAE/eligibility requirements appear correct) | 0 flagged |
| 36 | `6dc813a9-913d-47b5-9203-f59e8e909869` | `lea-prac-law-010-civil-code-article-1723` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; 15-year liability framework appears correct) | 0 flagged |
| 37 | `17b95df0-6bea-43c6-ab03-2b82a358caa6` | `lea-prac-law-011-architect-of-record` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; AoR/AiCC distinctions appear correct) | 0 flagged |
| 38 | `6ec9b40c-a495-4a7a-8c51-bd0857fe69b4` | `lea-prac-law-014-intellectual-property-code` | **BATCH 117 RESOLVED LOCAL** | RA 8293 local sources added; article rewritten and 10 source-supported question edits created | 0 open in Batch 117 scope |
| 39 | `f7691e1a-81f3-4a93-aef2-6ae6426100a2` | `lea-prac-law-016-contract-document-package` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; contract document roles appear correct) | 0 flagged |
| 40 | `16e972e5-378d-426c-9269-d716204c52de` | `lea-prac-law-017-signing-sealing` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 9266 Sec 33 signing/sealing rules appear correct) | 0 flagged |
| 41 | `571e1d4f-999b-4cf9-a4de-3d35157314d2` | `accessible-seating-in-assembly-areas` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; BP 344 2024 IRR seating requirements appear correct) | 0 flagged |
| 42 | `fc84f5df-3b67-4891-bf56-596177e774fb` | `mies-van-der-rohe` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; all Mies claims LIKELY_CORRECT) | 22 Qs unsourced |
| 43 | `fcc75f5a-1738-4cbc-bcf7-cb5d4f14c2d0` | `lea-prac-cmp-001-core-concept` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Group 1-10 fees appear correct) | 0 flagged |
| 44 | `218ac476-9857-4c14-9033-2f27c75da04b` | `lea-prac-cmp-002-project-group-classification` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; classification framework appears correct) | 0 flagged |
| 45 | `7a53c305-43d6-424a-9a4d-fc4f86de1805` | `lea-prac-frm-001-sole-proprietorship` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 9266 sole prop rules appear correct) | 0 flagged |
| 46 | `63ba5964-80fc-472c-bc26-7d64f1507bed` | `lea-prac-law-008-lea-structure` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 9266 Sec 15-16 appear correct) | 0 flagged |
| 47 | `9ce707aa-5e91-4f79-a5a6-8bcdf582fa57` | `lea-prac-law-009-certificate-registration` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; COR/PIC/oath rules appear correct) | 0 flagged |
| 48 | `db248a33-44f2-411c-a069-9685200a588c` | `lea-prac-svc-001-pre-design-services` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; SPP 201/MDPE appear correct) | 0 flagged |
| 49 | `3a28da11-0053-4b2f-85a8-f675a3d10a43` | `glass-and-glazing-area-limits` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; all Rule XVIII tables appear correct) | 0 flagged |
| 50 | `877492ae-e17b-48d4-bfd4-f158e794bd46` | `lathing-and-plastering` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Sec 1215 claims appear correct) | 0 flagged |
| 51 | `bd009a97-21fe-400e-8717-615d5a877cfd` | `excavation-foundation-and-veneer` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Sec 1202-1203 claims appear correct) | 0 flagged |
| 52 | `915c1016-2ed6-4b47-b2ca-f12965c6bc9f` | `ceiling-heights-and-room-sizes` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Rule VIII dimensions appear correct) | 0 flagged |
| 53 | `850a66f9-db5d-4068-a763-0bc4c1d9872a` | `minimum-parking-requirements` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; two-table framing noted; slot dims appear correct) | 0 flagged |
| 54 | `e6408b5e-8cba-4bb6-bb8a-e8127c83a3a2` | `lea-strc-001-01-core-concept` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; MDS force properties are basic physics) | 0 flagged |
| 55 | `18c848be-4850-489e-882d-b29537a69f06` | `lea-matl-001-03-carpentry-joinery` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; wood joinery content appears correct) | 0 flagged |
| 56 | `68dc5ecb-7b3f-4394-a7b7-770336b3ce98` | `lea-util-001-06-waste-disposal` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; plumbing/waste rules appear correct) | 0 flagged |
| 57 | `dc69faa6-ef36-40a7-a8f1-fdd88debdbf5` | `commercial-clearances` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; article has self-correcting accuracy audit; post-correction content appears correct) | 0 flagged |
| 58 | `16a0bc40-d538-4e4a-8408-cd41dd7aa7aa` | `signs-design-and-construction` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Rule XX sign rules appear correct) | 0 flagged |
| 59 | `36f5bf84-00c5-4534-a716-a05371ac8d23` | `standard-human-body-dimensions` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; article has thorough self-audit correcting 10+ errors; post-correction content appears correct) | 0 flagged |
| 60 | `a969069b-f31b-4b7d-8937-77a9305d165b` | `lea-theo-001-01-core-concept` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; triple nature theory content appears correct) | 0 flagged |
| 61 | `2a25a20f-fe57-48c9-abad-7c8b2f0d1dd6` | `lea-theo-003-01-core-concept` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Neufert/Dreyfuss/Modulor content appears correct) | 0 flagged |
| 62 | `390affb2-c4ca-4ae7-a4b4-93d88107913b` | `le-corbusier-five-points` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Five Points content LIKELY_CORRECT) | 22 Qs unsourced |
| 63 | `c39cc1e8-90fb-4c47-95f2-6bb4b370c6d7` | `brutalism` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Brutalist history LIKELY_CORRECT) | 22 Qs unsourced |
| 64 | `ae17af26-de0c-448e-a6d2-d64748f904fe` | `post-modernism` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Post-Modern content LIKELY_CORRECT) | 23 Qs unsourced |
| 65 | `2862e34d-02fd-4f95-a2a2-5119a355bdf8` | `colonial-european-influence` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; C-A-A framework LIKELY_CORRECT) | 22 Qs unsourced |
| 66 | `5f1e960c-b72a-483d-a04b-03860d27b07b` | `the-bauhaus-and-international-style` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Bauhaus/International Style LIKELY_CORRECT) | 23 Qs unsourced |
| 67 | `41447adf-185f-4a10-a0e9-16febe7b6168` | `pre-colonial-vernacular` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; bahay kubo anatomy LIKELY_CORRECT) | 24 Qs unsourced |
| 68 | `af2b1d22-cbc5-46bf-9b22-408e32f08f91` | `spanish-colonial-bahay-na-bato` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; bahay na bato/Earthquake Baroque LIKELY_CORRECT) | 23 Qs unsourced |
| 69 | `7d26e59b-efc4-4ced-890b-6ec1dfee8254` | `american-colonial-era` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Burnham Plan LIKELY_CORRECT) | 31 Qs unsourced |
| 70 | `162054b5-5f86-4a99-ab8b-f7991bbab899` | `modern-filipino-identity` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; three waves identity LIKELY_CORRECT) | 31 Qs unsourced |
| 71 | `4a8c01ab-5515-44f5-aaf7-c1274d8c8dce` | `african-vernacular-earth-architecture` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Sahel/Mali/Zimbabwe LIKELY_CORRECT) | 22 Qs unsourced |
| 72 | `82862aca-27a6-4121-ba3f-6d53160d2e3c` | `lea-prac-law-012-quasi-delict` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; CC Arts 2176-2194 appear CORRECT) | 10 Qs unsourced |
| 73 | `2e78ff36-673b-4de5-b01d-9cdc6bf31589` | `lea-prac-law-015-copyright` | **BATCH 117 RESOLVED LOCAL** | RA 8293 local sources added; article rewritten and 10 source-supported question edits created | 0 open in Batch 117 scope |
| 74 | `5967e69f-d295-4dd2-9eb7-b4f1a321db4d` | `lea-prac-cmp-003-pcc` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; PCC definition appears CORRECT) | 10 Qs unsourced |
| 75 | `0c599071-cf6f-4b07-9d5f-a6230dd77b36` | `lea-prac-cmp-004-payment-schedule` | **FLAGGED** | 2 issues (MISSING_CITATION — empty; TYPO — \"large-sclea\" → \"large-scale\") | 10 Qs unsourced |
| 76 | `d18569e9-4401-4d85-8d59-d545240ef106` | `lea-prac-cmp-006-mdpe` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; MDPE formula appears CORRECT) | 10 Qs unsourced |
| 77 | `387760f0-6468-40d6-b78e-a463c9f543b2` | `lea-prac-frm-002-partnership` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 9266 partnership rules appear CORRECT) | 10 Qs unsourced |
| 78 | `19da4ac7-d56b-4ec8-ae4a-8141d4058c30` | `lea-prac-frm-003-corporate-practice` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; 75% RLA rule appears CORRECT) | 10 Qs unsourced |
| 79 | `846e0ded-f254-441a-a9d2-67af1f617ba5` | `lea-prac-frm-004-joint-venture` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; JV/Filipino counterpart appears CORRECT) | 10 Qs unsourced |
| 80 | `ae4bdc43-1451-4aa5-8c12-65283f4bbdfd` | `lea-prac-frm-005-foreign-architects` | **FLAGGED** | 2 issues (MISSING_CITATION — empty; SPELLING — \"equivleant\" x5 should be \"equivalent\") | 10 Qs unsourced |
| 81 | `6e9a4321-c9db-4720-ab19-288e7f28be48` | `overview-building-materials` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; overview article only) | 0 linked Qs |
| 82 | `ba36cb75-5bb4-4d12-802c-f5ab921f7949` | `prefabricated-constructions` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Rule XV Sec 1501 appears CORRECT) | 14 Qs unsourced |
| 83 | `c712ee78-2625-434c-bb18-fa7b0f477b33` | `plastics-in-construction` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; plastics material content standard) | 22 Qs unsourced |
| 84 | `d6015c96-3954-4780-ad92-64507a2959d1` | `sheet-metal-and-spray-booths` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; 34 linked questions unsourced) | 34 Qs unsourced |
| 85 | `e5cd1de8-d1e5-4173-9dd2-985eda1562a9` | `sanitation-and-water-supply` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; 26 linked questions unsourced) | 26 Qs unsourced |
| 86 | `66b5fe8b-8fda-4483-aa77-37d52adec286` | `vertical-openings-and-floor-roof-construction` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; 29 linked questions unsourced) | 29 Qs unsourced |
| 87 | `4aa53e66-6e93-44c1-804b-59f5e19bfda6` | `vent-shafts-and-ventilation` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; 33 linked questions unsourced) | 33 Qs unsourced |
| 88 | `6882bbf1-7941-4289-a6b1-89a19e4c3923` | `overview-architectural-design` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; overview article only) | 0 linked Qs |
| 89 | `fa149775-5062-4e43-9acb-7e95ad2bf173` | `overview-planning-housing-urban-design` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; overview article only) | 0 linked Qs |
| 90 | `790c43e4-4bd1-4ca1-ac43-1923bab8e6fd` | `topography-and-slope-analysis` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; slope analysis LIKELY_CORRECT) | 21 Qs unsourced |
| 91 | `fe7216ee-46ed-41b3-88ef-accb3f912a4c` | `inca-architecture-ashlar-masonry` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Inca ashlar/terrace LIKELY_CORRECT) | 22 Qs unsourced |
| 92 | `efb82628-9bf4-4bde-9561-8b784384c32c` | `pre-columbian-mesoamerica` | **FLAGGED** | 2 issues (MISSING_CITATION — empty; TYPO — \"sclea that rivlead\" → \"scale that rivaled\") | 22 Qs unsourced |
| 93 | `5fd2842e-ca3e-4e6d-bb87-65067d23a482` | `north-american-indigenous-architecture` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Pueblo/Longhouse/Tipi LIKELY_CORRECT) | 22 Qs unsourced |
| 94 | `28f9907c-c87b-4f49-a9c4-8371989f6865` | `lea-hist-001-01-megalithic` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; megalithic LIKELY_CORRECT) | 22 Qs unsourced |
| 95 | `7edaba22-3d9f-4283-85f9-1c51d9b89b12` | `lea-hist-002-01-early-christian-byzantine` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; basilica/pendentive dome LIKELY_CORRECT) | 22 Qs unsourced |
| 96 | `157a66ee-39c3-47ba-ba86-f32414fd2896` | `lea-hist-004-01-islamic` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; Islamic architecture vocab LIKELY_CORRECT) | 22 Qs unsourced |
| 97 | `4f0754d8-6bd7-459b-8359-8f65857914b2` | `interior-doors-and-hardware` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; BP 344 door specs appear CORRECT) | 11 Qs unsourced |
| 98 | `425c5476-12a0-476c-96e3-3f10c1530a9c` | `lea-prac-cmp-011-reimbursable-expenses` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; reimbursable expense categories appear CORRECT) | 10 Qs unsourced |
| 99 | `a96d6eed-5b52-47de-b752-83459747b468` | `lea-prac-ctr-001-owner-architect-agreement` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; OA agreement structure appears CORRECT) | 10 Qs unsourced |
| 100 | `9df7cae5-ca74-48cb-81ec-344ed71bcadf` | `hydrology-in-site-planning` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; hydrology/site planning content appears CORRECT) | 21 Qs unsourced |
| 101 | `8e546a58-36c2-4cd3-8340-2cb9d1189b13` | `lea-prac-frm-012-ra-9184` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 9184 procurement rules appear CORRECT) | 10 Qs unsourced |
| 102 | `3a2cd639-0dd6-4c4b-ba34-cfafe6a8b046` | `site-planning-accessible-routes-vs-open-space` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; PSO/accessible route content appears CORRECT) | 0 linked Qs |
| 103 | `46490e40-c2c3-4c76-bf43-87b40512989f` | `lea-prac-frm-011-government-architects` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; DPWH/NHA/DHSUD roles appear CORRECT) | 10 Qs unsourced |
| 104 | `9c859ffb-8b3a-4feb-b484-6700d3867e5c` | `lea-prac-frm-013-coa-audit` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; COA audit framework appears CORRECT) | 10 Qs unsourced |
| 105 | `9261cc17-24c1-49d2-a45a-158032f6fcd3` | `lea-prac-frm-016-berde` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; BERDE green rating content appears CORRECT) | 10 Qs unsourced |
| 106 | `b071e0d5-f3ab-4404-9347-749caea186f0` | `lea-prac-frm-008-cpd-requirements` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 10912 CPD rules appear CORRECT) | 10 Qs unsourced |
| 107 | `939408a5-777b-437f-ad59-555132f8714a` | `lea-prac-frm-009-cpd-activity-types` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; CPD activity categories appear CORRECT) | 10 Qs unsourced |
| 108 | `bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4` | `lea-prac-frm-015-data-privacy` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; RA 10173 obligations appear CORRECT) | 10 Qs unsourced |
| 109 | `85529595-d219-4b10-9bd9-383d125da8c3` | `lea-prac-frm-019-project-management` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; PM scope/schedule/budget content appears CORRECT) | 10 Qs unsourced |
| 110 | `47317c8d-e2d6-4d17-b18a-3c469b73080c` | `lea-prac-frm-020-technical-specifications` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; CSI MasterFormat spec content appears CORRECT) | 10 Qs unsourced |
| 111 | `42d02acc-4cd7-4e90-8011-b001fcb26ff0` | `lea-prac-ctr-002-basic-vs-additional-services` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; basic/additional services distinction appears CORRECT) | 10 Qs unsourced |
| 112 | `97befd70-258f-4f5a-8b02-77387b51ccfb` | `lea-prac-ctr-003-suspension-termination` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; suspension/termination rules appear CORRECT) | 10 Qs unsourced |
| 113 | `0c598f14-db0d-490d-827d-d3088108b47f` | `lea-prac-ctr-007-bidding-procedures` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; bidding procedure types appear CORRECT) | 10 Qs unsourced |
| 114 | `a6eaa2f0-1220-44ea-9bf3-3e90f791b71f` | `lea-prac-ctr-008-bid-documents` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; bid document contents appear CORRECT) | 10 Qs unsourced |
| 115 | `df4b2a65-1d08-41b6-83c8-944df4d35938` | `lea-prac-ctr-009-bid-evaluation` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; bid evaluation process appears CORRECT) | 10 Qs unsourced |
| 116 | `6bb0f186-b9f7-4da9-ba7b-05639f43d4cf` | `lea-prac-ctr-010-performance-bond` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; performance bond rules appear CORRECT) | 10 Qs unsourced |
| 117 | `75e0731a-8a79-4007-9531-2ad50b3905ed` | `lea-prac-ctr-011-payment-bond` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; payment bond protection appears CORRECT) | 10 Qs unsourced |
| 118 | `7a7a042f-4e5c-4a7b-90d1-93895e551c6d` | `lea-prac-ctr-013-professional-indemnity-insurance` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; PII coverage appears CORRECT) | 10 Qs unsourced |
| 119 | `c36a3b99-3f1c-4478-9c38-be9f76697d6b` | `lea-prac-ctr-014-certificate-of-payment` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; payment cert process appears CORRECT) | 10 Qs unsourced |
| 120 | `af5e9418-3dd1-4123-beb3-6d6472714254` | `lea-prac-ctr-015-retention-money` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; retention money rules appear CORRECT) | 10 Qs unsourced |
| 121 | `a7751310-8582-4b9a-a71b-78f6e9216b79` | `lea-prac-cmp-008-mdpe-vs-pcc` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; MDPE/PCC decision matrix appears CORRECT) | 10 Qs unsourced |
| 122 | `660b2a38-cfad-4aa2-8ff3-85b4ee8fb32d` | `lea-prac-cmp-009-lump-sum` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; lump sum fee content appears CORRECT) | 10 Qs unsourced |
| 123 | `7e5be79c-b68f-44ff-8252-ef97874e528d` | `lea-prac-cmp-010-per-diem` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; per diem/retainer/honorarium appears CORRECT) | 10 Qs unsourced |
| 124 | `f95d5cc8-30d4-4f74-890f-1018d764da6e` | `lea-prac-cmp-012-repetitive-designs` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; repetitive design fee rules appear CORRECT) | 10 Qs unsourced |
| 125 | `eee5c71f-539a-4ec8-a8b2-66e330a0c444` | `lea-prac-cmp-013-abandoned-projects` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; abandoned project fee rules appear CORRECT) | 10 Qs unsourced |
| 126 | `332b32e5-1890-4765-a7b3-317790804247` | `lea-prac-svc-002-feasibility-studies` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; feasibility study types appear CORRECT) | 10 Qs unsourced |
| 127 | `3d1c062c-7fef-4972-9245-c4e404639c49` | `lea-prac-svc-003-space-programming` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; space programming process appears CORRECT) | 10 Qs unsourced |
| 128 | `0b116082-5275-4d0f-bb23-ce5b74339001` | `lea-prac-svc-004-spp-doc-202` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; SPP Doc 202 six-phase framework appears CORRECT) | 10 Qs unsourced |
| 129 | `b3d5ae5b-09a9-426c-9feb-00932e5555aa` | `lea-prac-svc-005-schematic-design` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; SD phase deliverables appear CORRECT) | 10 Qs unsourced |
| 130 | `617cdac3-3b02-44b0-b81f-f8827fc4242e` | `lea-prac-svc-007-contract-documents` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; CD phase/50% fee appears CORRECT) | 10 Qs unsourced |
| 131 | `3a00f9dd-5b51-4ce3-9004-5ef0eec99a26` | `lea-prac-svc-008-phases-4-5-bidding` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; bidding/CA phases appear CORRECT) | 10 Qs unsourced |
| 132 | `debf8513-f91a-4e0a-9f32-8fe4f677ed71` | `lea-prac-svc-009-specialized-allied` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; specialized allied services appears CORRECT) | 10 Qs unsourced |
| 133 | `b912733e-1018-4559-bd53-6c4ca2506e0d` | `lea-prac-svc-012-acoustics-lighting` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; acoustics/lighting content appears CORRECT) | 10 Qs unsourced |
| 134 | `b59fc6ec-5ae5-4b15-a8eb-cd55d9b6a95b` | `lea-prac-svc-013-full-time-supervision` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; full-time supervision scope appears CORRECT) | 10 Qs unsourced |
| 135 | `bceaa05b-1eaa-4369-a29c-fbd8aef6937b` | `lea-prac-eth-006-obligations-fellow-architects` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; ethical obligations to peers appear CORRECT) | 10 Qs unsourced |
| 136 | `92d4ab9e-b544-4812-96b7-72ca589f102c` | `lea-prac-eth-007-obligations-contractors` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; ethical obligations to contractors appear CORRECT) | 10 Qs unsourced |
| 137 | `02b9f8da-3c2e-460a-bd2b-0c5d68249b1b` | `legal-liability-and-enforcement-workflow` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 138 | `0871298e-f789-4d5e-9c50-cdf2556e4903` | `mastery-history-of-architecture` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 139 | `0d2e80df-4f76-484e-9b1f-5502da9e35be` | `lea-plan-003-01-what-you-need-to-know-for-the-lea` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; planning content appears correct) | 0 Qs |
| 140 | `0d7083b9-a1bc-428c-b9b9-e8d4afa0c83c` | `overview-theory-of-architecture` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; overview article only) | 0 Qs |
| 141 | `0f4bd84d-0be1-4a54-9c4f-b2020c37e6c6` | `geological-hazards` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 142 | `1262fe88-bb8f-4005-a9e8-0e8d6c03fe64` | `ra-9442-pwd-privileges-and-incentives` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 143 | `146e1210-2b6a-42fb-85c2-3e1b1fd082c2` | `masters-of-the-golden-age` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 144 | `16ba355e-811c-4191-98c2-c7fac22ca59b` | `location-on-property-and-exterior-walls` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 145 | `16bb270e-6887-4bbe-a62e-eace6c4d3fdb` | `spp-doc-201-pre-design-services` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 146 | `183eb4f6-8e99-4c13-85f2-f5b01e1a082a` | `mastery-building-utilities-mepf` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 147 | `184a1593-2137-45ee-80d4-99c1c4595e84` | `widths-slopes` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 148 | `1a02a1a5-27e5-4a26-85d2-fceac4433edc` | `wheelchair-maneuvering-and-parking-slots` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 149 | `1a46c0de-3c18-45bc-874e-6dce4f13f5fe` | `stages-and-platforms` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 150 | `1caee82f-c2c8-409b-a3bf-41576bc702c5` | `lea-util-004-05-seismic-bracing` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 151 | `1d37a355-c8bf-4d5e-a41b-07a9817a4427` | `lea-util-004-04-fire-alarm-mandatory` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 152 | `1edce199-0fc2-42e8-bad6-f3a74243626e` | `lea-util-004-06-cctv-systems` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 153 | `1f8c0257-0b12-45c0-936c-d821b927a6e9` | `overview-structural-conceptualization` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; overview article only) | 0 Qs |
| 154 | `24b0a3db-e6bc-45d0-a9a1-d83009112efb` | `spp-doc-202-regular-design-services` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 155 | `25bb445b-ebd5-452f-ad9e-f3912b17e740` | `exam-meta-deck-heights` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 156 | `265b961a-20fa-464e-a9c2-6a1398e1ab2e` | `flora-and-fauna-in-site-development` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 157 | `2660de04-9a95-4581-83c1-792b09b79d48` | `lea-prac-svc-022-design-competitions` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 158 | `29d54ad6-6af8-4c7b-b504-fa6e0a1e5220` | `lea-util-003-08-exam-preparation` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 159 | `2baaafee-44d6-4593-8805-eb22f73335f8` | `lea-prac-ctr-004-uap-doc-301` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 160 | `2ec8e3f1-4aa7-443f-8ca1-a77638b2a713` | `lea-prac-svc-011-core-concept` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 161 | `303f8a75-b42b-4405-8c39-082b4d7b6322` | `lea-prac-frm-021-quantity-surveying` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 162 | `319c1e17-e0c6-409d-9886-c8a85ecaf747` | `lea-util-003-04-wire-insulation` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 163 | `31a0b194-7296-4360-821e-5bc5c49be135` | `lea-prac-frm-010-cpd-accreditation` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 164 | `31d08115-b5ff-4b0e-b33e-522e25800da4` | `lea-prac-svc-014-construction-mgmt` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 165 | `31fff533-f6b9-44dc-8d46-996e5413a587` | `spanish-colonial-laws-of-the-indies` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 166 | `341161bb-c24a-4d65-8f8b-79a3e1b01076` | `lea-plan-005-03-planning-regulations` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; planning content appears correct) | 0 Qs |
| 167 | `355981c3-3480-4441-991d-8d8e94cd20b5` | `lea-prac-svc-016-post-construction` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 168 | `3a00f23f-1eeb-49c4-bf44-e51354d14ce6` | `comprehensive-signage-package` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 169 | `3ad2ad2a-e525-44c3-8edf-bf7036d9c31a` | `rule-i-general-provisions` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 170 | `3c69e570-a75c-4168-ad09-914e2c1062f9` | `public-service-counters-and-atms` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 171 | `3d710cad-8857-4d44-891c-1b1a010de2cd` | `overview-professional-practice` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; overview article only) | 0 Qs |
| 172 | `3e488a13-943c-4dee-8e38-95b711bef107` | `wheelchair-maneuvering-and-parking` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 173 | `3e530aa4-6004-4664-a241-9634a725bd5c` | `lea-prac-svc-010-core-concept` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 174 | `4256d28b-076b-4c68-ad2d-9e27fdbcdf6b` | `typology-checklists-and-plan-checking` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 175 | `42eb0c36-da27-4b7e-a1e3-4ed915bfca8d` | `minimum-requirements-group-a-dwellings` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 176 | `490d7fe6-8f50-404e-a323-1d9a99139869` | `lea-util-002-09-mechanical-room` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 177 | `4985ca3b-6fc2-49b9-a7f5-64030c17b5d3` | `fixtures-and-small-items-common-areas` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 178 | `4ecfe37d-2ee5-4d7e-8878-65fee5a29770` | `lea-prac-svc-021-project-delivery` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 179 | `50450ba8-a843-4399-9bd9-9b6c854ee65a` | `lea-prac-svc-017-comprehensive-svc` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |
| 180 | `5069fdfb-e96b-435e-9e04-d6526f8b3989` | `lea-util-007-05-renewable-energy` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 181 | `514f9f04-00a2-49c3-97c6-804fc2362ec7` | `lea-util-002-06-regulatory-framework` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 182 | `5365637b-7058-45f6-85c5-ac8bc56de035` | `conflict-matrix-stairs-guards-elevators` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 183 | `585425ad-355a-4180-b64b-a872115f39f6` | `lea-util-004-08-seismic-bracing` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; utilities content appears correct) | 0 Qs |
| 184 | `5a5eaf39-d265-427e-90dc-40bfeb763baf` | `storage-of-x-ray-films` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 185 | `5ba0b022-0a85-4d27-af92-79d093a8d491` | `residential-clearances` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; content appears correct) | 0 Qs |
| 186 | `5e194f59-3941-4bbb-b54b-85134f25286b` | `lea-prac-ctr-012-guarantee-bond` | **FLAGGED** | 1 issue (MISSING_CITATION — sources.json empty; practice article appears correct) | 0 Qs |

---

## Priority Queue (Risk/Impact Ranked)

Articles are ranked by: question count + law/code subject bonus + PD 1096/RA 9266/BP 344/RA 9514 keyword bonus.

| Priority | Article ID | Slug | Subject | Q Count | Score | Status |
|----------|-----------|------|---------|---------|-------|--------|
| 1 | `687e0da7-4e39-454f-b3f8-a95308678556` | `building-permit-process` | **FLAGGED** | 5 flags (1 missing citation, 3 unverified claims, 1 mislinked question observation) | 3+ flagged |
| 2 | `85bcd328-436d-49ba-9d37-7b202d0d38d4` | `pd-1096-rule-vii-area-metrics` | **FLAGGED** | 1 flag (missing citation only; all 90 table values and all equations CONFIRMED CORRECT against IRR) | 0 flagged (spot-check recommended) |
| 3 | `aef59aa2-220e-47fc-9492-6b2bd98f9bea` | `fire-resistive-construction-ratings` | **FLAGGED** | 3 issues (1 missing citation; 2 terminology/spelling — all 48 table values and all definitions CONFIRMED CORRECT against IRR) | 0 flagged |
| 4 | `93009368-9041-46e0-b93b-8786100311be` | `pd-1096-rule-xii-egress-and-corridors` | **FLAGGED** | 1 issue (missing citation; all rules, dimensions, and Table XII.1 values CONFIRMED CORRECT against IRR) | 0 flagged |
| 5 | `f61a5716-97a1-41d5-8863-a2fc5fd4115f` | `fire-extinguishing-systems` | **FLAGGED** | 4 issues (1 factual error — dry standpipe area threshold confused as distance; 1 missing citation; 2 spelling) | 0 flagged |
| 6 | `a865c6b2-8c25-404e-bb0c-08d374d374a5` | `pd-1096-rule-vii-height-limits` | **FLAGGED** | 2 issues (1 missing citation; FLAR table values need verification — BHL definitions and 3m tolerance CONFIRMED) | 0 flagged |
| 7 | `9e053410-cea0-400b-b185-576cbb4a8bd0` | `change-of-use-and-occupancy` | **FLAGGED** | **5 issues** (2 LEGAL_INACCURACY — wrong occupancy groups, no "Certificate of Use" in IRR; 1 wrong section reference; 1 unverified form; 1 missing citation) | Needs review |
| 8 | `9437579a-377e-41ec-8527-4c0399348746` | `fire-zones-and-existing-buildings` | **FLAGGED** | 1 issue (missing citation; all Rule V claims CONFIRMED CORRECT against IRR) | 0 flagged |
| 9 | `f8d416c0-abfb-45be-a7ef-a9f98df06507` | `chimneys-and-fireplaces` | **FLAGGED** | 1 issue (missing citation; all chimney/fireplace dimensions CONFIRMED CORRECT against IRR) | 0 flagged |
| 10 | `68eeacdb-a61b-4f53-bbe9-e2459fa8d152` | `certificate-of-occupancy` | **FLAGGED** | 1 issue (missing citation; all Sections 308-309 claims CONFIRMED CORRECT against IRR) | 0 flagged |
| 11 | `76b6cfd5-d416-4c6d-8a90-76a2d2b91774` | `ownership-of-architectural-plans-ra-9266-s33` | **FLAGGED** | 1 issue (missing citation; all Section 33 claims CONFIRMED CORRECT against RA 9266 IRR) | 0 flagged |
| 12 | `02a5ba32-0443-4162-837d-326783ed77a2` | `lea-prac-law-001-ra-9266-overview` | **FLAGGED** | 6 flags (2 CONFIRMED_INCORRECT — section refs to §20(a) and §41; 1 LIKELY_INCORRECT — deadline ref; 2 NEEDS_VERIFICATION; 1 MISSING_CITATION) | 1 of 10 flagged (Q8 repeats §41 error) |
| 13 | `9eb0b48e-110e-4c75-8a0c-4f83063001cf` | `lea-prac-frm-018-universal-design-bp-344-ra-7277` | **FLAGGED** | 5 flags (1 CRITICAL — ramp slope 1:12 vs updated 1:20 standard; 2 LIKELY_INCORRECT; 1 NEEDS_VERIFICATION; 1 MISSING_CITATION) | 1 of 10 flagged (Q4 repeats 1:12 error) |
| 14 | `6d5e0e55-215a-4806-a679-dac7aea5a99b` | `bp-344-accessible-washrooms` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 1 MEDIUM — section numbers mismatch; 1 MEDIUM — rear grab bar discrepancy; 1 LOW — knee depth unverified) | 4 flagged |
| 15 | `5f620c42-ef55-4c0e-824b-49f0ff9d47e6` | `bp-344-elevator-dimensions` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 3 LOW — section refs, 1100mm claim, 800mm claim) | 4 flagged |
| 16 | `5a8ca807-31d5-4a32-933a-c6b83517c6de` | `bp-344-ramp-slope-tiers` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 1 MEDIUM — 170mm threshold; 2 LOW) | 4 flagged |
| 17 | `5aeda107-bc0d-4d0d-ab40-44e13fd95478` | `bp-344-tactile-and-visual-alarms` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 3 LOW — section refs, meta-commentary, 1500mm/30% values) | 4 flagged |

*Score = question_count + 20 if law/practice subject + 15 if code/regulation keyword in slug*

## Articles Pending (All Remaining)

All remaining articles not in priority queue above.

---

## Flag Categories

- `LEGAL_INACCURACY` — Claim about law/code that appears wrong
- `MISSING_CITATION` — Factual claim with no source provided
- `CONTRADICTS_QUESTION` — Article text contradicts a linked question's correct answer
- `OUTDATED_INFO` — References superseded law or regulation
- `VAGUE_OR_UNVERIFIABLE` — Claim too vague to verify or appears speculative
- `TERMINOLOGY_ERROR` — Wrong technical term or misused legal term

---

## Notes

- No edits made to any article bundle during this pass.
- All findings are documented here for batch review.
- When this pass is complete, a summary report will be generated for human review before any edits are applied.
|| 187 | `1673310d-fe41-40f3-ab75-0c7e90db42e1` | `lea-dsgn-003-04-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 188 | `ea6d06eb-e659-4092-ad67-14d4956cc4c6` | `lea-dsgn-004-05-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 189 | `40479f68-42a9-482a-960f-9901f522d086` | `lea-dsgn-005-05-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 190 | `2b843aa3-45d9-4421-ae00-107e94f28495` | `lea-dsgn-006-04-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 191 | `c9b1aadd-4843-4cf3-a551-6dd67678e508` | `lea-dsgn-007-04-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 192 | `943907de-24bf-414c-8fc8-cfacf7af25ff` | `lea-strc-001-02-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 193 | `3fbb9789-4f15-4c22-a982-1b4686df8219` | `lea-strc-002-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 194 | `79ca7e09-9492-49b1-9289-88d444451275` | `lea-strc-003-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 195 | `2ef8093e-b636-42f7-8f25-55adcfc22821` | `lea-strc-004-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 196 | `dac86d82-085d-4627-bf1d-2e3ab4be9da3` | `lea-strc-005-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 197 | `c1f7906b-35f8-460b-bb03-f996ad25658e` | `lea-matl-001-04-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 198 | `42ec69b2-114a-423b-bba3-12cd5564f994` | `lea-matl-002-03-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 199 | `7dccfed0-8f85-47ad-b72b-8e5940d8276a` | `lea-matl-003-04-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 200 | `b055d93c-4f92-4608-b88b-ff729757f92e` | `lea-matl-004-06-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 201 | `8a3fed25-4fda-4d38-a3a9-0e452f0e1e75` | `lea-matl-005-05-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 202 | `e72bf24e-a816-4c4f-ae4b-f8e97c5d5519` | `lea-hist-001-02-core-concept` | **FLAGGED** | Minor style note (US/UK spelling) | 10 Qs |
|| 203 | `48580f1e-3497-48f9-a87e-0f67c6e476b6` | `lea-hist-002-02-core-concept` | **PASSED** | No issues found | 12 Qs |
|| 204 | `c0a5189b-4c67-47ad-bfd0-4b4d33df7247` | `lea-hist-004-02-core-concept` | **FLAGGED** | Minor style note (US/UK spelling) | 11 Qs |
|| 205 | `cde95089-b874-42c5-8250-abc58ad7fae0` | `lea-hist-007-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 206 | `1f411bc4-4ca5-4bb2-ab46-e130e1b0a5e4` | `lea-hist-008-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 207 | `30832ba5-fbe9-4047-871a-aa4cb63ac616` | `lea-theo-001-07-core-concept` | **PASSED** | No issues found | 13 Qs |
|| 208 | `62274e90-5cb3-4bc0-85a1-639858e47736` | `lea-theo-002-01-core-concept` | **PASSED** | No issues found | 13 Qs |
|| 209 | `567ba614-9dcd-4c76-8bf3-74478fd1291f` | `lea-theo-004-01-core-concept` | **PASSED** | No issues found | 12 Qs |
|| 210 | `128400dd-8642-4275-a64f-c411f6836d6d` | `lea-theo-005-01-core-concept` | **PASSED** | No issues found | 12 Qs |
|| 211 | `5144f75e-e8ee-49a0-8dcf-2ded9c2b432c` | `lea-theo-007-01-core-concept` | **FLAGGED** | Minor style note (US/UK spelling) | 10 Qs |
|| 212 | `d28bf43f-a588-4be3-8b79-8759d930aea4` | `lea-plan-001-01-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 213 | `50d41d7e-57cd-4280-b850-e6d2f89414a6` | `lea-plan-002-01-core-concept` | **FLAGGED** | Minor style note (US/UK spelling) | 10 Qs |
|| 214 | `6604a199-6687-435d-aeb1-ffdc46be7d23` | `lea-prac-eth-001-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 215 | `f769b43e-e467-4ce4-afd9-2d0152fe8d46` | `lea-prac-eth-002-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 216 | `9bc92dcd-8cce-4970-9111-13e21a72fb68` | `lea-prac-eth-003-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 217 | `cd6c1a20-eee6-4475-b0cc-239897d3f4d7` | `lea-prac-eth-004-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 218 | `33f0a370-4f6f-46ba-b06f-edcce2168cdd` | `lea-prac-ctr-017-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 219 | `5e99dd5d-1394-46bc-998e-8915e2595b0b` | `lea-prac-ctr-018-core-concept` | **PASSED** | No issues found | 10 Qs |
|| 220 | `fc6f1ca7-340b-4188-8fc0-036e4e9d4498` | `case-study-hospital-mall-school` | **FLAGGED** | MISSING_CITATION: sources.json empty; 11 Qs unsourced | 11 Qs unsourced |
|| 221 | `7a3b0ff7-407f-40cc-b398-fca6358f4db7` | `lodging-and-residential-accessibility` | **FLAGGED** | MISSING_CITATION: sources.json empty; 16 Qs unsourced | 16 Qs unsourced |
|| 222 | `60c3b78a-e1c7-4c5e-880e-f9526d6c570d` | `21st-century-movements` | **FLAGGED** | MISSING_CITATION: sources.json empty; 22 Qs unsourced | 22 Qs unsourced |
|| 223 | `691cf42d-0f6c-4686-b3d0-9a3bbd99da23` | `ergonomics-in-furniture-design` | **FLAGGED** | MISSING_CITATION: sources.json empty; 21 Qs unsourced | 21 Qs unsourced |
|| 224 | `ce165155-2e81-4ed6-b14e-7d81dbdfa464` | `mastery-architectural-design` | **FLAGGED** | MISSING_CITATION: sources.json empty; content appears correct | 0 linked Qs |
|| 225 | `91294dec-6b87-4601-b9c1-a5b303447da4` | `mastery-building-materials` | **FLAGGED** | MISSING_CITATION: sources.json empty; content appears correct | 0 linked Qs |
|| 226 | `a81062b3-5724-4bdc-8f70-dcfd9ef51e46` | `microclimate-analysis` | **FLAGGED** | MISSING_CITATION: sources.json empty; 21 Qs unsourced | 21 Qs unsourced |
|| 227 | `9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c` | `allowable-floor-area-increases` | **FLAGGED** | MISSING_CITATION: sources.json empty; 28 Qs unsourced | 28 Qs unsourced |
|| 228 | `7c0e2fa5-7f3d-419a-b592-50346ac7ab2f` | `lea-plan-003-02-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION: sources.json empty; 10 Qs unsourced | 10 Qs unsourced |
|| 229 | `6a351c32-f48d-45fb-93f5-e60e6cd271c5` | `lea-plan-004-01-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION: sources.json empty; 10 Qs unsourced | 10 Qs unsourced |
|| 230 | `5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5` | `lea-prac-ctr-005-the-architect-s-authority-during-construction-powers-limits-and-the-line-with-the-c` | **PASSED** | No issues found | 10 Qs |
|| 231 | `4e28889a-cba3-4bf4-805c-ff0526910ee3` | `lea-prac-ctr-016-change-orders-types-authority-limits-and-the-documentation-process` | **PASSED** | No issues found | 10 Qs |
|| 232 | `be3f2bf1-8d85-4c03-a047-ae1c2503d4cb` | `lea-util-001-07-system-components-and-functions` | **FLAGGED** | MISSING_CITATION: sources.json empty; 15 Qs unsourced | 15 Qs unsourced |
|| 233 | `903c66da-2864-48b0-b638-2ed218a173e2` | `lea-util-002-03-core-ventilation-standards` | **FLAGGED** | MISSING_CITATION: sources.json empty; 15 Qs unsourced | 15 Qs unsourced |
|| 234 | `91727ebf-ee05-4aa8-a538-d8c599a1d9c9` | `lea-util-003-02-emergency-power-systems` | **FLAGGED** | MISSING_CITATION: sources.json empty; 15 Qs unsourced | 15 Qs unsourced |
|| 235 | `881027cd-2be0-4c93-af86-4f801ec16882` | `lea-util-005-03-design-considerations-and-best-practices` | **FLAGGED** | MISSING_CITATION: sources.json empty; 15 Qs unsourced | 15 Qs unsourced |
|| 236 | `dd8ec17f-7f5c-4652-9257-65811b1ead0c` | `lea-util-006-02-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION: sources.json empty; 15 Qs unsourced | 15 Qs unsourced |
| 237 | `a13cdc9c-f057-481e-a661-eedb6548f6d8` | `lea-prac-frm-006-asean-mutual-recognition-arrangement-for-architectural-services` | **FLAGGED** | sources.json empty; equivleant typo | |
| 238 | `8b263a7c-5e3e-4157-a18b-146f5b12f521` | `lea-prac-frm-014-bim-in-philippine-architectural-practice-status-obligations-and-practice-implicatio` | **FLAGGED** | sources.json empty | |
| 239 | `e61e81a9-c0e3-4e60-ab5e-6b3fe3026004` | `lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-20` | **FLAGGED** | sources.json empty; sclea+large-sclea typos | |
| 240 | `bdc69dbd-c7fb-405f-b8f7-38a6a8fce526` | `lea-prac-svc-006-phase-2-design-development-coordination-engineering-integration-and-fee` | **FLAGGED** | sources.json empty | |
| 241 | `1277bf71-f3cc-4d29-86a8-8cadca0133f9` | `lea-prac-svc-015-full-time-supervision-vs-construction-management-vs-spp-202-administration` | **PASSED** | No issues found | |
| 242 | `75ef7a25-2d9d-455d-8d89-e6eb0b691240` | `lea-prac-svc-018-building-condition-assessment-adaptive-reuse-and-heritage-conservation-as-practice` | **FLAGGED** | sources.json empty | |
| 243 | `9796e088-8c83-4a6c-9599-51afd69d0e81` | `lea-prac-svc-019-design-build-services-overview-rationlea-and-architect-s-role` | **FLAGGED** | sources.json empty | |
| 244 | `7a48ab8a-3609-484d-b7e3-76f2fc1f6040` | `lea-prac-svc-024-value-engineering-as-an-architectural-service-concept-process-and-practice-ethics` | **FLAGGED** | sources.json empty | |
| 245 | `958cf8ad-c743-41b3-a7fd-47da9421a09b` | `lea-prac-eth-009-introduction` | **PASSED** | No issues found | |
| 246 | `265185c0-c1ac-4f40-8db0-bde23084f634` | `lea-prac-eth-010-introduction` | **FLAGGED** | equivleant typo | |
| 247 | `17350925-ae83-47a1-a30f-a96eb5c1d942` | `lea-prac-eth-011-introduction` | **FLAGGED** | equivleant typo | |
| 248 | `5f341f81-5e43-49d6-a821-2a67c5d07c59` | `lea-prac-eth-012-introduction` | **FLAGGED** | equivleant typo | |
| 249 | `3a7ba43c-5ef5-4fd8-b054-ccb8a567d6f7` | `lea-prac-eth-013-introduction` | **FLAGGED** | sclea typo | |
| 250 | `ef8c505a-0fd2-459b-a6dc-6ca8e30f179f` | `lea-prac-cmp-005-core-concept` | **FLAGGED** | sclea typo | |
| 251 | `15d9ff17-038a-4ba5-86f9-2e6a8f12cc54` | `lea-prac-ctr-019-core-concept` | **PASSED** | No issues found | |
| 252 | `d6fa3f26-bf8e-4b5d-9313-fcad16af0d86` | `lea-prac-ctr-020-core-concept` | **PASSED** | No issues found | |
| 253 | `51800681-6d9e-47f4-9e3a-aaf9ca459bf0` | `lea-prac-ctr-021-core-concept` | **PASSED** | No issues found | |
| 254 | `6d669d7f-d03f-433f-af13-9443b6144033` | `lea-prac-ctr-022-core-concept` | **FLAGGED** | rationlea typo | |
| 255 | `504b1844-1db1-44f8-9aa9-5b78705ca37e` | `lea-prac-eth-005-core-concept` | **FLAGGED** | sclea typo | |
| 256 | `b1233aee-06ed-44fd-a31a-e57086eab325` | `institutional-human-dimensions` | **FLAGGED** | sources.json empty; equivleant typo | |
| 257 | `7eb99f1e-4b28-4b86-beed-0adc56824ff8` | `lea-dsgn-003-06-core-concept` | **PASSED** | No issues found | |
| 258 | `d4dfe9dc-a807-43db-925e-6992297ce1ff` | `lea-dsgn-004-06-core-concept` | **PASSED** | No issues found | |
| 259 | `6a928e7c-ea49-43ae-9241-e3cacfe291cf` | `lea-dsgn-008-01-core-concept` | **PASSED** | No issues found | |
| 260 | `642d4061-fc9e-4027-9f3b-308331151792` | `lea-dsgn-009-01-core-concept` | **PASSED** | No issues found | |
| 261 | `dcea38f3-027c-4839-8bc5-f79991e7772c` | `lea-dsgn-010-01-core-concept` | **FLAGGED** | sclea typo | |
| 262 | `6c4f539a-c589-4f53-bbfe-d4396641a3e6` | `lea-dsgn-011-01-core-concept` | **PASSED** | No issues found | |
| 263 | `21880755-59f3-4749-9786-59e6cb53c6ed` | `lea-dsgn-012-01-core-concept` | **PASSED** | No issues found | |
| 264 | `6ac76cc0-1023-4e3d-8282-884fa6cc20a2` | `lea-hist-001-03-core-concept` | **FLAGGED** | sclea typo | |
| 265 | `aa6c280e-10b1-4cae-9e0f-578ff0fda2a3` | `lea-hist-007-02-core-concept` | **FLAGGED** | sclea typo | |
| 266 | `160660ca-783b-4604-9b2a-691e10f0e97b` | `lea-hist-008-02-core-concept` | **FLAGGED** | sclea typo | |
| 267 | `584a3bfe-0f9a-4c59-8576-b52a2f2a9074` | `lea-hist-011-01-core-concept` | **PASSED** | No issues found | |
| 268 | `b3b94acc-c537-4dc3-bf2c-8246a8e6fdc6` | `lea-hist-012-01-core-concept` | **FLAGGED** | sclea typo | |
| 269 | `d785ad35-413a-4d53-b801-b5852bc4fb50` | `lea-hist-013-01-core-concept` | **PASSED** | No issues found | |
| 270 | `dfffd217-9aed-4a42-88fe-53b26268f665` | `lea-plan-001-02-core-concept` | **FLAGGED** | sclea typo | |
| 271 | `4f38604e-70a2-4b6f-9710-b166fe83cbe6` | `lea-plan-002-02-core-concept` | **FLAGGED** | sclea typo | |
| 272 | `5723752b-4d29-442d-87ec-30e60b8569a3` | `lea-plan-003-03-core-concept` | **PASSED** | No issues found | |
| 273 | `795661f6-00a3-4b3d-afe5-0668909529a0` | `lea-plan-004-02-what-you-need-to-know-for-the-lea` | **FLAGGED** | sources.json empty | |
| 274 | `f5374d6a-fc70-475e-83ce-7feb64056655` | `lea-plan-005-01-what-you-need-to-know-for-the-lea` | **PASSED** | No issues found | |
| 275 | `8a8a6153-844c-4671-aae6-b42b5a9435dd` | `lea-plan-007-01-core-concept` | **PASSED** | No issues found | |
| 276 | `8b24b8a8-6624-4793-98b7-b03c5a1fcbef` | `lea-plan-008-01-core-concept` | **PASSED** | No issues found | |
| 277 | `a38effc8-a3b8-48e8-8cce-cfd163a6e32e` | `lea-matl-001-05-core-concept` | **FLAGGED** | equivleant typo | |
| 278 | `bedac2b3-5478-4fe8-be94-d88f8e4ada3f` | `lea-matl-006-01-core-concept` | **FLAGGED** | equivleant typo | |
| 279 | `20f67594-cbef-4aac-b65d-db77bc3e2c9e` | `lea-matl-007-01-core-concept` | **FLAGGED** | equivleant typo | |
| 280 | `72e04c5e-3e4c-4715-93a0-734bdf6dcbee` | `lea-matl-008-01-core-concept` | **FLAGGED** | equivleant typo | |
| 281 | `f6bd1cea-ecd5-4587-80ba-3015beb4b820` | `lea-matl-009-01-core-concept` | **FLAGGED** | equivleant typo | |
| 282 | `39796d5a-c2fd-467f-8891-9e7b32091617` | `lea-matl-010-01-core-concept` | **FLAGGED** | sclea typo | |
| 283 | `8ba7dce8-b30a-497e-af30-7cf6b3637216` | `lea-util-001-08-what-you-need-to-know-for-the-lea` | **FLAGGED** | sources.json empty; equivleant typo | |
| 284 | `635013a5-2aa6-4d97-a79a-e4f44d3aa3ee` | `lea-util-002-04-system-types-and-applications` | **FLAGGED** | sclea typo | |
| 285 | `8d3099bc-c90a-4f31-946f-fe7ab195fb75` | `lea-util-003-03-protection-levels-and-risk-assessment` | **FLAGGED** | sources.json empty; equivleant+rationlea typos | |
| 286 | `f52e3126-774f-4eec-8456-8417769bb34a` | `lea-util-005-04-communication-protocols-technologies` | **FLAGGED** | sources.json empty | |
| 287 | `bbb05afe-2df6-4bdc-b8b8-43f6115533d3` | `lea-util-006-03-what-you-need-to-know-for-the-lea` | **FLAGGED** | sources.json empty | |
| 288 | `62733840-d170-40de-a27e-31fa31c30c69` | `lea-util-007-02-smart-metering-infrastructure-ami` | **PASSED** | No issues found | |
| 289 | `0297182f-252e-4837-b965-2aa11ecfb539` | `lea-strc-001-03-core-concept` | **PASSED** | No issues found | |
| 290 | `76bf05bd-fdc9-477b-b2cb-e2b749faf1b2` | `lea-strc-002-02-core-concept` | **PASSED** | No issues found | |
| 291 | `30d062c7-9934-4627-8287-08885d95db5d` | `lea-strc-003-02-core-concept` | **PASSED** | No issues found | |
| 292 | `53aa35be-fddf-4a76-9e83-69e424f73586` | `lea-strc-006-01-core-concept` | **PASSED** | No issues found | |
| 293 | `08829ae6-7e66-41ed-a5f9-40135b4dfc3e` | `lea-theo-001-08-core-concept` | **PASSED** | No issues found | |
| 294 | `20dc8dae-3a4e-4644-b4c6-b5b1881f830c` | `lea-theo-002-02-core-concept` | **FLAGGED** | sclea+equivleant typos | |
| 295 | `77e3d8a4-9463-4dd3-8ee5-c79a107eb3d7` | `lea-dsgn-004-07-core-concept` | **PASSED** | No issues found | |
|| 296 | `e64d9b46-f873-4371-95d2-1c2784d7ebfc` | `lea-dsgn-005-06-core-concept` | **PASSED** | No issues found | |
|| 297 | `08606903-14a9-4077-a94f-4c9d1f54ec08` | `lea-dsgn-004-08-core-concept` | **PASSED** | No issues found | |
|| 298 | `0eb7f711-b740-42d6-9c25-ee45b0242eb4` | `lea-dsgn-004-09-core-concept` | **PASSED** | No issues found | |
|| 299 | `d1f93f93-0f8c-4546-a481-a39ec727d354` | `lea-dsgn-005-07-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 300 | `b0b7a2f3-8fe3-4ee2-a109-2f5165c9aff0` | `lea-dsgn-005-08-core-concept` | **PASSED** | No issues found | |
|| 301 | `e2d64eac-2ee3-40fd-ab3b-43969f3f268e` | `lea-dsgn-005-09-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 302 | `622a401a-b889-4744-9d44-f77daa1627b4` | `lea-dsgn-005-10-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 303 | `cd18af9a-b1e1-42d4-a254-ff5244838f19` | `lea-dsgn-005-11-core-concept` | **PASSED** | No issues found | |
|| 304 | `d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d` | `lea-dsgn-005-12-core-concept` | **PASSED** | No issues found | |
|| 305 | `20ac90a7-f0e9-49cf-9459-86353d538af9` | `lea-dsgn-005-13-core-concept` | **PASSED** | No issues found | |
|| 306 | `3067e127-60c0-4570-ab86-d85af25fb9b2` | `lea-dsgn-007-05-core-concept` | **PASSED** | No issues found | |
|| 307 | `17acdb19-55dc-4136-862d-62825aa8fb4b` | `lea-dsgn-007-06-core-concept` | **PASSED** | No issues found | |
|| 308 | `569f5a05-ad46-4617-8170-a19e2f5d5db1` | `lea-dsgn-007-07-core-concept` | **PASSED** | No issues found | |
|| 309 | `0149dc4f-64e7-425f-8673-f786c02bc407` | `lea-dsgn-007-08-core-concept` | **PASSED** | No issues found | |
|| 310 | `11c32082-10d4-4312-bbf9-e674b925e550` | `lea-dsgn-007-09-core-concept` | **PASSED** | No issues found | |
|| 311 | `81a065b0-77f6-4f96-98cd-a3239c6beae4` | `lea-dsgn-007-10-core-concept` | **PASSED** | No issues found | |
|| 312 | `f3a7ecf3-4df6-4497-958f-3c724875163c` | `lea-dsgn-008-02-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | |
|| 313 | `ad7d9469-c7a1-4c62-864d-728f38650891` | `lea-dsgn-008-03-core-concept` | **PASSED** | No issues found | |
|| 314 | `f5c0e7a8-8017-4c9b-a1d1-8938a338471f` | `lea-dsgn-009-02-core-concept` | **PASSED** | No issues found | |
|| 315 | `f30fd9ee-3ab3-46d0-a5bb-dba7e88ac4d1` | `lea-dsgn-009-03-core-concept` | **PASSED** | No issues found | |
|| 316 | `246c66db-c0cf-4cd3-8f52-9491451e7c76` | `lea-dsgn-009-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 317 | `4c706fb3-bd66-4bae-b4a6-2e8ed487031d` | `lea-dsgn-010-02-core-concept` | **PASSED** | No issues found | |
|| 318 | `3570f70f-5eef-438a-aeec-5f26f9f5c1f9` | `lea-dsgn-010-03-core-concept` | **PASSED** | No issues found | |
|| 319 | `bf583e70-ccc8-4e6e-8b6a-1794533a4d7f` | `lea-dsgn-011-02-core-concept` | **PASSED** | No issues found | |
|| 320 | `a25678f1-1d48-4938-8224-789315df40de` | `lea-dsgn-011-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x10) | |
|| 321 | `b4052c5b-03bd-4542-bbc6-3f75d8936103` | `lea-dsgn-011-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x4) | |
|| 322 | `889fae0f-f8dd-4b3c-9ddf-4f9d32742282` | `lea-dsgn-011-05-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 323 | `a59db1e5-3988-489e-841d-e71e4f37050c` | `lea-dsgn-012-02-core-concept` | **PASSED** | No issues found | |
|| 324 | `5de12a80-903b-4488-bc66-e855e8cb4129` | `lea-dsgn-012-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 325 | `e199769e-5d52-449b-b724-9c05dffdd521` | `lea-dsgn-012-04-core-concept` | **PASSED** | No issues found | |
|| 326 | `f8fb0ea9-fe68-4909-af36-534d144990ae` | `lea-dsgn-012-05-core-concept` | **PASSED** | No issues found | |
|| 327 | `3e966435-e276-422e-a220-374043120cec` | `lea-hist-001-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 328 | `757e71dc-bf5f-4a3a-9948-5063d8cd67bb` | `lea-hist-001-05-core-concept` | **PASSED** | No issues found | |
|| 329 | `a73a7409-4f9b-4d7d-afd0-d49bc7ebca6b` | `lea-hist-001-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 330 | `d74be6f2-436b-46ca-8755-1060ecb7c5c1` | `lea-hist-001-08-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 331 | `630d0fd8-e25f-4bf8-a62f-f31b4e320831` | `lea-hist-002-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 332 | `52d78a3d-6f0f-4d68-a8e3-39d02b78d68f` | `lea-hist-002-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 333 | `9bcf8ae9-81a7-41eb-b636-74c93570864c` | `lea-hist-002-05-core-concept` | **PASSED** | No issues found | |
|| 334 | `c93bfab9-3571-4e80-8d9b-d9d50a9eff02` | `lea-hist-002-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 335 | `ea2f4f6d-dd27-4e75-b202-91a60858c1f1` | `lea-hist-004-05-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 336 | `4ed9c46d-1468-4741-99a4-507de15377fe` | `lea-hist-004-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 337 | `39f480ed-755f-499a-935f-d339e6bb3c87` | `lea-hist-004-07-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 338 | `369fd847-ad5b-4214-b86b-68cd7f62c534` | `lea-hist-004-08-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 339 | `0f0bee66-7a14-4ab0-a030-aaaade95b078` | `lea-hist-007-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x1); EQUIVLEANT_TYPO(x1) | |
|| 340 | `10be87c4-e424-42da-8989-a054658cc4a4` | `lea-hist-007-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 341 | `7095ced9-9182-4eda-917b-84568cd74ba2` | `lea-hist-007-05-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 342 | `1254cb0d-27ec-4a02-8ea4-8f37dcd44dbd` | `lea-hist-007-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 343 | `c0e15f56-dc57-4814-b6fb-7ee7f554a209` | `lea-hist-008-03a-core-concept` | **FLAGGED** | SCLEA_TYPO(x5) | |
|| 344 | `79bb710e-4b46-4e5a-b781-4dd864aa6ddc` | `lea-hist-008-03b-core-concept` | **PASSED** | No issues found | |
|| 345 | `faa3088f-8700-4d60-a871-1c1e97f53570` | `lea-hist-008-03c-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 346 | `d7e9ccad-d858-4bee-9786-d1fc9c3abefc` | `lea-hist-008-03d-core-concept` | **FLAGGED** | SCLEA_TYPO(x9) | |
|| 347 | `8769440f-0b98-49dd-b98b-a3b9be486892` | `lea-hist-008-04a-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 348 | `4446881f-7bec-4a7c-97a4-4f819ac8411f` | `lea-hist-008-04b-core-concept` | **PASSED** | No issues found | |
|| 349 | `34a5048b-e01f-41ef-8f3b-5343dfae48a6` | `lea-hist-008-04c-core-concept` | **PASSED** | No issues found | |
|| 350 | `ed8d54e9-eef1-4585-9447-f9cff392bbff` | `lea-hist-008-05-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 351 | `df096cb2-6240-4081-a17b-534a1577637e` | `lea-hist-008-06-core-concept` | **PASSED** | No issues found | |
|| 352 | `683abfcf-415c-4e89-9a9c-fcfd57aa1f2f` | `lea-hist-008-07a-core-concept` | **PASSED** | No issues found | |
|| 353 | `22de8889-365b-4034-af03-36636d3c101c` | `lea-hist-008-07b-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | |
|| 354 | `c6f9eec1-727b-4d00-a905-f69a58245c66` | `lea-hist-008-08-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | |
|| 355 | `5231fda8-0e31-4b02-aaf1-12aea6aa8f12` | `lea-hist-008-09-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | |
|| 356 | `98d64943-b6ab-4fad-b16e-975d7126036e` | `lea-hist-011-02-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 357 | `2e4a909c-e9e6-4d2a-9d9d-57a8e48a6bce` | `lea-hist-012-02-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | |
|| 358 | `a33f91de-362d-436e-87f5-e30e32e47529` | `lea-hist-012-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 359 | `59ad9766-1b0c-4256-8fde-a3661471c360` | `lea-hist-013-02-core-concept` | **FLAGGED** | SCLEA_TYPO(x4) | |
|| 360 | `6d9a90b6-39bf-423b-9986-74b978939702` | `lea-hist-014-01-core-concept` | **PASSED** | No issues found | |
|| 361 | `7bd084c7-e409-4927-84a0-9eac44e07ba4` | `lea-hist-014-02-core-concept` | **PASSED** | No issues found | |
|| 362 | `6fc5e22a-9ff6-4a6c-b0eb-b93c9ffd00af` | `lea-hist-014-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |
|| 363 | `af09c106-1da0-46e4-8081-bd3b5e393428` | `lea-hist-014-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x4) | |
|| 364 | `db85fd0a-60fd-4617-9364-f0d63567acce` | `lea-hist-014-05-core-concept` | **FLAGGED** | SCLEA_TYPO(x4) | |
|| 365 | `e714513f-a626-466d-b3e2-a70a2b182c1a` | `lea-hist-015-01-core-concept` | **PASSED** | No issues found | |
|| 366 | `59ea9844-0c75-4f39-873f-7cb83a14a924` | `lea-hist-015-02-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | |

---

## Priority Queue (Risk/Impact Ranked)


Articles are ranked by: question count + law/code subject bonus + PD 1096/RA 9266/BP 344/RA 9514 keyword bonus.

| Priority | Article ID | Slug | Subject | Q Count | Score | Status |
|----------|-----------|------|---------|---------|-------|--------|
| 1 | `687e0da7-4e39-454f-b3f8-a95308678556` | `building-permit-process` | **FLAGGED** | 5 flags (1 missing citation, 3 unverified claims, 1 mislinked question observation) | 3+ flagged |
| 2 | `85bcd328-436d-49ba-9d37-7b202d0d38d4` | `pd-1096-rule-vii-area-metrics` | **FLAGGED** | 1 flag (missing citation only; all 90 table values and all equations CONFIRMED CORRECT against IRR) | 0 flagged (spot-check recommended) |
| 3 | `aef59aa2-220e-47fc-9492-6b2bd98f9bea` | `fire-resistive-construction-ratings` | **FLAGGED** | 3 issues (1 missing citation; 2 terminology/spelling — all 48 table values and all definitions CONFIRMED CORRECT against IRR) | 0 flagged |
| 4 | `93009368-9041-46e0-b93b-8786100311be` | `pd-1096-rule-xii-egress-and-corridors` | **FLAGGED** | 1 issue (missing citation; all rules, dimensions, and Table XII.1 values CONFIRMED CORRECT against IRR) | 0 flagged |
| 5 | `f61a5716-97a1-41d5-8863-a2fc5fd4115f` | `fire-extinguishing-systems` | **FLAGGED** | 4 issues (1 factual error — dry standpipe area threshold confused as distance; 1 missing citation; 2 spelling) | 0 flagged |
| 6 | `a865c6b2-8c25-404e-bb0c-08d374d374a5` | `pd-1096-rule-vii-height-limits` | **FLAGGED** | 2 issues (1 missing citation; FLAR table values need verification — BHL definitions and 3m tolerance CONFIRMED) | 0 flagged |
| 7 | `9e053410-cea0-400b-b185-576cbb4a8bd0` | `change-of-use-and-occupancy` | **FLAGGED** | **5 issues** (2 LEGAL_INACCURACY — wrong occupancy groups, no "Certificate of Use" in IRR; 1 wrong section reference; 1 unverified form; 1 missing citation) | Needs review |
| 8 | `9437579a-377e-41ec-8527-4c0399348746` | `fire-zones-and-existing-buildings` | **FLAGGED** | 1 issue (missing citation; all Rule V claims CONFIRMED CORRECT against IRR) | 0 flagged |
| 9 | `f8d416c0-abfb-45be-a7ef-a9f98df06507` | `chimneys-and-fireplaces` | **FLAGGED** | 1 issue (missing citation; all chimney/fireplace dimensions CONFIRMED CORRECT against IRR) | 0 flagged |
| 10 | `68eeacdb-a61b-4f53-bbe9-e2459fa8d152` | `certificate-of-occupancy` | **FLAGGED** | 1 issue (missing citation; all Sections 308-309 claims CONFIRMED CORRECT against IRR) | 0 flagged |
| 11 | `76b6cfd5-d416-4c6d-8a90-76a2d2b91774` | `ownership-of-architectural-plans-ra-9266-s33` | **FLAGGED** | 1 issue (missing citation; all Section 33 claims CONFIRMED CORRECT against RA 9266 IRR) | 0 flagged |
| 12 | `02a5ba32-0443-4162-837d-326783ed77a2` | `lea-prac-law-001-ra-9266-overview` | **FLAGGED** | 6 flags (2 CONFIRMED_INCORRECT — section refs to §20(a) and §41; 1 LIKELY_INCORRECT — deadline ref; 2 NEEDS_VERIFICATION; 1 MISSING_CITATION) | 1 of 10 flagged (Q8 repeats §41 error) |
| 13 | `9eb0b48e-110e-4c75-8a0c-4f83063001cf` | `lea-prac-frm-018-universal-design-bp-344-ra-7277` | **FLAGGED** | 5 flags (1 CRITICAL — ramp slope 1:12 vs updated 1:20 standard; 2 LIKELY_INCORRECT; 1 NEEDS_VERIFICATION; 1 MISSING_CITATION) | 1 of 10 flagged (Q4 repeats 1:12 error) |
| 14 | `6d5e0e55-215a-4806-a679-dac7aea5a99b` | `bp-344-accessible-washrooms` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 1 MEDIUM — section numbers mismatch; 1 MEDIUM — rear grab bar discrepancy; 1 LOW — knee depth unverified) | 4 flagged |
| 15 | `5f620c42-ef55-4c0e-824b-49f0ff9d47e6` | `bp-344-elevator-dimensions` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 3 LOW — section refs, 1100mm claim, 800mm claim) | 4 flagged |
| 16 | `5a8ca807-31d5-4a32-933a-c6b83517c6de` | `bp-344-ramp-slope-tiers` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 1 MEDIUM — 170mm threshold; 2 LOW) | 4 flagged |
| 17 | `5aeda107-bc0d-4d0d-ab40-44e13fd95478` | `bp-344-tactile-and-visual-alarms` | **FLAGGED** | 4 flags (1 CRITICAL — sources.json empty; 3 LOW — section refs, meta-commentary, 1500mm/30% values) | 4 flagged |

*Score = question_count + 20 if law/practice subject + 15 if code/regulation keyword in slug*

## Articles Pending (All Remaining)

All remaining articles not in priority queue above.

---

## Flag Categories

- `LEGAL_INACCURACY` — Claim about law/code that appears wrong
- `MISSING_CITATION` — Factual claim with no source provided
- `CONTRADICTS_QUESTION` — Article text contradicts a linked question's correct answer
- `OUTDATED_INFO` — References superseded law or regulation
- `VAGUE_OR_UNVERIFIABLE` — Claim too vague to verify or appears speculative
- `TERMINOLOGY_ERROR` — Wrong technical term or misused legal term

---

## Notes

- No edits made to any article bundle during this pass.
- All findings are documented here for batch review.
- When this pass is complete, a summary report will be generated for human review before any edits are applied.
|| 1 | `7c0e2fa5-7f3d-419a-b592-50346ac7ab2f` | `lea-plan-003-02-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION | 10 Qs |
|| 2 | `6a351c32-f48d-45fb-93f5-e60e6cd271c5` | `lea-plan-004-01-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION | 10 Qs |
|| 3 | `5e8c7d0a-95b1-4739-a23a-ef8fbd89e5c5` | `lea-prac-ctr-005-the-architect-s-authority-during-construction` | **PASSED** | No issues found | 10 Qs |
|| 4 | `4e28889a-cba3-4bf4-805c-ff0526910ee3` | `lea-prac-ctr-016-change-orders` | **PASSED** | No issues found | 10 Qs |
|| 5 | `be3f2bf1-8d85-4c03-a047-ae1c2503d4cb` | `lea-util-001-07-system-components-and-functions` | **FLAGGED** | MISSING_CITATION | 15 Qs |
|| 6 | `903c66da-2864-48b0-b638-2ed218a173e2` | `lea-util-002-03-core-ventilation-standards` | **FLAGGED** | MISSING_CITATION | 15 Qs |
|| 7 | `91727ebf-ee05-4aa8-a538-d8c599a1d9c9` | `lea-util-003-02-emergency-power-systems` | **FLAGGED** | MISSING_CITATION | 15 Qs |
|| 8 | `881027cd-2be0-4c93-af86-4f801ec16882` | `lea-util-005-03-design-considerations-and-best-practices` | **FLAGGED** | MISSING_CITATION | 15 Qs |
|| 9 | `dd8ec17f-7f5c-4652-9257-65811b1ead0c` | `lea-util-006-02-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION | 15 Qs |
||| 367 | `019533d8-f19f-456e-a2e0-74e889a3b32e` | `lea-strc-004-04-core-concept` | **PASSED** | No issues found | |
||| 368 | `01e537a7-be03-49ec-b745-258474c27f70` | `lea-prac-svc-023-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...nally (subject to the sliding sclea for Groups 1–3).  **Method 2 ... | |
||| 369 | `0388b3cf-9e90-4c25-a653-90874cf59af3` | `lea-strc-006-02-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...spected. Bars must be free of sclea, rust, and damage. Deformatio...; TYPO: 'equivleant' should be 'equivalent' in: ...lippine Standard PS 249:2008 (equivleant to ASTM A615) defines deforme... | |
||| 370 | `047334de-c79a-4d6a-aa23-58a321b71e2e` | `lea-strc-009-02-core-concept` | **PASSED** | No issues found | |
||| 371 | `061c0a78-3a9d-405a-9a42-7aa0463181b5` | `owner-smoke-article-b-1775980402961` | **FLAGGED** | MISSING_CITATION: sources.json empty; MINIMAL_CONTENT: normalized.md only has 11 words | |
||| 372 | `06c6e7dc-b3cd-4ff8-a25a-fed405c47830` | `lea-util-007-04-solar-photovoltaic-pv-systems` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...Oriental: 7.0–8.5 m/s). Small-sclea building-mounted turbines (1–...; TYPO: 'equivleant' should be 'equivalent' in: ...0 kWh/year at prime location; equivleant rooftop PV (4 kW) produces 5,... | |
||| 373 | `08dff936-85fa-4f57-8388-466ecca109e4` | `lea-plan-003-06-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...upgrading and relocation, the sclea of informal settlements, and ... | |
||| 374 | `0b83bfa7-6ca2-48f8-9f23-52428c85d02a` | `lea-matl-010-08-core-concept` | **PASSED** | No issues found | |
||| 375 | `0c236406-a3aa-46b6-9833-b2aa88a6e131` | `lea-util-006-07-mepf-equipment-noise-sources-and-output-levels` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...gets  The Noise Criteria (NC) sclea, defined in ANSI/ASA S12.2-20...; TYPO: 'equivleant' should be 'equivalent' in: ...d perimeter) - Record LAeq,T (equivleant continuous sound level) over ... | |
||| 376 | `0de0e175-c5a7-49e9-9b57-3833b44cda3d` | `lea-strc-007-04-core-concept` | **PASSED** | No issues found | |
||| 377 | `0ed94cf5-6a2b-4062-8e8b-4f514ca89be5` | `lea-matl-009-02-core-concept` | **PASSED** | No issues found | |
||| 378 | `12358cd2-1836-4726-9e6a-4f49d8fac2db` | `lea-matl-002-05-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...erable to Type 1; performance equivleant; gaining market acceptance.  ... | |
||| 379 | `15364bcb-3b60-4e75-9dd5-e656a3623ccd` | `lea-strc-011-01-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...evleant, depending on project sclea and soil profile. Metro Manil... | |
||| 380 | `1650d23e-b703-48f4-87a3-839f9209e7a0` | `lea-strc-004-03-core-concept` | **PASSED** | No issues found | |
||| 381 | `1a34716c-1f11-4b4c-9ec9-1559b012384f` | `owner-smoke-article-1775980177789` | **FLAGGED** | MISSING_CITATION: sources.json empty; MINIMAL_CONTENT: normalized.md only has 9 words | |
||| 382 | `1a6a6df8-8f58-42aa-a38b-e59fe737716f` | `lea-plan-002-05-core-concept` | **PASSED** | No issues found | |
||| 383 | `1a967c89-e735-4a59-88b0-d2eb0918d284` | `lea-util-001-09-core-concept` | **PASSED** | No issues found | |
||| 384 | `1aaa804a-23f1-44da-bdcb-412fa04c848d` | `lea-theo-003-03-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...**Ramps** are the kinesthetic equivleant of stairs for wheelchair user... | |
||| 385 | `1ad3cb33-39a8-4a0a-9349-4df850d10ad4` | `lea-theo-002-04-core-concept` | **PASSED** | No issues found | |
||| 386 | `1bf5341b-5898-4793-bbff-472227208ccf` | `lea-plan-005-05-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...Assuming cut and fill are 1:1 equivleant; they are not — soil compacts... | |
||| 387 | `1f47e3ab-3e9f-4bd1-b3b1-402e515059b0` | `lea-theo-002-05-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...le scleas:  At the volumetric sclea, a rectangular building with ... | |
||| 388 | `20429844-ef79-45b9-8095-d9c64fd2bf08` | `lea-matl-005-07-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...oduct declarations (EPDs) for equivleant materials: candidates select ... | |
||| 389 | `205905a8-f9ff-41e7-8db7-a85edd563a84` | `lea-strc-004-05-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...g it with machinery (12.0 kPa equivleant) once in operation. This viol... | |
||| 390 | `22192e7e-6cdf-4613-9b2c-bddf1ee3091f` | `lea-matl-003-07-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...re the modern tension-control equivleants to A325 and A490.  ### Insta... | |
||| 391 | `2240c4ba-140c-4310-b097-e8c9197e2d8f` | `lea-strc-006-03-core-concept` | **PASSED** | No issues found | |
||| 392 | `236408d0-58f8-4761-8b02-7201ec857e97` | `lea-plan-005-06-core-concept` | **PASSED** | No issues found | |
||| 393 | `23e30450-bce4-4d06-91f7-e2ec86a82ef9` | `lea-plan-007-05-core-concept` | **PASSED** | No issues found | |
||| 394 | `249aff40-df16-413b-8b16-b78190fafeff` | `lea-theo-009-03-core-concept` | **PASSED** | No issues found | |
||| 395 | `25607252-c20a-4013-99f5-af11e829fd18` | `lea-theo-001-09-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...Latin Translation\", \"Modern Equivleant\", \"Vitruvian Definition\"]}... | |
||| 396 | `273f06a8-65f2-4a4a-afdd-73361952093e` | `lea-strc-001-04-core-concept` | **PASSED** | No issues found | |
||| 397 | `2ce3de97-5b64-47b3-b00e-a1deaf4a0918` | `lea-matl-004-10-core-concept` | **PASSED** | No issues found | |
||| 398 | `2e117d95-eb4c-4d96-8e3f-b31f18d26a64` | `lea-theo-004-12-core-concept` | **PASSED** | No issues found | |
||| 399 | `2ec5e562-50a1-4c7c-a95e-a17166d4631b` | `lea-theo-003-09-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...tiple scleas. At the building sclea, clear circulation hierarchy,...; TYPO: 'large-sclea' should be 'large-scale' in: ...l information about large-sclea environments.  ####... | |
||| 400 | `33c219fe-51a6-487f-81d2-0d4af2968274` | `lea-theo-005-02-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...t supposedly reconciled human sclea with standardized industrial ... | |
||| 401 | `3437f275-1ceb-4f88-b66a-d82d29ad4a2a` | `lea-theo-007-13-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...possess place-based knowledge equivleant to professional expertise. Ve... | |
||| 402 | `350bd0c3-1bb9-4adf-96f1-5dcd4e052112` | `lea-matl-004-07-core-concept` | **PASSED** | No issues found | |
||| 403 | `3d340472-3007-4a4e-8a25-9754506e17bc` | `lea-theo-007-12-core-concept` | **FLAGGED** | SCLEA_TYPO(x1): 'human-sclead' should be 'human-scaled' | |
||| 404 | `3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d` | `lea-strc-011-02-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...g combined footing and mat as equivleant; combined footings support 2–... | |
||| 405 | `3fe83b11-50d8-45ab-9530-936fb59fd974` | `lea-plan-008-05-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...egeneration encompasses large-sclea redevelopment and infrastruct...; TYPO: 'large-sclea' should be 'large-scale' in: ...eration encompasses large-sclea redevelopment and i... | |
||| 406 | `40dc0d6d-ae04-49de-b43a-36e9288a0622` | `lea-matl-010-05-core-concept` | **PASSED** | No issues found | |
||| 407 | `426d0246-88a3-4d38-a17e-6cec4dbe6f69` | `lea-theo-002-06-core-concept` | **PASSED** | No issues found | |
||| 408 | `437762da-b636-4be1-bfed-bb47ec6c0cd3` | `lea-strc-002-03-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...,\"Assuming IMRF and SMRF are equivleant; IMRF has less stringent deta... | |
||| 409 | `458cde1d-fd31-41f1-b90e-d5cd728e9e23` | `lea-theo-002-09-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...s/darkness) affects perceived sclea and proportion. A light-color...; TYPO: 'large-sclea' should be 'large-scale' in: ...only tactile detail—large-sclea texture also operat... | |
||| 410 | `4a8ee24f-ff5a-4f9a-8842-2eade8ecc1ee` | `lea-plan-008-04-core-concept` | **PASSED** | No issues found | |
||| 411 | `4b3cabc1-7c8a-42d1-acdf-33530fb9e0b0` | `lea-theo-008-03-core-concept` | **PASSED** | No issues found | |
||| 412 | `4bb1957d-f513-47e1-b253-c7cbc65912b3` | `lea-plan-008-02-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: .... Think of GIS as the digital equivleant of drawing transparent maps o... | |
||| 413 | `4f1312e7-61e8-4d33-8d49-48a5ec0a62ba` | `lea-theo-002-03-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...ymmetry** places identical or equivleant forms on opposite sides of a ... | |
||| 414 | `51fa177c-6b29-476a-8cee-740b797a9db8` | `lea-matl-007-03-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...oke &lt;450) or A2-s1, d0 (EU equivleant) | ASTM E84 / ISO 11925-2, EN... | |
||| 415 | `5346c118-e05d-4588-8454-96ffd7556ef4` | `lea-strc-006-05-core-concept` | **PASSED** | No issues found | |
||| 416 | `559d37e6-0821-46a0-9f03-5c2edfb9e375` | `lea-matl-002-06-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...8 days, strength is typically equivleant to non-retarded concrete beca... | |
||| 417 | `595e3cd9-150f-44f6-8378-d2125cd7233a` | `lea-matl-007-02-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...asures adhesion loss on a 0-5 sclea (5B = no loss, best; 0B = com... | |
||| 418 | `5d49cedb-dc14-445a-b075-41fe56873081` | `lea-plan-008-03-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...rhoods with mixed uses, human-sclea architecture, and transit con... | |
||| 419 | `61869b56-3658-496c-ac52-060076c5ea6c` | `lea-theo-001-12-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...timacy and refuge through its sclea, materials, and relationship ... | |
||| 420 | `62991043-88f7-4c94-9e06-4d649e5d7f1c` | `lea-plan-007-04-core-concept` | **PASSED** | No issues found | |
||| 421 | `62d556dd-c04a-406d-a3d2-d35f3939e42f` | `owner-smoke-article-1775980207157` | **FLAGGED** | MISSING_CITATION: sources.json empty; MINIMAL_CONTENT: normalized.md only has 9 words | |
||| 422 | `62e4a20d-b739-4d5d-9349-aba651027b51` | `lea-strc-008-01-core-concept` | **FLAGGED** | TYPO: 'rationlea' should be 'rationale' in: ... Member Type | Maximum KL/r | Rationlea | |---|---|---| | Compression... | |
||| 423 | `63c2455e-8c3f-4a0b-b111-855094b3c1d9` | `lea-plan-001-05-core-concept` | **PASSED** | No issues found | |
||| 424 | `65464bd1-e0f7-4267-b64e-f89f93213199` | `lea-matl-004-08-core-concept` | **PASSED** | No issues found | |
||| 425 | `664bf527-4be5-49fa-be54-33a70244467c` | `mastery-professional-practice` | **FLAGGED** | MISSING_CITATION: sources.json empty; SCLEA_TYPO(x2) | |
||| 426 | `6659e8a6-d013-4f2e-9711-b37269c069a3` | `lea-theo-003-02-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ..., completely inverting Hall's sclea. This is a classic panic-driv... | |
||| 427 | `669aab68-416a-4a90-b66c-4ea998e82d05` | `lea-theo-004-02-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...r reflectance of surface (0–1 sclea); white/light surfaces (albed... | |
||| 428 | `69313849-9d45-4777-84fc-4b47430c30b8` | `lea-matl-009-04-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...ubmit."  _Mock-ups_ are small-sclea reproductions of completed as... | |
||| 429 | `6bfa7e66-ac5c-4a52-8f92-0ca94b945305` | `lea-theo-004-09-core-concept` | **PASSED** | No issues found | |
||| 430 | `6ce1c942-85fc-4baf-bb51-df61c8bce885` | `lea-theo-003-07-core-concept` | **FLAGGED** | SCLEA_TYPO(x1): 'sclead' should be 'scaled' | |
||| 431 | `6e84b3e6-5dd9-4557-8202-5085d24a3708` | `top-50-traps-2024-irr` | **FLAGGED** | MISSING_CITATION: sources.json empty | |
||| 432 | `6fd0cdaa-55ed-4847-a740-2779ac5ddded` | `lea-hist-015-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x1): 'scleas' should be 'scales' | |
||| 433 | `708fd4a4-e06f-4255-a2ad-e56711b9ee43` | `lea-matl-010-07-core-concept` | **PASSED** | No issues found | |
||| 434 | `73673e43-58fb-4393-a78b-bbfb45c914fb` | `mastery-theory-of-architecture` | **FLAGGED** | MISSING_CITATION: sources.json empty; TYPO: 'sclea' should be 'scale' in: ..., light, texture, proportion, sclea, balance, rhythm, emphasis, u...; TYPO: 'rationlea' should be 'rationale' in: ...irection — gives you a design rationlea that is both theoretically gr... | |
||| 435 | `763d451f-d9eb-469f-8d5e-8be6c9a7bfa7` | `lea-matl-006-04-core-concept` | **PASSED** | No issues found | |
||| 436 | `7680a85a-b8ee-4b09-a782-00d77fa5c007` | `lea-strc-002-04-core-concept` | **PASSED** | No issues found | |
||| 437 | `7872fb73-5087-4167-a5b3-e799ce11eccc` | `lea-theo-002-08-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...rmony, and appropriateness to sclea and function. All serious arc... | |
||| 438 | `78dd49d6-c0d6-4e9a-a8d5-a929f65f9661` | `lea-theo-008-02-core-concept` | **PASSED** | No issues found | |
||| 439 | `79c137a5-245a-441d-899b-652cf8eb1640` | `lea-strc-002-06-core-concept` | **PASSED** | No issues found | |
||| 440 | `79c3fd58-07a0-4623-9704-4a95065d9e0a` | `owner-smoke-article-a-1775980402961` | **FLAGGED** | MISSING_CITATION: sources.json empty; MINIMAL_CONTENT: normalized.md only has 11 words | |
||| 441 | `7ad29107-a824-4a7b-8c32-ed6a719ebd39` | `lea-theo-004-10-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ... kubo. It is the aristocratic equivleant of the vernacular dwelling.  ... | |
||| 442 | `7b1d04de-6310-4187-8cfc-39f1f30cf349` | `lea-matl-005-09-core-concept` | **FLAGGED** | SCLEA_TYPO(x1): 'scleas' should be 'scales' | |
||| 443 | `7bbf04f7-8c9c-4b8f-9f38-18d7b967a8db` | `lea-util-002-05-kitchen-exhaust-hood-classification` | **FLAGGED** | MISSING_CITATION: sources.json empty; TYPO: 'equivleant' should be 'equivalent' in: ...4 IRR Rule VI Section 606 (or equivleant mechanical code section)  A 2... | |
||| 444 | `8023b230-7871-463c-abb5-d3027212960b` | `lea-theo-002-07-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...ize is often related to human sclea—standard door height accommod... | |
||| 445 | `81af99b9-3a14-4037-84c0-09dbd913153a` | `lea-theo-005-09-core-concept` | **PASSED** | No issues found | |
||| 446 | `82480e11-1573-4911-a865-c26ee4d44238` | `lea-theo-001-11-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...ification), size (dimensional sclea), color (hue and value), text... | |
||| 447 | `83e55961-2180-4a29-8c83-76039225db36` | `lea-theo-007-09-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ...as a primary design generator equivleant to program, structure, and ae... | |
||| 448 | `84cf250f-9168-4bba-9b7a-55dd370f1c31` | `lea-strc-009-01-core-concept` | **PASSED** | No issues found | |
||| 449 | `875396fa-1704-47b7-abb5-29f49c75fc78` | `spp-doc-205-post-construction-services` | **FLAGGED** | MISSING_CITATION: sources.json empty; TYPO: 'rationlea' should be 'rationale' in: ...*  ## Introduction and Policy Rationlea  ### 1.1 Beyond Maintenance a... | |
||| 450 | `875a991f-b8ca-4655-a252-8b5c9f1fc54d` | `site-exterior-circulation` | **FLAGGED** | MISSING_CITATION: sources.json empty | |
||| 451 | `8a618b68-ffca-4df1-91e4-d3864a7968ac` | `lea-strc-005-02-core-concept` | **PASSED** | No issues found | |
||| 452 | `8a812be4-c5c0-40ec-a3ff-74acb39e24bc` | `lea-theo-004-08-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ... (windows facing E-W) creates equivleant solar gain on both sides thro... | |
||| 453 | `9098a3d8-b4d7-42f4-ac2b-0df1509c2507` | `lea-plan-007-02-core-concept` | **PASSED** | No issues found | |
||| 454 | `91457094-42cc-44a0-ad00-3c34ade0d6f7` | `lea-prac-svc-026-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...al projects, especially large-sclea estates and commercial mixed-...; TYPO: 'large-sclea' should be 'large-scale' in: ...rojects, especially large-sclea estates and commerc... | |
||| 455 | `916404b9-8f62-40ab-a275-335da247ce2e` | `lea-strc-007-02-core-concept` | **PASSED** | No issues found | |
||| 456 | `916cb394-9854-4d8e-ae0a-fd1747e37b3f` | `lea-matl-007-04-core-concept` | **PASSED** | No issues found | |
||| 457 | `92be8354-f938-4307-a40c-4620c1381cba` | `lea-util-003-05-core-definitions-grounding-vs-bonding` | **FLAGGED** | MISSING_CITATION: sources.json empty; TYPO: 'equivleant' should be 'equivalent' in: ...imum 4 mm² (12 AWG) copper or equivleant - _Gas company approval:_ Coo... | |
||| 458 | `9375b273-4d0d-4ce2-8a7c-991b7e3d4a8c` | `lea-strc-009-03-core-concept` | **PASSED** | No issues found | |
||| 459 | `973b8e3d-c930-437d-b01d-eb33f4a047d8` | `lea-plan-007-03-core-concept` | **PASSED** | No issues found | |
||| 460 | `974a7c85-c700-435b-80cc-8a2594a132a8` | `lea-strc-001-05-core-concept` | **PASSED** | No issues found | |
||| 461 | `976957b7-c288-4a63-8e76-9e26dcf6f199` | `lea-theo-005-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x1): 'scleas' should be 'scales' | |
||| 462 | `99ee4b30-1612-422c-af69-9a496deb6d79` | `lea-matl-003-05-core-concept` | **FLAGGED** | TYPO: 'equivleant' should be 'equivalent' in: ... D1.1 standards or recognized equivleant. Philippine design codes do n... | |
||| 463 | `9a800f21-b26e-4e3e-94c8-2f4127eccd42` | `spp-doc-203-specialized-architectural-services` | **FLAGGED** | MISSING_CITATION: sources.json empty; TYPO: 'rationlea' should be 'rationale' in: ...*Introduction** — Context and rationlea for the service 2. **Scope of... | |
||| 464 | `9c265d02-df61-46de-8c96-dd474041838e` | `lea-theo-003-05-core-concept` | **FLAGGED** | TYPO: 'sclea' should be 'scale' in: ...onance of footsteps revealing sclea through acoustic behavior, th... | |
||| 465 | `9c379f3b-c567-4615-957c-96e5bb791522` | `lea-plan-001-03-core-concept` | **PASSED** | No issues found | |
||| 466 | `9e0b9ab6-1761-4127-abdd-d7579fb05b20` | `lea-util-008-04-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION: sources.json empty; TYPO: 'sclea' should be 'scale' in: ... (EIA) requirements for large-sclea projects - Environmental Comp...; TYPO: 'large-sclea' should be 'large-scale' in: ...A) requirements for large-sclea projects - Environm... | |
||| 467 | `00000000-0000-4000-8000-00000000d104` | `playwright-seeded-quiz-article` | **FLAGGED** | MISSING_CITATION | 3 Qs |
||| 468 | `a1df237f-7291-4549-93bd-e7ed43f27107` | `lea-theo-009-05-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 469 | `a43232f4-9396-4156-bfec-4606a44b4a72` | `lea-plan-003-07-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 470 | `a66d3236-ce09-4723-acc7-9b017647f249` | `lea-theo-005-05-core-concept` | **PASSED** | No issues found | 12 Qs |
||| 471 | `a6f47968-20fd-4ccd-a53d-27e702cbfe74` | `lea-theo-007-11-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 472 | `a7cb156f-be70-4ff4-9d9c-95a92a8052d3` | `translating-pwd-rights` | **FLAGGED** | MISSING_CITATION|EQUIVLEANT_TYPO(x1) | 21 Qs |
||| 473 | `a81f97c7-292d-4d1d-b047-f6987ec2d3ec` | `lea-util-002-07-escalators-specifications-and-design-parameters` | **FLAGGED** | MISSING_CITATION | 15 Qs |
||| 474 | `a951788d-ae29-431b-8796-f272035fdf8f` | `lea-plan-002-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | 10 Qs |
||| 475 | `abc56d0a-101e-4bef-9eda-e5412892652e` | `lea-strc-010-02-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 476 | `abf78b33-d1f6-4440-9723-ae3599ccf1d2` | `lea-theo-005-11-core-concept` | **PASSED** | No issues found | 12 Qs |
||| 477 | `ac93167f-51ff-4126-ae62-34cf6a534d04` | `lea-matl-006-02-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 478 | `ac9af0bb-dcf3-4a02-b409-d19bca68e514` | `lea-plan-003-05-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | 10 Qs |
||| 479 | `ace46266-45f1-4ecf-8f80-dcc9fb4b9282` | `lea-strc-008-02-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 480 | `ae14f6a9-dec8-458c-b4a1-3ae04df43bfa` | `lea-plan-002-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 481 | `aec393fa-0fb3-4b72-8ce2-774c4c2c756a` | `lea-matl-005-10-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x4) | 10 Qs |
||| 482 | `b065eb65-5814-4a1f-b3ff-6fc9ab55fbb5` | `lea-matl-008-02-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 483 | `b194f38e-8129-4f87-b161-f9f4f7fc43b1` | `mastery-planning-housing-urban-design` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x12) | 0 Qs |
||| 484 | `b2166005-73ba-4a95-8dea-93e12bae9a6b` | `penthouses-and-roof-structures` | **FLAGGED** | MISSING_CITATION | 26 Qs |
||| 485 | `b2310919-6f6c-4abc-92b7-521a362c63d9` | `lea-util-002-08-core-principles-standards` | **PASSED** | No issues found | 15 Qs |
||| 486 | `b58c3d7f-d8c1-434e-9c12-dc58b3645440` | `overview-history-of-architecture` | **FLAGGED** | MISSING_CITATION | 0 Qs |
||| 487 | `b5c8b7bb-b62a-4e2c-a9c8-7c7b29388ea8` | `lea-theo-003-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | 12 Qs |
||| 488 | `b68471a2-34f6-46e3-8f79-7a14ed16eebb` | `lea-matl-010-03-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 489 | `b75b3e00-5fe7-4717-95d0-b65ea5b2bb28` | `lea-util-004-07-core-concepts-and-formulas` | **FLAGGED** | EQUIVLEANT_TYPO(x2) | 15 Qs |
||| 490 | `b835f8bb-bb09-44fa-855a-37128197c63b` | `lea-matl-009-03-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 491 | `b862f4a8-fa65-4cf7-bcb8-bec5b330d837` | `lea-util-006-06-daylighting-design-strategy` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x1)|EQUIVLEANT_TYPO(x1) | 15 Qs |
||| 492 | `b9ae0f63-0d28-4a66-b2bf-51641e6db739` | `lea-plan-004-04-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x1) | 10 Qs |
||| 493 | `bb2f1b8b-855d-4eeb-aeb3-8cf3874508d0` | `mastery-structural-conceptualization` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x1) | 0 Qs |
||| 494 | `bb772d11-27ac-4ad5-b13a-0d1542106956` | `lea-matl-006-03-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 495 | `bcb4ca34-92b0-4fd6-8b0d-b8f45c44bb5f` | `lea-theo-009-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 496 | `bec5c222-dd65-4e9c-8d5e-fe3758fa4d8e` | `lea-util-008-02-mechanical-spaces` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 15 Qs |
||| 497 | `c158e63c-6120-4b2f-9784-c853ef25baa5` | `lea-theo-009-02-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | 10 Qs |
||| 498 | `c24cb79a-074d-48ed-9eb0-b7a7400ed3e8` | `lea-plan-004-07-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 499 | `c2603440-ad82-425f-8c7d-38b71c10a1ef` | `lea-theo-007-14-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x3) | 10 Qs |
||| 500 | `c4eb5745-a35a-4c85-94d2-e7d687a40278` | `lea-matl-007-05-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 501 | `c534d94f-967a-48bb-babf-419fa6d35ec7` | `spp-doc-204-a-fulltime-supervision-services` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x1) | 10 Qs |
||| 502 | `c684727d-d3e3-4303-b213-590c4b8ab766` | `lea-plan-003-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | 10 Qs |
||| 503 | `c9e0e01a-b54b-4957-8316-010c1780aea1` | `lea-util-003-07-residential-load-computation-pec-method` | **FLAGGED** | MISSING_CITATION | 15 Qs |
||| 504 | `ca53ed30-fdc6-42de-bb68-b5335d0d77a6` | `lea-util-005-05-summary` | **FLAGGED** | MISSING_CITATION|EQUIVLEANT_TYPO(x1) | 15 Qs |
||| 505 | `cb07f9cb-7506-496e-941a-4080a05c323f` | `lea-theo-004-07-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | 10 Qs |
||| 506 | `cc009103-96bb-4852-85c9-9067a4359336` | `lea-theo-008-08-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | 10 Qs |
||| 507 | `cc2eb7b8-8933-47d3-a61a-f3f835daf1ab` | `lea-matl-007-06-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 508 | `cc7363f6-b2bf-4ed9-a9b4-81d82eae98fe` | `lea-strc-004-02-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 509 | `cd21006c-647f-4c7b-8b17-fa65c51cbeb3` | `lea-matl-006-05-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 510 | `cf84317f-a9f3-4016-bdec-da86e92d76f8` | `lea-theo-007-02-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | 10 Qs |
||| 511 | `d0466bdc-3061-46b5-9400-2c41d7eb7c97` | `lea-matl-010-02-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 512 | `d2246ae0-2def-4144-b42d-f56172b13f67` | `lea-plan-004-03-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION | 10 Qs |
||| 513 | `d39f0b0e-1219-4f42-a570-e08a6134d544` | `overview-building-utilities-mepf` | **FLAGGED** | MISSING_CITATION | 0 Qs |
||| 514 | `d4ab12a3-cec8-4104-b276-4fe649c2e35f` | `lea-plan-004-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x1)|EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 515 | `d4b359e9-bd36-4a0f-bfce-ec0a49aa06fc` | `lea-matl-005-08-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x2) | 10 Qs |
||| 516 | `d5be6bfb-1b0f-45ab-a658-7f4f2bdb90fc` | `lea-strc-007-06-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 517 | `d713a3b5-968e-4950-9f37-dd34d116b042` | `lea-strc-001-06-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 518 | `d7de9bc9-ea50-46d1-8079-2dd3cc0378e7` | `lea-strc-011-03-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 519 | `d82c5a6f-539a-4b81-bd40-668d9ba467ec` | `lea-theo-005-10-core-concept` | **PASSED** | No issues found | 11 Qs |
||| 520 | `d862de93-c876-468d-9edf-95656a781f55` | `lea-theo-004-13-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x2) | 12 Qs |
||| 521 | `da1f9241-8d97-4162-8944-78f2ffb12368` | `lea-theo-007-10-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x3) | 10 Qs |
||| 522 | `dbac0a4a-cff7-4cb1-8e66-dcd6fb224283` | `lea-plan-002-07-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 523 | `dc020375-d1af-4213-959f-4f31e5f390b9` | `lea-theo-001-13-core-concept` | **PASSED** | No issues found | 14 Qs |
||| 524 | `dd976d64-9f04-409f-8d4d-f8140d575b86` | `lea-theo-005-08-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | 11 Qs |
||| 525 | `e0548d9a-2a95-4ef0-9724-7e2c667b3674` | `lea-strc-003-03-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 526 | `e2d9d304-9362-4472-8ca8-34106f6990dd` | `lea-theo-004-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x1)|EQUIVLEANT_TYPO(x2) | 11 Qs |
||| 527 | `e33b39f4-7b0f-46ac-99d3-20321ffcd9cc` | `lea-theo-006-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x1) | 10 Qs |
||| 528 | `e37575ae-c640-4ddc-911a-7553f338b981` | `lea-prac-svc-025-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 529 | `e59c8abc-5938-47ab-8009-97424baa78c7` | `lea-plan-005-02-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION | 10 Qs |
||| 530 | `e6c2a686-5b8c-477d-b5e4-d02bef987743` | `pedestrian-protection-during-construction` | **FLAGGED** | MISSING_CITATION|EQUIVLEANT_TYPO(x1) | 32 Qs |
||| 531 | `e94f5a24-e9fa-48f6-aa3e-f1de31922f46` | `lea-matl-008-05-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 532 | `e956216b-4b72-4a6a-a471-5cb42162c054` | `lea-util-008-03-electrical-utility-connection` | **FLAGGED** | MISSING_CITATION | 15 Qs |
||| 533 | `e9e1832c-2829-48d7-91ae-77910608c5c2` | `lea-strc-005-03-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 534 | `ec61e112-1609-4f49-b1ad-343444eb6248` | `lea-theo-003-06-core-concept` | **FLAGGED** | SCLEA_TYPO(x1)|LARGE_SCLEA_TYPO | 13 Qs |
||| 535 | `ecf888fd-c314-4d20-87e6-4841f84b71a0` | `lea-prac-svc-020-design-build-by-administration-vs-design-build-b` | **FLAGGED** | MISSING_CITATION | 10 Qs |
||| 536 | `edb9cdaf-4969-4aa8-bd1e-e1605f51fe43` | `lea-matl-004-09-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 537 | `ee14e9e9-4e28-4c5a-bd83-6dc33fee5c3e` | `lea-strc-010-01-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 538 | `ee50e412-f6d8-45f0-9016-55785c60773f` | `lea-theo-008-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 539 | `efa0ecb2-71a7-4b89-9424-c193f8f1c314` | `lea-matl-010-04-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 540 | `f06686b1-8dc4-4514-9e32-5e4cd0365006` | `lea-matl-008-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 541 | `f0790263-a20b-4d36-bebb-05474566cbce` | `lea-strc-012-01-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 542 | `f0f43f10-eabc-474f-8397-c196a9b3649c` | `lea-strc-003-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 543 | `f122ad42-0858-4bb6-ac19-6a788bac4c43` | `lea-strc-007-03-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 544 | `f22ba499-94ce-41a3-999a-2d9ffdbc0b57` | `lea-plan-004-05-what-you-need-to-know-for-the-lea` | **FLAGGED** | MISSING_CITATION | 10 Qs |
||| 545 | `f2c105fd-51fc-4b48-b53a-77242dbb91b0` | `uap-spp-doc-standards-of-professional-practice-for-philippine-arc` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x2) | 10 Qs |
||| 546 | `f34aade8-a870-458c-9609-562419eb1238` | `lea-matl-008-03-core-concept` | **FLAGGED** | SCLEA_TYPO(x3) | 10 Qs |
||| 547 | `f38a5c0d-cc63-4c79-b3d2-c3ab7eccda60` | `lea-theo-003-08-core-concept` | **FLAGGED** | SCLEA_TYPO(x2) | 14 Qs |
||| 548 | `f39860e3-5b76-49c3-a82f-035371e8f225` | `lea-util-008-01-the-three-phase-coordination-framework` | **FLAGGED** | MISSING_CITATION|EQUIVLEANT_TYPO(x1) | 15 Qs |
||| 549 | `f39be27a-5611-4d35-bdda-02f6e3e46f42` | `lea-matl-002-04-core-concept` | **FLAGGED** | SCLEA_TYPO(x1)|EQUIVLEANT_TYPO(x1) | 10 Qs |
||| 550 | `f39f802d-ddcb-4fd5-b9cd-bb1c6e0e8ef3` | `lea-strc-007-05-core-concept` | **FLAGGED** | EQUIVLEANT_TYPO(x2) | 10 Qs |
||| 551 | `f4438093-a209-4c53-9f43-6ad4d9be677e` | `lea-strc-007-01-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 552 | `f481f8cd-bb99-45b9-9183-4db41848e23d` | `lea-util-003-06-the-distribution-hierarchy` | **FLAGGED** | MISSING_CITATION | 15 Qs |
||| 553 | `f53f5341-65fa-4a84-849b-a188f12d3106` | `lea-strc-006-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 554 | `f5ed9c09-3191-4cd4-b1b0-9e6364212c36` | `spp-doc-204-b-construction-management-services` | **FLAGGED** | MISSING_CITATION | 10 Qs |
||| 555 | `f6b1d119-9ba2-436b-ba39-d62abceef5ed` | `lea-plan-005-04-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 556 | `f6fe1a69-b3c0-4c94-8341-9291c71c5006` | `transport-nodes-escalators-walkways` | **FLAGGED** | MISSING_CITATION | 21 Qs |
||| 557 | `f7007096-dbed-43dd-9bba-67fa705834ca` | `lea-plan-007-07-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 558 | `f73ee415-a6b5-4a51-ac48-80da71128de1` | `lea-theo-001-10-core-concept` | **PASSED** | No issues found | 13 Qs |
||| 559 | `f74f79a0-1477-481f-9050-fa43d82f18bd` | `spp-doc-206-comprehensive-architectural-services` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x1) | 10 Qs |
||| 560 | `f76bad6c-4bdf-4d2c-bdfb-a3381c42e320` | `spp-doc-207-design-build-services` | **FLAGGED** | MISSING_CITATION | 10 Qs |
||| 561 | `f7861b5b-0833-4cd3-a634-0dfb9f53891c` | `spp-doc-209-architectural-consulting-services-pacs` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x1)|RATIONLEA_TYPO | 10 Qs |
||| 562 | `f815c409-77f7-4489-b3b9-7cb2f3010ad9` | `lea-util-006-05-recommended-illumination-levels-by-space-type` | **FLAGGED** | MISSING_CITATION | 15 Qs |
||| 563 | `f876a304-f787-4c8b-ab2c-a1a71dfe6257` | `lea-matl-010-06-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 564 | `f8c84325-a1cd-4836-887a-217b767af1b4` | `lea-strc-002-05-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 565 | `f97941fb-6e33-4b9b-8c44-f51db68e40c7` | `lea-theo-009-01-core-concept` | **PASSED** | No issues found | 10 Qs |
||| 566 | `fba5f537-2da9-4fb3-b6eb-696d1937a92a` | `spp-doc-208-architectural-design-competition-adc` | **FLAGGED** | MISSING_CITATION|SCLEA_TYPO(x2) | 10 Qs |
||| 567 | `fc0f6b12-8d7e-4309-b83c-daba0863ff30` | `lea-plan-007-06-core-concept` | **PASSED** | No issues found | 10 Qs |
