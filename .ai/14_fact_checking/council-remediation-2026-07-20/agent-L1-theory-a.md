# Agent L1 — Theory of Architecture Stream A — Council Remediation 2026-07-20

**Agent:** L1 (Theory of Architecture stream A)
**Date:** 2026-07-20
**Scope:** 31 Theory of Architecture bundles under `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/`
**Branch:** `fact-check/article-question-remediation` (no branch / commit / push actions taken)

## Summary

- **Bundles audited:** 31
- **Questions checked:** 400 (across all bundles' `linked-questions.json`)
- **New confirmed errors:** 0
- **Pre-existing errors validated:** 2 (across 2 bundles; both already remediated by prior batch 055/057)
- **Question-edit JSON files written this run:** 0 (existing edits already cover the errors)
- **Per-bundle `council-remediation-2026-07-20.md` files written:** 2 (for the bundles with confirmed-error content, even though already remediated)

## Methodology

For each of the 31 bundles:
1. Read `normalized.md` (article body) and `linked-questions.json`.
2. For each question: verified (a) marked-correct answer matches the article body (BUNDLE-INTERNAL consistency — primary focus), and (b) marked-correct answer matches external truth.
3. WebSearched suspicious attributions and proportion/code claims (Palazzo Farnese colossal order, Vitruvius / De architectura date, Edward T. Hall proxemic distance bands, Modulor = Fibonacci/Golden Section, PD 1096 stair rise/run, BP 344 ramp 1:20 / 1200 mm width, Bahay na bato Spanish-indigenous synthesis).
4. For each CONFIRMED_ERROR, planned a question-edit JSON at `<bundle>/question-edits/<question_uuid>.json` matching existing schema, and validated with `jq empty`.
5. Did NOT edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`.

## Per-bundle audit

| # | Bundle | Topic | Qs | Verdict |
|---|--------|-------|----|---------|
| 1 | lea-theo-001-01-core-concept--a969069b | Triple Nature of Architecture (Vitruvian triad) | 13 | CLEAN |
| 2 | lea-theo-001-07-core-concept--30832ba5 | Architecture and Society | 13 | CLEAN* (article-question alignment concern; see Notes) |
| 3 | lea-theo-001-08-core-concept--08829ae6 | Architecture and cultural identity | 14 | CLEAN |
| 4 | lea-theo-001-09-core-concept--25607252 | Vitruvius and Classical Theory | 13 | CLEAN |
| 5 | lea-theo-001-10-core-concept--f73ee415 | Ching: Primary Elements of Form | 13 | CLEAN |
| 6 | lea-theo-001-11-core-concept--82480e11 | Space and Form in Architecture | 13 | CLEAN |
| 7 | lea-theo-001-12-core-concept--61869b56 | Architecture Beyond Shelter | 13 | CLEAN |
| 8 | lea-theo-001-13-core-concept--dc020375 | Architecture shapes the environment | 14 | CLEAN |
| 9 | lea-theo-002-01-core-concept--62274e90 | Classification by Human Need | 13 | **1_ERROR_VALIDATED** (Palazzo Farnese colossal order; already remediated) |
| 10 | lea-theo-002-02-core-concept--20dc8dae | Design Principles (proportion, balance, rhythm) | 13 | CLEAN |
| 11 | lea-theo-002-03-core-concept--4f1312e7 | Axis as elementary organizing means | 14 | **1_ERROR_VALIDATED** (Palazzo Farnese colossal order in distractor + rationale; already remediated) |
| 12 | lea-theo-002-04-core-concept--1ad3cb33 | Ching: Spatial Organization | 14 | CLEAN |
| 13 | lea-theo-002-05-core-concept--1f47e3ab | Ching: Circulation Patterns | 14 | CLEAN |
| 14 | lea-theo-002-06-core-concept--426d0246 | Spatial Organization Types | 13 | CLEAN |
| 15 | lea-theo-002-07-core-concept--8023b230 | Architectural Elements and Articulation | 13 | CLEAN |
| 16 | lea-theo-002-08-core-concept--7872fb73 | Scale and Proportioning Systems (Modulor, ken) | 14 | CLEAN |
| 17 | lea-theo-002-09-core-concept--458cde1d | Color, Texture, Light, Shadow | 14 | CLEAN |
| 18 | lea-theo-003-01-core-concept--2a25a20f | Anthropometrics and Ergonomics | 13 | CLEAN |
| 19 | lea-theo-003-02-core-concept--6659e8a6 | Proxemics and Personal Space | 14 | CLEAN |
| 20 | lea-theo-003-03-core-concept--1aaa804a | Architectural Kinesthetics | 13 | CLEAN |
| 21 | lea-theo-003-04-core-concept--b5c8b7bb | Environmental Perception / Psychology of Space | 12 | CLEAN |
| 22 | lea-theo-003-05-core-concept--9c265d02 | Multisensory Architecture | 13 | CLEAN |
| 23 | lea-theo-003-06-core-concept--ec61e112 | Universal Design (7 principles + BP 344) | 13 | CLEAN |
| 24 | lea-theo-003-07-core-concept--6ce1c942 | Edward T. Hall and Proxemics | 12 | CLEAN |
| 25 | lea-theo-003-08-core-concept--f38a5c0d | Gestalt Psychology and Visual Perception | 14 | CLEAN |
| 26 | lea-theo-003-09-core-concept--2ec5e562 | Spatial Legibility (Lynch elements) | 13 | CLEAN |
| 27 | lea-theo-004-01-core-concept--567ba614 | Philippine Tropical Climate and Design | 12 | CLEAN |
| 28 | lea-theo-004-02-core-concept--669aab68 | Passive Design in Tropical Climates | 12 | CLEAN |
| 29 | lea-theo-004-03-core-concept--e2d9d304 | Tropical Green Building Design (BERDE, GBC) | 11 | CLEAN |
| 30 | lea-theo-004-07-core-concept--cb07f9cb | Biophilic Design | 10 | CLEAN |
| 31 | lea-theo-004-08-core-concept--8a812be4 | Solar Geometry Fundamentals | 11 | CLEAN |

*CLEAN* = no errors found in this audit, with an asterisked note.
**1_ERROR_VALIDATED** = error confirmed by external fact-check but already covered by an existing approved question-edit file (baseline_hash matches current `content_hash`).

## Confirmed errors (validated; already remediated)

### 1. `lea-theo-002-01-core-concept` — Question `ef6f21c7-eed0-4da6-a9e5-c5daafa36b93`

- **Marked-correct answer (option c):** "Colossal order (giant order)" attributed to Palazzo Farnese.
- **External finding:** Palazzo Farnese uses **superimposed orders** per floor (Tuscan/Doric → Ionic → Corinthian, after the Theatre of Marcellus), NOT a colossal/giant order. The colossal order is associated with Michelangelo (Laurentian Library), Palladio (Palazzo Valmarana), and others — but not Palazzo Farnese.
- **Existing remediation:** `question-edits/ef6f21c7-eed0-4da6-a9e5-c5daafa36b93.json` (approved `codex-local-first-batch-057`, 2026-05-11). Replaces the question entirely with a source-safe building-by-need question. Baseline hash matches.
- **Sources:** [Superposed order (Wikipedia)](https://en.wikipedia.org/wiki/Superposed_order); [Superposed Order (Britannica)](https://www.britannica.com/technology/superposed-order); [Palazzo Farnese (Wikipedia)](https://en.wikipedia.org/wiki/Palazzo_Farnese); [Teggelaar – Palazzo Farnese](http://www.teggelaar.com/palazzo-farnese/).

### 2. `lea-theo-002-03-core-concept` — Question `0bf4e821-f1da-44bd-ab75-6b710a09444f`

- **Marked-correct answer (option d):** L'Enfant's Washington D.C. plan = radial symmetry — **correct.**
- **Distractor option (a) and rationale assertion:** "Palazzo Farnese demonstrates colossal order" — **factually wrong** (same misattribution as above).
- **Existing remediation:** `question-edits/0bf4e821-f1da-44bd-ab75-6b710a09444f.json` (approved `codex-local-first-batch-055`, 2026-05-11). Replaces the question entirely with a source-safe axis-as-elementary-organizing-means question. Baseline hash matches.
- **Sources:** Same as #1.

## WebSearch spot-checks performed

The following external-fact claims were spot-checked against authoritative web sources; all matched:

- Vitruvian triad: firmitas / utilitas / venustas — matches Vitruvius *De architectura* (c. 30–20 BCE).
- Vitruvius "nearly 2,000 years old" — *De architectura* c. 27–20 BCE ≈ 2,050 years ago; acceptable.
- Le Corbusier Modulor combines Golden Section/Fibonacci relationships with human-body dimensions (1.83 m / 6 ft base figure) — matches ETH Zürich, Wikipedia, and KSU mathematical commentary.
- Edward T. Hall proxemic distance bands: intimate (0–18 in / 0–45 cm), personal (1.5–4 ft / 45 cm–1.2 m), social (4–12 ft / 1.2–3.5 m), public (12+ ft). Article's three-band list (intimate/personal/social) matches the local TOA 3 source scope.
- PD 1096 (National Building Code of the Philippines): stair rise ≤ 200 mm, run ≥ 250 mm — confirmed via DPWH official PDF and IRR.
- BP 344 2024 Revised IRR: accessible ramp minimum clear width 1200 mm, gradient not steeper than 1:20 — confirmed via NCDA 2024 Revised IRR.
- Bahay na bato: Austronesian + Spanish (and later American) hybrid, evolved from bahay kubo during Spanish colonial era — confirmed via Intramuros Administration and Wikipedia.

## Notes

### Article–question alignment concern (not a factual error)

`lea-theo-001-07-core-concept--30832ba5` is titled "Architecture and Society" with a body about how architecture reflects social/cultural/economic/environmental conditions. However, the linked-questions.json file contains 13 questions, of which ~8 are about AIA-standard 5-phase design process (Schematic Design, Design Development, Construction Documents, Bidding, Construction Administration) and shop drawing / RFI / change-order workflow — topics NOT covered in the article body.

This is an article-question alignment issue, not a question-level factual correctness error. Each individual question is internally consistent with AIA practice standards and the marked-correct answer is externally correct. All 13 questions in this bundle already have approved question-edit JSON files that fully replace the question text, so the alignment concern is also already addressed by the prior remediation batches. No new edit needed.

## Files written this run

- `/Users/philiplewis/slatecamp/.ai/14_fact_checking/council-remediation-2026-07-20/agent-L1-theory-a.md` (this report)
- `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-theo-002-01-core-concept--62274e90-5cb3-4bc0-85a1-639858e47736/council-remediation-2026-07-20.md` (per-bundle report)
- `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-theo-002-03-core-concept--4f1312e7-61e8-4d33-8d49-48a5ec0a62ba/council-remediation-2026-07-20.md` (per-bundle report)

No question-edit JSON files were written — both confirmed errors are already covered by approved edits from batches 055/057 whose `baseline_hash` matches the current `content_hash` of the affected questions.

No primary content files (`normalized.md`, `candidate.md`, `linked-questions.json`, `original.md`) were edited.
