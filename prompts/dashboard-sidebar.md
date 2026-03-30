# SYSTEM DIRECTIVE: SIDEBAR LAYOUT REFACTORING

## 1. PRIMARY OBJECTIVE
Refactor the application layout to transition the sidebar from an overlay behavior to a structural push layout. When expanded, the sidebar must displace the main content area to the right. The sidebar must retain its fixed expanded width, while the main content area dynamically adjusts its width to fit the remaining viewport space.

## 2. STRICT CONSTRAINTS
* **NO ASSUMED STYLING:** Do not generate, assume, or inject any specific CSS, Tailwind classes, or inline styles. You must inherit and utilize the existing styling architecture found within the codebase.
* **READ BEFORE WRITING:** You are required to read and analyze the target files to understand the existing layout primitives before proposing any code modifications.
* **COMPREHENSIVE EXECUTION:** Do not stop halfway. Walk through every step systematically and output the fully integrated solution.

## 3. PHASED IMPLEMENTATION PLAN

### PHASE 1: ARCHITECTURAL DISCOVERY
1.  Locate and thoroughly analyze `SharedPageLayout.tsx` and the corresponding Sidebar component.
2.  Identify the state management mechanism currently handling the collapsed and expanded states of the sidebar.
3.  Locate the DOM nodes and conditional rendering logic responsible for the current overlay effect and the blurred background backdrop.

### PHASE 2: DEPRECATION OF LEGACY BEHAVIOR
1.  Remove the overlay rendering logic from the layout wrapper.
2.  Strip out the blurred background backdrop elements that trigger when the sidebar is expanded.
3.  Neutralize any absolute positioning or z-index stacking contexts that currently force the sidebar to float above the main content.

### PHASE 3: STRUCTURAL LAYOUT REFACTORING
1.  Modify the parent container within `SharedPageLayout.tsx` to support a side-by-side dynamic layout. Base this on the existing layout methodology used in the file, whether that is Grid or Flexbox.
2.  Bind the sidebar state to the parent layout wrapper. 
3.  Implement the structural logic so that the sidebar container dictates a fixed width when expanded.
4.  Implement the structural logic so the main dashboard content container flexes or spans to consume the remaining available space.

### PHASE 4: STATE SYNCHRONIZATION AND VERIFICATION
1.  Ensure that toggling the sidebar triggers a layout recalculation that pushes the content rather than covering it.
2.  If the current codebase uses transition logic for the sidebar, adapt it to animate the structural width changes of the layout container instead of positional translations.
3.  Verify that child components within the main content area resize gracefully when the available width is reduced by the sidebar.

**EXECUTION COMMAND:** Acknowledge these constraints. Begin with Phase 1 by reading `SharedPageLayout.tsx` and outputting your architectural analysis before writing the code.