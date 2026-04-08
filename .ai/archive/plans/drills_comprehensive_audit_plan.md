# Implementation Plan: Drills Comprehensive Audit & Remediation

This plan outlines the steps to perform a brutally thorough audit of the three drill modes and fix identified issues to ensure everything is working from step 1 to the last step.

## STAGE 1: Deep Audit & Planning
1. [ ] **Map All Flows:** Identify every state change and network request for:
   - Intelligent Configurator
   - Full Exam Simulation
   - Design Endurance
2. [ ] **Identify Friction Points:** Document UX/UI inconsistencies, loading state gaps, and functional failures.
3. [ ] **Trace Backend Logic:** Audit `startSession`, `intelligent-routing`, and shell initialization to find root causes of "No questions found" and other errors.

## STAGE 2: Core Engine & Configurator Remediation
1. [ ] **Fix "No Questions Found" Logic:**
   - Investigate `intelligent-routing.ts` fallback mechanisms.
   - Ensure subject taxonomy traversal is correctly capturing all child questions.
   - Fix any bounding or limit issues in `user_interactions` queries.
2. [ ] **Optimize Taxonomy Fetching:**
   - Move all remaining client-side taxonomy fetches to SSR/RSC.
   - Replace sequential `while` loops in `start-session.ts` with optimized queries.
3. [ ] **Improve Configurator UX:**
   - Add layout-matched skeletons for subjects.
   - Fix "Slide to Start" loading/error state persistence.
   - Align configuration defaults with mode presets.

## STAGE 3: Specialized Shell Remediation
1. [ ] **SimulationShell (Full Exam):**
   - Fix timer initialization falsy guard.
   - Throttle checkpoint saves to every 5 questions.
   - Fix pre-fetch logic to use reactive store state.
   - Ensure "Submit All" flow is foolproof on the last question.
2. [ ] **EnduranceShell (Design Endurance):**
   - Add missing tier gate to the ReviewHub card.
   - Fix `getState()` in render path to ensure feedback reactivity.
   - Fix stamina overlay pointer-events conflict.
   - Replace `animate-bounce` with design-system-compliant animation.
3. [ ] **Shell Consolidation:**
   - Extract shared logic into `useQuizShellHandlers` hook to eliminate ~80% duplication.
   - Unify error handling and exit/submit flows.

## STAGE 4: Final Validation & Wrap-up
1. [ ] **End-to-End Testing:** Test every mode from configuration to result submission.
2. [ ] **Performance Audit:** Verify network waterfalls are minimized and payload sizes are optimal.
3. [ ] **Design System Check:** Ensure all components use correct tokens and radii.
4. [ ] **Update Memory & Archive:** Reflect new system state in `.ai/state/` and archive the plan.

## Critical Constraints
- **IMMUTABLE:** "SLIDE TO SUBMIT" and "SLIDE TO START" must remain.
- **ZERO TEMPERATURE:** AI Tutoring must stay at 0.0.
- **VANILLA CSS:** Prefer Tailwind 4 semantic patterns.
