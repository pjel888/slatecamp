# 10 - Risk Register and Open Decisions

## Risk Register

| ID | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| LI-RISK-001 | Reintroducing superseded sub-mode tabs. | High | Canonical model is hotspot-centered. Preserve learner jobs only. |
| LI-RISK-002 | PI regression from template/type widening. | High | Phase changes, default existing modules to PI, run PI regression tests. |
| LI-RISK-003 | Unverified code claims in hotspots. | High | Source-card and no-go gates. |
| LI-RISK-004 | `HotspotQuestion` integration is more incomplete than expected. | Medium | Re-inspect live code; stage payload extension separately. |
| LI-RISK-005 | Hotspot UI overloads model. | Medium | 6-8 hotspots, progressive disclosure, one concept per hotspot. |
| LI-RISK-006 | Mobile orbit/tap conflicts. | Medium | Test touch behavior and use bottom sheet for content. |
| LI-RISK-007 | Broad coverage view delays MVP. | Medium | Ship LI modules first; coverage view Phase 2. |
| LI-RISK-008 | GBC module claims exceed source evidence. | High | Building-science-only until official GBC source cards exist. |
| LI-RISK-009 | External GLB/model license ambiguity. | High | Prefer programmatic geometry for MVP; require asset license review. |
| LI-RISK-010 | Dashboard filter confuses users. | Low | Feature flag filter; only show when LI modules exist. |

## Locked Decisions

| Decision | Status |
| --- | --- |
| LI is hotspot-centered. | Locked |
| LI does not use sub-mode tabs for MVP. | Locked |
| PI remains the parametric compliance mode. | Locked |
| Existing 3D Lab route remains. | Locked |
| Existing modules default to PI. | Locked |
| VizCode audit is competitive signal only. | Locked |
| First LI module should be BP 344 ramp hotspots unless implementation evidence blocks it. | Locked |

## Open Decisions

| Question | Default answer | Blocks MVP? |
| --- | --- | --- |
| Should LI progress write to user analytics in MVP? | No; local/UI state only. | No |
| Should source cards open inline or in Wiki? | Inline summary plus Wiki/source-card deep link. | No |
| Should comparison hotspots use tables or compact cards? | Compact table on desktop, stacked cards on mobile. | No |
| Should module visibility be feature-flagged? | Yes. | Yes |
| Should static fallback ship in MVP PR or release PR? | Required before public release, not necessarily first hidden PR. | No |
| Should LI use external GLB assets? | Not for MVP unless contracts are already proven. | No |
| Should coverage view be shipped with MVP? | No; Phase 2 after first module. | No |

## Decision Review Triggers

Re-open decisions only if:

- live code has materially drifted from assumptions,
- a P0 source card is invalid,
- PI regression risk becomes higher than expected,
- WebGL/mobile constraints force a UX simplification,
- release timeline requires cutting modules but preserving architecture.
