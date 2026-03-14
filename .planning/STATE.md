# STATE: SlateCamp (Project Memory)

**Current Status:** Spatial & Data Infrastructure phase complete. 3D Lab operational and seed pipeline automated.
**Next Milestone:** Admin & Content Operations (Phase 4).

---

## 📍 Current Phase: 3 — Spatial & Data Infrastructure (The 3D Layer) [COMPLETED]

- [x] **The 3D Lab:** Parametric R3F sandbox with X-Ray layer stripping.
- [x] **Data Foundations:** Live master `schema.sql` mirror and updated `supabase.ts` types.
- [x] **Seed Pipeline:** Automated `npm run db:seed` using versioned JSON fixtures.
- [x] **Architecture Cleanup:** Removed all legacy table references (`profiles`, `exam_profiles`) from server actions.

## 📍 Previous Phases

### Phase 2: Diagnostics & Synthesis [COMPLETED]
- [x] Storm Mode: timed exams and focus-loss detection.
- [x] Readiness Score: Real-time EMA calculation and daily snapshots.
- [x] Analytics Dashboard: Live taxonomy heatmap.

### Phase 1: Foundations [COMPLETED]
- [x] Core Loop: Syllabus → Wiki → Quiz loop established.

## 🧱 Known Issues & Tech Debt

- **Math Heaviness:** Global readiness average calculation in `recordMastery` is O(N) where N is taxonomy nodes. Acceptable for v1 ALE.
- **Admin Manual:** Content still requires JSON fixture updates + `db:seed`. Phase 4 "Control Room" will fix this.

## 🏁 Critical Paths

1.  **Admin Auth:** implementing role-based middleware for Phase 4 gating.
2.  **Rich Text CRUD:** mapping TipTap JSON persistence to the Wiki article manager.
