# CONTEXT: Phase 3 Spatial & Data Infrastructure

## 💡 Overview
Phase 3 establishes the spatial reasoning layer through the **3D Lab** and formalizes the project's data lifecycle. By launching parametric 3D models and a "Push-Based" data pipeline, we ensure that SlateCamp's high-fidelity content is both interactive and architecturally sound.

## 🏔️ Decisions

### 1. 3D Lab Implementation
- **Parametric Logic:** Model parameters (thickness, height, material) must be **table-driven** (stored in `3d_parameters` table) to support future AI-driven parametric adjustment and spatial RAG.
- **Spatial Hotspots:** Interactive labels are stored as **coordinate JSON** in the database, mapping `(x, y, z)` vectors to taxonomy `node_id`s or specific Wiki section anchors.
- **Wiki Embedding:** 3D models will be embeddable in Wiki articles via MDX. **Access Control:** This is a premium feature; the R3F canvas should only initialize for users with `tier !== 'free'`.
- **Primary Tool:** Focus on the **X-Ray Slider** (layer-stripping) for the v1.0 release to emphasize structural and MEP visibility.

### 2. Living Data Pipeline
- **Sync Direction:** The codebase is the source of truth (**Push-Based**). All schema changes MUST originate as `.sql` migrations in the repository and be pushed to Supabase.
- **Fixture Strategy:** Seed data is **split by table** (e.g., `seed/questions.json`, `seed/taxonomy.json`) to minimize merge conflicts and improve readability.
- **Binary Assets:** `.glb` files will be referenced via **external CDN URLs** in the JSON fixtures rather than stored directly in the repository to keep git clones lightweight.
- **Automation:** `supabase db reset` is an **opt-in command** for developers to ensure stability during long-running feature work.

### 3. Schema-Feature Contract
- **CI Validation:** Every PR adding a new route or database-dependent component **MUST include a migration file**. This will be a blocking CI check.
- **Type Safety:** `supabase gen types` is **mandatory** after every schema change. The generated file will live in `src/types/supabase.ts`.
- **Legacy Refactoring:** The "Architecture Drift" (legacy table references like `wiki_pages`) will be **refactored immediately during Phase 3** to ensure the new living schema is the only operational path.
- **Seed Density:** A feature is considered "Done" only when it includes a minimum of **5 valid items** in its corresponding seed fixture (e.g., a new subject needs at least 5 questions and 1 Wiki article).

## 🛠️ Code Context
- **Integration Points:**
  - `src/components/3d/Workspace.tsx`: The primary R3F host component.
  - `src/lib/supabase/seed.sql`: To be replaced by the new JSON-driven seed pipeline.
  - `middleware.ts`: Hook for 3D tier-gating logic.
- **Database Targets:**
  - `public.questions` & `public.wiki_articles`: High-priority for legacy refactoring.
  - New tables: `3d_parameters`, `spatial_hotspots`.
