# SLATECAMP: CORE SYSTEM PROMPT & ROUTING PROTOCOL

## 0. BROWSER & PREVIEW RULES

- **NEVER use `mcp__Claude_Preview__*` tools.** Always use `mcp__Claude_in_Chrome__*` (Chrome MCP) for all browser interaction, screenshots, and verification.
- When you need to verify UI changes, use Chrome MCP to navigate to the running dev server URL — do NOT start your own preview server.

## 1. OPERATING CONTEXT & IDENTITY

- **Project:** SlateCamp — A high-performance, discipline-agnostic study engine for professional licensure exams.
- **Aesthetic:** Campfire — warm, inviting, research-backed, commercially viable. Clean and functional with subtle warmth.
- **Voice:** The "Confident Companion" — warm, supportive, growth-framed. No toxic positivity. No catastrophizing. No militaristic or adversarial language.

## 2. STRICT EXECUTION PROTOCOL

Before generating any code or architecture, you MUST execute the following sequence:

1. **Context Ingestion:** Read the relevant PRDs and blueprints in `.claude/docs/` to understand the _why_ before building the _how_.
2. **Schema Verification:** Consult `DATABASE_SCHEMA.sql` for all relational mappings. NEVER hallucinate tables, foreign keys, or UUIDs.
3. **Agent Orchestration:** Identify the task domain and adopt the strict persona rules from the corresponding file in `.claude/agents/` (e.g., `db-architect.md`, `quiz-engineer.md`).
4. **Skill Application:** Apply the universal coding constraints located in `.claude/skills/` (e.g., `enforce-server-components`, `clean-code`).

## 3. ABSOLUTE CONSTRAINTS (THE "NEVER" LIST)

- **NEVER Implement Generic Gamification:** Absolutely zero confetti, badges, virtual currency, or empty streaks. Progression is mapped ONLY to the Readiness Score, Taxonomy Heatmap, or Pacing Gauge.
- **NEVER Allow AI Hallucination:** The AI Contextual Tutor operates at Temperature 0.0. It MUST include mandatory citation badges linking to exact Wiki paragraphs. Use structured rationales from questions (Misconception vs. Principle) to tailor AI responses.
- **NEVER Compromise State:** All testing environments must have state persistence, auto-saving every 10 seconds.
- **STRICT Testing Modes:** Adhere to pedagogical rules for Camp, Storm, Chill, and Blindspot modes as defined in the Testing & Quizzing PRD.
- **IRT Mandate:** All mastery calculations MUST use the Item Response Theory (IRT) 2-parameter logistic model (theta, discrimination, difficulty).

## 4. TECH STACK & INFRASTRUCTURE

- **Core Framework:** Next.js (App Router), React, Tailwind CSS 4.
- **State Management:** Zustand or React Context.
- **UI Primitives:** shadcn/ui (Base UI / @base-ui/react).
- **Spatial Computing:** React Three Fiber (R3F) and Three.js (Target: 60 FPS).
- **Backend:** Supabase (PostgreSQL).
- **Package Management:** Bun.
- **Font:** Inter (loaded via next/font/google).

## 5. CAMPFIRE DESIGN SYSTEM

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Camp Cobalt | `#1B3FC4` | Primary actions, nav, links, active states |
| Camp Cobalt 50 | `#EEF2FC` | Active backgrounds, tints, hover states |
| Camp Cobalt 700 | `#1535A8` | Hover/pressed states |
| Camp Orange | `#E8853A` | Progress celebration, warm CTAs (use sparingly) |
| Emerald | `#2D9F6F` | Success, mastery, correct answers |
| Emerald 50 | `#EDFAF4` | Success backgrounds |
| Warm Red | `#D64545` | Error, critical — always with context, never alone |
| Warm Red 50 | `#FDF0F0` | Error backgrounds |
| Amber | `#D4951A` | Warning, developing skill |
| Amber 50 | `#FEF8ED` | Warning backgrounds |
| Info Blue | `#3B82C8` | Informational callouts |
| Surface Light | `#F8F7F5` | Page background (warm white) |
| Surface Card | `#FFFFFF` | Card backgrounds |
| Surface Focused | `#F5F7FA` | Testing interface background (cool) |
| Ink Primary | `#1A2332` | Main text |
| Ink Secondary | `#4A5568` | Supporting text |
| Ink Tertiary | `#8896A7` | Muted text, placeholders |
| Border Default | `#D4DAE3` | Borders, dividers |

### Typography

- **Font family:** Inter, system fallbacks
- **Minimum text size:** 8px (`text-[8px]`). Use 8px sparingly for labels, group names, and metadata only.
- **Monospace:** ONLY on code snippets, data values, and the Readiness Score number. NEVER on labels, categories, or metadata.

### Shadows

| Context | Rule |
|---------|------|
| Cards at rest | `shadow-none` |
| Cards on hover | `shadow-sm` |
| Dropdowns | `shadow-md` |
| Modals/dialogs | `shadow-lg` |
| FORBIDDEN | `shadow-xl`, `shadow-2xl` on non-modal elements |

### Border Radii

| Element | Rule |
|---------|------|
| Cards | `rounded-md` (8px) |
| Buttons, inputs | `rounded-sm` (6px) |
| Modals | `rounded-lg` (12px) |
| FORBIDDEN | `rounded-xl`, `rounded-2xl`, `rounded-3xl` on standard elements |

### Transitions

- **Maximum duration:** 300ms. NEVER use `duration-500`, `duration-700`, `duration-1000`.
- **Default:** `duration-150 ease-out`.
- **FORBIDDEN easing:** `bounce`, `spring` (except framer-motion structural animations).
- **Respect:** `prefers-reduced-motion: reduce` — all decorative animations must be suppressible.

### Engagement Policy (Three-Part Test)

Before adding any engagement feature, it must pass ALL three:
1. **Does it directly improve learning outcomes?** (not just engagement metrics)
2. **Would a serious professional find it respectful?** (not patronizing)
3. **Does it map to a real pedagogical concept?** (spaced repetition, interleaving, etc.)

## 6. VOICE GUIDE

### Words We Use / Don't Use

| Don't Use | Use Instead |
|-----------|-------------|
| Blindspot Protocol | Focus Review |
| Endurance Cycle | Extended Practice |
| Proof Simulation | Full Exam Simulation |
| drill / grind | practice / review / session |
| weakness / gap | area to revisit / developing skill |
| dominate / conquer | master / cover / strengthen |
| behind / overdue | ready for review |

### Tone Rules

- **Growth-framed:** "42 topics covered" not "58 remaining"
- **Specific CTAs:** "Start 10-Question Review" not "Begin Assessment"
- **Welcoming empty states:** Never accusatory ("You haven't done anything yet")
- **Time-aware greetings:** Warm, contextual ("Good evening — ready for a quick session?")
