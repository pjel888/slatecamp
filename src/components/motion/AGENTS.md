<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# motion

## Purpose

Framer Motion animation components for scroll-triggered reveals and staggered animations. Provides reusable animation patterns respecting user `prefers-reduced-motion` settings.

## Key Files

| File | Description |
|------|-------------|
| `ScrollReveal.tsx` | Scroll-triggered reveal with fade-in, slide-up, optional scale animation |
| `StaggerChildren.tsx` | Stagger animation wrapper for animating list items sequentially |

## For AI Agents

### Working In This Directory

- **Duration Constraint**: Max 300ms for motion durations (never 500ms, 700ms, 1000ms)
- **Default Duration**: 150ms with ease-out (`[0.16, 1, 0.3, 1]` cubic-bezier)
- **ScrollReveal**: `initial={{ opacity: 0, y }}` → `whileInView={{ opacity: 1, y: 0 }}`
- **Viewport**: `once: true` (animate once on scroll), `margin: '-80px'` (trigger before visible)
- **Scale**: Optional prop to scale from 0.98 on reveal
- **Accessibility**: All animations are suppressible via CSS media query `prefers-reduced-motion: reduce`
- **No Bounce/Spring**: Use standard easing, never bounce or spring easing (except structured framer layouts)

### Dependencies
### Internal

- `framer-motion` - Animation library
- React - `ReactNode` type

<!-- MANUAL: Test scroll reveal timing on various viewport speeds. Verify prefers-reduced-motion is respected in accessibility tests. Never add bounce/spring easing without explicit design request. -->
