# Prompt for Codebase AI

You are to perform a **strict, codebase-grounded audit and implementation planning exercise only** for the following routes:

- `http://localhost:3000/admin/knowledge`
- `http://localhost:3000/admin/knowledge/questions`

Reference route for expected behavior and quality benchmark:

- `http://localhost:3000/dashboard/wiki`

## Non-Negotiable Rule

**Do not implement anything. Do not edit files. Do not refactor. Do not patch. Do not open a PR. Do not “start fixing along the way.”**

This task is **audit and implementation planning only**.

The output must be based on the **actual codebase**, not guesses, not assumptions, not generic advice, and not filler UX commentary.

---

## Primary Objective

Audit the admin routes with a hard focus on:

1. **Speed**
2. **Optimization**
3. **Functionality**
4. **CRUD correctness and reliability**
5. **Route transitions / page switching performance**
6. **Infinite loops, rerender churn, repeated fetches, unstable state flows, and wasteful rendering**
7. **Parity gaps versus `/dashboard/wiki` where relevant**

Then produce a **concrete implementation plan** for fixing everything found.

Again: **no execution, no code changes, no patching**.

---

## What You Must Audit

### A. Route and component architecture
You must trace the real route composition for:

- `/admin/knowledge`
- `/admin/knowledge/questions`
- `/dashboard/wiki`

Identify all relevant:

- route files
- page files
- layout files
- wrappers
- providers
- context layers
- hooks
- shared components
- tree/sidebar components
- resizable panel components
- CRUD-related components
- data fetching utilities
- mutations
- cache/state management logic

You are not allowed to say “these routes seem similar” without proving it from the code.

---

### B. Performance and speed audit
You must inspect and document, at minimum:

- slow initial render risks
- excessive client-side work
- unnecessary hydration cost
- repeated queries or duplicate fetches
- n+1 fetch patterns
- unnecessary rerenders
- unstable props / callback churn
- bad memoization boundaries
- missing memoization where it matters
- wasted effects
- effects that trigger loops or repeated data loads
- bad dependency arrays
- derived state stored unnecessarily
- excessive wrapper nesting
- large components doing too much work
- route transitions that feel slow because of blocking work
- tree rendering bottlenecks
- list rendering bottlenecks
- expensive filtering/sorting/searching on every render
- poor suspense/loading boundary usage
- missing optimistic UI where relevant
- cache invalidation issues that cause redundant work
- poor CRUD refresh behavior after create/update/delete

You must assess **why changing pages may feel slow** and identify the exact code paths likely causing it.

---

### C. Functionality and CRUD audit
You must inspect the actual CRUD flows on both admin routes and determine:

- what entities are being created, read, updated, and deleted
- which actions are exposed in UI
- which actions appear partially wired or fragile
- whether the CRUD flows are architecturally sound
- whether state updates after CRUD are reliable
- whether the tree and detail views stay in sync
- whether selected item state breaks during create/update/delete
- whether pagination, navigation, or filtering can break state continuity
- whether route changes can reset or corrupt local UI state unnecessarily
- whether there are race conditions or stale state risks
- whether any mutation can trigger loops, duplicate requests, or inconsistent rendering

You are not allowed to stop at “CRUD should be tested.” You must inspect the implementation and identify likely failure points from the code.

---

### D. Infinite loop and re-render risk audit
This is mandatory.

You must aggressively inspect for:

- `useEffect` loops
- mutation-triggered refresh loops
- state-setting inside effects without proper guards
- unstable dependencies in effects
- derived data recreated every render and fed back into state/effects
- recursive render triggers
- router-driven loops
- query invalidation loops
- controlled/uncontrolled component thrashing
- tree expansion / selection loops
- URL sync loops
- cross-component state feedback loops

Do not hand-wave this. Point to the actual files, hooks, effects, and state relationships that are risky.

---

### E. Benchmark against `/dashboard/wiki`
You must compare the admin routes against `/dashboard/wiki` specifically for:

- perceived speed
- layout structure affecting performance
- shared vs divergent component usage
- whether the admin routes are using the same core wiki/tree/resizable architecture or a degraded fork
- missing performance protections present in dashboard wiki
- missing UX patterns that affect responsiveness or usability

This is not just visual comparison. This is architectural and behavioral comparison.

---

## Required Working Method

You must follow this workflow exactly.

### Step 1. Trace route ownership
Map the exact file path and ownership chain for all three routes.

### Step 2. Trace data flow
Map the fetch and mutation flow for both admin routes.

### Step 3. Trace state flow
Map selection state, tree state, panel state, pagination state, and route state.

### Step 4. Identify speed bottlenecks
List all likely causes of slowness, ranked by severity and confidence.

### Step 5. Identify functionality risks
List all likely CRUD, synchronization, and navigation risks.

### Step 6. Identify loop/rerender risks
List all likely infinite loop, rerender churn, or redundant fetch issues.

### Step 7. Produce implementation plan only
Produce a concrete fix plan grouped by priority and file scope.

No code changes at any point.

---

## Output Format

Your response must use the exact structure below.

# 1. Executive Summary
A hard, concise summary of what is wrong with `/admin/knowledge` and `/admin/knowledge/questions` from a speed, optimization, and functionality perspective.

# 2. Route and Component Map
For each route, list:
- route/page file
- layout/wrapper chain
- major components used
- data hooks used
- mutation hooks used
- shared components with `/dashboard/wiki`
- components that differ from `/dashboard/wiki`

# 3. CRUD Flow Audit
For both admin routes, document:
- create flow
- read flow
- update flow
- delete flow
- state refresh behavior after each action
- likely failure points
- missing protections
- UX risks tied to functionality

# 4. Performance Audit
This section must include:
- bottleneck
- root cause
- affected file(s)
- severity: Critical / High / Medium / Low
- confidence: High / Medium / Low
- why it impacts speed
- what kind of fix would likely solve it

# 5. Infinite Loop and Re-render Risk Audit
This section must include:
- suspected loop/churn issue
- exact file/hook/effect/component involved
- why it is risky
- trigger condition
- user-facing symptom
- severity
- confidence
- proposed remediation direction

# 6. Dashboard Wiki Parity Analysis
Compare `/admin/knowledge` and `/admin/knowledge/questions` against `/dashboard/wiki` and document:
- what is shared
- what diverges
- what is missing
- what architecture should likely be unified
- what patterns should be inherited from dashboard wiki

# 7. Prioritized Implementation Plan
This must be a real plan, not vague advice.

Group it into:
- Phase 1: Critical stability and correctness
- Phase 2: Performance and speed
- Phase 3: UX responsiveness and polish
- Phase 4: Cleanup and architectural unification

For each item include:
- title
- goal
- exact files/components likely involved
- action to take
- expected impact
- dependency/order notes
- risk if not fixed

# 8. Fastest Wins
List the highest-value, lowest-risk changes that should be implemented first once execution is approved.

# 9. Open Questions That Must Be Verified Before Implementation
Only include real questions that cannot be resolved from the codebase. Do not use this section as a dumping ground for laziness.

---

## Strict Prohibitions

Do **not** do any of the following:

- do not implement fixes
- do not propose “maybe” language without code evidence
- do not write generic React or Next.js best practices unless tied to an exact part of the codebase
- do not give fluffy UX commentary disconnected from actual code
- do not stop at visual critique
- do not say “needs optimization” without naming the bottleneck and probable cause
- do not say “test CRUD” without tracing the CRUD flow and identifying likely breakpoints
- do not say “could be a rerender issue” without naming the component/hook/effect relationship
- do not skip the comparison against `/dashboard/wiki`
- do not give a short answer

---

## Quality Bar

The final output must be strong enough that an engineer can immediately start execution from the plan **without needing a second audit pass**.

If your answer reads like a generic consultant memo, you failed.
If your answer does not name files, hooks, components, flows, and probable root causes, you failed.
If your answer drifts into implementation, you failed.

Produce a hard, specific, evidence-based audit and implementation plan only.
