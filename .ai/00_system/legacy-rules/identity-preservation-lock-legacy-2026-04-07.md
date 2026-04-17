> Legacy rule document
> Preserved from the old `.ai/rules/` entrypoint.
> Active governance docs now live in `../`.

# Identity Preservation Lock: Slide-to-Action Components

**Created:** 2026-04-07
**Status:** ACTIVE — Enforced during all design system migration phases
**Applies To:** All agents modifying global CSS, Tailwind tokens, or quiz/testing UI

---

## 1. Immutable Brand Anchors

The following components are **sacrosanct** — they must not be modified during the design system migration:

### Primary Component

**`src/components/quiz-v2/SlideToSubmit.tsx`**

| Property | Current Value | Lock Status |
|----------|--------------|-------------|
| Track border-radius | `rounded-md` (6px via `--radius-md`) | LOCKED |
| Handle border-radius | `rounded-sm` (4px via `--radius-sm`) | LOCKED |
| Handle size | 44px x 44px | LOCKED |
| Track padding | 4px | LOCKED |
| Threshold | 80% (`THRESHOLD_PERCENT = 0.80`) | LOCKED |
| Active color | `#1B3FC4` (Camp Cobalt, hardcoded) | LOCKED |
| Muted color | `#8896A7` (Ink Tertiary, hardcoded) | LOCKED |
| Border color | `#D4DAE3` (Border Default, hardcoded) | LOCKED |
| Animation easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` — spring overshoot | LOCKED |
| Animation duration | `300ms` (transform), `150ms` (color), `200ms` (opacity) | LOCKED |
| Gesture library | `@use-gesture/react` (NOT Framer Motion) | LOCKED |
| Haptic feedback | `hapticSelect()` from `@/lib/quiz/haptics` | LOCKED |

### Usage Sites (7 files)

| File | Context |
|------|---------|
| `src/components/quiz-v2/OptionsColumn.tsx` | Standard quiz answer submission |
| `src/components/quiz-v2/GenerationInput.tsx` | AI-generated question submission |
| `src/components/quiz-v2/GestureCaptureZone.tsx` | Gesture signal integration |
| `src/components/testing/hub/HeroConfigurator.tsx` | "Slide to Start" quiz launcher |
| `src/components/wiki/quiz/WikiQuizModal.tsx` | In-article quiz modal |
| `src/app/dashboard/area-c/design-quiz/_components/QuestionCard.tsx` | Design quiz card |
| `src/components/quiz-v2/index.ts` | Barrel re-export |

Developer preview: `src/app/developer/_components/SlideToSubmitPreview.tsx`

---

## 2. Interference Analysis

### Token-Dependent Tailwind Classes in SlideToSubmit

The following 8 Tailwind classes in `SlideToSubmit.tsx` resolve to CSS variables and are therefore sensitive to token changes:

| Class | Element | Resolves To | Migration Plan Modifies Token? |
|-------|---------|-------------|-------------------------------|
| `bg-surface-light` | Track background (resting) | `--surface-light` | NO |
| `bg-primary-50` | Track background (completed state) | `--primary-50` | NO |
| `bg-primary/10` | Track fill (follows handle) | `--primary` at 10% opacity | NO |
| `border-border` | Track border (resting state) | `--border` | NO |
| `border-primary` | Track border (completed state) | `--primary` | NO |
| `border-primary/20` | Spinner border (checking state) | `--primary` at 20% opacity | NO |
| `border-t-primary` | Spinner top border (checking state) | `--primary` | NO |
| `text-primary` | "Answer checked" label + 2 chevron arrows (3 uses) | `--primary` | NO |

### Global CSS Changes That Could Bleed In

| Migration Change | Risk to Slider | Mitigation |
|-----------------|---------------|------------|
| **`--radius-md` redefinition** | Track radius changes | SAFE — slider uses `rounded-md` which resolves to `--radius-md: 0.375rem` (6px). Migration plan does NOT change radius token values, only caps `--radius-xl`. |
| **`--radius-sm` redefinition** | Handle radius changes | SAFE — same as above, `--radius-sm: 0.25rem` (4px) is unchanged. |
| **Global transition overrides** | Animation physics change | LOW RISK — slider uses inline `style={{ transition: ... }}` not Tailwind utility classes. Global CSS cannot override inline styles. |
| **Primary color token changes** | Active state color shift | SAFE — slider hardcodes `#1B3FC4`, does NOT use `var(--primary)`. Even if `--primary` changed (it won't), slider is unaffected. However, token-dependent classes (`bg-primary/10`, `border-primary`, `border-primary/20`, `border-t-primary`, `text-primary`) WOULD be affected. |
| **Border color token changes** | Rest state border shift | SAFE — slider hardcodes `#D4DAE3` on the handle, does NOT use `var(--border)`. However, `border-border` on the track WOULD be affected. |
| **`bg-surface-light` token** | Track background | MODERATE — slider uses `bg-surface-light` class. If `--surface-light` token value changes, track bg changes. Migration plan does NOT modify `--surface-light`. |
| **`bg-primary-50` token** | Completed state background | MODERATE — slider uses `bg-primary-50` class. If `--primary-50` token value changes, completed state bg changes. Migration plan does NOT modify shade scale values. |
| **Spacing token additions** | Layout shift | SAFE — new spacing tokens (`--spacing-section`, etc.) are additive and don't affect existing spacing. |

### Verdict: Low Interference — Contingent on Token Stability

The SlideToSubmit component uses 8 Tailwind classes that resolve to CSS variables. The migration plan does NOT modify any of these token values, so interference is unlikely. However, this safety is implicit (tokens not touched) rather than explicit (tokens listed as locked). Any future phase that modifies `--primary`, `--primary-50`, `--surface-light`, or `--border` must re-verify slider appearance.

The component is self-contained in these respects:
1. Animation physics are inline CSS, not utility classes
2. Handle and brand interaction colors are hardcoded hex values, not token references
3. Border radius uses standard Tailwind classes that map to tokens the migration plan does NOT modify

### RevealBlock — Related but Not Identity-Locked

`src/components/wiki/blocks/RevealBlock.tsx` does NOT import SlideToSubmit — it has only a code comment referencing it (`{/* Handle — circular, different from SlideToSubmit */}`). It is NOT in the identity-locked usage sites list.

However, RevealBlock is a **watch item** during migration for two reasons:

1. It uses the same gesture library (`@use-gesture/react`) as SlideToSubmit, so any global changes to `touch-action`, `user-select`, or `box-sizing` could affect gesture capture in both components simultaneously.
2. Unlike SlideToSubmit, RevealBlock has **zero hardcoded hex fallbacks** — it relies entirely on token-dependent Tailwind classes. This makes it MORE vulnerable to token changes than SlideToSubmit, not less. Any `--primary`, `--border`, or `--surface-light` modification should include a RevealBlock visual check.

RevealBlock does not meet the identity-lock bar (no hardcoded brand colors, no conversion-critical UX), but treat any unexpected gesture or visual regressions in it as a signal that SlideToSubmit may also be affected.

---

## 3. Protection Protocol

### During Migration Execution

For every phase of the design system migration:

1. **Pre-phase check:** Run `grep -rn "SlideToSubmit\|slide-to-submit" src/` and confirm no migration diffs touch these files
2. **Post-phase check (MANDATORY GATE — do not merge without passing):** After each phase merge, verify SlideToSubmit renders correctly:
   - Handle drags smoothly to 80% threshold
   - Spring-back animation fires on incomplete drag
   - Completed state shows Camp Cobalt fill
   - Haptic feedback triggers at threshold
   - Also verify no global CSS changes to `touch-action`, `user-select`, or `box-sizing` that could affect gesture capture

### If Interference Is Detected

If ANY global change alters SlideToSubmit appearance or behavior:

1. **Do NOT modify SlideToSubmit.tsx** to compensate
2. Instead, revert the global change and find a scoped alternative
3. If the global change is essential and cannot be scoped, add explicit overrides to SlideToSubmit using inline styles or a dedicated CSS class

### Future Modifications

Any future modifications to SlideToSubmit require:
1. Explicit user approval — not as part of a bulk migration
2. A/B testing consideration — this is a high-intent conversion element
3. Haptic feedback preservation — gesture physics are part of the brand signature

---

## 4. Related Files — Also Protected

These files contain the slider's supporting infrastructure and must not be modified during migration:

| File | Reason |
|------|--------|
| `src/lib/quiz/haptics.ts` | Haptic feedback functions used by slider |
| `src/components/quiz-v2/GestureCaptureZone.tsx` | Gesture capture wrapper around slider |

---

*This document is referenced by `design_system_migration_plan.md` and `wiki_component_upgrade_plan.md`. Any agent performing UI changes must check this lock before modifying global styles.*
