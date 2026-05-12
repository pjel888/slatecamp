# 19 — Open Questions & Decisions

## Decision Table

| # | Question | Area | Recommended Default | Blocks MVP? | Owner Needed | Notes |
|---|----------|------|---------------------|-------------|--------------|-------|
| Q1 | Should LI be a new `templateType` or a separate `mode` field? | Architecture | Both: `mode` field for categorization + `'learning'` templateType for rendering | Yes | Engineering | Using templateType as the dispatch mechanism is the thinnest change. The `mode` field is for dashboard/badge display. |
| Q2 | Should LI have its own route? | Routing | No — data-driven mode resolution | Yes | Engineering | Unnecessary URL churn. Can add mode to URL later if needed. |
| Q3 | What should the first LI module be? | Content | BP 344 Ramp Components (ACCESSIBILITY) | No | Product/Content | Ramp has clear layers (surface, handrail, curb, landing). Easily represented with programmatic geometry. |
| Q4 | Should existing modules default to PI or require explicit mode? | Data | Default to PI (optional field, default PI) | Yes | Engineering | Zero migration work. Explicit `mode: 'PI'` can be added later for clarity. |
| Q5 | Should LI use GLB models or programmatic geometry? | 3D | Programmatic geometry for MVP; GLB support for future | Yes | Engineering | MVP uses `GeometryInstruction` system. No asset pipeline needed. GLB support is already available if needed later. |
| Q6 | Should LI have multiple layers visible at once or only one? | UX | Multiple — independent checkboxes | Yes | Product | "Solo mode" (only this layer visible) can be future enhancement. |
| Q7 | Should layer toggle state persist across sessions? | State | No — session-only for MVP | No | Product | Module store resets on unmount. Persistence adds Supabase dependency. |
| Q8 | Should LI modules appear in category drill-down? | Dashboard | Yes — LI modules belong to categories like PI modules | No | Product | Category taxonomy is shared. Filtering by mode works at both top level and category level. |
| Q9 | Should LI have a "challenge mode" like PI? | UX | No for MVP | No | Product | Deferred. Could be "identify the layer" quiz in future. |
| Q10 | Should LI modules support annotations/hotspots? | UX | No for MVP | No | Product | Deferred. Primary LI interaction is layer toggles. |
| Q11 | Should LI modules support cross-section? | 3D | Not for MVP | No | Engineering | Could be useful but adds complexity. Evaluate after first LI modules. |
| Q12 | Should the dashboard filter state persist in URL? | Dashboard | No for MVP | No | Product | Could add `?mode=learning` later if needed. |
| Q13 | Should LI modules count toward the same LEA question metrics? | Analytics | Yes — use same `leaQuestionCount` field | No | Product | Consistent metric across modes. |
| Q14 | Should LI module configs support the source truth system? | Content | No — LI has static code references only | No | Engineering | Source truth is PI-specific (live compliance checking). LI has static `codeCitation` per layer. |
| Q15 | Should there be a way to convert PI modules to LI? | Tools | No — they serve different purposes | No | Product | PI and LI are complementary, not convertible. |
| Q16 | Should LI have a guided tour / step sequencer? | UX | No for MVP | No | Product | Deferred. Focus on simple layer toggles first. |
| Q17 | What icon should the "Learning" badge use? | Design | `GraduationCap` or `BookOpen` from Phosphor | Yes | Design | Must be visually distinct from existing template icons. |
| Q18 | What color scheme for LI badges and UI? | Design | Emerald/green (distinct from PI's blue/primary) | Yes | Design | See `TEMPLATE_META` className pattern. |
| Q19 | Should LI support the floating toolbar? | UX | Yes — reuse SceneToolbar with grid/dim/xray | Yes | Engineering | Already works via ViewportShell. |
| Q20 | Can LI modules be in the same category as PI modules? | Taxonomy | Yes — same 16-category system | Yes | Product | Mode is orthogonal to category taxonomy. |

## Product Questions

| Question | Status | Recommendation |
|----------|--------|---------------|
| What types of 3D content are best for LI vs PI? | Open | LI: construction assemblies, material layers, building components. PI: code compliance, parametric systems. |
| How many LI modules should exist at launch? | Open | 1 for MVP. Expand based on content team interest. |
| Should LI modules have a different pricing/entitlement model? | Resolved | No — same `threeDLabFull` entitlement. |
| Should LI be marketed differently than PI? | Open | Consider "Interactive 3D Lessons" vs "Parametric 3D Lab" messaging. |

## Design Questions

| Question | Status | Recommendation |
|----------|--------|---------------|
| "Learning" badge exact styling | Open | Use emerald color scheme. Icon: GraduationCap from Phosphor. Same badge size/template as existing. |
| Right sidebar exact layout for layers | Open | Layer name + checkbox on same line. Description below in smaller text. Code citation in mono font. |
| Show All / Hide All button placement | Open | Top of layer list, compact button pair. |
| Mobile layer toggle UX | Open | Inherits ViewportShell mobile bottom sheet. Layers tab shows toggles. |

## Engineering Questions

| Question | Status | Recommendation |
|----------|--------|---------------|
| Should we add a feature flag for LI? | Resolved | Yes — `NEXT_PUBLIC_ENABLE_LI_MODE`. Off in production until QA passes. |
| Should LearningSceneRenderer be separate from ParametricSceneRenderer? | Resolved | Yes — separate component. Different rendering model (static geometry vs. dynamic generation). |
| Should the module store for LI be created via createModuleStore? | Resolved | Yes — follows existing pattern. Creates store with layer default booleans. |
| Should we preload LI module configs? | Open | Not needed for MVP. Configs are small (<5KB). |
| Should we add LI to the performance test suite? | Open | After MVP, add LI module to `.ai/00_performance/scripts/3d-lab-*.mjs`. |

## Content/Model Authoring Questions

| Question | Status | Recommendation |
|----------|--------|---------------|
| How should content authors define layers? | Resolved | Via `LearningLayerDef[]` in static TS config. Same pattern as PI module configs. |
| What geometry primitives are available for LI? | Resolved | All existing `GeometryInstruction` types: box, cylinder, plane, line, ring, sphere, cone, extruded-profile, instanced. |
| How are colors assigned to layers? | Resolved | Per-layer via `GeometryInstruction.color`. |
| Can LI modules reuse PI geometry? | Open | Yes, but config format differs. LI uses `layers` array; PI uses `geometry()` function. |

## Performance Questions

| Question | Status | Recommendation |
|----------|--------|---------------|
| Maximum recommended layers per LI module? | Open | <20 for MVP. Each layer = 1-5 meshes. Total <100 draw calls. |
| Will LI affect PI load time? | Resolved | No — LI components are dynamically imported. No PI code path changes. |
| Should LI modules use model compression? | Resolved | Not needed for MVP (programmatic geometry). If GLBs added later, DRACO already configured. |

## Decisions Not Yet Made (Block MVP?)

| Decision | Blocks MVP? | Impact if Undecided |
|----------|------------|---------------------|
| First LI module content | No (implementation can proceed with placeholder) | Slower launch, but engineering can build with test config |
| Badge icon choice | No (can iterate) | Visual detail, easily changed |
| Color scheme for LI | No (can iterate) | Visual detail, easily changed |
| Mobile layer toggle UX details | No (inherits existing) | Inherits ViewportShell mobile pattern |

## Recommended Decision Cadence

1. **Week 1**: Resolve Q1-Q6 (architecture + first module content) — necessary before Phase 1
2. **Week 2**: Resolve Q17-Q18 (visual design details) — necessary before Phase 2
3. **Week 3**: Resolve content questions — necessary before Phase 4
4. **Post-MVP**: Resolve deferred questions (annotations, tours, challenge mode)
