# RESEARCH: Phase 2 Diagnostics & Synthesis

## 🧪 Storm Mode Strictness
- **Mechanism:** Use `window.onblur` or `document.visibilitychange` to trigger session submission.
- **Auto-Submit Logic:** Call `updateQuizSession` with `status: 'completed'` and `completed_at: now`.
- **Feedback Suppression:** Ensure `QuizRenderer` hides all rationales and correct-answer highlights when `mode === 'storm'`.

## 📈 Readiness Score EMA & Snapshots
- **Calculation Location:** `recordMastery` in `src/lib/actions/quiz.ts` is the current home. It updates `user_node_mastery`.
- **Global Recalculation:** Global readiness should be an average of `current_mastery_weight` across all leaf nodes in the active discipline.
- **Snapshot Trigger:** Create a daily snapshot record if none exists for the current date.
- **Retention:** Retention logic needed to prune records beyond the 90-snapshot limit.

## 📊 Analytics Dashboard Data Flow
- **Heatmap:** Current `taxonomyMock` needs replacement with real data from `user_node_mastery` joined with `taxonomy_tree`.
- **Node Inspector:** Time-series query on `user_interactions` for the selected `topic_id` over the last 30 days.
- **Remediation:** Logic to identify nodes where `current_mastery_weight < 0.6` and `last_encountered < now - 2 days`.

## 📝 Notes Workspace Integration
- **Persistence:** Raw TipTap JSON storage in `notes` table.
- **Folders/Tags:** New schema required for `note_folders` and `note_tags`.
- **Contextual Linking:** capture `path` and `topic_id` from Wiki pages to generate deep links in Note blocks.
- **QuickActionsBar:** Refactor sidebar to host the persistent Note list.

## 🗄️ Database Schema Updates (Pending)
- **Table: `notes`**
  - `note_id` (UUID), `user_id` (FK), `folder_id` (FK), `title` (TEXT), `content` (JSONB), `topic_id` (FK), `source_url` (TEXT).
- **Table: `note_folders`**
  - `folder_id` (UUID), `user_id` (FK), `name` (TEXT).
- **Table: `readiness_score_snapshots`**
  - `snapshot_id` (UUID), `user_id` (FK), `score` (FLOAT), `computed_at` (TIMESTAMPTZ).
