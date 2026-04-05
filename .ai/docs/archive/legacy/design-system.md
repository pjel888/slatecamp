# SlateCamp Design System

This document reflects the live SlateCamp design system as of 2026-04-05.

Primary source of truth:

- `src/app/globals.css` for tokens, Tailwind aliases, radii, transitions, and theme structure
- `src/app/layout.tsx` for loaded fonts and body font variables

If this file disagrees with the code, follow the code.

---

## 1. Design Model

SlateCamp’s design system retains the warm Campfire aesthetic, but the live implementation is broader than the earlier simplified docs.

- Light mode is the primary experience.
- Dark mode is supported through `next-themes`.
- The repo exposes both semantic shadcn/Tailwind tokens and Campfire aliases.
- A legacy "Camp Standard" alias layer still exists in `globals.css` for compatibility.
- New work should prefer semantic utilities first, then canonical Campfire aliases, and avoid hardcoded hex values.

Preferred order for new UI:

1. Semantic Tailwind utilities such as `bg-primary`, `text-foreground`, `border-border`, `text-muted-foreground`
2. Canonical Campfire aliases such as `--surface-light`, `--surface-focused`, `--ink-primary`, `--camp-orange`
3. Legacy Camp Standard aliases only when touching older surfaces that already depend on them

---

## 2. Typography

The live app is not "Inter only."

Loaded in `src/app/layout.tsx`:

- `Atkinson Hyperlegible` -> `--font-atkinson`
- `Syne` -> `--font-syne`
- `Sora` -> `--font-sora`
- `DM Mono` -> `--font-dm-mono`
- `Inter` -> currently assigned to the compatibility variable `--font-boldonse`

Live usage guidance:

- `font-sans` maps to `Atkinson Hyperlegible` in `src/app/globals.css`
- Use `Syne` or `Sora` for display/headline treatments when the surface already uses them
- Use `DM Mono` for code, scores, counters, and compact data labels
- Do not document or enforce "Inter only" in `.ai` docs

---

## 3. Core Colors

Canonical semantic and Campfire values currently exposed by `globals.css`:

| Role                 | Token                                   | Value     | Notes                              |
| -------------------- | --------------------------------------- | --------- | ---------------------------------- |
| App background       | `--background`                          | `#FFFFFF` | Default semantic page background   |
| Warm page surface    | `--surface-light`                       | `#F8F7F5` | Common Campfire page surface       |
| Focused quiz surface | `--surface-focused`                     | `#F5F7FA` | Testing shell background           |
| Foreground           | `--foreground`                          | `#1A2332` | Main semantic text color           |
| Secondary text       | `--text-secondary` / `--ink-secondary`  | `#4A5568` | Secondary body copy                |
| Muted text           | `--muted-foreground` / `--ink-tertiary` | `#8896A7` | Placeholder and low-emphasis text  |
| Border               | `--border` / `--border-default`         | `#D4DAE3` | Standard borders                   |
| Primary              | `--primary`                             | `#1B3FC4` | Camp Cobalt                        |
| Primary hover        | `--primary-700`                         | `#1535A8` | Pressed and hover states           |
| Primary tint         | `--primary-50`                          | `#EEF2FC` | Soft emphasis backgrounds          |
| Success              | `--success` / `--emerald`               | `#2D9F6F` | Correct, mastered, positive states |
| Warning              | `--warning` / `--amber`                 | `#D4951A` | Developing or caution states       |
| Destructive          | `--destructive`                         | `#D64545` | Error and critical states          |
| Accent               | `--camp-orange`                         | `#E8853A` | Warm accent, use sparingly         |

Important implementation detail:

- `globals.css` still contains legacy aliases such as `--camp-cobalt`, `--camp-red`, `--camp-green`, and `--camp-amber`
- Those aliases are not the preferred authoring surface for new code
- They exist because older parts of the app still reference them

---

## 4. Radii and Shape

Live radii from `@theme inline` in `src/app/globals.css`:

| Token         | Value | Intended use                       |
| ------------- | ----- | ---------------------------------- |
| `--radius-xs` | 2px   | Tiny inline elements               |
| `--radius-sm` | 4px   | Buttons, inputs, compact controls  |
| `--radius-md` | 6px   | Cards                              |
| `--radius-lg` | 8px   | Modals, drawers, dialogs           |
| `--radius-xl` | 8px   | Hard cap, not a larger visual tier |

Practical guidance:

- Buttons and inputs should usually use `rounded-sm`
- Cards should usually use `rounded-md`
- Dialogs and modals should usually use `rounded-lg`
- Avoid introducing larger rounded treatments as a new default style language

---

## 5. Elevation and Motion

Live motion tokens in `globals.css`:

- `--transition-fast: 100ms ease-out`
- `--transition-normal: 150ms ease-out`
- `--transition-slow: 200ms ease-out`

Live card shadow behavior:

- `--card-shadow: none`
- `--card-shadow-hover: 0 1px 2px rgba(0, 0, 0, 0.05)`

Guidance:

- Standard UI interactions should stay at or below 300ms
- Default interaction rhythm is still subtle and quick
- Heavy shadows are not part of normal card language
- Existing gradients and pattern utilities are allowed when they come from the shared graphics layer and serve a deliberate visual role
- Do not use motion as decoration or gamification

---

## 6. Implementation Rules

- Prefer semantic Tailwind classes over raw hex values
- Prefer shared primitives from `src/components/ui/*` and established shared components
- Inline `style` props are acceptable when they reference CSS variables and no matching utility exists
- Hardcoded inline hex colors are not acceptable for new work
- The repo currently mixes Phosphor and Lucide; preserve the local convention of the surface you are editing unless you are doing a deliberate consolidation pass
- Keep user-facing tone calm, direct, and non-shaming
- Avoid generic gamification patterns such as confetti, badges, virtual currency, or empty streak mechanics

---

## 7. Review Checklist

Use this checklist when updating UI or reviewing UI-facing changes:

- Colors come from semantic tokens or canonical Campfire aliases
- Typography matches the live font system, not an old "Inter only" rule
- Radii stay within the small-to-medium Campfire range
- Motion is subtle, fast, and functional
- Cards and overlays use restrained elevation
- New work does not add fresh hardcoded hex values
- New work does not depend on legacy Camp Standard aliases unless the surrounding area already does

---

## 8. Known Drift Areas

The codebase still contains some intentional compatibility drift:

- Semantic tokens and Campfire aliases coexist
- Legacy Camp Standard aliases still exist
- Background usage varies between `--background` white and `--surface-light` warm white depending on surface
- Multiple display fonts are loaded even though older docs described a single-font system

That drift should be documented clearly rather than hidden. Future cleanups should simplify the system, but `.ai` docs should describe the live implementation first.
