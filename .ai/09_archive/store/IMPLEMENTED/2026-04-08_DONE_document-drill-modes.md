# Implementation Plan: Drills — Exhaustive PRD & Technical Specification

## Phase 1: Audit & Prep
- [ ] Read `.ai/state/current-task.md`, `.ai/state/memory.md`, and relevant `.ai/state/` files.
- [ ] Produce `<state_audit>` block.
- [ ] Create this plan at `.ai/plans/document_drill_modes_plan.md`.

## Phase 2: Rename & Consolidate
- [ ] Rename `.ai/docs/01-product/002-quiz-modes.md` -> `.ai/docs/01-product/002-drill-modes.md` (Note: `002-drill-modes.md` already exists, will overwrite with new structure).
- [ ] Search and replace references to the old filename in `.ai/docs/` and `.ai/state/`.
- [ ] Perform naming consolidation in the document: replace "Quiz", "Test", "Assessment" with "Drill" where appropriate (user-facing).

## Phase 3: Content Generation (The Specs)
- [ ] **Part 1: Product Vision & Learning Framework**
    - [ ] Feature Overview & Principles.
    - [ ] Terminology Map & DB Divergence Table.
    - [ ] Learning Science Foundation (Testing Effect, Bjork, Sweller, etc.).
    - [ ] Behavioral Psychology & Retention (Readiness Score, Heatmap).
- [ ] **Part 2: Drill Mode Catalog**
    - [ ] Camp Mode.
    - [ ] Storm Mode.
    - [ ] Blindspot Protocol.
    - [ ] Endurance Cycle.
    - [ ] Proof Simulation.
    - [ ] Quick Fire (⚠️ Check codebase status).
- [ ] **Part 3: Question Engine**
    - [ ] Data Model (TypeScript interfaces).
    - [ ] Distractor Normalization Pipeline (Check status in memory).
    - [ ] Selection Algorithms (60/30/10 Intelligent Routing).
    - [ ] Area C (ADSP) handling.
- [ ] **Part 4: UX/UI Specification**
    - [ ] Information Architecture & Navigation.
    - [ ] Screen-by-screen walkthrough.
    - [ ] Component Hierarchy (React tree with Zustand integration).
    - [ ] Loading & Error States.
    - [ ] Accessibility.
- [ ] **Part 5: Technical Architecture**
    - [ ] Rendering Architecture (App Router).
    - [ ] Zustand Store Schema (Full `DrillStore` interface).
    - [ ] CAGE (Cryptographic Answer-Gesture Binding) - 3 states.
    - [ ] Data Fetching & Offline Resilience.
    - [ ] Supabase Schema & Mermaid ERD.
- [ ] **Part 6: Integration Points**
    - [ ] Mastery Engine (EMA formula).
    - [ ] Camp Trail, Wiki, 3D Lab, Dashboard, Analytics.
- [ ] **Part 7: Roadmap & Phasing**
    - [ ] Phase 1-3 ship cycles.

## Phase 4: Finalization
- [ ] Update `.ai/state/current-task.md` and `.ai/state/memory.md`.
- [ ] Archive the implementation plan.
- [ ] Git commits:
    - `refactor(docs): rename quiz-modes to drill-modes, consolidate naming`
    - `docs(product): exhaustive Drills PRD and technical specification`
