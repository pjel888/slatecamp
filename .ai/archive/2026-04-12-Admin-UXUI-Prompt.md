You are auditing and planning the UX/UI correction of the admin knowledge taxonomy routes.

Target routes:
- http://localhost:3000/admin/knowledge
- http://localhost:3000/admin/knowledge/questions

Reference route that already behaves correctly:
- http://localhost:3000/dashboard/wiki

Output file required:
- C:\Users\Philip Lewis\Desktop\slatecamp\.ai\plans\Admin-UXUI\2026-04-12-Admin-UXUI-Improvement-Audit-And-Plan.md

Your job is NOT to give a shallow design critique. Your job is to perform a strict comparative audit between the admin routes and the working dashboard wiki route, determine exactly why the admin experience is visually and functionally off, and produce a serious implementation plan that a developer can execute with minimal ambiguity.

## Primary Objective
The UI and interaction model of:
- /admin/knowledge
- /admin/knowledge/questions

must match the quality, behavior, layout logic, and usability of:
- /dashboard/wiki

Specifically, the admin routes should display exactly like the dashboard wiki where applicable, including:
- resizable container behavior
- minimize/collapse tree behavior
- proper spacing and padding discipline
- consistent panel sizing and proportions
- sane content alignment
- no awkward wrapper nesting
- no random extra whitespace
- no broken or degraded interaction behavior
- no admin-only visual regressions unless intentionally justified by product requirements

## Non-Negotiable Rules
1. Do not assume the routes are "basically the same." Verify.
2. Do not stop at screenshots or subjective impressions. Trace the code.
3. Do not give generic advice like "improve spacing" unless you identify the exact component, wrapper, class, style source, or layout decision causing it.
4. Do not skip parity analysis between working and broken routes.
5. Do not stop at the page level. Inspect layout wrappers, route shells, providers, shared components, resizable panel setup, overflow handling, sticky headers, spacing utilities, width constraints, min-height handling, and admin-specific containers.
6. Do not produce a vague to-do list. Produce a structured audit and implementation plan with file-level and component-level specificity.
7. Do not be lazy. If the dashboard wiki uses a shared component, trace how it is instantiated there versus in admin.
8. If the admin routes intentionally diverged, prove whether that divergence is justified or harmful.
9. If there are multiple issues, rank them by severity and implementation dependency.
10. Your output must be useful to an engineer who will actually fix this today.

## What You Must Investigate

### A. Route and Layout Parity
Compare these routes in full:
- /dashboard/wiki
- /admin/knowledge
- /admin/knowledge/questions

Inspect:
- page components
- route-level layout files
- nested layout wrappers
- admin shell vs dashboard shell
- width constraints
- max-width wrappers
- padding and margin sources
- flex/grid parent structure
- overflow rules
- height calculations
- viewport usage
- panel container hierarchy
- sticky regions
- toolbar/header wrappers
- sidebar/tree wrappers
- content pane wrappers
- resizable panel groups and handles
- collapse/minimize tree logic
- client/server component boundaries if relevant to state handling

You must explicitly answer:
- Are these three routes using the same core wiki/taxonomy component or different variants?
- If they use the same component, what wrappers or props are causing the admin degradation?
- If they use different components, where did they diverge and why?
- What exact layout or styling layers are introducing the weird padding and broken feel in admin?
- Why does the dashboard version feel correct while admin feels wrong?

### B. UX and UI Audit
Audit the admin routes from the perspective of actual use, not just code.

Assess:
- visual hierarchy
- panel balance
- discoverability of taxonomy tree
- readability of content area
- spacing rhythm
- edge alignment
- panel resizing usability
- collapse/minimize affordances
- default state quality
- information density
- wasted space
- scroll behavior
- nested scroll containers
- header clutter
- responsiveness
- cross-route consistency
- admin mental model versus dashboard mental model

Call out specific UX/UI issues such as:
- padded containers inside padded containers
- unusable or inconsistent panel widths
- tree area feeling boxed in or visually detached
- content area not using available width/height properly
- broken min/max panel constraints
- missing collapse controls
- poor sticky behavior
- awkward toolbar spacing
- different chrome from dashboard for no valid reason
- admin route looking like a lesser copy instead of the same polished system

### C. Functional Behavior Audit
Verify whether the admin routes are functionally behind the dashboard route.

Check:
- resizable container actually works or not
- tree can be minimized/collapsed or not
- persisted panel state, if implemented in dashboard
- keyboard/accessibility implications of resize/collapse
- overflow clipping
- content expansion after tree minimize
- state synchronization between tree selection and content panel
- any hydration/state bugs caused by route-specific composition

### D. Root Cause Analysis
For every issue, identify root cause category:
- route wrapper issue
- layout shell issue
- duplicated component drift
- styling regression
- prop mismatch
- missing feature wiring
- state handling mismatch
- responsive breakpoint issue
- CSS utility conflict
- hard-coded dimensions
- unnecessary admin-only abstraction

Do not just name symptoms. Name the cause.

## Required Deliverable Structure
Your final markdown file MUST follow this structure exactly:

# Admin UX/UI Improvement Audit and Implementation Plan

## 1. Executive Summary
A concise summary of what is broken, why it matters, and the core reason admin differs from dashboard.

## 2. Scope Audited
List all files, routes, layouts, components, and style sources inspected.
Be explicit. Include file paths.

## 3. Reference Behavior
Document how /dashboard/wiki is built and why it works well.
Include:
- layout composition
- panel behavior
- spacing model
- resize/minimize behavior
- key components involved

## 4. Admin Route Findings
Separate findings for:
- /admin/knowledge
- /admin/knowledge/questions

For each finding include:
- Severity: Critical / High / Medium / Low
- Symptom
- User impact
- Technical cause
- Exact file(s) involved
- Exact component(s) involved
- Recommended fix

## 5. Parity Gaps vs Dashboard Wiki
A direct side-by-side list of everything the admin routes are missing or doing worse than /dashboard/wiki.

This section must clearly answer:
- what should be identical
- what is currently different
- whether the difference is intentional, accidental, or unjustified

## 6. UX/UI Recommendations
Turn the findings into clear interface recommendations.
These must be concrete, not fluffy.
Examples:
- remove duplicate horizontal padding from X wrapper
- move resizable panel group one layout level higher
- reuse dashboard wiki shell component in admin
- unify header spacing tokens
- eliminate nested overflow containers
- adopt same collapse control placement as dashboard

## 7. Implementation Plan
Break the fix into phases:
- Phase 1: Fast structural parity fixes
- Phase 2: Styling cleanup and spacing normalization
- Phase 3: Interaction and behavior parity
- Phase 4: Verification and regression testing

For each phase include:
- goals
- exact files to modify
- expected outcome
- risks/dependencies

## 8. Proposed Refactor Strategy
State whether the right fix is:
- reuse the exact dashboard wiki composition in admin
- extract a shared shell/layout primitive
- delete duplicate admin-only composition
- normalize prop contracts
- consolidate styling tokens

Take a position. Do not hedge.

## 9. Verification Checklist
Provide a rigorous QA checklist covering:
- visual parity
- resize behavior
- collapse/minimize behavior
- spacing consistency
- scroll behavior
- responsive states
- empty/loading/error states if relevant
- regression risk to dashboard route

## 10. Recommended Next Actions
Provide the most sensible order of execution for engineering.

## 11. Appendix: Evidence
Include code references, relevant snippets summarized in prose, and any route/component mapping needed to justify conclusions.

## Required Working Method
Follow this process in order:

1. Find the exact files powering /dashboard/wiki, /admin/knowledge, and /admin/knowledge/questions.
2. Map the route tree and layout tree for each route.
3. Identify the shared taxonomy/wiki/tree components.
4. Compare how each route composes those shared pieces.
5. Identify all wrapper, className, spacing, sizing, and overflow differences.
6. Verify whether resizable and minimize-tree behavior are wired identically.
7. Identify all divergence points.
8. Determine which divergences are bugs versus intentional design choices.
9. Produce the markdown audit and plan in the required output file.

## Additional Constraints
- Be brutally concrete.
- Prefer file-level evidence over opinion.
- Prefer root causes over surface commentary.
- Prefer reuse and consolidation over patching duplicated garbage.
- If admin is using a forked version of a working component, say so plainly.
- If the issue is wrapper bloat, say so plainly.
- If the issue is lazy route composition, say so plainly.
- If the issue is styling drift, say so plainly.
- If the issue is bad panel architecture, say so plainly.

## Definition of Done
This task is only done if the output file:
- identifies the exact source of the admin UX/UI degradation
- explains why /dashboard/wiki works better
- gives an implementation plan detailed enough to execute immediately
- leaves almost no room for hand-wavy interpretation

Now perform the audit and write the final markdown document to:
C:\Users\Philip Lewis\Desktop\slatecamp\.ai\plans\Admin-UXUI\2026-04-12-Admin-UXUI-Improvement-Audit-And-Plan.md
