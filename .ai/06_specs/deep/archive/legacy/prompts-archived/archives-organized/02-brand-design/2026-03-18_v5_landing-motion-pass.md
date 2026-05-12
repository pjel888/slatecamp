# SlateCamp Landing Page — Motion & Micro-Interaction Pass
## The Layer That Makes It Feel Alive

---

## ROLE

You are a motion designer and Next.js engineer. You add animation to a landing page that already has strong layout, typography, and color. Your job is the FINAL POLISH — subtle, fast, structural motion that makes the page feel like a premium native app. You understand that SlateCamp is an educational platform for architecture students: motion must GUIDE attention, not steal it.

---

## THE MOTION PHILOSOPHY

**"Linear / Vercel / LemonSqueezy tier."** Fast, snappy, structural. Never bouncy, never slow, never decorative. Every animation has a PURPOSE: either it reveals content in a readable sequence (scroll reveals), or it gives tactile feedback (hover states). If an animation doesn't do one of those two things, it doesn't belong.

**The three rules:**
1. **Fast.** Maximum 400ms for reveals, 150ms for hover states. No animation exceeds 400ms.
2. **Once.** Scroll reveals fire once (`once: true`). The user never sees the same animation twice.
3. **Invisible when done.** After an animation completes, the element should look identical to a page with no animations at all. Motion is the entrance, not the state.

---

## CONTEXT

- **Framework:** Next.js (App Router), Tailwind CSS, TypeScript
- **Check `package.json`:** If `framer-motion` (or `motion`) is installed, use it. If not, use pure CSS + `IntersectionObserver`. Do NOT install framer-motion just for this — CSS animations are sufficient and lighter.
- **Design system transitions:** All hover transitions use `150ms ease-out`. All reveals use `400ms` with custom easing.
- **`prefers-reduced-motion`:** ALL animations must be wrapped in a media query check. If the user prefers reduced motion, every element renders in its final state immediately.

### The Landing Page Sections (audited from live page)

```
1.  HERO              — Headline "Know you'll pass.", scrolling feature ticker, CTA, dashboard preview
2.  TRUST BAR         — "Built for the Philippine ALE" credibility line
3.  FEATURES GRID     — 6 feature blocks (Review Mode, Analytics, 3D Lab, Sessions, AI Tutor, Adaptive Engine)
4.  QUESTION BANK     — "2,400+ questions" section with sample quiz card
5.  3D LAB            — Dark section with 3D model preview
6.  ANALYTICS         — Readiness Score ring, subject mastery bars
7.  WIKI              — Gold background section with code reference
8.  HOW IT WORKS      — 3-step process
9.  COMPARISON TABLE  — SlateCamp vs Traditional Review Centers
10. EARLY ACCESS/CTA  — Dark section, final CTA
11. FOOTER
```

---

## THE CHOREOGRAPHY MAP

Every section gets a specific animation treatment. This is the COMPLETE spec — no improvising.

### Global Easing Curve

```css
/* The "expensive" ease — fast start, smooth deceleration */
--ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
```

This is the only easing curve used for scroll reveals. It's aggressive at the start and buttery at the end — the hallmark of premium motion design.

### Section-by-Section Animation Spec

| Section | Animation | Duration | Delay | Y-Offset | Notes |
|---|---|---|---|---|---|
| **Hero headline** | Fade up | 500ms | 0ms | 24px | The ONE exception to 400ms max — the hero earns a slightly longer entrance. |
| **Hero subheadline** | Fade up | 400ms | 100ms | 16px | Staggered after headline. |
| **Hero CTA button** | Fade up | 400ms | 200ms | 12px | Staggered after subheadline. |
| **Hero dashboard preview** | Fade up + scale | 500ms | 300ms | 20px, scale 0.98→1 | The product image enters last, slightly scaling up. |
| **Scrolling feature ticker** | CSS infinite scroll | — | — | — | Already animated (horizontal auto-scroll). No change needed. |
| **Trust bar** | Fade in (no Y) | 300ms | 0ms | 0px | Simple opacity. No vertical movement — it's a thin bar. |
| **Each feature block** | Staggered fade up | 400ms | 80ms stagger | 16px | Cards cascade in left-to-right, top-to-bottom. 80ms between each. |
| **Question Bank heading** | Fade up | 400ms | 0ms | 16px | |
| **Sample quiz card** | Fade up + subtle shadow grow | 400ms | 150ms | 12px | Shadow animates from 0 to resting value as card enters. |
| **3D Lab section** | Fade in (no Y) | 400ms | 0ms | 0px | Dark sections fade in flat — vertical movement on dark bg feels wrong. |
| **3D model preview** | Scale up | 400ms | 200ms | 0px, scale 0.95→1 | Scales into place. No Y-offset. |
| **Analytics readiness ring** | SVG stroke draw | 1200ms | 200ms | — | `stroke-dashoffset` animates from full circumference to target. Custom ease. |
| **Mastery bars** | Width grow | 800ms | 100ms stagger per bar | — | Each bar animates from 0% to target width. Staggered by subject. |
| **Wiki section (gold)** | Fade in (no Y) | 400ms | 0ms | 0px | Gold sections fade flat — same logic as dark sections. |
| **How It Works steps** | Staggered fade up | 400ms | 150ms stagger | 16px | Steps 1, 2, 3 cascade in sequence. |
| **Comparison table rows** | Staggered fade up | 300ms | 60ms stagger | 10px | Rows cascade from top to bottom. Fast and dense. |
| **Final CTA headline** | Fade up | 400ms | 0ms | 20px | |
| **Final CTA button** | Fade up | 400ms | 150ms | 12px | |

### Card Hover Micro-Interactions

| Element | Hover Effect | Duration | Easing |
|---|---|---|---|
| Feature cards | `translateY(-2px)`, shadow appears, border-color shifts to `rgba(27,63,196,0.15)` | 150ms | ease-out |
| CTA buttons | `scale(1.02)`, shadow deepens | 150ms | ease-out |
| Quiz sample card | `translateY(-2px)`, shadow expands | 150ms | ease-out |
| Nav links | Color transition to Cobalt `#1B3FC4` | 150ms | ease-out |
| Comparison table rows | Row background shifts to `rgba(27,63,196,0.03)` | 150ms | ease-out |

**Hover rules:**
- Only `transform` and `opacity` for GPU-accelerated properties. Never animate `width`, `height`, `padding`, or `margin`.
- `will-change: transform` on elements that hover-animate (but remove it if there are >20 such elements on the page — too many `will-change` hints hurts performance).

---

## IMPLEMENTATION APPROACH

### Option A: Framer Motion (if installed)

Build two reusable components:

```tsx
// components/motion/ScrollReveal.tsx
"use client"
import { motion } from "framer-motion"

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  y?: number
  duration?: number
  className?: string
}

export function ScrollReveal({
  children, delay = 0, y = 16, duration = 0.4, className
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

```tsx
// components/motion/StaggerChildren.tsx
"use client"
import { motion } from "framer-motion"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
}

export function StaggerParent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode, className?: string }) {
  return <motion.div variants={item} className={className}>{children}</motion.div>
}
```

### Option B: Pure CSS + IntersectionObserver (if no framer-motion)

```tsx
// hooks/useScrollReveal.ts
"use client"
import { useEffect } from "react"

export function useScrollReveal() {
  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach(el => {
        (el as HTMLElement).style.opacity = "1"
        ;(el as HTMLElement).style.transform = "none"
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("revealed")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "-80px" }
    )

    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
```

```css
/* globals.css */
[data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger delays via CSS custom property */
[data-reveal-delay="1"] { transition-delay: 80ms; }
[data-reveal-delay="2"] { transition-delay: 160ms; }
[data-reveal-delay="3"] { transition-delay: 240ms; }
[data-reveal-delay="4"] { transition-delay: 320ms; }
[data-reveal-delay="5"] { transition-delay: 400ms; }

/* Reduced motion: skip everything */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

---

## PHASED EXECUTION

### PHASE 1: Audit & Decision

Read:
- `package.json` — is `framer-motion` or `motion` installed?
- Landing page file(s) — map every section and identify which elements get animations
- Check if any animations ALREADY exist — don't double-animate

Decide: Framer Motion (Option A) or CSS (Option B).

Output the decision and a confirmation of the choreography map against the actual DOM.

**STOP.** "Phase 1 Complete. Using [Framer Motion / CSS]. Reply 'Proceed' to build motion utilities."

### PHASE 2: Build Motion Utilities

Create the reusable components/hooks (ScrollReveal, StaggerChildren, or the CSS + IntersectionObserver approach).

If CSS approach: add the `[data-reveal]` styles to `globals.css` and the `useScrollReveal` hook.

**DO NOT** touch the landing page yet. Only build the tools.

**STOP.** "Phase 2 Complete. Reply 'Proceed' to inject into landing page."

### PHASE 3: Inject Scroll Reveals

Wrap landing page sections with the motion components per the choreography map:
- Hero elements (headline, sub, CTA, preview) with staggered delays
- Feature grid with StaggerChildren
- Each subsequent section with ScrollReveal
- Readiness Score ring with stroke-dashoffset animation
- Mastery bars with width animation

**STOP.** "Phase 3 Complete. Reply 'Proceed' for hover micro-interactions."

### PHASE 4: Hover States & Polish

Add hover micro-interactions to:
- Feature cards (lift + shadow + border tint)
- CTA buttons (scale + shadow)
- Comparison table rows (bg tint)
- Any interactive card

Verify:
- [ ] All animations fire once on scroll (never replay)
- [ ] All hover transitions are 150ms ease-out
- [ ] `prefers-reduced-motion` disables everything
- [ ] No animation exceeds 400ms (except hero headline at 500ms and readiness ring at 1200ms)
- [ ] Page still scores 90+ on Lighthouse Performance
- [ ] No layout shift (CLS = 0) from animations — elements must have reserved space before reveal

**STOP.** "Phase 4 Complete. Motion pass shipped."

---

## WHAT NOT TO DO

- **No parallax.** It's 2026.
- **No bounce or spring easing.** This is a professional tool, not a toy.
- **No entry animations on elements already in the viewport on page load.** The hero animates on load. Everything else animates on SCROLL. If a section is already visible when the page loads, it should be in its final state.
- **No animation on the scrolling feature ticker.** It already auto-scrolls. Adding fade-in on top of auto-scroll creates visual chaos.
- **No stagger delay beyond 400ms total.** If you have 6 cards at 80ms stagger, the last card enters at 400ms. If you have 10 items, reduce the stagger to 40ms so the total cascade stays under 400ms. Long cascades feel sluggish.
- **No opacity animation on dark or gold section BACKGROUNDS.** The section itself can fade in, but the background color must be solid from frame 1. Fading a colored background from transparent creates an ugly flash.
- **No `will-change` on more than 15 elements.** If the page has 30 animated elements, use CSS `transform` without `will-change` — the browser handles it fine in 2026.
- **No motion library installation.** If framer-motion isn't already in `package.json`, use CSS. Don't add a dependency for landing page animations.

---

*Execute Phase 1 now. Check package.json and audit the landing page DOM.*
