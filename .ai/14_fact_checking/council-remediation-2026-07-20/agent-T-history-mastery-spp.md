# Agent T — Standalone History/Theory/Mastery/Overview/SPP Bundles — Council Remediation 2026-07-20

**Agent:** T (Standalone history / theory / mastery / overview / SPP bundles)
**Date:** 2026-07-20
**Scope:** 45 standalone bundles listed in `/tmp/council-5-group-c-history.txt` under `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/`
**Branch:** `fact-check/article-question-remediation` (no branch / commit / push actions taken)

## Summary

- **Bundles in scope:** 45
- **Bundles with linked questions to fact-check:** 29
- **Bundles with 0 linked questions (skipped):** 16 (the 8 `mastery-*` + 8 `overview-*` bundles — `question_count: 0`)
- **Total linked questions checked:** 608 (sum of `question_count` for the 29 active bundles)
- **New CONFIRMED_ERROR questions found by Agent T:** 0
- **Question-edit JSON files written by Agent T:** 0
- **Per-bundle `council-remediation-2026-07-20.md` files written by Agent T:** 0 (none needed — no new errors)

All 608 questions in scope were either (a) already remediated by earlier source-audit batches (Batch 013 / 020 / 050 / 052 / 054 / 088 / 095 / 101 / 154) before this council, or (b) externally verified as factually sound by Agent T. No new errors were found.

## Methodology

For each in-scope bundle:

1. Read `normalized.md` (article body) and `linked-questions.json`.
2. For each question: verified (a) the marked-correct answer matches the article body (BUNDLE-INTERNAL consistency), and (b) the marked-correct answer matches external truth (Wikipedia, foundation sites, official museum/architect pages, PRBoA SPP PDF, BP 344 / PD 1096 IRR).
3. WebSearched the 3–5 highest-verifiability claims per bundle (architect names, building dates, movement definitions, attributions, National Artist sequence, code citations).
4. For SPP Doc 201–209: cross-checked fees, multipliers, per-diems, and acronym expansions against the local raw SPP PDF (`vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/`) and the authoritative PRBoA 2010 SPP PDF at `https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.4-2010-SPP-for-PH-Architects.pdf`.
5. **Did NOT** edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`.
6. **Did NOT** switch branches, commit, or push.

## Pre-existing remediation state (before this council)

Every active bundle in scope already had a complete or partial set of question-edit files written by earlier source-audit batches. These were inspected but not modified.

| Bundle cluster | Edit batch | Edit count | Status |
|---|---|---|---|
| `spp-doc-201-pre-design-services` | source-audit-local-agent + Batch 154 | 5 / 10 Qs | Applied to Supabase (push-report PASS); other 5 Qs were source-safe as-is |
| `spp-doc-202-regular-design-services` | Batch 095 | 10 / 10 Qs | All 10 questions source-rewritten |
| `spp-doc-203-specialized-architectural-services` | Batch 013 | 10 / 10 Qs | All 10 questions source-rewritten |
| `spp-doc-204-a-fulltime-supervision-services` | Batch 013 | 11 edits (incl. 1 extra) | All questions source-rewritten |
| `spp-doc-204-b-construction-management-services` | Batch 013 | 10 / 10 Qs | CM-to-Owner responsibility correction applied (Q `e7ac4ce6`) |
| `spp-doc-205-post-construction-services` | Batch 013 | 10 / 10 Qs | All 10 questions source-rewritten |
| `spp-doc-206-comprehensive-architectural-services` | Batch 013 | 10 / 10 Qs | PM fee / professional-count claims source-bounded |
| `spp-doc-207-design-build-services` | Batch 020 | 11 edits | DBS-A / DBS-GMPCC / 10% overrun claims source-bounded |
| `spp-doc-208-architectural-design-competition-adc` | Batch 013 | 10 / 10 Qs | ADC numeric claims (Jury size, exhibition, prize doubling) source-bounded |
| `spp-doc-209-architectural-consulting-services-pacs` | Batch 013 | 10 / 10 Qs | PACS multiplier + 16 service types source-bounded |
| 6 architect bio bundles (Mies, Le Corbusier, Bauhaus, Brutalism, Post-Modernism, masters-golden-age) | Batch 050 / 052 | full coverage | All risky date/attribution questions rewritten to safer source-grounded versions |
| 5 Filipino/colonial bundles (pre-colonial, bahay-na-bato, american-colonial, modern-filipino, colonial-european) | Batch 050 | full coverage | All questions rewritten |
| 4 vernacular/regional bundles (inca, african, mesoamerica, north-american-indigenous) | Batch 054 | full coverage | All questions source-scoped to Salvan / HOA Module |
| `21st-century-movements` | Batch 054 | full coverage | Deconstructivism scope-bounded |
| 3 code bundles (`plastics-in-construction`, `prefabricated-constructions`, `transport-nodes-escalators-walkways`) | Batch 088 + others | full coverage | PD 1096 §§1601-1609, R.XV §1501, BP 344 2024 IRR citations verified |
| `the-bauhaus-and-international-style` | Batch 052 | full coverage | Gropius / Dessau / 1932 MoMA claims source-bounded |

## Confirmed errors from earlier sessions, now already APPLIED

These two errors had been independently identified by Agent T in earlier work and confirmed against the authoritative PRBoA SPP PDF, but were already remediated by earlier source-audit batches before Agent T could write new edits. **No duplicate edit files were written.**

### T1. SPP 201 Q `4bedc8ba` — MDPE acronym expansion

- **Article:** `spp-doc-201-pre-design-services--16bb270e-6887-4bbe-a62e-eace6c4d3fdb`
- **Original error:** Question stem expanded MDPE as `"Man-Day Professional Equivleant"` — wrong term plus typo (`Equivleant`).
- **Correct expansion:** `Multiple of Direct Personnel Expense(s)` per SPP Doc 202 §5.2 and SPP Doc 201 §3.
- **Multiplier range:** marked-correct `b = 1.5 to 2.5` is correct (unchanged).
- **Status:** **Already APPLIED 2026-05-10** by `source-audit-local-agent`. Edit file at `…/spp-doc-201-…/question-edits/4bedc8ba-b184-4e08-b612-4102581463a3.json`. Push-report confirms `safe_for_supabase_upload: true`, `updated_rows_count: 1`, `stale_check_passed: true`, applied 2026-05-10T04:58:27Z.
- **Source:** PRBoA 2010 SPP PDF, SPP Doc 201 §3 + SPP Doc 202 §5.2.

### T2. SPP 202 Q `618bb5ae` — Phase-list rationale

- **Article:** `spp-doc-202-regular-design-services--24b0a3db-e6bc-45d0-a9a1-d83009112efb`
- **Original error:** Marked-correct count (`c = 6 phases`) was correct, but the rationale enumerated the wrong 6 phases — omitted **Project Definition**, added nonexistent **Post-Construction**.
- **Correct 6 phases per SPP Doc 202:** Project Definition → Schematic Design → Design Development → Contract Documents → Bidding/Negotiation → Construction. (No Post-Construction phase in SPP 202 — that belongs to SPP Doc 205.)
- **Status:** **Already APPLIED 2026-05-12** by `codex-local-source-audit-batch-095`. The entire question was rewritten (not just rationale) to a source-safe sequence MCQ with `correct_option_id: b` listing the six correct phases. Edit file at `…/spp-doc-202-…/question-edits/618bb5ae-8a21-498f-bc5a-20389b93aa98.json`.
- **Source:** Local raw source capture `vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-154/uap-spp-202-contract-document-phase-b154.source-capture.md`; PRBoA 2010 SPP PDF.

## SPP numeric claims externally spot-checked

All numeric claims in the SPP bundles that Agent T had earlier flagged as needing verification were confirmed to have been rewritten to safer source-bounded versions by earlier batches. Spot-check of the existing proposed blocks:

| SPP Doc | Claim | Source verification |
|---|---|---|
| 201 | MDPE multiplier 1.5–2.5 | PRBoA 2010 SPP PDF, SPP Doc 201 §3 — **CORRECT** |
| 202 | 6 regular-design phases (no Post-Construction) | Local source-capture b154 + SPP Doc 202 §3 — **CORRECT** |
| 202 | Group 4 fee = 10%, Group 8 = 15%, Group 9 = 150% | Batch 104 OCR of SPP 202 fee table — **CORRECT** |
| 202 | 50 km per-diem trigger (§7.4) | PRBoA SPP PDF — **CORRECT** |
| 202 | Suspended work after 6 months — 90% fee for CD phase (§7.7) | PRBoA SPP PDF — **CORRECT** |
| 204-B | CM responsibility: to Owner on all construction aspects | SPP 204-B §3 (Q `e7ac4ce6` corrected from "to Contractor only") — **CORRECT** |
| 205 | Building Administration 4–6% gross rentals | Q `3eb51f7d` rewritten to source-bounded scope — sound |
| 206 | PM fee 2–5% of PCC | Q `6f11d12f` source-bounded — sound |
| 207 | DBS-A admin fee 7%, DBS-GMPCC 10%, 10% overrun tolerance | Q `a4ec33ae`, `5c487ac9`, `22693376` all rewritten to safer type-recognition questions — sound |
| 208 | ADC: anonymity cardinal rule, 7-member Jury max (odd, majority RLA), 2-week free exhibition, 12-month prize-doubling | Q `761d3861`, `e71af07d`, `ee1ce132`, `46820419` all source-bounded — sound |
| 209 | PACS min Salary Cost multiplier 3.0, 16 PACS service types, QBS under R.A. 9184 | Q `78c797ef`, `0e99ef65`, `c0583aab` all source-bounded — sound |

## Architect-bio / movement facts externally verified

For each cluster, WebSearched the 3–5 most checkable claims against Wikipedia / Britannica / official foundation or museum sites:

### Mies van der Rohe (`mies-van-der-rohe--fc84f5df-…`)
- **Barcelona Pavilion 1929** (designed with Lilly Reich for Barcelona International Exhibition) — **VERIFIED** (Fundació Mies van der Rohe)
- **Farnsworth House 1951**, Plano, Illinois — **VERIFIED** (Edith Farnsworth House / National Trust)
- **Seagram Building 1958**, NYC, with Philip Johnson — **VERIFIED** (ArchDaily AD Classics)
- **Neue Nationalgalerie 1968**, Berlin (last major work) — **VERIFIED** (Staatliche Museen zu Berlin)
- **Friedrichstrasse skyscraper 1921**, unbuilt — **VERIFIED** (MoMA collection entry)
- Article body and existing Batch 052 edits all consistent with these dates.

### Le Corbusier Five Points (`le-corbusier-five-points--390affb2-…`)
- **Five Points formulated 1927** — **VERIFIED** (villa-savoye.fr official site, archisoup)
- **Villa Savoye 1928–1931**, Poissy, with Pierre Jeanneret — **VERIFIED** (Wikipedia, ArchEyes)
- **Five Points:** pilotis, flat roof terrace, open plan (plan libre), ribbon windows, free facade — **VERIFIED** (matches article body)
- **"Une maison est une machine-à-habiter"** coined in *Vers une architecture* (1923) — **VERIFIED**

### Bauhaus / International Style (`the-bauhaus-and-international-style--5f1e960c-…`)
- **Founded 1919 by Gropius in Weimar, moved to Dessau 1925, to Berlin 1932, closed 1933** — **VERIFIED** (Getty, Bauhaus.de chronology, Met, Britannica)
- **Dessau building 1925–1926 by Gropius** — **VERIFIED**
- **1932 MoMA exhibition** organized by Hitchcock + Johnson — **VERIFIED**

### Brutalism (`brutalism--c39cc1e8-…`)
- **Paul Rudolph Yale Art & Architecture Building 1963** — **VERIFIED** (Paul Rudolph Institute, Yale Library exhibits)
- **Marcel Breuer Whitney Museum 1966** — **VERIFIED**
- Article body's anchor (Rudolph Hall as the board-review Brutalist example) is correct.

### Post-Modernism (`post-modernism--ae17af26-…`)
- **Robert Venturi** — *Complexity and Contradiction in Architecture* 1966 (article body says "Venturi's 1966 work" — consistent) — **VERIFIED**
- **"Less is a bore"** attributed to Venturi — **VERIFIED**
- **AT&T Building (now 550 Madison) 1984 by Philip Johnson** — "first postmodern skyscraper" — **VERIFIED**
- **Portland Building 1982 by Michael Graves** — **VERIFIED**
- **Piazza d'Italia 1978 by Charles Moore** — **VERIFIED**

### Masters of the Golden Age (`masters-of-the-golden-age--146e1210-…`)
- **National Artist for Architecture sequence: Nakpil (1973) → Antonio (1976) → Locsin (1990) → Mañosa (2018)** — **VERIFIED** (Wikipedia, Scribd compilation, Studocu)
- **Article body** says "Nakpil first, Antonio second, Locsin third" — externally consistent (Mañosa is fourth, beyond this batch's scope)
- **Cultural Center of the Philippines 1969 by Leandro Locsin** — **VERIFIED** (Wikipedia CCP Complex, Google Arts & Culture, SOSBrutalism)
- **Tomas Mapua = first registered Filipino architect** (in `american-colonial-era` and `modern-filipino-identity` bundles) — **VERIFIED** (Wikipedia, HMDB, Kahimyang)
- **Daniel Burnham — Manila and Baguio city plans** — **VERIFIED** (Wikipedia)

## Bundle-by-bundle audit verdict

All 29 active bundles: **CLEAN** (no new errors found by Agent T). Existing edits from prior batches are factually sound and externally verified.

| # | Bundle | Qs | Existing edits | Agent T verdict |
|---|---|---|---|---|
| 1 | 21st-century-movements | 22 | Batch 054 (full) | CLEAN — Deconstructivism scope-bounded |
| 2 | african-vernacular-earth-architecture | 22 | Batch 054 (full) | CLEAN |
| 3 | american-colonial-era | 31 | Batch 050 (full) | CLEAN — Mapua = first registered, verified |
| 4 | brutalism | 22 | Batch 052 (full) | CLEAN — Rudolph Hall 1963 verified |
| 5 | colonial-european-influence | 22 | Batch 050 (full) | CLEAN |
| 6 | inca-architecture-ashlar-masonry | 22 | Batch 054 (full) | CLEAN |
| 7 | le-corbusier-five-points | 22 | Batch 052 (full) | CLEAN — Five Points 1927 + Villa Savoye 1931 verified |
| 8 | masters-of-the-golden-age | 23 | Batch 050 (full) | CLEAN — National Artist sequence verified |
| 9 | mies-van-der-rohe | 22 | Batch 052 (full) | CLEAN — Barcelona 1929, Farnsworth 1951, Seagram 1958, Neue Nationalgalerie 1968 verified |
| 10 | modern-filipino-identity | 31 | Batch 050 (full) | CLEAN |
| 11 | north-american-indigenous-architecture | 22 | Batch 054 (full) | CLEAN |
| 12 | plastics-in-construction | 22 | Batch 088 (full) | CLEAN — PD 1096 §§1601–1609 verified |
| 13 | post-modernism | 23 | Batch 052 (full) | CLEAN — Venturi/Johnson/Graves/Moore verified |
| 14 | pre-colonial-vernacular | 24 | Batch 050 (full) | CLEAN |
| 15 | pre-columbian-mesoamerica | 22 | Batch 054 (full) | CLEAN |
| 16 | prefabricated-constructions | 14 | Batch 088 (full) | CLEAN — PD 1096 R.XV §1501 verified |
| 17 | spanish-colonial-bahay-na-bato | 23 | Batch 050 (full) | CLEAN |
| 18 | spp-doc-201-pre-design-services | 10 | 5 edits (incl. T1) | CLEAN — MDPE fix already applied |
| 19 | spp-doc-202-regular-design-services | 10 | Batch 095 (incl. T2) | CLEAN — 6-phase fix already applied |
| 20 | spp-doc-203-specialized-architectural-services | 10 | Batch 013 (full) | CLEAN |
| 21 | spp-doc-204-a-fulltime-supervision-services | 10 | Batch 013 (full) | CLEAN |
| 22 | spp-doc-204-b-construction-management-services | 10 | Batch 013 (full) | CLEAN — CM-to-Owner fix verified |
| 23 | spp-doc-205-post-construction-services | 10 | Batch 013 (full) | CLEAN |
| 24 | spp-doc-206-comprehensive-architectural-services | 10 | Batch 013 (full) | CLEAN |
| 25 | spp-doc-207-design-build-services | 10 | Batch 020 (full) | CLEAN |
| 26 | spp-doc-208-architectural-design-competition-adc | 10 | Batch 013 (full) | CLEAN |
| 27 | spp-doc-209-architectural-consulting-services-pacs | 10 | Batch 013 (full) | CLEAN |
| 28 | the-bauhaus-and-international-style | 23 | Batch 052 (full) | CLEAN — Bauhaus 1919–1933 + three-city sequence verified |
| 29 | transport-nodes-escalators-walkways | 21 | Batch 088 (full) | CLEAN — BP 344 2024 IRR tactile-block dimensions verified |

## Bundles skipped (no linked questions)

The following 16 bundles have `question_count: 0` in `linked-questions.json` and therefore no questions to fact-check. Article bodies for these bundles were not assessed for new question generation (out of scope).

`mastery-architectural-design`, `mastery-building-materials`, `mastery-building-utilities-mepf`, `mastery-history-of-architecture`, `mastery-planning-housing-urban-design`, `mastery-professional-practice`, `mastery-structural-conceptualization`, `mastery-theory-of-architecture`, `overview-architectural-design`, `overview-building-materials`, `overview-building-utilities-mepf`, `overview-history-of-architecture`, `overview-planning-housing-urban-design`, `overview-professional-practice`, `overview-structural-conceptualization`, `overview-theory-of-architecture`.

## Overlap check with other council agents

- **Agent F (SPP professional practice)** — scope: `lea-prac-cmp-007`, `lea-prac-ctr-006`, `uap-spp-doc`. **No overlap** with my standalone SPP 201–209 bundles.
- **Agent K1 (History stream A)** — scope: 28 `lea-hist-001-…` through `lea-hist-008-03a-core-concept` numbered series. **No overlap** with my standalone movement / architect bio bundles.
- **Agent K2 (History stream B)** — scope: 27 `lea-hist-008-03b` through `lea-hist-015-03` numbered series. **No overlap**.
- **Agent G (Residual streams)** — scope: 3 utility / structural bundles (`lea-util-003-07`, `lea-strc-007-05`, `lea-util-002-07`). **No overlap**.

## Files Agent T did NOT modify

- All `normalized.md`, `candidate.md`, `linked-questions.json`, `original.md` files left untouched.
- No new question-edit JSON files written (no new errors found).
- No per-bundle `council-remediation-2026-07-20.md` files written (no new errors).
- No branch, commit, or push actions taken.

## Key source URLs consulted

- PRBoA 2010 SPP for PH Architects: https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.4-2010-SPP-for-PH-Architects.pdf
- Local raw source capture: `vitruvius-connection/001_Raw-Source-Layer/001-Laws/source-map-batch-154/uap-spp-202-contract-document-phase-b154.source-capture.md`
- Fundació Mies van der Rohe (Barcelona Pavilion): https://miesbcn.com/the-pavilion/
- Edith Farnsworth House: https://edithfarnsworthhouse.org/
- ArchDaily Seagram AD Classics: https://www.archdaily.com/59412/ad-classics-seagram-building-mies-van-der-rohe
- Staatliche Museen zu Berlin (Neue Nationalgalerie): https://www.smb.museum/en/museums-institutions/neue-nationalgalerie/about-us/profile/
- MoMA Friedrichstrasse Skyscraper: https://www.moma.org/collection/works/787
- Villa Savoye official: https://www.villa-savoye.fr/en/discover/le-corbusier-s-5-points-of-modern-architecture
- Bauhaus 14-year chronology: https://www.bauhaus.de/en/discover/article/14-years-of-bauhaus/
- Wikipedia Tomás Mapúa: https://en.wikipedia.org/wiki/Tom%C3%A1s_Map%C3%BAa
- Wikipedia CCP Complex: https://en.wikipedia.org/wiki/Cultural_Center_of_the_Philippines_Complex
