<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# docs

## Purpose

Product documentation, feature plans, and technical specifications for SlateCamp superpowers (major feature initiatives). Contains planning documents and design specs that guide implementation.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `superpowers/` | Root for all superpower feature documentation |
| `superpowers/plans/` | Feature planning documents -- roadmaps, implementation plans, and scope definitions |
| `superpowers/specs/` | Technical design specifications -- detailed architecture and design decisions |

## Key Files

### superpowers/plans/

| File | Description |
|------|-------------|
| `2026-03-17-3d-lab-library.md` | 3D Lab module library expansion plan |
| `2026-03-17-campfire-rebrand.md` | Slatecamp design system rebrand plan (7 phases, token map) |
| `2026-03-17-design-system-overhaul.md` | Design system overhaul and component audit |
| `2026-03-17-module-expansion-146.md` | Module expansion to 146 learning modules |
| `2026-03-17-nbcp-envelope-generator.md` | NBCP building envelope generator feature plan |
| `2026-03-17-ux-ui-overhaul.md` | UX/UI overhaul master plan |
| `2026-03-25-developer-hub-sidebar-overhaul.md` | Developer Hub sidebar navigation overhaul |

### superpowers/specs/

| File | Description |
|------|-------------|
| `2026-03-17-nbcp-envelope-generator-design.md` | NBCP envelope generator technical design spec |
| `2026-03-25-developer-hub-sidebar-overhaul-design.md` | Developer Hub sidebar overhaul design spec |

## For AI Agents

### Working In This Directory

- **Plans before code** -- read the relevant plan/spec before implementing a superpower feature
- **Date-prefixed naming** -- all files use `YYYY-MM-DD-feature-name.md` format
- **Plans vs specs** -- plans define scope and phases; specs define architecture and implementation details
- **Do not create docs unprompted** -- only add documentation files when explicitly requested by the user
- **Cross-reference with PRDs** -- implementation plans may reference PRDs in `.claude/docs/`

### Common Patterns

- Plans are written before implementation begins and may be updated as work progresses
- Specs are companion documents to plans, providing deeper technical detail
- Each superpower has a plan; complex superpowers also have a spec

## Dependencies

### Internal

- `.claude/docs/` -- Product Requirement Documents (PRDs) and blueprints
- `CLAUDE.md` (root) -- Slatecamp design system and voice guide constraints

<!-- MANUAL: -->

