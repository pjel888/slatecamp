# 03 - Competitive Response PRD: VizCode Signals to SlateCamp Actions

## Principle

VizCode PH is evidence that Filipino LEA learners value visual code learning, searchable topic coverage, comparison modes, game/review modes, AI affordances, community/trust signals, and correction/support paths. SlateCamp should not copy the product. SlateCamp should answer each learner job with a stronger SlateCamp-native interaction.

## Competitive Evidence Baseline

The VizCode audit reports:

- 532/532 planned product URLs captured.
- 233 canonical competitor topic/page surfaces.
- Strong public product coverage across PD 1096, BP 344, BP 220/PD 957, RA 9514, and GBC.
- Visible signals for category panels, isolation mode, comparative mode, game mode, references, QUBI/AI, pricing, group plans, community, and support/report surfaces.
- 2026-05-13 member audit confirms logged-in Review Modes exposes references/library links, isolation links, comparative links, game-mode query links, mobile/hamburger menu entries, category panels, code-reference drawers, report links, and unlocked QUBI quotas.

Evidence boundary: private account, checkout, payment, AI answer quality, backend behavior, and legal accuracy were not validated.
Member-audit boundary: no checkout, Discord join, AI prompt, quiz answer submission, or discrepancy report submission was performed.

## Match / Improve / Replace / Skip Matrix

| VizCode signal | SlateCamp decision | SlateCamp target |
| --- | --- | --- |
| Broad code-library pages | Improve | Coverage view connected to source cards, Wiki, 3D modules, and quiz readiness |
| Category/sidebar navigation | Improve | 3D Lab coverage map by code family, topic cluster, source status, and module state |
| Static visual diagrams | Replace | Interactive 3D hotspot modules with progressive disclosure |
| Isolation mode | Replace | Info hotspots plus optional layer toggles |
| Comparative mode | Improve | Comparison hotspots with source cards and later side-by-side only if proven useful |
| Game mode | Improve | Quiz hotspots with corrective feedback and source citation |
| References/source tab | Improve | Source card shown in every source-sensitive hotspot |
| AI/QUBI affordance | Defer and constrain | Source-cited repair assistance only after source-card model exists |
| Report/contact forms | Improve | Topic-attached correction workflow with source/card context |
| Pricing/group/community signals | Separate workstream | Keep LI entitlements clear but do not make community part of LI MVP |
| Public media/assets | Skip as source | Do not reuse competitor text, media, or diagrams |
| GBC coverage | Improve later | Build only as building-science explainer until official GBC source cards exist |

## Product Requirements

### Coverage Response

SlateCamp must maintain a coverage matrix that distinguishes:

- competitor signal,
- official source verification status,
- existing Wiki/article status,
- existing 3D module registry status,
- dashboard visibility status,
- quiz/remediation linkage status,
- launch priority,
- owner/reviewer.

Recommended surface: `/dashboard/3d-lab?view=coverage` after LI MVP.

### Mode Response

VizCode exposes modes as separate product affordances. SlateCamp should collapse learner jobs into fewer, lower-cognitive-load interactions:

- Focus: click one info hotspot.
- Compare: click one comparison hotspot.
- Game/Board Drill: click one quiz hotspot.
- Source View: open source card from hotspot.
- Repair Path: route from wrong quiz answer to hotspot ID.

### Trust Response

SlateCamp must make source trust explicit:

- source card ID,
- official source family,
- section/table/page locator,
- interpretation boundary,
- correction/report action,
- reviewer status before public release.

### Learning Response

SlateCamp should exploit the advantage VizCode cannot easily match: spatial, inspectable, source-grounded 3D. Every LI module must help a student answer a board-style question more accurately than a static diagram or text page.

## P0 Competitive Work Items

| ID | Work item | Acceptance |
| --- | --- | --- |
| CR-P0-001 | Consolidated competitive decision matrix | Every major VizCode product signal has a SlateCamp match/improve/replace/skip decision. |
| CR-P0-002 | Three LI MVP modules | Ramp, toilet, and egress stair modules have source-grounded hotspot plans. |
| CR-P0-003 | Malformed route QA requirement | Future crawls/tests flag `undefined`, object-string, empty, or malformed hrefs. |
| CR-P0-004 | Source-card UX | Every source-sensitive hotspot displays or links to source card metadata. |
| CR-P0-005 | Correction workflow requirement | Report/correction action carries topic ID, source card ID, hotspot ID, and context. |

## P1 Competitive Work Items

| ID | Work item | Acceptance |
| --- | --- | --- |
| CR-P1-001 | Coverage view | 3D Lab shows source/topic/module/practice readiness by family and cluster. |
| CR-P1-002 | Compare hotspot expansion | BP 220/PD 957 and PD 1096/RA 9514 comparison hotspots cover priority traps. |
| CR-P1-003 | Repair path prototype | Wrong quiz answers deep-link to relevant LI hotspot and short mini-drill. |
| CR-P1-004 | Public sample policy | Define what LI content can be previewed publicly without leaking paid corpus. |

## Competitive Stop Rules

- Do not use competitor text or diagrams as authority.
- Do not prioritize landing-page messaging over shipping trustworthy product capability.
- Do not build AI answer experiences before source cards and uncertainty labels are implemented.
- Do not publish GBC compliance content until official GBC source evidence exists.
