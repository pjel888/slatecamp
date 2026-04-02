<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# quiz-v2

## Purpose

Next-generation quiz engine components implementing pedagogically-sound testing modes (Camp, Chill, Storm, Full Exam, Extended, Subject, Focused, Custom, Article Review). Session lifecycle: setup to quiz to results. Includes prediction/postdiction, confidence tracking, spaced repetition signals, and results analytics.

All components use 'use client' with state via useQuizStore (Zustand). Server actions handle session init, submission, IRT computation, and feedback.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| setup/ | Config flow: intro slides, mode selector, pressure level, checklist |
| results/ | Analytics: score reveal, breakdown, matrix, debrief, review cards |
| review/ | Full-screen review: filters, rationales, misconceptions, citations |

## For AI Agents

1. **Quiz lifecycle:** QuizShell -> SetupFlow -> quiz loop -> ResultsDashboard -> ReviewMode
2. **Config immutable after setup:** Do not modify QuizSessionConfig mid-session
3. **Prediction/postdiction optional:** Check MODE_PRESETS
4. **Feedback AI-driven (Temp 0.0):** Mandatory Wiki citations required
5. **IRT server-side:** No client calculations
6. **Review separate:** Full-screen overlay with read-only data
7. **Gesture capture:** GestureCaptureZone only place for invalidate()
8. **Micro-breaks enforced:** 30s after N questions in Storm/Extended
9. **Pacing contextual:** Warm advisory tone
10. **Zone colors strict:** Use getReadinessColorClass()

## Dependencies

Internal: @/stores/useQuizStore, @/types/quiz-config, @/lib/quiz/mode-presets, @/lib/actions/quiz-v2, @/components/shared/score-display

External: react, framer-motion, recharts, zustand, @react-three/fiber, tailwindcss

<!-- MANUAL: -->
