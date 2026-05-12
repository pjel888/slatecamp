# SYSTEM DIRECTIVE: SESSION HISTORY UI ARCHITECTURE AND LOGIC REFACTOR

## 1. STRATEGIC OBJECTIVE
Execute a structural refactor of the testing dashboard layout. The objective is to centralize session management by decommissioning the persistent top-level notification banner and migrating its operational controls directly into the session history data table. This requires strict conditional rendering to protect immutable historical data.

## 2. STRICT OPERATIONAL CONSTRAINTS
* **NO ASSUMED STYLING:** You are strictly forbidden from generating, assuming, or injecting any CSS, Tailwind classes, or inline styles. Inherit the existing UI framework and component library entirely.
* **CODEBASE RECONNAISSANCE FIRST:** Audit the existing components and data models before altering the structural code.
* **DATA INTEGRITY:** Completed sessions are immutable. The system must not expose any frontend pathway to abandon or delete a completed session.

## 3. PHASED IMPLEMENTATION PLAN

### PHASE 1: SITE SURVEY AND DISCOVERY
1. Scan the repository to locate the primary routing component for `/dashboard/testing`.
2. Identify the legacy notification banner component currently responsible for displaying the active session alert and controls.
3. Locate the data table component responsible for rendering the session history (identifiable by columns: MODE, Questions, Score, Status, Data).
4. Audit the existing state management and mutation functions currently bound to the banner's "Resume" and "Abandon" triggers so they can be accurately ported.

### PHASE 2: DEMOLITION OF LEGACY SYSTEMS
1. Sever the rendering logic for the top-level notification banner within the dashboard layout.
2. Remove the banner component entirely from the view hierarchy.
3. Verify that the underlying state management handling the "in progress" session data remains intact in the global or local state context for reassignment to the table rows.

### PHASE 3: STRUCTURAL TABLE MODIFICATION
1. Modify the table header configuration to append a new column explicitly titled "Actions".
2. Update the iterative row rendering logic to populate the new "Actions" cell for every corresponding data row.
3. Ensure the table layout framework seamlessly accommodates the new column using the project's existing structural properties.

### PHASE 4: CONDITIONAL LOGIC AND ACTION ROUTING
1. Implement strict conditional rendering inside the "Actions" cell. This logic must evaluate against the individual session's status property.
2. **For "In Progress" Sessions:** Render the "Resume" and "Abandon" action triggers. Bind these triggers to the mutation and routing functions salvaged from the legacy banner.
3. **For "Completed" Sessions:** Render the "Review" action trigger. Ensure the rendering logic strictly prohibits the "Abandon" trigger from mounting.
4. Verify that executing the "Abandon" action reliably terminates the targeted session and immediately triggers a localized state refresh to update the table data without requiring a hard page reload.

**EXECUTION COMMAND:** Acknowledge these structural requirements. Begin Phase 1 by identifying the routing components and isolating the state tied to the legacy banner before proceeding to the demolition phase.
