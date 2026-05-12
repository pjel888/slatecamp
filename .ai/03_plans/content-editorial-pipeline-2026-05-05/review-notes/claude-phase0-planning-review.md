# Phase 0 Readiness Review — Senior Planning Reviewer Verdict

I verified the OpenCode memo against the live plan pack (22 files) and live repo state. Key spot-checks: `ai-feature-guard.ts` is a 7-line stub that `process.exit(2)`s — confirmed. README confirms launch is "explicitly payment-free and **live-AI-provider-free**" — confirmed. No `.ai/16_source_packs/`, no `.ai/content-audit-export/source-packs/`, no `001_Raw-Source-Layer/` — all three referenced locations are absent. 19 `content-audit:*` commands and 6 `tmp-*.ts` files in `scripts/content-audit/` — confirmed. **No `readiness-report.md` exists yet in the plan folder** — Phase 0 is itself incomplete; OpenCode's memo is the de-facto draft but has not been committed as the authoritative artifact the plan demands.

---

## 1. Final readiness verdict

**CONDITIONAL GO — for completing Phase 0 + Phase 0.5 planning work only.**
**NO-GO — for any Phase 1 (artifact schema) implementation, and explicit NO-GO for any Phase 3+ (AI worker) implementation.**

The plan pack is doctrinally sound but rests on two unresolved foundation conflicts (live-AI moratorium vs AI pipeline; absent source packs vs source-grounded doctrine) and several governance gaps where any Phase 1 build commits the team to artifacts whose contracts are not yet decidable.

---

## 2. Top 10 blockers / risks

| # | Blocker | Severity | Why this blocks Phase 1 |
|---|---|---|---|
| **B1** | **Launch posture vs pipeline posture conflict** — README, AGENTS, and feature flags treat live AI providers as deferred / disabled (`ai-feature-guard.ts` exits 2). The pipeline plan's entire Phases 3–6 require live providers. No reconciliation document exists. | CRITICAL | A schema or script designed assuming live OpenAI/Anthropic calls is dead-on-arrival under the current launch contract. |
| **B2** | **Source pack infrastructure is fully absent** — no `001_Raw-Source-Layer/`, no `.ai/16_source_packs/`, no `source-packs/` subfolder in the export tree. Source-pack chunk schema exists only in prose. | CRITICAL | Doctrine point #2 ("every factual change traceable to source pack") is unenforceable without it. Phases 3–6 cannot be acceptance-tested. |
| **B3** | **No `readiness-report.md` (Phase 0 deliverable) exists in the plan folder** — Plan 02 explicitly requires 6 audit outputs. None are committed. The OpenCode memo is the only candidate but is unsigned, unstored, and unversioned. | HIGH | Phase 0 acceptance gate is technically failed by its own criteria. |
| **B4** | **Foundation instability: 6 `tmp-*.ts` debug files** in `scripts/content-audit/` (`tmp-direct-push`, `tmp-fetch`, `tmp-push-debug{,2,3,4}`). Plan assumes the existing roundtrip is stable enough to extend. | HIGH | Editorial pipeline must not be layered on a half-debugged push path. |
| **B5** | **Reviewer capacity is rhetorical, not contracted.** Plan 18 lists "SLA planning questions" but no answers. Subject-matter reviewers for PD 1096 / RA 9266 / RA 9514 are licensed architects — there is no recruitment, cost, availability, or queue throughput estimate. | HIGH | Phase 6/7 cannot pass without real reviewers. The "human approves high-risk" gate is theatre without them. |
| **B6** | **Component validation is name-only by default.** Plan 06 promises prop/nesting validation but `component-inventory/` was generated from usage scanning, not from authoritative component prop schemas (Zod/TS). AI can hallucinate `<MnemonicCard>` props that pass name-only checks and break MDX compile only at runtime. | HIGH | Phase 2 validators will give false-pass signals. |
| **B7** | **"Deterministic fact-change validator" is misnamed.** Detecting whether AI prose changed a numerical/legal claim is semantically fuzzy unless the fact-ledger forces 1:1 claim mapping with structural anchors. Plan does not specify how the diff validator becomes deterministic. | HIGH | Promised guardrail does not exist as designed. |
| **B8** | **Question-bank workflow is co-located with articles in artifact layout** (`editorial/question-validation.json` per article) but Plan 11 declares questions a "first-class pipeline." Cross-article questions, orphaned questions, and corpus-wide duplicates have no home. Also: corpus-level artifacts (`question-bank-risk-register.md`, `question-duplicate-ledger.json`) are placed under `.ai/15_content_optimization/` (operational state), conflating planning artifacts with state. | HIGH | Schema decisions made now will fight the pipeline later. |
| **B9** | **Phase ordering still violates its own gates.** Phase 5.5 (early admin visibility) is numbered as a back-fill between 5 and 6 but conceptually belongs before Phase 6. **Phase 8.5 (rollback rehearsal) sits AFTER Phase 8 (pilot benchmark + scale decision)** — rollback must be proven before any apply step, not after the scale-or-not decision. | MEDIUM-HIGH | Sequencing as written invites real-world breakage. |
| **B10** | **Provider/data governance has unresolved copyright and retention policy.** Plan 20 marks copyrighted textbook excerpts, SPP documents, and licensed review materials as "review required" but does not gate the pipeline on it. Public laws (PD 1096, RA 9266, RA 9514) are safe; commentaries may not be. No retention SLA is committed. | HIGH | A single license violation against a copyrighted reviewer text could be both legal and reputational damage. |

Two further structural concerns that don't quite make the top 10 but should be tracked: (a) the schema-version string is a date (`"2026-05-05.v1"`) which rots when iterated mid-pilot — use semver; (b) artifact `input_hashes` records input file hashes but not the source-pack snapshot hash or prompt-version hash that produced the output, breaking replayability.

---

## 3. Required changes to readiness-report.md

The OpenCode memo is a strong draft but must be hardened before being committed as Phase 0's authoritative artifact:

1. **Add a "Conflicts Requiring Founder/PM Decision" section at the top.** List the three foundation conflicts (live-AI stance, source packs, ai-feature-guard) and require explicit resolutions (decision, owner, date) before Phase 1 unlocks.
2. **Convert the readiness matrix from prose claims to evidence-anchored rows.** Each "READY/PARTIAL/MISSING" cell must cite a file path or grep result, not a paragraph. Current memo already cites well; just enforce uniformly.
3. **Add the 5 sibling outputs Plan 02 requires:** `current-script-map.md`, `current-artifact-map.md`, `admin-ai-audit-current-state.md`, `state-doc-contradictions.md`, `pilot-candidate-shortlist.md`. The memo conflates these into one document; Plan 02 requires them split.
4. **Replace the qualitative `tmp-*.ts` mention with a concrete remediation gate** — e.g., "all `tmp-*.ts` resolved or moved to `scripts/content-audit/_archive/` before Phase 2 begins."
5. **Add explicit corpus counts** (article bundles with non-empty `sources.json`; bundles with linked questions; bundles with unresolved `[SLATECAMP_UI_BLOCK:]`; question count by domain). Plan 02 readiness questions 1–6 are unanswered in the memo.
6. **State the Phase 0 exit-gate verdict per Plan 09 explicitly** — currently the memo trends to a verdict but doesn't write it as the gate language Plan 09 requires.
7. **Quantify "live-AI-free" cost of inaction** — if launch is live-AI-free for 3 / 6 / 12 months, what does the pipeline build look like in each case (mocked-LLM testing only? deferred until launch+N? batch-only via local CLI with manual provider keys outside production)?

---

## 4. Required changes to the plan pack

**P1. Insert `21-launch-posture-reconciliation.md`** — a single decision document that resolves the live-AI-free vs AI-pipeline conflict. Must record: who calls providers (ops only, never runtime), where keys live (CI secret, never `.env.local`), and whether the pipeline is allowed to ship results into production article rows during the live-AI-free period or is restricted to a staging branch.

**P2. Promote Plan 10 (source pack) from planning prose to a buildable spec.** Pick the storage location (recommend `.ai/16_source_packs/` outside the export tree to avoid roundtrip collisions), commit a chunk-schema JSON, and add a `Phase 0.6` to the roadmap: "Build a single source pack (PD 1096 IRR) end-to-end as a feasibility proof before Phase 1." Without this, Phase 0.5's exit gate is unfalsifiable.

**P3. Renumber and re-sequence the roadmap.** Move Phase 5.5 → before Phase 6. Move Phase 8.5 → before Phase 5 (rollback rehearsal must precede first apply). Otherwise the gate language in Plan 08 is contradicted by the phase number ordering in Plan 01.

**P4. Plan 06 (validators) must commit to authoritative prop schemas.** Either (a) source prop schemas from the actual TSX/Zod component definitions via codegen, or (b) explicitly declare component-name-only validation and document the runtime MDX compile pass as the prop-validation backstop. Pick one; the current plan implies (a) without specifying how.

**P5. Plan 11 (question bank) needs a corpus-level artifact layout** distinct from `.ai/15_content_optimization/` (which is state, not planning). Recommend `.ai/content-audit-export/_corpus/` for cross-article registers. Also: define the schema for `question-edits/<id>.json` — currently undefined.

**P6. Plan 12 (cost/budget) must add hard ceilings**, not just measurement dimensions. At minimum: pilot $ ceiling, abort threshold (e.g., > $X per article triggers pause), monthly burn cap, and a "validation failure rate exceeds Y → halt batch" rule with a numeric Y.

**P7. Plan 17 (admin schema migration) needs a "decide vs migrate" worksheet now.** Listing 9 "likely schema gaps" without resolving them means Phase 7 will collide with the no-migration boundary mid-pilot. Either commit to a migration SQL draft as a Phase 1.5 deliverable, or commit to JSONB metadata fields as the long-term home for those 9 attributes.

**P8. Plan 18 (reviewer ops) must commit to numbers**, not questions. Required: per-tier daily review capacity, named reviewer pools (or "TBD: hire by date X"), and explicit decision-authority matrix (only X can approve answer-key changes).

**P9. Plan 19 (rollback drill) must cover three rollback shapes**, not one: single-article restore (already covered), partial-batch restore (10/20 applied), and schema-aware restore (when admin migration introduced new columns).

**P10. Plan 20 (data governance) must gate the pipeline on copyright triage.** A pre-Phase-3 deliverable: per-source-pack copyright classification (public-law / commentary / proprietary), with proprietary excerpts forbidden from provider calls.

**P11. Add `22-kill-switch-and-incident-plan.md`.** What stops the pipeline mid-batch when a regression is detected post-apply? Who is paged? How is errata communicated to learners? This is missing entirely.

**P12. Add `23-professional-liability-and-errata-policy.md`.** Board-exam content has real candidate-impact stakes. Define disclaimer language, errata workflow, and any indemnification posture before any high-risk content is auto-edited.

**P13. Schema-versioning policy.** Replace `"2026-05-05.v1"` with semver (`"1.0.0"`) and add a per-artifact migration plan to Plan 04.

**P14. Reproducibility metadata.** Plan 04's `input_hashes` block must add `source_pack_version`, `prompt_version`, and `model_role_config_hash`. Plan 15 already implies these for run manifests; carry them down to per-artifact level.

---

## 5. What must be proven before Phase 1 implementation

These are the unlock conditions:

1. **Launch-posture decision committed** (P1 above) and recorded in `.ai/01_roadmap/`.
2. **One source pack built end-to-end** (PD 1096 IRR or BP 344 — whichever is highest article-coverage) with chunks, hashes, version label, and reviewer sign-off that extraction quality is "usable." Without this, source-grounding is a slogan.
3. **All 6 Phase 0 audit outputs (Plan 02) exist and are committed**, not just the OpenCode memo.
4. **`tmp-*.ts` files resolved or archived** in `scripts/content-audit/`.
5. **Reviewer pool committed in writing** with at least one licensed-architect subject-matter reviewer named for legal/code domains, OR Phase 8 acceptance explicitly downgraded to "engineering review only" with that limitation acknowledged.
6. **Component prop-schema decision made** (codegen vs MDX-compile-as-backstop) per P4.
7. **Question-edit `<id>.json` schema authored** with at least one fixture.
8. **Cost ceilings committed** per P6 — pilot ceiling, abort threshold, monthly cap.
9. **Roadmap re-sequenced** so rollback rehearsal precedes first apply.
10. **Pilot scoring rubric authored** — for every numeric target in Plan 03 (fact preservation ≥ 0.98, acceptance ≥ 85%), define denominator, sampler, scorer, and adjudication rule.

---

## 6. What should explicitly remain out of scope (and be written as such)

- **No browser-triggered AI execution under any phase.** Plan 07 already forbids this; carry it as a global non-goal in the README.
- **No edits to `original.md` or `linked-questions.json`** under any circumstance — already stated, repeat at the top.
- **No live-corpus apply during the live-AI-free launch period** (pending P1 decision). Apply to a staging branch / shadow rows only.
- **No automated answer-key changes**, even with reviewer approval, until rollback drill (P9) is complete and a single-article rollback has been demonstrated to round-trip cleanly.
- **No Phase 9 batch scale-up planning** in this plan pack at all. Move it to a successor pack triggered only by passing Phase 8.
- **No provider configuration UI in `/admin/ai-audit/`** in this scope. Provider keys remain CI/secret-only.
- **No copyrighted-source ingestion** until Plan 20 produces a per-source-pack copyright classification.
- **No mutation of existing `.ai/14_fact_checking/` and `.ai/15_content_optimization/` historical artifacts.** Treat them as read-only history — the new pipeline writes to its own paths.

---

## Bottom line

The plan pack's *doctrine* (AI proposes / code validates / sources decide / humans approve) is correct and well-articulated. Its *foundation contracts* are not yet writable: the launch posture is unresolved, source packs do not exist as data, the existing roundtrip carries 6 unaddressed debug files, and Phase 0's own deliverables are not yet committed. **Do not start Phase 1 implementation.** Spend the next planning cycle on P1, P2, the source-pack feasibility build, and the Phase 0 deliverable split — then revisit the verdict.
