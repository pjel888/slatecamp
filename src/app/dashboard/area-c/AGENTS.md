<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Area C

## Purpose
Design & Development Controls learning area for Philippine National Building Code (PD 1096, BP 344, RA 9514) calculations and scenario-based design problems. Hosts calculator reference tools and scenario-based quizzes tied to shared design briefs. Authenticated dashboard area.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Hub page listing Development Controls Calculator and Design Quiz tools |
| `calculator/page.tsx` | Development Controls Calculator reference tool page |
| `design-problems/page.tsx` | Design problems library listing |
| `design-problems/[problemId]/page.tsx` | Individual design problem with brief and submission |
| `design-quiz/page.tsx` | Design quiz hub/selection page |
| `design-quiz/[scenarioId]/page.tsx` | Scenario-based quiz session page |
| `_components/DesignProblemCard.tsx` | Card UI for design problems (difficulty, time limit, lock status) |
| `_components/DesignProblemSession.tsx` | Active design problem session component |
| `_components/DesignQuizSession.tsx` | Active design quiz session component |
| `_components/{ScenarioCard,ScenarioList,ScenarioResults,BriefPanel,SolutionReveal,QuestionCard}.tsx` | Quiz UI components |
| `_components/{BPComplianceChecklist,DevControlsCalculator}.tsx` | Specialized calculation/checklist components |
| `loading.tsx`, `*/loading.tsx` | Skeleton loaders |

## For AI Agents
### Working In This Directory
- **Auth required** — user must be logged in (check parent dashboard auth)
- **Two main features:** Development Controls Calculator (reference tool) and Design Quiz (scenario-based practice)
- **Design Problems:** Time-limited problems with difficulty levels (1–5: Introductory to Expert), lock progression, completion tracking
- **Design Quiz:** Scenario-based (multiple questions per scenario); questions build on shared brief; tied to PD 1096, BP 344, RA 9514
- **Slatecamp colors:** Inline style overrides (e.g., `color: '#1A2332'`) — prefer Tailwind but legacy code uses style props
- **Lock progression:** Problems unlock after completing prerequisite levels
- **Difficulty dots UI:** Visual 5-dot difficulty indicator for each problem
- Tab/layout flow: Page → Tool cards → Dynamic [problemId] or [scenarioId] page

## Dynamic Routes
- `[problemId]` — Design problem ID (UUID)
- `[scenarioId]` — Scenario ID (UUID) for quiz scenarios

## Dependencies
### Internal
- `@/components/layouts/SharedPageLayout` — Dashboard layout wrapper
- `@/lib/actions/design-problems` — Problem fetching + types
- `@/types/app` — Type definitions
- `@/components/{trails,assessment}/*` — Related dashboard components
- `@phosphor-icons/react/dist/ssr` — Icons (Calculator, Exam, Lock, CheckCircle, Clock)

<!-- MANUAL: -->
