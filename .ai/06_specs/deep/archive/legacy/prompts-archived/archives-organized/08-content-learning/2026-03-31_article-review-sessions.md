# EXECUTIVE DIRECTIVE: SESSION HISTORY ROUTING CONDITIONAL REFACTOR

## 1. STRATEGIC OBJECTIVE
Resolve a critical routing failure in the testing dashboard's session history table. The current system blindly routes all "Review" actions to a generic results page. We must implement a conditional routing interceptor that directs standard testing modes to the results view while rerouting reading-based sessions (Article Review, Prequestion) directly to their source articles.

## 2. STRICT OPERATIONAL CONSTRAINTS
* **ZERO STYLING INJECTION:** Do not generate, assume, or inject any CSS, Tailwind classes, or inline styles. You will utilize the existing UI framework natively.
* **STRUCTURAL INTEGRITY:** Prioritize identifying the existing routing paradigm before writing mutation logic. You must respect the established architecture.
* **FAIL-SAFE ROUTING:** The solution must account for missing relational data, such as a missing article ID, to prevent broken redirects.

## 3. PHASED IMPLEMENTATION PLAN

### PHASE 1: DATA MODEL AND STATE VERIFICATION
1. Locate the component rendering the session history table within `/dashboard/testing`.
2. Inspect the data payload for the session objects populating the table rows.
3. Identify the specific property that defines the session mode.
4. Confirm the exact string values or enums used for the "article review" and "prequestion" modes.
5. Verify that the session object contains a relational identifier to the source article (e.g., `articleId` or `slug`) necessary for the new redirect pathway.

### PHASE 2: ROUTING LOGIC INTERCEPTION
1. Locate the event handler bound to the "Review" action button within the table's functional component.
2. Detach the current static routing push function.
3. Replace it with a conditional handler that evaluates the current session's mode property prior to execution.

### PHASE 3: CONDITIONAL REDIRECTION ARCHITECTURE
1. Implement a structural evaluation block to handle the routing logic based on the identified session mode.
2. **Standard Modes:** If the mode is "camp", "subject", or standard "quiz", retain the legacy behavior and execute the route to the standard session results page.
3. **Reading Modes:** If the mode strictly matches "article review" or "prequestion", extract the associated article identifier from the session payload.
4. Construct the dynamic route string pointing to the individual article view and execute the routing command using the application's native routing library.

### PHASE 4: ERROR HANDLING AND EDGE CASES
1. Implement a fallback mechanism within the conditional router. If an "article review" or "prequestion" session lacks a valid article identifier, the system must not attempt a broken redirect.
2. In the event of missing relational data, trigger the application's standard error notification system or gracefully disable the "Review" button for that specific row to prevent a poor user experience.

**EXECUTION COMMAND:** Acknowledge these structural mandates. Begin Phase 1 by identifying the routing library in use and logging the structure of the session data payload before writing the conditional interceptor.
