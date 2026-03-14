# CONTEXT: Phase 2 Diagnostics & Synthesis

## 💡 Overview
Phase 2 transitions SlateCamp from a content delivery platform into a diagnostic engine. We are introducing **Storm Mode** (stress simulation), **Readiness Score** (EMA-based prediction), and **Personal Notes** (knowledge synthesis). These features transform user telemetry into actionable study plans.

## 🏔️ Decisions

### 1. Storm Mode UI/UX
- **Tab-Switching:** Strictly enforced. Tab-switching or losing window focus triggers an **automatic session submission** to simulate exam-day integrity.
- **Pacing Alert:** A subtle nudge (ahead/behind pace) will appear **inline with the timer** rather than as a disruptive overlay.
- **Lock UX:** The 24-hour review lock will be displayed as a **countdown timer** on a disabled/blurred results card in the Testing Hub.
- **Full Storm:** 100-question sessions will include a **scheduled break option** (e.g., at 50 questions) to manage cognitive fatigue, mirroring ALE patterns.

### 2. Readiness Score Logic
- **EMA Calculation:** Math is performed **entirely within the `recordMastery` action** at the point of interaction to ensure real-time score updates.
- **Snapshots:** The system will retain a rolling window of **90 readiness score snapshots** per user for trend analysis.
- **Pressure Gap:** Visualized as a **trend line chart** comparing Camp Mode vs. Storm Mode performance over time, rather than a static delta percentage.
- **Thresholds:** The 65% lock for Proof Simulation is **strictly enforced** by the system with no manual overrides.

### 3. Analytics Wiring
- **Taxonomy Heatmap:** Supports full drill-down **all the way to the Leaf node level** (Topic → Sub-topic → Leaf).
- **Node Inspector:** Displays a **rolling 30-day trend line** for the specific node selected.
- **Labels:** Node mastery displays both a **raw percentage (e.g., 88%)** and a **qualitative label (e.g., "Strong")**.
- **Remediation CTA:** The "Fix It" targeted quiz CTA appears **only when a critical failure (Red node)** is detected in a session.

### 4. Notes Workspace
- **Persistence:** TipTap content is stored as **raw JSON** in the `notes` table to allow for cross-platform rendering and future AI analysis.
- **Capture Logic:** "Send to Camp" blocks must include a **direct URL with a section ID/anchor** linking back to the exact source paragraph in the Wiki.
- **Sidebar Integration:** The Note Sidebar is **persistent across the dashboard**, integrated via the `QuickActionsBar.tsx` pattern.
- **Organization:** Supports **folders and manual tags**, in addition to automatic taxonomy inheritance.
- **Wiki Integration:** Every Wiki section header will include a "Save to Notes" affordance.

## 🛠️ Code Context
- **Reusable Assets:**
  - `QuizRenderer.tsx`: Needs a `strictMode` flag to enable auto-submit and hide feedback.
  - `TaxonomyHeatmap.tsx`: Already exists but needs wiring to `user_node_mastery`.
  - `QuickActionsBar.tsx`: The architectural anchor for the persistent Note sidebar.
- **Integration Points:**
  - `recordMastery` (in `quiz.ts`): The hook for EMA recalculation.
  - `user_node_mastery` table: The source of truth for the heatmap.
- **Missing Tables:** Need to create `notes` and `readiness_score_snapshots` tables in the next phase execution.
