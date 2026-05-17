# 02 - Master PRD: 3D Lab LI Learning System

## Product

3D Lab LI, or Learning Interactivity, is a source-grounded 3D learning mode for LEA candidates. It complements PI, or Parametric Interactivity, by replacing heavy sliders and compliance panels with clickable model hotspots, short explanations, source cards, comparison snippets, and quiz prompts.

## Problem

LEA candidates need to internalize spatial code requirements: ramp slopes, stair dimensions, toilet clearances, egress widths, travel paths, setbacks, and assembly logic. Static diagrams and text pages create weak transfer because students must mentally map code text onto space. Existing PI modules are powerful for parametric exploration but can be too heavy when the learner simply needs to understand what a component is, where a requirement applies, and how to remember it for the board exam.

## Target Users

| Persona | Need |
| --- | --- |
| Anxious first-taker | Calm guided exploration with no information overload |
| Retaker | Direct review of weak topics and board traps |
| Undergrad prepper | Exploratory 3D learning before exam pressure |
| Working professional returner | Short, efficient review sessions with the highest-yield hotspots |
| Content author | A repeatable way to create 3D learning modules without parametric system complexity |

## Product Goals

1. Let students learn code concepts by clicking spatially anchored 3D hotspots.
2. Make every hotspot teach one concept, one dimension, one comparison, or one board-style trap.
3. Provide source cards and correction/report affordances for trust.
4. Preserve current PI modules and route behavior.
5. Create reusable config-driven LI interaction objects inside the existing 3D Lab template/viewport system.
6. Support future Wiki, quiz, Camp Trail, and analytics integration.

## 2026-05-13 Live-Code Correction

The live 3D Lab already shares `ViewportShell`, `LabViewportFrame`, `CanvasWrapper`, `SceneConfig`, and `useTemplateContent` across active module routes. LI should therefore be modeled as an interaction profile over existing rendering templates, not as a separate viewport engine.

Implementation should prefer optional LI metadata and `learningObjects` on existing module/config patterns before adding a new `learning` `TemplateType`. The first LI ramp should reuse the existing `bp344-accessible-route-ramp` geometry/source work, even if the student-facing LI slug remains `bp344-ramp-hotspots`.

## MVP Scope

### Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| LI-FR-001 | Add data-driven LI/Hybrid interaction metadata to 3D Lab registry entries. | P0 |
| LI-FR-002 | Add LI learning-object support without changing current route or viewport structure. | P0 |
| LI-FR-003 | Render LI modules in the shared 3D Lab viewport shell. | P0 |
| LI-FR-004 | Support model hotspots with `info`, `quiz`, and `comparison` payload shapes. | P0 |
| LI-FR-005 | Render a compact hotspot list and progress summary in the right panel. | P0 |
| LI-FR-006 | Support optional layer toggles as a secondary control. | P0 |
| LI-FR-007 | Add dashboard badges that distinguish Parametric and Learning modules. | P0 |
| LI-FR-008 | Add a feature-flagged dashboard mode filter when LI modules exist. | P1 |
| LI-FR-009 | Add first MVP module: BP 344 accessible ramp hotspots. | P0 |
| LI-FR-010 | Add second MVP module: BP 344 accessible toilet hotspots. | P0 |
| LI-FR-011 | Add third MVP module: egress stair cross-code hotspots. | P0 |
| LI-FR-012 | Link hotspot source references to source-card IDs. | P0 |
| LI-FR-013 | Provide non-WebGL/static fallback content for each public-release module. | P1 |

### Non-Functional Requirements

| ID | Requirement |
| --- | --- |
| LI-NFR-001 | Existing PI modules default to PI and render unchanged. |
| LI-NFR-002 | LI must not create a second WebGL canvas for the same module route. |
| LI-NFR-003 | MVP modules should keep visible hotspot count to 6-8, never more than 12. |
| LI-NFR-004 | Module configs should use existing static TypeScript config patterns. |
| LI-NFR-005 | Runtime should remain performant on mid-range devices. |
| LI-NFR-006 | No new dependency without explicit implementation review. |

### Accessibility Requirements

| ID | Requirement |
| --- | --- |
| LI-AR-001 | Hotspots and sidebar controls must be keyboard reachable. |
| LI-AR-002 | Hotspot type cannot be communicated by color alone. |
| LI-AR-003 | Quiz results must include text feedback, not only visual state. |
| LI-AR-004 | Layer toggle labels must be explicit and associated with controls. |
| LI-AR-005 | Mobile touch targets must meet minimum usable sizes. |
| LI-AR-006 | Static fallback must preserve the learning objective when WebGL is unavailable. |

## Hotspot Types

| Type | Purpose | Required content |
| --- | --- | --- |
| `info` | Teach one spatial requirement or concept. | title, plain-language description, source card ID, dimension callout when relevant |
| `quiz` | Convert exploration into recall. | question, choices, correct option, rationale, code citation/source card |
| `comparison` | Explain differences across codes or states. | compared labels, requirement per code/state, source card per row |

## First Modules

### `bp344-ramp-hotspots`

Learner job: understand ramp surface, slope, width, landings, handrails, edge curb, tactile warning, and traffic conditions without manipulating parametric controls.

Implementation basis: compose from the existing `bp344-accessible-route-ramp` PI module/config where possible. Do not rebuild ramp geometry from scratch unless live code review proves reuse is more expensive than replacement.

Minimum hotspots:

- ramp surface width/slope
- slope quiz
- landing platform
- handrails
- handrail comparison
- edge curb
- tactile warning
- vehicular traffic quiz

### `bp344-toilet-hotspots`

Learner job: understand fixture placement, grab bars, turning space, door swing, lavatory clearances, and accessory reach ranges.

Minimum hotspots:

- water closet
- rear grab bar
- side grab bar
- clear floor space
- door swing quiz
- turning circle
- lavatory
- accessories

### `egress-stair-hotspots`

Learner job: compare stair and egress dimensional requirements across PD 1096, BP 344, and RA 9514.

Minimum hotspots:

- riser comparison
- tread comparison
- width comparison
- width quiz
- handrail height comparison
- landing
- guardrail
- exit door

## User Stories

| ID | Story | Acceptance |
| --- | --- | --- |
| LI-US-001 | As a student, I can identify a Learning module from the dashboard. | Card shows a Learning badge and opens the existing 3D Lab module route. |
| LI-US-002 | As a student, I can click a model hotspot to learn one code concept. | Hotspot opens a readable panel/modal with title, plain-language text, dimension, and source card reference. |
| LI-US-003 | As a student, I can answer a quiz anchored to the model. | Quiz shows answer, rationale, and source citation after submission. |
| LI-US-004 | As a student, I can compare code requirements on the same model element. | Comparison hotspot shows side-by-side requirements with source cards. |
| LI-US-005 | As a retaker, I can jump from a weak topic to the relevant LI hotspot. | Future integration has typed route/query or state target for hotspot ID. |
| LI-US-006 | As a content author, I can create an LI module by defining hotspots and optional layers. | Config validates without parametric sliders or compliance rules. |

## Out of Scope for MVP

- AI chat.
- New top-level navigation.
- Supabase schema changes.
- Admin authoring UI.
- Split-screen comparison viewport.
- Full coverage map implementation.
- GBC compliance claims.
- Public release without human/source review evidence.

## Acceptance Criteria

MVP is ready for implementation review when:

- at least one LI module works end to end under the existing module route,
- PI modules remain visually and functionally unchanged,
- hotspot payloads can represent info, quiz, and comparison cases,
- source-card IDs are present for student-facing code claims,
- relevant unit and Playwright tests pass,
- non-WebGL fallback is defined for release candidate modules,
- final QA includes screenshot evidence and reviewer sign-off before public release.
