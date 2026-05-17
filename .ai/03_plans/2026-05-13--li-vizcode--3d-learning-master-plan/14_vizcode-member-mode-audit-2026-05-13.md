# 14 - VizCode Member Mode Audit

Date: 2026-05-13
Status: active competitive research addendum
Evidence folder: `assets/vizcode-member-mode-audit-2026-05-13/`

## Scope

This pass used a logged-in VizCode member session to inspect the real Review Modes surface, representative isolation pages, comparative pages, game-mode query states, hamburger/category panels, code-reference controls, report links, and QUBI member access.

No checkout, payment, Discord join, AI prompt, quiz answer submission, or discrepancy report submission was performed.

## Evidence Captured

Local evidence files:

- `assets/vizcode-member-mode-audit-2026-05-13/member-mode-audit-state.json`
- `assets/vizcode-member-mode-audit-2026-05-13/review_modes.png`
- `assets/vizcode-member-mode-audit-2026-05-13/isolation_bp344_wheelchair.png`
- `assets/vizcode-member-mode-audit-2026-05-13/isolation_bp344_wheelchair_categories.png`
- `assets/vizcode-member-mode-audit-2026-05-13/comparative_bp220_pd957.png`
- `assets/vizcode-member-mode-audit-2026-05-13/comparative_all_occupant_load.png`
- `assets/vizcode-member-mode-audit-2026-05-13/game_bp344_wheelchair.png`
- `assets/vizcode-member-mode-audit-2026-05-13/game_comparison_ratio.png`
- `assets/vizcode-member-mode-audit-2026-05-13/game_comparison_all_occupant.png`
- `assets/vizcode-member-mode-audit-2026-05-13/qubi_member_surface.png`

The screenshots are local research evidence and include member-state watermarks. Do not publish them externally.

## Logged-In Review Modes Findings

The Review Modes page is a single hub, not three isolated product areas. A logged-in member sees:

- VIZCODE Library/reference links,
- Isolation Mode code-family links,
- Comparative Mode links,
- Game Mode links with `gameMode=on` query states,
- global search,
- AI Mode/QUBI entry,
- account entry,
- hidden/mobile menu entries.

Important detail: the hidden mobile/hamburger menu includes Home, About, Code Library, Review Plans, QUBI Chat, Blog, Contact, Report, Register, Login, and My account. Even though some entries are not the main desktop path, the menu expands the discoverable product surface.

## Isolation Mode Findings

Observed sample: `https://vizcodeph.com/bp-344/wheelchair/`

Isolation Mode is not just one diagram. It combines:

- a topic/category atlas,
- a right-side lesson/object list,
- a game-mode toggle,
- code reference area,
- VIZCODE Library anchor,
- report discrepancy link,
- choose-different-topic links.

The BP 344 category panel is broad and structured:

- General provisions,
- inside buildings,
- outside and around buildings,
- safety,
- special type facilities.

Representative visible topics include wheelchair, wheelchair seating space, ramps, ground surfaces, handrails and grab bars, parking, signage, stairs, doors, corridors, toilets and baths, elevators, platform lifts, public telephones, ATM, restaurants, crossings, areas of refuge, swimming pools, spas, sports facilities, assembly facilities, and transportation facilities.

Competitive implication: VizCode's real strength here is topic-atlas breadth and fast browsing, not deep adaptivity.

SlateCamp response:

- LI needs a source-backed topic atlas, but entry should be weak-topic-driven.
- The right panel should support learning-object lists, not only free-floating hotspots.
- Each learning object needs a status: not viewed, viewed, quiz attempted, repaired, source opened.

## Comparative Mode Findings

Observed samples:

- `https://vizcodeph.com/bp-220-pd-957/ratio-between-saleable-and-none-saleable-lots/`
- `https://vizcodeph.com/comparison/occupant-load-assembly/`

Comparative Mode has two important forms:

1. BP 220 versus PD 957 paired comparison.
2. All-code comparison across PD 1096, RA 9514, BP 344, BP 220, and PD 957.

The BP 220/PD 957 page has:

- split columns,
- subheaders such as Socialized Housing, Economic Housing, Medium Cost, and Open Market,
- expandable code references per side,
- VIZCODE Library deep links into reference anchors,
- a hamburger/category panel with a large comparison taxonomy.

The category panel for BP 220/PD 957 includes subdivision design, condominium design, lots, dwellings, roads/sidewalks/planting strips, parks/playgrounds, utilities, and other provisions.

Code Reference behavior is important. In the ratio example, expanding the reference reveals:

- BP 220 source section text,
- PD 957 source section text,
- a VIZCODE Library link for each side.

The all-code comparison page uses multi-column comparison and leaves many columns visually empty when that code family does not provide a relevant rule.

Competitive implication: side-by-side comparison is a strong memory tool, but it risks ambiguity when empty columns mean "no provision here."

SlateCamp response:

- Build comparison hotspots first, then side-by-side comparison later.
- Every comparison row must state: source, locator, value, applicability, non-applicability, and board trap.
- Empty/no-provision states must be explicit, not only blank.

## Game Mode Findings

Observed samples:

- `https://vizcodeph.com/bp-344/wheelchair/?gameMode=on`
- `https://vizcodeph.com/bp-220-pd-957/ratio-between-saleable-and-none-saleable-lots/?gameMode=on`
- `https://vizcodeph.com/comparison/occupant-load-assembly/?gameMode=on`

Game Mode is a page state layered onto existing topic/comparison pages:

- query parameter: `gameMode=on`,
- body class: `game-mode`,
- visible game toggle,
- embedded H5P/child-post-game areas,
- answer buttons and `Check` actions on some pages,
- the same visual/comparison content remains underneath.

No quiz answer was submitted in this audit. The visible mechanics support this interpretation: Game Mode is active recall over diagrams/comparison scenes, not a separate game environment.

Competitive implication: VizCode's Game Mode is easy to understand and sell, but it appears to be a quiz layer. It is beatable if SlateCamp adds spatial reasoning, misconception feedback, and repair.

SlateCamp response:

- Board Drill should be a hotspot state, not a separate mode tab.
- Mistake Hunt should ask the student to identify the wrong region/value in the 3D scene.
- Wrong answers should route to source card, highlighted 3D region, misconception label, and mini-repair drill.
- Do not claim Game Mode parity until SlateCamp has feedback and repair, not only choices and a check button.

## Code Reference And Report Controls

The logged-in pages include stronger source affordances than the public scan alone showed:

- expandable Code Reference panels,
- source text excerpts,
- VIZCODE Library deep links,
- report discrepancy links on isolation pages.

Competitive implication: VizCode already knows source confidence and correction matter.

SlateCamp response:

- Source cards must be first-class in LI MVP.
- Report/correction must capture module ID, hotspot ID, source card ID, topic path, visible state, and user note.
- Source panels should label official text versus interpretation.

## QUBI Member Surface

Observed sample: `https://vizcodeph.com/llm-realtime/`

Logged-in QUBI shows:

- personalized greeting,
- text input,
- Send button,
- Switch to Voice Mode button,
- remaining text and voice quota,
- beta testing label.

No prompt was submitted.

Competitive implication: QUBI is a real member surface, not just public marketing. The visible quota system makes AI feel concrete.

SlateCamp response:

- Defer AI until source-card guardrails exist.
- When introduced, show citations, uncertainty, remaining usage, and privacy posture.
- Make the assistant route students back to source card, 3D hotspot, and quiz repair.

## Must-Win Updates To The LI Plan

### P0: Topic Atlas Sidecar

LI should include a compact topic atlas or drawer that can show:

- source family,
- topic group,
- current module,
- related modules,
- source status,
- quiz/repair status.

This does not mean copying VizCode's broad browsing UX. The default path remains weak-topic entry.

### P0: Learning Object Panel

The right panel should support ordered learning objects:

- info object,
- quiz object,
- comparison object,
- repair object,
- source object.

Each object should be tied to a hotspot or 3D region when spatially meaningful.

### P0: Source Drawer

Every source-sensitive LI object needs:

- official source family,
- locator,
- excerpt or paraphrase boundary,
- source-card ID,
- report correction action,
- reviewer status.

### P0: Board Drill With Repair

The first SlateCamp Game Mode answer should be:

1. Answer the hotspot question.
2. If wrong, show misconception.
3. Highlight region/value in 3D.
4. Open source drawer.
5. Give one short repair drill.

### P1: Comparison With Applicability States

Comparison UI must distinguish:

- applies,
- does not apply,
- no provision found,
- interpretation needed,
- source not verified.

Blank columns are not enough.

## Updated Competitive Verdict

VizCode is stronger than the public-only scan suggested in three areas:

1. Its sidebars are real topic atlases, not decorative menus.
2. Its code references connect diagrams back to source/library anchors.
3. Its game layer is integrated into the same visual pages, making active recall low-friction.

SlateCamp can still win by building fewer surfaces with more mastery depth:

- source-truth governance,
- spatial 3D reasoning,
- weak-topic entry,
- repair after wrong answers,
- readiness data,
- transparent correction workflow.
