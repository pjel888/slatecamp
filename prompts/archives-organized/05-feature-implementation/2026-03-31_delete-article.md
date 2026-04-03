# EXECUTION DIRECTIVE: ARTICLE DELETION WORKFLOW AND CONFIRMATION MODAL

## 1. STRATEGIC OBJECTIVE
Implement a secure, two-step deletion workflow for articles to prevent accidental data loss. This requires a reusable confirmation modal integrated into two specific routing contexts: the article list view and the individual article detail view. 

## 2. STRICT OPERATIONAL CONSTRAINTS
* **NO ASSUMED STYLING:** You are strictly forbidden from generating, assuming, or injecting any CSS, Tailwind classes, or inline styles. You must inherit the existing UI framework and component library present in the codebase.
* **CODEBASE RECONNAISSANCE FIRST:** Do not write new structural code before auditing the existing components.
* **REUSABILITY:** The confirmation modal must be a single source of truth. Do not build duplicate modals for the list and detail views.

## 3. PHASED IMPLEMENTATION PLAN

### PHASE 1: SYSTEM AUDIT AND DISCOVERY
1. Scan the repository to locate the existing routing components for `http://localhost:3000/admin/articles` (List View) and `http://localhost:3000/admin/articles/{slug}` (Detail View).
2. Audit the component library for an existing, generic Modal or Dialog component. If one exists, you must use it.
3. Identify the current data fetching and mutation layer responsible for HTTP DELETE requests targeting the article resources.

### PHASE 2: CONFIRMATION MODAL ARCHITECTURE
1. Construct a logical wrapper or state-driven component for the deletion modal.
2. The modal must accept the following minimum properties: `isOpen` (boolean state), `articleIdentifier` (string or ID payload), `onConfirm` (execution function), and `onCancel` (dismissal function).
3. The copy must explicitly ask the user to confirm the action, prompting them to proceed to delete the article.
4. Ensure the modal intercepts user interaction, relying entirely on the existing accessibility and overlay standards of the project to prevent background interaction while active.

### PHASE 3: LIST VIEW INTEGRATION (/admin/articles)
1. Inject local state into the List View component to manage the visibility of the deletion modal and track the currently selected article target for deletion.
2. Bind the existing delete trigger on individual list items to open the modal and set the target article state.
3. Implement the `onConfirm` execution logic: invoke the API deletion endpoint, await the response, close the modal, and trigger a refetch or optimistic update of the article list to reflect the deleted state.

### PHASE 4: DETAIL VIEW INTEGRATION (/admin/articles/{slug})
1. Inject local state into the Detail View component to manage the modal visibility.
2. Bind the existing delete trigger within the detail layout to open the modal.
3. Implement the `onConfirm` execution logic: invoke the API deletion endpoint and await the response.
4. **CRITICAL ROUTING STEP:** Upon successful deletion from the detail view, you must immediately redirect the user back to the `/admin/articles` index to prevent the application from rendering a null or broken state.

### PHASE 5: ERROR HANDLING AND STATE MANAGEMENT
1. Implement a loading state within the modal during the active network request to prevent duplicate deletion submissions.
2. If the API request fails, catch the error, ensure the modal is handled appropriately, and trigger the existing error notification system within the application. Do not assume the notification system; discover and use the established pattern.

**EXECUTION COMMAND:** Acknowledge these structural requirements. Begin Phase 1 by identifying the routing components and the existing modal architecture before proceeding to implementation.