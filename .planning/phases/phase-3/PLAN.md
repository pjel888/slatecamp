# PLAN: Phase 3 Spatial & Data Infrastructure

## 📍 Objective
Launch the 3D Lab and formalize the data lifecycle by reconciling architecture drift and automating the seed pipeline.

## 🛠️ Implementation Steps

### 1. Data Foundation & Refactoring
- [x] **Schema Migration:** Create `models_3d`, `models_3d_parameters`, and `spatial_hotspots` tables.
- [x] **Architecture Cleanup:** Refactor `src/lib/actions/` (readiness, daily-mission) to remove all legacy table references.
- [ ] **Sync:** Run `supabase gen types` to update `src/types/supabase.ts`.

### 2. The 3D Lab (Spatial Layer)
- [x] **Model Registry:** Refactor `src/components/3d/Workspace.tsx` to use `useGLTF` with Draco.
- [x] **Parametric Loading:** Dynamically load model parameters from `models_3d_parameters` table.
- [x] **X-Ray Slider:** Implement the layer-stripping logic using material opacity/visibility toggles.
- [x] **Tier Gating:** Implement the R3F Canvas restriction for paid tiers.

### 3. Seed Data Pipeline
- [x] **JSON Authoring:** Create split fixtures in `src/data/seed/` (taxonomy, questions, models_3d).
- [x] **Automation Script:** Create `scripts/seed.ts` for CLI-driven database re-population.
- [x] **Reset Integration:** Map `npm run db:seed` to trigger the new JSON seed script.

### 4. Schema-Feature Contract
- [ ] **CI Check:** Implement a GitHub Action (or local pre-commit hook) that verifies migration presence for new features.
- [x] **Documentation:** Finalise the living `schema.sql` mirror.

## 🧪 Verification & Testing
- [x] **3D Integrity:** Verified `.glb` models load via public CDN URLs in `Workspace.tsx`.
- [x] **Data Parity:** Verified `npm run db:seed` produces a clean environment.
- [x] **Legacy Check:** Refactored major actions to the new schema.
- [x] **Gating Test:** Implemented `userTier === 'free'` restriction in `Workspace.tsx`.
