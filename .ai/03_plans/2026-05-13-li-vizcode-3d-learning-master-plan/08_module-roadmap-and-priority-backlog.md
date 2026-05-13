# 08 - Module Roadmap and Priority Backlog

## Roadmap Principle

Ship a small number of excellent source-grounded LI modules before broad coverage work. The first modules should prove the hotspot template, source-card UX, quiz feedback, and PI preservation.

## P0 MVP Modules

| Priority | Module ID | Learner job | Source readiness | Notes |
| --- | --- | --- | --- | --- |
| 1 | `bp344-ramp-hotspots` | Understand accessible ramp dimensions and traps through hotspots. | Strong | First implementation candidate. |
| 2 | `bp344-toilet-hotspots` | Understand accessible toilet clearances, grab bars, door swing, lavatory. | Good | Use as second accessibility module. |
| 3 | `egress-stair-hotspots` | Compare stair/egress requirements across codes. | Good but interpretation-sensitive | Needs careful comparison/source boundaries. |

## P0 Infrastructure Backlog

| ID | Work item | Depends on |
| --- | --- | --- |
| INF-P0-001 | LI type/template support | none |
| INF-P0-002 | Hotspot payload extension | current overlay store/card |
| INF-P0-003 | Learning renderer and hotspot list | LI types |
| INF-P0-004 | Dashboard Learning badge | template metadata |
| INF-P0-005 | Mode filter chips | visible LI module |
| INF-P0-006 | Static fallback contract | module content |
| INF-P0-007 | Source-card display contract | source cards |
| INF-P0-008 | 3D Lab LI Playwright smoke | first module |

## P1 Modules

| Module | Learner job | Notes |
| --- | --- | --- |
| Building height comparison | Understand grade plane, height limit, inclusions/exclusions, fire-zone constraints. | Needs source completion. |
| BP 220 / PD 957 site-lot comparator | Compare lot, setback, open-space rules. | Better after comparison hotspot pattern is stable. |
| Occupant load assembly comparator | Connect occupant load to exit count/width/travel. | May belong partly to PI if formulas are interactive. |
| Wall assembly layers | Learn material layers and construction sequence. | LI-native; source needs expansion. |
| Foundation system | Learn components, rebar, tie beams, slab, waterproofing. | LI-native; source needs expansion. |
| Roof assembly layers | Learn truss, purlins, sheathing, roofing, insulation. | LI-native; avoid unsupported GBC claims. |

## P2 Modules / Later

| Module | Reason later |
| --- | --- |
| GBC roof SRI/R-value compliance | Official GBC source not available in local evidence. |
| Full source atlas coverage map | Needs ID reconciliation and MVP template proof first. |
| AI-assisted repair assistant | Requires source-card model, uncertainty labels, and safety policy first. |
| Side-by-side viewport comparator | Higher complexity; start with comparison hotspots. |

## First Implementation Slice

Recommended PR 1:

- type/template widening,
- dashboard metadata,
- hotspot payload extension behind optional fields,
- no visible LI modules yet,
- targeted tests.

Recommended PR 2:

- `LearningSceneRenderer`,
- `LearningHotspotList`,
- `LearningLayerToggles`,
- `useTemplateContent` learning case,
- tests.

Recommended PR 3:

- `bp344-ramp-hotspots`,
- registry/dashboard visibility behind flag,
- Playwright 3D smoke,
- PI regression check.

Recommended PR 4:

- toilet and egress stair modules,
- source-card UI polish,
- static fallback,
- release-candidate QA.

## Backlog Acceptance Rules

No module moves from backlog to implementation unless:

- module objective is clear,
- source cards exist or claim is labeled conceptual,
- hotspot list is drafted,
- static fallback is defined,
- QA checklist is written,
- owner/reviewer is assigned.
