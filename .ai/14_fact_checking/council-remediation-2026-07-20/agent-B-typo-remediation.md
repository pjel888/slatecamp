# Council Remediation — Agent B — Systematic Typo Remediation

**Agent:** B (LLM fact-checking council)
**Date:** 2026-07-20
**Scope:** Corpus-wide remediation of three recurring OCR-style typo patterns across all 567 article bundles in `.ai/content-audit-export/articles/`.

> **Note:** This report was originally produced by Agent B in wave 1. The original markdown file was lost during a git branch-state incident (a sub-agent's branch checkout triggered a `reset to HEAD` that discarded uncommitted changes). The typo fixes were re-applied by the orchestrator using `sed` after the incident. The findings below are reconstructed from Agent B's original transcript and the orchestrator's re-application verification. All underlying edits are verified present and all JSON validates clean.

---

## Typo patterns remediated

| Pattern | Correct form | Status |
|---|---|---|
| `sclea` | `scale` (also `large-sclea` → `large-scale`, `scleas` → `scales`) | ✅ 0 residual |
| `equivleant` | `equivalent` | ✅ 0 residual |
| `rationlea` | `rationale` | ✅ 0 residual in content (slug-bound bundle preserved) |

---

## Replacements applied

| Pattern | Occurrences fixed |
|---|---|
| `sclea` → `scale` | 61 |
| `equivleant` → `equivalent` | 31 |
| `rationlea` → `rationale` | 18 |
| **Total** | **110** |

**Files modified:** 67 (all `normalized.md` / `linked-questions.json`; no `candidate.md` contained any of the typos).

---

## Post-fix verification (after orchestrator re-application)

```
sclea in content (normalized.md, candidate.md, linked-questions.json):     0
equivleant in content:                                                     0
rationlea in content (excl. slug-bound bundle):                            0
```

All 13,242 JSON files under `articles/` validate clean with `jq empty` (0 invalid).
Zero `original.md` files modified (confirmed via `git status`).

---

## Key finding: slug-bound `rationlea` bundle (NOT fixed in-place)

The bundle directory `lea-prac-svc-019-design-build-services-overview-`**`rationlea`**`-and-architect-s-role--9796e088...` has the typo baked into its **slug/identifier**. The ~51 `rationlea` hits inside that bundle's metadata/report/question-edit files are all slug/identifier references (`slug`, `parent_article_slug`, `claim_id`, `model_id`, `reason`, `folder`, report titles) — **zero** are in question `text`/`rationale`/`explanation` content.

These were deliberately left unchanged because editing them in place would break slug↔directory referential integrity. A proper fix requires a coordinator-level atomic operation:
1. Rename the bundle directory `rationlea` → `rationale`.
2. Update the `slug` field in `article-metadata.json`.
3. Run a corpus-wide find/replace on the old slug string across all files that reference it (other bundles' `parent_article_slug`, reports, manifests, sync-state).
4. Validate the round-trip with the content-audit test suite.

This is flagged for a future coordinated pass and is **out of scope** for typo-only remediation.

---

## Methodology

1. **Inventory:** `grep -rl "<pattern>" articles/*/normalized.md` for each pattern, plus `candidate.md` and `linked-questions.json`.
2. **Apply:** For each affected bundle, edit the files where the typo appears. Use `replace_all` semantics — these three patterns are unambiguous English errors with no legitimate uses.
3. **Exclude:** `original.md` (export snapshot, must stay as-is for diffing).
4. **Validate:** `jq empty` on every JSON touched; post-fix grep returns empty.
5. **Re-apply (after incident):** Orchestrator re-applied via `sed -i ''` on the 67 content files + the standalone `storage-of-x-ray-films` rationela content occurrence.
