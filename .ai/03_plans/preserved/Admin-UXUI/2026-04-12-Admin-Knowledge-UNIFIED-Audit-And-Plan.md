# Admin Knowledge — UNIFIED Audit and Implementation Plan

**Merged:** 2026-04-12
**Source A (UX/UI track):** `.ai/plans/Admin-UXUI/2026-04-12-Admin-UXUI-Improvement-Audit-And-Plan.md`
**Source B (Performance/CRUD/Loop track):** `.ai/plans/Admin-UXUI/2026-04-12-Admin-Knowledge-Speed-And-Functionality-Audit-And-Plan.md`
**Status:** Coordination document — not a replacement for the source plans. Sections 7 and 8 contain each source plan verbatim.

---

## 0. Reading Guide

This document unifies two independent audits of the admin knowledge surface. Each source plan is preserved **verbatim** below (Track A in §7, Track B in §8). The new material in §§1–6, 9, 10 is synthesis only: it describes how the two tracks interact, where they touch the same files, and how their PRs must be sequenced to avoid conflict and regression.

**Use this document to:**
- Understand the full story: admin knowledge feels both broken (UX) AND slow (perf). Neither track alone explains the user pain.
- Plan executor work across both tracks without double-editing shared files.
- Sequence PRs in a single engineering timeline instead of two parallel threads.
- Track cross-cutting open questions and verification gates.

**Do NOT use this document to:**
- Override the detailed line-cited guidance inside §7 and §8. When this document's synthesis conflicts with the source plans, the source plans win.
- Skip reading the verbatim tracks. The line citations, severity ratings, and remediation directions live there.

**Reading order for an executor:**
1. §1 (summary) → §3 (shared-files map) → §4 (PR timeline) — 10 minutes
2. The relevant track's detailed sections in §7 or §8 — 30 minutes
3. §9 (verification) and §6 (open questions) before starting work — 5 minutes

**Track identifiers used throughout:**
- **Track A** = UX/UI audit (source: `2026-04-12-Admin-UXUI-Improvement-Audit-And-Plan.md`)
- **Track B** = Performance/CRUD/Loop audit (source: `2026-04-12-Admin-Knowledge-Speed-And-Functionality-Audit-And-Plan.md`)
- **Appendix B** = Track B's Round 2 Follow-up Findings (A.1-A.12 in source B)

---

## 1. Unified Executive Summary

The `/admin/knowledge`, `/admin/knowledge/questions`, `/admin/knowledge/[id]`, and `/admin/knowledge/new` routes have **two independent classes of defect** that compound in production:

**Class 1 — Layout/UX (Track A).** Admin knowledge routes feel broken versus `/dashboard/wiki` because of **nine compounding UX defects collapsing into three root causes**:
1. **Regex miss at `src/app/admin/layout.tsx:40`** — `isFullBleedEditor` regex requires a trailing segment, so index routes silently inherit `PortalLayout`'s `overflow-y-auto px-4 py-4` wrapper, producing a double scrollbar and an unwanted padding gutter.
2. **Five hardcoded viewport-math heights** — `ContentEditorIndex.tsx:287` (`h-[calc(100vh-8rem)]`), `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3`, and — as discovered by Track B Appendix §A.8 — `UnifiedContentEditor.tsx:229` (all `h-[calc(100vh-4rem)]`). Inconsistent magic numbers (`8rem` vs `4rem`) prove the original author was estimating chrome height by eye on different days.
3. **735-line forked `ContentEditorIndex`** — reimplements the wiki two-pane concept without drag-handle resize, localStorage persistence, or collapse polish.

**Class 2 — Performance/Correctness (Track B).** The same routes are also the **two slowest and most fragile routes in the admin portal**, with three confirmed stability bugs and four performance cliffs (plus additional high-impact findings from the Round 2 appendix):
1. **Double questions fetch** — `getContentEditorIndexData` fetches the entire `questions` table twice per render (`content.ts:201-204` and `:226-229`, the second sequential to the first).
2. **`QuestionsTableClient` ghost re-fetch** — effect at `:458-460` depends on `handleNodeSelect`, whose identity churns on every `router.refresh()` because `taxonomyTree` prop identity changes. Every mutation anywhere on the owning page re-fetches the question bank.
3. **`localArticles` mirror-prop race** — `ContentEditorIndex.tsx:144,156-158,259-284` mirrors `articles` into local state, then re-syncs from the effect; the optimistic bulk-delete at 259-284 races the server revalidation. Becomes *actually dangerous* only after cache staleness is introduced, which is why Track B sequences 1.3 (mirror removal) strictly before 2.5 (cache).
4. **Four performance cliffs**: uncached `getArticleFull` (`content.ts:336-348`), four sequential batches in `[id]/page.tsx:24-44`, O(N²) `buildTree` (`content.ts:255-290`), O(A×L) `enrichedArticles` (`content.ts:298-313`).
5. **Round 2 amplifiers (Appendix B)**: 3-sequential-batch `getQuestionsByTopicIds` on every tree click (A.2), 10-second autosave via `window.dispatchEvent` pub/sub (A.3), missing `admin-knowledge` cache tag in `cache-tags.ts` (A.4), slim-select opportunity (A.5), unconditional `router.refresh()` in `UnifiedContentEditor:264` (A.12 — the single most impactful perf compounder).

**The bridge.** Both tracks independently identified the layout chain as broken and the save path as fragile. Track A's fix for `ContentEditorIndex.tsx:287` and Track B's fix for `UnifiedContentEditor.tsx:229` (A.8) are the **same class of bug** (hardcoded viewport math) in different files — both must land together to achieve a clean `h-full` inheritance chain. Track A's Phase 1 structural fixes and Track B's Phase 1/2.2 flattening both edit `src/app/admin/knowledge/[id]/page.tsx` but at different line ranges — they compose in one commit with no merge conflict.

**Net effort.** Merging both tracks into one engineering timeline: **PR 1 ≈ 2 engineering days** (Track A Phase 0+1 + Track B Phase 1.1/1.2/2.1/2.2/2.3/2.4/3.4 + Appendix A.2/A.5 + bridge item A.8); **PR 2a ≈ 1.5 days** (Track A Phase 2 + Track B Phase 1.3/3.2/3.3/A.12/A.3/A.7/optional A.6); **PR 2b ≈ 1 day** (Track B Phase 2.5/2.6 + A.4, gated on 2a in production 7+ days); **PR 3 ≈ 0.5 day** (Track A Phase 3 — AdminTwoPaneShell); **PR 4 ≈ 0.5 day** (unified verification + Track B Phase 3.1 Suspense boundaries).

**Engineering days ≠ calendar days.** The ~5.5 engineering days above compress to a much longer **calendar timeline** because of the mandatory 7-day bake period between PR 2a and PR 2b. Realistic calendar:
- **Day 0:** PR 1 opens, 2 days active work, designer + backend co-review.
- **Day 3-4:** PR 2a opens, 1.5 days active work, behavior-change review.
- **Day 5-11:** PR 2a soak in production (7 days minimum, binding constraint per §3.2 Rule 5).
- **Day 12:** PR 2b opens, 1 day active work, caching-focused review (gated on Q11b sign-off).
- **Day 13-14:** PR 3 (AdminTwoPaneShell) + PR 4 (verification) can run in parallel with PR 2b's review window.
- **Total calendar: ~3 weeks** from first commit to final verification, with active engineering time ~5.5 days.

The 7-day soak is the critical path. If the cache win (PR 2b) is the highest-priority product outcome, the merged sequencing does NOT shorten the delivery date relative to the unmerged path — it just makes the intervening work safer. The merge's benefit is coordination correctness, not calendar acceleration.

**Critical ordering rule (inherited from Track B, promoted to unified plan):** PR 2b MUST NOT merge until PR 2a has been in production for 7+ days. The `localArticles` clobber race (L-2) is latent today but becomes observable — and dangerous — the moment cache staleness is introduced. Shipping cache (2b) before the mirror removal (2a) creates a live production race condition.

---

## 2. Shared Principles and Drivers

This section deduplicates the RALPLAN-DR material from both source plans. For full rationale see §7 (Track A Principles 1–5 + Drivers 1–3) and §8 (Track B Principles 1–5 + Drivers 1–3).

### Unified Principles
1. **Evidence over intuition.** Every finding cites a verified `file:line`. No "feels slow" or "looks off" claims without provenance. _(Track B P1; aligns with Track A's allowlist-over-regex rigor in P4.)_
2. **Correctness before speed.** State-integrity bugs (mirror-prop races, fetch-churn loops) and layout correctness (single scroll owner, `h-full` chain) ship before performance tuning. _(Track B P2 + Track A P3.)_
3. **Parity through proven patterns, not shared code.** `/dashboard/wiki/[slug]` is the benchmark. We inherit patterns (cached primary read, `h-full` chain, single scroll owner); we do NOT reshape wiki itself. _(Track A P1 + Track B P4.)_
4. **Minimum blast radius.** Prefer surgical edits inside existing components (Track B Option B) and admin-local twins (Track A Option C) over rewrites or shared-primitive extractions. The 735-line `ContentEditorIndex` is untouchable wholesale in this pass. _(Track B P3 + Track A Option C rationale.)_
5. **Layouts own heights; pages own content.** `layout.tsx` establishes `h-full` flex chains. Pages never hardcode `calc(100vh - Nrem)`. _(Track A P2.)_
6. **Single scroll container per viewport.** Exactly one ancestor per page is the scroll owner. _(Track A P3.)_
7. **Identity-lock respected.** `SlideToSubmit.tsx`, everything under `src/components/wiki/navigation/**`, and anything in `.ai/rules/identity_preservation_lock.md` is out of scope for every phase. _(Track B P5 + Track A Option C non-negotiable constraint.)_
8. **Explicit allowlists over fragile regexes** for route classification decisions. _(Track A P4.)_
9. **One padding layer per content region.** _(Track A P5.)_

### Unified Decision Drivers
1. **Identity preservation on `/dashboard/wiki`.** `WikiSidebarShell` has a `mounted` SSR gate (line 60) and hardcoded brand literals (lines 84, 89, 101) that pixel diff cannot validate. Blast radius to `src/components/wiki/navigation/**` is unacceptable. _(Track A D1.)_
2. **User-visible latency on `/admin/knowledge*` after any mutation.** Every save/delete currently triggers a full-page server refetch plus a client-side `getQuestionsByTopicIds` re-run plus (per A.12) a `router.refresh()` on every article update. _(Track B D1.)_
3. **Confirmed data-integrity risk.** The `localArticles` mirror pattern can clobber optimistic updates with stale server data; the `selectedArticleIds` Set can outlive the articles it references. _(Track B D2.)_
4. **Executor speed.** PR 1 must be executable in under 2 engineering days by a mid-level engineer using only this unified plan plus the two source plans. _(Track A D2, expanded to both tracks.)_
5. **No regression on sibling admin routes.** `/admin/knowledge/analytics` and `/admin/knowledge/import` are single-column padded pages that must retain their padding. _(Track A D3.)_
6. **Cost of future regressions.** Current fragile patterns (useCallback-inside-useEffect, prop-mirrored-state, uncached detail fetches, fragile regex classification) will cause new bugs as features are added. Fix them once; cheaper than triaging repeatedly. _(Track B D3.)_

### Why Both Tracks Picked "Surgical + Local Twin" Strategies

Both tracks independently rejected a full rewrite of `ContentEditorIndex`. Track B rejected it as Option C (rewrite into `ArticlesView`+`QuestionsView`) because there is no evidence the split itself fixes any confirmed bug. Track A rejected shared-primitive extraction (Option B) because `WikiSidebarShell`'s `mounted` gate and brand literals cannot be tokenized without identity-lock re-verification. The unified plan therefore commits to:
- **Track A Option C:** admin-local `AdminTwoPaneShell` in a new file under `src/app/admin/knowledge/_components/`.
- **Track B Option B:** surgical bugfix + targeted state refactor split across PR 1 / PR 2a / PR 2b.

Together these two strategies produce **zero modifications** to `src/components/wiki/navigation/**`, `src/app/dashboard/wiki/**`, or `src/components/quiz-v2/SlideToSubmit.tsx`. The blast radius is bounded to `src/app/admin/knowledge/**`, `src/components/admin/**`, and four files in `src/lib/actions/admin/` + one file in `src/lib/actions/cache-tags.ts`.

---

## 3. Cross-Cutting Coordination Map

This section is the executor's single reference for which tracks touch which files. Use this before any edit to know whether your change conflicts with a sibling track.

### 3.1 Shared Files Table

| File | Track A edits | Track B edits | PR sequencing | Conflict risk | Notes |
|---|---|---|---|---|---|
| `src/app/admin/layout.tsx` | **Phase 1 edit #1 (line 40)** — replace regex with `FULL_BLEED_KNOWLEDGE_EXACT` set + `FULL_BLEED_KNOWLEDGE_DETAIL` array | none | **PR 1 — Track A only** | None | Track B does not touch this file. |
| `src/app/admin/_components/AdminShell.test.ts` | **Phase 1** — add test fixtures per new allowlist (or extract to `admin-route-config.ts`) | none | **PR 1 — Track A only** | None | |
| `src/components/admin/unified-editor/ContentEditorIndex.tsx` | **Phase 1 edits #2, #3** (lines 287, 706); **Phase 2** spacing normalization (lines 374, 499, 572-668); **Phase 3** replace sidebar with `AdminTwoPaneShell` (delete lines 289-369, wrap in shell) | **Phase 1.3** `localArticles` removal + `pendingArchiveIds` set (lines 142-158, 195-284); **Phase 3.2** `filteredArticles` single-pass (lines 195-225); **Phase 3.4** `updateUrl` stabilization (lines 161-167); **Phase 4.2** URL-as-state (lines 128-154) | **PR 1 + PR 2a + PR 3** | **HIGH** — same file, overlapping but non-identical line ranges | See §3.2 ordering rule #1. |
| `src/app/admin/knowledge/[id]/page.tsx` | **Phase 1 edit #4** (line 47: `h-full flex-col overflow-hidden`) | **Phase 2.2** flatten 4 sequential batches into 2 parallel `Promise.all` (lines 24-44); **Phase 3.1** Suspense boundaries | **PR 1 both tracks** | **LOW** — different line ranges in same file; compose in one commit | Track A touches line 47 (JSX class); Track B touches lines 24-44 (data loader). |
| `src/app/admin/knowledge/new/page.tsx` | **Phase 1 edit #5** (line 43: `h-full flex-col overflow-hidden`) | none | **PR 1 — Track A only** | None | |
| `src/app/admin/knowledge/[id]/loading.tsx` | **Phase 1 edit #6** (line 3: `h-full flex-col overflow-hidden`) | none | **PR 1 — Track A only** | None | |
| `src/components/portal/PortalLayout.tsx` | **Phase 0 verify** (lines 36, 65-76 — do not modify); dependency for Phase 1 regex fix | none | **PR 1 — Track A verify only** | None | |
| `src/components/admin/unified-editor/UnifiedContentEditor.tsx` | **bridge item (A.8)** line 229: `h-full` replacement | **A.12** (PR 2a) `router.refresh()` replacement on line 264; **A.3** (PR 2a) autosave debounce rewrite at lines 193-200; **A.7** (PR 2a) `setIsLocked` try/finally at lines 90-93 | **PR 1 (A.8 only) + PR 2a (everything else)** | **MEDIUM** — same file, different line ranges; PR 1 Track A must land A.8 as a bridge item, PR 2a Track B takes over the rest | A.8 is the explicit UX/perf bridge. PR 1 fixes the hardcoded height; PR 2a rewrites the save path. |
| `src/app/admin/knowledge/_components/AdminTwoPaneShell.tsx` | **Phase 3 create new file** | none | **PR 3** | None | New file — no conflict. Namespaced storage key `admin_knowledge_sidebar_width`. |
| `src/lib/actions/admin/content.ts` | none | **Phase 1.1** merge double-fetch (lines 187-230); **Phase 2.1** wrap `getArticleFull` with `unstable_cache` (lines 336-348); **Phase 2.3** `buildTree` O(N) (lines 255-290); **Phase 2.4** `enrichedArticles` map (lines 298-313); **Phase 2.5** index cache wrap (gated, lines 183-331); **Phase 2.6** view-mode split | **PR 1 + PR 2b** | None — Track A never touches | Track A does not read or write this file. |
| `src/lib/actions/admin/question-queries.ts` | none | **Appendix A.2-PR1** merge 3 sequential batches via FK join (lines 170-278); **Appendix A.5-PR1** slim select (lines 180, 192) | **PR 1 — Track B only** | None — Track A never touches | |
| `src/lib/actions/admin/bulk.ts` | none | **Phase 1.3 / 3.3** return `{succeeded, failed}` per-row reporting (lines 9-49); **Phase 2.5** add `admin-knowledge` tag revalidation; **Phase 4.3** shared `revalidateAdminKnowledge` helper | **PR 2a + PR 2b** | None — Track A never touches | |
| `src/lib/actions/cache-tags.ts` | none | **Appendix A.4** (PR 2b) add `admin_knowledge: 'admin-knowledge'` to `CACHE_TAGS` (lines 1-29) | **PR 2b — Track B only** | None | New key addition, not modification. |
| `src/components/admin/QuestionsTableClient.tsx` | none | **Phase 1.2** extract `fetchQuestionsForNode` module-level helper; remove `handleNodeSelect` from effect deps (lines 420-460, 497) | **PR 1 — Track B only** | None — Track A never touches | |
| `src/components/admin/unified-editor/SaveAllBar.tsx` | none | **Appendix A.6** (PR 2a, optional) parallel article+question save (lines 134-180); **A.10** verification read of lines 200-500 prerequisite | **PR 2a — Track B only** | None — Track A never touches | Unverified items per A.10 must be resolved before PR 2a begins. |
| `src/components/admin/unified-editor/DeleteArticleModal.tsx` | none | Phase 1.3 coordination (delete confirmation path) | **PR 2a — Track B only** | None | |
| `src/app/admin/knowledge/page.tsx` | Phase 1 — verify renders `<ContentEditorIndex />` with no wrapping | **Phase 2.6** may introduce separate loaders | **PR 1 verify + PR 2b Track B** | None | Track A does not modify. |
| `src/app/admin/knowledge/questions/page.tsx` | Phase 1 — verify renders `<ContentEditorIndex defaultViewMode="questions" />` | **Phase 2.6** may introduce separate loader | **PR 1 verify + PR 2b Track B** | None | Track A does not modify. |
| `src/app/admin/knowledge/analytics/page.tsx` | **Phase 1 non-regression check** (must stay padded) | none | **PR 1 — Track A verify only** | None | |
| `src/app/admin/knowledge/import/page.tsx` | **Phase 1 non-regression check** (must stay padded) | none | **PR 1 — Track A verify only** | None | |
| `src/lib/actions/cached-queries.ts` | none | **benchmark only** — Track B Phase 2.1 copies the `createStaticClient` + `unstable_cache` pattern from here | never modified | None | Identity-locked by §7. |
| `src/components/wiki/navigation/**` | **OUT OF SCOPE — do not modify** | **OUT OF SCOPE — do not modify** | never | None | Identity-locked. |
| `src/app/dashboard/wiki/**` | **OUT OF SCOPE — do not modify** | **OUT OF SCOPE — do not modify** (benchmark only) | never | None | Identity-locked. |
| `src/components/quiz-v2/SlideToSubmit.tsx` | **OUT OF SCOPE** | **OUT OF SCOPE** | never | None | `.ai/rules/identity_preservation_lock.md`. |

### 3.2 Ordering Rules

These rules resolve the coordination risks in §3.1. Violating them produces merge conflicts, regression, or production races.

**Rule 1 — `ContentEditorIndex.tsx` edit ordering.**
This file is touched by both tracks in three PRs. The safe ordering is:
- **PR 1:** Track A Phase 1 edits #2 and #3 (lines 287 and 706 — pure structural className changes). Track B may simultaneously add Phase 3.2 (`filteredArticles` single-pass, lines 195-225) and Phase 3.4 (`updateUrl` footgun fix, lines 161-167) **if** they do not share a line with Track A's edits. Grep before committing: `git diff src/components/admin/unified-editor/ContentEditorIndex.tsx` should show at most 4 hunks, all on disjoint line ranges.
- **PR 2a:** Track B Phase 1.3 (`localArticles` removal, lines 142-158, 195-284). This is a behavioral change and must land after PR 1 bakes. Do NOT combine with any Track A edit.
- **PR 3:** Track A Phase 3 (delete lines 289-369, replace with `<AdminTwoPaneShell>`). This is the largest diff in the file; land it last so it does not conflict with PR 2a's state refactor.

**Rule 2 — `UnifiedContentEditor.tsx` edit ordering.**
This file is touched by Track A (bridge item A.8, one line at 229) and Track B (A.3, A.7, A.12, multiple hunks). The safe ordering is:
- **PR 1:** Track A bridge item A.8 only — replace `h-[calc(100vh-4rem)]` at line 229 with `h-full`. Single-line diff. Zero behavioral change.
- **PR 2a:** Track B A.12 first (line 264 `router.refresh()` replacement — HIGHEST impact), then A.3 (lines 193-200 autosave debounce), then A.7 (lines 90-93 try/finally). Per Track B Appendix A.11: "Ship A.12 → A.3 → A.7 → (optionally A.6). A.12 first because it is the highest-impact single change; A.3 second because it is what makes A.12 fire frequently; A.7 third because it protects the updated save flow."

**Rule 3 — `[id]/page.tsx` simultaneous edit.**
Track A edits line 47 (JSX className). Track B edits lines 24-44 (data loader `Promise.all` flattening). These line ranges are disjoint. Both edits land in PR 1 in the same commit. Suspense boundaries (Track B Phase 3.1) defer to PR 3 or later — after the parallel batches (2.2) are in place, Suspense becomes a pure enhancement.

**Rule 4 — Regex replacement precedes height chain fixes.**
Track A Phase 1 edit #1 (`src/app/admin/layout.tsx:40` regex allowlist) MUST land before edits #2, #4, #5, #6 (the `h-[calc(...)]` → `h-full` replacements). Rationale: until the regex allowlist includes `/admin/knowledge` and `/admin/knowledge/questions`, index routes still receive `PortalLayout`'s `overflow-y-auto px-4 py-4` wrapper, and `h-full` on a child inside an `overflow-y-auto` parent with `px-4 py-4` padding resolves to the parent's content box — which is `100vh minus (topbar + py-4*2)`, not `100vh minus topbar`. The result would be a new 32px gap at the bottom of every full-bleed route. Landing all six edits in one commit (as Track A Phase 1 specifies) avoids this, but if split across commits the regex must land first.

**Rule 5 — `localArticles` removal (1.3) strictly before cache (2.5).**
Quoted verbatim from Track B RALPLAN-DR: "PR 2b must not merge until PR 2a is in production. Rationale: L-2 (the optimistic-vs-server clobber race) becomes observable **only** when the server response becomes stale relative to the client — which happens *only* once caching is introduced. Shipping 2.5 before 1.3 would create a live clobber race in production. Enforcing '2a in prod first, then 2b merges' removes the footgun." This is the single strongest ordering constraint in the entire plan and is elevated to a hard gate in §4.

**Rule 6 — RLS audit gates caching work.**
Track B §9 Q11a gates PR 1 Phase 2.1 (`getArticleFull` cache wrap). Track B §9 Q11b gates PR 2b Phase 2.5 (`getContentEditorIndexData` cache wrap). Neither PR 1 nor PR 2b may begin their respective caching items until the RLS audit confirms `createStaticClient()` is safe. If Q11a is unresolved when PR 1 is otherwise ready, ship PR 1 without Phase 2.1 — the other six items still land, and 2.1 follows in a separate commit once the audit clears.

**Rule 7 — A.2/A.5 pre-flight grep gates.**
Per Track B Appendix A.11 "New PR 1 prerequisites": before PR 1 begins, grep `QuestionsTableClient.tsx` and `QuestionsPanel.tsx` to confirm list rows do NOT consume `options`/`rationale`/`code_citation` (A.5-PR1 prerequisite); and verify `uniqueTopics` in `getQuestionsByTopicIds` can be derived from the input `topicIds` parameter (A.2-PR1 prerequisite). If either grep fails, defer that specific item to PR 1.5 or PR 2a.

**Rule 8 — Non-regression grep gate (Track B, promoted to unified).**
Before any PR 1 merge: run `grep -rn "getArticleFull\|getContentEditorIndexData\|QuestionsTableClient" src/app/dashboard src/components/wiki`. Expect zero hits. If any hit appears, wiki has a hidden dependency on admin code and the scope-containment claim is false — stop and reassess.

---

## 4. Unified PR Sequencing Timeline

This section merges Track A's 3-PR sequence and Track B's 4-PR sequence into a **single 5-PR pipeline**. Each PR has a size budget, gate conditions, and a cross-track manifest.

### U1 — Unified PR 1: Structural Fixes + Stability Bugs + Fastest Perf Wins
**Size:** ~2 engineering days
**Track A contribution:** Phase 0 (pre-flight, 10 min) + Phase 1 (6 file edits, 90 min). That is: regex allowlist in `admin/layout.tsx:40`, five `h-[calc(...)]` → `h-full` replacements, remove `p-4 bg-surface-light` gutter at `ContentEditorIndex.tsx:706`. Test fixtures updated in `AdminShell.test.ts`.
**Track B contribution:** Phase 1.1 (merge double fetch in `content.ts:187-230`), Phase 1.2 (`fetchQuestionsForNode` helper in `QuestionsTableClient.tsx`), Phase 2.1 (`getArticleFull` cache — gated on Q11a), Phase 2.2 (flatten `[id]/page.tsx:24-44` batches), Phase 2.3 (`buildTree` O(N)), Phase 2.4 (`enrichedArticles` map), Phase 3.4 (`updateUrl` footgun).
**Appendix B contribution:** A.2-PR1 (merge 3-batch `getQuestionsByTopicIds` — gated on uniqueTopics grep), A.5-PR1 (slim select — gated on UI field grep), A.8 (bridge item: `UnifiedContentEditor.tsx:229` → `h-full`).
**Gates (must all pass before merge):**
- §9 Q11a resolved (RLS on `wiki_articles` uniform across admin roles) — gates Phase 2.1 only; PR 1 ships without 2.1 if unresolved.
- Pre-flight grep for A.2-PR1 (`uniqueTopics` derivation from input) — gates A.2 only.
- Pre-flight grep for A.5-PR1 (no list-row consumption of `options`/`rationale`/`code_citation`) — gates A.5 only.
- Non-regression grep gate (no wiki imports of admin code) — gates entire PR.
- `AdminShell.test.ts` fixtures pass for all 9 enumerated routes.
- Manual browser smoke check of all 8 routes in Track A §7 Phase 4 checklist (§9 below).
**Files touched:**
- `src/app/admin/layout.tsx` (Track A only)
- `src/app/admin/_components/AdminShell.test.ts` (Track A only)
- `src/components/admin/unified-editor/ContentEditorIndex.tsx` (Track A Phase 1 structural + Track B Phase 3.4 `updateUrl` — disjoint line ranges)
- `src/components/admin/unified-editor/UnifiedContentEditor.tsx` (Track A bridge item A.8 only — one line)
- `src/app/admin/knowledge/[id]/page.tsx` (Track A line 47 + Track B lines 24-44 — disjoint line ranges)
- `src/app/admin/knowledge/new/page.tsx` (Track A only)
- `src/app/admin/knowledge/[id]/loading.tsx` (Track A only)
- `src/lib/actions/admin/content.ts` (Track B only: 1.1, 2.1, 2.3, 2.4)
- `src/lib/actions/admin/question-queries.ts` (Track B Appendix A.2, A.5 only)
- `src/components/admin/QuestionsTableClient.tsx` (Track B Phase 1.2 only)
**Commit trailers (per project `commit_protocol`):**
- `Constraint: WikiSidebarShell is identity-locked — admin must not import or refactor`
- `Constraint: /admin/knowledge/analytics and /admin/knowledge/import must retain PortalLayout padding`
- `Constraint: getArticleFull cache wrap uses createStaticClient, not createClient — cross-user leak risk`
- `Rejected: Shared TwoPaneShell extraction | cannot validate hydration timing via pixel diff`
- `Rejected: Route-level src/app/admin/knowledge/layout.tsx | would clip padded sibling routes`
- `Confidence: high`
- `Scope-risk: narrow`
- `Directive: AdminTwoPaneShell deferred to PR 3 — do not anticipate in this PR`
- `Not-tested: RLS audit for Q11b (deferred to PR 2b)`

### U2a — Unified PR 2a: Behavior Changes (Stability + Spacing)
**Size:** ~1.5 engineering days
**Gate:** U1 merged AND baked in production for at least 3 days with no rollback.
**Track A contribution:** Phase 2 — spacing normalization in `ContentEditorIndex.tsx` (toolbar `px-5 py-3`, stats `px-5 py-2`, rows `px-5 py-2.5`, sidebar root verify).
**Track B contribution:** Phase 1.3 (`localArticles` removal + `pendingArchiveIds` set), Phase 3.3 (per-row bulk failure reporting — bundled with 1.3 per Track B guidance).
**Appendix B contribution (ordered per A.11 sequencing rule):** A.12 FIRST (replace `router.refresh()` in `UnifiedContentEditor:264` with `revalidateTag('article:${id}')`), then A.3 (autosave debounce + drop `window.dispatchEvent`), then A.7 (`setIsLocked` try/finally). A.6 (parallel article+question save) optional — defer if tight.
**Gates (must all pass before merge):**
- U1 in production for 3+ days.
- §9 Q10 resolved (un-archive scope) — RESOLVED in Track B §7 1.3: out-of-scope for 2a, `pendingArchiveIds` one-way only.
- §9 Q6 resolved (`UnifiedContentEditor` state shape) — RESOLVED in Track B Appendix A.1: no mirror-prop in `UnifiedContentEditor`, Phase 1.3 is admin-local to `ContentEditorIndex.tsx` only.
- §9 Q4 resolved (`QuestionEditor` save path) — RESOLVED in Track B Appendix A.1: save flows through `SaveAllBar`, no direct `router.refresh()` there. Downgraded to informational.
- Appendix A.10 open items resolved OR explicitly deferred with rationale (especially `SaveAllBar.tsx:200-500`, `DirtyStateProvider` read).
- `USE_PENDING_ARCHIVE_SET` rollback flag wired (Track B §7 1.3 rollback plan).
**Files touched:**
- `src/components/admin/unified-editor/ContentEditorIndex.tsx` (Track A Phase 2 spacing + Track B Phase 1.3 state refactor — different line ranges)
- `src/components/admin/unified-editor/UnifiedContentEditor.tsx` (Track B A.12, A.3, A.7)
- `src/components/admin/unified-editor/SaveAllBar.tsx` (Track B A.6 optional)
- `src/lib/actions/admin/bulk.ts` (Track B Phase 3.3 return shape)
- `src/components/admin/unified-editor/DeleteArticleModal.tsx` (Track B Phase 1.3 coordination)
**Commit trailers:**
- `Constraint: localArticles removal must ship before 2.5 caching — L-2 clobber race gate`
- `Constraint: A.12 router.refresh() replacement ships FIRST in this PR per Appendix A.11 sequencing`
- `Rejected: Unconditional revalidatePath on save | loses Suspense streaming granularity`
- `Directive: Do not remove USE_PENDING_ARCHIVE_SET flag until PR 2b has baked 7+ days in production`
- `Directive: pendingArchiveIds is strictly one-way (archive only) — un-archive requires symmetric pendingUnarchiveIds follow-up`
- `Confidence: high` (A.12, 1.3, 3.3), `medium` (A.3, A.7)
- `Scope-risk: moderate`
- `Not-tested: Multi-tab concurrent archive race (single-tab verified)`

### U2b — Unified PR 2b: Caching + View-Mode Split
**Size:** ~1 engineering day
**Gate (HARD):** U2a in production for **7+ days** with zero rollback triggered. This gate is non-negotiable per Track B RALPLAN-DR and Rule 5 in §3.2.
**Track A contribution:** None.
**Track B contribution:** Phase 2.5 (`admin-knowledge` cache wrap — per chosen Path A/B/C), Phase 2.6 (view-mode split for `getContentEditorIndexData`).
**Appendix B contribution:** A.4 (add `admin_knowledge: 'admin-knowledge'` to `cache-tags.ts` and wire into every admin mutation — bundled with 2.5).
**Gates (must all pass before merge):**
- U2a in production 7+ days.
- §9 Q11b resolved (RLS on `wiki_articles`, `questions`, `taxonomy_tree`, `wiki_article_taxonomy` uniform across admin roles) — determines Path A vs Path B vs Path C.
- Path decision documented with stakeholder sign-off (Product + Security).
- Path A only: confirmation that `createStaticClient()` query plan reads the same columns RLS would permit.
- Path B: React 19 `cache()` benchmark shows measurable per-request dedup win.
- Path C: hybrid module boundaries documented in `src/lib/actions/admin/cached-queries.ts`.
**Files touched:**
- `src/lib/actions/admin/content.ts` (Track B Phase 2.5, 2.6)
- `src/lib/actions/admin/bulk.ts` (Track B A.4 mutation wiring)
- `src/lib/actions/cache-tags.ts` (Track B A.4 new tag)
- New: `src/lib/actions/admin/cached-queries.ts` (Track B Phase 4.1, if Path A or C chosen)
- `src/app/admin/knowledge/page.tsx` (Track B Phase 2.6 may switch loader)
- `src/app/admin/knowledge/questions/page.tsx` (Track B Phase 2.6 may switch loader)
**Commit trailers:**
- `Constraint: 2b cannot merge until 2a has been in production 7+ days — L-2 clobber race`
- `Constraint: RLS audit Q11b must confirm uniform reads before Path A selection`
- `Rejected: Global unstable_cache on authenticated-client query | cross-user data leak risk`
- `Directive: Every new admin mutation must fire revalidateTag(CACHE_TAGS.admin_knowledge, 'max')`
- `Confidence: high` (if Path A selected with audit), `medium` (Path B), `medium` (Path C)
- `Scope-risk: moderate`

### U3 — Unified PR 3: AdminTwoPaneShell + Interaction Parity
**Size:** ~0.5 engineering day (4 hours per Track A Phase 3)
**Gate:** Can ship in parallel with U2a OR after U2b. Does not block or gate on anything in Track B. Must ship AFTER U1 (depends on `flex h-full w-full overflow-hidden` parent from Phase 1 outcome).
**Track A contribution:** Phase 3 — create `src/app/admin/knowledge/_components/AdminTwoPaneShell.tsx` (admin-local twin of `WikiSidebarShell` with `WIDTH_KEY='admin_knowledge_sidebar_width'`, `MIN_W=180`, `MAX_W=480`, `DEFAULT_W=280`), delete `ContentEditorIndex.tsx` lines 289-369 (inline sidebar), delete line 139 `sidebarCollapsed` state, delete lines 376-383 toolbar collapse button, wrap two-pane with `<AdminTwoPaneShell sidebar={<TreeSidebar />}>{content}</AdminTwoPaneShell>`.
**Explicitly NOT created:** `src/app/admin/knowledge/layout.tsx` — per Track A §7 Phase 3 "Files NOT to create" guidance, this would clip analytics and import siblings.
**Track B contribution:** None.
**Files touched:**
- New: `src/app/admin/knowledge/_components/AdminTwoPaneShell.tsx`
- `src/components/admin/unified-editor/ContentEditorIndex.tsx` (large delete of 289-369 + re-wrap)
**Files explicitly NOT touched:**
- `src/components/wiki/navigation/WikiSidebarShell.tsx` — identity-locked
- `src/components/wiki/navigation/WikiLayoutContent.tsx` — identity-locked
- `src/components/wiki/navigation/WikiContentShell.tsx` — identity-locked
- `src/app/dashboard/wiki/**` — identity-locked
**Commit trailers:**
- `Constraint: WikiSidebarShell is identity-locked — admin must not import or extract`
- `Rejected: Shared TwoPaneShell primitive | rule-of-three not met; identity-lock blocks shared extraction`
- `Directive: AdminTwoPaneShell storage key 'admin_knowledge_sidebar_width' must NOT collide with 'wiki_sidebar_width'`
- `Confidence: medium` (hydration timing matters)
- `Scope-risk: narrow`
- `Not-tested: drag velocity on low-end hardware`

### U4 — Unified PR 4: Full Verification Pass
**Size:** ~0.5 engineering day (~1 hour active, plus monitoring observation)
**Gate:** All prior PRs merged AND U2b baked 3+ days.
**Track A contribution:** Phase 4 verification checklist (§7 Phase 4 and §9).
**Track B contribution:** Phase 4.2 URL-as-state refactor (optional, low-priority), Phase 4.3 `revalidateAdminKnowledge` shared helper.
**Tasks:**
- Full 8-route smoke check from Track A §9.
- DevTools scroll-owner inspection on all full-bleed routes.
- Admin sidebar drag + persistence + collapse test.
- Wiki sidebar regression test (must be unchanged since no wiki file was modified).
- `bun run lint`, `bun run type-check`, `bun test src/app/admin/_components/AdminShell.test.ts`.
- `gitnexus_detect_changes({scope: "all"})`.
- `gitnexus_impact({target: "AdminShell"})` and `gitnexus_impact({target: "ContentEditorIndex"})` — expect no d=1 CRITICAL/HIGH.
- Production telemetry review: confirm admin-knowledge latency p95 dropped, cache hit rate on `admin-knowledge` tag trending upward, no new errors in `SaveAllBar` or `UnifiedContentEditor` save paths.
**Commit trailers (if any cleanup commits land):**
- `Confidence: high`
- `Scope-risk: narrow`

### Visual Timeline (Weeks)

```
Week 1: U1 merge (2 days) → U1 bake (3 days) → start U2a
Week 2: U2a merge (1.5 days) → U2a bake begins (7 days, soak period) — U3 may land in parallel
Week 3: U2a soak continues → U3 merge + verification (0.5 day)
Week 4: U2a soak complete → U2b merge (1 day) → U2b bake (3 days)
Week 5: U4 verification pass (0.5 day) → cleanup + telemetry review
```

Total calendar: ~4-5 weeks including all bake periods. Total engineering-days: ~5.5.

---

## 5. Unified Fastest Wins

This is the merged "fastest wins" list from both tracks. All items ship in **U1 (PR 1)** unless noted. Ordered by impact × confidence × low-risk, following Track B Appendix A.11 methodology and extended with Track A Phase 1 items.

1. **Regex allowlist replacement** (Track A Phase 1 edit #1). Single file, single regex → allowlist swap. Unblocks every other Phase 1 edit. Verification: `/admin/knowledge` inspect reveals single scroll container, no outer padding gutter.
2. **`ContentEditorIndex.tsx:287` structural fix** (Track A Phase 1 edit #2). One-line change, `h-[calc(100vh-8rem)]` → `h-full w-full overflow-hidden`.
3. **Remove `p-4 bg-surface-light` gutter at `ContentEditorIndex.tsx:706`** (Track A Phase 1 edit #3). One-line change, `QuestionsTableClient` sits flush with its container.
4. **Three `h-[calc(100vh-4rem)]` → `h-full` replacements** (Track A Phase 1 edits #4, #5, #6): `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3`. Three one-line changes.
5. **Bridge item A.8** (Track B Appendix, PR 1): `UnifiedContentEditor.tsx:229` → `h-full`. One-line change; the fifth hardcoded-height instance not listed in Track A's original enumeration.
6. **Merge the double-questions fetch (1.1)** (Track B Phase 1.1). One function, ~15 lines changed, halves the admin-knowledge data payload. No UI change, no state change, no risk. Verification: open Chrome DevTools Network tab, reload `/admin/knowledge`, filter for `questions` — expect exactly one Supabase fetch to the `questions` table, not two.
7. **Stop `QuestionsTableClient` re-fetching on parent re-render (1.2)** (Track B Phase 1.2). Extract `fetchQuestionsForNode` shared helper; effect deps become `[activeNodeId, debouncedSearchQuery]`. Eliminates a ghost fetch on every mutation in the owning page. Verification: add dev-only `console.debug('[QuestionsTable] fetch', ...)` log; save an article via the editor; confirm zero new log entries appear.
8. **A.2-PR1 — Merge `getQuestionsByTopicIds` 3-batch pattern** (Track B Appendix A.2). Largest latency win in the appendix. Every taxonomy-tree click benefits. Gated on pre-flight grep (Rule 7 in §3.2).
9. **`enrichedArticles` map lookup (2.4)** (Track B Phase 2.4). Five-line change from `.find` to `Map.get` with a map prebuild. No behavior change.
10. **`buildTree` single-pass (2.3)** (Track B Phase 2.3). Localized to one function; no external behavior change.
11. **A.5-PR1 — Slim `getQuestionsByTopicIds` select list** (Track B Appendix A.5). Drop `options`/`rationale`/`code_citation` from list-view fetch. Gated on pre-flight grep (Rule 7).
12. **Cache `getArticleFull` (2.1) — gated on §9 Q11a RLS audit** (Track B Phase 2.1). Wrap with `createStaticClient()` + `unstable_cache`. Immediate detail-page speedup once RLS verification confirms safety. If Q11a blocks, ship the other items without it.
13. **Flatten detail page batches (2.2)** (Track B Phase 2.2). No caching dependency; pure parallelization gain in `[id]/page.tsx:24-44`.
14. **Fix latent `updateUrl` footgun (3.4)** (Track B Phase 3.4). Drop `searchParams` from the `useCallback` deps.

**Not in Fastest Wins (deferred):**
- Track B Phase 1.3 (`localArticles` removal) — behavior change, ships in U2a.
- Track B Phase 2.5 (`getContentEditorIndexData` cache) — ships in U2b only after U2a bakes.
- Track B Appendix A.12 (`router.refresh()` replacement) — behavior change, ships in U2a.
- Track A Phase 2 (spacing normalization) — cosmetic, ships in U2a.
- Track A Phase 3 (AdminTwoPaneShell) — largest diff, ships in U3.

**Non-regression grep gate (required before U1 merge):**
```bash
grep -rn "getArticleFull\|getContentEditorIndexData\|QuestionsTableClient" src/app/dashboard src/components/wiki
```
Expect zero hits. If any hit appears, wiki has a hidden dependency on admin code — stop and reassess.

---

## 6. Unified Open Questions and Prerequisites

Consolidates Track A verification items, Track B §9 Q1-Q12, and Track B Appendix A.10 unverified items. Items marked RESOLVED were resolved in source documents and are carried forward for traceability.

### Blocking U1 (PR 1)
- **Q11a — RLS on `wiki_articles`** (from Track B §9 Q11a). Does RLS permit uniform reads across all admin roles for the columns selected by `getArticleFull`? Query Supabase policies on `wiki_articles`; if every admin role (`admin`, `editor`, `content_manager`, `owner`) receives identical row data for the same `article_id`, Phase 2.1's `createStaticClient()` + `unstable_cache` wrap is safe. If per-author or conditional, Phase 2.1 is blocked — ship U1 without 2.1. **Must be resolved before Phase 2.1 begins.**
- **A.2-PR1 prerequisite** (Track B Appendix A.11 "New PR 1 prerequisites"): verify `uniqueTopics` in `getQuestionsByTopicIds` can be derived from the input `topicIds` parameter, not from batch 1's result. Grep-level check; blocks A.2-PR1 only.
- **A.5-PR1 prerequisite** (Track B Appendix A.11): verify `QuestionsTableClient` and `QuestionsPanel` list-view row rendering does NOT consume `options`/`rationale`/`code_citation` fields. Grep-level check; blocks A.5-PR1 only.
- **Phase 0 pre-flight** (Track A §7 Phase 0): confirm `AdminShell` → `PortalLayout` → `<main>` chain reaches the viewport. VERIFIED during Track A audit; no additional work.
- **Test-fixture guidance** (Track A §7 Phase 1): before editing, read `src/app/admin/_components/AdminShell.test.ts` to learn its current structure. If it tests the regex via string fixtures, add fixtures asserting expected `noPadding` for the 9 enumerated paths.

### Blocking U2a (PR 2a)
- **Q4 — `QuestionEditor` save path** — **RESOLVED** (Track B Appendix A.1). Save flows through `SaveAllBar` / `UnifiedContentEditor`, not direct `router.refresh()`. Downgraded to informational. No longer blocking.
- **Q6 — `UnifiedContentEditor` mirror-prop pattern** — **RESOLVED** (Track B Appendix A.1). No mirror pattern exists in `UnifiedContentEditor`. Phase 1.3 is admin-local to `ContentEditorIndex.tsx` only.
- **Q10 — un-archive flow scope** — **RESOLVED** (Track B §7 1.3). Out of scope for PR 2a; `pendingArchiveIds` strictly one-way. If un-archive exists, file a follow-up for a symmetric `pendingUnarchiveIds` set.
- **A.10 open items** (Track B Appendix A.10) — resolve before PR 2a begins:
  - `SaveAllBar.tsx` lines 200-500 — does save loop use `Promise.all`? Does every error path reset `isSaving`? Is `conflictWarning` wired? Is `pendingSaveRef` used?
  - `DirtyStateProvider` — does `questionsDirty` live in a Map (mutable) or Set (safer)?
  - `content.ts` lines 350-end — `updateArticleFull`, `saveArticleFull`, `deleteArticle` for cache-tag invalidation enumeration.
  - `next.config.*` — `experimental.reactCompiler` enabled? `staleTimes` tuned?
- **USE_PENDING_ARCHIVE_SET rollback flag** wired per Track B §7 1.3 rollback plan before merging the mirror removal.

### Blocking U2b (PR 2b)
- **Q11b — RLS uniformity across 4 tables** (Track B §9 Q11b). Does admin RLS permit uniform reads across all admin users on `wiki_articles`, `questions`, `taxonomy_tree`, `wiki_article_taxonomy`? Strictly more demanding than Q11a because `questions` and `wiki_article_taxonomy` are more likely to have author/owner-scoped RLS. Result determines Path A (full cache) / Path B (React `cache()`) / Path C (hybrid). Must be resolved before Phase 2.5 work begins.
- **Path A/B/C decision** documented with Product + Security sign-off.
- **`supabase/migrations/**`** — not read in Track B Appendix A.10. Required for Q11a and Q11b resolution.
- **Target staleness window** (Track B §9 Q9): Phase 2.5 proposes 300s. If editors need to see other editors' changes immediately, shrinks to 0 (tag-only). Product decision required.

### Non-blocking / informational
- **Q1** — admin-knowledge cache story parallel work. Verify no parallel branches introduce one before U2b begins.
- **Q2** — whether `revalidateTag('wiki','max')` is preserved when `admin-knowledge` lands. Assumption: keep both; wiki benchmark uses `['wiki','taxonomy']`; both should fire.
- **Q3** — production question-table row count scale check. Fix still correct regardless.
- **Q5** — existing `loading.tsx` under `src/app/admin/knowledge/` — RESOLVED out of scope for perf audit (handled by Track A Phase 1 edit #6).
- **Q7** — other admin routes importing `ContentEditorIndex`. Grep check.
- **Q8** — could `taxonomyTree` be memoised via React 19 `cache()` as a cheaper alternative to Phase 1.2. Explored; Phase 1.2's module-level helper is more robust. Informational.
- **Q12** — (Track B §9 says "twelve" but only 11 are explicitly enumerated in source; this line is a numbering note, not a missing question).
- **A.9 — TaxonomyTree memoization** — informational only; Critic round 2 cautions that the memoization claim is second-hand. Resolve by direct read in a follow-up before invalidating first-pass tree render-cost concerns.

### Verification prerequisites (both tracks)
- `next.config` must NOT set `trailingSlash: true` (Track A §7 Phase 1 trailing-slash note).
- Enumerate all current `/admin/knowledge/**` routes via `ls src/app/admin/knowledge -R` and cross-check each against Phase 1 allowlist (Track A §7 Phase 1 risk item).
- Verify `gitnexus_impact({target: "AdminShell"})` and `gitnexus_impact({target: "ContentEditorIndex"})` show no d=1 CRITICAL/HIGH risk before merging U1 and U3.

---

## 7. Track A — UX/UI Audit (VERBATIM)

> **Provenance:** The following content is copied verbatim from `.ai/plans/Admin-UXUI/2026-04-12-Admin-UXUI-Improvement-Audit-And-Plan.md` (443 lines). Do not edit this section; edit the source file and regenerate this document. Line citations and file paths are preserved as-is.

# RALPLAN-DR Summary

**Mode:** SHORT — structural bug fix + bounded refactor. Pre-mortem deferred; Phase 1 is low-risk.

**Principles**
1. **Parity through proven patterns, not shared code.** The wiki shell works; prefer copying its technique over refactoring wiki itself. Accept duplication when identity preservation outranks DRY.
2. **Layouts own heights; pages own content.** `layout.tsx` establishes `h-full` flex chains. Pages never hardcode `calc(100vh - Nrem)`.
3. **Single scroll container per viewport.** Exactly one ancestor per page is the scroll owner.
4. **Explicit allowlists over fragile regexes** for route classification decisions.
5. **One padding layer per content region.**

**Decision Drivers**
1. **Identity preservation on `/dashboard/wiki`.** `WikiSidebarShell` has a `mounted` SSR gate (line 60) and hardcoded brand literals (lines 84, 89, 101) that pixel diff cannot validate. Blast radius to `src/components/wiki/navigation/**` is unacceptable.
2. **Executor speed.** Phase 1 must land in under 90 minutes by a mid-level engineer using only this plan.
3. **No regression on sibling admin routes.** `/admin/knowledge/analytics` and `/admin/knowledge/import` are single-column padded pages that must retain their padding.

**Viable Options (Refactor Strategy)**

- **Option A — Reuse `WikiLayoutContent` directly in admin.** Pros: zero new abstraction, instant parity. Cons: forces wiki providers (`WikiDisciplineProvider`, `WikiNavigationProvider`) into admin domain; directional coupling admin → wiki; polluting admin with wiki vocabulary. **INVALIDATED** by Driver 1.
- **Option B — Extract a shared `TwoPaneShell` primitive used by both wiki and admin.** Pros: DRY. Cons: requires refactoring `WikiSidebarShell` (identity-critical); `mounted` gate + hardcoded `bg-camp-cobalt` literals cannot be tokenized without altering wiki's visual fingerprint; pixel-diff cannot validate hydration timing. **INVALIDATED** by Driver 1.
- **Option C — Patch admin locally only; accept duplication with wiki.** Pros: zero wiki blast radius; narrow PR scope; respects rule-of-three (only 2 callers). Cons: 60-80 lines of resize/persist logic duplicated; future extraction possible after third caller appears. **RECOMMENDED.**

Final recommendation argued in § 8.

---

# Admin UX/UI Improvement Audit and Implementation Plan

## 1. Executive Summary

The `/admin/knowledge`, `/admin/knowledge/questions`, and `/admin/knowledge/[id]` routes feel broken versus `/dashboard/wiki` because of **nine compounding defects** collapsing into **three root causes**:

1. **Regex miss in `src/app/admin/layout.tsx:40`** — `isFullBleedEditor` regex requires a trailing segment, so index routes silently receive `PortalLayout`'s `overflow-y-auto px-4 py-4` wrapper, creating an outer scroll container and unwanted padding gutter.
2. **Hardcoded viewport-math heights** across four files (`ContentEditorIndex.tsx:287`, `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3`) replace the wiki's clean `h-full` + `flex-1` inheritance chain with brittle `calc(100vh-Nrem)` compensation hacks using inconsistent magic numbers (`8rem` and `4rem`).
3. **735-line forked `ContentEditorIndex`** — reimplements the wiki two-pane concept without drag-handle resize, localStorage persistence, or collapse polish.

The highest-leverage fix is Phase 1 (~90 min): replace the regex with an explicit allowlist that INCLUDES index routes and EXCLUDES `/admin/knowledge/analytics` + `/admin/knowledge/import`, then replace all four `calc(100vh-Nrem)` instances with `h-full` inheritance, and drop the `p-4 bg-surface-light` wrapper on the questions view. Phase 2 normalizes spacing. Phase 3 introduces an **admin-local** `AdminTwoPaneShell` (NOT a wiki refactor) that copies the `WikiSidebarShell` technique byte-for-byte into admin-scoped code. **`/dashboard/wiki` is not touched in any phase.** Total effort: ~1 engineering day.

## 2. Scope Audited

- `src/app/dashboard/wiki/layout.tsx`
- `src/app/dashboard/wiki/[slug]/page.tsx`
- `src/components/wiki/navigation/WikiLayoutContent.tsx`
- `src/components/wiki/navigation/WikiContentShell.tsx`
- `src/components/wiki/navigation/WikiSidebarShell.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/_components/AdminShell.tsx`
- `src/app/admin/_components/AdminShell.test.ts`
- `src/app/admin/knowledge/page.tsx`
- `src/app/admin/knowledge/questions/page.tsx`
- `src/app/admin/knowledge/[id]/page.tsx`
- `src/app/admin/knowledge/[id]/loading.tsx`
- `src/app/admin/knowledge/new/page.tsx`
- `src/app/admin/knowledge/analytics/page.tsx` (padded — verify non-regression)
- `src/app/admin/knowledge/import/page.tsx` (padded — verify non-regression)
- `src/app/admin/knowledge/_components/ArticleDetailClient.tsx`
- `src/components/admin/unified-editor/ContentEditorIndex.tsx`
- `src/components/portal/PortalLayout.tsx`

## 3. Reference Behavior — Why `/dashboard/wiki` Works

1. **`src/app/dashboard/wiki/layout.tsx:7`** establishes `h-full w-full overflow-hidden` — claims the full height handed down by `PortalLayout` main. Dashboard routing passes through the dashboard shell, whose portal main cleanly stretches because no intermediate element strips the height.
2. **`WikiLayoutContent`** wraps in `WikiDisciplineProvider` + `WikiNavigationProvider`, then renders `flex flex-col h-full w-full overflow-hidden` → `flex flex-1 min-h-0`. The `min-h-0` lets flex children shrink below content height — without it, lists would overflow the viewport.
3. **`WikiSidebarShell` (identity-locked, do not touch)** implements the resizable two-pane primitive: `MIN_W=180`, `MAX_W=480`, `DEFAULT_W=256`, with localStorage key `wiki_sidebar_width`, a drag handle implemented via `onMouseDown` + window mouse listeners (line 33), a `mounted` SSR gate at line 60, and a discrete collapse button. Hardcoded `bg-camp-cobalt` drag-handle color at line 84.
4. **`WikiContentShell.tsx:139`** renders `flex-1 min-w-0 flex flex-col h-full overflow-hidden`.
5. **`[slug]/page.tsx:92-194`** adds ONE padding layer (`max-w-4xl mx-auto px-8 py-12`) at the article content; `main#wiki-center-pane` owns scroll via `overflow-y-auto`.

**Summary:** every flex layer has explicit `min-h-0` / `min-w-0`; only one scroll container per viewport; exactly ONE padding layer.

## 4. Admin Route Findings

### `/admin/knowledge`

**4.1 — Regex miss on index routes** — Severity: **CRITICAL**
- **Symptom:** Index route inherits `PortalLayout`'s `overflow-y-auto px-4 py-4`, producing a double scrollbar and unwanted gutter.
- **User impact:** Mouse wheel fights the outer scroller; `ContentEditorIndex`'s `calc(100vh-8rem)` math is off by the unexpected `py-4`; clipped content.
- **Technical cause:** `src/app/admin/layout.tsx:40` regex `/^\/admin\/knowledge(\/questions)?\/[^/]+$/` requires a trailing segment (`\/[^/]+$`), so `/admin/knowledge` and `/admin/knowledge/questions` never match.
- **Exact file:** `src/app/admin/layout.tsx`
- **Exact component:** `AdminLayout` (passes `noPadding` to `AdminShell`)
- **Recommended fix:** Replace regex with an explicit allowlist + negative-lookahead detail regexes. See § 7 Phase 1 for exact code.

**4.2 — No route-level `layout.tsx` for `/admin/knowledge`** — Severity: **HIGH**
- **Symptom:** Every page under `/admin/knowledge/**` reinvents its own height/flex wrapper (four copies of `h-[calc(100vh-Nrem)]`). No shared providers, no shared shell.
- **User impact:** Brittle layouts; inconsistent height math between routes.
- **Technical cause:** `src/app/admin/knowledge/layout.tsx` does not exist.
- **Exact file (to create, Phase 3, component-level wrap only):** N/A — see Phase 3 note. A route-level `layout.tsx` is explicitly **NOT** created because it would clip `analytics` and `import` whose parent main is `overflow-y-auto`.
- **Recommended fix:** Phase 3 handles two-pane shell wrapping at the **component level** inside `ContentEditorIndex` (via `AdminTwoPaneShell`), not at the route level.

**4.3 — `ContentEditorIndex` hardcoded height** — Severity: **HIGH**
- **Symptom:** `flex h-[calc(100vh-8rem)] overflow-hidden` at line 287.
- **User impact:** Clips when viewport/topbar changes; produces dead space at bottom after Phase 1's regex fix if not also patched.
- **Technical cause:** Compensation hack for Finding 4.1.
- **Exact file:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:287`
- **Exact component:** `ContentEditorIndex` root `<div>`
- **Recommended fix:** `flex h-full w-full overflow-hidden`. Requires 4.1 fixed first.

**4.4 — Non-resizable forked sidebar** — Severity: **MEDIUM**
- **Symptom:** Fixed `w-[280px]` sidebar with discrete collapse toggle only (lines 289, 376-383). No drag handle, no localStorage, no width persistence.
- **User impact:** Admins cannot adjust width; collapsed state resets on reload.
- **Technical cause:** `ContentEditorIndex` forked the two-pane concept without the polish from `WikiSidebarShell`.
- **Exact file:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:287-370`
- **Exact component:** inline sidebar `<div>` with `TreeStructure` header
- **Recommended fix (Phase 3):** Replace with `AdminTwoPaneShell` (admin-local twin of `WikiSidebarShell`, not a wiki refactor).

**4.5 — Nested scroll containers** — Severity: **HIGH**
- **Symptom:** On index routes, `PortalLayout` main `overflow-y-auto` fights `ContentEditorIndex` outer `overflow-hidden` + article list `flex-1 overflow-y-auto`.
- **User impact:** Mouse wheel scrolls the wrong container depending on pointer location.
- **Technical cause:** Finding 4.1 forces `overflow-y-auto` on the parent.
- **Exact file:** `src/components/portal/PortalLayout.tsx:65-76` + `src/components/admin/unified-editor/ContentEditorIndex.tsx:287`
- **Exact component:** `PortalLayout` main + `ContentEditorIndex` root
- **Recommended fix:** After 4.1, `noPadding=true` forces `p-0 overflow-hidden` on PortalLayout main, leaving the article list as the sole scroll owner.

**4.6 — Stacked padding layers** — Severity: **MEDIUM**
- **Symptom:** PortalLayout `px-4 py-4` + toolbar `px-5 py-3` + list rows `px-5 py-3.5`. The wiki achieves breathing room with ONE padding layer.
- **User impact:** Content feels visually "boxed-in".
- **Exact file:** `src/components/admin/unified-editor/ContentEditorIndex.tsx` toolbar (line 374) and list row (lines 572-668) classes
- **Recommended fix (Phase 2):** Remove outer `px-4 py-4` via 4.1 fix; normalize inner spacing to `px-5 py-3` toolbar, `px-5 py-2` stats, `px-5 py-2.5` rows.

### `/admin/knowledge/questions`

**4.7 — Inherits all index defects + extra gutter** — Severity: **HIGH**
- **Symptom:** Same `ContentEditorIndex` rendered with `defaultViewMode="questions"`, plus `flex-1 overflow-hidden p-4 bg-surface-light` wrapper at line 706 around `QuestionsTableClient`.
- **User impact:** Question table appears to float inside a colored gutter instead of filling its container.
- **Technical cause:** Inline wrapper styling added during a prior iteration without removing the inherited padding.
- **Exact file:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:706`
- **Exact component:** the `p-4 bg-surface-light` wrapper around `<QuestionsTableClient />`
- **Recommended fix:** Replace with `flex-1 overflow-hidden` (no padding, no background). `QuestionsTableClient` owns its own padding.

**4.8 — Regex-based route classification is fragile** — Severity: **MEDIUM** (future-proofing)
- **Symptom:** Any new route under `/admin/knowledge/**` silently gets the wrong `noPadding` value unless the regex is updated by hand.
- **User impact:** Silent layout regressions on new routes.
- **Technical cause:** Layout classification encoded in a client-side regex instead of via route groups or explicit per-route opt-in.
- **Exact file:** `src/app/admin/layout.tsx:40`
- **Recommended fix:** Phase 1 replaces the regex with an explicit allowlist as a bridge. Deferred follow-up (after Phase 3 ships): migrate to a Next.js route group `(full-bleed)` to retire the allowlist entirely.

### `/admin/knowledge/[id]`, `/admin/knowledge/new`, loading skeletons

**4.9 — Three additional hardcoded-height instances** — Severity: **HIGH**
- **Symptom:** `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3` all use `flex h-[calc(100vh-4rem)] flex-col overflow-hidden` — a different magic number than ContentEditorIndex's `8rem`, proving the original author was estimating chrome height by eye on different days.
- **User impact:** Inconsistent header/content alignment between index and detail; clipping when topbar changes; loading skeleton jumps on hydration.
- **Technical cause:** Pages do not trust the layout chain to provide `h-full`.
- **Exact files:**
  - `src/app/admin/knowledge/[id]/page.tsx:47`
  - `src/app/admin/knowledge/new/page.tsx:43`
  - `src/app/admin/knowledge/[id]/loading.tsx:3`
- **Recommended fix (Phase 1):** Replace all three with `flex h-full flex-col overflow-hidden`. Because detail routes already receive `noPadding=true` (regex matches `/admin/knowledge/[id]`), the `min-h-screen` → `flex-1` chain from `AdminShell`/`PortalLayout` lets `h-full` resolve correctly.

## 5. Parity Gaps vs Dashboard Wiki

| Dimension | Should be | Current in admin | Classification |
|---|---|---|---|
| Route-level `layout.tsx` with `h-full w-full overflow-hidden` | Required for full-bleed routes only | Missing | Accidental gap |
| Explicit `min-h-0` / `min-w-0` on flex layers | Required | Partial | Accidental gap |
| Resizable sidebar with drag handle | Required | Fixed `w-[280px]` | Unjustified divergence |
| Sidebar width persisted to localStorage | Required | Not persisted | Unjustified divergence |
| Sidebar collapse toggle | Required | Present (discrete only) | Partial parity |
| Single scroll container per viewport | Required | Two nested containers | Bug |
| One padding layer per content region | Required | Three stacked layers | Bug |
| Providers wired at layout level | Optional | No providers | Accidental gap |
| Height via `h-full` inheritance | Required | `calc(100vh-Nrem)` × 4 | Bug |
| Route classification via regex | Should be allowlist/route group | Fragile regex | Fragile |
| Article content `max-w-4xl mx-auto px-8 py-12` | Optional stylistic | N/A (different content type) | Intentional — admin is a data browser, not a reader |

## 6. UX/UI Recommendations

1. **Normalize the height chain.** Layout owns `h-full`; pages use `flex-1` or `h-full`. Delete every `calc(100vh-Nrem)` under `/admin/knowledge/**`.
2. **Single scroll owner.** On the index route, the article/question list is the only scroll container. On the detail route, the editor body is the only scroll container.
3. **Resizable sidebar with persistence** — `MIN=180`, `MAX=480`, `DEFAULT=280` (matches admin's current fixed width), localStorage key `admin_knowledge_sidebar_width` (namespaced to avoid wiki collision).
4. **Padding discipline.** Toolbar `px-5 py-3`; stats bar `px-5 py-2`; list rows `px-5 py-2.5`. No outer padding from `PortalLayout` on full-bleed knowledge routes.
5. **Remove the `bg-surface-light p-4` gutter** around `QuestionsTableClient`. Let the table fill its container flush.
6. **Admin-local `AdminTwoPaneShell` primitive** — byte-for-byte copy of `WikiSidebarShell`'s technique, namespaced storage key. Do **NOT** import, refactor, or depend on `WikiSidebarShell`.
7. **Use shadcn/ui primitives only** per `.ai/rules/design.md`: `Card`, `Button`, `Input`.
8. **Design tokens only** — no hardcoded hex outside of identity-locked files.

## 7. Implementation Plan

### Phase 0 — Pre-flight verification (10 min, BLOCKING Phase 1)

**Goal:** Confirm `AdminShell` → `PortalLayout` → `<main>` chain reaches the viewport so `h-full` children resolve.

**Tasks:**
- Open `src/app/admin/_components/AdminShell.tsx` — verify it wraps children in `SidebarProvider` + `PortalLayout` and does not add any intermediate height-stripping wrapper. **VERIFIED during audit:** lines 176-193 wrap `<PortalLayout>` with `noPadding={noPadding}`.
- Open `src/components/portal/PortalLayout.tsx` — confirm outer `flex flex-col min-h-screen` (line 36), inner `<div class="flex flex-1">` (line 59), `<div class="flex flex-1 min-w-0">` (line 65), and `<main>` with `flex-1 min-w-0 [p-0 overflow-hidden | overflow-y-auto px-4 py-4]` (lines 66-73). **VERIFIED.**
- Confirm no intermediate wrapper strips height.

**Expected outcome:** Height chain is sound provided `noPadding=true`. Phase 1 is unblocked.

### Phase 1 — Fast structural parity fixes (90 min, CRITICAL)

**Goals:** Fix the regex with zero regression on `/admin/knowledge/analytics` and `/admin/knowledge/import`. Eliminate all four hardcoded-height instances. Single scroll ownership.

**Files to modify (6 edits total):**

**1. `src/app/admin/layout.tsx`** — Replace line 40-41 with an explicit allowlist:

```tsx
// Routes that use full-bleed editor layout (no PortalLayout padding).
// CRITICAL: /admin/knowledge/analytics and /admin/knowledge/import remain
// padded — they are single-column pages, not two-pane shells.
const FULL_BLEED_KNOWLEDGE_EXACT = new Set<string>([
  '/admin/knowledge',
  '/admin/knowledge/questions',
  '/admin/knowledge/questions/scenarios',
  '/admin/knowledge/questions/design-problems',
  '/admin/knowledge/questions/new',
  '/admin/knowledge/new',
])

const FULL_BLEED_KNOWLEDGE_DETAIL = [
  // /admin/knowledge/[id] but NOT /admin/knowledge/analytics|import|new|questions/*
  /^\/admin\/knowledge\/(?!analytics$|import$|new$|questions(\/|$))[^/]+$/,
  // /admin/knowledge/questions/[id] but NOT /questions/new|scenarios/*|design-problems/*
  /^\/admin\/knowledge\/questions\/(?!new$|scenarios(\/|$)|design-problems(\/|$))[^/]+$/,
  // /admin/knowledge/questions/scenarios/[id] and /admin/knowledge/questions/design-problems/[id]
  /^\/admin\/knowledge\/questions\/(scenarios|design-problems)\/[^/]+$/,
]

const isFullBleedEditor =
  FULL_BLEED_KNOWLEDGE_EXACT.has(pathname) ||
  FULL_BLEED_KNOWLEDGE_DETAIL.some((r) => r.test(pathname))
```

**Test-fixture guidance:** Before editing, read `src/app/admin/_components/AdminShell.test.ts` to learn its current structure. If it tests the regex via string fixtures, add fixtures asserting the expected `noPadding` value for each of these paths:
- `/admin/knowledge` → `true`
- `/admin/knowledge/questions` → `true`
- `/admin/knowledge/new` → `true`
- `/admin/knowledge/analytics` → `false`
- `/admin/knowledge/import` → `false`
- `/admin/knowledge/abc-123` → `true` (generic detail)
- `/admin/knowledge/questions/q-xyz` → `true`
- `/admin/knowledge/questions/scenarios` → `true`
- `/admin/knowledge/questions/scenarios/s-001` → `true`

If the test imports the old regex by reference, replace with imports of the new allowlist constants (extract them from the layout file into a sibling `admin-route-config.ts` so they are testable).

**2. `src/components/admin/unified-editor/ContentEditorIndex.tsx:287`** — Replace `flex h-[calc(100vh-8rem)] overflow-hidden` with `flex h-full w-full overflow-hidden`.

**3. `src/components/admin/unified-editor/ContentEditorIndex.tsx:706`** — Replace `flex-1 overflow-hidden p-4 bg-surface-light` with `flex-1 overflow-hidden`.

**4. `src/app/admin/knowledge/[id]/page.tsx:47`** — Replace `flex h-[calc(100vh-4rem)] flex-col overflow-hidden` with `flex h-full flex-col overflow-hidden`.

**5. `src/app/admin/knowledge/new/page.tsx:43`** — Replace `flex h-[calc(100vh-4rem)] flex-col overflow-hidden` with `flex h-full flex-col overflow-hidden`.

**6. `src/app/admin/knowledge/[id]/loading.tsx:3`** — Replace `flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface-light` with `flex h-full flex-col overflow-hidden bg-surface-light`.

**Expected outcome:** Index routes render full-bleed with single scroll container and no padding gutter. Detail and new routes inherit height from the `AdminShell`/`PortalLayout` chain. `/admin/knowledge/analytics` and `/admin/knowledge/import` remain padded. No hardcoded viewport math remains under `/admin/knowledge/**`.

**Risks / dependencies:**
- The allowlist must be exhaustive for all current routes. Enumerate with `ls src/app/admin/knowledge -R` and cross-check each against the Phase 1 list.
- After Phase 1 merges, manually open `/admin/knowledge/[sampleId]`, `/admin/knowledge/new`, and the loading skeleton (throttle network) to verify the `h-full` chain resolves without clipping.
- **Trailing-slash note:** `next.config` should not set `trailingSlash: true` — verify before assuming path normalization.

**Verification commands:**
```bash
bun run lint
bun run type-check
bun test src/app/admin/_components/AdminShell.test.ts
```

### Phase 2 — Styling cleanup and spacing normalization (2 hours)

**Goal:** One padding layer per region; consistent toolbar/stats/list spacing; remove visual noise.

**Files to modify:**
- `src/components/admin/unified-editor/ContentEditorIndex.tsx` — audit inner divs and enforce:
  - Toolbar: `px-5 py-3 border-b border-border` (line 374)
  - Stats bar: `px-5 py-2 text-sm text-muted-foreground border-b border-border` (line 499)
  - List rows: `px-5 py-2.5 border-b border-border/50` (line 576)
- Sidebar root (line 290): `flex w-[280px] shrink-0 flex-col border-r border-border bg-card` — verify no redundant padding.
- Grep the file for hardcoded hex per `.ai/rules/design.md`. Use `text-primary`, `bg-background`, `border-border` throughout.

**Expected outcome:** Visual alignment between toolbar, stats, list, and detail header. No gutters.

**Risks / dependencies:**
- Spacing tweaks may shift list row heights — verify pagination cutoffs unchanged.
- Must not touch any file listed in `.ai/rules/identity_preservation_lock.md`.
- Requires Phase 1 merged.

### Phase 3 — Interaction parity via admin-local twin (4 hours)

**Goal:** Admin gets resizable sidebar with localStorage persistence. **Zero changes to wiki code.**

**Files to create:**
- **`src/app/admin/knowledge/_components/AdminTwoPaneShell.tsx`** — byte-for-byte structural copy of `WikiSidebarShell`'s technique:
  - `const WIDTH_KEY = 'admin_knowledge_sidebar_width'` (namespaced — MUST NOT collide with wiki's `wiki_sidebar_width`)
  - `MIN_W=180`, `MAX_W=480`, `DEFAULT_W=280` (matches admin's current fixed width)
  - Same `mounted` SSR gate pattern (`if (!mounted) return null`)
  - Same drag handle with `bg-border` default + hover `bg-primary` (use tokens, not `bg-camp-cobalt` literal — admin is not identity-locked)
  - Props: `sidebar: ReactNode`, `children: ReactNode`, `storageKey?: string`, `defaultCollapsed?: boolean`
  - Collapse state is session-only (matches wiki behavior)

**Files NOT to create (explicit):**
- **`src/app/admin/knowledge/layout.tsx`** — **DO NOT CREATE.** An earlier draft proposed this but it would clip `/admin/knowledge/analytics` and `/admin/knowledge/import`, whose parent `<main>` is `overflow-y-auto` and requires natural content flow. Handle two-pane wrapping at the **component level** inside `ContentEditorIndex` only.

**Files to modify:**
- **`src/components/admin/unified-editor/ContentEditorIndex.tsx`**
  - Delete the hand-rolled sidebar `<div>` (lines 289-369).
  - Delete the `sidebarCollapsed` state (line 139).
  - Delete the toolbar collapse button (lines 376-383) — `AdminTwoPaneShell` provides its own.
  - Wrap the two-pane layout with `<AdminTwoPaneShell sidebar={<TreeSidebar />}>{contentPane}</AdminTwoPaneShell>`.
  - Extract the sidebar contents (header `<Eyebrow>Topics</Eyebrow>`, `<TaxonomyTree>`, stats grid) into a local `<TreeSidebar />` helper component within the same file for clarity.

**Files NOT touched:**
- `src/components/wiki/navigation/WikiSidebarShell.tsx` — unchanged
- `src/components/wiki/navigation/WikiLayoutContent.tsx` — unchanged
- `src/components/wiki/navigation/WikiContentShell.tsx` — unchanged
- `src/app/dashboard/wiki/**` — unchanged

**Expected outcome:** Admin sidebar drag-resizes (180-480px), persists width in localStorage at `admin_knowledge_sidebar_width`, collapse toggle works. `/dashboard/wiki` renders identically to before (no wiki file modified).

**Risks / dependencies:**
- Copying the `mounted` gate must be exact to avoid hydration flicker on admin.
- Admin storage key is namespaced — must not collide with wiki.
- `AdminTwoPaneShell` must work inside `ContentEditorIndex` whose parent is `flex h-full w-full overflow-hidden` (Phase 1 outcome).

### Phase 4 — Verification (1 hour)

**Tasks:**
- `bun run lint`
- `bun run type-check`
- `bun test src/app/admin/_components/AdminShell.test.ts`
- Open the browser at each of the 8 routes below and visually confirm against the § 9 checklist:
  - `/dashboard/wiki` (regression guard)
  - `/dashboard/wiki/[any-slug]` (regression guard)
  - `/admin/knowledge`
  - `/admin/knowledge/questions`
  - `/admin/knowledge/[sampleArticleId]`
  - `/admin/knowledge/new`
  - `/admin/knowledge/analytics` (must stay padded)
  - `/admin/knowledge/import` (must stay padded)
- **DevTools inspection:** on each full-bleed route, confirm exactly one ancestor has computed `overflow-y: auto` (the article/question list).
- **Admin sidebar interaction:** drag the handle; verify range 180-480px; reload page; verify width persists; toggle collapse; verify it works.
- **Wiki sidebar regression:** drag wiki sidebar; verify unchanged behavior and persisted key `wiki_sidebar_width` is untouched.
- `gitnexus_detect_changes({scope: "all"})` — confirm only expected files changed.
- `gitnexus_impact({target: "AdminShell"})` — confirm no d=1 CRITICAL/HIGH risk.
- `gitnexus_impact({target: "ContentEditorIndex"})` — same.

**Expected outcome:** Green lint, green types, green admin tests, matching visual smoke check on all 8 routes, `gitnexus_detect_changes` shows only expected files.

**Risks / dependencies:** If any wiki route shows visible drift during smoke check (though no wiki file was modified), investigate whether a shared CSS token was accidentally touched.

## 8. Proposed Refactor Strategy — Position

**Recommendation: Option C — admin-local twin of `WikiSidebarShell`, accept duplication with wiki.**

Option A (reuse `WikiLayoutContent` in admin) is invalidated because wiki shells are coupled to `WikiDisciplineProvider` + `WikiNavigationProvider` — wiki domain concepts that do not apply to admin. Importing these providers into admin creates directional coupling admin → wiki and pollutes admin vocabulary with wiki-shaped state.

Option B (extract shared `TwoPaneShell`) is invalidated by the identity-preservation constraint. `WikiSidebarShell.tsx:60` has a `mounted` SSR gate that is invisible to pixel diff (diffs only fire after hydration), and lines 84, 89, 101 have hardcoded `bg-camp-cobalt` + `bg-surface-muted/50` brand literals. Tokenizing these literals alters wiki's visual fingerprint. The identity-locked rules (`.ai/rules/identity_preservation_lock.md`) flag any shared-token change as requiring re-verification of `SlideToSubmit`, which multiplies review surface for what is ultimately an admin-only fix. Phase 3 would need expensive interaction testing (drag velocity, hydration timing at slow throttle, collapse toggle roundtrip) that pixel diffs cannot replace.

Option C wins on three axes:
1. **Blast radius is bounded to `src/app/admin/knowledge/**` and `src/components/admin/**`** — zero wiki files, zero risk to `/dashboard/wiki`, zero risk to `SlideToSubmit`.
2. **Executor speed is preserved** — copying 60-80 lines of drag/persist logic into a new file is faster than a shared extraction refactor that must prove byte-identical rendering.
3. **Rule of three is honored** — with only two two-pane shell consumers (wiki and admin), extraction is premature. If a third consumer appears (e.g., a future CEO portal browser), propose extraction at that point and let both shells prove convergent requirements over a full quarter first.

**Non-negotiable constraint:** `src/components/quiz-v2/SlideToSubmit.tsx`, all files listed in `.ai/rules/identity_preservation_lock.md`, and all files under `src/components/wiki/navigation/` are **out of scope** for every phase of this plan.

## 9. Verification Checklist

**Visual parity (smoke check at 1440px unless noted)**
- [ ] `/admin/knowledge` renders with single scroll container at 1280, 1440, and 1920px widths
- [ ] `/admin/knowledge/questions` question table flush against container (no colored gutter)
- [ ] `/admin/knowledge/[id]` header flush with detail content, no clipping
- [ ] `/admin/knowledge/new` same as `[id]`
- [ ] `/admin/knowledge/analytics` retains padding gutter, scrolls internally via `PortalLayout` main
- [ ] `/admin/knowledge/import` retains centered `max-w-2xl` form with padding
- [ ] `/dashboard/wiki` manual smoke check shows no visible regression (no wiki file was modified; this is a belt-and-braces check)

**Resize behavior (Phase 3)**
- [ ] Admin sidebar on `/admin/knowledge` drags between 180px and 480px
- [ ] Admin sidebar width persists across browser reload at localStorage key `admin_knowledge_sidebar_width`
- [ ] Wiki sidebar on `/dashboard/wiki` drags unchanged and persists at localStorage key `wiki_sidebar_width`

**Collapse behavior**
- [ ] Admin sidebar collapse toggle works (Phase 3)
- [ ] Wiki sidebar collapse toggle unchanged

**Spacing**
- [ ] Toolbar, stats bar, list rows all align on the same left edge (`px-5`)
- [ ] No double padding between outer `main` and inner content on full-bleed routes

**Scroll ownership**
- [ ] DevTools confirms exactly one `overflow-y-auto` ancestor per viewport on each full-bleed route
- [ ] `/admin/knowledge/analytics` scroll works (expected: `PortalLayout` main scrolls)

**Loading states**
- [ ] `/admin/knowledge/[id]/loading.tsx` renders without clipping during slow-3G throttle
- [ ] No hydration flicker on route transitions

**Regression**
- [ ] `bun run lint` passes
- [ ] `bun run type-check` passes
- [ ] `bun test src/app/admin/_components/AdminShell.test.ts` green
- [ ] `gitnexus_detect_changes({scope: "all"})` shows only expected files
- [ ] `gitnexus_impact({target: "AdminShell"})` shows no d=1 CRITICAL/HIGH risk
- [ ] `gitnexus_impact({target: "ContentEditorIndex"})` shows no d=1 CRITICAL/HIGH risk
- [ ] No wiki route regresses (verified by the fact that no wiki file was modified)

## 10. Recommended Next Actions

1. **Land Phase 0 + Phase 1 as PR #1** (~100 min). Highest leverage; unblocks everything. PR description cites all 6 file edits, the regex allowlist rationale, and the `AdminShell.test.ts` update.
2. **Manual browser verification** after PR #1 merges — navigate each of the 8 routes in § 9 checklist.
3. **Land Phase 2 as PR #2** (~2h). Purely cosmetic; low risk.
4. **Pre-Phase-3 visual snapshot** of admin routes (for manual regression reference).
5. **Land Phase 3 + Phase 4 as PR #3** (~5h). Most complex; admin-local only — zero wiki files. Verification belongs with the riskiest change.
6. **Commit trailers** per project `commit_protocol`:
   - `Constraint: WikiSidebarShell is identity-locked — admin must not import or refactor`
   - `Constraint: /admin/knowledge/analytics and /admin/knowledge/import must retain PortalLayout padding`
   - `Rejected: Shared TwoPaneShell extraction | cannot validate hydration timing via pixel diff`
   - `Rejected: Route-level src/app/admin/knowledge/layout.tsx | would clip padded sibling routes`
   - `Confidence: high` (Phases 1-2), `medium` (Phase 3)
   - `Scope-risk: narrow`
   - `Directive: AdminTwoPaneShell is admin-local — do not cross-import with wiki shell`
7. **Follow-up (separate PR, deferred):** Migrate `/admin/knowledge` to Next.js route groups `(full-bleed)/` to retire the allowlist entirely. Addresses Finding 4.8.
8. **Revisit extraction (deferred, rule-of-three):** If a third two-pane shell consumer appears, propose shared-primitive extraction at that point only.

## 11. Appendix: Evidence

- **`src/app/dashboard/wiki/layout.tsx:5-13`** — `h-full w-full overflow-hidden` + Suspense + `WikiLayoutContent`
- **`src/components/wiki/navigation/WikiLayoutContent.tsx`** — providers + outer `flex flex-col h-full w-full overflow-hidden` + `flex flex-1 min-h-0`
- **`src/components/wiki/navigation/WikiContentShell.tsx:139`** — `flex-1 min-w-0 flex flex-col h-full overflow-hidden`
- **`src/components/wiki/navigation/WikiSidebarShell.tsx:7-11`** — constants `WIDTH_KEY='wiki_sidebar_width'`, `MIN_W=180`, `MAX_W=480`, `DEFAULT_W=256`
- **`src/components/wiki/navigation/WikiSidebarShell.tsx:33-58`** — `onMouseDown` + window mouse listeners + localStorage persist on mouseup
- **`src/components/wiki/navigation/WikiSidebarShell.tsx:60`** — `if (!mounted) return null` SSR gate (invisible to pixel diff — key reason Option B is invalidated)
- **`src/components/wiki/navigation/WikiSidebarShell.tsx:84,89,101`** — hardcoded `bg-camp-cobalt` + `bg-surface-muted/50` brand literals (cannot be tokenized without identity-lock re-verification)
- **`src/app/dashboard/wiki/[slug]/page.tsx:92-194`** — header, `flex flex-1 min-h-0 relative`, `main#wiki-center-pane` with `flex-1 min-w-0 overflow-y-auto`, content `max-w-4xl mx-auto px-8 py-12`
- **`src/app/admin/layout.tsx:40-51`** — `isFullBleedEditor` regex + `noPadding` propagation to `AdminShell` — **the root-cause regex bug**
- **`src/app/admin/_components/AdminShell.tsx:176-193`** — wraps `<PortalLayout>` with `noPadding` and `SidebarProvider`
- **`src/app/admin/_components/AdminShell.test.ts`** — test surface that must be updated in Phase 1 if it imports the old regex
- **`src/components/portal/PortalLayout.tsx:36`** — outer `flex flex-col min-h-screen`
- **`src/components/portal/PortalLayout.tsx:65-76`** — main `flex-1 min-w-0 [p-0 overflow-hidden when noPadding else overflow-y-auto px-4 py-4]`
- **`src/app/admin/knowledge/page.tsx:17-24`** — renders `<ContentEditorIndex />` with no wrapping
- **`src/app/admin/knowledge/questions/page.tsx:22-32`** — renders `<ContentEditorIndex defaultViewMode="questions" />`
- **`src/components/admin/unified-editor/ContentEditorIndex.tsx:287`** — `flex h-[calc(100vh-8rem)] overflow-hidden` — **hardcoded viewport math #1**
- **`src/components/admin/unified-editor/ContentEditorIndex.tsx:289-369`** — hand-rolled fixed-width sidebar `<div>`
- **`src/components/admin/unified-editor/ContentEditorIndex.tsx:376-383`** — discrete `TreeStructure` collapse button (no drag handle)
- **`src/components/admin/unified-editor/ContentEditorIndex.tsx:706`** — `flex-1 overflow-hidden p-4 bg-surface-light` wrapper around `QuestionsTableClient` — **extra gutter**
- **`src/app/admin/knowledge/[id]/page.tsx:47`** — `flex h-[calc(100vh-4rem)] flex-col overflow-hidden` — **hardcoded viewport math #2**
- **`src/app/admin/knowledge/new/page.tsx:43`** — `flex h-[calc(100vh-4rem)] flex-col overflow-hidden` — **hardcoded viewport math #3**
- **`src/app/admin/knowledge/[id]/loading.tsx:3`** — `flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface-light` — **hardcoded viewport math #4**
- **`src/app/admin/knowledge/analytics/page.tsx:73-201`** — `<div class="space-y-6">` single-column stat dashboard (padded, must not regress)
- **`src/app/admin/knowledge/import/page.tsx:14-28`** — `<div class="mx-auto max-w-2xl space-y-6">` centered form (padded, must not regress)
- **`src/app/admin/knowledge/_components/ArticleDetailClient.tsx:45-73`** — `relative` wrapper with absolute-positioned button bar at `top-4 right-4`
- **Missing file:** `src/app/admin/knowledge/layout.tsx` — intentionally not created in Phase 3 (would clip padded sibling routes)

---

## 8. Track B — Performance / CRUD / Loop Audit (VERBATIM)

> **Provenance:** The following content is copied verbatim from `.ai/plans/Admin-UXUI/2026-04-12-Admin-Knowledge-Speed-And-Functionality-Audit-And-Plan.md` (684 lines including the Round 2 Appendix). Do not edit this section; edit the source file and regenerate this document. Line citations and file paths are preserved as-is.

# RALPLAN-DR

## Principles
1. **Evidence over intuition.** Every finding must cite a verified `file:line`. No "feels slow" claims.
2. **Correctness before speed.** State-integrity bugs (mirror-prop races, fetch-churn loops) ship in Phase 1 before cache tuning.
3. **Minimum blast radius.** Prefer surgical edits inside existing components over rewrites. The 735-line `ContentEditorIndex` is untouchable wholesale in this pass.
4. **Wiki is the benchmark, not a modification target.** `/dashboard/wiki/[slug]` defines the parity bar; we inherit patterns, we do not reshape it.
5. **Identity-lock respected.** `SlideToSubmit.tsx` and anything in `.ai/rules/identity_preservation_lock.md` is out of scope.

## Decision Drivers
1. **User-visible latency on `/admin/knowledge` and `/admin/knowledge/questions` after any mutation.** Every save / delete currently causes a full-page server refetch plus a client-side `getQuestionsByTopicIds` re-run.
2. **Confirmed data-integrity risk.** The `localArticles` mirror pattern can clobber optimistic updates with stale server data; the `selectedArticleIds` Set can outlive the articles it references.
3. **Cost of future regressions.** Current fragile patterns (useCallback-inside-useEffect, prop-mirrored-state, uncached detail fetches) will cause new bugs as features are added. Fixing them once is cheaper than triaging them repeatedly.

## Viable Options

### Option A — Surgical bugfix only
**Scope:** Merge the double-fetch in `getContentEditorIndexData`; rewrite the `handleNodeSelect` effect in `QuestionsTableClient`; wrap `getArticleFull` in `unstable_cache`; flatten `[id]/page.tsx` batches.
- **Pros:** Smallest diff, lowest regression risk, shippable in one phase, easy to review.
- **Cons:** Leaves `localArticles` mirror in place (integrity race persists), leaves the 4-pass filter in `ContentEditorIndex`, does not fix the `selectedArticleIds` stale-ID risk.

### Option B — Surgical bugfix + targeted state refactor, **split across two PRs**  **(RECOMMENDED)**
**Scope:** All of A, plus (1) remove `localArticles` mirror and drive from `articles` prop with a separate `pendingArchiveIds: Set<string>` for optimistic state, (2) stabilise `handleNodeSelect` via shared helper, (3) collapse the four-pass `filteredArticles` memo into one traversal, (4) add `unstable_cache` tags for `admin-knowledge` on the index query — **only after** an RLS audit confirms the query is user-agnostic (see §5 critical security flag).

**PR 1 (pure refactors, zero UX behavior change):** 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.4. Shippable this week. No state-shape changes. No caching introductions beyond the wiki-benchmark pattern (static-client `getArticleFull`). Every change is byte-for-byte behavior-preserving at the interaction level. Gated on §9 Q4, Q6, and Q11a (RLS for `wiki_articles`).

**PR 2a (behavior change — ships after PR 1 bakes):** 1.3 (`localArticles` removal + `pendingArchiveIds`), 3.3 (per-row bulk failure reporting). Gated on §9 Q10 (un-archive scope).

**PR 2b (index caching — ships ONLY after PR 2a is deployed to production):** 2.5 (admin-knowledge cache), 2.6 (view-mode split), Phase 4. Gated on §9 Q11b (RLS for the full index loader).

**CRITICAL ORDERING:** PR 2b must not merge until PR 2a is in production. Rationale: L-2 (the optimistic-vs-server clobber race) becomes observable **only** when the server response becomes stale relative to the client — which happens *only* once caching is introduced. Shipping 2.5 before 1.3 would create a live clobber race in production. Enforcing "2a in prod first, then 2b merges" removes the footgun.

- **Pros:** Eliminates every confirmed Critical / High finding. Decorrelates three risk classes (refactor / behavior / caching) across three PRs. Failures in later PRs do not block earlier PRs' wins.
- **Cons:** Three review cycles instead of one. Longer calendar time to full rollout. PR 2a/2b requires RLS verification work not present in the original plan.

### Option C — Full rewrite: split `ContentEditorIndex` into `ArticlesView` + `QuestionsView` shells
**Scope:** Break the 735-line component into two siblings sharing a minimal `KnowledgeLayoutShell`. Lift URL-sync to the shell. Separate server data loaders per view.
- **Pros:** Cleanest long-term shape. Each shell is ~300 lines. Parallels wiki architecture more literally.
- **Cons:** High regression risk across 6+ call sites and the `defaultViewMode` prop pattern. Every feature in flight gets blocked. No evidence the split itself fixes any confirmed bug — all root causes can be addressed inside the current component.

**Selected:** Option B. Option A leaves known integrity risks on the table; Option C spends rewrite budget we do not have for wins we do not need.

---

# 1. Executive Summary

`/admin/knowledge` and `/admin/knowledge/questions` are the two slowest and most fragile routes in the admin portal. Three confirmed bugs explain the majority of the pain, and four performance cliffs explain the rest.

**The three stability-critical bugs.** First, `getContentEditorIndexData` fetches the entire `questions` table twice on every render of both admin knowledge routes — once at `src/lib/actions/admin/content.ts:201-204` (`question_id, topic_id, text`) and again at `src/lib/actions/admin/content.ts:226-229` (`article_id, question_type`). The second fetch is sequential, not parallel, so it adds a full network roundtrip on top of the duplicated payload. Second, `QuestionsTableClient` re-fetches the question bank every time the parent re-renders, because its effect at `src/components/admin/QuestionsTableClient.tsx:458-460` depends on `handleNodeSelect`, which is a `useCallback` whose deps include the `taxonomyTree` prop — and `taxonomyTree` gets a fresh reference on every `router.refresh()` from any mutation anywhere in the owning page. Third, `ContentEditorIndex` mirrors its `articles` prop into a `localArticles` state at `src/components/admin/unified-editor/ContentEditorIndex.tsx:144`, then writes it back from an effect at `src/components/admin/unified-editor/ContentEditorIndex.tsx:156-158`. The bulk-delete optimistic update at lines 259-284 mutates `localArticles`, then immediately calls `router.refresh()`; if the server revalidation returns stale data (or races ahead of the React commit), the optimistic update is silently clobbered. This also means `selectedArticleIds` can hold IDs for articles that no longer exist between the archive call and the next server fetch.

**The four performance cliffs.** `getArticleFull` (`src/lib/actions/admin/content.ts:336-348`) is not wrapped in `unstable_cache`, so every admin article detail view is a fresh database roundtrip — the wiki benchmark (`getCachedArticleAndNode` in `src/lib/actions/cached-queries.ts`) demonstrates the pattern we are missing. The admin detail page (`src/app/admin/knowledge/[id]/page.tsx:24-44`) runs four sequential database round trips (auth → `getArticleFull` → links+prompts → questions+nodes) when three of the four could run in parallel after auth. The `buildTree` function at `src/lib/actions/admin/content.ts:255-290` walks every descendant for every node, turning a simple taxonomy count into an O(N²) pass. `enrichedArticles` at `src/lib/actions/admin/content.ts:298-313` does an O(A × L) linear search over `wiki_article_taxonomy` links per article when a prebuilt map would make it O(A + L).

**Wiki parity.** The reference route `/dashboard/wiki/[slug]` already demonstrates the three patterns that admin lacks: cached article fetch with tag-based revalidation, a single parallel `Promise.all` after the cached primary query, and no mirror-prop-into-state anti-patterns. Admin inherits the wiki's generic `revalidateTag('wiki','max')` — in fact `bulkDeleteArticles` at `src/lib/actions/admin/bulk.ts:28-49` calls it — but admin itself has no caches to invalidate, so the tag fires into a vacuum.

**Recommendation.** Phase 1 fixes the three stability bugs. Phase 2 closes the four performance cliffs. Phase 3 sharpens UX responsiveness (Suspense boundaries, skeletons, bulk-action toasts). Phase 4 consolidates the patterns so the next admin feature inherits them for free. Nothing in this plan requires touching `ContentEditorIndex`'s component boundary or any identity-locked file.

---

# 2. Route and Component Map

## Target A: `/admin/knowledge` (articles view)

- **Route file:** `src/app/admin/knowledge/page.tsx` (implied; renders `ContentEditorIndex` with `defaultViewMode="articles"`).
- **Layout chain:** `src/app/admin/layout.tsx` → admin shell → knowledge page.
- **Primary client component:** `src/components/admin/unified-editor/ContentEditorIndex.tsx` (735 lines).
- **Data loader:** `getContentEditorIndexData` at `src/lib/actions/admin/content.ts:183-331`.
- **Mutation hooks:** `bulkDeleteArticles` (`src/lib/actions/admin/bulk.ts:28-49`), `DeleteArticleModal` on confirm (`src/components/admin/unified-editor/DeleteArticleModal.tsx:43`), `UnifiedContentEditor` on save.
- **Shared with wiki:** None directly. Reads the same underlying tables (`wiki_articles`, `wiki_article_taxonomy`, `taxonomy_tree`, `questions`).
- **Diverged:** The entire data loader is admin-only. Wiki does not batch articles + taxonomy + questions in one action.

## Target B: `/admin/knowledge/questions`

- **Route file:** `src/app/admin/knowledge/questions/page.tsx` (implied; renders `ContentEditorIndex` with `defaultViewMode="questions"`).
- **Layout chain:** Same as Target A.
- **Primary client component:** `ContentEditorIndex` re-used — the questions view is an internal `viewMode` branch, not a separate component.
- **Embedded component:** `QuestionsTableClient` at `src/components/admin/QuestionsTableClient.tsx`, mounted when `viewMode === 'questions'`.
- **Data loader:** Same `getContentEditorIndexData` — so this route pays the cost of fetching all articles, even though the user is looking at questions. Additional data for the questions table comes from `getQuestionsByTopicIds` called imperatively inside `handleNodeSelect` at `src/components/admin/QuestionsTableClient.tsx:448`.
- **Mutation hooks:** `bulkDeleteQuestions` at `src/lib/actions/admin/bulk.ts:9-26`, `QuestionEditor` on save.
- **Shared with wiki:** None.
- **Diverged:** The on-demand fetch-by-topic pattern is admin-specific. Wiki questions are loaded alongside the article in `getCachedArticleAndNode`.

## Reference: `/dashboard/wiki/[slug]`

- **Route file:** `src/app/dashboard/wiki/[slug]/page.tsx`.
- **Cached primary fetch:** `getCachedArticleAndNode` at `src/lib/actions/cached-queries.ts` — wrapped in `unstable_cache`, revalidate 3600, tags `['wiki','taxonomy']`.
- **Parallel data block:** Single `Promise.all` at `src/app/dashboard/wiki/[slug]/page.tsx:59-66` pulling six independent collections after the cached read completes.
- **Client component:** Wiki navigation shell (`src/components/wiki/navigation/**`) — **not a modification target, benchmark only**.
- **Patterns to inherit:** Cached primary read + tag-based revalidation; single post-auth parallel batch; no prop-mirror-into-state.

---

# 3. CRUD Flow Audit

## `/admin/knowledge` (articles)

- **Create:** Handled outside this surface (New Article action routes to the editor). Index page plays no part in create.
- **Read:** Single server render calls `getContentEditorIndexData`; result hydrates `ContentEditorIndex` with `articles`, `taxonomyTree`, `searchableQuestions`. **Failure point:** no cache wrapping, so every navigation back to `/admin/knowledge` is a full 5-query refetch. **Missing protection:** the server action has no error boundary — if any of the five queries fail, the whole action throws and the page renders the Next.js error shell.
- **Update (edit an article):** Handled in the detail route `/admin/knowledge/[id]`. On save, `UnifiedContentEditor` calls `router.refresh()`, which re-runs the detail page loader. The index list is not refreshed until the user navigates back, at which point the uncached `getContentEditorIndexData` fires again.
- **Delete (soft-archive):** `bulkDeleteArticles` updates `status='archived'` (`src/lib/actions/admin/bulk.ts:32-37`), then fires `revalidateTag('wiki','max')` and four `revalidatePath` calls. Client optimistically mutates `localArticles`, then calls `router.refresh()` (`src/components/admin/unified-editor/ContentEditorIndex.tsx:259-284`). **Failure points:** (1) no per-article rollback if only some archives succeed — the bulk action returns a single `error` string; (2) the optimistic update races the server refresh as documented in §5; (3) `selectedArticleIds` retains archived IDs until the next full re-render. **UX risk:** if the user rapidly archives two batches, the second batch's `router.refresh()` can land before the first's, producing visible "un-archive then re-archive" flicker.

## `/admin/knowledge/questions`

- **Create:** Handled in a separate question editor route.
- **Read:** Dual-layer. The outer page re-runs the same `getContentEditorIndexData` (including all articles, which the questions view does not display). The inner `QuestionsTableClient` imperatively calls `getQuestionsByTopicIds` whenever the selected node changes — or, per §5, whenever the parent re-renders for any reason. **Failure point:** no loading state between these two layers; users see stale questions until the imperative fetch resolves.
- **Update:** `QuestionEditor` saves and calls `router.refresh()`. Because this triggers a new `taxonomyTree` reference, `QuestionsTableClient`'s effect fires and re-fetches the active topic's questions — which is correct by coincidence, not by design.
- **Delete:** `bulkDeleteQuestions` hard-deletes from `questions` table and revalidates four paths but does NOT fire `revalidateTag('wiki','max')` (compare `src/lib/actions/admin/bulk.ts:20-25` vs `28-49`). The wiki questions cache is therefore stale until the tag is eventually invalidated by a different action. **Failure point:** hard delete with no transaction guarantees; partial failure leaves orphans. **Missing protection:** no confirmation of the deleted count vs. the requested count before the toast fires.

---

# 4. Performance Audit

## P-1. Duplicate `questions` table fetch in `getContentEditorIndexData`
- **Bottleneck:** Entire `questions` table fetched twice per page render.
- **Root cause:** `Promise.all` at `src/lib/actions/admin/content.ts:187` fetches `question_id, topic_id, text`; a sequential second call at `src/lib/actions/admin/content.ts:226-229` fetches `article_id, question_type` from the same table, filtered only by `article_id is not null`.
- **Affected files:** `src/lib/actions/admin/content.ts`.
- **Severity:** Critical.
- **Confidence:** High (verified by direct file read).
- **Why it impacts speed:** Doubles the network payload and adds a second sequential roundtrip after the parallel batch completes. On a 5,000-row question bank this is measurable in hundreds of milliseconds and grows linearly.
- **Kind of fix:** Merge into the existing `Promise.all` by selecting `question_id, topic_id, text, article_id, question_type` once, then compute both the `searchableQuestions` array and the per-article count map from the single result.

## P-2. `getArticleFull` is uncached
- **Bottleneck:** Every admin article detail load is a cold DB read.
- **Root cause:** `src/lib/actions/admin/content.ts:336-348` issues a single select but is not wrapped in `unstable_cache`.
- **Affected files:** `src/lib/actions/admin/content.ts`, `src/app/admin/knowledge/[id]/page.tsx`.
- **Severity:** High.
- **Confidence:** High.
- **Why it impacts speed:** The wiki benchmark caches the equivalent read for 1 hour with tag-based invalidation. Admin forgoes this entirely, so every navigation re-hits the database even when nothing has changed.
- **Kind of fix:** Wrap in `unstable_cache` with tags `['admin-knowledge', 'article:${id}']`; invalidate on mutations via `revalidateTag`.

## P-3. Admin detail page runs four sequential batches
- **Bottleneck:** `src/app/admin/knowledge/[id]/page.tsx:24-44` executes auth → `getArticleFull` → `[taxonomyLinks, eiPrompts]` → `[questions, taxonomyNodes]` sequentially.
- **Root cause:** Batch 3 genuinely depends on `taxonomyLinks` from batch 2, but `eiPrompts` does not depend on `taxonomyLinks` and `getArticleFull` does not depend on auth outcome beyond the boolean gate.
- **Affected files:** `src/app/admin/knowledge/[id]/page.tsx`.
- **Severity:** High.
- **Confidence:** High.
- **Why it impacts speed:** Four serial roundtrips where two would suffice. Every detail page pays this tax.
- **Kind of fix:** Single `Promise.all` after auth covering `getArticleFull`, `eiPrompts`, and anything else taxonomy-independent; then a second `Promise.all` for the taxonomy-dependent queries.

## P-4. `buildTree` is O(nodes²) for descendant counts
- **Bottleneck:** Taxonomy construction re-walks every descendant per node.
- **Root cause:** `src/lib/actions/admin/content.ts:255-290` — `descendantQCount` at lines 267-273 walks the whole subtree for every node during `buildTree`.
- **Affected files:** `src/lib/actions/admin/content.ts`.
- **Severity:** Medium.
- **Confidence:** High.
- **Why it impacts speed:** For a 200-node taxonomy this is ~40k redundant visits. Not catastrophic today but scales badly and is a hot path on every index render.
- **Kind of fix:** Compute counts bottom-up in a single DFS — each node's count is its own questions plus the sum of its children's already-computed counts.

## P-5. `enrichedArticles` linear-scans links per article
- **Bottleneck:** O(A × L) instead of O(A + L).
- **Root cause:** `src/lib/actions/admin/content.ts:298-313` calls `links.find((l) => l.article_id === a.article_id && l.is_primary)` per article.
- **Affected files:** `src/lib/actions/admin/content.ts`.
- **Severity:** Medium.
- **Confidence:** High.
- **Why it impacts speed:** For 500 articles × ~1500 links this is 750k comparisons per render. Small now, embarrassing later.
- **Kind of fix:** Prebuild a `Map<article_id, primary_node_id>` from links in a single pass, then lookup by key.

## P-6. `filteredArticles` is four sequential filter passes
- **Bottleneck:** Four array allocations per recompute.
- **Root cause:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:195-225` runs four chained `.filter` calls over `localArticles`.
- **Affected files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx`.
- **Severity:** Low.
- **Confidence:** High.
- **Why it impacts speed:** 4× allocations and 4× passes where one combined predicate would suffice. Matters once articles > ~2000 or on low-end hardware.
- **Kind of fix:** Single `.filter` whose predicate composes all four conditions; keep `useMemo` deps unchanged.

## P-7. `getContentEditorIndexData` result not cached
- **Bottleneck:** Every server render of `/admin/knowledge*` re-runs all five queries.
- **Root cause:** No `unstable_cache` wrapper; no `export const revalidate` on the page files.
- **Affected files:** `src/lib/actions/admin/content.ts`, `src/app/admin/knowledge/page.tsx`, `src/app/admin/knowledge/questions/page.tsx`.
- **Severity:** High.
- **Confidence:** High.
- **Why it impacts speed:** Combined with every mutation calling `router.refresh()`, this makes the route's effective read cost pay the full data cost per interaction.
- **Kind of fix:** Wrap in `unstable_cache` with tag `admin-knowledge`; mutations in `src/lib/actions/admin/bulk.ts` call `revalidateTag('admin-knowledge')`.

## P-8. Questions table fetched when viewing articles
- **Bottleneck:** `/admin/knowledge` (articles view) loads the entire questions table even though the UI only needs per-article counts.
- **Root cause:** Shared loader `getContentEditorIndexData` cannot distinguish caller's view mode.
- **Affected files:** `src/lib/actions/admin/content.ts`, page files.
- **Severity:** Medium.
- **Confidence:** High.
- **Why it impacts speed:** A view that renders zero questions still pays for fetching all of them. For the questions view this is necessary; for the articles view it is waste.
- **Kind of fix:** Split into `getContentEditorArticlesData` and `getContentEditorQuestionsData`, or accept a `viewMode` arg that conditionally skips the heavy question select while still computing per-article counts via a `count` aggregation.

---

# 5. Infinite Loop and Re-render Risk Audit

## L-1. `QuestionsTableClient` re-fetches on every parent re-render
- **Issue:** Effect at `src/components/admin/QuestionsTableClient.tsx:458-460` depends on `handleNodeSelect`, which is a `useCallback` with `[taxonomyTree, externalSelectedNodeId, debouncedSearchQuery]` deps (`src/components/admin/QuestionsTableClient.tsx:420-456`).
- **Why risky:** `taxonomyTree` is passed as a prop from `ContentEditorIndex`, which receives a new reference from the server on every `router.refresh()`. Any mutation anywhere in the owning page triggers a refresh → new `taxonomyTree` identity → new `handleNodeSelect` identity → effect fires → `getQuestionsByTopicIds` runs with the same arguments.
- **Trigger:** Saving a question. Saving an article. Bulk-deleting anything. Creating anything.
- **User-facing symptom:** Table flashes a loading state and re-renders. On a slow DB the flash is a multi-hundred-ms freeze. On any DB it wastes a roundtrip per mutation.
- **Additional double-trigger:** `debouncedSearchQuery` appears in both the `useCallback` deps AND the effect deps. On a search change the callback identity changes AND `debouncedSearchQuery` changes — the effect's dep check fires once (new function ref), then the new function has the new query bound, producing a single intended fetch but via a fragile path. If React batches identity comparison differently in a future version, this becomes two fetches.
- **Severity:** Critical.
- **Confidence:** High.
- **Remediation direction:** Remove `handleNodeSelect` from the effect's dep array by either (a) inlining the body into the effect, or (b) storing the latest function in a ref and invoking `ref.current(activeNodeId)`. The effect's true dependencies are `activeNodeId` and `debouncedSearchQuery` only — nothing else should re-run it.

## L-2. `localArticles` mirror-prop state race
- **Issue:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:144` initialises `localArticles` from `articles`; `src/components/admin/unified-editor/ContentEditorIndex.tsx:156-158` writes `articles` back into `localArticles` on every prop change.
- **Why risky:** The optimistic bulk-delete at `src/components/admin/unified-editor/ContentEditorIndex.tsx:259-284` mutates `localArticles` and immediately triggers `router.refresh()`. When the server response lands, the effect at line 156 overwrites the optimistic state with the server version. If server revalidation is incomplete (cache staleness, race with a parallel mutation, partial bulk failure), the overwrite is wrong.
- **Trigger:** Any bulk-delete. Any save that triggers `router.refresh()` while an optimistic state exists.
- **User-facing symptom:** Articles reappear in the list after being archived. Selection state (`selectedArticleIds`) retains IDs for archived articles, producing undefined behaviour if the user triggers a second action on the stale selection.
- **Severity:** Critical.
- **Confidence:** High.
- **Remediation direction:** Delete `localArticles`. Render directly from the `articles` prop. Track optimistic archival in a separate `pendingArchiveIds: Set<string>` that is merged into filter predicates. Clear `pendingArchiveIds` on effect keyed by `articles` identity — safe because the set only holds IDs the server should have removed, and stale-ID clears are harmless.

## L-3. `selectedArticleIds` can reference archived articles
- **Issue:** `selectedArticleIds` at `src/components/admin/unified-editor/ContentEditorIndex.tsx:142` is never reconciled against the current `articles` list.
- **Why risky:** After a bulk-delete clears the archived rows from the list, the `Set` still holds those IDs. A subsequent bulk-action button reads from the stale set and operates on non-existent rows. Downstream actions (`bulkDeleteArticles`) silently no-op on unknown IDs or return partial success.
- **Trigger:** Any mutation that removes articles while a selection is active.
- **User-facing symptom:** Button labels showing "3 selected" when only 1 visible row is actually selectable; inconsistent bulk-action results.
- **Severity:** High.
- **Confidence:** High.
- **Remediation direction:** Derive selection via `useMemo` against the current article list: `selectedArticleIds.intersection(new Set(articles.map(a => a.article_id)))`. Or reset selection after any mutation.

## L-4. `updateUrl` callback identity churn (latent loop risk)
- **Issue:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:161-167` — `updateUrl` useCallback depends on `[router, searchParams]`. `searchParams` is a fresh `ReadonlyURLSearchParams` on every render after `router.replace`. So `updateUrl` gets a new identity every time it's used.
- **Why risky today:** Not currently in any `useEffect` dep array, so no loop today.
- **Why risky tomorrow:** Any future effect that adds `updateUrl` to its deps would immediately produce an infinite loop on first interaction. The pattern is a footgun.
- **Trigger:** None today.
- **User-facing symptom:** None today.
- **Severity:** Low today / High if touched.
- **Confidence:** High.
- **Remediation direction:** Drop `searchParams` from deps by reading it via `useSearchParams()` ref at call time, or switch to URL manipulation via `window.location.search` inside the callback body.

## L-5. URL→state sync effects at `146-148` and `150-154`
- **Issue:** Two effects that write `searchParams.get(...)` into component state.
- **Why risky:** These run on every URL change, overwriting any local state changes the user may have made concurrently. The pattern is standard but easy to break — any future code that does `setSelectedNodeId(...)` followed by a route push would create a "user action → URL push → effect → overwrite" cycle if the effect's setter value happened to equal the new URL's value by coincidence only on the first pass.
- **Trigger:** URL change with stale searchParams.
- **User-facing symptom:** None observed today; risk activates with further state additions.
- **Severity:** Low.
- **Confidence:** Medium.
- **Remediation direction:** Treat `searchParams` as the single source of truth — derive view state directly via `useMemo` over `searchParams.get(...)` instead of `useState` + effect.

## L-6. `bulkDeleteArticles` revalidates `wiki` tag, not `admin-knowledge`
- **Issue:** `src/lib/actions/admin/bulk.ts:28-49` fires `revalidateTag('wiki','max')`. There is no `admin-knowledge` tag anywhere, and `getContentEditorIndexData` is uncached anyway.
- **Why risky (for loops specifically):** Not a direct loop, but contributes to the L-1 cascade: mutation → `router.refresh()` → new server data → new `taxonomyTree` reference → `QuestionsTableClient` re-fetch.
- **Trigger:** Every bulk delete.
- **Severity:** Medium.
- **Confidence:** High.
- **Remediation direction:** When P-7 introduces the `admin-knowledge` cache tag, mutations fire `revalidateTag('admin-knowledge')` and optionally skip `router.refresh()` entirely, relying on Next.js's automatic invalidation.

---

# 6. Dashboard Wiki Parity Analysis

## Shared (already aligned)
- Underlying tables: `wiki_articles`, `wiki_article_taxonomy`, `taxonomy_tree`, `questions`.
- Cache tag namespace: both use the `wiki` tag (though admin fires it without having a cache of its own to invalidate).
- Design tokens and surface hierarchy via `.ai/rules/design.md`.

## Divergent (different pattern, defensible)
- **Data loader shape.** Wiki does one cached primary read then a single parallel batch. Admin runs a monolithic five-query action per render.
- **Cache strategy.** Wiki wraps `getCachedArticleAndNode` in `unstable_cache`. Admin caches nothing.
- **Detail page.** Wiki is a cached primary read plus one `Promise.all`. Admin is four sequential batches.

## Missing (admin should have these)
- **Cached detail fetch.** `getArticleFull` needs an `unstable_cache` wrapper with per-article tag.
- **Cache tag for index.** `admin-knowledge` tag does not exist. Until it does, `revalidateTag` calls from admin mutations are no-ops for admin's own reads.
- **Parallel detail batch.** Admin detail page should mirror wiki's single post-auth `Promise.all`.
- **Loading boundaries.** Wiki has `loading.tsx`; admin knowledge does not ship visible Suspense-backed skeletons at the detail level.

## Architecture to unify
- Introduce a `cached-queries-admin.ts` module paralleling `src/lib/actions/cached-queries.ts`. Move `getArticleFull` there wrapped, and add a cached `getContentEditorIndexData` variant with the double-fetch fix applied.
- Standardise the mutation → `revalidateTag` pattern across `src/lib/actions/admin/bulk.ts` so every bulk action fires every relevant tag (admin-knowledge + wiki).

## Patterns to inherit verbatim
- `unstable_cache(..., { tags: [...], revalidate: 3600 })` from `src/lib/actions/cached-queries.ts`.
- Single post-auth `Promise.all` from `src/app/dashboard/wiki/[slug]/page.tsx:59-66`.
- Render directly from server props; no prop-mirror-into-state.

---

# 7. Prioritized Implementation Plan

## Phase 1 — Critical stability & correctness

### 1.1 Merge the double-questions fetch in `getContentEditorIndexData`
- **Goal:** Fetch the `questions` table once per page render.
- **Files:** `src/lib/actions/admin/content.ts:187-230`.
- **Action:** Expand the first query's select list to `question_id, topic_id, text, article_id, question_type`. Remove the sequential second query at lines 226-229. Compute both `searchableQuestions` (filter by `topic_id` presence) and the per-article count map from the single result set.
- **Expected impact:** Roughly halves the page's data cost and removes one sequential roundtrip. Highest-ROI change in the plan.
- **Dependency:** None. Ships first.
- **Risk if not fixed:** Continued doubled network cost, which scales linearly with question bank growth.

### 1.2 Stop `QuestionsTableClient` re-fetching on every parent re-render
- **Goal:** The question-bank fetch runs only when `activeNodeId` or `debouncedSearchQuery` changes, never because of identity churn in props.
- **Files:** `src/components/admin/QuestionsTableClient.tsx:420-460` (effect + callback), `:497` (tree `onSelect` call site).
- **Action:** Extract the fetch body into a **shared module-level async function** in `QuestionsTableClient.tsx` (not a new file):
  ```ts
  async function fetchQuestionsForNode(
    nodeId: string | null,
    query: string,
    tree: TaxonomyNode[],
  ): Promise<{ data: QuestionGroup[] } | null>
  ```
  Returns the question-group data or `null` for no-op cases (null node + no query). Callers are responsible for dispatching their own loading/error state and calling `setNodeGroups`. The effect at lines 458-460 calls `fetchQuestionsForNode(activeNodeId, debouncedSearchQuery, taxonomyTree)` with effect deps `[activeNodeId, debouncedSearchQuery]` — NO callback in the dep array. The tree `onSelect` at line 497 also calls this function. Fetch logic stays in one place; dep-array churn is eliminated.
- **Alternative considered and rejected:** React 19 `cache()` from `react` was considered but does NOT stabilise prop reference identity across renders — it dedupes function-call results within a single request. Incorrect mechanism for this problem. Dropped.
- **Observability:** Add a dev-only `console.debug('[QuestionsTable] fetch', { nodeId, query })` inside the fetch path. Before/after verification of the fix is a one-line grep of that log during a save → expect exactly zero logs from mutations, exactly one log per deliberate node-selection or search.
- **Expected impact:** Eliminates the per-mutation ghost fetch. Saving any article or question no longer triggers a questions-table re-query.
- **Dependency:** None.
- **Risk if not fixed:** Every mutation continues to pay an unnecessary question-bank fetch; scales with usage intensity.

### 1.3 Remove `localArticles` mirror; track optimistic archives separately
- **PR gate:** Ships in **PR 2a**, not PR 1 or PR 2b. This is a behavioral change, not a refactor. It must not share a PR with pure refactors (PR 1) or with caching (PR 2b).
- **Goal:** Eliminate the optimistic-vs-server race (which becomes *actually dangerous* only after Phase 2.5 caching lands — see §5 L-2 and Architect's steelman) and the stale selection bug.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:142-158, 195-284`.
- **Action:** Delete `localArticles` state and the effect at lines 156-158. Render from the `articles` prop directly. Add `pendingArchiveIds: Set<string>`; include it in the `filteredArticles` predicate to hide optimistically-archived rows.
- **Critical clearing condition (REVISED):** Clear `pendingArchiveIds` **per-ID, only when that specific ID is absent from the incoming `articles` list**. Do NOT clear the whole set on `articles` identity change — that produces a new bug class (out-of-order Next.js revalidation can clear the set before the server state catches up, flashing archived rows back). Implementation: in a `useEffect([articles])`, compute `next = new Set([...pendingArchiveIds].filter(id => articles.some(a => a.article_id === id && a.status !== 'archived')))`; only set if `next.size !== pendingArchiveIds.size`.
- **Selection reconciliation:** Reconcile `selectedArticleIds` against the currently-rendered articles via a derived `useMemo`: `useMemo(() => new Set([...selectedArticleIds].filter(id => visibleArticleIdSet.has(id))), [selectedArticleIds, visibleArticleIdSet])`. Or reset selection after any bulk mutation.
- **Bundled dependency — Phase 3.3 ships with this item**, not later. Per-row failure reporting must land simultaneously with the mirror removal; otherwise a partial bulk failure under the new architecture produces a worse UX than the current (silent) failure mode.
- **Observability:** Add a dev-only `console.debug('[ContentEditorIndex] optimistic archive', { ids, pendingCount })` on archive trigger, and `console.debug('[ContentEditorIndex] pending cleared', { ids })` on the per-ID clear. Before/after verification: expect no "pending cleared" log until the server actually reflects the archive.
- **Rollback plan:** Guard the new path behind a module-local `const USE_PENDING_ARCHIVE_SET = true` constant flag. If shipped broken, flip to `false` in a hotfix PR to restore the old `localArticles` mirror path. Both code paths live side-by-side until **PR 2b has been in production for at least 7 days with no rollback triggered**, at which point a dedicated cleanup commit removes `USE_PENDING_ARCHIVE_SET`, the mirror state, and the legacy effect. Removal is the responsibility of whoever owns PR 2b's deploy and must be tracked as a follow-up task before 2b ships.
- **Un-archive scope (Q10):** Un-archive flows are OUT OF SCOPE for PR 2a. `pendingArchiveIds` is strictly one-way. If `UnifiedContentEditor` or any future admin surface introduces an un-archive path before PR 2a ships, file a follow-up to add a symmetric `pendingUnarchiveIds` set — do not retrofit into 1.3's initial diff.
- **Expected impact:** Fixes the confirmed optimistic-update clobber bug (once 2.5 introduces the staleness that makes it observable) and the stale selection bug (observable today).
- **Dependency:** Review alongside 1.2 conceptually, ship in PR 2a.
- **Risk if not fixed:** Stale selection bug today; archive-flicker / silent loss once caching lands.

## Phase 2 — Performance & speed

### 2.1 Wrap `getArticleFull` in `unstable_cache`
- **PR gate:** Ships in **PR 1** (pure refactor).
- **Goal:** Admin article detail loads become cache-hits after the first read.
- **Files:** `src/lib/actions/admin/content.ts:336-348`; new `src/lib/actions/admin/cached-queries.ts` if a dedicated module is preferred.
- **Client choice (CRITICAL):** Follow the wiki benchmark verbatim — the wrapped function must use `createStaticClient()` from `@/lib/supabase/server`, not `createClient()`. `cached-queries.ts:4` imports `createStaticClient`; `cached-queries.ts:27, 41, 64, 107, 150` uses it throughout. The comment at `cached-queries.ts:22` explicitly states "Global data caches (same for all users, revalidate hourly)". An authenticated client inside `unstable_cache` would cache one user's RLS-filtered result and serve it to every subsequent reader — a cross-user data leak. See §9 Q11 for the RLS verification prerequisite.
- **Action:** Create wrapped function that uses `createStaticClient()`, selects the same columns from `wiki_articles`, wrapped with `unstable_cache` using tags `['admin-knowledge', 'article:${id}']` and `revalidate: 3600`. Update `src/lib/actions/admin/bulk.ts` and the article update action to `revalidateTag('article:${id}')` on save.
- **Pre-flight check:** Verify that `wiki_articles` table has no RLS policy that would filter columns selected here (title, slug, content, status, etc.) by user — i.e., that every admin sees identical data for the same `article_id`. If RLS is per-author or per-tenant, this plan item is blocked and must be replaced with per-request React `cache()` dedup instead.
- **Expected impact:** Detail page goes from ~one DB roundtrip on every load to cache-hit on repeat views within the hour.
- **Dependency:** RLS pre-flight must pass.
- **Risk if not fixed:** Detail page stays slow and scales poorly.

### 2.2 Flatten `src/app/admin/knowledge/[id]/page.tsx` sequential batches
- **PR gate:** Ships in **PR 1**.
- **Goal:** Reduce four sequential DB roundtrips to two.
- **Files:** `src/app/admin/knowledge/[id]/page.tsx:24-44`.
- **Action:** Parallelise `getArticleFull`, `eiPrompts`, and `taxonomyLinks` in a single `Promise.all` after auth. Follow with a second `Promise.all` for the taxonomy-dependent `[questions, taxonomyNodes]` pair. Place the `notFound()` gate after the first `Promise.all` resolves.
- **Tradeoff acknowledged:** Running `eiPrompts` and `taxonomyLinks` in parallel with `getArticleFull` means both queries fire even when `getArticleFull` returns null (non-existent article → notFound). Their cost is trivial (one indexed lookup each) and the speedup for the common path is substantial. Accept this as a deliberate trade.
- **Expected impact:** ~2× detail-page server response speedup on a warm DB.
- **Dependency:** Ideally after 2.1 so `getArticleFull` is cached.
- **Risk if not fixed:** Detail pages stay sluggish even after caching lands.

### 2.3 `buildTree` single-pass descendant counts
- **Goal:** Replace O(N²) with O(N).
- **Files:** `src/lib/actions/admin/content.ts:255-290`.
- **Action:** Compute descendant question counts bottom-up: each node's count is its own plus the sum of already-computed child counts. Drop `descendantQCount`.
- **Expected impact:** Near-instant taxonomy build even for large trees; removes a future scaling cliff.
- **Dependency:** None.
- **Risk if not fixed:** Scales badly as taxonomy grows.

### 2.4 `enrichedArticles` O(A+L) map lookup
- **Goal:** Replace per-article linear scan with prebuilt map.
- **Files:** `src/lib/actions/admin/content.ts:298-313`.
- **Action:** Before the map, build `const primaryNodeByArticle = new Map<string, string>()` from `links` in one pass; use `.get(a.article_id)` inside the article map.
- **Expected impact:** Measurable at ≥500 articles, dramatic at ≥2000.
- **Dependency:** None.
- **Risk if not fixed:** Index render time scales with article × link product.

### 2.5 Cache `getContentEditorIndexData` with tag — **BLOCKED ON RLS AUDIT**
- **PR gate:** Ships in **PR 2b**, only after PR 2a is in production and §9 Q11b resolves.
- **Goal:** Introduce `admin-knowledge` cache tag so mutation invalidation actually does something.
- **CRITICAL SECURITY NOTE:** `getContentEditorIndexData` at `src/lib/actions/admin/content.ts:184` calls `createClient()` — the authenticated SSR client that applies Row-Level Security per user. Wrapping an authenticated-client query in `unstable_cache` caches the first reader's RLS-filtered result set and serves it to every subsequent reader. If admin RLS is uniform across all admins (every admin sees the same articles/questions/taxonomy), this is safe. If admin RLS is per-author, per-tenant, or per-role, it is a **cross-user data leak**. The wiki benchmark avoids this by using `createStaticClient()` at `cached-queries.ts:27, 41, 64, 107, 150` — a non-authenticated client reading only public data. See `cached-queries.ts:22` comment: "Global data caches (same for all users, revalidate hourly)".
- **Files:** `src/lib/actions/admin/content.ts:183-331`, `src/lib/actions/admin/bulk.ts:9-49`.
- **Decision tree (pick exactly one path based on §9 Q11 resolution):**
  - **Path A — RLS is uniform across admins.** Convert the loader to `createStaticClient()`, wrap with `unstable_cache` tagged `['admin-knowledge']` revalidate 300s. Mutations fire `revalidateTag('admin-knowledge')`.
  - **Path B — RLS is per-user/per-tenant.** Do NOT wrap in `unstable_cache`. Instead, wrap in React 19 `cache()` from `react` to dedupe within a single request pass only. Accept that navigation-level caching is not available; rely on `revalidatePath` + client-side stability fixes from Phase 1 for perceived-speed gains.
  - **Path C — Hybrid.** Wrap only the user-agnostic subqueries (taxonomy tree, article-taxonomy link map) in `unstable_cache` via `createStaticClient()`, keep the article/question selects in the authenticated client uncached. Requires refactoring `getContentEditorIndexData` into two composed functions.
- **Action (deferred until path chosen):** Implement the chosen path; update mutations accordingly.
- **Expected impact (Path A):** Navigation back to `/admin/knowledge` becomes a cache hit when nothing has changed. (Path B): per-request dedup only; no cross-navigation cache. (Path C): partial cache hit on tree/taxonomy, live reads on article list.
- **Dependency:** §9 Q11 resolved; PR 1 merged; Path A/B/C decision made with stakeholder sign-off.
- **Risk if not fixed:** Index route stays fully dynamic; every visit pays the full data cost. This is acceptable for now — the plan's Phase 1 bug fixes address the pain on the critical path without needing cross-navigation caching.
- **Risk if fixed incorrectly (Path A without RLS verification):** Cross-user data leak, potentially a security incident. This is why the plan gates 2.5 behind §9 Q11.

### 2.6 Split articles-view and questions-view data loading
- **Goal:** Stop fetching all articles when rendering the questions view and vice versa.
- **Files:** `src/lib/actions/admin/content.ts`, both page files.
- **Action:** Either (a) introduce a `viewMode` arg to `getContentEditorIndexData` that conditionally skips heavy selects, or (b) split into two separate loaders called from the two separate pages.
- **Expected impact:** Questions view no longer pays for articles; articles view no longer pays for the full question payload (just the count map).
- **Dependency:** After 1.1 so the merged single fetch is in place.
- **Risk if not fixed:** Both routes subsidise each other's cost.

## Phase 3 — UX responsiveness & polish

### 3.1 Suspense boundaries on `[id]/page.tsx`
- **Goal:** Independent sections stream as they resolve.
- **Files:** `src/app/admin/knowledge/[id]/page.tsx`.
- **Action:** Wrap the taxonomy panel, questions panel, and EI prompts panel in separate `<Suspense>` boundaries with skeletons.
- **Expected impact:** Perceived load time drops — fast queries render immediately while slow ones stream.
- **Dependency:** 2.2.

### 3.2 `filteredArticles` single-pass predicate
- **Goal:** Drop four filter chains to one.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:195-225`.
- **Action:** Compose the four conditions into a single predicate inside one `.filter`. Preserve the memo deps.
- **Expected impact:** Lower JS allocation pressure on the client; visible only at large article counts.
- **Dependency:** 1.3 (because `localArticles` is removed; predicate now runs against `articles`).

### 3.3 Consistent bulk-action toasts with per-row failure reporting
- **Goal:** Users know which rows failed on partial bulk failures.
- **Files:** `src/lib/actions/admin/bulk.ts`, `ContentEditorIndex.tsx` delete handler.
- **Action:** Return `{ succeeded: string[]; failed: Array<{id: string; reason: string}> }` from bulk actions; toast summary; reselect failed IDs for retry.
- **Expected impact:** Removes silent-failure UX.
- **Dependency:** 1.3.

### 3.4 `updateUrl` callback stabilisation
- **Goal:** Remove the latent footgun in L-4.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:161-167`.
- **Action:** Read `searchParams` via `usePathname()` + `new URLSearchParams(window.location.search)` at call time; drop `searchParams` from deps.
- **Expected impact:** Prevents a whole class of future loops.
- **Dependency:** None.

## Phase 4 — Cleanup & architectural unification

### 4.1 Extract admin cached-queries module
- **Goal:** Mirror `src/lib/actions/cached-queries.ts` shape for admin.
- **Files:** New `src/lib/actions/admin/cached-queries.ts`; move `getArticleFull` and cached `getContentEditorIndexData` variants in.
- **Expected impact:** Consistent caching conventions across the app.
- **Dependency:** 2.1, 2.5.

### 4.2 URL-as-state refactor
- **Goal:** Drop `useState` + effect sync for `viewMode` and `selectedNodeId`; derive from `searchParams`.
- **Files:** `src/components/admin/unified-editor/ContentEditorIndex.tsx:128-154`.
- **Action:** Replace `useState` with `useMemo` over `searchParams.get(...)`. Writes push to the URL via `router.replace`; reads are always from URL.
- **Expected impact:** Smaller state surface, fewer effects, easier to reason about.
- **Dependency:** 3.4.

### 4.3 Standardise mutation → revalidate pattern
- **Goal:** Every admin mutation fires a documented set of tags.
- **Files:** `src/lib/actions/admin/bulk.ts`, other admin mutation actions.
- **Action:** Shared helper `revalidateAdminKnowledge(articleIds?: string[])` that fires `admin-knowledge`, `wiki`, and per-article tags. Called from every relevant mutation.
- **Expected impact:** Predictable invalidation; no "which tag do I fire" drift as new features land.
- **Dependency:** 2.5.

---

# 8. Fastest Wins

These are the highest-value, lowest-risk changes — start here. All seven ship together as **PR 1** with low review burden.

1. **Merge the double-questions fetch (1.1).** One function, ~15 lines changed, halves the admin-knowledge data payload. No UI change, no state change, no risk. **Before/after verification:** open Chrome DevTools Network tab, reload `/admin/knowledge`, filter for `questions` — expect exactly one Supabase fetch to the `questions` table, not two.
2. **Stop `QuestionsTableClient` re-fetching on parent re-render (1.2).** Extract `fetchQuestionsForNode` shared helper; effect deps become `[activeNodeId, debouncedSearchQuery]`. Eliminates a ghost fetch on every mutation in the owning page. **Before/after verification:** add the dev-only `console.debug('[QuestionsTable] fetch', ...)` log; open `/admin/knowledge/questions`, save an article via the editor, confirm zero new log entries appear in the console.
3. **`enrichedArticles` map lookup (2.4).** Five-line change from `.find` to `Map.get` with a map prebuild. No behaviour change, immediate algorithmic win.
4. **`buildTree` single-pass (2.3).** Localised to one function; no external behaviour change.
5. **Cache `getArticleFull` (2.1) — gated on §9 Q11a RLS audit.** Wrap with `createStaticClient()` + `unstable_cache`. Immediate detail-page speedup once the RLS verification confirms the cache is safe. If Q11a blocks this item, ship the other six without it. **Before/after verification:** navigate to `/admin/knowledge/[sampleId]`, measure server-log timing; reload twice; second and third loads should show "cache hit" (no Supabase query log for `wiki_articles.select`).
6. **Flatten detail page batches (2.2).** No caching dependency; pure parallelization gain. **Before/after verification:** add timing logs around both `Promise.all` blocks in `[id]/page.tsx`; confirm total is ~`max(batch1) + max(batch2)`, not sum of all four queries.
7. **Fix latent `updateUrl` footgun (3.4).** Drop `searchParams` from the `useCallback` deps.

**Non-regression grep gate (required before any PR 1 merge):**
```bash
grep -rn "getArticleFull\|getContentEditorIndexData\|QuestionsTableClient" src/app/dashboard src/components/wiki
```
Expect **zero hits**. If any hit appears, wiki has a hidden dependency on admin code and PR 1's scope containment claim is false; stop and reassess.

**Phase 1.3 (`localArticles` removal) is NOT in Fastest Wins.** It ships in PR 2a alongside Phase 3.3. Phase 2.5 ships separately in PR 2b only after PR 2a is in production and Q11b resolves. Neither PR 2a nor PR 2b shares review with PR 1.

---

# 9. Open Questions That Must Be Verified Before Implementation

1. **Is there a production `admin-knowledge` cache story already in flight?** Nothing in the codebase suggests so, but before adding the `admin-knowledge` tag, verify no parallel work on the design-system-cleanup or payment-decoupling branches introduces one.
2. **Do the bulk actions need `revalidateTag('wiki','max')` preserved when the new `admin-knowledge` tag lands?** The wiki cache is a real consumer; removing the wiki tag would silently stale the dashboard. Assumption: keep both. Needs confirmation that `wiki` tag is still the correct wiki-side invalidation handle (the wiki benchmark uses `['wiki','taxonomy']` tags — both should fire).
3. **What is the actual question-table row count in production?** The plan assumes a scale where the double fetch is measurable. If the table is under a few hundred rows today, the fix is still correct but the observable win is smaller. Either way, fix first — the bug is the bug.
4. **Does `QuestionEditor` call `router.refresh()` or a more targeted revalidation?** The Explorer notes point at `router.refresh()` but the file was not read directly in the evidence pass. Verify before Phase 2.5 so the cache invalidation story is complete.
5. **Is there an existing `loading.tsx` under `src/app/admin/knowledge/`?** Phase 3.1 Suspense boundaries interact with it. If one exists, skeletons should match its surface hierarchy.
6. **Does `UnifiedContentEditor` also mirror props into state?** Explorer reported a `router.refresh()` at line 264 but the component was not read directly. If it has the same pattern as `ContentEditorIndex`, Phase 1.3 may need a twin fix.
7. **Are there any admin routes outside `/admin/knowledge*` that import `ContentEditorIndex`?** A grep will confirm. If so, the state-refactor in Phase 1.3 must be verified against every caller.
8. **Does `taxonomyTree` actually need to be a new reference on every server refresh, or could it be memoised via `cache()` from `react`?** This is the cheapest possible fix for L-1 if acceptable — the React 19 `cache()` primitive would stabilise identity across the same render pass, which may be sufficient even without touching the client effect.
9. **What is the target staleness window for `admin-knowledge`?** Phase 2.5 proposes 300s. If editors need to see another editor's changes immediately, the window shrinks to 0 and the cache becomes tag-only. Product decision required.
10. **Are soft-archived articles ever un-archived from the admin surface?** (RESOLVED — see §7 1.3: out of scope for PR 2a; `pendingArchiveIds` is strictly one-way. If un-archive is discovered during Q6 investigation, file a follow-up for a symmetric `pendingUnarchiveIds` set.)

11a. **[BLOCKING PR 1 Phase 2.1 — HIGHEST PRIORITY] Does RLS on `wiki_articles` permit uniform reads across all admin roles for the columns selected by `getArticleFull`?** Concretely: query the Supabase project for RLS policies on `wiki_articles`. If every admin role (`admin`, `editor`, `content_manager`, `owner`, etc.) receives identical row data for the same `article_id`, then Phase 2.1's `createStaticClient()` + `unstable_cache` wrap is safe. If the policy is per-author or conditional on a user attribute, Phase 2.1 is blocked — either cache with a user-scoped key (defeats much of the benefit) or switch to React 19 `cache()` for per-request dedup only. **This question gates Phase 2.1 and must be resolved before PR 1 begins.** If it is still unresolved when PR 1 is otherwise ready, ship items 1.1, 1.2, 2.2, 2.3, 2.4, 3.4 without 2.1.

11b. **[BLOCKING PR 2b Phase 2.5] Does admin RLS permit uniform reads across all admin users on all four tables read by `getContentEditorIndexData` (`wiki_articles`, `questions`, `taxonomy_tree`, `wiki_article_taxonomy`)?** Concretely: enumerate RLS policies on all four tables across all admin roles. If uniform, Path A (full cache) of Phase 2.5 is safe. If not, pick Path B (React `cache()` only) or Path C (hybrid — cache user-agnostic subqueries only). **This question must be resolved before any work on Phase 2.5 begins.** Strictly more demanding than Q11a because `questions` and `wiki_article_taxonomy` are more likely to have author/owner-scoped RLS than `wiki_articles`.

All twelve are genuine unknowns, not stand-ins for investigation laziness. **Q4 (`QuestionEditor` save path)** and **Q6 (`UnifiedContentEditor` state shape)** must be resolved **before PR 1 begins**, because both affect the correctness of Phase 1.2's and Phase 2.1's fixes (both depend on knowing what else calls `router.refresh` or mirrors props). **Q11a** is blocking for Phase 2.1 in PR 1. **Q11b** is blocking for Phase 2.5 in PR 2b only. **Q10 (un-archive flow)** is blocking for PR 2a (Phase 1.3) — resolved in §7 1.3 as "out of scope, one-way only."

---

# Appendix: Round 2 Follow-up Findings

A second investigative pass read ~11 files the first pass skipped: `UnifiedContentEditor.tsx`, `SaveAllBar.tsx`, `question-queries.ts` (full), `cache-tags.ts`, `supabase/server.ts` references, `BulkActionBar.tsx`, `TaxonomyTree.tsx`. This appendix records **new findings not covered above**. It does not modify the existing phases — each item carries its own PR gate and priority.

## A.1 — Resolved Open Questions

- **§9 Q6 (`UnifiedContentEditor` state shape): RESOLVED — NO mirror-prop anti-pattern.** Verified at `src/components/admin/unified-editor/UnifiedContentEditor.tsx:49-70`. The component uses nine independent `useState` hooks seeded from `initialArticle` fields, not a mirror of the whole `article` object. Updates are granular and flow through `dirty.markArticleDirty()`. **Phase 1.3's mirror-removal does NOT need a twin fix here — the pattern is admin-local to `ContentEditorIndex.tsx` only.** Remove §9 Q6 from PR 1 prerequisites.

- **§9 Q4 (`QuestionEditor` mutation path): PARTIALLY RESOLVED — save path flows through `SaveAllBar`, not a direct `router.refresh()`.** `UnifiedContentEditor.tsx:264` calls `router.refresh()` exactly once, in the `onSaveComplete` callback, and only if the save was an update (not a create — creates go through `router.replace` at line 260). `SaveAllBar.tsx` fires the actual server actions. Phase 1.2's fix in `QuestionsTableClient` does not depend on this path, so Q4 can be downgraded from "PR 1 blocker" to "informational". **Updated gate: Q4 is no longer blocking for PR 1.**

- **§9 Q5 (loading.tsx skeletons): OUT OF SCOPE for performance audit.** The loading files were read during the prior UX audit and contain the same hardcoded-viewport-math bug tracked there. No performance finding here.

## A.2 — NEW High Finding: `getQuestionsByTopicIds` runs 3 sequential DB batches on every tree selection

- **File:** `src/lib/actions/admin/question-queries.ts:170-278`
- **Evidence:**
  - Batch 1 (lines 178-192): fetches from `questions` with `select('question_id, text, topic_id, article_id, question_type, difficulty, rationale, options, code_citation, created_at, updated_at')` — **11 columns including JSONB `options`** — `.limit(500)`
  - Batch 2 (lines 207-219): fetches from `wiki_articles` for any `directArticleIds` extracted from batch 1 result
  - Batch 3 (lines 226-244): fetches from `wiki_article_taxonomy` with `wiki_articles!inner` join for any `uniqueTopics` from batch 1
  - All three batches run **sequentially** — each awaits before the next
- **Trigger:** Every taxonomy-node click in the questions view. Every debounced search in questions mode. Both are frequent, user-initiated interactions.
- **User-facing symptom:** Noticeable latency between clicking a tree node and seeing questions. Compounds with the L-1 churn fix (because L-1's fix means fewer ghost fetches, but the deliberate fetches still pay 3 roundtrips each).
- **Severity:** **High** (downgraded from Critical per Critic round 2: tree-click is a user-initiated, debounced path — ~300-450ms added latency is noticeable but not "blocking"; reserve "Critical" for render-path hot items like the L-1 churn loop from first pass)
- **Confidence:** **High**
- **Kind of fix:** Merge batch 1 with a Supabase foreign-key join so the `wiki_articles` direct-ownership data rides along with the questions query — `.select('question_id, ..., wiki_articles!left(article_id, title, status)')`. Batch 3 (topic → article via `wiki_article_taxonomy`) can run in parallel with a `Promise.all` against batch 1, because its inputs (`uniqueTopics`) are known from the `topicIds` arg before batch 1 runs — `uniqueTopics` is actually derived from batch 1's result today (line 223), but could be derived from the input `topicIds` parameter instead, freeing it to run in parallel. Verify: does `uniqueTopics` ever contain topic IDs not present in `topicIds`? If no, parallelize; if yes, merge differently.
- **Phase recommendation:** **PR 1, appendix item `A.2-PR1`** (renamed from `2.7` to avoid phase-number collision with §7's existing 2.x numbering) — pure refactor, no behavior change, measurable latency win on every tree click. Highest-value new finding in this appendix.
- **Observability:** Add dev-only timing logs around the three Supabase calls in `getQuestionsByTopicIds`; assert total duration after fix is `max(batch1, batch3) + max(batch2_if_dependent)` rather than sum of three.

## A.3 — NEW High Finding: 10-second autosave interval uses `window.dispatchEvent` custom-event pub/sub

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:193-200`
- **Evidence:**
  ```tsx
  useEffect(() => {
    const interval = setInterval(() => {
      if (dirty.isAnythingDirty && !isSaving) {
        window.dispatchEvent(new CustomEvent('unified-editor:save'))
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [dirty.isAnythingDirty, isSaving])
  ```
- **Issue 1 — no debouncing vs typing activity (PENDING VERIFICATION):** The interval fires every 10 seconds regardless of whether the user is actively typing. A user editing for 60 seconds triggers 6 autosaves. Each autosave runs `SaveAllBar.doSave`. The magnitude claim "21 server actions every 10 seconds for 20 dirty questions" assumes every dirty-flagged question re-fires every cycle — **this is unverified** because `SaveAllBar.tsx` lines 200-500 were not read (see A.10). If `SaveAllBar` clears dirty flags on successful save, actual waste is bounded to actively-edited items. If it does not, the claim stands. Verify `SaveAllBar` lines 200-500 before sizing the fix.
- **Issue 2 — custom event pub/sub is fragile:** Using `window.dispatchEvent` as the save signal means (a) any other component could accidentally subscribe or dispatch it, (b) unmounting `SaveAllBar` mid-dispatch loses the save, (c) the save handler cannot be easily unit-tested because it's wired through a global event bus instead of a prop. A direct callback or a ref pattern would be equally effective and testable.
- **Issue 3 — interval cleanup races unmount:** If the component unmounts during a dispatched save, the in-flight save completes but its state writes may target a stale component tree.
- **Severity:** **High**
- **Confidence:** **High**
- **Kind of fix:** Replace `setInterval` + `dispatchEvent` with a debounced save trigger that resets on keystroke (e.g., `setTimeout(save, 3000)` reset on every dirty-state change), plus a direct ref or callback prop from `UnifiedContentEditor` to `SaveAllBar`. Drop the `window` event bus.
- **Phase recommendation:** **PR 2a** alongside Phase 1.3 — behavior change (autosave cadence visibly changes for users), so must not ship in PR 1.
- **Risk if not fixed:** Continued waste of server action calls proportional to edit session length. Fragile save-trigger pattern that is hard to reason about.

## A.4 — NEW High Finding: `admin-knowledge` cache tag does not exist in `cache-tags.ts`

- **File:** `src/lib/actions/cache-tags.ts:1-29`
- **Evidence:**
  ```ts
  export const CACHE_TAGS = {
    dashboard: 'dashboard',
    wiki: 'wiki',
    taxonomy: 'taxonomy',
  } as const
  ```
  Only three top-level tags. There are also per-user helpers (`getDashboardTag`, `getUserStatsTag`, etc.) but no admin-namespace tag.
- **Issue:** Phase 2.5 assumes an `admin-knowledge` tag can be introduced, but every mutation in `src/lib/actions/admin/bulk.ts` currently fires `revalidateTag(CACHE_TAGS.wiki, 'max')` — invalidating the **wiki** caches (which actually consume that tag via `cached-queries.ts:135`) but doing nothing for admin. The wiki tag's revalidation is effectively acting as a rough admin-invalidation channel because nothing admin-side is cached yet.
- **Implication for Phase 2.5:** When Phase 2.5 adds `admin-knowledge` caching, it MUST simultaneously:
  1. Add `admin_knowledge: 'admin-knowledge'` to `CACHE_TAGS` in `cache-tags.ts`.
  2. Update every mutation in `bulk.ts`, `content.ts` (save/update/delete paths), and `questions.ts` to call `revalidateTag(CACHE_TAGS.admin_knowledge, 'max')` — ADDITIVE, not replacing the existing `wiki` tag.
  3. Verify no new admin mutations (article publish, question approve, taxonomy reassign) exist without the new tag fire.
- **Severity:** **High** (blocks correctness of Phase 2.5)
- **Confidence:** **High**
- **Phase recommendation:** **Part of PR 2b Phase 2.5** — ships in the same commit that introduces the cache wrap.

## A.5 — NEW Medium Finding: `getQuestionsByTopicIds` selects JSONB `options` for every row, unbounded at 500

- **File:** `src/lib/actions/admin/question-queries.ts:180, 192`
- **Evidence:** The select includes `options` (a JSONB column containing answer choices, likely several KB per row). With `.limit(500)`, the worst-case payload is ~500 × ~2KB = 1MB per fetch over the wire.
- **Issue:** A tree-click fetch of 500 questions pulls ~1MB. The questions table list view does not need full `options` — that's only needed when a question is opened for detail view.
- **Severity:** **Medium**
- **Confidence:** **Medium** (payload size guess based on typical JSONB shape; needs production measurement)
- **Kind of fix:** Split the select into a lightweight list query (`question_id, text, topic_id, article_id, question_type, difficulty, created_at, updated_at` — drop `rationale`, `options`, `code_citation`) and a separate detail fetch when a question row is clicked. Or add an explicit `options: null` column masking if Supabase allows.
- **Phase recommendation:** **PR 1 appendix item `A.5-PR1`** (renamed from `2.8` to avoid phase-number collision with §7) — pure refactor, no UI change if current UI doesn't render `options` in the list. Verify first by grepping `QuestionsTableClient.tsx` and `QuestionsPanel.tsx` for `.options` usage on list rows.

## A.6 — NEW Low-Medium Finding (PENDING VERIFICATION): Article save blocks question save (sequential, not parallel) in `SaveAllBar.doSave`

- **File:** `src/components/admin/unified-editor/SaveAllBar.tsx:134-180`
- **Evidence:** `doSave` awaits `saveArticleFull(...)` before entering the loop that creates the per-question promises. Line 135 uses `await`, which blocks until the article server action resolves. The per-question promises at lines 187+ then fire concurrently (good), but they don't start until the article save completes.
- **Why it matters:** The common interaction is "edit article body + fix a few questions + save". A 300ms article save followed by a 400ms concurrent question-save batch runs 700ms total instead of `max(400, 300) = 400ms`.
- **Constraint:** The article save must complete first IF any of the dirty questions are *new* questions that need the new `article_id`. Line 131 checks for this: `needsArticlePersistence` is true when the article is new OR there are new questions/EI prompts attached to it.
- **Kind of fix:** Conditionally parallelize: if the article already exists AND no new questions/prompts depend on a fresh `article_id`, the article update can race with the question updates in a single `Promise.all`. Requires refactoring `needsArticlePersistence` decision and splitting the save into parallel vs serial branches.
- **Severity:** **Low-Medium** (downgraded from Medium per Critic round 2: a 300ms serial overhead is at the threshold of perception on a deliberate save action, and the conditional-parallelization refactor carries higher regression risk than the savings justify).
- **Confidence:** **High** on the sequential dependency; **Medium** on the UX impact being worth the refactor risk.
- **PENDING VERIFICATION:** Depends on `SaveAllBar.tsx` lines 200-500 (see A.10) to confirm the full save flow uses `Promise.all(promises)` after the loop and that no other hidden serialization exists.
- **Phase recommendation:** **PR 2a (nice-to-have)** — defer if the refactor budget is tight; the gain is marginal compared to A.2, A.3, A.4.

## A.7 — NEW Medium Finding (PENDING VERIFICATION): `setIsLocked(isSaving)` has no error-path cleanup

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:90-93`
- **Evidence:**
  ```tsx
  useEffect(() => {
    setIsLocked(isSaving)
    return () => setIsLocked(false)
  }, [isSaving, setIsLocked])
  ```
- **Issue:** The effect correctly unlocks on unmount and when `isSaving` transitions to false. But it does not protect against `isSaving` being stuck at `true` forever — which happens if `SaveAllBar.doSave` throws a non-caught error, calls `setIsSaving(false)` skipped, and the component stays mounted.
- **Verification needed:** Read `SaveAllBar.doSave` lines 200-400 (beyond current read window) to confirm whether every error path calls `setIsSaving(false)`.
- **Severity:** **Medium**
- **Confidence:** **Medium** (pending verification of SaveAllBar error paths)
- **Kind of fix:** Wrap the save in a try/finally that guarantees `setIsSaving(false)` fires, or add a "stuck save detector" that times out `isSaving` after e.g. 30 seconds.
- **Phase recommendation:** **PR 2a** bundled with A.3's autosave fix.

## A.8 — NEW Low Finding: `UnifiedContentEditor.tsx:229` contains a 4th hardcoded `h-[calc(100vh-4rem)]`

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:229`
- **Evidence:** `<div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-surface-light">`
- **Issue:** The first-pass Phase 1 enumeration of hardcoded viewport math listed four files (`ContentEditorIndex.tsx:287`, `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3`). `UnifiedContentEditor.tsx:229` is a **fifth** instance inside a client component — and because `UnifiedContentEditor` is rendered by `[id]/page.tsx` and `new/page.tsx`, this class will clip when the parent also sets its own `h-[calc(...)]` with a different subtraction. The parent's `h-[calc(100vh-4rem)]` plus this child's `h-[calc(100vh-4rem)]` mean the child reads its own `100vh` not the constrained parent — a layout bug under certain admin shell configurations.
- **Severity:** **Low** (mostly UX, but listed here because it compounds with L-2-era layout fixes from the sibling UX audit)
- **Confidence:** **High**
- **Kind of fix:** Change `h-[calc(100vh-4rem)]` to `h-full` and rely on the parent's established height chain.
- **Phase recommendation:** **PR 1 item 1.1-bis** OR a cross-audit coordination note. This item bridges the UX audit and the performance audit — coordinate with whichever plan ships first. Cheap to land in either.

## A.9 — POSITIVE Finding (INFORMATIONAL ONLY): `TaxonomyTree` IS memoized

- **File:** `src/components/shared/taxonomy-tree/TaxonomyTree.tsx` (confirmed by follow-up read)
- **Evidence:** `React.memo` wraps `HighlightMatch`, `TreeRow`, and `TreeBranch` subcomponents. The outermost `TaxonomyTree` is a context provider wrapping these memoized children.
- **Implication:** IF the memoization is directly confirmed by line-cited reads of `TaxonomyTree.tsx`, the first-pass plan's P-4 / rendering-cost concerns about the tree would be overstated. Tree re-renders on parent state change would not cascade into every row — only the rows whose props genuinely changed (`activeNodeId`, expanded state) would re-render.
- **Caveat (Critic round 2):** The memoization claim is currently **second-hand** from the Round 2 Explorer agent and NOT yet line-cited. Do NOT let this finding retroactively invalidate first-pass tree render-cost concerns until someone opens `TaxonomyTree.tsx` and cites the specific `React.memo` lines. Keep first-pass findings active until confirmed.
- **Severity:** **Informational only**
- **Phase recommendation:** Resolve by direct read in a follow-up. Do not act on it in PR 1 or PR 2a.

## A.12 — NEW High Finding: `UnifiedContentEditor` fires unconditional `router.refresh()` on every article update

> **Numbering note:** A.12 appears between A.9 and A.10 because it was added in the Critic round 3 revision pass. It is numerically out-of-order but thematically belongs next to A.3 (autosave) which is why it's grouped with the save-path findings, not appended at the end.

- **File:** `src/components/admin/unified-editor/UnifiedContentEditor.tsx:258-265`
- **Evidence:**
  ```tsx
  onSaveComplete={({ articleId, created }) => {
    if (created) {
      router.replace(`/admin/knowledge/${articleId}`)
      return
    }
    router.refresh()  // ← fires on EVERY update save
  }}
  ```
- **Issue:** Every successful article update — whether triggered by the 10-second autosave (A.3) or a manual save — calls `router.refresh()`, which re-runs the server component tree of `/admin/knowledge/[id]`. That re-runs **`getArticleFull` (uncached, P-2)**, **both sequential batches at `[id]/page.tsx:24-44` (P-3)**, and re-hydrates `UnifiedContentEditor` with fresh server data. Combined with A.3 (10-second autosave), this fires the full detail-page re-fetch **every 10 seconds during active editing** — catastrophic throughput waste.
- **Interaction with existing findings:**
  - **Multiplies P-2 cost:** without Phase 2.1's cache, every autosave pays a full `wiki_articles` roundtrip.
  - **Multiplies P-3 cost:** every autosave pays 4 sequential DB roundtrips via the `[id]/page.tsx` batches.
  - **Interacts with L-1:** every autosave → `router.refresh` → new `taxonomyTree` reference → `QuestionsTableClient` re-fetches (until Phase 1.2 ships).
  - **Interacts with A.3:** the interval × the refresh storm is how admins actually experience admin "feeling slow" during editing sessions.
- **Why it matters:** This is the single most expensive compounding pattern in the admin knowledge surface. The first-pass plan identified each individual finding but did not connect them via this `router.refresh()` trigger.
- **Severity:** **High** (arguably **Critical** under its compounding behavior, but listed High to avoid re-triggering severity inflation)
- **Confidence:** **High** (directly verified at the cited lines)
- **Kind of fix (multiple valid options):**
  1. **Replace `router.refresh()` with scoped revalidation:** call `revalidateTag('article:${id}')` inside `updateArticleFull` (already done at `content.ts:734` for the wiki tag) and rely on Next.js to re-fetch only what's stale. No `router.refresh()` on the client path.
  2. **Gate on dirty state:** only refresh if the save actually changed something the client cares about (e.g., status transitions from draft → published); otherwise drop the refresh entirely. Client state already has the fresh content because the user typed it.
  3. **Debounce the refresh:** batch multiple autosaves into a single refresh at most every N seconds, so a user typing continuously sees at most one refresh per minute instead of six per minute.
- **Phase recommendation:** **PR 2a** alongside A.3 (autosave refactor), because both are behavioral changes to the save path. The fix for A.12 is arguably the single most impactful perf fix in the entire plan — bundle it carefully.
- **Cross-reference to first-pass plan:** First-pass §5 L-6 noted that `bulkDeleteArticles` fires `revalidateTag('wiki','max')` into a vacuum. A.12 is the same anti-pattern at the `UnifiedContentEditor` save path — `router.refresh()` doing expensive work where `revalidateTag` would suffice.

## A.10 — Items Still Unverified (explicitly open)

1. **`SaveAllBar.tsx` lines 200-500** — not read. Need to verify: does the save loop use `Promise.all(promises)` to await concurrently? Does every error path reset `isSaving`? Is the `conflictWarning` state at line 94 actually wired to UI? Is the `pendingSaveRef` at line 96 used anywhere?
2. **`DirtyStateProvider`** — not read. The `useDirtyState()` hook is consumed heavily but its implementation was not opened. Does `questionsDirty` live in a Map (mutable reference footgun) or a Set (safer for React state)?
3. **`content.ts` lines 350-end** — only partially read. The `updateArticleFull`, `saveArticleFull`, `deleteArticle` implementations matter for Phase 2.1's cache invalidation; A.4's cache-tag fix must enumerate every call site.
4. **`supabase/migrations/**`** — not read. §9 Q11a and Q11b (RLS audit) remain blocked.
5. **`next.config.*`** — not read. Cannot confirm whether `experimental.reactCompiler` is enabled (would change memoization recommendations) or whether `staleTimes` is tuned.
6. **`package.json` for version pinning** — not read directly. First-pass plan assumed React 19.2.4 and Next 16.1.6 per CLAUDE.md, but runtime package resolution was not verified.

Resolve these in a follow-up pass before PR 1 execution if Phase A items land in PR 1.

## A.11 — Updated Fastest Wins (consolidated across both passes)

These are the **net fastest wins** after Round 2, ordered by impact × confidence × low-risk:

1. **1.1** Merge the double-questions fetch in `getContentEditorIndexData`. (unchanged)
2. **1.2** Stop `QuestionsTableClient` ghost re-fetch via `fetchQuestionsForNode` helper. (unchanged)
3. **A.2-PR1 (NEW — High)** Merge `getQuestionsByTopicIds` 3-batch pattern via join + parallel dispatch. **Largest latency win in this appendix.** Every taxonomy-tree click benefits.
4. **2.3** `buildTree` single-pass. (unchanged)
5. **2.4** `enrichedArticles` map lookup. (unchanged)
6. **A.5-PR1 (NEW — Medium)** Slim `getQuestionsByTopicIds` select list to drop `options` / `rationale` / `code_citation` from the list view. Gated on a quick grep to confirm UI does not consume those fields on list rows.
7. **2.1** Cache `getArticleFull` with `createStaticClient` — gated on Q11a. (unchanged)
8. **2.2** Flatten `[id]/page.tsx` batches. (unchanged)
9. **3.4** `updateUrl` footgun fix. (unchanged)
10. **A.8 (NEW — Low)** `UnifiedContentEditor.tsx:229` `h-full` fix. (coordinate with UX audit — cheap bridge item)

**PR 1 Budget Statement (REVISED):** Round 1 PR 1 was sized at ~1.5 engineering days. Adding A.2-PR1 (~3-4 hours, non-trivial because of the `uniqueTopics` dependency check), A.5-PR1 (~1 hour + grep audit), and A.8 (~15 minutes) expands PR 1 to **~2 engineering days**. If that budget is unavailable, **defer A.2-PR1 to PR 1.5 or bundle it into PR 2a** — it is the only non-trivial new item; the rest are minor.

**Removed from PR 1 prerequisites** (were blocking, no longer blocking):
- §9 Q4 (`QuestionEditor` save path) — resolved: save path flows through `SaveAllBar` / `UnifiedContentEditor`, does not affect Phase 1.2.
- §9 Q6 (`UnifiedContentEditor` mirror-prop pattern) — resolved: no mirror pattern exists in `UnifiedContentEditor`; Phase 1.3 is admin-local to `ContentEditorIndex.tsx` only.

**New PR 1 prerequisites** (added by this appendix):
- Verify `QuestionsTableClient` and `QuestionsPanel` list-view row rendering does NOT consume `options` / `rationale` / `code_citation` fields from the `getQuestionsByTopicIds` response, so that A.5-PR1's slim-select is safe.
- Verify `uniqueTopics` in `getQuestionsByTopicIds` can be derived from the input `topicIds` parameter (not from batch 1's result), so that A.2-PR1's parallelization is sound.

**New PR 2a items added** (behavior-change PR):
- **A.12 (HIGHEST IMPACT — High)** Replace `router.refresh()` in `UnifiedContentEditor.tsx:264` with scoped `revalidateTag` or drop entirely. This is the single most important perf item in the entire plan because of its compounding interaction with A.3, P-2, P-3, and L-1. **Ship this FIRST in PR 2a, before the A.3 autosave refactor.**
- A.3 Autosave refactor (interval → debounced timeout + drop custom event pub/sub)
- A.6 Parallel article + question save when new-article dependency is absent (low-priority, defer if tight)
- A.7 `isSaving` stuck-state protection with try/finally

**New PR 2b items added** (caching PR):
- A.4 Add `admin_knowledge: 'admin-knowledge'` to `CACHE_TAGS` in `src/lib/actions/cache-tags.ts:3-7` and wire `revalidateTag(CACHE_TAGS.admin_knowledge, 'max')` into every admin mutation in `bulk.ts`, `content.ts` save/update paths, and `questions.ts` — bundled with Phase 2.5.

**Sequencing rule for PR 2a:** Ship A.12 → A.3 → A.7 → (optionally A.6). A.12 first because it is the highest-impact single change; A.3 second because it is what makes A.12 fire frequently; A.7 third because it protects the updated save flow; A.6 last and optional.

---

# 9. Unified Verification Checklist

This is the synthesis checklist — one gate per PR in §4. Each item cross-references Track A (UX) §9 and Track B (Perf) §8 / §9 / Appendix. An executor must pass every item before declaring a PR ready for review.

## 9.1 Pre-flight (before any PR begins)

- [ ] **RLS audit Q11a resolved** (Track B §9 Q11a) — required for U1 item 2.1 (`getArticleFull` cache). If unresolved, U1 ships without 2.1.
- [ ] **RLS audit Q11b resolved** (Track B §9 Q11b) — required for U2b Phase 2.5. U2b cannot begin until signed off.
- [ ] **Grep gate (wiki scope containment):**
  ```bash
  grep -rn "getArticleFull\|getContentEditorIndexData\|QuestionsTableClient" src/app/dashboard src/components/wiki
  ```
  Expect zero hits. If any hit, stop and reassess.
- [ ] **Grep gate (wiki full-bleed regex integrity):**
  ```bash
  grep -rn "FULL_BLEED_PATHS\|shouldBeFullBleed\|isKnowledgeDetail" src/components/layout
  ```
  Expect exactly one definition site. Verify dashboard wiki (`/dashboard/wiki/[slug]`) still matches on both positive (`FULL_BLEED_PATHS`) and negative (new `FULL_BLEED_KNOWLEDGE_EXACT`) paths.
- [ ] **Grep gate (A.2-PR1 parallelization soundness):** Open `question-queries.ts:170-278`. Confirm `uniqueTopics` can be derived from the `topicIds` parameter, not from batch 1's result. If not, A.2-PR1 is blocked; defer to PR 2a.
- [ ] **Grep gate (A.5-PR1 slim-select soundness):**
  ```bash
  grep -rn "\.options\|\.rationale\|\.code_citation" src/components/admin/question-editor src/components/admin/questions-table
  ```
  Expect zero hits in list-view components. Hits in detail-view are acceptable.

## 9.2 U1 (PR1 — fastest wins + UX Phase 1/2 + cheap bridges) — GO/NO-GO gate

**Visual parity (Track A §9):**
- [ ] `/admin/knowledge` hero and full-bleed region renders identically to `/dashboard/wiki/[slug]` at desktop widths (1440px and 1920px).
- [ ] `/admin/knowledge/questions` (same layout shell as index) matches parity.
- [ ] `/admin/knowledge/[id]` (detail route) matches the identity-locked dashboard wiki detail layout.
- [ ] `/admin/knowledge/new` inherits the same full-bleed treatment.
- [ ] `WikiSidebarShell` `mounted` SSR gate still fires (no SSR hydration flash on first paint).
- [ ] `bg-camp-cobalt` (and related hardcoded brand literals) remain unmodified in `WikiSidebarShell` — identity preservation lock.
- [ ] No layout clipping or double-scrollbar on any of the four admin-knowledge routes.

**Scroll ownership (Track A §9 + Track B A.8):**
- [ ] `h-full` now replaces all `h-[calc(100vh-Nrem)]` instances in: `ContentEditorIndex.tsx:287`, `[id]/page.tsx:47`, `new/page.tsx:43`, `[id]/loading.tsx:3`, `UnifiedContentEditor.tsx:229`.
- [ ] Confirm NO new `src/app/admin/knowledge/layout.tsx` file has been introduced. Per Track A §7 Phase 3 "Files NOT to create", a route-level layout here would clip `/admin/knowledge/analytics` and `/admin/knowledge/import` (single-column padded siblings). Height chain propagation is handled at the component level inside `ContentEditorIndex` and `UnifiedContentEditor`, not via a new route-level layout.
- [ ] No `overflow-hidden` regressions that prevent the main content column from scrolling.

**Resize behavior (Track A):**
- [ ] Viewport resize from 1920 → 1024 → 768 → 640 triggers no layout jumps beyond the intended sidebar collapse breakpoints.
- [ ] Admin sidebar collapse/expand animation runs at `duration-200 ease-out` (no bounce, no spring).
- [ ] Full-bleed region does not horizontally overflow at 640px or below.

**CRUD correctness (Track B Fastest Wins + A.12 NOT yet fixed in U1):**
- [ ] `/admin/knowledge` Network tab: exactly one fetch to `questions` table per load (1.1 merge verified).
- [ ] `/admin/knowledge/questions` save flow: zero new `[QuestionsTable] fetch` log entries after an editor save (1.2 ghost fetch fixed).
- [ ] `enrichedArticles` lookup is O(1) via Map (verify no `.find` calls remain in the hot path).
- [ ] `buildTree` returns in a single pass; verify no double iteration in `buildTree.ts`.
- [ ] Taxonomy-tree click now fetches questions in `max(batch1, batch3) + batch2` wallclock, not sum of three (A.2-PR1 verified via dev-only timing logs).
- [ ] `getQuestionsByTopicIds` response payload is slimmed (no `options` / `rationale` / `code_citation` on list rows). A.5-PR1 verified via response inspection.
- [ ] `/admin/knowledge/[id]` detail page timing logs confirm `[id]/page.tsx` batches run as `max(batch1) + max(batch2)`, not sum (2.2 flatten verified).
- [ ] IF Q11a passed: `/admin/knowledge/[id]` second load shows zero Supabase queries for `wiki_articles.select` (2.1 cache hit).
- [ ] `updateUrl` callback no longer has `searchParams` in deps (3.4 footgun fixed).

**Regression (Track A §9):**
- [ ] `/dashboard/wiki/[slug]` (wiki benchmark) renders byte-identically to pre-PR baseline. Take screenshots at 1440px, diff against baseline.
- [ ] `SlideToSubmit` in quiz flows renders and animates identically (identity lock — `.ai/rules/identity_preservation_lock.md`).
- [ ] `RevealBlock` in wiki articles renders and animates identically.
- [ ] No new console errors, warnings, or hydration mismatches on any admin or dashboard route.

**Build & test gates:**
- [ ] `bun run lint` passes with no new warnings.
- [ ] `bun run type-check` passes.
- [ ] `bun test` has no new failures vs baseline.
- [ ] `bun run build` completes without the `ENOENT` `.next/required-server-files.json` error.
- [ ] `gitnexus_detect_changes({scope: "staged"})` returns only the expected admin-knowledge file set.

## 9.3 U2a (PR2a — behavior changes: L-2 + A.12 + A.3 + A.7 + optional A.6 + UX Phase 3) — GO/NO-GO gate

**Ordering within the PR (hard rule):**
- [ ] Commit 1: `pendingArchiveIds: Set<string>` introduced; `localArticles` removed (Track B 1.3).
- [ ] Commit 2: A.12 — `router.refresh()` in `UnifiedContentEditor.tsx:264` replaced with scoped revalidation or gated (HIGHEST IMPACT).
- [ ] Commit 3: A.3 — autosave interval replaced with debounced save + direct prop callback (drop `window.dispatchEvent`).
- [ ] Commit 4: A.7 — `isSaving` try/finally stuck-state protection.
- [ ] Commit 5 (optional): A.6 — conditional parallelization of article + question save.
- [ ] Commit 6 (Track A): `AdminTwoPaneShell` component landed if Track A Phase 3 is in scope for U2a.

**Behavior correctness:**
- [ ] Bulk archive of an article no longer returns the row on the next `router.refresh()` (L-2 optimistic clobber fixed).
- [ ] Active editing session no longer fires `router.refresh()` every 10 seconds; measure via server logs — detail page re-runs drop by ~95%+ during edit sessions (A.12 verified).
- [ ] Autosave debounces on keystroke; user typing continuously for 60 seconds sees 1-2 autosave calls, not 6 (A.3 verified).
- [ ] Simulated save error leaves `isSaving` at `false` (A.7 try/finally verified).
- [ ] IF A.6 shipped: article-only + existing-article save path runs `max(article, questions)` wallclock.

**Regression (both tracks):**
- [ ] `/dashboard/wiki/[slug]` unchanged.
- [ ] `SlideToSubmit` / `RevealBlock` unchanged.
- [ ] Bulk delete toast now surfaces per-row failures (Track B 3.3).
- [ ] `filteredArticles` single-pass predicate (Track B 3.2) runs without behavioral change.

**Gates:** lint, type-check, test, build, `gitnexus_detect_changes`. Same as U1.

## 9.4 U2b (PR2b — caching: Phase 2.5 + A.4) — GO/NO-GO gate

**Security pre-flight (HARD GATE):**
- [ ] Q11b signed off. Path A / B / C decision documented with product + security sign-off.
- [ ] If Path A: `getContentEditorIndexData` now uses `createStaticClient()`, not `createClient()`.
- [ ] If Path B or C: admin RLS per-user scoping is preserved; `cache()` from `react` wraps appropriate subqueries.

**Correctness:**
- [ ] `admin_knowledge: 'admin-knowledge'` exists in `CACHE_TAGS` (`src/lib/actions/cache-tags.ts`).
- [ ] Every mutation in `bulk.ts`, `content.ts` save/update/delete paths, and `questions.ts` now fires both `revalidateTag(CACHE_TAGS.wiki, 'max')` AND `revalidateTag(CACHE_TAGS.admin_knowledge, 'max')`.
- [ ] Navigation from `/admin/knowledge/[id]` back to `/admin/knowledge` shows a cache hit on the index load (no Supabase query log).
- [ ] Mutation from an admin surface visibly invalidates the `/admin/knowledge` index within one navigation.
- [ ] `/dashboard/wiki/[slug]` cache behavior unchanged (`wiki` tag still fires).

**Regression + gates:** same as U1.

## 9.5 U3 (PR3 — UX Phase 3: AdminTwoPaneShell extraction) — GO/NO-GO gate

If `AdminTwoPaneShell` did not ship in U2a, it ships as a standalone PR here.

- [ ] New `src/app/admin/knowledge/_components/AdminTwoPaneShell.tsx` (admin-local path, NOT `src/components/admin/shell/`) exists and is consumed by `ContentEditorIndex`.
- [ ] `WikiSidebarShell` is unchanged (dashboard wiki benchmark preserved).
- [ ] `AdminTwoPaneShell` is a byte-for-byte technique copy of `WikiSidebarShell` — it does **NOT** import from or share a base with `WikiSidebarShell`. Per Track A Option C (§7 §8 rationale), sharing a primitive was explicitly rejected because `WikiSidebarShell`'s `mounted` SSR gate and hardcoded brand literals (`cached-queries.ts`-adjacent) cannot be extracted without violating the identity lock. Verify: `grep -rn "WikiSidebarShell" src/app/admin/knowledge/_components/` returns zero hits.
- [ ] Visual diff shows zero pixel drift on dashboard wiki.
- [ ] Visual diff on admin knowledge matches baseline + Track A parity goals.

## 9.6 U4 (PR4 — verification + cleanup + Phase 4 standardization) — GO/NO-GO gate

- [ ] `filteredArticles` single-pass predicate confirmed in place from U2a (Track B Phase 3.2 — authoritatively assigned to U2a, NOT U4; this is a verification-only checkpoint here).
- [ ] `<Suspense>` boundaries wrapping taxonomy panel / questions panel / EI prompts panel in `src/app/admin/knowledge/[id]/page.tsx` (Track B Phase 3.1 — explicitly assigned to U4 as a pure enhancement after Phase 2.2 parallelization has landed in U1).
- [ ] Admin cached-queries module extracted (Track B 4.1): `src/lib/actions/admin/cached-queries.ts`.
- [ ] URL-as-state refactor (Track B 4.2): `ContentEditorIndex` reads `viewMode`/`selectedNodeId` via `useMemo` from `searchParams`.
- [ ] `revalidateAdminKnowledge()` helper exists and every admin mutation uses it (Track B 4.3).
- [ ] Full end-to-end admin-knowledge session: load index → click tree node → edit article → autosave fires → manual save → navigate back → bulk select → bulk archive → no regressions, no ghost fetches, no console errors.
- [ ] Lighthouse TBT and LCP measured for `/admin/knowledge` and `/admin/knowledge/[id]`; results recorded in the PR description alongside baseline numbers.
- [ ] `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` output archived into the plan's closing notes.

---

# 10. Appendix: Merge Provenance

## 10.1 Source files

| Track | Source file | SHA-256 (at merge time) | Lines | Role in this unified plan |
|---|---|---|---|---|
| A | `.ai/plans/Admin-UXUI/2026-04-12-Admin-UXUI-Improvement-Audit-And-Plan.md` | *(computed at write time; see §10.4)* | 443 | §7 Track A VERBATIM |
| B | `.ai/plans/Admin-UXUI/2026-04-12-Admin-Knowledge-Speed-And-Functionality-Audit-And-Plan.md` | *(computed at write time; see §10.4)* | 684 | §8 Track B VERBATIM |

## 10.2 Merge date and author

- **Merge date:** 2026-04-12
- **Merged by:** Planner agent (`oh-my-claudecode:planner`), Opus 4.6
- **Review lineage:** Track A and Track B each went through Analyst → Architect → Critic rounds in isolation before this unified merge. The unified plan does NOT include a new Architect / Critic pass — that happens downstream (Task #14, Task #15 in the OMC pipeline).

## 10.3 Sections that are VERBATIM vs SYNTHESIS

**VERBATIM (preserved exactly from sources):**
- §7 — Track A full audit + implementation plan (443 lines from source)
- §8 — Track B full audit + implementation plan + Round 2 Appendix (684 lines from source)

**SYNTHESIS (new content authored during merge):**
- §0 Reading Guide
- §1 Unified Executive Summary
- §2 Shared Principles & Drivers
- §3 Cross-cutting Coordination Map (3.1 Shared Files Table, 3.2 Ordering Rules)
- §4 Unified PR Sequencing Timeline (U1 → U2a → U2b → U3 → U4)
- §5 Unified Fastest Wins
- §6 Unified Open Questions
- §9 Unified Verification Checklist
- §10 Appendix: Merge Provenance (this section)

## 10.4 Reconciled contradictions / coordination hotspots

The two source plans were authored independently and did not share a PR sequencing vocabulary. The following contradictions were reconciled during merge:

1. **"PR 1" ambiguity.** Track A's PR 1 (UX parity fixes) is NOT the same unit of work as Track B's PR 1 (fastest perf wins). The unified plan resolves this by renaming both into **U1** (combined) and requiring they ship as a single atomic PR per §3.2 rule "Combined U1". Track B's "PR 2a / PR 2b" became unified **U2a / U2b**.

2. **Hardcoded height ownership.** Track A Phase 1 identified four hardcoded `h-[calc(100vh-Nrem)]` instances. Track B Round 2 A.8 identified a fifth (`UnifiedContentEditor.tsx:229`). The unified plan bundles all five into U1 under Track A's ownership, with A.8 explicitly cited as a "bridge item" in §5.

3. **`ContentEditorIndex.tsx` conflict window (RECONCILED to Rule 1 in §3.2).** Both tracks edit this file in U1:
   - Track A: layout / shell wiring edits at lines 287, 706 (full-bleed className changes, gutter removal).
   - Track B: 3.4 (`updateUrl` deps at lines 161-167). Note: 1.1 (merge double-questions fetch) is actually in `content.ts`, NOT this file; 2.3 (`buildTree`) and 2.4 (`enrichedArticles` map) are also in `content.ts`.
   **Authoritative rule:** §3.2 Rule 1 — Track A and Track B edits land **simultaneously on disjoint line ranges in a single U1 atomic commit**. Pre-commit check: `git diff src/components/admin/unified-editor/ContentEditorIndex.tsx` should show at most 4 hunks, all on non-overlapping line ranges. An earlier draft of this section claimed "Track B first, then Track A" — that ordering is **superseded** by Rule 1's atomic-commit approach, which is strictly safer because it eliminates the serialization risk window between the two edits.

4. **`UnifiedContentEditor.tsx` edit ordering within U2a.** Three independent edits (A.12, A.3, A.7) plus optionally A.6 all target the same file. §3.2 ordering rule specifies A.12 → A.3 → A.7 → A.6 as separate commits within U2a, matching Appendix A.11's sequencing rule.

5. **Phase 2.5 RLS gating.** Track B's Phase 2.5 is explicitly split out of U1 into U2b on the basis of Q11b (a stricter RLS audit than Q11a). Track A has no corresponding gate. U2b is owned entirely by Track B; Track A has zero edits in this PR.

6. **`AdminTwoPaneShell` ownership.** Track A Phase 3 proposes extracting an `AdminTwoPaneShell` component to share layout primitives with `WikiSidebarShell`. This is a Track-A-only concern with zero Track B overlap. It ships as U3 (or bundled into U2a if the budget permits — see §4 for the decision).

7. **Severity calibration.** Both tracks use their own severity scales (Track A: Defect Class 1/2/3; Track B: Critical/High/Medium/Low). The unified §1 Executive Summary uses Track B's scale for cross-track items (because it is finer-grained) while preserving Track A's Class 1/2/3 terminology within the VERBATIM §7.

## 10.5 Downstream consumers

This unified plan is consumed by:
- **Task #14 — Architect review** (`oh-my-claudecode:architect`): produces ADR-grade decision analysis on the U1-U4 sequencing, the RLS gating strategy, and the `AdminTwoPaneShell` extraction decision.
- **Task #15 — Critic evaluation** (`oh-my-claudecode:critic`): stress-tests the plan for failure modes, missing considerations, and coordination hotspots in §3.2.
- **Executor handoff** (post approval): `/oh-my-claudecode:start-work 2026-04-12-Admin-Knowledge-UNIFIED-Audit-And-Plan` kicks off U1 implementation.

## 10.6 Identity preservation lock acknowledgment

This plan does NOT modify any file, token, or class listed in `.ai/rules/identity_preservation_lock.md`:
- `SlideToSubmit.tsx` — untouched
- `RevealBlock.tsx` — untouched
- `--primary`, `--primary-50`, `--surface-light`, `--border` token values — untouched
- `bg-camp-cobalt` hardcoded literals in `WikiSidebarShell` — untouched
- `WikiSidebarShell.tsx` `mounted` SSR gate at line 60 — untouched

Any executor working this plan MUST re-verify this lock before merging U1, U2a, U2b, U3, or U4. Reference: `.ai/rules/identity_preservation_lock.md`, §2 "Interference Analysis" and §3 "Protection Protocol".

---

*End of unified audit + plan. Merged 2026-04-12 by Planner. Next stop: Architect review.*

