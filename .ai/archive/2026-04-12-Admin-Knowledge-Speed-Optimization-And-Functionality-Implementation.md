# Admin Knowledge Routes: Speed, Optimization, and Functionality Fix Prompt

You are not being asked to write an audit. You are not being asked to write a plan. You are being asked to go into the codebase and fix the admin knowledge routes now.

## Routes in scope
- `http://localhost:3000/admin/knowledge`
- `http://localhost:3000/admin/knowledge/questions`

## Benchmark / reference behavior
Use this route as the functional and UX reference for expected quality and behavior:
- `http://localhost:3000/dashboard/wiki`

The admin routes should feel fast, stable, properly structured, and fully functional. Right now they are not. Treat this as a real defect, not a suggestion.

## Objective
Implement all necessary code changes so that `/admin/knowledge` and `/admin/knowledge/questions` are:
- fast to load
- responsive during navigation and interaction
- free from obvious rendering waste
- free from infinite loops, repeat fetching, or runaway re-renders
- fully working for CRUD behavior
- visually and functionally consistent where they are supposed to match the working wiki experience
- production-grade in behavior, not just cosmetically patched

## Non-negotiable instructions
1. Do not stop at surface-level tweaks.
2. Do not give generic recommendations instead of changing code.
3. Do not say something “may be causing” an issue without tracing the actual cause in code.
4. Do not leave TODOs in place of fixes unless something is genuinely blocked by missing backend capability, and if blocked, prove exactly where and why.
5. Do not only inspect the route files. Trace the full chain: pages, layouts, wrappers, providers, hooks, shared components, tree views, panels, CRUD handlers, query logic, state management, and styling.
6. Do not assume the admin routes are fine because they render. Test them properly.
7. Do not ship lazy fixes that hide symptoms while leaving duplicate requests, unnecessary state churn, broken memoization, or effect loops intact.
8. Do not produce an audit-and-plan document. Implement first.

## Required work

### 1. Trace the actual route composition
For both admin routes, identify and inspect:
- route/page entry files
- layout wrappers
- shared wiki/taxonomy/tree components
- resizable panel/container components
- minimize/collapse tree behavior
- data fetching hooks
- mutations and CRUD actions
- selection state, router state, and query param syncing
- any admin-only wrappers that may be causing extra padding, broken layout, or wasted renders

Then compare that against the working implementation in `/dashboard/wiki`.

### 2. Fix speed and performance problems
You must actively investigate and fix performance problems, including but not limited to:
- unnecessary rerenders
- state updates that cascade through the whole tree
- unstable props causing child rerenders
- unnecessary effect triggers
- duplicate fetches
- N+1 style request patterns where avoidable
- poor suspense/loading behavior
- expensive tree recalculations on every render
- over-broad context updates
- layout thrashing
- missing memoization where it materially matters
- query invalidation that causes excessive refreshes
- route transitions that feel sticky or slow
- client-side loops tied to URL sync, selection sync, or pagination sync

Use actual evidence from the code and runtime behavior. Do not guess.

### 3. Test and fix CRUD thoroughly
You must test CRUD behavior in the admin knowledge routes, end to end as far as the local environment allows.

Check whether the following are working correctly and fix them if they are not:
- create
- read/load
- update/edit
- delete
- refresh after mutation
- optimistic updates or post-mutation state consistency
- selection state after CRUD
- pagination or list refresh behavior after CRUD
- error handling
- empty states
- loading states
- stale data after edits
- broken parent-child tree updates after mutations

If one route uses the same underlying component set as the other, verify both anyway. Do not assume parity.

### 4. Check for infinite loops and fix them immediately
You must specifically hunt for:
- `useEffect` loops
- state-sync loops
- router/query-param loops
- fetch -> setState -> fetch loops
- mutation invalidation loops
- repeated mount/unmount loops
- polling or refresh loops that should not exist
- recursive rendering patterns in the tree UI
- repeated console noise or request spam indicating churn

If any such loop exists, fix it at the root cause, not with a band-aid.

### 5. Make page changes fast
Navigation between pages, nodes, tabs, or records inside these routes must feel fast and deliberate.

You must inspect and improve:
- route transitions
- selection changes
- tree node expansion/collapse
- switching between knowledge areas/questions
- loading fallback quality
- whether the UI blocks unnecessarily during navigation
- whether panels remount unnecessarily
- whether data can be preserved or cached correctly between adjacent views

The result should feel operationally sharp, not sluggish.

### 6. Preserve or restore expected functionality from `/dashboard/wiki`
Where the admin routes are supposed to behave like `/dashboard/wiki`, bring them up to that level.
That includes behavior such as:
- proper resizable container behavior
- proper minimize/collapse tree behavior
- sane panel sizing behavior
- stable layout structure
- no weird spacing, wrapper interference, or broken containment caused by admin-specific shells

Do not blindly copy code. Understand why the dashboard route works and make the admin routes behave correctly.

## Required implementation standards
- Fix root causes, not symptoms.
- Prefer simplifying data flow over stacking more state on top of broken state.
- Remove dead logic if it contributes to confusion or churn.
- Keep behavior consistent across both admin routes.
- Keep the final code maintainable.
- Avoid pointless abstraction unless it reduces duplication and improves correctness.
- Add or improve guards around undefined states, race conditions, and failed requests.
- Ensure no visual regressions are introduced while fixing speed and functionality.

## Validation you must perform before finishing
You are not done until you have validated the following in the local app:

### Functional validation
- both routes load without runtime errors
- tree renders correctly
- CRUD works correctly
- state updates correctly after CRUD
- no broken selection behavior
- no broken expand/collapse behavior
- no broken resize/minimize behavior where applicable

### Performance validation
- no obvious infinite rerender loop
- no obvious repeated network/request loop
- no obviously unnecessary remounting of major panels
- switching between pages/items feels materially faster than before
- no major UI freeze during common actions

### Code validation
- no TypeScript or lint regressions introduced by the fix
- no dead imports or abandoned experimental code left behind
- all touched files are coherent and cleaned up

## Output format
After implementing the fixes, output only this:

### 1. Summary of what was fixed
A concise but concrete summary of the actual fixes implemented.

### 2. Files changed
List every file touched.

### 3. Root causes found
List the real root causes you found. Be specific.

### 4. Validation performed
State exactly what you tested for CRUD, speed, navigation, and loop detection.

### 5. Remaining blockers
Only include this section if something could not be completed. If so, be exact and technical.

## Final warning
This task is not complete unless code was changed, the routes were tested, performance issues were actively investigated, CRUD was verified, and infinite loops were checked and fixed where present.

Do the work. Do not hand back a glorified memo.
