# 23 — UX Research Synthesis: How LI Hotspots Win on Educational Effectiveness

## Purpose

Synthesize existing SlateCamp UX research (from `.codex/skills/` and `.ai/` folders) into actionable LI hotspot design principles that demonstrably beat VizCode on learning outcomes.

## Evidence Basis

| Source | Key Insight for LI |
|--------|-------------------|
| `slatecamp-3d-interaction-designer/SKILL.md` | Three Tests for every interaction (Mayer's Coherence, Hattie's Feedback, LEA Test); 8 interaction types; hotspot architecture |
| `slatecamp-3d-information-designer/SKILL.md` | 4-layer information architecture; hotspot content writing rules; quiz placement strategies; cognitive load management |
| `slatecamp-ux-researcher/SKILL.md` | 4 validated personas with different LI usage patterns |
| `slatecamp-3d-arch-diagram-modeler/SKILL.md` | Mayer's dual-coding theory — 65% better retention with 3D+2D |
| `slatecamp-ux-designer/SKILL.md` | Score Reveal, Heatmap, Camp Trail UX patterns applicable to LI progress tracking |
| `3D-Lab-Audit-And-UXUI-Improvement/deep-research-report.md` | Camera control paradigms, UX failure modes |

## The Three Tests Applied to LI Hotspots

Every LI hotspot must pass these three tests (from the 3D interaction designer skill):

### Test 1: Mayer's Coherence
> "Does this interaction serve the learning objective, or is it decoration?"

**LI Application**: Every hotspot must link to a specific learning objective. No "nice to have" hotspots. A hotspot that says "Click here to see the wall" fails. A hotspot that says "Minimum clear width: 1200mm — BP 344 §4.02" passes.

**Competitive advantage over VizCode**: VizCode's diagrams show everything at once with no interactive filtering. LI hotspots show one concept at a time, reducing extraneous cognitive load (Mayer's Coherence Principle).

### Test 2: Hattie's Feedback
> "Does the interaction produce specific, corrective, feed-forward feedback?"

**LI Application**: Quiz hotspots must show WHY an answer is correct or incorrect, not just whether it is. The feedback must include the source card citation so the student can verify. After a wrong answer, the related hotspot should be highlighted for re-review.

**Competitive advantage over VizCode**: VizCode's Game Mode shows correct/incorrect with a code citation. LI adds spatial context — the violating element is highlighted in 3D, showing exactly WHERE the rule applies.

### Test 3: The LEA Test
> "Will this interaction help a student answer an LEA question correctly?"

**LI Application**: Hotspot content must target known board exam traps. For the ramp module, hotspots must explicitly address: confusing ramp slope with curb ramp slope, forgetting landing requirements, treating accessible route as isolated pieces.

**Competitive advantage over VizCode**: VizCode's content is interpretive ("diagrams reflect our interpretation"). LI's content is source-verified with exact section/table references, directly preparing students for board citation questions.

## The 4-Layer Information Architecture Applied to LI

From the 3D information designer skill:

```
Layer 0: THE MODEL (always visible)
  LI: 3D ramp/stair/toilet model. Clean, no clutter.
  Student understands WHAT they're looking at in <3 seconds.

Layer 1: ORIENTATION LABELS (visible on load)
  LI: 0-2 persistent labels naming major elements.
  Example: "Ramp" and "Handrail." No dimensions yet.

Layer 2: EXPLORATION HOTSPOTS (revealed on orbit/interaction)
  LI: 6-8 hotspot dots appear as student explores.
  Each reveals ONE concept. Student discovers through spatial exploration.

Layer 3: DEEP KNOWLEDGE (revealed on demand — click)
  LI: Source card, full code text, quiz question, Wiki link.
  Only shown when student clicks. Never auto-displayed.
```

### Anti-Pattern to Avoid (from skill)

```
❌ Model loads with 12 hotspots visible simultaneously,
   side panel full of text, dimensions everywhere, quiz prompt.
   → Student overwhelmed → closes module → never returns.
   → THIS IS WHAT VIZCODE DOES (static diagram showing everything at once).

✅ Model loads clean. Two labels only.
   Student orbits. Hotspots fade in progressively.
   Student taps one → sees ONE piece of information.
   → Student feels in control → explores more → learns more.
   → THIS IS WHAT LI SHOULD DO.
```

## Hotspot Content Writing Rules (from Information Designer Skill)

### Rule 1: One Concept Per Hotspot

```
❌ "This ramp has a clear width of 1200mm per BP 344 §4.02 and
   the maximum slope is 1:20 per BP 344 §4.01 and handrails
   must be at 700mm and 900mm per BP 344 §5."

✅ Hotspot 1 (ramp surface): "Minimum clear width: 1200mm.
   Source: BP 344 §4.02"
✅ Hotspot 2 (ramp surface): "Maximum slope: 1:20 (general).
   1:15 allowed in special cases. Source: BP 344 §4.01"
✅ Hotspot 3 (handrail): "Dual handrails at 700mm and 900mm.
   Both sides required. Source: BP 344 §5"
```

### Rule 2: Plain Language FIRST, Code Language SECOND

```
✅ "The ramp must be at least 1200mm wide — wide enough for
   a wheelchair plus a person walking beside it."
   → BP 344 §4.02: Minimum clear width = 1200mm

❌ "Per BP 344 §4.02, minimum clear width shall be 1200mm."
   (Code language is a barrier for students still learning)
```

### Rule 3: The Dimension Callout Is The Most Memorable Element

Students remember numbers attached to visual elements. The dimension callout box (value + unit in monospace) is the #1 retrieval cue for the LEA.

**LI Implementation**: Every requirement hotspot should include a highlighted dimension callout:
```
┌──────────────────┐
│   ≥ 1200 mm      │   ← This is what the student remembers
└──────────────────┘
```

### Rule 4: Personalization Tone (Mayer's Principle #10)

```
✅ "Your foot needs at least 250mm of tread depth to feel secure."
✅ "Think of the landing as a rest stop — you need 1800mm to pause safely."

❌ "The tread depth shall be a minimum of 250mm."
   (Formal, distant — lower retention per research)
```

## Persona-Based LI Usage Patterns

From the UX researcher skill, how each persona uses LI:

### Persona 1: Anxious First-Taker
**"I don't know if I'm ready."**

- **LI usage**: Structured exploration. Needs guided path, not free exploration.
- **Hotspot strategy**: Progressive reveal — show 2-3 hotspots initially, unlock more as student explores. "3 of 8 hotspots explored" progress indicator reduces anxiety.
- **Quiz strategy**: Post-exploration quiz (Strategy 1 from skill). Don't interrupt discovery with quiz prompts.
- **UX priority**: Clean, unthreatening. Two labels on load. No information dump.

### Persona 2: Retaker
**"I know what I don't know. I just don't know how to fix it."**

- **LI usage**: Targeted review. Goes straight to weak areas identified by Heatmap.
- **Hotspot strategy**: All hotspots visible. Skip orientation. Direct access to quiz hotspots.
- **Quiz strategy**: In-situ quiz (Strategy 3). "I already know the basics — test me on the tricky parts."
- **UX priority**: Efficiency. Direct links from Heatmap weak nodes to specific LI hotspots. "You got this wrong on the mock board. Review in 3D →"

### Persona 3: Undergrad Prepper
**"I want to be ready before everyone else."**

- **LI usage**: Curiosity-driven exploration. No time pressure.
- **Hotspot strategy**: Full exploration mode. Discovery through spatial wandering.
- **Quiz strategy**: Optional. "Test Yourself" button, not mandatory quiz.
- **UX priority**: Engagement. Gamification elements (hotspot completion, streaks). Not exam-anxiety-driven.

### Persona 4: Working Professional Returner
**"I've been delaying. Time-scarce."**

- **LI usage**: Efficiency-first. 10-15 minutes per session.
- **Hotspot strategy**: Pre-filtered by priority. "Start with these 3 critical hotspots."
- **Quiz strategy**: Checkpoint quiz (Strategy 2). Quick-check after each section.
- **UX priority**: Speed. Minimal friction. "You have 15 minutes. Here's what matters most."

## Quiz Placement Strategies for LI

From the information designer skill, adapted for LI hotspots:

### Strategy 1: Post-Exploration Quiz (Default for LI MVP)
```
Student explores ramp model → clicks 5 of 8 hotspots →
"Quiz Available" notification appears in right sidebar →
Student clicks → 3-5 questions about explored hotspots →
Wrong answers highlight relevant hotspot for re-review
```

**When to use**: First-time learners. Never interrupt discovery.

### Strategy 2: Checkpoint Quiz (LI Guided Path — Phase 2)
```
Student starts guided path →
"Step 1: Find the ramp surface hotspot" →
Student clicks hotspot → reads info →
"Quick check: What is the minimum ramp width?" →
Correct → advances to Step 2 →
Incorrect → shows answer with source card → advances anyway
```

**When to use**: Structured sessions, Camp Trail integration.

### Strategy 3: In-Situ Quiz (LI Hotspot — Phase 1)
```
Student sees a quiz hotspot (orange dot) →
Clicks → quiz modal opens →
Answers question → sees result + code citation →
Wrong answer highlights relevant info hotspot
```

**When to use**: Retakers, self-directed learners. Already built into hotspot architecture (type: 'quiz').

## Cognitive Load Budget Per LI Module

From the information designer skill:

| Element | Cognitive Load | LI Limit |
|---------|---------------|----------|
| 3D geometry complexity | High | Keep models simple — <50 polygons visible at once for MVP |
| Hotspot count | Medium | 6-8 hotspots per module. Never >12. |
| Text per hotspot | Low-Medium | 2-3 sentences of plain language + 1 dimension callout + 1 source citation |
| Simultaneous visible hotspots | High | Start with 0. Fade in as student explores. Never all at once. |
| Quiz questions per session | Medium | 3-5 per session. Not all 20+ available questions. |
| Side panel content | Low | Minimal — hotspot list, not full lesson text |

**Cognitive load rule**: Total working memory load per screen ≤ 4 chunks (Miller's Law). One 3D model = 1 chunk. One hotspot info card = 1 chunk. One quiz question = 1 chunk. Leave 1 chunk free for processing.

## VizCode's UX Failures (That LI Exploits)

| VizCode UX Pattern | Why It Fails | LI Alternative |
|-------------------|-------------|----------------|
| Static 2D diagram showing everything at once | Information overload. No progressive disclosure. | 4-layer architecture. Progressive hotspot reveal. |
| Text-heavy code library pages | Reading code text is low-retention. No spatial anchor. | 3D model + hotspots = dual coding (65% better retention) |
| Desktop-first ("best viewed on Desktop/Laptop") | Excludes mobile learners. Philippines is mobile-first. | ViewportShell mobile bottom sheet. Touch-optimized hotspots. |
| "Diagrams reflect our interpretation" disclaimer | Undermines trust. Students need certainty for board exam. | Source-verified citations. "Source-verified" badge. |
| Separate pages for Isolation/Comparison/Game modes | Context switching between modes increases cognitive load. | Single LI module with hotspot types (info/quiz/comparison). No page navigation. |
| AI chatbot without source citations | Students can't verify answers. Hallucination risk. | Repair Path is deterministic. Source card, not AI. |

## Happy Path User Flows

### Happy Path 1: First-Time Learner (Anxious First-Taker)

```
1. Dashboard → sees "Learning" badge on BP 344 Ramp module
2. Clicks → LI module loads
3. Sees clean 3D ramp model with 2 orientation labels
4. Orbits model → hotspot dots fade in on key elements
5. Clicks "Ramp Surface" hotspot → info modal:
   "The ramp must be at least 1200mm wide.
    ≥ 1200 mm
    BP 344 §4.02"
6. Reads, closes modal
7. Clicks "Handrail" hotspot → info modal
8. Clicks "Ramp Slope" quiz hotspot (orange dot) → question:
   "What is the maximum general slope? 1:8 / 1:12 / 1:15 / 1:20"
9. Answers → "Correct! BP 344 §4.01: Maximum general gradient = 1:20"
10. Right sidebar shows: "5 of 8 hotspots explored"
11. Returns to dashboard → Heatmap updates
```

### Happy Path 2: Retaker (Targeted Review)

```
1. Analytics Heatmap shows "BP 344 Ramps" as weak node (red)
2. Clicks "Review in 3D" → LI module loads with quiz mode active
3. Sees: "You got 3 of 5 ramp questions wrong on Mock Board #2.
   Review these hotspots: Ramp Slope, Landing, Tactile Warning"
4. Relevant hotspots are highlighted in orange
5. Clicks each, reviews info, re-takes quiz
6. Mini-drill: 3 questions → answers all correctly
7. "Ramp mastery: 5/5 ✅" → Heatmap updates
```

### Happy Path 3: Time-Scarce Professional

```
1. Opens LI module → sees "Quick Review (10 min)" option
2. Guided path auto-starts:
   Step 1: Ramp Surface (1 min) → next
   Step 2: Ramp Slope (1 min) → checkpoint quiz → correct → next
   Step 3: Landing (1 min) → next
   Step 4: Handrail (1 min) → checkpoint quiz → incorrect → shows answer → next
   Step 5: Quiz (5 questions) → 4/5 correct
3. "Session complete. Weak area: Handrail height.
   Review source card: BP 344 §5"
4. 8 minutes elapsed. Progress saved.
```

## Research-Backed Design Decisions for LI

| Decision | Research Basis | Source |
|----------|---------------|--------|
| Progressive hotspot reveal (not all at once) | Mayer's Coherence Principle — reduce extraneous cognitive load | 3D Information Designer skill |
| One concept per hotspot | Cognitive Load Theory — working memory limit of 4 chunks | 3D Information Designer skill |
| Plain language before code language | Mayer's Personalization Principle — conversational style improves retention | 3D Information Designer skill |
| Dimension callout as primary memory anchor | Dual Coding Theory — 65% better retention when verbal + visual | 3D Arch Diagram Modeler skill |
| 6-8 hotspots per module (not 12+) | Miller's Law — 7±2 chunks working memory | 3D Information Designer skill |
| Post-exploration quiz (not in-situ for first-timers) | Don't interrupt discovery — autonomy improves motivation | 3D Information Designer skill |
| Source-verified badge on every card | Trust/credibility — retakers have pattern-scarred distrust | UX Researcher skill (Retaker persona) |
| Progress indicator ("5 of 8 explored") | Goal-gradient effect — motivation increases as progress is visible | UX Researcher skill (Anxious First-Taker) |
| Mobile-first hotspot design | Philippines is mobile-first; VizCode explicitly desktop-only | UX Researcher skill (Philippine context) |
| Hotspot proximity to relevant geometry | Spatial contiguity — information near the visual element improves learning | 3D Interaction Designer skill |
