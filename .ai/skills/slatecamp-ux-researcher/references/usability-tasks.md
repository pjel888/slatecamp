# SlateCamp Usability Task Bank

## Task Writing Rules

1. **Never name the feature in the task.** Don't say "use the Heatmap." Say "find out which topics you know least."
2. **Always set a scenario first.** Users perform better when they have a reason.
3. **Make tasks outcome-driven, not action-driven.** "Know your weakest area" not "click on the Taxonomy tab."
4. **Rate each task:** Task Success (pass/fail), Time on Task (seconds), Confidence After (1–5 Likert).

---

## Core Task Bank (Priority Order)

### BLOCK A: Onboarding & First Session

**Task A1 — Landing to Sign-up**
Scenario: "Imagine you're an architecture student who just heard about SlateCamp from a batchmate. You're curious about it."
Task: "Show me what you'd do from here." [Present landing page]
Success: User completes sign-up without assistance.
Watch for: Confusion about what SlateCamp does, form field friction, CTA clarity.

**Task A2 — Diagnostic Start**
Scenario: "You just created your account. You want to know how prepared you are."
Task: "Show me how you'd find out where you stand."
Success: User initiates diagnostic quiz.
Watch for: Whether they find the diagnostic prompt or wander, how long before first question.

**Task A3 — Score Reveal Reaction**
Scenario: [After diagnostic completes, do not intervene]
Task: No task — observe. Then ask: "What are you thinking right now?"
Success: User understands what the score means and knows what to do next.
Watch for: Confusion about score interpretation, dead ends, emotional reaction.

---

### BLOCK B: Study Planning

**Task B1 — Find Weakest Area**
Scenario: "You've been studying for two weeks. You want to focus on your weakest topics today."
Task: "Show me how you'd figure out where to focus."
Success: User reaches Taxonomy Heatmap and correctly identifies a red or grey node.
Watch for: Whether users find the Heatmap, how they interpret node colors.

**Task B2 — Start Camp Trail**
Scenario: "You want to follow a structured study plan that tells you exactly what to do each day."
Task: "Show me how you'd set that up."
Success: User finds and enrolls in the Camp Trail.
Watch for: Whether "Camp Trail" is discoverable, confusion about what enrollment means.

**Task B3 — Plan for Exam Date**
Scenario: "Your exam is in exactly 60 days. You want to make sure you're using your time right."
Task: "Show me how you'd set that up."
Success: User sets exam date (if feature exists) or finds the Camp Trail with date configuration.
Watch for: Any screen that leaves the user without a next step.

---

### BLOCK C: Daily Study Execution

**Task C1 — Start a Study Session**
Scenario: "It's time to study. You have 45 minutes."
Task: "Show me what you'd do."
Success: User starts either a Camp Mode or Storm Mode session.
Watch for: Decision paralysis between Camp Mode and Storm Mode, confusion about session settings.

**Task C2 — Camp Mode vs Storm Mode Choice**
Scenario: "You want to practice but you're not sure what kind of session to take."
Task: "Walk me through how you'd choose between the different session types."
Success: User can articulate the difference and makes a deliberate choice.
Watch for: Whether the distinction is clear from the UI, whether users default to one mode out of habit not choice.

**Task C3 — Mid-Session Difficulty**
Scenario: [During a live session, observer points to a question]
Task: "Tell me what you're thinking right now as you answer this."
Success: User can explain their reasoning process.
Watch for: Signs of confusion about question format, anxiety about timer, inability to flag for review.

---

### BLOCK D: Progress Tracking

**Task D1 — Check Progress Since Last Week**
Scenario: "You've been using SlateCamp for two weeks. You want to see if you're improving."
Task: "Show me how you'd check that."
Success: User finds Readiness Score trajectory or Heatmap delta.
Watch for: Whether progress is visible without hunting, whether the score change is understandable.

**Task D2 — Understand Heatmap**
Scenario: "Imagine I'm a classmate who hasn't used SlateCamp. Using what's on your screen right now, explain to me what this map is showing you."
Task: [User explains Heatmap to observer as if to a friend]
Success: User can explain red/amber/green nodes correctly without prompting.
Watch for: Misinterpretation of colors, confusion about topics vs disciplines, inability to explain without help.

**Task D3 — Find Biggest Improvement**
Scenario: "After a month of studying, you want to know which topic you've improved in the most."
Task: "Show me how you'd find that out."
Success: User navigates to Heatmap or score history and identifies a node that improved.
Watch for: Whether delta/change view is findable, whether users even think to look for improvement vs current state.

---

### BLOCK E: Proof & Exam Preparation

**Task E1 — Run a Simulation**
Scenario: "Your exam is in 2 weeks. You want to do a full practice run under real exam conditions."
Task: "Show me how you'd do that."
Success: User finds and starts a Proof Simulation or Storm Mode session with correct settings.
Watch for: Whether Proof Simulation is distinct from Storm Mode in discoverability.

**Task E2 — Interpret Simulation Result**
Scenario: [After simulation completes]
Task: "Based on this result, what do you think your chances are on the real exam? What would you do next?"
Success: User can interpret the score and identify at least one action to take.
Watch for: Whether the post-simulation screen gives clear direction, or whether the user feels lost.

---

### BLOCK F: Paywall & Conversion

**Task F1 — Hit Paywall (Free User)**
Scenario: [Present paywall screen, no context]
Task: "What is this screen telling you? What would you do?"
Success: User understands what Pro offers and the decision to upgrade is clear.
Watch for: Confusion about what they're giving up, price anchoring issues, unclear value.

**Task F2 — Evaluate Pro Value**
Scenario: "You're a free user who's been using SlateCamp for a week. Consider upgrading to Pro."
Task: "Walk me through what you're thinking."
Success: User articulates the specific value trade-off without being prompted.
Watch for: Features they don't know about, unspoken objections (cost, trust, family buy-in).

---

## Scoring Guide

For each task, record:

| Field | Values |
|---|---|
| Task success | Complete / Partial / Fail |
| Time on task | Seconds |
| Assist needed | Yes / No |
| User confidence post-task | 1 (not at all) – 5 (very confident) |
| Key observations | Text notes |
| Key quotes | Verbatim |

**Severity rating for issues found:**
- S1 Critical: User cannot complete the task. Blocks core flow.
- S2 Major: User completes but with significant difficulty or incorrect understanding.
- S3 Minor: Small friction, hesitation, or recoverable confusion.
- S4 Cosmetic: Visual inconsistency or preference, doesn't affect success.

**Minimum sample size:**
- 5 users for qualitative usability testing (per persona segment)
- 20+ users for quantitative task completion rates
- 3 rounds of iteration recommended before considering a flow "validated"
