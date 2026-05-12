# The 3D learning path: from first pixel to lasting spatial memory

**Guided discovery — not free exploration and not rigid tutorials — produces the strongest learning outcomes in 3D educational environments.** The Alfieri et al. (2011) meta-analysis of 164 studies found guided discovery yields **d = 0.50** over alternative instruction, while unassisted discovery actually underperforms explicit instruction by **d = −0.38**. For SlateCamp's architecture licensure candidates, this means the 3D Lab must walk a precise line: direct attention sequentially to code-critical geometry while letting students control pace and manipulation. This document translates that finding — and hundreds of supporting studies — into the exact interaction sequence, phase by phase, that every 3D module should follow.

The stakes are concrete. The Philippine Architecture Licensure Examination tests spatial code knowledge on paper — 2D floor plans, sections, elevations. A 3D Lab only justifies its engineering cost if it produces spatial understanding that transfers to those 2D exam questions. The research shows it can, but only under specific conditions: constrained interactivity, progressive hotspot reveal, generation-before-instruction sequencing, and explicit 3D-to-2D bridging. What follows is the implementation spec.

---

## Section 1: The guided-versus-free question, settled by the evidence

### Unguided exploration is a cognitive load disaster for novices

Kirschner, Sweller, and Clark's landmark 2006 paper (over 6,200 citations) synthesized fifty years of evidence: **minimally guided instruction is less effective and less efficient than strongly guided instruction for novice learners.** The mechanism is working memory overload. When a student freely orbits a 3D building model with no direction, they engage in means-ends analysis — "What am I supposed to look at? Where is the relevant element?" — that consumes the same limited working memory needed for learning the actual building code content.

Mayer (2004) reviewed three decades of discovery learning research and reached the same conclusion: in every case examined — problem-solving rules in the 1960s, conservation strategies in the 1970s, programming in the 1980s — guided discovery outperformed pure discovery. The critical insight is that constructivist learning requires *cognitive* activity, not merely *behavioral* activity. A student spinning a 3D model is behaviorally active but may be cognitively idle.

**SlateCamp design rule:** The default mode for every 3D module is guided discovery. Free exploration is never the starting state for any user.

### Guided discovery outperforms both extremes

The Alfieri et al. (2011) meta-analysis is the definitive evidence. Across **940 comparisons from 164 studies**: unassisted discovery versus explicit instruction produced **d = −0.38** (explicit instruction won). But enhanced/assisted discovery versus other instruction types produced **d = +0.30**, with the guided discovery subtype — scaffolding plus feedback — producing the largest effect at **d = 0.50**. Adults benefited most, directly relevant to SlateCamp's licensure candidates.

What "guided discovery" means concretely in a 3D model viewer: the system directs the camera to structural element A, presents annotation content, allows the student to orbit and zoom around that element, then advances to element B. The student controls pacing and manipulation depth. The system controls sequencing and attention direction.

Kapur's productive failure research (2008–2016) adds a refinement: students who struggle briefly with a problem before receiving guidance show deeper conceptual learning. The Sinha and Kapur (2021) meta-analysis puts this effect at **Hedge's g = 0.87**. This means the guided discovery sequence should include moments where students attempt to solve a spatial problem — "Which dimension violates the code?" — before the system reveals the answer.

**SlateCamp design rule:** Each guided discovery sequence includes at least one generation moment where the student attempts to identify or set the correct value before receiving instruction.

### The expertise reversal effect demands an adaptive toggle

Kalyuga et al. (2003) formally identified the expertise reversal effect: instructional guidance that helps novices produces **negative consequences** for experienced learners. Experts already possess internal schemas; external guidance forces them to reconcile redundant information, increasing cognitive load rather than reducing it. Multiple studies show full disordinal interactions — the same instructional technique helps one group and hurts the other.

For SlateCamp's mixed-ability cohort (fresh graduates through experienced practitioners), a one-size-fits-all guided tour helps novices but frustrates advanced reviewers. The solution is adaptive scaffolding: start every module in guided mode, but provide a clearly labeled "Free Explore" toggle. Track prior module completions and quiz performance to determine whether the default should shift to free mode for returning users.

**SlateCamp design rule:** Every 3D module includes a persistent "Free Explore" toggle. After a student completes the guided path and scores ≥80% on the in-canvas quiz, subsequent visits to that module default to free exploration. Below that threshold, guided mode remains default.

### Seductive details steal attention from exam-relevant geometry

Rey's 2012 meta-analysis of **39 experimental effects** found seductive details produce a medium-sized negative effect on transfer performance — the exact type of deep understanding architecture licensure requires. Sundararajan and Adesope (2020) confirmed this across **58 studies and 7,500+ students**, finding the effect is *more* detrimental when backtracking is allowed (inherent in free 3D navigation) and when learners have low prior knowledge (most licensure candidates on first encounter).

In a rich architectural 3D model, ornamental details — cornices, decorative moldings, landscape elements — function as seductive details. They are visually compelling but irrelevant to the building code question being tested. Eye-tracking studies (Sanchez & Wiley, 2006; Park et al., 2015) confirm that students with lower working memory capacity fixate more on seductive details, and more fixations correlate with poorer performance.

**SlateCamp design rule:** During guided sequences, non-exam-relevant geometry is visually suppressed — desaturated to 30% opacity or rendered in wireframe. Only the active code-relevant element appears at full color and opacity. In free exploration mode, full rendering returns, but hotspots remain visible as anchor points.

### Behavioral signals that trigger more or less guidance

Research on navigation behavior in virtual environments (Chen & Stanney, 1999; Otter & Johnson, 2000) identifies reliable behavioral indicators of disorientation. Adapted for a WebGL model viewer:

- **Rapid erratic rotation** (angular velocity above a threshold without pausing at any viewpoint for >1 second): disorientation. The student cannot locate relevant features.
- **Zoom cycling** (repeated zoom-in/zoom-out without dwelling): difficulty relating detail to whole structure.
- **No interaction for >10 seconds** after model load: overwhelm or uncertainty about how to start.
- **Direct zoom to a specific element within 3 seconds**: expert behavior. This student likely knows what they're looking for.
- **Systematic pause-rotate-pause pattern**: oriented exploration. No intervention needed.

Otter and Johnson (2000) found that **user self-reports of disorientation do not reliably correlate with actual disorientation** — behavioral telemetry is more accurate than asking users. The platform should track orbit velocity, zoom cycling frequency, time-to-first-hotspot-click, and viewpoint deviation from optimal paths.

**SlateCamp design rule:** If the system detects >90 seconds of erratic navigation without any hotspot engagement, it triggers a subtle intervention: the nearest unvisited hotspot pulses with a "Start here →" tooltip. At 180 seconds, the system offers an explicit "Switch to Guided Mode?" prompt.

---

## Section 2: The complete phase-by-phase learning path

### Phase 0 — Pre-load: the wiki primes the schema

Mayer's pre-training principle is supported in **13 of 16 experimental tests** with a **median effect size of d = 0.75** (Cambridge Handbook of Multimedia Learning). Students who know the names and characteristics of key components before encountering a complex system devote their cognitive resources to building a causal/spatial model rather than simultaneously constructing component models.

For SlateCamp, this means the Wiki article is not supplementary reading — it is the first phase of a deliberate cognitive sequence. The wiki should cover component names (e.g., "grab bar," "clear floor space," "door maneuvering clearance"), the code provision number (BP 344 Section X), and the critical dimensional thresholds — all *before* the 3D model loads.

Google's 2016 mobile research found **53% of mobile visits are abandoned if loading exceeds 3 seconds**. A progress bar triples user patience (University of Nebraska-Lincoln study). Harrison (2007) found bars that accelerate toward the end feel **11% shorter** than constant-speed bars.

The loading screen must serve double duty: reduce perceived wait time *and* deliver pre-training content. Display an accelerating progress bar, the model's file size ("Loading 3D model — 1.8 MB"), and rotate through 2–3 building code facts directly relevant to the module being loaded. This converts dead time into pre-training.

**Implementation spec:**
- **Trigger:** Student taps "Enter 3D Lab" from the wiki article.
- **System shows:** Full-screen loading overlay with (1) accelerating progress bar with percentage, (2) module title and code reference, (3) rotating pre-training tips: "BP 344 requires a minimum 1500mm turning radius for wheelchairs. You'll measure this in the model."
- **Asset budget:** ≤2 MB compressed (Draco + gzip). On conservative Philippine 4G (15–25 Mbps), this loads in 1–2 seconds. Progressive loading shows a low-poly silhouette at 0.5 seconds, full-quality model by 3–5 seconds.
- **Abort threshold:** If loading exceeds 8 seconds, display a "View as 2D" fallback button. Never leave the student staring at a spinner.

### Phase 1 — First contact: the canonical view anchors spatial understanding

Palmer, Rosch, and Chase (1981) established that a **three-quarter elevated view** (~30° above horizontal, ~30–45° off the primary axis) maximizes diagnostic information about a 3D object's structure and produces superior recognition performance across multiple studies. Top-down views are consistently the worst for object recognition (Warrington & Taylor, 1973). Human eye-level views are immersive but do not maximize structural information.

The model should appear in this canonical three-quarter view and hold still for **2–3 seconds** before any interaction prompts appear. Auto-rotation is risky — it can disorient users who haven't yet established a spatial reference frame. If used, it should be a single slow rotation (≤15°/second) that stops after one pass and can be immediately interrupted by touch.

All interactive elements should be **hidden** during this initial 2–3 second window. Siegel and White's (1975) spatial knowledge framework shows that landmark knowledge develops first — the student needs to register the overall building form before attending to specific elements. Showing all hotspots immediately creates visual clutter during the critical orientation window.

After the 2–3 second hold, a single **orientation anchor** appears: a human-scale figure or a "You are here" marker that establishes physical scale. For architecture models, a 1.7m human figure is the universal reference that connects abstract geometry to embodied experience.

**Implementation spec:**
- **Default camera:** Three-quarter elevated isometric view showing maximum building faces. For accessible toilet models: bird's-eye plan view (because this is how the student will see it on the exam).
- **First 2–3 seconds:** Model is static. No hotspots visible. No UI overlays except a subtle "Pinch to zoom, drag to rotate" tooltip that fades after 3 seconds.
- **At 3 seconds:** Human-scale figure fades in. First hotspot begins pulsing gently. A small "1/7" progress indicator appears (spatial contiguity: bottom of screen, within thumb zone).
- **No auto-rotate** for models under 20K triangles (simple enough to understand from one view). For complex models, a single 180° slow rotation over 4 seconds, stoppable by touch.

### Phase 2 — Orientation: building the mental map in 60 seconds

Kim and Bock's 2021 VR study (N=60) confirmed Montello's (1998) parallel acquisition model: landmark, route, and survey knowledge develop simultaneously but at different rates. Landmark knowledge forms fastest. The platform should exploit this by making the first interactive act a landmark identification task — tap the most prominent structural element.

Research on disorientation thresholds, synthesized from the Southampton spatial anxiety study (2023) and Chen and Stanney's (1999) wayfinding model, suggests a window of approximately **30–90 seconds** before disorientation compounds into cognitive overhead and disengagement. Beyond 90 seconds of erratic behavior, the student is spending cognitive effort on navigation rather than content.

Navigational aids present a trade-off. Khan and Rahman (2017) found mini-maps improve navigation efficiency but **constrain spatial knowledge development**. For exam prep, spatial knowledge is the product — not navigation efficiency. The optimal approach is a **reset-to-default-view button** (low cognitive cost, high disorientation recovery value) plus **preset architectural view buttons** (plan, section, elevation) rather than a persistent mini-map.

**Implementation spec:**
- **10–60 seconds:** The system presents 2–3 preset view buttons in the bottom toolbar: "Plan," "Section," "3D" (the default). Tapping any button smoothly animates the camera to that standard architectural view. This simultaneously teaches the student to think in plan/section/3D — the exact cognitive skill the ALE tests.
- **Orientation task:** Before guided discovery begins, the student is prompted to tap one visible landmark element (e.g., "Tap the main entrance door"). This single interaction confirms the student can navigate the touch interface and has registered the building's primary spatial anchor.
- **Disorientation detection:** If >30 seconds pass with no interaction, the nearest hotspot pulses. If >60 seconds pass with erratic rotation, a "Reset View" button highlights with a glow animation.
- **No mini-map.** No compass. These add extraneous load without serving the learning objective. The preset view buttons *are* the navigational aid — and they map directly to the way architects think.

### Phase 3 — Guided discovery: the 3–5 minute core learning sequence

Mayer's signaling principle (median **d = 0.76–1.00** in his own lab; **d = 0.46** in broader reviews) directs the core mechanism: highlight the active element, dim everything else. But Stull and Mayer (2007) found that with 27 graphic organizers, the signaling effect vanished entirely (d = −0.03). With 10, it was strong (d = 0.45). **Signaling must be used in moderation** — more is not better.

The contiguity principle (spatial: **g = 0.63**, Schroeder & Cenkci 2018 meta-analysis of 58 comparisons; temporal: **d = 1.30**, Mayer 2017) dictates that annotations must appear *adjacent to and simultaneous with* the 3D element they describe. A 2019 study in Frontiers in Education found an **inverse U-shaped** relationship: labels too close obscure the element; labels too far create split attention. Medium distance via leader lines is optimal.

**Implementation spec for the hotspot sequence:**

**Hotspot reveal method:** Progressive, numbered sequence. Not all-at-once (cognitive overload per Stull & Mayer). Not hidden-until-discovered (becomes a treasure hunt that wastes time on search rather than learning). **3–5 hotspots visible at any time**, with a clear numbered sequence (1 → 2 → 3) and a progress indicator ("3 of 7").

**Per-hotspot interaction cycle** (repeat for each hotspot):
1. **Camera auto-navigates** to an optimal view of the element (0.8-second smooth transition). Non-active geometry dims to 30% opacity.
2. **Annotation panel** appears via leader line from the element. Content: code reference (e.g., "BP 344 §6.3"), critical dimension (e.g., "≥900mm clear width"), and one sentence of explanation. No more than 40 words per annotation — the coherence principle demands ruthless editing.
3. **Student manipulates:** The orbit is constrained to ±45° around the current view. The student can zoom in/out and rotate within this constraint to examine the element from multiple angles. This constrains interactivity per Khooshabeh et al. (2008), who found constrained interfaces (1 DOF) produced **better** spatial understanding than unconstrained (3 DOF) because they force task-relevant information access.
4. **Advance trigger:** Student taps "Next" or swipes to proceed. The system does not auto-advance — pacing is student-controlled (autonomy per SDT). However, if a student lingers >45 seconds on a single hotspot with no interaction, a subtle "Ready for the next one? →" appears.

**Maximum simultaneous hotspots:** Never more than 5 visible at once. Research on visual search (Treisman, 1985) and cognitive load theory converge: **4 ± 1 chunks** is the working memory limit. Each visible hotspot consumes one chunk of attentional resource.

**Signaling technique:** The active hotspot glows with a colored ring (blue for informational, amber for "will be quizzed"). Inactive-but-visited hotspots show a muted checkmark. Unvisited future hotspots show a subtle numbered dot. This three-state visual system (active / completed / upcoming) maps to the student's progress without creating clutter.

### Phase 4 — Active manipulation: generation before instruction

The productive failure paradigm (Sinha & Kapur, 2021: **g = 0.87**) and the generation effect (Slamecka & Graf, 1978: **up to 40% recall improvement**) converge on a clear design principle: students who generate errors before receiving correct information learn more deeply than students who receive instruction first.

For SlateCamp's parametric sliders, this means the student should **set a dimension first, see whether it violates the code, and then receive the correct value** — not the reverse. Kapur (2012) found that the *number of student-generated solutions* significantly predicted learning outcomes. Multiple attempts amplify the effect.

**Slider design specs:**

**Range:** Constrain the slider to **±30% around the critical code threshold.** A fully open range (e.g., 0 to 10,000mm) wastes time on obviously wrong values and doesn't create meaningful decisions. A range of ±30% around the threshold (e.g., for a 900mm minimum door width, show 630mm–1170mm) ensures every slider position creates a meaningful "compliant or not?" decision.

**Color feedback:** Green for compliant, red for non-compliant, **amber for within 10% of the threshold** ("close but check your code"). The amber zone is critical — it prevents binary thinking and reflects the reality that code compliance sometimes involves judgment. Research on color-coded feedback (Frontiers in Psychology, 2021: N=42) found color coding reduces cognitive load (smaller pupil diameter, shorter fixation duration) and improves learning performance. Colorblind accessibility: supplement color with icons (✓, ✗, ⚠) and pattern fills.

**Desirable difficulty calibration:** Bjork's framework specifies that tasks should produce errors **20–40% of the time** for optimal long-term retention. For the first attempt at a slider task, most students should get it wrong (the system should not hint at the correct value beforehand). For the second attempt (after feedback), most should get it right. This error-then-success pattern is the "desirable difficulty" sweet spot.

**Violation visualization:** When a dimension is non-compliant, the affected geometry highlights red and a brief animation shows *why* it fails — e.g., a wheelchair avatar attempting to pass through a door that's too narrow, visibly unable to fit. This converts an abstract number (900mm) into an embodied spatial consequence. Research on the Aha! moment (Becker et al., 2025) shows insight moments **nearly double memory retention** — and the moment a student sees *why* a dimension matters spatially is precisely this kind of insight.

**Implementation spec for the manipulation phase:**
1. **Prompt:** "Set the door clear width to what you think BP 344 requires." Slider appears, set to a random starting position within the ±30% range.
2. **Student drags slider.** Model geometry updates in real-time. No color feedback yet — let the student commit to a value.
3. **Student taps "Check."** If non-compliant: geometry turns red, brief violation animation plays, correct value appears with code citation. If compliant: geometry turns green, "Correct — BP 344 §6.3 requires ≥900mm" appears.
4. **Second attempt offered** (optional): "Try again?" resets the slider. The generation effect is strongest with multiple attempts.
5. **Transition to quiz:** After all manipulation tasks are complete, a "Test yourself →" button appears.

### Phase 5 — In-canvas quiz: retrieval in spatial context

Context-dependent memory (Godden & Baddeley, 1975) produces a small but reliable benefit for free recall (**d ≈ 0.25**, Smith & Vela 2001 meta-analysis) — but crucially, **not for recognition** (Godden & Baddeley, 1980). This means keeping the 3D model visible during quizzing helps recall-type questions but doesn't help multiple-choice recognition questions.

However, Agarwal et al. (2008) found that open-book quiz conditions led to **more forgetting over one week** compared to closed-book conditions. When the 3D model is visible and annotated during a quiz, it functions as an open-book test — the student can look up the answer rather than retrieving it from memory, which defeats the retrieval practice benefit.

The resolution: **show the 3D model but hide all annotations, labels, and dimension callouts during quiz mode.** This preserves spatial context (encoding specificity) while forcing genuine retrieval (the testing effect). The model provides spatial cues — "That's the door I examined" — without providing the answer — "The minimum width is 900mm."

**Quiz format hierarchy** (from most to least effective for spatial learning):

1. **Slider-adjust** ("Drag the door width to the minimum BP 344 requires"): Highest generation effort. The student must recall the exact number and produce it through physical action. Motor-spatial encoding reinforces verbal-numerical encoding.
2. **Hotspot-click** ("Tap the element that violates the fire egress code"): Requires spatial discrimination — the student must identify *which* element in a visual field is non-compliant. Tests spatial memory, not just factual recall.
3. **Multiple-choice overlay** ("What is the minimum clear width for an accessible corridor?"): Lowest spatial engagement. Use only for factual/declarative questions that don't have a spatial component.

**Implementation spec:**
- **Quiz mode transition:** All annotations fade out. The model dims slightly to indicate a mode change. A quiz panel appears as a bottom sheet (within the thumb zone on mobile). The 3D model remains visible and interactive above the quiz panel.
- **Question types:** Mix slider-adjust (40%), hotspot-click (40%), and multiple-choice (20%) within each quiz set. This interleaving (Pan et al., 2019: **d = 0.67** for discriminative learning) forces varied retrieval modes.
- **Number of questions:** 5–7 per module. More produces fatigue without proportional retention gains for a single session.
- **No second attempts during quiz.** The generation phase (Phase 4) is where multiple attempts belong. The quiz phase is for retrieval practice, which works best as a single retrieval attempt followed by feedback.

### Phase 6 — Feedback and exit: consolidating the spatial schema

For spatial tasks, immediate feedback is critical. Maddox et al. (2003) found that learning multidimensional spatial rules was **impaired by feedback delays as short as 2.5 seconds**. Spatial working memory decays rapidly — by the time delayed feedback arrives, the spatial representation has already faded.

Immediate feedback should include three components: (1) visual highlight on the 3D model showing the correct element/dimension, (2) the correct value with code citation, and (3) a brief explanation of why. Pashler et al. (2005) found that showing the correct answer immediately **greatly improved retention** on a one-week delayed test.

The exit moment must leave the student with a consolidated mental model, not just a feeling of having explored something. Two mechanisms accomplish this:

**Exit summary screen:** A single view showing all examined elements with their critical dimensions overlaid — a "cheat sheet" view of the 3D model that the student can screenshot. This leverages the dual-coding advantage and provides a visual retrieval cue for future study.

**Spaced repetition bridge:** Auto-generate flashcards from the module's key dimensions and violations. Schedule retrieval at **1 day, 3 days, 7 days, and 14 days** — the spacing intervals supported by Cepeda et al.'s 2006 meta-analysis of 254 studies showing **10–30% retention improvement**.

**Implementation spec:**
- **After each quiz answer:** Immediate feedback (≤0.5 seconds). Correct: green flash + "✓ Correct — 900mm per BP 344 §6.3." Incorrect: red flash + the correct answer with the same format. Camera auto-navigates to the relevant element in the 3D model during feedback.
- **Module completion screen:** Summary card showing (1) score (e.g., "5/7"), (2) thumbnail of the 3D model from canonical view, (3) list of key dimensions with ✓/✗ marks, (4) "Review in Wiki →" button linking to the specific section, (5) "Add to Flashcards" auto-toggle (default ON).
- **Return to wiki:** The wiki article re-opens scrolled to the section corresponding to the 3D module just completed, with the key dimensions highlighted. This closes the Wiki → 3D Lab → Quiz → Wiki loop.

---

## Section 3: When 3D actually outperforms 2D

### The dimensional congruence principle

The Yamada and Hirokawa (2015) meta-analysis of 36 studies (N=2,226) established the critical distinction: 3D yields **d = 0.50 for spatial knowledge** but only **d = 0.30 for factual knowledge**. The benefit of 3D is almost twice as large when the learning objective is spatial understanding versus factual recall. This is the primary selection criterion: if the learning objective requires understanding spatial relationships, 3D is justified. If it requires memorizing a code number, 3D adds extraneous load without proportional benefit.

A 2019 Nature EEG study confirmed that exclusive use of 3D models should be avoided; teaching that includes **both 2D and 3D models** promotes generalization by forcing students to practice dimensional translation — exactly the skill the ALE tests. The Ohio State scaffolded VR training (2025) achieved equivalent learning in 360 minutes of 3D-to-2D bridged instruction versus 900 minutes of paper-only instruction.

### Decision framework applied to ALE content

**BP 344 accessible toilet layout — USE 3D (high benefit).** Clearances, door swing radii, grab bar placement, and wheelchair turning radii are inherently three-dimensional spatial reasoning tasks. A 2D floor plan shows the dimensions but not the *experience* of navigating the space. The 3D model with a wheelchair avatar attempting to maneuver demonstrates *why* each clearance matters. The parametric slider for door width produces the Aha! moment when the avatar can't pass through.

**PD 1096 stairway rise/run — USE HYBRID (moderate benefit).** Rise and run are essentially 2D section concepts. The 3D model adds value for headroom clearance, winder geometry, and understanding how the stair relates to the floor-to-floor height. Implementation: show a 2D annotated section alongside the 3D model, with the 3D model providing context and the 2D section providing the exam-format view.

**RA 9514 fire egress travel distance — USE ENHANCED 2D (low 3D benefit).** Travel distance is measured in plan. A color-coded 2D floor plan with distance measurements is more directly useful than a 3D model, because the exam tests this knowledge in plan format. Use 3D only for the stair-to-corridor transition where vertical relationships matter.

**Classical orders (Doric, Ionic, Corinthian) — USE 3D FOR INITIAL ENCODING, 2D FOR REVIEW.** Column entasis, capital depth, and fluting are genuinely three-dimensional. But proportional systems are ultimately expressed in 2D elevation on the exam. Use 3D for the initial "wow, that's what entasis looks like" moment, then transition to 2D proportional diagrams for study.

**Structural load path in RCC frame — USE 3D (high benefit).** Understanding how loads travel from roof slab through beams to columns to footings is fundamentally spatial and sequential. A 3D force visualization with animated load arrows is categorically superior to a 2D force diagram for building the mental model of load distribution. This is where 3D earns its highest return.

### The transfer problem and how to solve it

The critical risk: students who learn spatial knowledge in 3D may struggle to retrieve it when the exam presents 2D drawings. Barr et al.'s representational flexibility account (2010) highlights that 2D-to-3D transfer requires cognitive matching between encoding and test dimensions.

**SlateCamp design rule:** Every 3D module must include a **3D-to-2D bridge moment** before the exit quiz. After the 3D exploration phase, the system transitions to a 2D architectural drawing (plan, section, or elevation) of the same element just studied in 3D. The quiz includes at least one question presented in 2D format. This explicit dimensional bridging ensures the spatial knowledge encodes in both 3D and 2D representational formats.

---

## Section 4: Spatial ability gaps and adaptive UX that closes them

### 3D helps low-spatial students — but only when guided

Two competing hypotheses exist in the literature. The **ability-as-compensator** hypothesis (Höffler & Leutner, 2011; Münzer, 2015) holds that dynamic 3D visualizations compensate for low spatial ability by providing external spatial representations. Münzer found mental rotation ability explained **r² = 0.52** variance in learning from static pictures but only **r² = 0.12** from animations — the animation supplanted the mental rotation the student couldn't perform internally.

The **ability-as-enhancer** hypothesis (Huk, 2006) holds that only high-spatial learners benefit from 3D because they have cognitive capacity to spare for model construction. Huk found 3D models enhanced cell biology learning **only** for high-spatial learners.

The resolution is elegant: **when 3D is freely manipulable, the enhancer hypothesis holds (low-spatial learners get overwhelmed). When 3D is guided and constrained, the compensator hypothesis holds (3D helps low-spatial learners by supplanting mental transformation).** This directly validates SlateCamp's guided discovery default.

### Detecting spatial ability from behavior, without a pre-test

Keehner et al. (2008) found that high-performing interactors pause at **key views** and make **"wobbling" movements** around optimal orientations — small adjustments to find the best angle. Low-spatial users make more erratic, non-systematic rotations. Drey et al. (2023, CHI, N=66) confirmed that higher spatial abilities correlate with shorter task completion time and more targeted manipulations.

SlateCamp can classify users into three profiles (derived from Nasiri et al., 2023's latent profile analysis) based on first-session behavior:

- **Proficient navigators:** Reach first hotspot in <15 seconds. Systematic orbit pattern. Direct zooms. → Reduce scaffolding, enable free explore earlier.
- **Landmark-dependent navigators:** Reach first hotspot in 15–45 seconds. Respond well to orientation aids. → Maintain guided mode with preset view buttons.
- **Persistently disoriented:** Reach first hotspot in >45 seconds or fail to engage. Erratic rotation throughout. → Add extra scaffolding: auto-camera navigation, constrained orbit axes, 2D fallback option.

**SlateCamp design rule:** Track time-to-first-hotspot, orbit angular velocity variance, and zoom-to-relevant-element rate across the first two sessions. Use these metrics to assign an internal spatial comfort score. High-comfort users see fewer navigational aids and shorter guided sequences. Low-comfort users see persistent preset view buttons, auto-camera options, and an always-visible "View as 2D" toggle.

### Adaptations that help without patronizing

Garg et al. (1999, 2002) found that multiple views of anatomy **handicapped** low-spatial/low-knowledge learners while helping high-knowledge learners. The combination of low spatial ability AND low domain knowledge creates the highest overload risk. For these students, the 3D model needs maximum constraint: locked orbit axes (plan/section/elevation only), no free rotation until they demonstrate competence, and persistent 2D reference drawings alongside the 3D viewport.

For high-spatial/high-knowledge students, these same constraints feel like handcuffs. The adaptive approach: **start constrained, progressively unlock.** After the student completes the guided sequence and scores well on the quiz, new capabilities become available: free orbit, section-cut tools, exploded views. This mirrors game design's progressive skill unlock pattern and satisfies SDT's competence need — each unlock signals growing mastery.

---

## Section 5: Behavioral science levers for deeper encoding

### Designing for the Aha! moment

Becker et al. (2025, Nature Communications) used fMRI to demonstrate that insight moments trigger a burst of hippocampal activity and **nearly double subsequent memory retention.** The Aha! moment is not merely pleasant — it physically reorganizes neural representations in the visual cortex, creating a stronger and more durable memory trace.

In 3D architecture education, the Aha! moment occurs when a student suddenly grasps *why* a spatial relationship matters — seeing a wheelchair unable to turn in a too-small radius, watching a load path transmit forces from roof to footing, realizing that a fire exit is too far from the farthest occupied point. These moments cannot be lectured into existence. They emerge from confrontation with a spatial problem followed by sudden resolution.

**SlateCamp design rule:** Every 3D module must contain at least one **perceptual challenge** — a moment where the spatial relationship is initially non-obvious, and the student must manipulate the model or trigger a visualization to understand it. The challenge should be calibrated so that 60–70% of students experience the insight within 30 seconds of manipulation (matching the eureka rate found in PMC's 2024 geodesics study). Design the moment, not just the content.

### Flow state through adaptive difficulty

Csikszentmihalyi's flow model requires challenge-skill balance, clear goals, and immediate feedback — all achievable in a 3D educational environment. Oliveira et al. (2021) found that behavioral log data can predict flow states, with challenge-skill balance showing the strongest correlation with sustained engagement.

The difficulty gradient for a single SlateCamp module: Phase 1-2 (orientation) is trivially easy — just look. Phase 3 (guided discovery) is moderately easy — follow directions. Phase 4 (active manipulation) introduces the first real challenge — predict the correct value. Phase 5 (quiz) is the peak difficulty — recall without annotations. This gradient matches the progressive challenge escalation that maintains flow.

**SlateCamp design rule:** If a student scores 100% on the in-canvas quiz, the next module they enter should start with a shorter guided sequence and harder manipulation tasks (e.g., multiple violations to find simultaneously). If they score below 50%, the next module adds extra pre-training and more hotspots in the guided phase. This adaptive loop maintains the challenge-skill balance that sustains flow.

### Surprise as an encoding amplifier

Ballarini et al. (2013) demonstrated in real primary school settings that a surprising, unexpected experience one hour before or after a lesson **significantly improved long-term memory** for the lesson content. Axmacher et al. (2010, Neuron) showed unexpected stimuli enhance hippocampal encoding potentials.

Not every hotspot in a 3D model should be predictable. Some should reveal **surprising, counter-intuitive, or emotionally resonant information**: "This ceiling height was mandated after the 1972 Ozone Disco fire killed 162 people" or "This seemingly decorative column actually carries 40% of the roof load." Foster and Keane (2018) found that **highly surprising outcomes that require explanatory effort** are recalled most accurately.

**SlateCamp design rule:** Approximately 1 in 5 hotspots should contain a "surprise" element — a historical fact, a counter-intuitive code requirement, a real-world failure case. These are flagged with a distinct visual style (e.g., a ⚡ icon instead of the standard 📍). They create variable ratio reinforcement: the student never knows which hotspot will contain the surprising information, maintaining exploratory engagement (Skinner's variable ratio schedule produces the highest and most extinction-resistant response rates).

### Self-determination theory as a UX checklist

SDT predicts three needs: autonomy, competence, and relatedness. Wang et al. (2022) found **competence has the strongest impact** on motivation in mathematics education, stronger than autonomy or relatedness.

- **Autonomy:** The student controls pace (no auto-advance), chooses when to switch between guided and free mode, and selects which module to study next. Mandatory sequences undermine autonomy.
- **Competence:** Progress indicators ("3 of 7 elements explored"), mastery badges, and the visible transition from guided to free mode signal growing competence. The interface must never make the student feel incompetent at *navigation* — only appropriately challenged by *content*. If a student struggles with touch gestures, that erodes competence feelings about the entire platform.
- **Relatedness:** Display "247 reviewers studied this module this week." Link discussion forums to specific 3D models. Show leaderboard position within a cohort. Even asynchronous social presence satisfies relatedness.

---

## Section 6: Measuring whether 3D actually works

### Behavioral metrics that predict exam transfer

The 2026 VR behavioral metrics study (N=125 medical students, ScienceDirect) found that **greater head/camera movement correlates with higher cognitive engagement** (germane load), while **increased aimless hand movement correlates with lower intrinsic motivation** (frustration). Movement entropy predicts curiosity-driven exploration.

For SlateCamp's WebGL environment, the analogous metrics are:

- **Rotation coverage:** What percentage of the model's viewable sphere did the student explore? Higher coverage = more thorough spatial encoding. Target: >60%.
- **Zoom-to-element rate:** How often does the student zoom directly to a relevant element vs. zooming randomly? Higher rate = more targeted, expert-like behavior.
- **Hotspot dwell time:** Time spent reading each annotation. Very short (<2 seconds) = skimming. Very long (>30 seconds) = confusion. Sweet spot: 5–15 seconds.
- **Revisit behavior:** Returning to previously examined elements indicates self-directed retrieval practice — one of the strongest predictors of long-term retention per Roediger and Karpicke (2006).
- **Error curve slope:** Decreasing errors across manipulation tasks within a session indicates active learning. Flat error curves may indicate guessing.

### A/B test design for the 3D Lab

Kraft's (2020) recalibrated benchmarks for education interventions redefine "medium" as **0.05–0.20 SD** — far smaller than Cohen's classic 0.50. Over **36% of education RCTs** produce effects below 0.05 SD. SlateCamp should not expect transformative effect sizes from any single feature.

**Recommended A/B test protocol:**
- **Design:** Pre-test → intervention → immediate post-test → 1-week delayed post-test → correlation with actual ALE scores (if available).
- **Conditions:** (A) Interactive 3D Lab + guided discovery, (B) Static 2D annotated diagrams + same content, (C) 3D Lab + free exploration (to isolate the guidance effect from the 3D effect).
- **Sample size:** For **d = 0.40** (realistic for a well-designed 3D intervention) with 80% power at α = 0.05: **~100 participants per group (300 total).** For d = 0.20: ~394 per group. Start with the d = 0.40 target.
- **Controls:** Stratify randomization by spatial ability (brief mental rotation pre-test), year level (2nd–5th year), and prior exam attempts.
- **Outcome measures:** (1) Immediate recall of code dimensions, (2) spatial transfer (answering questions about a *different* building using the same code), (3) 2D exam-format questions (to test 3D→2D transfer), (4) 1-week delayed recall.

---

## Section 7: Mobile-first 3D on Philippine mid-range Android

### Touch-based interaction is viable — with constraints

Besançon et al. (2017, CHI) compared mouse, touch, and tangible input for 3D tasks (N=36): **all three provide similar precision** but touch is rated as more direct and intuitive. For students with lower spatial abilities, direct manipulation (touch) may actually be *more* beneficial than indirect manipulation (mouse) because the biomechanics more closely resemble physical object manipulation.

The critical constraint: **gesture conflicts.** Pinch-to-zoom on the 3D canvas must not trigger browser zoom. Drag-to-rotate must not trigger page scroll. Implementation: `touch-action: none` on the canvas element, with the 3D viewport occupying ≥85% of screen height in landscape or ≥70% in portrait.

**One-thumb navigation design:** Steven Hoober's research shows 49% of users hold phones with one hand; 75% of interactions are thumb-driven. All controls must sit in the **bottom third of the screen** (the green thumb zone). The 3D viewport occupies the upper 70%; a slim bottom toolbar holds preset view buttons, the hotspot sequence indicator, and the quiz trigger. Information panels use a **bottom sheet** pattern (swipe up to expand, swipe down to dismiss).

### Performance budgets for the target device

The median SlateCamp device is a Samsung Galaxy A14 or equivalent: **4 GB RAM, Adreno 619 / Mali-G57 GPU, 6.5" FHD+ screen, MediaTek Dimensity or Snapdragon 680 chipset.**

| Parameter | Target | Hard minimum |
|-----------|--------|-------------|
| Scene triangle count | 20,000–50,000 | <100,000 |
| Compressed model size | <1 MB | <3 MB |
| Sustained frame rate | 45–60 FPS | 30 FPS |
| Initial content visible | <2 seconds | <3 seconds |
| Full model loaded | <5 seconds | <8 seconds |
| Draw calls per frame | <100 | <300 |
| Texture resolution | 512px | 1024px max |
| Renderer pixel ratio | 1.0–1.5 | Never above 2.0 |
| Total scene memory | <150 MB | <256 MB |

**Critical optimizations:** Use Draco compression (**80–95% geometry size reduction**). Use `MeshLambertMaterial` instead of `MeshStandardMaterial` for non-hero elements. Bake lightmaps instead of real-time shadows. Use `frameloop="demand"` in React Three Fiber to render only on interaction (critical for battery life). Use Drei's `<PerformanceMonitor>` to dynamically lower DPR when frame rate drops below 30 FPS.

**Progressive loading pattern:** React Suspense with nested fallbacks. At 0 seconds: loading overlay with progress bar + pre-training tips. At 0.5 seconds: low-poly bounding box silhouette. At 2 seconds: medium-poly model with basic materials. At 5 seconds: full-quality model with textures. Each stage is independently useful — a student should never see a blank screen.

**Data sensitivity:** Filipino students commonly use prepaid data plans (2 GB for ₱50, valid 3 days). Each 3D module should consume **<3 MB total** (model + textures + code). Cache loaded models in IndexedDB via a Service Worker so returning visits cost zero data.

### When rendering fails: the graceful degradation path

If WebGL initialization fails or sustained frame rate drops below 15 FPS (detected via `PerformanceMonitor` after 5 seconds of rendering), the system must **automatically fall back to a pre-rendered image sequence** — 36 images at 10° intervals around the model, displayed in a swipe-to-rotate carousel. This preserves spatial exploration (the student can see the model from multiple angles) without requiring GPU rendering. Hotspots overlay as HTML elements on the images.

This is not a secondary experience — it is the primary experience for the lowest-end devices in the cohort. **Design it first.**

---

## Master decision tree 1: Should this learning objective use 3D?

```
START: What is the learning objective?
│
├─ Memorize a code number, section reference, or definition
│  → NO 3D. Use wiki text + flashcard. 3D adds extraneous load (d = 0.30 factual
│    vs. d = 0.50 spatial benefit, Yamada 2015).
│
├─ Understand a spatial relationship (clearances, setbacks, load paths)
│  │
│  ├─ Is the relationship inherently 3-dimensional?
│  │  (e.g., requires understanding of height + width + depth simultaneously)
│  │  → YES: Use interactive 3D model.
│  │
│  └─ Can the relationship be fully expressed in a single 2D view?
│     (e.g., rise/run in section, travel distance in plan)
│     │
│     ├─ Is the 2D representation the same format used in the exam?
│     │  → Use enhanced 2D as primary, with optional 3D for context.
│     │
│     └─ Does understanding require seeing the element from multiple angles?
│        → Use 3D with mandatory 3D-to-2D bridge before quiz.
│
├─ Identify a violation in a complex assembly
│  (e.g., multiple code requirements interacting in one space)
│  → YES: Use 3D. Violations at the intersection of multiple spatial
│    requirements are where 3D most outperforms 2D.
│
└─ Compare proportional systems across elements
   (e.g., classical orders, structural member sizing)
   → Use 3D for initial encoding (the Aha! moment), then 2D proportional
     diagrams for study and review. 3D comparison models side-by-side.
```

## Master decision tree 2: Guided or free exploration?

```
START: Who is this student and what is their history?
│
├─ First time viewing this module?
│  │
│  ├─ Student has completed <3 modules total on the platform
│  │  → FULL GUIDED MODE. Sequential hotspot reveal. Constrained orbit.
│  │    Preset view buttons prominent. No free explore toggle visible
│  │    until guided sequence completes.
│  │
│  └─ Student has completed ≥3 modules with average quiz score ≥70%
│     → ABBREVIATED GUIDED MODE. Camera navigates to first hotspot,
│       remaining hotspots visible but not sequentially locked.
│       Free explore toggle visible from the start.
│
├─ Returning to a previously completed module?
│  │
│  ├─ Previous quiz score <80%
│  │  → GUIDED MODE default (re-learning path). Hotspot sequence focuses
│  │    on previously missed questions only.
│  │
│  └─ Previous quiz score ≥80%
│     → FREE EXPLORATION default. All hotspots visible. Quiz available
│       immediately. This is a review session, not a learning session.
│
└─ Behavioral override (real-time):
   │
   ├─ >90 seconds of erratic navigation with no hotspot engagement
   │  → System suggests switching to guided mode.
   │
   ├─ Student in guided mode clicks "Skip" on 3+ consecutive hotspots
   │  → System suggests switching to free explore mode (expertise reversal
   │    signal — guidance is becoming redundant).
   │
   └─ Student in free explore zooms directly to 3+ correct elements
      in sequence → Confirm free explore. Reduce UI scaffolding further.
```

---

## Research gaps and honest uncertainties

Several design decisions in this spec rest on extrapolation rather than direct evidence.

**No study directly compares guided vs. free exploration in a WebGL architecture model viewer.** The evidence base comes from VR anatomy, general multimedia learning, and hypertext navigation research. The architectural education context has unique characteristics (standardized dimensional requirements, professional licensing stakes, mixed media exam format) that may moderate effects in unpredictable ways. The A/B test design in Section 6 is essential — not optional.

**The 90-second disorientation threshold is synthesized, not empirically established.** It derives from the Southampton spatial anxiety study's 4-minute experimenter intervention threshold, Chen and Stanney's wayfinding model, and general UX abandonment research. The actual threshold for a mobile WebGL model viewer may be shorter (smaller screen = faster disorientation) or longer (architecture students have above-average spatial training).

**Context-dependent memory effects are smaller than originally thought.** The Godden and Baddeley (1975) underwater study is iconic but the Murre (2021) replication failed to replicate the effect, and the Smith and Vela (2001) meta-analysis puts the effect at only d ≈ 0.25 for free recall with no effect on recognition. The in-canvas quiz design is still justified by retrieval practice benefits, but the context reinstatement benefit may be negligible.

**Touch vs. mouse equivalence for spatial encoding is under-researched.** Besançon et al. (2017) compared precision and speed but not spatial memory formation. It is plausible that the smaller field of view and lower precision of touch-based orbit produces inferior spatial schemas compared to mouse-based orbit. Monitor the behavioral metrics closely for touch-only users.

**The productive failure effect (g = 0.87) may be inflated by publication bias.** Sinha and Kapur (2021) estimated this after accounting for publication bias, but the corrected estimate is based on modeling assumptions. The true effect is likely positive but may be closer to g = 0.40–0.60. Still strong enough to justify the generation-before-instruction design.

These gaps do not undermine the overall architecture of the spec. They define the measurement priorities: instrument every phase transition, log every behavioral signal, and run the A/B tests as soon as the user base supports statistical power. The spec is a hypothesis. The data will confirm, modify, or reject each decision. Build to measure.
