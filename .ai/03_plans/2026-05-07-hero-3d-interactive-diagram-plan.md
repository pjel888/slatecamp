# SlateCamp Landing Hero — 3D Interactive Code Diagram Plan

**Date:** 2026-05-07
**Status:** Planning brief — no production code changes in this document
**Target surface:** Public landing page hero
**Primary proof object:** Interactive PD 1096 / NBCP visual explainer
**Working concept name:** Code Envelope Explorer

---

## 1. Executive decision

The landing hero should not show a generic dashboard card. It should stage a live architectural-code diagram as the product proof.

The Vizcode reference works because it is simple: one rule, one building, one dimension, one emotional promise of clarity. SlateCamp should keep that clarity, then beat it by making the diagram inspectable, animated, and contextual.

**Recommended direction:**

- Use a **full hero stage**, not a small card.
- Build a **React Three Fiber / Three.js progressive-enhancement visual** with a high-quality static/SVG fallback.
- Start with a **single memorable Rule VIII demonstration with two visible layers**: (1) light and ventilation for eaves/canopies/awnings at **750 mm from side and rear property lines**, and (2) lot/building **setback bands** that explain where the main building mass may sit.
- Expand the same visual language to RROW, BHL, PSO/AMBF, and firewall decisions after the hero proves its load/performance value.
- Do not make the hero a full calculator. The hero should communicate: **“SlateCamp turns confusing code into something you can see, trust, and remember.”**

This hero is the acquisition-level proof for SlateCamp’s market position: not a primary review center, but the student’s architecture **Pokedex / field guide / reviewer buddy** for Philippine code, knowledge, and exam comfort.

---

## 2. Strategic role of the hero

### What the target market cares about

Our target users are not buying “SRS,” “active recall,” “quizzing methods,” or learning-science vocabulary. Those are product mechanics, not emotional outcomes.

They care about:

- **Assurance:** “Am I studying the right thing?”
- **Comfort:** “Can someone make this less overwhelming?”
- **Knowledge:** “Can I finally understand what this rule means?”
- **Reliability:** “Is this grounded enough that I can trust it?”
- **Exam survival:** “Will this help me avoid blanking out or misunderstanding the code?”

The hero visual must therefore sell **clarity and confidence**, not tool mechanics.

### Positioning rule

SlateCamp should not position itself as a replacement for JPT, CDEP, or a primary review center.

Better frame:

> “The always-available visual companion beside your review center, notes, and books.”

The hero should make that instantly believable by showing a hard code concept made visible.

### Emotional promise

The hero should make the user feel:

- “Oh, that’s what the rule means.”
- “This looks serious enough to trust.”
- “This is less intimidating than reading tables alone.”
- “This could help me remember details I usually mix up.”
- “This is more useful than a static Instagram code diagram.”

---

## 3. What to learn from the Vizcode sample

### What the Vizcode diagram does well

- It names the governing source clearly: **National Building Code / PD 1096 / Rule 8**.
- It uses a simple architectural mass, not an abstract UI widget.
- It isolates one rule: **Light and Ventilation — maximum extension of eaves, canopies, and awnings — 750 mm from side and rear property lines**.
- It uses dimension lines and property lines, which architects immediately understand.
- It is visually lightweight enough to be consumed quickly.

### Where SlateCamp can exceed it

SlateCamp can go beyond the static poster by adding:

- **Inspectable layers:** property line, setback zone, eave/canopy extension, RROW, buildable envelope.
- **State changes:** compliant vs too-close-to-line conditions.
- **Animated cause/effect:** dragging an eave past the safe band turns the dimension red; toggling setback bands shows how the main mass shrinks into its buildable envelope.
- **Multiple views:** isometric, plan, section cut, and “exam memory” view.
- **Plain-language explanation:** “Keep the overhang at least 750 mm away from side/rear property lines — and keep the main building inside the required setback envelope.”
- **Citation discipline:** show the code reference without pretending to be an official government source.
- **Learning handoff:** “Open the free guide after signup” / “Try the full 3D Lab.”

---

## 4. Hero concept: Code Envelope Explorer

### One-sentence product idea

A live architectural model that shows how Philippine building-code rules shape the lot, building, eaves, setbacks, and buildable envelope.

### Core hero copy direction

Possible headline directions:

1. **“See the code before you memorize it.”**
2. **“Make building rules visible.”**
3. **“Your architecture reviewer buddy for the rules that never stay flat on paper.”**
4. **“From code tables to visual confidence.”**

Recommended hero structure:

- **Eyebrow:** PD 1096 / NBCP visual guide preview
- **Headline:** See the code before you memorize it.
- **Subheadline:** SlateCamp turns Philippine architecture rules into visual guides, practice questions, and interactive tools you can use beside your review center.
- **Primary CTA:** Start with a free account
- **Secondary CTA:** Preview the 3D Lab
- **Trust line:** Educational companion for architecture students, board aspirants, and professionals; **not an official code source** or review-center replacement.

### Public-copy guardrails

Avoid:

- “Pass the board exam with SlateCamp.”
- “Official PD 1096 source.”
- “Predicts the board exam.”
- “No need for review centers.”
- “Master the ALE with active recall and SRS.”

Prefer:

- “Study companion.”
- “Visual guide.”
- “Source-backed where verified.”
- “Educational preview.”
- “Use beside your review center, books, and notes.”
- Full public exam name: **Licensure Examination for Architects**. Use **LEA** only after first full spelling or in metadata/internal notes.

---

## 5. Above-the-fold composition

### Desktop layout: hero as stage, not card

Recommended composition:

- Left third / overlay column:
  - headline
  - short subheadline
  - two CTAs
  - trust/disclaimer line
  - small proof chips: `PD 1096`, `Rule VIII`, `750 mm`, `Setbacks`, `Interactive preview`
- Right two-thirds / background stage:
  - large isometric 3D model
  - property-line grid
  - eaves/canopies highlighted in SlateCamp accent color
  - front/side/rear setback bands as translucent site-control zones
  - dimension lines and labels floating near the model
  - one compact control strip, not a full dashboard
- Bottom hero strip:
  - four platform pillars: Knowledge Resources, Quizzes, 3D Lab, Free Tools
  - each pillar has one outcome-oriented line, not method jargon

### Mobile layout

Do not load the full WebGL scene by default on small/mobile devices.

Use:

- static/SVG or prerendered poster of the same model
- one tap target: “Open interactive preview”
- compact proof chips
- same CTAs

Reason: mobile landing pages need speed and comprehension. The full interactive model can live after explicit tap or on the 3D Lab route.

### No-scroll goal

For 13-inch MacBook Pro class viewport, the first screen should still reveal:

- headline
- subheadline
- primary CTA
- visible 3D proof
- at least hints of the four-pillar platform

The visual can overlap the hero background; it does not need to fit inside a bounded card.

---

## 6. Interaction design

### Interaction principle

The hero should feel interactive immediately, but it should not require interaction to explain the value.

Default state must already communicate the core idea.

### Recommended first demo: Rule VIII eaves/canopies/awnings + setbacks

Default visual:

- small house/building mass on a lot
- side and rear property lines shown as dashed magenta/red lines
- eaves/canopies/awnings projecting from the roof
- clear dimension labels: `750 mm clear from side/rear property lines`
- compliant band shown as a translucent safety zone
- front, side, and rear setback bands shown as translucent site-control zones
- buildable footprint/envelope shown as the remaining clear area after setbacks

Micro-interactions:

1. **Drag / slider:** “Eave projection”
   - safe state: dimension line blue/green
   - violating state: eave edge crosses the 750 mm clearance zone; label turns red; model gently pulses at the collision line
2. **Layer toggle:** “Show setbacks”
   - off: the user sees the simple Vizcode-like 750 mm eave rule
   - on: the lot reveals front/side/rear setback bands and the main building snaps into the buildable envelope
   - citation panel changes from the eave rule to the verified setback table/locator used by the demo
3. **View toggle:** Isometric / Plan / Section
   - plan view for exam-style clarity
   - isometric view for emotional impact
   - section view for architecture comprehension
4. **Rule lens tabs:**
   - Eaves / canopies / awnings
   - Setbacks
   - RROW + height
   - Firewalls
5. **Why this matters:** small popover with plain-language explanation and citation.

### Controls to include in hero MVP

Keep controls few and high-signal:

- `Compliant` / `Too close` toggle
- `Eaves` / `Setbacks` layer toggle
- `Isometric` / `Plan` view toggle
- `Open full 3D Lab` CTA

Do not include full sliders for lot width, lot depth, zoning, firewalls, FLAR, PSO, and BHL in the first hero. Setbacks should appear as a visual layer using a verified preset, not as a full public calculator.

### Interaction states

Required states:

- Loading
- WebGL supported
- WebGL unavailable
- Reduced motion
- Mobile static fallback
- Keyboard-accessible fallback controls
- Pointer drag optional, not required

### Accessibility behavior

- All critical information must exist in DOM text outside the canvas.
- Canvas is decorative/interactive proof, not the only source of information.
- Provide keyboard buttons for every meaningful state change.
- Use `prefers-reduced-motion` to disable camera flythroughs, pulses, and auto-rotation.
- Avoid tiny controls below 44 px touch target.
- Use visible focus rings and labels.

---

## 7. Visual design direction

### What it should feel like

- Premium architecture studio, not toy gamification.
- Code diagram meets product demo.
- Clean enough for students; rigorous enough for architects.
- Philippine-specific in scope, but not “Philippine” as the first emotional brand cue.

### Visual vocabulary

Use a hybrid of:

- **Apple-like product-as-hero restraint:** big object, little noise, confident whitespace.
- **Linear/Framer-like dark precision:** dark stage, thin borders, subtle glows, technical labels.
- **Architecture diagram language:** dashed property lines, dimension strings, plan/section/isometric toggles.
- **SlateCamp warmth:** not intimidating; labels explain in normal human language.

### Color posture

- Background: deep slate/ink or warm off-white depending current landing system.
- Primary model: off-white building mass with soft shadows.
- Code geometry: SlateCamp blue for compliant; red/rose only for violations.
- Property lines: dashed magenta/red line, but restrained.
- Dimension labels: crisp, high contrast, not decorative.
- Overuse of neon/glass must be avoided.

### Diagram details that make it feel “architectural”

- dashed property lines
- dimension arrows and extension lines
- north arrow / small compass
- plan grid or faint drafting paper texture
- labels in meters/mm with tabular numerals
- small source tag: `PD 1096 / NBCP IRR — educational preview`
- camera preset icons: plan, section, iso

---

## 8. Technical architecture

### Recommended implementation architecture

Create a marketing-only hero module. Do not import the full 3D Lab shell.

Proposed files:

- `src/components/marketing/hero/HeroCodeEnvelope.tsx`
  - Server/client boundary wrapper.
  - Renders copy, CTAs, fallback poster, and dynamic R3F canvas.
- `src/components/marketing/hero/HeroCodeEnvelopeCanvas.tsx`
  - Client-only dynamic import with `ssr: false`.
  - Owns its own `<Canvas>`.
- `src/components/marketing/hero/HeroCodeEnvelopeScene.tsx`
  - Renders primitives: lot plate, property lines, building mass, roof/eave, dimension lines, labels.
- `src/components/marketing/hero/HeroCodeEnvelopeFallback.tsx`
  - Static SVG/HTML fallback matching the 3D model composition.
- `src/components/marketing/hero/heroCodeEnvelopeData.ts`
  - Demo constants, labels, citations, and safe public-copy strings.

### What to reuse

Strong reuse:

- `src/components/r3f/WebGLErrorBoundary.tsx`
- `src/components/r3f/CanvasLoadingOverlay.tsx` / `LoadingProgress`
- `src/lib/pd1096/computationEngine.ts` for canonical calculations when showing real development controls
- `src/lib/pd1096/types.ts` for typed inputs if using real data
- Existing visual patterns from:
  - `src/features/3d-lab/scenes/NBCPEnvelope/NBCPScene.tsx`
  - `src/features/3d-lab/DevControlsModule/canvas/*`
  - `src/features/3d-lab/components/shell/*`

Use those as references or small pattern sources, not as full imports.

### What not to reuse directly

Avoid importing into the public landing hero:

- `CanvasWrapper` from the 3D Lab shell, because it portals through the Lab viewport architecture.
- `NBCPEnvelope` top-level component, because it includes control panels and telemetry.
- `DevControlsLabV2` or `ModuleViewer`, because they are dashboard modules.
- `useNBCPStore` and `useDevControlsStore`, because landing hero state should be local and tiny.
- Simplified duplicate calculators as factual sources if the canonical `src/lib/pd1096` engine is available.

### Three.js / R3F implementation notes from current research

Current package and docs snapshot, checked 2026-05-07:

- Repo declares:
  - `three: ^0.183.2`
  - `@react-three/fiber: ^9.6.1`
  - `@react-three/drei: ^10.7.7`
  - `next: 16.2.3`
  - `react: ^19.2.5`
- Latest npm versions checked:
  - `three: 0.184.0`
  - `@react-three/fiber: 9.6.1`
  - `@react-three/drei: 10.7.7`
  - `@react-three/postprocessing: 3.0.4`
- R3F Canvas supports a `fallback` prop for non-GL environments.
- R3F supports `frameloop="demand"` to keep WebGL idle when nothing changes.
- R3F demand rendering requires explicit invalidation for imperative mutations/camera changes.
- Drei `PerformanceMonitor` can lower/increase quality based on measured FPS.
- Drei `AdaptiveDpr` can reduce device pixel ratio during performance regressions.
- Three.js WebGPU exists and R3F can initialize async renderers, but WebGPU is still not the safest default for a public landing hero because not all Three.js features are fully backward-compatible and browser/device support still requires fallback discipline.

### Renderer recommendation

Use **WebGL via R3F** for the first production hero.

Do not use WebGPU as the default MVP renderer. Treat WebGPU as a future enhancement or lab route experiment.

Reason:

- Landing hero must be reliable.
- WebGL is mature and enough for primitive architectural geometry.
- Our scene should be light enough that WebGPU is unnecessary.
- WebGPU can be explored later for heavy 3D Lab modules, not first-page acquisition.

### Performance budget

Hero scene budget:

- no GLTF unless needed later
- primitives only for MVP
- target under 50 draw calls
- no postprocessing in MVP
- no shadows heavier than necessary
- `frameloop="demand"`
- `dpr={[1, 1.5]}` or lower on mobile
- static fallback visible immediately
- dynamic canvas lazy-loaded after text/CTA shell
- avoid auto-rotation loops; use one intro animation then idle

### Recommended Canvas config

Conceptual setup:

```tsx
<Canvas
  frameloop="demand"
  dpr={[1, 1.5]}
  camera={{ position: [5, 4, 6], fov: 35 }}
  fallback={<HeroCodeEnvelopeFallback />}
>
  <PerformanceMonitor onDecline={...} onIncline={...} />
  <AdaptiveDpr />
  <HeroCodeEnvelopeScene state={state} />
</Canvas>
```

Actual implementation should follow repo patterns and type-check constraints.

---

## 9. Content model for the first hero demo

### Demo title

**Light, Ventilation, and Setbacks: 750 mm clearance + buildable envelope**

### Plain-language explanation

> For eaves, canopies, and awnings, keep the extension clear of side and rear property lines by 750 mm. Then switch on setback bands to see how the required yards shape the main buildable envelope. The point is not just to memorize numbers — it is to see where the building is allowed to sit.

### Source guard for setbacks

Setbacks may be shown in the first hero demo, but exact front/side/rear values must come from a verified preset and source locator before production implementation. If the locator is not ready, the setback layer should be labeled `sample setback envelope` and should avoid presenting exact numeric distances beyond the verified 750 mm eave/canopy/awning clearance.

### On-canvas labels

- `Side property line`
- `Rear property line`
- `750 mm clear zone`
- `Front setback`
- `Side setback`
- `Rear setback`
- `Buildable envelope`
- `Eave / canopy / awning extension`
- `Compliant`
- `Too close`
- `PD 1096 / NBCP Rule VIII preview`

### Off-canvas educational copy

- “Educational preview only. Always verify against the governing code, IRR, and local requirements.”
- “Full guide and practice questions available after signup.”

### CTA handoff

- Primary: `Start with a free account`
- Secondary: `Preview the 3D Lab`
- Tertiary text link: `Read the PD 1096 guide`

---

## 10. Roadmap phases

### Phase 0 — plan and design proof

Deliverables:

- this plan
- low-fidelity wireframe sketch or HTML/SVG visual concept
- final hero copy block
- citation checklist for the 750 mm rule and the selected setback table/preset

Acceptance criteria:

- hero concept approved before production coding
- no claims that imply official status or pass guarantee
- public copy uses full “Licensure Examination for Architects” where exam is named

### Phase 1 — static premium hero visual

Deliverables:

- `HeroCodeEnvelopeFallback` as static SVG/HTML/CSS
- hero layout updated to include visual proof
- mobile-safe and no-WebGL-safe version

Acceptance criteria:

- above-fold load remains fast
- no WebGL required for first paint
- dimension labels and setback bands readable at desktop and mobile
- CTAs honest about signup/free access

### Phase 2 — R3F progressive enhancement

Deliverables:

- client-only dynamic R3F canvas
- local hero state for compliant / too-close view
- local hero state for eaves/setbacks layer visibility
- plan/isometric toggle
- WebGL fallback boundary
- reduced-motion handling

Acceptance criteria:

- canvas never blocks hero copy and CTA
- no full 3D Lab store/shell imports
- scene idles when not changing
- keyboard fallback changes the same states as pointer controls

### Phase 3 — expanded rule lenses

Deliverables:

- refine the Setbacks lens from preset-only into a verified source-backed interactive layer
- add RROW/BHL lens
- add firewall lens if legally/calculate-backed
- route handoff to 3D Lab module

Acceptance criteria:

- every displayed dimension has a verified source locator
- rule lens text is plain-language and legal-safe
- no duplicate code truth if canonical engine can provide data

### Phase 4 — measurement and optimization

Deliverables:

- analytics events for CTA clicks, hero interactions, and 3D Lab preview opens
- performance monitoring for WebGL failures and fallback usage
- A/B copy variants focused on assurance and clarity

Acceptance criteria:

- hero interaction does not reduce CTA conversion
- mobile fallback does not feel broken
- WebGL errors are handled gracefully

---

## 11. Risks and mitigations

### Risk: WebGL hurts first load

Mitigation:

- render static fallback first
- lazy-load canvas
- use primitives only
- demand render loop
- mobile static by default

### Risk: hero becomes a complicated mini-app

Mitigation:

- restrict MVP controls to 2–3 states
- send advanced controls to `/dashboard/3d-lab`
- preserve clear copy and CTA hierarchy

### Risk: legal/code accuracy drift

Mitigation:

- use canonical `src/lib/pd1096` where calculations are displayed
- require source locator before adding any dimension or claim
- keep disclaimer visible but calm
- avoid official-source framing

### Risk: target market misses the value

Mitigation:

- lead with clarity, confidence, and visual understanding
- avoid learning-science jargon
- use fear carefully: “avoid mixing up the rule” rather than “fail if you do not use us”

### Risk: visual looks like a toy

Mitigation:

- use architectural drawing conventions
- keep materials restrained
- prioritize labels, dimensions, and clean camera angles over flashy effects
- avoid gamified colors and emoji

---

## 12. Validation checklist before implementation is considered done

### Documentation validation

- [ ] Plan exists under `.ai/03_plans/`.
- [ ] Public copy guardrails included.
- [ ] Technical architecture avoids full 3D Lab imports.
- [ ] Performance strategy included.
- [ ] Accessibility fallback included.
- [ ] Legal/code-source verification requirement included.

### Code validation once implemented

Run at minimum:

```bash
bun run type-check
bun run lint
bun run build
```

If using canonical PD 1096 computation:

```bash
bun test src/lib/pd1096/__tests__/computationEngine.test.ts
```

If touching existing 3D Lab modules:

```bash
bun test src/features/3d-lab/utils/nbcpCalculator.test.ts
bun run perf:3d:gates
```

Manual checks:

- `/` desktop hero
- `/` mobile hero
- reduced-motion mode
- WebGL unavailable fallback
- keyboard-only control path
- no console errors
- CTA route correctness
- no raw `[SLATECAMP_UI_BLOCK:...]` placeholders in rendered public content

---

## 13. Final recommendation

Make the hero a **living architectural code diagram**.

Do not start by porting the full 3D Lab into the landing page. Start with a polished static/SVG version that looks premium immediately, then progressively enhance it with a tiny standalone R3F scene.

The first rule demo should be specific, memorable, and useful: **Rule VIII light and ventilation / 750 mm clearance for eaves, canopies, and awnings from side and rear property lines, shown together with setback bands and the resulting buildable envelope**.

This lets SlateCamp beat a static code poster without overbuilding the landing page. The user sees the core promise in three seconds:

> SlateCamp makes the rules visible, so you feel less lost while studying architecture.
