# Component Organization Plan

## Architectural Philosophy: Atomic Feature Architecture (AFA)

This reorganization adopts an **Atomic Feature Architecture (AFA)**, a hybrid model that synthesizes **Atomic Design** (for foundational primitives) with **Feature-Sliced Design** (for domain isolation). By segregating low-level atoms from complex domain logic, we ensure that:
1.  **Primitives (`ui/`)** remain stateless and highly reusable.
2.  **Shared compositions (`shared/`)** provide domain-neutral building blocks.
3.  **Application shells (`layout/`)** manage global structure and navigation.
4.  **Domain logic (`features/`)** is encapsulated within specific business contexts, reducing side effects and simplifying maintenance.

---

## Proposed Directory Tree

```text
src/components/
├── ui/                       # [ATOMS] Foundational UI primitives (shadcn/ui style)
├── shared/                   # [MOLECULES] Domain-neutral complex compositions
├── layout/                   # [SHELL] App structure, navigation, and layout wrappers
├── features/                 # [DOMAINS] Feature-specific logic and domain components
│   ├── admin/                # Admin portal editors and management tools
│   ├── assessment/           # Quiz engine (v2), testing lifecycle, and exam UI
│   ├── auth/                 # Authentication, login, and registration forms
│   ├── dashboard/            # User progress, analytics, and session building
│   ├── lab/                  # 3D spatial learning (R3F), LabViewer, and scenes
│   ├── marketing/            # Public-facing landing pages and marketing assets
│   ├── wiki/                 # Knowledge base, MDX viewer, and article aids
│   ├── portals/              # Unified CEO, Developer, and Portal shells
│   ├── taxonomy/             # Subject/Subtopic trees and pickers
│   ├── notes/                # Note-taking and TipTap editor integration
│   ├── tools/                # Specialized calculators and physics tools
│   └── trails/               # Camp Trails learning paths and phase maps
├── visuals/                  # [MEDIA] Graphics, animations, and illustrations
└── system/                   # [INFRA] Dev tools, notifications, and theme config
```

---

## Categorization Rules

### 1. `ui/` (Atomic Primitives)
*   **Rule:** Must be domain-agnostic and (mostly) stateless.
*   **Content:** Low-level components (e.g., `Button`, `Input`, `Badge`, `Skeleton`).
*   **Constraint:** Zero awareness of application state or API endpoints.

### 2. `shared/` (Generic Compositions)
*   **Rule:** Domain-neutral but complex enough to warrant separation from primitives.
*   **Content:** Reusable UI patterns (e.g., `DataTable`, `StatCard`, `EmptyState`, `StandardInfoPopover`).
*   **Constraint:** Should not import from `features/`.

### 3. `layout/` (Structure & Navigation)
*   **Rule:** Components that define the "shell" of the application.
*   **Content:** Navigation elements, sidebar shells, global headers, and layout wrappers.
*   **Constraint:** Manages navigation state and positioning but delegates content to children.

### 4. `features/` (Domain-Specific Contexts)
*   **Rule:** Components tightly coupled to specific business logic or domain data.
*   **Content:** High-level organisms (e.g., `QuestionCard`, `TaxonomyPicker`, `LabViewer`).
*   **Constraint:** Can import from `ui/`, `shared/`, and `layout/`, but rarely from other features.

### 5. `visuals/` (Interactive Media)
*   **Rule:** Non-feature-specific graphic and animation assets.
*   **Content:** SVG icons, Framer-motion helpers, and general visual effects.

### 6. `system/` (Development & Infrastructure)
*   **Rule:** Cross-cutting concerns and developer utilities.
*   **Content:** `DevToolbar`, `NotificationCenter`, `ThemeProvider`, `SettingsProvider`.

---

## Migration Plan

| Current Directory/File | New Destination | Reason |
| :--- | :--- | :--- |
| **Redundancy Cleanup** | | |
| `layout/`, `layouts/`, `sidebar/` | `src/components/layout/` | Consolidate app structure. |
| `quiz/`, `quiz-v2/`, `testing/` | `src/components/features/assessment/` | Unified exam ecosystem (migrate `quiz` v1 to v2). |
| `trail/`, `trails/` | `src/components/features/trails/` | Resolve pluralization mismatch. |
| `3d/`, `3d-lab/`, `r3f/` | `src/components/features/lab/` | Centralize 3D learning components. |
| **`shared/` Re-mapping** | | |
| `shared/action-card.tsx` | `features/dashboard/` | Tied to dashboard activity. |
| `shared/app-drawer.tsx` | `layout/` | Global navigation element. |
| `shared/breadcrumb.tsx` | `layout/` | Structural navigation. |
| `shared/DashboardHeader.tsx` | `layout/` | Shell component. |
| `shared/page-header.tsx` | `layout/` | Shell component. |
| `shared/question-card.tsx` | `features/assessment/` | Domain-specific (Exams). |
| `shared/taxonomy-picker.tsx`| `features/taxonomy/` | Domain-specific (Taxonomy). |
| `shared/score-display.tsx` | `features/dashboard/` | Tied to progress analytics. |
| **Feature Grouping** | | |
| `analytics/`, `score/` | `features/dashboard/` | Core progress visualizations. |
| `assessment/` | `features/assessment/` | Part of testing lifecycle. |
| `ceo/`, `developer/`, `portal/` | `features/portals/` | Consolidate role-specific portals. |
| `landing/`, `marketing/` | `features/marketing/` | Unified public site assets. |
| `graphics/`, `motion/` | `visuals/` | Media and animation utilities. |
| `dev/`, `notifications/` | `system/` | Infrastructure and developer tools. |
| `settings/`, `tools/` | `features/settings/`, `features/tools/` | Feature-specific configuration and tools. |
| **UI Promotion** | | |
| `shared/CampfireLoader.tsx` | `ui/loader.tsx` | Promoted to primitive. |
| `shared/floating-panel.tsx` | `ui/` | Promoted to primitive. |
| `shared/InfoTooltip.tsx` | `ui/` | Promoted to primitive. |
