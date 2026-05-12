# SlateCamp: Features to Win — Research-Backed Gap Analysis

**Date:** March 26, 2026
**Basis:** Current codebase audit + learning science research synthesis

---

## Part 1: Features Needed to Ensure Users Win

Organized by the cognitive mechanism they serve, grounded in evidence.

---

### A. METACOGNITIVE CALIBRATION (The #1 Predictor of Exam Success)

Research is unequivocal: students who can accurately judge what they know vs. don't know outperform those who can't — regardless of total study hours. Low-performers remain confidently overconfident across an entire semester without intervention (Miller & Geraci, 2011). SlateCamp must be a calibration machine.

**Built:**
- [x] Readiness Score with anti-inflation mechanics
- [x] Lucky Guess Detector (spec complete, implementation pending)
- [x] Confidence tracking in quiz interactions

**Must Build:**

- **Pre-Session Prediction Prompt** — Before every Storm/Full Exam session, ask: "What score do you predict?" After results, show predicted vs. actual side by side. Research shows that the act of predicting + receiving feedback is the single most effective calibration intervention (effect size g = –0.75). This is a 2-hour feature with massive impact.

- **Confidence-Weighted Scoring in Feedback** — After each question, students rate confidence (Low / Medium / High). The feedback panel then shows a 2×2 matrix: Confident+Correct (solid knowledge), Confident+Wrong (dangerous overconfidence), Unconfident+Correct (underconfidence), Unconfident+Wrong (known gap). The "Confident+Wrong" quadrant is the kill zone — these topics get priority in Focus Review.

- **Calibration Score (parallel metric to Readiness Score)** — A running measure of how well the student's confidence tracks their actual performance. Display as a calibration curve on the Analytics Dashboard. Students with high Readiness + high Calibration are truly ready. Students with high Readiness + low Calibration are at risk of exam-day surprise.

- **Post-Exam Postdiction** — After completing Storm or Full Exam Simulation, before seeing results: "How do you think you did?" Compare postdiction to prediction to actual. Track improvement in calibration accuracy over time.

---

### B. RETRIEVAL PRACTICE ARCHITECTURE (Effect Size d = 0.68)

Retrieval practice is the highest-utility learning strategy with decades of replication. SlateCamp's quiz engine IS retrieval practice — but several amplifiers are missing.

**Built:**
- [x] 9 quiz modes with varied feedback timing
- [x] IRT-based question selection
- [x] SM-2 spaced repetition
- [x] Rationale blocks for every option

**Must Build:**

- **Pre-Questions Before Wiki Reading** — When a student opens a Wiki article, surface 3–5 questions about that topic BEFORE they read. Research shows prequestions with feedback amplify learning by effect size g = 1.25 (meta-analysis, 2026). The student answers from prior knowledge, gets brief feedback, THEN reads. This primes retrieval pathways before encoding.

- **Retrieval Practice Prompts Inside Wiki Articles** — Embed inline "pause and recall" prompts every 800–1000 words in long articles. "Before you continue: What are the three requirements for…?" These aren't graded — they're retrieval interrupts that force the brain to reconstruct knowledge mid-reading rather than passively consuming.

- **Successive Relearning Mode** — A dedicated study loop: Student answers questions on a topic until they get 3 consecutive correct. The topic then enters a spaced schedule. If they fail on the spaced re-test, it resets to the successive relearning cycle. This is the gold standard protocol in cognitive psychology for durable learning.

- **Elaborative Retrieval Prompts in Rationales** — After showing the rationale for a wrong answer, add: "In your own words, why is [correct answer] right?" Free-text input (not graded by the system, self-assessed). The act of generating an explanation activates elaborative retrieval, creating multiple memory pathways (Carpenter, 2011).

- **Interleaved Topic Mixing in Camp Mode** — Currently Camp Mode focuses on selected topics. Add an "Interleave" toggle that mixes 70% selected topics with 30% related-but-different topics from the same subject area. Interleaving improves discriminative contrast between similar concepts (effect size d = 0.43). Architecture students frequently confuse related code provisions — interleaving fixes this.

---

### C. DESIRABLE DIFFICULTIES (The Counter-Intuitive Engine)

Learning that feels hard IS the learning. SlateCamp must engineer productive struggle.

**Built:**
- [x] IRT targeting P ≈ 0.75 (optimal challenge point)
- [x] Storm Mode with deferred feedback
- [x] Stamina analysis via Extended Practice

**Must Build:**

- **Generation Effect Questions** — Add a question type where the student must PRODUCE the answer (free-text, formula entry, or diagram selection) rather than recognize it from 4 choices. Research shows generation produces stronger memories than recognition (effect size d = 0.40+). Use for high-value code provisions, formulas, and design standards. Even just 10% of questions being generation-type would significantly boost retention.

- **Delayed Feedback Option in Camp Mode** — Currently Camp = immediate feedback. Add a "Challenge Mode" toggle within Camp that delays feedback until the end of a 10-question block. Delayed feedback forces the student to sit with uncertainty, which deepens encoding. The student self-selects the difficulty level.

- **Hybrid Block-Then-Interleave Scheduling** — For new topics the student has never seen, start with blocked practice (all questions on one topic). Once they hit 60% mastery on that node, automatically switch to interleaved practice mixing that topic with others. Research (Hwang, 2025) shows this hybrid approach outperforms pure interleaving for novices.

---

### D. SPACED REPETITION & FORGETTING CURVE (Effect Size d = 0.71)

**Built:**
- [x] SM-2 algorithm
- [x] SRS cards with due scheduling
- [x] EMA-based mastery decay
- [x] Focus Review nightly scan (spec complete, pending pg_cron)

**Must Build:**

- **Personalized Forgetting Rate** — SM-2 uses a fixed decay model. Upgrade to track individual forgetting rates per student per topic. Students who forget structural design faster than history get tighter review intervals on structural design, not a one-size-fits-all schedule. Use response time + accuracy to calibrate (the Slimstampen / ACT-R approach proven in university settings to predict exam grades).

- **Optimal Review Scheduling Dashboard** — Show students a "Review Calendar" — a visual daily plan showing which topics are due for review today, which are overdue (with decay percentage shown), and which are safe. Make it the default landing page. Students who see their forgetting in real-time act on it.

- **Memory Strength vs. Retrieval Strength Distinction** — Two separate indicators per node: Storage Strength (how deeply encoded — built through varied practice) and Retrieval Strength (how easily accessible — decays with time). A topic can have high storage but low retrieval (needs one review to restore). This distinction prevents students from re-learning topics from scratch that just need a quick refresh.

- **Cramming Detector + Intervention** — If the system detects a student doing 4+ hours of the same topic in one sitting, surface a coaching annotation: "Distributed practice is 2× more effective than cramming. Switch topics and return to this one tomorrow." Back it with the data: show their retention curve for crammed vs. spaced topics from their own history.

---

### E. FEEDBACK ARCHITECTURE (Effect Size d = 0.73 — Hattie's #1)

**Built:**
- [x] SME-written rationales for every option
- [x] Teleport Links to Wiki
- [x] Immediate/deferred feedback by mode

**Must Build:**

- **Wrong Answer Taxonomy** — Classify every wrong answer into a diagnostic category: Misremembered fact, Confused similar concepts, Computation error, Misread question, Random guess. Use the combination of time_spent_ms + which wrong option selected + difficulty to infer the error type. Surface it in the feedback: "This looks like a concept confusion between X and Y" with a link to the Wiki section that disambiguates them.

- **Feed-Forward Recommendations** — After every session, don't just show results. Show: "Based on this session, here are the 3 things to do next" — ranked by impact. E.g., "1. Re-read Wiki article on BP 344 Section 2 (you missed 3/3 questions). 2. Do a 10-question Camp session on accessible design (related weakness). 3. Review your notes on PD 1096 Rule 7 (last reviewed 18 days ago)." Every feedback moment should end with a clear next action.

- **Rationale Engagement Tracking** — Track whether students actually READ the rationale (scroll depth, time spent on feedback panel). Students who skip rationales after wrong answers learn 40% less from testing. If a student habitually skips rationales, surface a coaching message: "Students who read rationales improve 2× faster."

---

### F. EXAM SIMULATION & PRESSURE TRAINING

**Built:**
- [x] Storm Mode (60 min timed, 50 questions)
- [x] Full Exam Simulation (200 questions, 4 hrs)
- [x] 24-hour delayed diagnostic (spec complete, pending)

**Must Build:**

- **Progressive Pressure Ladder** — Don't jump from Camp (no timer) to Storm (full timer). Add intermediate pressure levels: (1) Visible timer, no penalty, (2) Timer + question time tracking visible, (3) Timer + per-question time limit. Gradually condition students to perform under time pressure without the anxiety cliff.

- **Exam-Day Simulation Protocol** — A full ritual: scheduled start time (student picks in advance), no pause, no phone-check prompts, ambient timer, real ALE question distribution, score revealed after 24 hours. Make it feel like the actual exam. Include a pre-simulation checklist (slept 7+ hours? ate? quiet space?) because exam performance is physiological, not just cognitive.

- **Post-Simulation Debrief** — After the 24-hour delay, don't just show scores. Show: (1) Where you lost the most points (by taxonomy node), (2) Your stamina curve (accuracy over time — where did fatigue hit?), (3) Your time allocation (which sections did you over/under-invest?), (4) Comparison to your predicted score. This is coaching, not just scoring.

- **Simulation Improvement Tracking** — Track performance across multiple Full Exam Simulations. Show a trajectory: Sim 1 score → Sim 2 score → Sim 3 score. Students need to see that the simulations ARE making them better. This is also a powerful marketing proof point.

---

### G. MOTIVATION & BEHAVIORAL SUSTAINABILITY

**Built:**
- [x] Camp Trails (guided study plans)
- [x] Streak tracking
- [x] Study Pods (group accountability)
- [x] No gamification / no shame language

**Must Build:**

- **Study Session Micro-Planning** — Before each session, ask: "How much time do you have? 15 min / 30 min / 60 min / 2+ hrs." Then auto-configure the optimal activity mix for that window. 15 min = quick retrieval quiz on weak nodes. 60 min = Wiki reading + quiz + review. This removes decision fatigue, which is the #1 reason students open the app and then close it.

- **Progress Proof Moments** — Monthly automated "progress report" showing: total questions answered, nodes moved from Red to Green, Readiness Score trajectory, calibration improvement. Frame it as evidence of effort, not badges. "You moved 12 topics from unknown to mastered this month." These become sharable social proof AND re-engagement tools.

- **Passer Outcome Correlation** — After the first ALE cycle, show: "Students who reached Readiness Score X had a Y% pass rate." This is the ultimate motivator — connecting their daily effort to actual outcomes. Gate this behind real data (don't fabricate).

- **Adaptive Daily Dose** — An AI-recommended daily session that accounts for: days until exam, current weak nodes, overdue SRS reviews, and stamina level. One tap to start. The student doesn't have to think about what to study — the system knows. Reduce friction to zero.

---

### H. AI TUTOR & CONTENT INTELLIGENCE

**Built:**
- [x] RAG pipeline architecture (planned)
- [x] Wiki content mapped to taxonomy
- [ ] Double-Pass LLM verification (spec complete, pending)
- [ ] Citation badges (spec complete, pending)

**Must Build:**

- **Socratic Error Exploration** — When a student gets a question wrong, offer an "Explore This" button that launches a Socratic AI conversation specifically about that error. The AI never reveals the answer — it asks guiding questions that lead the student to discover why their reasoning was wrong. This is situated learning at the point of failure.

- **Concept Confusion Detector** — Use aggregate wrong-answer data to identify the most commonly confused concept pairs across the student body. E.g., "72% of students who get PD 1096 Rule 7 wrong also get Rule 8 wrong." Build dedicated disambiguation Wiki sections and targeted quizzes for these pairs.

- **AI-Generated Mnemonics** — For high-value recall items (code values, formulas, lists), offer AI-generated mnemonics tailored to Filipino culture and context. "Remember the minimum stairway width for public buildings: 1,100mm — think 'one-one-oh, publiko, gora!'" Mnemonics with cultural hooks stick better.

---

### I. 3D LAB COMPLETION

**Built:**
- [x] React Three Fiber canvas with hotspots
- [x] Guided + free exploration modes
- [x] Parametric controls (sliders)
- [ ] Bounds breaking / Warm Red violation (spec complete, pending)

**Must Build:**

- **In-Lab Quiz Mode** — While exploring a 3D model, trigger quiz questions contextually. Student is examining a stairway → "What is the minimum clear width for this building type?" Answer correctly to unlock the next annotation. This is Level 3 Interactivity (the highest learning outcome per Moreno & Mayer).

- **Before/After Code Compliance Toggle** — Show the building in "as-designed" state vs. "code-compliant" state side by side or with a toggle. Students see exactly what changes when you apply the code. This visual diff is more powerful than any text explanation.

- **3D → Quiz → Wiki Loop** — Every 3D interaction should be closeable to a quiz question and a Wiki article. Student sees a parametric ramp → gets a quiz question on BP 344 ramp requirements → can teleport to the BP 344 Wiki article. The loop must be frictionless and bi-directional.

---

## Part 2: Data Science Visualizations

### For Students (Learning Utility)

These visualizations help students make better study decisions:

- **Calibration Curve** — Plot student's confidence (x-axis) vs. actual accuracy (y-axis) across all sessions. Perfect calibration = diagonal line. Show how far they deviate. Overconfident students see their curve bowing above the diagonal. Update weekly. This is the single most powerful metacognitive feedback tool in the research literature.

- **Personal Forgetting Curves** — Per taxonomy node, show the estimated memory decay curve based on their actual review history. "Your Structural Design knowledge decays to 50% after 14 days without review. Your History of Architecture holds at 80% for 30 days." Students learn their own memory profile.

- **Stamina Heatmap** — A time-series heatmap showing accuracy across a session: x-axis = question number, y-axis = sessions over time. Color = accuracy. Students see where fatigue hits and whether their endurance is improving over time.

- **Topic Difficulty vs. Mastery Scatter** — Plot every taxonomy node: x = IRT difficulty, y = student mastery. Quadrants: Easy+Mastered (move on), Easy+Weak (quick fix), Hard+Mastered (strengths), Hard+Weak (priority targets). Interactive — click any dot to launch a targeted session.

- **Study Velocity Tracker** — Rate of new nodes mastered per week over time. Shows acceleration or deceleration of learning. Coaching annotation: "You're mastering 4 nodes/week. At this pace, you'll cover the full syllabus by [date]." Or: "Your pace dropped — here's why [X nodes are stuck in Amber]."

- **Pacing vs. Accuracy Trade-off Curve** — Plot average time-per-question vs. accuracy across sessions. Show where the optimal point is (fast enough for the exam, accurate enough to pass). Many students are accurate but slow, or fast but inaccurate. This makes the trade-off visible.

- **Knowledge Network Graph** — Visualize taxonomy nodes as a network where edges represent co-failure (topics that students tend to get wrong together). Clusters of connected weak nodes are "concept gaps" — more meaningful than isolated topic scores.

- **Exam Countdown Dashboard** — Days remaining, projected Readiness Score at exam day (based on current trajectory), daily dose required to hit target, nodes remaining in Red/Grey.

---

### For Marketing & Commercialization (Dual-Use Visualizations)

These serve students AND function as marketing/sales tools:

- **Readiness Score Trajectory (Cohort Aggregate)** — Average Readiness Score growth over 12 weeks across all users. This is the hero chart for the pitch deck, the landing page, and every university sales meeting. "Our users gain an average of 25 points in 12 weeks." Show the curve with confidence bands.

- **Pass Rate Correlation Chart** — Scatter plot: Readiness Score at exam day vs. actual ALE result. When this data exists, it's the most powerful marketing asset in the entire company. "Students with Readiness Score ≥ 80 had a 94% pass rate." This chart sells the product.

- **Taxonomy Heatmap (Institutional View)** — For B2B: aggregate heatmap of an entire graduating batch. Red zones = where the school is failing its students. Show the Dean this visualization and the product sells itself. "70% of your batch is bleeding red in Structural Design."

- **Node Reclassification Rate Dashboard** — "X% of our users moved from Red to Green in 30 days." This is the proof that the platform teaches, not just tests. Use in landing page, pitch deck, partnership conversations.

- **Before/After Readiness Distribution** — Histogram showing Readiness Score distribution at signup vs. after 8 weeks. The rightward shift IS the product value proposition, visualized. Use in ads: "This is what 8 weeks of SlateCamp looks like."

- **Stamina Ceiling Growth Chart** — Average items-before-fatigue over time. "Our users can sustain focus for 30 more questions than when they started." This proves the platform builds exam endurance, not just knowledge. Unique to SlateCamp — no competitor measures this.

- **Calibration Improvement Arc** — Aggregate calibration accuracy improvement over time. "Students arrive overconfident by 25 points. After 6 weeks, their self-assessment accuracy improves by 60%." This is a story no competitor can tell because no competitor measures calibration.

- **Time-to-Mastery by Topic (Content Intelligence)** — Average hours/sessions to move a node from Red to Green, broken by topic. Sell this data to universities: "Structural Design takes students an average of 14 hours to master. Professional Practice takes 6. Here's where to allocate your curriculum." This is the beginning of the data licensing revenue stream.

- **Study Pattern → Outcome Correlation** — Visualization showing which study patterns (sessions per week, session length, mode distribution, spacing compliance) correlate with higher Readiness Scores. Use as coaching content AND as marketing: "Students who study 4x/week for 30 min outperform those who study 2x/week for 2 hours."

- **Geographic Performance Map** — If tracking school/region, show a Philippine map with average Readiness Scores by region or school. Institutional buyers want to benchmark. This visualization makes SlateCamp the scoreboard for ALE readiness nationally.

---

## Priority Ranking: What to Build First

| Priority | Feature | Effort | Impact | Why |
|----------|---------|--------|--------|-----|
| P0 | Pre-Session Prediction Prompt | 2 hrs | Very High | Cheapest, highest-impact calibration feature. Research effect size g = –0.75 |
| P0 | Confidence-Weighted Scoring (2×2 matrix) | 1 day | Very High | Turns every quiz into a metacognition trainer |
| P0 | Lucky Guess Detector (implement pending spec) | 1 day | Very High | Already specced. Blocks score inflation |
| P0 | Focus Review nightly scan (implement pg_cron) | 1 day | Very High | Already specced. Forces gap exposure |
| P0 | Feed-Forward Recommendations after sessions | 2 days | Very High | Eliminates "what do I do next?" paralysis |
| P0 | Adaptive Daily Dose | 3 days | Very High | Zero-friction daily engagement driver |
| P1 | Calibration Curve visualization | 2 days | High | Unique competitive differentiator + marketing asset |
| P1 | Pre-Questions Before Wiki Reading | 2 days | High | Effect size g = 1.25 with feedback |
| P1 | Study Session Micro-Planning | 1 day | High | Removes decision fatigue |
| P1 | 3D Bounds Breaking (implement pending spec) | 3 days | High | Marketing spear + situated learning |
| P1 | Wrong Answer Taxonomy | 3 days | High | Turns wrong answers into diagnostic data |
| P1 | Post-Simulation Debrief | 2 days | High | Makes Full Exam Simulation a coaching tool |
| P2 | Personal Forgetting Curves | 1 week | Medium-High | Requires data accumulation |
| P2 | Generation Effect Questions | 1 week | Medium-High | New question type = content investment |
| P2 | Successive Relearning Mode | 3 days | Medium-High | Gold standard retention protocol |
| P2 | Socratic Error Exploration (AI) | 1 week | Medium | Depends on Double-Pass pipeline |
| P2 | Knowledge Network Graph | 1 week | Medium | Powerful but complex visualization |
| P3 | Personalized Forgetting Rate (ACT-R) | 2 weeks | Medium | Significant algorithm work |
| P3 | Geographic Performance Map | 1 week | Medium | Needs institutional user base first |

---

*Research sources: Bjork (1994, 2006), Hattie (2009), Mayer (2001, 2009), Roediger & Karpicke (2006), Dunlosky et al. (2013), Miller & Geraci (2011, 2014), Carpenter (2009, 2011), Hwang (2025), Moreno & Mayer (2007), Rowland (2014), Callender et al. (classroom calibration studies), Nietfeld et al. (2005).*
