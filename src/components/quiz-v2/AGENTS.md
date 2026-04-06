<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-06 -->

# quiz-v2

## Purpose

Next-generation quiz engine components implementing pedagogically-sound testing modes via a dynamic **Hero Configurator** and specialized shells (**Standard**, **Simulation**, **Endurance**). Replaces simple randomization with a **60/30/10 Intelligent Routing** algorithm.

All components use 'use client' with state via useQuizStore (Zustand). Server actions handle session init, submission, IRT computation, and feedback.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| setup/ | Config flow: intro slides, mode selector, pressure level, checklist |
| results/ | Analytics: score reveal, breakdown, matrix, debrief, review cards |
| review/ | Full-screen review: filters, rationales, misconceptions, citations |

## For AI Agents

1. **Quiz lifecycle:** HeroConfigurator -> Standard/Simulation/EnduranceShell -> quiz loop -> ResultsDashboard -> ReviewMode
2. **Specialized Shells:**
   - `StandardQuizShell`: Generalized modes (Camp, Chill, Subject, Storm, etc.)
   - `SimulationShell`: High-stakes proctored UI, 24h delay logic.
   - `EnduranceShell`: Stamina tracking, fatigue nudges, design-centric layout.
3. **Config immutable after setup:** Do not modify QuizSessionConfig mid-session
4. **Prediction/postdiction optional:** Check MODE_PRESETS
5. **Feedback AI-driven (Temp 0.0):** Mandatory Wiki citations required
6. **IRT server-side:** No client calculations
7. **Review separate:** Full-screen overlay with read-only data
8. **Gesture capture:** GestureCaptureZone only place for invalidate()
9. **Micro-breaks enforced:** 30s after N questions in Storm/Extended
10. **Pacing contextual:** Warm advisory tone
11. **Zone colors strict:** Use getReadinessColorClass()

## Dependencies

Internal: @/stores/useQuizStore, @/types/quiz-config, @/lib/quiz/mode-presets, @/lib/actions/quiz-v2, @/components/shared/score-display

External: react, framer-motion, recharts, zustand, @react-three/fiber, tailwindcss

<!-- MANUAL: -->
