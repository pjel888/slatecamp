# 01 — Executive Competitive Strategy: How LI Beats VizCode

## The Competitive Landscape

VizCode PH is a **visual Philippine architecture-code interpretation platform** with:
- 267+ topic pages across 5 code families (PD 1096, BP 344, RA 9514, BP 220/PD 957, GBC)
- 3 review modes: Isolation, Comparative, Game
- AI chatbot (QUBI), community (Discord), group/institutional pricing
- 532 captured URLs, 529 HTTP 200 product pages
- 2 blog posts (weak content marketing)
- Empty Terms page, generic Privacy (trust gap)
- Manual payment verification (conversion friction)

**VizCode's weakness**: Static 2D diagrams, no true 3D interaction, interpretive content, weak trust/legal posture, AI without source citations.

**SlateCamp's opportunity**: Source-verified, interactive 3D learning that serves every learner job VizCode attempts — but with superior accuracy, spatial understanding, and exam workflow.

## The LI Competitive Thesis

> **LI mode is not "VizCode features ported to 3D." LI mode is learner-job parity achieved through SlateCamp-native 3D spatial interaction, source-grounded explanations, and ALE board-exam workflow integration.**

Every VizCode feature maps to an LI sub-mode or scene template:

| VizCode Feature | LI Equivalent | Advantage |
|----------------|---------------|-----------|
| Isolation Mode (focus on one topic) | **LI Focus View** — interactive 3D scene with inspectable dimensions, togglable layers | 3D spatial, not 2D diagram; source-cited; board-trap aware |
| Comparative Mode (side-by-side) | **LI Compare View** — split viewport or togglable comparison states | Visual + dimensional comparison; compliant vs non-compliant presets |
| Game Mode (interactive quizzes) | **LI Mistake Hunt + Board Drill** — find violations in 3D; answer board-style questions | 3D spatial reasoning, not text-only; immediate source-card feedback |
| Code Library (text references) | **LI Source View + Source Cards** — verified citations on every scene | Exact section/table/date; interpretation boundary stated |
| AI/QUBI Chatbot | **LI Repair Path** — wrong answer → source card → 3D scene → mini-drill | Guided remediation, not free-text AI; source-grounded |
| Category Sidebar Navigation | **LI Coverage View** — browsable code family → topic → 3D module atlas | P0/P1/P2 priority; source status visible |
| Community/Discord | SlateCamp community + study pods (separate from LI) | LI scene states can be shared/saved for peer review |

## Strategic Architecture Decision

### Option A: Build LI as 6 Separate Template Types
`'learning-focus'`, `'learning-compare'`, `'learning-mistake'`, `'learning-drill'`, `'learning-source'`, `'learning-repair'`

**Cons**: Template type explosion. Each needs shell config, TEMPLATE_META, useTemplateContent case. Duplicated scene renderers. Can't easily offer multiple sub-modes per module.

### Option B: Single 'learning' Template Type with Config-Driven Sub-Modes (RECOMMENDED)

```typescript
export interface LearningSceneConfig {
  // ... existing LI fields ...
  supportedModes: LearningSubMode[]  // ['focus', 'compare', 'mistake', 'drill', 'source', 'repair']
  modeConfigs: {
    focus?: FocusModeConfig
    compare?: CompareModeConfig
    mistake?: MistakeModeConfig
    drill?: DrillModeConfig
  }
}

export type LearningSubMode = 'focus' | 'compare' | 'mistake' | 'drill' | 'source' | 'repair'
```

One module config can declare multiple supported sub-modes. The LI shell renders sub-mode tabs or a sub-mode selector. The scene renderer switches behavior based on active sub-mode.

**This is the recommended approach.** It keeps the template type list clean (just `'learning'`) while allowing rich sub-mode support. Modules start with 1-2 sub-modes and grow.

## LI Mode Competitive Positioning

### Vs VizCode Isolation Mode

VizCode: static page with text + diagram about one topic.
**LI Focus View**: Interactive 3D model you can orbit, zoom, and inspect. Toggle layers to see internals. Dimensions are spatial, not just labeled. Source card shows exact code section.

### Vs VizCode Comparative Mode

VizCode: side-by-side text/diagrams (primarily BP 220 vs PD 957).
**LI Compare View**: Split viewport or toggle between compliant/non-compliant states. See the dimensional difference in 3D space. Understand WHY one design passes and another fails.

### Vs VizCode Game Mode

VizCode: text-based quiz with answer controls.
**LI Mistake Hunt**: Find the code violation in a 3D scene. Click the non-compliant element. Get source card showing the rule. **LI Board Drill**: LEA-style question overlaid on 3D scene. Answer, then see the spatial rationale.

### Vs VizCode Code Library

VizCode: digitized text from official PDFs with category navigation.
**LI Source View**: Every LI scene element can be inspected to see its governing code section, table, and SlateCamp interpretation boundary. Source cards are the verified backbone.

### Vs VizCode QUBI AI

VizCode: "Trained on Philippine architectural standards" but no source citations shown publicly.
**LI Repair Path**: When a student gets a question wrong in Quiz, the remediation link takes them to the exact LI scene with the relevant layer highlighted and source card shown. No AI hallucination risk.

## Non-Goals for LI Competitive Scope

- LI does NOT replicate VizCode's full text code library (that's SlateCamp Wiki's job)
- LI does NOT replace PI (Parametric Interactivity) — PI handles engineering exploration
- LI does NOT include AI chatbot (separate SlateCamp AI strategy)
- LI does NOT handle community/Discord features (separate SlateCamp community strategy)
- LI does NOT handle pricing/payment flows (separate SlateCamp commerce strategy)
- LI does NOT replicate VizCode's blog/content marketing

## What LI Must Have to Compete (MVP → Full)

| Phase | Capability | VizCode Equivalent |
|-------|-----------|-------------------|
| **MVP** | Layer toggle 3D scene with 2 sub-modes (Focus + Source) | Isolation Mode + Code Library |
| **Phase 2** | Compare View, Mistake Hunt | Comparative Mode + Game Mode |
| **Phase 3** | Board Drill, Repair Path | Quiz/game + remediation |
| **Phase 4** | Coverage view, source-card atlas | Category navigation + code library |
| **Phase 5** | P0 content: 90 topics across 7 scene templates | Full code-family coverage |

## Summary Decision Table

| Decision | Choice |
|----------|--------|
| Architecture approach | Single `'learning'` template type + config-driven sub-modes |
| First 3 scene templates | BP344 Ramp, BP344 Toilet, Egress Stair |
| Coverage view timing | Phase 2 (needs content inventory first) |
| Source card integration | Required from day 1 — every LI element must have sourceCardId |
| PI/LI relationship | Complementary: PI = engineer, LI = learner |
| Free tier strategy | Source View sub-mode is free preview; interactive sub-modes are paid |
