# 2026-04-10 UX/UI Loading Improvements
## A User-Experience Strategy for SlateCamp

---

## 1. Executive Summary

This document transforms the loading state audit from a technical code scan into a user-experience strategy. The core question is not "where does async code exist?" but **"where does the user feel uncertainty, delay, risk, or loss of trust?"**

SlateCamp has several high-cognitive-load surfaces—drills, wiki, analytics, 3D Lab, notes, trails, and admin—where the cost of poor loading feedback is higher than in a simple CRUD app.

### Canonical Loading Primitives (Already Exist)

| Primitive | File | Use For | Status |
|-----------|------|---------|--------|
| `SlatecampLoader` (isOverlay) | `src/components/shared/SlatecampLoader.tsx` | Blocking operations, results, high-stakes transitions | **Robust** (Branded messages) |
| `NavigationProgress` | `src/components/shared/NavigationProgress.tsx` | Route transitions | **Functional** |
| `Button loading` prop | `src/components/ui/button.tsx` | Inline button feedback | **Excellent** (Auto-promise handling) |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Content placeholders | **Basic** |
| `ChartSkeleton` | `src/components/analytics/ChartSkeleton.tsx` | Analytics placeholders | **Needs Refinement** (Too simple) |
| `CanvasLoadingOverlay` | `src/components/r3f/CanvasLoadingOverlay.tsx` | 3D scene loading | **Functional** |

---

## 2. Audit Findings & Gap Analysis (April 2026)

Following a deep-dive into the codebase, the following gaps have been identified between the current state and the target UX strategy:

### A. The "Flicker" Problem
Fast server actions (like `submitAnswer`) sometimes resolve so quickly that the "submitting" state or "calculating" overlay flickers for <100ms. This causes visual fatigue and makes the app feel "twitchy".
- **Directive**: Enforce a **Minimum Visible Duration (MVD)** of 600ms for all blocking overlays and 400ms for button loading states.

### B. Admin Navigation Safety
While `SaveAllBar.tsx` handles the mechanics of saving, the `UnifiedContentEditor.tsx` does not "lock" the user out of navigation (sidebar, back buttons, status switches) during an active save.
- **Directive**: Wrap the Admin sidebar and top-level navigation in a `pointer-events-none` container when `isSaving` is true.

### C. Skeletal Accuracy
The current `ChartSkeleton.tsx` is a generic pulsing rectangle. It doesn't match the layout of the chart or table it replaces, leading to a high **Cumulative Layout Shift (CLS)** when data arrives.
- **Directive**: Refactor `ChartSkeleton` into a polymorphic component supporting `type="bar"`, `type="line"`, and `type="table"`.

### D. Importer Feedback
`ArticleQuestionImporter.tsx` uses a simple "Importing..." text. For large JSON payloads, users have no visibility into where the failure occurred (parsing vs. validation vs. database write).
- **Directive**: Implement a step-based progress indicator in the Dialog.

---

## 3. Severity Model: Trust vs. Flow

Every wait state must be classified by risk level. Not every missing spinner is equally bad.

### Severity Tiers

| Tier | Definition | Examples | Required Feedback |
|------|------------|----------|-------------------|
| **Trust-Critical** | User performs high-stakes action; failure or ambiguity causes loss of trust in the learning engine | Start drill, submit answer, finish drill, calculate results, save note, login/register, admin save/publish/delete | Immediate disabled + spinner; escalation to overlay if slow |
| **Flow-Critical** | User expects smooth continuation; delay breaks cognitive flow but trust is not at stake | Open analytics, filter data, switch tabs, paginate | Section skeleton or shimmer; no blocking overlay |
| **Nice-to-Have** | Background process; user may not notice or care | Autocomplete, prefetch, optimistic UI | Silent or subtle; inline spinner only if user explicitly waits |

---

## 4. Timing Rules: Escalation Model

A serious UX loading standard requires explicit thresholds.

| Wait Duration | User Experience | Required Feedback |
|---------------|-----------------|-------------------|
| **0–150ms** | Instant acknowledgment | Pressed state, no loading UI needed unless click needs acknowledgement |
| **150–500ms** | Immediate feedback | Spinner visible, button disabled |
| **500–1200ms** | Clear visibility | Spinner or skeleton with status text |
| **1200–2500ms** | Reassurance needed | Explicit status message: "Calculating results..." |
| **2500–5000ms** | Escalation | Progress cues, encouraging text, prevent user panic |
| **5000ms+** | Recovery mode | Cancel button, retry option, fallback if possible |

---

## 5. Feature-Specific Implementation Directives

### A. Drills (Trust-Critical Priority #1)

**Codebase Audit Findings:**
- `useQuizStore` handles `submitting` status correctly.
- `flushOfflineQueue` is implemented for resilience.
- **Missing**: Minimum duration for `calculatingResults` overlay.

**Implementation Directives:**
- **Calculated Results Overlay**: Ensure the transition from the last question to the results page is handled by a `SlatecampLoader` with `isOverlay={true}` and a `staticMessage="Analyzing your performance..."`.
- **MVD Enforcer**: Wrap the result calculation in a `Promise.all([action, delay(800)])` to prevent flicker.

### B. Analytics Dashboard (Flow-Critical)

**Codebase Audit Findings:**
- `AnalyticsPage` uses `Suspense` correctly.
- `ChartSkeleton` is too generic.

**Skeletal Visual Grammar:**
- **Enhanced Chart Skeleton**:
  - `type="bar"`: 5 vertical bars of varying heights.
  - `type="table"`: 1 header row + 5 shimmer rows.
- **Batch Reveal**: All cards in a row should ideally share a single `Suspense` boundary to prevent staggered "pop-in".

### C. Admin CMS (Trust-Critical)

**Codebase Audit Findings:**
- `SaveAllBar.tsx` is robust with conflict detection.
- `UnifiedContentEditor.tsx` lacks a "Save Lock".

**Implementation Directives:**
- **Navigation Safety Lock**: When `isSaving` is true in `UnifiedContentEditor`, apply a semi-transparent overlay to the sidebar and header to prevent navigation away from the dirty state.
- **Progressive Importer UI**: Refactor `ArticleQuestionImporter.tsx` to use a state machine: `idle` → `parsing` → `validating` → `importing` → `success`.

### D. Notes & Wiki (Flow-Critical)

**Implementation Directives:**
- **Auto-save Banner**: Persistent text in the note footer using the `saveStatus` from the store: `Syncing...` | `Saved at 14:02` | `Offline (Local Save)`.
- **Wiki Content Blocks**: Use `Skeleton` with varying widths (100%, 95%, 98%, 40%) in `WikiArticle.tsx` to simulate paragraph structure during load.

---

## 6. Interaction Integrity Rules

These rules are non-negotiable and must be enforced by the codebase AI:

1. **Deterministic Interaction Lock**: Every button calling a server action MUST use the `loading` prop or set a local `disabled` state immediately.
2. **Width Stability**: Buttons must maintain their exact `px` width when transitioning to a loading state. (The `Button` component handles this if `loadingText` is roughly same length as `children`).
3. **Cumulative Layout Shift (CLS) Cap**: Skeletons must match the median height of the expected content.
4. **Minimum Visible Duration (MVD)**: Never show a blocking loading state for less than 600ms.
5. **Contextual Recovery**: Failed mutations must never clear user input. Keep the form "dirty" and provide a "Retry" button.

---

## 7. Prioritized Execution Plan (Updated)

### P0: Trust-Critical (Safety and Data Integrity)
- [ ] **Admin Save Lock**: Disable sidebar/nav in `UnifiedContentEditor.tsx` during save.
- [ ] **Auth Form Widths**: Ensure login/register buttons have fixed widths to prevent jump on "Redirecting...".
- [ ] **MVD Enforcer**: Add a utility for minimum promise duration and apply to `submitAnswer`.

### P1: Perceived Performance
- [ ] **Polymorphic Chart Skeletons**: Update `ChartSkeleton.tsx` with specific layouts.
- [ ] **Wiki Paragraph Skeletons**: Implement varied-width skeletons for article content.

### P2: Polish
- [ ] **Step-based Importer**: Update `ArticleQuestionImporter.tsx` with stage feedback.
- [ ] **Global Save Toast**: Centralize success feedback via a custom hook.

---

*Last Updated: 2026-04-10 (Audit-driven refinement)*
*Author: Gemini CLI*