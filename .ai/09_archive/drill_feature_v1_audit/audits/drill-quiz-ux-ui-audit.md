# Drill / Quiz UX / UI Audit

## 1. Lag and Perception Audit

### Finding: "See Results" Lag (Finalization Stage)
- **Problem**: Users report a delay after the last question.
- **Root Cause**: The `endSession` action performs heavy server-side recomputations (Readiness Score, EMA mastery, IRT ability) for potentially hundreds of questions.
- **UI Symptom**: The `CalculatingResultsOverlay` is shown, but it is static and lacks granular feedback.
- **Research-Backed Solution**: **Progress Visualization.** Research shows that progress messages ("Computing Score...", "Analyzing Topics...") reduce perceived waiting time and increase user trust by demonstrating work is being done.
- **Evidence**: `src/lib/actions/quiz-v2/end-session.ts` performs sequential DB writes before returning.

### Finding: Gated Feedback Delay (Immediate Feedback Modes)
- **Problem**: Feedback delay (3-4s) can feel like unresponsive UI or "forced friction".
- **Mitigation**: The `FeedbackPanel` uses a "Gate Timer" to ensure pedagogical value (Wilson 85% rule).
- **UX Suggestion**: **Adaptive Friction.** For high-mastery students, the delay could be reduced. For incorrect answers, the delay is a "Psychological Buffer" that prevents frustration-driven clicking and encourages reflection.

## 2. Button and CTA Feedback
- **SlideToSubmit**: Highly reliable and provides immediate haptic feedback. This is a "Deliberate Interaction" pattern that prevents accidental submission.
- **Next/Previous**: Fast client-side transitions.
- **Start Session**: "Slide to Start" in the hub provides a strong, deliberate confirmation.

## 3. User Trust Gaps (State Feedback)
- **Saving Indicator**: The `SyncStatus` component in `QuizHeader` is hidden on mobile (`hidden md:flex`).
- **Correction**: **Ubiquitous State Feedback.** Mobile users (primary demographic) must see the "Saved" status to trust the offline-first queue. A simplified cloud icon should be visible at all times.
- **Result Gating**: In `fullexam` mode, results are delayed 24h.
- **UX Suggestion**: Clear "Why the delay?" messaging is needed on the finalization screen to manage expectations and reduce support queries.

## 4. UX Verdict
The UX is high-fidelity and professional, but the **latency in finalization** and **hidden sync status on mobile** are critical trust issues that should be addressed through progress messaging and refined state feedback.
