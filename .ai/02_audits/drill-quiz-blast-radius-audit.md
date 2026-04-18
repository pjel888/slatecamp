# Drill / Quiz Blast Radius Audit

**Date:** 2026-04-18
**Status:** High-Risk Surface Identified

## 1. Overview
The audit of the Drill / Quiz system has identified a critical structural debt: **Mode Key Fragmentation**. The same feature is referred to by different identifiers across the routing, internal logic, and database layers.

### The Fragmented Keys
| Feature | UI / Route Key | Internal / Action Key | DB / Library Key |
|---------|----------------|------------------------|-------------------|
| Focus Review | `focus-review` | `focused` | `blindspot` |
| Article Review| `article-review`| `article_review` | `practice` |
| Full Simulation| `fullexam` | `fullexam` | `proof_sim` |
| Endurance | `extended` | `extended` | `endurance` |

## 2. High-Impact Blast Radius Areas

### A. Routing & Navigation
- **Affected Files**: `src/app/quiz/[mode]/...`, `src/lib/routes.ts`, `ReviewHub.tsx`.
- **Impact**: Any change to the Route Key will break all hardcoded links and bookmarks.
- **Risk**: 404 errors for students returning to active sessions.

### B. State Persistence (Zustand)
- **Affected Store**: `useQuizStore.ts` (persisted to `localStorage`).
- **Impact**: The `mode` is stored in the user's browser. If the code starts expecting `focused` but the browser has `focus-review`, the `MODE_PRESETS` lookup will fail.
- **Risk**: "White-screen" or "Undefined Configuration" errors during active sessions.

### C. Database Consistency
- **Affected Tables**: `quiz_sessions` (`status`, `config`), `user_interactions`.
- **Impact**: The `quiz_sessions` table likely has a check constraint or relies on these strings for reporting.
- **Risk**: Broken analytics and historical session review.

### D. Intelligent Routing & SRS
- **Affected Logic**: `start-session.ts`, `update-mastery-stats.ts`.
- **Impact**: The scoring and mastery updates use the mode to decide the "Alpha" (learning rate).
- **Risk**: Incorrect mastery calculations if the mode is not recognized.

## 3. Implementation Guardrails
- **Mandatory Redirects**: Any route change must be accompanied by a `next.config.js` or `middleware.ts` redirect.
- **Zustand Migration**: Use the `version` and `migrate` features of Zustand's `persist` middleware.
- **DB Backfill**: A SQL migration must be run to normalize existing strings in `quiz_sessions`.
