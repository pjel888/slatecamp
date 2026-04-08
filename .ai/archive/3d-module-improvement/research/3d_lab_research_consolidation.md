# 3D Lab Research Consolidation — Architectural & Strategic Implementation

This document consolidates research from Google and Perplexity sources into a unified strategic blueprint for the SlateCamp 3D Lab expansion.

---

## 1. Executive Summary & Core Mandates

The SlateCamp 3D Lab is transitioning from a 193-module baseline to a 300+ module repository. This expansion requires a rigorous, zero-regression architectural foundation focused on performance, accessibility, and regulatory compliance.

### Non-Negotiable Global Rules
- **2D DOM-Only Text Rendering**: ZERO `<Html>` or `<Text>` inside the 3D Canvas. All labels, tooltips, and annotations must be rendered in the 2D DOM overlay layer via `Vector3.project(camera)`.
- **Single Canvas Pattern**: Orchestrated via `tunnel-rat` + `SceneTunnel`, with `frameloop="demand"` and an invalidation bridge to ensure zero GPU usage when idle.
- **Identity Lock**: Critical brand/interaction components (`SlideToSubmit.tsx`, `GestureCaptureZone.tsx`, `haptics.ts`) are immutable.
- **Zero-Hallucination Regulatory Policy**: Every parametric value must trace to a verifiable law citation (PD 1096, BP 344, etc.) in the `Regulatory Ledger`.
- **Immutable APIs**: Core hooks and store factories (`createModuleStore`, `useRegisterInvalidate`, etc.) must remain stable to support legacy and future modules.

---

## 2. Implementation Roadmap (Phases 0 - 9)

### Phase 0: Research & Audit (Current)
- Establish immutable ground truth.
- Document legacy module behaviors and record deterministic VRAM baselines.
- Zero unresolved TypeScript errors.

### Phase 1: Context Resolution & Modularity
- Introduce `SceneConfig.tsx` as the single authority for runtime parameters (DPR, camera, lighting).
- Strip "dead props" from `CanvasWrapper` and refactor `LabViewportFrame`.

### Phase 2: WebGL Lifecycle & Safety
- Implement `WebGLErrorBoundary.tsx` to handle context loss and shader failures.
- Enforce `useDisposeOnUnmount` for imperative objects.
- Bound VRAM allocation to eliminate monotonic growth.

### Phase 3: The 2D DOM Overlay System (Critical Path)
- Deploy mathematical 3D-to-2D projection mapping.
- Migrate all annotations out of WebGL.
- Pass comprehensive accessibility audits (screen reader compliance).

### Phase 4: Configurable Global Lighting
- Refactor lighting into a modular provider system with environmental presets (Studio, Clinical, Dramatic, etc.).

### Phase 5: Store Lifecycle & Domain Isolation
- Split monolithic `useLabStore` into independent domains (Navigation, Progress, View).
- Implement automated `resetOnUnmount` to prevent parametric state cross-contamination.

### Phase 6: Asset Preloading & Pipeline Efficiency
- Upgrade loading overlays with `useProgress` from `drei`.
- Construct background preloaders for heavy geometries.

### Phase 7 & 8: Animation Kinematics & Mobile Optimization
- Suspend rendering loop immediately upon animation completion.
- Lock native touch actions and aggressively cap DPR for mobile.

### Phase 9: Template Normalization
- Resolve all lingering dependency warnings.
- Verify comprehensive error boundary coverage across all 193+ modules.

---

## 3. Repo-Level Audit Framework

### 3.1 3D Runtime & Scene Platform (`/slatecamp-r3f-api-master`)
- **Mission**: Own the shared 3D runtime (Canvas host, WebGL safety, performance monitoring).
- **Key Tasks**: Fix `CanvasWrapper` props, implement `WebGLErrorBoundary`, and centralize camera presets.

### 3.2 Geometry & Code Logic (`/slatecamp-3d-parametric-engine`)
- **Mission**: Provide pure, testable, law-verified parametric functions.
- **Layers**: 
  - L1: Procedural Geometry.
  - L2: Parametric Bounding Boxes (collisions/clearances).
  - L3: Real-Time Data Binding.
- **Rule**: NO React/R3F code in this layer.

### 3.3 Product Workflows & Scenes (`/slatecamp-3d-arch-diagram-modeler`)
- **Mission**: Own templates (Parametric, Exploded, FloorPlan, etc.) and UX flows.
- **Key Tasks**: Implement the P3 Overlay system and migrate legacy `<Html>` annotations.

### 3.4 UI Kit & 3D UX Patterns (`/slatecamp-ux-designer`)
- **Mission**: UI/UX source of truth.
- **Key Tasks**: Align 3D overlays with the Campfire design system (color, typography, radius caps).

---

## 4. Module Expansion Pipeline (Waves 0 - 4)

- **Wave 0 (Repair)**: Immediate remediation of broken legacy modules (Site Dev, Stairway, etc.).
- **Wave 1 (Foundation)**: 13 baseline spatial tools.
- **Wave 2 (Parametric Powerhouses)**: 9 complex generative geometries.
- **Wave 3 (Floor Plan & Measurement)**: 11 logic-heavy spatial calculators.
- **Wave 4 (Advanced Logic)**: 8 modules using next-gen template architectures for multi-hectare planning.

---

## 5. Regulatory Verification Protocol

Parametric calculators must be governed by the `Regulatory Ledger`. No new parametric bounds are permitted without explicit citations from Philippine architectural laws or a designated "pedagogical" tag.
