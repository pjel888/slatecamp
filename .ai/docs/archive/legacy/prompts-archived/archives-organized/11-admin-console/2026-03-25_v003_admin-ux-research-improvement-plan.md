# SlateCamp /Admin Route — Comprehensive UX Research, Design Improvement & Implementation Plan

> **Document Type:** UX Research + Design System Compliance + Implementation Specification
> **Scope:** All 19 routes under `/admin`, all portal components, all admin-specific components, all server actions
> **Research basis:** Admin cognitive load theory, zero-click triage principles, SlateCamp design system v6.0, Audit V2 (2026-03-24)
> **Version:** 1.0 · March 2026

---

## Part 1 — Why Admin UX Is a Different Discipline

### The Fundamental Difference: Admin vs. Student UX

The student-facing product is designed around **motivation management**. The student arrives uncertain, potentially anxious, needing encouragement to start and gentle celebration when they progress. Every design decision — no red for failures, no public leaderboards, no shame-adjacent language — is calibrated for a human who is under emotional pressure about a high-stakes exam.

The admin-facing product is designed around **operational throughput**. The SME, content admin, or reviewer arrives with a task list, needs to execute it as fast as possible, and has zero patience for decorative friction. Their primary experience metric is not "did I feel good?" — it is "did I accomplish what I came to do in the minimum possible time?"

These are fundamentally different design modes. A student who has to hunt for the next quiz loses motivation. An admin who has to hunt for the review queue loses efficiency — and in a startup context, that wasted time compounds across every content cycle.

### The Seven Admin-Specific Heuristics (Applied Throughout This Document)

From the audit prompt's cognitive load framework:

1. **Zero-Click Triage:** The most urgent item must be identifiable within 5 seconds of page load — without clicking into a sub-page.
2. **Calm Urgency:** Urgency is communicated through badge counts and sort order, not red color or panic-inducing labels.
3. **One Action Principle:** Every screen has one primary job and one primary CTA. Multiple visually equal primary buttons = violation.
4. **Dead End Elimination:** Every state (empty, error, no results) must have a CTA or next step.
5. **Information Density:** 10–25 rows per page, not 5. Filters above the table, not buried.
6. **Bulk Action:** Multi-select for any list view managing more than 20 items.
7. **Error Recovery:** Destructive actions require confirmation. Undo within 10 seconds is ideal.

### Cross-Disciplinary Research: What Professional Operations Interfaces Teach Us

**Air Traffic Control Interface Research (FAA, 2003):** ATC interfaces are the gold standard for high-stakes, high-frequency operational UX. Key finding: the most important information must be visible without any interaction. "Heads-down" interfaces — where critical data requires a click or scroll to reveal — are classified as unsafe. Applied to `/admin/reviews`: the number of pending review items must appear in the sidebar nav badge without clicking the reviews route.

**Emergency Medical Records Systems (EHR UX, AMIA 2019):** Hospital admin interfaces that required 3+ clicks to reach critical patient information had measurably worse outcomes than 1-click interfaces. The parallel: every extra click between an SME and the content they need to edit is a unit of friction that compounds across every article and question in the content library.

**GitHub Issues / Linear / Jira — Modern Ops Tool Research:** The most widely-adopted admin/ops tools share three patterns: (1) command palette for power navigation (⌘K), (2) keyboard shortcuts for the most common actions, (3) visible status without hover. SlateCamp's existing Cmd+K implementation is already aligned with this — but it needs to be more discoverable.

---

## Part 2 — Current State Audit Summary

Based on Audit V2 (2026-03-24), the admin console has an overall health of **B+**. This part documents the specific gaps that UX research and design must address.

### The 19 Routes — Functional Status

| Route | Purpose | Status | Primary Gap |
|---|---|---|---|
| `/admin` | Login landing | Functional | Uses Tailwind zinc-* instead of design tokens |
| `/admin/dashboard` | Overview stats + activity | Functional | No zero-click triage for urgent items |
| `/admin/questions` | Questions DataTable | Functional | No bulk actions; 5-option bug vs 4-option validation |
| `/admin/questions/new` | Create question | Broken | 5 options initialized, only 4 valid; no preview |
| `/admin/questions/[id]` | Edit question | Partial | Same 5-option bug; no WYSIWYG preview |
| `/admin/questions/import` | Bulk CSV import | Functional | Client-only auth |
| `/admin/questions/analytics` | Quality metrics | Functional | Solid |
| `/admin/articles` | Articles DataTable | Functional | No question count column; no coverage health |
| `/admin/articles/new` | Create article | Partial | Preview tab doesn't use student-facing component |
| `/admin/articles/[id]` | Edit article | Partial | Same preview gap; metadata buried at bottom |
| `/admin/wiki/*` | Redirects to articles | N/A | Correctly implemented |
| `/admin/taxonomy` | Tree editor | Functional | Native alert() for delete confirmation |
| `/admin/taxonomy/coverage` | Coverage heatmap | Functional | Inefficient query (fetches all questions to count) |
| `/admin/assets` | 3D asset manager | Broken | Links to /admin/assets/new and /admin/assets/[id] — neither exists |
| `/admin/reviews` | SME review queue | **BROKEN** | Wrong column queries (id, author_id, submitted_at don't exist) — silently empty |
| `/admin/pipeline` | Publishing pipeline | Functional | Good |
| `/admin/search` | Cross-content search | Partial | No debounce; 3 Supabase queries per keystroke; swallows errors |
| `/admin/audit` | Audit log | Functional | Solid |
| `/admin/activity` | Activity feed | Partial | Inline Supabase query; select('*') violation |
| `/admin/settings` | Role management | Functional | Solid |

### The 10 Admin Components — Gap Analysis

| Component | Known Issues |
|---|---|
| `AdminMDXEditor` | useEffect missing dependency |
| `QuestionEditor` | 5 options vs 4 validation; 3× native alert(); no preview |
| `QuestionImporter` | Direct browser client writes |
| `SMEReviewQueue` | Wrong column names (silently broken); 2× native alert() + 1× native prompt() |
| `TaxonomyEditor` | 1× native alert(); direct browser client writes |
| `AssetList` | Dead links to non-existent routes |
| `AssetUploader` | Direct browser client writes |
| `WikiEditor.tsx` | Potentially unused (not imported anywhere) |
| Portal components | `text-[9px]` violations in 4 instances |
| Loading skeletons | `rounded-xl` violations in 3 files |

### The Critical Blockers (Fix Before Any Feature Work)

These are the issues that make the admin console functionally broken or unsafe:

1. **SMEReviewQueue queries `id`, `author_id`, `submitted_at` — none exist.** The review queue has been silently empty since it was built. All items awaiting review are invisible to reviewers. Fix: `article_id`, `status`, `updated_at`.
2. **QuestionEditor creates 5-option questions that fail 4-option validation.** Content created through the editor cannot be saved through the server action.
3. **All 5 native alert()/confirm()/prompt() calls must be replaced with Dialog components.** These bypass keyboard navigation, screen readers, and are unstyled.
4. **Client-side direct writes bypass auth and produce no audit log.** QuestionEditor, TaxonomyEditor, AssetUploader.
5. **Dead asset management links** — `/admin/assets/new` and `/admin/assets/[id]` 404.

---

## Part 3 — Design System Violations: Complete Audit

### Summary

| Severity | Count | Examples |
|---|---|---|
| CRITICAL | 2 | SMEReviewQueue broken; QuestionEditor 5-option bug |
| HIGH | 8 | Native dialogs; direct client writes; text-[9px]; wrong column queries |
| MEDIUM | 9 | rounded-xl in skeletons; no preview parity; select('*'); missing debounce |
| LOW | 6 | Missing metadata pages; dead links; WikiEditor unused |

### Typography Violations

**V-01: `text-[9px]` in portal components — HIGH**
Affected files: `PortalTopbar.tsx`, `PortalSidebar.tsx` (4 instances)
Rule: Minimum readable text is 11px. 8-9px is permitted ONLY for keyboard shortcut badges and eyebrow labels in uppercase tracking-widest.
Current: `text-[9px]` applied to nav section labels and topbar badges where users need to read them.
Fix: Change to `text-[11px]`. The eyebrow visual weight can be preserved with `uppercase tracking-widest font-mono` at 11px.

**V-02: Numbers not using DM Mono — MEDIUM**
The dashboard statistics on `/admin/dashboard` should use `font-mono tabular-nums`. Any stat value rendered in Inter violates the typography system.
Rule: All numerical stats, percentages, counts → `font-mono font-medium tabular-nums`.
Fix: Audit every `<span>` or `<p>` containing a dynamic count/number. Apply `font-mono tabular-nums`.

**V-03: Missing eyebrow pattern on cards — MEDIUM**
Standard card anatomy: `DM Mono uppercase 9px (eyebrow) → Inter font-medium (title) → Inter text-sm (subtitle)`.
Some admin cards show the title only, with no DM Mono eyebrow above it.
Fix: Add the eyebrow label to all content cards: "ARTICLES", "QUESTIONS", "RECENT ACTIVITY", etc.

### Color Violations

**V-04: Login page uses `zinc-*` instead of design tokens — LOW**
File: `/admin` login page
The login page uses Tailwind zinc-* classes (`bg-zinc-900`, `text-zinc-400`) instead of the Campfire token system (`bg-[#F8F7F5]`, `text-[#1A1A1A]`).
Fix: Replace all zinc-* with Slatecamp tokens. The admin red (`#6B1A1A` topbar) is correct — preserve it. The form and page background should use `--sc-cream` and `--sc-warm-white`.

**V-05: Hardcoded hex in AdminMDXEditor — LOW**
File: `AdminMDXEditor.tsx`
Uses hardcoded hex values that match Slatecamp tokens but should reference CSS variables.
Fix: Replace hardcoded hex with `var(--sc-cobalt)`, `var(--sc-cream)`, etc.

### Component Pattern Violations

**V-06: `rounded-xl` in loading skeletons — MEDIUM**
Affected: 3 loading skeleton files
Rule: Card border radius is `rounded-xl` (12px), but loading skeletons should match the exact border radius of the rendered component. If the rendered component uses `rounded-md`, the skeleton must use `rounded-md`.
Fix: Audit each skeleton against its parent rendered component. Match radii exactly.

**V-07: Native alert()/confirm()/prompt() — HIGH**
5 locations:
- `QuestionEditor.tsx` — 3 instances (delete confirmation, save error alert, import success alert)
- `TaxonomyEditor.tsx` — 1 instance (node delete confirmation)
- `SMEReviewQueue.tsx` — 2 instances + 1 native `prompt()` for rejection reason

Rule: Native browser dialogs are banned. They bypass keyboard navigation, screen readers, design system styling, and create jarring UX interruptions.
Fix: Replace each with the existing `Dialog` component from `src/components/ui/dialog.tsx`. The rejection reason `prompt()` specifically needs a Dialog with a Textarea — this is the most UX-impactful replacement.

**V-08: Empty states missing CTA — MEDIUM**
SMEReviewQueue when it is (once fixed) actually empty should show:
`"No articles pending review. [Browse published articles] or [Check pipeline for drafts]"`
Not a blank div. Not "No data found."
Rule: Every empty state must have icon + honest message + CTA.

### Data Layer Violations

**V-09: `select('*')` in activity page — MEDIUM**
File: `src/app/admin/activity/page.tsx:83-88`
Direct inline Supabase call with `select('*')` fetches all audit_log columns unnecessarily.
Fix: Move to query function. Select only: `id, action, user_id, target_type, target_id, created_at, metadata`.

**V-10: Search page fires 3 queries on every keystroke — MEDIUM**
File: `src/app/admin/search/page.tsx:45`
No debounce. Every character triggers questions + articles + taxonomy queries simultaneously.
Fix: `useDeferredValue` with 300ms minimum, or `setTimeout` debounce.

**V-11: Search page swallows errors silently — MEDIUM**
File: `src/app/admin/search/page.tsx:84`
Empty `catch {}` block. User sees no feedback if search fails.
Fix: Set error state, display inline below search bar.

**V-12: Wrong column queries in SMEReviewQueue — CRITICAL**
File: `src/components/admin/SMEReviewQueue.tsx:34`
Queries: `.select('id, title, author_id, submitted_at')`
Actual columns: `article_id`, `title`, `status`, `updated_at`
Fix: `.select('article_id, title, status, updated_at')`

---

## Part 4 — Architecture Violations: Complete Audit

### Client/Server Boundary Violations

**A-01: Direct browser Supabase writes — HIGH (Security)**
Affected components: `QuestionEditor.tsx`, `TaxonomyEditor.tsx`, `AssetUploader.tsx`
These components use the browser Supabase client to write directly to the database, bypassing:
1. Server-side auth verification
2. Audit log creation
3. Input validation via Zod

Fix: Route all mutations through Server Actions. The pattern is already established in `src/lib/actions/admin/questions.ts` and `src/lib/actions/admin/wiki.ts` — replicate for taxonomy and asset mutations.

**A-02: Questions/import and questions/new lack page-level auth guards — MEDIUM**
These routes rely solely on layout-level auth. A direct URL access with a valid session from a non-content-admin role could bypass the layout guard if Next.js caching behaves unexpectedly.
Fix: Add `canManageContent()` guard at the page level for both routes.

### File Organization Violations

**A-03: Activity page has inline Supabase call — MEDIUM**
File: `src/app/admin/activity/page.tsx`
Direct Supabase query inside the page file.
Rule: All queries in `src/lib/queries/[feature].ts`.
Fix: Extract to `src/lib/queries/admin/activity-queries.ts`.

**A-04: WikiEditor.tsx appears unused — LOW**
File: `src/components/admin/WikiEditor.tsx`
Not imported by any admin route. `AdminMDXEditor` is used instead.
Fix: Confirm unused via grep, then delete. If intentionally kept for future use, add a comment explaining why.

### Missing Metadata

**A-05: 8 pages missing metadata exports — LOW**
Affected: `/admin/questions/new`, `/admin/questions/[id]`, `/admin/questions/import`, `/admin/articles/new`, `/admin/articles/[id]`, `/admin/search`, and 2 others.
Fix: Add minimal metadata exports to each page file:
```typescript
export const metadata: Metadata = {
  title: 'Create Question | SlateCamp Admin',
}
```

---

## Part 5 — UX Cognitive Load Review: The Top Friction Points

### Friction #1 — SME Review Queue Is Silently Empty — CRITICAL
**Route:** `/admin/reviews`
**Current state:** The component queries columns that don't exist (`id`, `author_id`, `submitted_at`). The query returns zero rows. The queue always appears empty — even when articles are awaiting review.
**User experience:** An SME reviewer navigates to Reviews expecting to find content to approve. They see nothing. They assume either no articles are pending or the system is broken. Articles sit in "pending" state indefinitely, blocking the content pipeline.
**Fix:** Fix column names to `article_id`, `status`, `updated_at`. Add "N articles pending" count to the sidebar nav badge.
**ICE Score:** Impact 10/10, Confidence 10/10, Ease 9/10 → **Score: 90** — highest priority fix in the entire admin console.

---

### Friction #2 — No WYSIWYG Preview in Article and Question Editors — CRITICAL (UX)
**Route:** `/admin/articles/[id]`, `/admin/questions/new`, `/admin/questions/[id]`
**Current state:** The article editor's Preview tab renders MDX through a standalone processor that does not use `WikiArticleRenderer` — the actual student-facing component. The question editor has no preview at all.
**User experience:** An SME edits a rationale, saves, then has to navigate to the student-facing wiki to see how it actually looks. If there's a layout issue with a `<ComparisonTable />` component at mobile widths, they won't know until a student reports it.
**Fix:**
- Article Preview tab: Import and use `WikiArticleRenderer` with `isPreview={true}`. This is the same component used in `/dashboard/wiki/[slug]`. Not a new renderer — the same one.
- Question Editor: Add a split-pane preview using the actual Camp Mode quiz question component. Show how the question renders in both Camp Mode (with rationale) and Storm Mode (without).
**ICE Score:** Impact 9/10, Confidence 9/10, Ease 6/10 → **Score: 16.2**

---

### Friction #3 — No Bulk Actions Anywhere — HIGH
**Routes:** `/admin/questions`, `/admin/articles`
**Current state:** Both list views show DataTables with individual Edit/Delete per row. There is no multi-select, no bulk delete, no bulk status change, no bulk export.
**User experience:** An SME needs to unpublish 12 articles from an outdated code section before uploading updated versions. They must click Edit → change status → Save on each article individually. 12 articles × 4 clicks = 48 clicks for a task that should take 3.
**Fix:**
- Add checkbox column to DataTables (first column, sticky)
- Floating action bar appears when any rows are selected: "X items selected — [Delete] [Change Status ▾] [Export]"
- Status change dropdown: Draft / Review / Published
- Bulk delete requires confirmation Dialog with item count: "Delete 12 articles? This cannot be undone."
**ICE Score:** Impact 8/10, Confidence 8/10, Ease 5/10 → **Score: 10.7**

---

### Friction #4 — No Urgency Signaling in Navigation — HIGH
**Route:** All (sidebar navigation)
**Current state:** The sidebar nav shows all items with equal visual weight. There is no indicator of pending review items, flagged content, or queue sizes.
**User experience:** An SME reviewer opens the admin console and sees the sidebar. They have no idea if there are 0, 5, or 50 articles waiting for review without clicking into each section.
**Fix:**
- Add badge counts to sidebar nav items where relevant:
  - Reviews: `(N)` count of `wiki_articles WHERE status = 'review'`
  - Pipeline: `(N)` count of items in draft stage
  - Questions analytics: `(N)` count of questions flagged for quality review
- Badges use `DM Mono text-[9px]` styling, consistent with existing badge pattern
- Max display: 99+ for counts over 99
- Badges update on page load (server-rendered count in the sidebar)
**ICE Score:** Impact 8/10, Confidence 9/10, Ease 7/10 → **Score: 18.0**

---

### Friction #5 — Asset Management is Dead-End Navigation — HIGH
**Route:** `/admin/assets`
**Current state:** `AssetList` component contains links to `/admin/assets/new` and `/admin/assets/[id]` — neither page exists. Both links 404.
**User experience:** An admin tries to upload a new 3D asset. Clicks the "Upload Asset" button. Gets a 404. Tries to click into an existing asset to see its metadata. Gets a 404. The entire asset management workflow is non-functional.
**Fix:**
- Create `/admin/assets/new/page.tsx` — upload form with model metadata fields (name, description, linked_node_id)
- Create `/admin/assets/[id]/page.tsx` — asset detail with preview, metadata edit, delete
- OR remove the dead links from AssetList and replace with a modal-based upload/edit flow
**ICE Score:** Impact 7/10, Confidence 10/10, Ease 6/10 → **Score: 14.0**

---

### Friction #6 — Question Editor Initializes 5 Options (Validation Requires 4) — HIGH
**Route:** `/admin/questions/new`, `/admin/questions/[id]`
**Current state:** `QuestionEditor` initializes with 5 empty options. Renders 5 option fields (A–E). But `createQuestion` server action validates `data.options.length !== 4` and rejects submissions.
**User experience:** An SME creates a question with 5 options. Submits. The server action rejects it. The error message (if surfaced — it may be swallowed) says something about option count. The SME has no idea why their question won't save.
**Fix:** Change QuestionEditor to initialize with exactly 4 options. Remove the 5th field. Change default state from `['', '', '', '', '']` to `['', '', '', '']`. Update labels from A–E to A–D.
**ICE Score:** Impact 8/10, Confidence 10/10, Ease 9/10 → **Score: 40.0** — second highest priority.

---

### Friction #7 — No Rejection Reason Input for Review (Native prompt()) — HIGH
**Route:** `/admin/reviews`
**Current state:** The "Request Changes" action uses `window.prompt()` to collect the reviewer's comments. Native browser prompt: unstyled, no character limit, no markdown support, no keyboard trap.
**User experience:** A reviewer clicks "Request Changes" on an article. A system dialog appears with a plain text input. They type their feedback. The feedback is stored. But the author has no way to see formatting, the feedback is limited to what a single-line browser prompt can handle, and the dialog breaks keyboard navigation.
**Fix:** Replace `window.prompt()` with a Dialog component containing:
- Textarea for the rejection reason (minimum 8 rows)
- Character count indicator
- "Cancel" and "Submit Feedback" buttons
- The author's name shown for context
**ICE Score:** Impact 7/10, Confidence 10/10, Ease 7/10 → **Score: 17.5**

---

### Friction #8 — No Question Quality Signals in Questions List — MEDIUM
**Route:** `/admin/questions`
**Current state:** The questions DataTable shows: text (truncated), topic, difficulty, date. There is no indication of which questions are missing rationales, missing code citations, or have IRT quality flags.
**User experience:** A content admin wants to identify all questions that lack rationales so they can assign writing tasks. They have no way to filter or sort by this in the current interface — they'd have to check each question individually.
**Fix:** Add quality indicator columns to the questions table:
- "Rationale" column: ✓ (has rationale) or ✗ (missing) — DM Mono badge styling
- "Citation" column: ✓ (has code_citation) or ✗ (missing)
- Filterable: filter to "Missing rationale" or "Missing citation"
- Quick preview popover on hover showing question stem and current rationale state
**ICE Score:** Impact 7/10, Confidence 8/10, Ease 6/10 → **Score: 11.2**

---

### Friction #9 — Search Fires 3 Database Queries Per Keystroke — MEDIUM
**Route:** `/admin/search`
**Current state:** The search handler fires on every keystroke with no debounce. Each keystroke triggers three simultaneous Supabase queries (questions + articles + taxonomy).
**User experience:** An admin types "PD 1096" in the search bar. Each character fires 3 queries — 7 characters × 3 queries = 21 database round trips for a single search. The result is either a rapid succession of loading/result states, or a stale result from a superseded query arriving after a newer one.
**Fix:** 300ms debounce using `useDeferredValue` or `setTimeout`. Cancel in-flight requests when new input arrives using `AbortController`.
**ICE Score:** Impact 6/10, Confidence 9/10, Ease 8/10 → **Score: 18.0**

---

### Friction #10 — Dashboard Has No Zero-Click Urgency Indicators — MEDIUM
**Route:** `/admin/dashboard`
**Current state:** The dashboard shows stats and recent activity, but there is no "what needs your attention right now" section. Urgent items (pending reviews, flagged questions, pipeline blocks) require navigating to their respective routes to discover.
**User experience:** An SME logs in and sees the dashboard. There's a nice activity feed. But they can't tell in 5 seconds whether there are 0 or 12 articles waiting for their review. They have to navigate to the Reviews route to find out.
**Fix:** Add a "Needs Attention" card at the top of the dashboard:
```
NEEDS ATTENTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● 4 articles pending review     [Review now →]
● 2 questions missing rationale  [Fix →]
● Asset upload failed (3 items)  [Retry →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
This is the zero-click triage card. If all counts are zero, the card shows "All clear — nothing needs immediate attention."
**ICE Score:** Impact 8/10, Confidence 7/10, Ease 6/10 → **Score: 11.2**

---

## Part 6 — Accessibility Violations: Complete Audit

### WCAG 2.1 AA Requirements — Current State

**ACC-01: Color-only status indicators — HIGH**
Multiple components use colored dots or text-color alone to communicate status.
- StatusBadge components: green dot for "Active," amber dot for "Pending" — no text label.
- Coverage heatmap: colored cells with no text alternative in tooltip.
WCAG 1.4.1 Use of Color: Color must never be the only visual means of conveying information.
Fix: Every status indicator must pair color with a text label AND an icon. `🟢 Published` not just a green dot.

**ACC-02: Icon-only buttons without aria-label — HIGH**
Action columns in DataTables use icon buttons (Edit pencil, Delete trash, View eye) without aria-label attributes.
WCAG 4.1.2 Name, Role, Value.
Fix: `<Button aria-label="Edit article: PD 1096 Overview">` on all icon-only buttons.

**ACC-03: DataTable missing th scope attributes — MEDIUM**
The `<th>` elements in admin DataTables lack `scope="col"` attributes.
WCAG 1.3.1 Info and Relationships.
Fix: Add `scope="col"` to all column headers.

**ACC-04: Form fields with placeholder-only labels — MEDIUM**
The search input in `/admin/search` uses only a placeholder, no `<label>` element.
WCAG 1.3.1 Info and Relationships.
Fix: Add a visually hidden `<label>` or `aria-label` to the search input.

**ACC-05: Missing aria-live on dynamic content — MEDIUM**
The DataTables and pipeline boards update dynamically (after mutations, after search filters) without `aria-live` attributes. Screen readers will not announce the change.
WCAG 4.1.3 Status Messages.
Fix: Add `aria-live="polite"` to the data container and announce state changes: "12 articles loaded" / "Search returned 3 results."

**ACC-06: Command palette focus trap — LOW**
The Cmd+K command palette should trap focus when open (Tab should cycle within the palette only, not reach background content).
WCAG 2.1.1 Keyboard.
Fix: Verify focus trap is implemented in the CommandPalette component. Add if missing.

**ACC-07: Touch targets below 44×44px — MEDIUM**
The `text-[9px]` portal components have touch targets smaller than 44×44px.
WCAG 2.5.5 Target Size.
Fix: Increase the hit area with padding even if the visible text remains small. `py-2 px-3` minimum on all interactive elements.

---

## Part 7 — Security Audit: Complete Findings

### SEC-01: Client-Side Direct Writes — HIGH
**Affected:** QuestionEditor, TaxonomyEditor, AssetUploader
These components use the browser Supabase client to write directly to tables. This means:
1. No server-side auth re-verification (only layout-level auth is enforced)
2. No Zod input validation
3. No audit log entries for these mutations
4. RLS policies are the only protection — which is insufficient defense-in-depth

Fix: All mutations through Server Actions with `canManageContent()` check and `createAdminClient()`.

### SEC-02: Auth Gap on Write Routes — MEDIUM
`/admin/questions/new` and `/admin/questions/import` have layout-level auth only. No page-level auth guard.
Risk: If the layout guard is bypassed (cached response, edge case), the write routes are accessible.
Fix: Add `canManageContent()` page-level guard.

### SEC-03: SMEReviewQueue Wrong Queries (Data Integrity) — CRITICAL (Functional, Not Security)
While not a security issue, this is a data integrity issue: reviews that should be visible to reviewers are not. The content pipeline is broken.
Fix: Fix column names.

### SEC-04: Audit Log Gaps from Client-Side Writes — MEDIUM
Because QuestionEditor, TaxonomyEditor, and AssetUploader bypass Server Actions, their mutations produce no audit log entries. The audit trail is incomplete.
Fix: Once SEC-01 is fixed (all mutations through Server Actions), audit logging becomes automatic.

---

## Part 8 — Complete Screen-by-Screen Redesign Specifications

### `/admin/dashboard` — The Command Center

#### Current problems:
- No urgency triage
- Activity feed shows "General Practice" for every session with no subject context
- Stats cards exist but have no visual hierarchy

#### Redesigned layout:

```
┌──────────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                        DM Mono 11px uppercase      │
│  Good morning. Here's what needs attention today.   Inter 13px muted│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  NEEDS ATTENTION         DM Mono eyebrow                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  ● 4 articles pending review          [Review queue →]        │ │
│  │  ● 2 questions missing rationale      [Filter in questions →] │ │
│  │  ● 0 pipeline blocks                  All clear               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  (Only shows if any count > 0)                                       │
│                                                                      │
│  PLATFORM STATS          DM Mono eyebrow                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ 847    │ │ 234    │ │ 12     │ │ 98.4%  │ │ 71     │           │
│  │Questions│ Articles│ Open Rev│ Coverage│ Red nodes│           │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                                      │
│  RECENT ACTIVITY         DM Mono eyebrow                            │
│  [ActivityFeed — with proper subject + session context]             │
│                                                                      │
│  QUICK ACTIONS           DM Mono eyebrow                            │
│  [+ New Question] [+ New Article] [Import Questions] [Coverage Map] │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### `/admin/questions` — Questions List

#### Current problems:
- No multi-select / bulk actions
- No quality indicators (has rationale? has citation?)
- No quick preview

#### Redesigned layout:

```
┌──────────────────────────────────────────────────────────────────────┐
│  QUESTIONS                                 [+ New Question]         │
│  847 questions · 234 with rationale · 156 missing citation          │
├──────────────────────────────────────────────────────────────────────┤
│  [Search questions...]   [Topic ▾] [Difficulty ▾] [Has Rationale ▾] │
│  [Has Citation ▾]        [ALE Area ▾]                               │
├──────────────────────────────────────────────────────────────────────┤
│  FLOATING BAR (when rows selected)                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 12 questions selected  [Delete] [Export CSV] [Bulk Edit ▾]    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ☐  │ Topic          │ Stem (preview)    │ Rationale │ Citation │ Diff │
│  ☐  │ ALE-DSGN-002   │ What is the min.. │ ✓         │ ✓        │ ●●○○ │
│  ☐  │ ALE-STRC-001   │ Given a 400sqm.. │ ✗ MISSING │ ✓        │ ●●●○ │
│  ☐  │ ALE-HIST-003   │ Which building.. │ ✓         │ ✗ MISSING│ ●○○○ │
│                                                                      │
│  [← Prev]  Page 1 of 17  [Next →]         Showing 50 of 847        │
└──────────────────────────────────────────────────────────────────────┘
```

**Quality indicator design:**
- ✓ (text-signal-green): has content
- ✗ MISSING (text-muted-foreground): absent — neutral, not red
- Difficulty: filled circles 1–4 (●●●○ = difficulty 3 of 4)

---

### `/admin/questions/new` and `/admin/questions/[id]` — Question Editor

#### Current problems:
- 5 options vs 4-option validation
- No preview
- Native alert() for delete/save errors

#### Redesigned layout (split-pane):

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Questions    EDIT QUESTION                   [Delete] [Save ⌘S] │
│  ALE-DSGN-002-01 · Doors, Corridors & Washrooms                    │
├───────────────────────────────┬──────────────────────────────────────┤
│                               │                                      │
│  EDITOR (left 50%)           │  PREVIEW (right 50%)                │
│                               │                                      │
│  ─── STEM ─────────────────   │  [Camp Mode] [Storm Mode]           │
│  [Textarea — question text]   │  STUDENT VIEW                       │
│                               │  ┌──────────────────────────────┐   │
│  ─── OPTIONS ──────────────   │  │ Q 7/20  [⚑ Flag]            │   │
│  ○ A [input]                  │  │                              │   │
│  ○ B [input]                  │  │ [Question renders here]      │   │
│  ● C [input] ← correct        │  │                              │   │
│  ○ D [input]                  │  │ ○ A. ...                     │   │
│  (4 options only)             │  │ ○ B. ...                     │   │
│                               │  │ ● C. ...                     │   │
│  ─── RATIONALE ─────────────  │  │ ○ D. ...                     │   │
│  [Textarea]                   │  │                              │   │
│                               │  │ WHY C IS CORRECT             │   │
│  ─── DETAILS ───────────────  │  │ [Rationale renders here]     │   │
│  Code citation [input]        │  │ BP 344 § C.2.1               │   │
│  Difficulty [slider 0.0–1.0]  │  └──────────────────────────────┘   │
│  Context [select]             │                                      │
│                               │  Live preview updates as you type   │
└───────────────────────────────┴──────────────────────────────────────┘
```

**Key changes:**
- 4 options only (A, B, C, D) — fixes the validation bug
- Real-time preview using actual quiz session components
- Camp Mode shows rationale below question
- Storm Mode shows stripped view (no rationale, just question + options)

---

### `/admin/articles/[id]` — Article Editor

#### Current problems:
- Preview tab doesn't use student-facing WikiArticleRenderer
- Metadata fields buried at the bottom of the article content flow
- No coverage indicator (which sections have questions, which don't)

#### Redesigned layout:

```
┌──────────────────────────────────────────────────────────────────────┐
│  CONTENT BAR (sticky 56px)                                          │
│  ← Articles  [Title inline editable]  ALE-DSGN-002-02              │
│  Draft ▾  Intermediate ▾  12 questions  ● Unsaved                  │
│                             [Discard]   [Save ⌘S]                  │
├────────────┬──────────────────────────────────────┬─────────────────┤
│            │                                       │                 │
│  OUTLINE   │  [Editor | Preview (Student View)     │ PROPERTIES      │
│  200px     │     | Diff]                          │ (collapsible)   │
│            │                                       │                 │
│  § Section │  EDITOR TAB:                         │ Taxonomy:       │
│    3q ●    │  [CodeMirror MDX + component toolbar]│ ALE-DSGN-002-02 │
│            │                                       │                 │
│  § Section │  PREVIEW TAB:                        │ Difficulty:     │
│    0q ▲    │  ┌─────────────────────────────────┐ │ Intermediate    │
│    ← empty │  │ STUDENT VIEW                    │ │                 │
│            │  │                                 │ │ ALE Tests You:  │
│  § Section │  │ [WikiArticleRenderer render]   │ │ [input]         │
│    5q ●    │  │ using isPreview={true}          │ │                 │
│            │  │                                 │ │ Reviewer:       │
│            │  └─────────────────────────────────┘ │ [unreviewed]    │
│            │                                       │                 │
│            │  DIFF TAB:                           │ Related:        │
│            │  [Session changes vs last save]      │ 12 questions    │
│            │                                       │ [Edit with Qs →]│
└────────────┴──────────────────────────────────────┴─────────────────┘
```

**The "Preview (Student View)" tab:**
- Amber banner: "Student View — exactly what students see"
- Uses `WikiArticleRenderer` with `isPreview={true}`
- All interactive components render live (`<ComparisonTable />`, `<CorridorVisualizer />`, etc.)
- Same typography, same line-length, same everything as the student wiki

**Outline panel:**
- Auto-generated from MDX headings
- Shows question count per section (3q, 0q, 5q)
- Red triangle ▲ on sections with zero questions — visual cue for coverage gaps

---

### `/admin/reviews` — SME Review Queue

#### Current state: completely broken (wrong column queries)

#### Fixed + redesigned layout:

```
┌──────────────────────────────────────────────────────────────────────┐
│  REVIEW QUEUE                    4 articles pending                  │
│  Sort: Oldest first  [Newest] [Priority]                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ALE-DSGN-002-02                        ● Pending review     │   │
│  │  BP 344 — Doors, Corridors & Washrooms                      │   │
│  │  Updated 2 days ago · 4,200 words                           │   │
│  │                                                              │   │
│  │  [Preview ↗]  [Open in Editor]   [Approve ✓]   [Request Changes ✗]│
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ... (remaining queue items)                                         │
│                                                                      │
│  EMPTY STATE:                                                        │
│  "No articles pending review.                                       │
│   [Browse articles in Draft →] or [Check the publishing pipeline →]"│
└──────────────────────────────────────────────────────────────────────┘
```

**Approve action:** Dialog confirmation. Updates `status` to `published`.
**Request Changes action:** Dialog with Textarea for reviewer notes. Updates `reviewer_comments`, changes `status` back to `draft`.
**"Preview ↗":** Opens the actual student-facing wiki article URL in a new tab. This is the reviewer's ground truth.

---

### `/admin/assets` — Asset Manager (Currently Dead Ends)

#### Required: Create the missing routes

**`/admin/assets/new`:**
```
UPLOAD 3D ASSET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: [input]
Description: [textarea]
File: [file picker — .glb, .gltf, .fbx supported]
Linked taxonomy node: [TaxonomyPicker component]
Model phase: [Guided | Faded | Sandbox | Challenge]
Thumbnail: [auto-generate from model | manual upload]

[Cancel]  [Upload Asset →]
```

**`/admin/assets/[id]`:**
```
ASSET DETAIL — Stairway Configurator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[3D model preview — Three.js viewer, read-only]

File: stairway-configurator.glb (2.4 MB)
Uploaded: March 20, 2026
Linked node: ALE-DSGN-003-01
Used in: 3 trail steps, 2 wiki articles

[Edit metadata]  [Replace file]  [Delete asset]
```

---

## Part 9 — New Components Required

| Component | Location | Purpose | Priority |
|---|---|---|---|
| `NeedsAttentionCard` | `components/admin/NeedsAttentionCard.tsx` | Zero-click triage on dashboard | P1 |
| `QuestionPreviewPanel` | `components/admin/QuestionPreviewPanel.tsx` | Camp Mode + Storm Mode preview | P1 |
| `ArticlePreviewTab` | `components/admin/ArticlePreviewTab.tsx` | WikiArticleRenderer with isPreview | P1 |
| `BulkActionBar` | `components/admin/BulkActionBar.tsx` | Floating multi-select action bar | P2 |
| `ApproveDialog` | `components/admin/ApproveDialog.tsx` | Replace window.confirm for approve | P1 |
| `RequestChangesDialog` | `components/admin/RequestChangesDialog.tsx` | Replace window.prompt for feedback | P1 |
| `DeleteConfirmDialog` | `components/admin/DeleteConfirmDialog.tsx` | Replace all window.confirm on delete | P1 |
| `QualityIndicators` | `components/admin/QualityIndicators.tsx` | ✓/✗ badges for rationale, citation | P2 |
| `ArticleOutlinePanel` | `components/admin/ArticleOutlinePanel.tsx` | 200px outline with question counts | P2 |
| `ArticlePropertiesPanel` | `components/admin/ArticlePropertiesPanel.tsx` | Right sidebar metadata | P2 |
| `AssetUploadForm` | `components/admin/AssetUploadForm.tsx` | /admin/assets/new form | P2 |
| `AssetDetailView` | `components/admin/AssetDetailView.tsx` | /admin/assets/[id] view | P2 |

---

## Part 10 — Existing Components to Reuse

| Component | Use |
|---|---|
| `Button` | All CTAs — default (cobalt), outline, ghost, destructive |
| `Badge` | Status badges, quality indicators |
| `Card` | Section containers throughout |
| `Dialog` | Replaces all 5 native alert/confirm/prompt instances |
| `Tabs` | Editor/Preview/Diff tabs; Camp/Storm mode toggle |
| `Textarea` | Rejection notes, question rationale |
| `DataTable` | Questions list, articles list — add checkbox column |
| `Select` | Status dropdown, difficulty, application context |
| `TaxonomyPicker` | Asset upload form |
| `EmptyState` | Empty review queue, empty search results |
| `AdminMDXEditor` | REUSED in article editor — not rebuilt |
| `Skeleton` | All loading states |
| `Tooltip` | Hover text for icon buttons |

---

## Part 11 — Implementation Phases

### Phase 1: Critical Blockers (1–2 days)

All items here are either broken-in-production or security risks. Nothing new is built until these are fixed.

**1a. Fix SMEReviewQueue column names**
File: `src/components/admin/SMEReviewQueue.tsx:34`
Change: `select('id, title, author_id, submitted_at')` → `select('article_id, title, status, updated_at')`
Effort: 15 minutes.

**1b. Fix QuestionEditor to 4 options**
File: `src/components/admin/QuestionEditor.tsx`
Change: Remove 5th option. Update initial state. Update labels A–D.
Effort: 30 minutes.

**1c. Replace all 5 native alert/confirm/prompt with Dialogs**
5 locations: QuestionEditor (3), TaxonomyEditor (1), SMEReviewQueue (2+1)
Build `DeleteConfirmDialog`, `ApproveDialog`, `RequestChangesDialog`.
Effort: 3–4 hours.

**1d. Route client-side mutations through Server Actions**
QuestionEditor, TaxonomyEditor, AssetUploader mutations.
Effort: 4–6 hours per component.

**1e. Add page-level auth guards to /questions/new and /questions/import**
2 files. Add `canManageContent()` check.
Effort: 30 minutes.

**Commit:** `fix: admin console phase 1 — critical blockers`

---

### Phase 2: UX Friction (3–5 days)

**2a. Add WYSIWYG preview to question editor**
Build `QuestionPreviewPanel` using actual quiz session components.
Split-pane layout. Camp Mode + Storm Mode toggle.
Effort: 1–2 days.

**2b. Fix article editor preview tab**
Import `WikiArticleRenderer` with `isPreview={true}`. Add "Student View" watermark.
Effort: 4 hours.

**2c. Fix SMEReviewQueue UX**
Add proper Dialogs for approve/reject. Fix empty state with CTA.
Preview button that opens actual student wiki URL.
Effort: 4 hours.

**2d. Create missing asset management routes**
`/admin/assets/new/page.tsx` and `/admin/assets/[id]/page.tsx`.
Effort: 1 day.

**Commit:** `feat: admin console phase 2 — ux friction resolution`

---

### Phase 3: Zero-Click Triage + Bulk Actions (2–3 days)

**3a. Needs Attention card on dashboard**
`NeedsAttentionCard` queries: pending reviews count, missing rationale count, pipeline blocks.
Effort: 4 hours.

**3b. Sidebar nav badges**
Add pending count badges to Reviews, Pipeline items.
Effort: 2 hours.

**3c. Bulk actions in questions and articles DataTables**
Add checkbox column. Floating `BulkActionBar`. Bulk delete (with Dialog), bulk status change.
Effort: 1 day.

**3d. Quality indicators in questions list**
`QualityIndicators` badges. Rationale and citation filter.
Effort: 4 hours.

**Commit:** `feat: admin console phase 3 — operational efficiency`

---

### Phase 4: Article Editor Unified View (3–4 days)

This is the Unified Content Editor — the full three-column layout with outline panel, article editor, and questions panel simultaneously visible. Detailed spec in `UNIFIED-CONTENT-EDITOR-UX-PLAN.md`.

**4a. Three-column layout**
Outline panel (200px) + Article panel (55%) + Properties panel (45%).
Effort: 1 day.

**4b. Questions panel**
Lists all questions linked to article's taxonomy nodes.
Each question expandable inline — all 17 fields in Core/Details/Metadata groups.
Effort: 2 days.

**4c. Save All system**
Dirty state tracking per panel. `Promise.allSettled` for parallel saves. Per-item error reporting.
Effort: 1 day.

**Commit:** `feat: admin console phase 4 — unified content editor`

---

### Phase 5: Design System & Accessibility Cleanup (1 day)

**5a. Fix text-[9px] → text-[11px]** in portal components (4 instances).
**5b. Fix rounded-xl in skeletons** (3 files).
**5c. Add aria-labels to all icon-only buttons.**
**5d. Add scope="col" to all table headers.**
**5e. Add aria-live to DataTables.**
**5f. Fix login page zinc-* → Slatecamp tokens.**
**5g. Add missing metadata to 8 pages.**
**5h. Remove or document WikiEditor.tsx.**

**Commit:** `fix: admin console phase 5 — design system and a11y cleanup`

---

## Part 12 — Prioritized Action Plan (ICE Scored)

All items ranked by ICE: (Impact × Confidence) / (11 - Ease)

### CRITICAL — Fix Immediately

| # | Category | Finding | ICE | Effort |
|---|---|---|---|---|
| 1 | Functionality | SMEReviewQueue wrong columns — queue silently empty | 90.0 | 15 min |
| 2 | UX + Data | QuestionEditor 5-option bug vs 4-option validation | 40.0 | 30 min |
| 3 | Security | Client-side direct writes bypass auth/audit | 36.0 | 6 hrs |
| 4 | UX | 5 native alert/confirm/prompt → Dialog | 35.0 | 4 hrs |
| 5 | Functionality | Asset management dead links (404) | 28.0 | 1 day |

### HIGH — Fix This Sprint

| # | Category | Finding | ICE | Effort |
|---|---|---|---|---|
| 6 | UX | No WYSIWYG preview in question editor | 16.2 | 1–2 days |
| 7 | UX | Sidebar nav badges for queue counts | 18.0 | 2 hrs |
| 8 | UX | No rejection reason Textarea for review | 17.5 | 2 hrs |
| 9 | Performance | Search fires 3 DB queries per keystroke | 18.0 | 1 hr |
| 10 | Accessibility | Color-only status indicators | 14.4 | 2 hrs |
| 11 | Accessibility | Icon-only buttons missing aria-label | 12.0 | 1 hr |
| 12 | UX | Article preview doesn't use WikiArticleRenderer | 14.0 | 4 hrs |

### MEDIUM — Fix Next Sprint

| # | Category | Finding | ICE | Effort |
|---|---|---|---|---|
| 13 | UX | No bulk actions in DataTables | 10.7 | 1 day |
| 14 | UX | No quality indicators in questions list | 11.2 | 4 hrs |
| 15 | UX | Dashboard no zero-click triage | 11.2 | 4 hrs |
| 16 | Architecture | Activity page inline Supabase + select('*') | 9.0 | 1 hr |
| 17 | Architecture | Missing page-level auth on write routes | 7.2 | 30 min |
| 18 | Accessibility | DataTable missing th scope | 6.3 | 30 min |
| 19 | Design | text-[9px] → text-[11px] in portal | 4.8 | 30 min |
| 20 | Design | rounded-xl in skeletons | 3.6 | 30 min |

### LOW — Backlog

| # | Category | Finding | ICE | Effort |
|---|---|---|---|---|
| 21 | Design | Login page zinc-* → Slatecamp tokens | 3.6 | 1 hr |
| 22 | Architecture | WikiEditor.tsx unused | 2.0 | 15 min |
| 23 | Architecture | Missing metadata on 8 pages | 2.0 | 1 hr |
| 24 | Design | Hardcoded hex in AdminMDXEditor | 1.6 | 30 min |
| 25 | Accessibility | aria-live on dynamic DataTable updates | 3.6 | 1 hr |

---

## Appendix A: Design Token Reference for Admin

The admin chrome follows SlateCamp design system with one admin-specific override: the topbar and active nav accent use **admin red** (`#6B1A1A` topbar, `#B91C1C` accent, `#FEF2F2` active background). This is chrome identity only — action buttons remain **Cobalt Blue** (`#1B3FC4`). Red chrome ≠ red action.

```css
/* Admin-specific tokens */
--admin-topbar: #6B1A1A;
--admin-accent: #B91C1C;
--admin-accent-light: #FEF2F2;

/* Inherited from SlateCamp design system */
--sc-cobalt: #1B3FC4;     /* Primary action buttons */
--sc-gold: #F5A623;       /* Positive deltas */
--sc-green: #1B7A3C;      /* Published / approved status */
--sc-orange: #E8853A;     /* Single most-important CTA only */
--sc-cream: #F2F0EB;      /* Page backgrounds */
--sc-warm-white: #F8F7F5; /* Card backgrounds */
--sc-border: #E8E4DC;     /* Card borders */
```

### Typography Anti-Patterns to Ban in Admin

- Numbers in Inter instead of DM Mono: `text-2xl font-bold` → `font-mono font-medium text-2xl tabular-nums`
- Cards without eyebrow: bare title → DM Mono eyebrow → Inter title → Inter subtitle
- Body text below 13px: `text-xs` on prose → `text-sm` (Inter 13px minimum)

### Admin-Specific Empty State Template

```tsx
// Every empty state in admin:
<EmptyState>
  <EmptyStateIcon icon={<SearchX className="w-8 h-8" />} />
  <EmptyStateTitle>No articles pending review</EmptyStateTitle>
  <EmptyStateDescription>
    When articles are submitted for review, they'll appear here.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button variant="outline" asChild>
      <Link href="/admin/articles">Browse all articles</Link>
    </Button>
    <Button variant="ghost" asChild>
      <Link href="/admin/pipeline">Check pipeline</Link>
    </Button>
  </EmptyStateActions>
</EmptyState>
```

Never: "No data found." Never: blank div. Always: icon + honest message + 1–2 CTA.

---

*SlateCamp Admin Console UX Research & Design Improvement Plan*
*Version 1.0 · March 2026*
*Source references: Admin Audit V2 (2026-03-24), Admin Audit Prompt v3, Unified Content Editor UX Plan, Testing & Review UX Plan, Camp Trail UX Plan, SlateCamp Design System v6.0*

