# Drills — Product Requirements & Technical Specification

**Last Updated:** 2026-04-08  
**Status:** ✅ Active / Source-of-Truth  
**Version:** 3.0 (Consolidated 3-Mode Architecture)

---

## PART 1 — PRODUCT VISION & TERMINOLOGY

### 1.1 Feature Overview
**Drills** are the core high-frequency learning engine of SlateCamp. The system has been consolidated into a **Unified Hub Architecture** that eliminates mode-fragmentation in favor of three high-impact entry points.

- **Objective:** Move students from knowledge acquisition to exam-day retrieval mastery.
- **Governing Principle:** Retrieval practice via active drilling is the primary driver of the **Readiness Score**.

### 1.2 Terminology Consolidation (Mandatory)
All user-facing copy MUST use "Drills". The terms "Quiz" and "Test" are deprecated in the UI to reduce intimidation and align with the "low-stakes learning" brand.

| Surface | Terminology |
| :--- | :--- |
| **Feature Name** | Drills |
| **Session Instance** | Drill Session |
| **Mode Type** | Drill Mode |
| **Action** | Start Drill |

*Note: Database tables (`quiz_sessions`) and internal store keys (`useQuizStore`) currently retain legacy naming for stability; see the migration plan for alignment steps.*

---

## PART 2 — ACTIVE DRILL MODES (THE 3 PILLARS)

The SlateCamp codebase implements exactly three primary drill paths via the `ReviewHub`:

### 2.1 The Intelligent Hero (Dynamic Engine)
The default daily practice tool.
- **Entry Point:** `/dashboard/drills` (The "Canvas").
- **UX Interaction:** Drag-and-drop subject selection.
- **Algorithm:** **60/30/10 Intelligent Routing** (60% Unseen, 30% Remediation, 10% Spaced Repetition).
- **Technical Mode:** `mode: 'custom'` (Frontend) / `test_mode: 'custom'` (DB).
- **Feedback:** Immediate (Rationale + Wiki Link revealed per item).

### 2.2 Design Endurance Training
Stamina-focused practice for the Area C (Design) component.
- **Entry Point:** `/quiz/extended/setup`.
- **Primary Goal:** Building cognitive window for 3+ hour design problems.
- **Format:** 100 items with stamina-drift tracking (accuracy vs. time).
- **Technical Mode:** `mode: 'extended'` (Frontend) / `test_mode: 'camp'` (DB).
- **Feedback:** Immediate.

### 2.3 Full Exam Simulation
The proctored replica of the LEA exam.
- **Entry Point:** `/quiz/fullexam/setup`.
- **Gating:** Requires **65 Readiness Score** to unlock (Pro Tier).
- **Format:** 200 items, strict 4-hour countdown, no feedback until session close.
- **Technical Mode:** `mode: 'fullexam'` (Frontend) / `test_mode: 'storm'` (DB).
- **Results:** 24-hour delivery delay to simulate exam-day psychological pressure.

---

## PART 3 — TECHNICAL ARCHITECTURE

### 3.1 Item Selection: 60/30/10 Logic
Standardized in `src/lib/quiz/intelligent-routing.ts`. Every session (unless Simulation) pulls:
1.  **60% Unseen:** New topics to expand curriculum coverage.
2.  **30% Remediation:** Topics where `current_mastery_weight` is < 0.4.
3.  **10% Spaced Repetition:** Mastered items hitting their decay interval.

### 3.2 State Management: `useQuizStore`
The engine runs on a client-side state machine for <16ms transitions:
```typescript
interface DrillState {
  questions: QuestionForClient[];
  currentIndex: number;
  answers: Record<string, string>; // question_id -> option_id
  confidence: Record<string, number>; // 0-1 scale
  status: 'active' | 'feedback' | 'finished';
}
```

### 3.3 Mastery Formula (EMA)
Mastery is updated via background triggers on the `user_interactions` log:
`new_mastery = current_mastery + (0.2 * (is_correct_binary - current_mastery))`
*Note: Learning rate (0.2) is adjusted based on session intensity.*

---

## PART 4 — UX/UI SPECIFICATION

### 4.1 Component Hierarchy
```
DrillsPage (Server)
└── ReviewHub (Client)
    ├── HeroConfigurator (Intelligent Hero Engine)
    │   ├── SubjectCanvas (Subject Selection)
    │   └── SlideToSubmit (Start Interaction)
    ├── SimulationCard (Full Exam Entry)
    └── EnduranceCard (Design Training Entry)
```

### 4.2 Immutable Brand Anchors
- **Slide-to-Submit:** Must be used for session start and answer submission. Binds physical intent to cognitive choice.
- **Confidence Picker:** 3-point rating required for every item submission to feed the "Lucky Guess" heuristic.

---

## PART 5 — DATA PERSISTENCE (SUPABASE)

### 5.1 Core Tables
- `questions`: Item bank (7,000+ items).
- `quiz_sessions`: Active and completed session metadata.
- `user_interactions`: Immutable record of every answer (feeds mastery).
- `user_node_mastery`: Real-time EMA weights per taxonomy node.

---

*Verified against SlateCamp Codebase: 2026-04-08 (100% current)*
