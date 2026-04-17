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
