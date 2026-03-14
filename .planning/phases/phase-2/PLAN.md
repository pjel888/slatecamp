# PLAN: Phase 2 Diagnostics & Synthesis

## 📍 Objective
Transform SlateCamp into a data-driven diagnostic engine by implementing Storm Mode, live Analytics, and a persistent Notes Workspace.

## 🛠️ Implementation Steps

### 1. Schema & Migration
- [ ] Create `notes` table with `folder_id` and `topic_id` FKs.
- [ ] Create `note_folders` table for organization.
- [ ] Create `readiness_score_snapshots` table for 90-day retention tracking.
- [ ] Implement RLS policies for all new tables.

### 2. Storm Mode Strictness
- [ ] Add `strictMode` boolean prop to `QuizRenderer.tsx`.
- [ ] Implement focus-loss detection (`window.onblur`) inside `QuizRenderer`.
- [ ] Implement auto-submit server action triggered by focus-loss.
- [ ] Hide all rationales and correct-answer signals when in `strictMode`.

### 3. Readiness Score snapshots
- [ ] Update `recordMastery` in `src/lib/actions/quiz.ts` to compute global readiness EMA.
- [ ] Add daily snapshot trigger to the mastery record flow.
- [ ] Implement snapshot pruning logic (limit to 90 records per user).

### 4. Analytics Wiring
- [ ] Refactor `TaxonomyHeatmap.tsx` to fetch data from `user_node_mastery`.
- [ ] Implement `NodeInspectorSheet.tsx` with a 30-day time-series Recharts component.
- [ ] Implement the "Fix It" targeted quiz CTA based on failing nodes.

### 5. Notes Workspace
- [ ] Finalize `NotesEditor.tsx` with TipTap JSON persistence.
- [ ] Refactor `NotesShell.tsx` to support folder-based navigation.
- [ ] Integrate Note list into the persistent `QuickActionsBar.tsx`.
- [ ] Implement "Save to Notes" button in Wiki section headers.

## 🧪 Verification & Testing
- [ ] **Storm Integrity:** Verify session auto-submits when switching tabs.
- [ ] **Data Retention:** Verify `readiness_score_snapshots` stays within 90-record limit.
- [ ] **Live Heatmap:** Verify node colors update in real-time after a quiz interaction.
- [ ] **Note Persistence:** Verify TipTap JSON content survives a page refresh.
