# Decisions

## 2026-04-02 Architectural Decisions (Performance Audit)
- **Componentization Strategy:** Abstract duplicated UI patterns into focused hooks and reusable UI components. 
  - *Decision:* Introduced `useSubjectTree.ts` to consolidate taxonomy tree state previously duplicated across `SubjectDrillSelector` and `SubjectPracticeSelector`.
  - *Decision:* Extracted `QuadrantOverlay.tsx` to serve as the unified label overlay for all scatter charts (MemoryStrength, PacingAccuracy, DifficultyMasteryScatter), reducing triple maintenance burden.
- **Design System Adherence:** Replace manual re-implementations of visual metrics with standard components.
  - *Decision:* Mandate the use of `<ScoreDisplay>` for readiness rings, eliminating the custom stroke math and typography previously duplicated inside `HeroCommandBar`.