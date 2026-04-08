# Flowbite Integration & Component Optimization Plan

This document outlines the strategy for leveraging Flowbite Pro design patterns to optimize and modularize UI components across the SlateCamp codebase, with a specific focus on the 3D Lab module improvements.

## 1. Flowbite Pro Adaptation Strategy

As per the project mandates, we do **not** install `flowbite` or `flowbite-react` packages. Instead, we adapt the design patterns (HTML/Tailwind) from the provided Flowbite Pro reference assets to our existing Shadcn/Radix-based UI primitives.

### Priority Components for Adaptation

| Flowbite Block Category | SlateCamp Component / Area | Adaptation Strategy |
|-------------------------|----------------------------|---------------------|
| **Advanced Tables** | `src/components/ui/table.tsx` | Enhance `DataTable` with expandable rows, advanced filters, and bulk action patterns. |
| **Create/Update Forms** | All feature forms | Standardize on Flowbite's multi-column grid layouts and validation feedback patterns. |
| **Dashboard Navbars** | `LabTopBar.tsx`, Portal Headers | Adopt the "HUD" feel for 3D Lab and high-density headers for Admin/Developer portals. |
| **Side Navigation** | Portal Sidebars | Use Flowbite's collapsable and multi-level sidebar patterns. |
| **Hero Sections** | `/dashboard` Landing, Marketing | Use for high-impact entry points with standardized CTA placements. |
| **Drawers/Modals** | `src/components/ui/sheet.tsx` | Implement Flowbite's "Read/Update Drawers" for 3D Lab module details and settings. |

## 2. Component Optimization & Consolidation

### The "Unified Slider" Initiative

Currently, the codebase has fragmented slider implementations. The goal is to consolidate all range inputs into a single, flexible `UnifiedSlider` component.

*   **Canonical Component:** `src/components/ui/unified-slider.tsx`
*   **Current Fragmatation:**
    *   `src/components/quiz-v2/PredictionSlider.tsx`: Uses native `input type="range"`. **(To be refactored)**
    *   `src/features/3d-lab/DevControlsModule/dashboard/LotInputPanel.tsx`: Defines a local `Slider` component. **(To be refactored)**
    *   `src/features/3d-lab/scenes/NBCPEnvelope/NBCPControlPanel.tsx`: Defines a local `SliderRow`. **(To be refactored)**
    *   `src/features/3d-lab/templates/CutawaySection.tsx`: Uses `Slider` from `ui/slider`. **(To be refactored to UnifiedSlider if context/labels needed)**

### Other Optimization Targets

| Component | Current State | Optimization Goal |
|-----------|---------------|-------------------|
| **Loading Overlays** | `CanvasLoadingOverlay` (Custom) | Upgrade to use `useProgress` from `@react-three/drei` for accurate percentage tracking. |
| **Modals/Dialogs** | Mixed Shadcn/Custom | Standardize all overlays (especially 3D Lab tooltips/annotations) as 2D DOM overlays using Flowbite's popup/modal patterns. |
| **Badges/Indicators** | Various local implementations | Use a single `ViolationBadge.tsx` or `StatusBadge.tsx` derived from Flowbite's badge patterns. |

## 3. 3D Lab Integration Patterns

Following the "2D DOM-Only" mandate from `01_master_architecture.md`, Flowbite patterns should be the primary choice for the overlay layer.

### Pattern: DOM Overlay Layer

Instead of rendering text inside the Three.js Canvas:
1.  Scene components emit world coordinates to a store.
2.  A 2D React layer (the "HUD") projects these coordinates.
3.  **Flowbite-styled** cards, tooltips, and labels are rendered at the projected positions.

### HUD Components

*   **ModuleCard**: Adapt Flowbite's "E-commerce Product Card" for the Lab Browser.
*   **Control Panels**: Use `LabPanelLayout` with Flowbite "Card" and "Form" utility classes.
*   **Annotations**: Use Flowbite "Tooltip" or "Popover" patterns for 3D hotspots.

## 4. Implementation Rules

1.  **Identity Lock Compliance:** Do NOT modify `SlideToSubmit.tsx` or `GestureCaptureZone.tsx`. These are brand-locked and excluded from design system migrations.
2.  **No New Dependencies:** Always strip `import { ... } from "flowbite-react"` and replace with local `ui/` components.
3.  **CVA + Data-Slots:** New optimized components must follow the `class-variance-authority` and `data-slot` patterns used in the existing UI library.
4.  **Radius Cap:** Enforce the `--radius-xl` cap (8px) on all adapted Flowbite blocks to maintain SlateCamp brand consistency.
