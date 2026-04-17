> Historical completed-task artifact from the 2026-04-06 deep-doc migration.
> Preserved for lineage only; not current task or workflow authority.

# Task 05: Write Design Documentation

**Status:** pending  
**Created:** 2026-04-06  
**Objective:** Write all `03-design/` documents sourced from `globals.css`

---

## Steps

### 5.1 Write `03-design/001-design-system.md`

**Source:** `src/app/globals.css`

Content:
- All Campfire design tokens extracted verbatim from CSS variables
- Color palette (primary, accent, success, destructive, warning, background, foreground, border)
- Typography (font families: Inter, Syne, DM Mono)
- Spacing scale
- Border radius (rounded-sm, rounded-md, rounded-lg)
- Shadow scale (shadow-sm, shadow-md, shadow-lg)
- Transitions (max 300ms, duration-150 ease-out)
- Token → Tailwind class mapping table

### 5.2 Write `03-design/002-copy-guide.md`

**Source:** Preserved from `COPY-CONTENT-SOURCE-OF-TRUTH.md` (moved in Task 02)

Content:
- Brand voice guidelines
- Forbidden words (gamification terms, generic motivational language)
- SlateCamp naming conventions (vs deprecated "Campfire" branding)
- Tone: professional, encouraging without being patronizing
- Microcopy examples

### 5.3 Write `03-design/003-component-library.md`

**Source:** `src/components/ui/`

Content:
- shadcn/ui component inventory
- Custom SlateCamp components
- Usage guidelines per component
- Link to Storybook (if available)
- Design token application examples

---

## Verification

- [ ] All CSS variables from `globals.css` included
- [ ] No hardcoded hex values — all reference tokens
- [ ] No "Campfire" branding references (migrated to "SlateCamp" / "Slatecamp design system")
- [ ] Component names verified against `src/components/ui/`
- [ ] Typography names match font loading in `src/app/layout.tsx`

## Notes

- Design tokens are the single source of truth — extract directly from `globals.css`
- Do NOT use values from legacy `SlateCamp Design System.md` — that file is archived
