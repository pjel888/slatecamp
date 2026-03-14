# UAT: Phase 3 Spatial & Data Infrastructure

**Phase Goal:** Launch the 3D Lab and establish a living, automated data foundation that scales with every feature we ship.

---

## 🧪 Test Session: March 14, 2026

### 1. Spatial Layer (3D Lab)
- [ ] **Test:** Navigate to `/dashboard/3d-lab`. Interact with the X-Ray Slider.
- [ ] **Expected:** Model loads via `useGLTF`; X-Ray slider adjusts material opacity; hotspots display info cards.
- [ ] **Result:** 

### 2. Automated Seed Pipeline
- [ ] **Test:** Run `npm run db:seed` in the terminal.
- [ ] **Expected:** Cleanup removes existing data; split JSON fixtures populate `models_3d`, `taxonomy_tree`, and `questions` correctly.
- [ ] **Result:** 

### 3. Architecture Drift Remediation
- [ ] **Test:** Global search for legacy table names: `wiki_pages`, `exam_profiles`, `review_sessions`.
- [ ] **Expected:** Zero occurrences in `src/lib/actions` and `src/app`.
- [ ] **Result:** 

### 4. 3D Tier Gating
- [ ] **Test:** Set user tier to `free` in `user_subscriptions`. View 3D Lab.
- [ ] **Expected:** R3F Canvas is blocked by a "Pro Upgrade" CTA.
- [ ] **Result:** 

---

## 🛑 Issues Found
- (None yet)

## 🛠️ Fix Plans
- (None yet)
