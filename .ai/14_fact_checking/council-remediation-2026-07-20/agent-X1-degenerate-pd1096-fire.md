# Agent X1 — Degenerate Batch-048 Question-Edit Remediation (PD 1096 + Fire)

**Date:** 2026-07-20
**Agent:** X1 (LLM fact-checking council)
**Scope:** 178 question-edit JSON files in `/tmp/deg-group-x1.txt`
**Branch:** `fact-check/article-question-remediation` (no commits/pushes made — working-tree edits only)

## Problem

A prior audit batch (`source-audited-article-batch-048-local-first`) wrote question-edit
files whose `proposed.options[].text` fields contained **degenerate 1-character garbage**
(e.g. `"R"`, `"A"`, `" "`, `"I"`, `"t"`). The proposed `text` and `rationale` fields were
also replaced with generic, source-detached boilerplate. These files claimed to remediate
questions but actually destroyed them further. Every degenerate edit discarded a
substantive, source-cited original question from the parent bundle's `linked-questions.json`.

## Method

For each of the 178 files (concentrated in 4 bundles):

1. Read the degenerate edit file to preserve the `baseline_hash`.
2. Matched the file's `question_id` UUID against the parent bundle's
   `linked-questions.json` to recover the ORIGINAL question (text, 4 options,
   correct option id, rationale, explanation, code citation). Every file had
   exactly one matching original.
3. Verified the original was source-correct against the bundle's `normalized.md`
   controlling-source section and the source packs under
   `.ai/16_source_packs/packs/source-pack-pd-1096-irr/` and
   `source-pack-ra-9514-rirr/`.
4. Wrote a Case-A restoration: original content verbatim, with a `rationale` that
   documents the degeneration and preserves the original source rationale.
5. Expanded any short numeric option text (e.g. `"3.00 m"`, `"12 mm"`) into full
   descriptive phrases (>= 10 chars) that preserve the numeric answer value as
   the leading token, so the correct answer remains unambiguous.
6. Corrected bundle-fallback `code_citation` values where the original citation
   was `null` but the question text identified a more specific rule/section
   (e.g. Rule X Sec. 1005 for canopy clearances, Sec. 106 for work classifications,
   Sec. 1207(3)/(4)/(5) for specific egress dimensions).

## Per-Bundle Summary

| Bundle (slug) | Files Fixed | Dominant Pattern | Genuine Errors Found |
|---|---:|---|---|
| `fire-resistive-construction-ratings--aef59aa2` | 46 | **Case A** (restore original) | None in originals. |
| `pd-1096-rule-vii-area-metrics--85bcd328` | 50 | **Case A** (restore original) | None in originals. |
| `pd-1096-rule-xii-egress-and-corridors--93009368` | 41 | **Case A** (restore original) | None in originals. |
| `fire-extinguishing-systems--f61a5716` | 41 | **Case A** (restore original) | None in originals. |
| **TOTAL** | **178** | | **0 genuine errors in originals** |

**Dominant pattern:** Every one of the 178 degenerate edits was Case A — the
original question was already source-correct and pedagogically sound; the prior
batch-048 edit was the only defect. No original question required a substantive
factual correction (no Case B was needed).

## Source-Citation Coverage

Every rewritten file has a non-empty `code_citation` citing either PD 1096
(Rules VI, VII, VIII, X, XII, or IRR Sec. 106) or RA 9514 (Fire Code). The
distinct citations applied:

- `PD 1096, Rule VI, Sec. 603` / `Sec. 603-604` / `Sec. 601-603` (fire-resistance tables)
- `PD 1096, Rule VII, Sec. 704.4.a; Table VII.1; Table VIII.G.6`
- `PD 1096, Rule VII, Table VII.G.1 (FLAR by occupancy)`
- `PD 1096, Rule VIII, Sec. 803.3 / Table VIII.1` (MACA/PSO/ISA/USA)
- `PD 1096, Rule X, Sec. 1005 (Canopy/Marquee clearances)` and projection-room area
- `PD 1096 IRR, Sec. 106 (Work classifications)`
- `PD 1096, Rule XII, Sec. 1201/1202/1204/1205/1206/1207 + Table XII.1` (egress)
- `PD 1096, Rule XII, Sec. 1207(3) exit door / 1207(4) dead-end / 1207(5) stair width`
- `PD 1096, Rule XII, Sec. 1212` and `Sec. 1212 / RA 9514` (standpipes, extinguishers)

## Validation (all 178 files)

- `jq empty <file>`: **0 failures** (every file is valid JSON)
- `action == "replace"`: **178/178**
- `proposed.options | length == 4`: **178/178**
- `correct_option_id` matches one of the option ids: **178/178**
- Minimum option-text length: **10 characters** (smallest across all 178 files; 0 short)
- `code_citation` non-empty: **178/178**
- `proposed.text` length >= 30 chars: **178/178** (no degenerate text replaced)
- `git status`: all 178 files modified, no commits, no branch switch

## Files With Numeric-Option Expansion (18 of 178)

These originals used short numeric answer text (e.g. `"3.00 m"`, `"12 mm"`,
`"60 m"`). To satisfy the >=10-char rule while preserving the numeric answer
value unambiguously, each short option was expanded into a descriptive phrase
with the numeric value as the leading token. Example:

- File `a16a7f47-…` (canopy clearance, Rule X Sec. 1005):
  - `"3.00 m"` -> `"3.00 m minimum vertical clearance above pavement"`
  - `"2.40 m"` -> `"2.40 m clearance (applies to movable awnings, not canopies)"`

The full list of expanded files (one per UUID prefix):

- `fire-resistive-construction-ratings`: `a16a7f47`, `8b3bf5a3`, `6a11aa7e`,
  `cf4ea11e`, `c32f751d`, `8aabadfe`, `701ec0b8`
- `pd-1096-rule-vii-area-metrics`: `ff0f6f83`, `8003a8c6`, `9c4e19c9`,
  `fa55ad46`, `dbb66782`
- `pd-1096-rule-xii-egress-and-corridors`: `1431af42`, `941890ff`,
  `007d351d`, `f981a7a6`, `43d29823`
- `fire-extinguishing-systems`: `eb3ce0e5`

## Files With Citation Correction (12 of 178)

The original `code_citation` was `null` for several questions, so the remediation
script applied a bundle-level fallback citation. For 12 files where the question
text itself identified a more specific rule/section, the citation was overridden
to that specific section. Example:

- File `a16a7f47-…` (canopy/marquee): fallback `Rule VI, Sec. 603-604`
  -> corrected `PD 1096, Rule X, Sec. 1005 (Canopy/Marquee clearances)`
- File `9c4e19c9-…` (enclosing terrace): fallback `Rule VII / Rule VIII`
  -> corrected `PD 1096 IRR, Sec. 106 (Work classifications: …)`

## Recommendation

The batch-048 `source-audited-article-batch-048-local-first` audit pass should be
quarantined and re-reviewed before any further question-edits from it are
applied. The degeneration pattern (1-char garbage in 3 of 4 options) is
characteristic of a broken find/replace or tokenization step that should be
identified and fixed in the upstream pipeline before re-running.
