# Landing Page Design Plan: SlateCamp Marketing Pages

**Created:** 2026-04-07
**Status:** DRAFT — Replaces Migration Plan Phase 6 "Documentation + templates" with a concrete build spec
**Parent Plan:** `design_system_migration_plan.md` (Phase 6: Marketing & Application Section Patterns)
**Brand:** Camp Cobalt (#1B3FC4), Atkinson Hyperlegible, radius cap 8px (`rounded-lg`), Phosphor Icons (duotone weight)

---

## 1. Page Inventory & Current State

| Page | Route | Current State | Target |
|------|-------|--------------|--------|
| Landing | `/` | **Fully built** — `LandingPageContent.tsx` composes 12+ marketing section components from `src/components/marketing/`. Has: Hero, SocialProofBar, LogoMarquee, BentoFeatureGrid, QuestionsSection, ThreeDLabSection, AnalyticsSection, WikiSection, HowItWorksSection, ComparisonSection, TestimonialShowcase, FinalCtaSection. Component library already exists. | Audit tokens + align section components to Flowbite structural patterns per §4 |
| Pricing | `/pricing` | **Partially built** — `pricing/page.tsx` + `pricing-content.tsx`. Has tab switching (Individuals / Students & Teachers / Organizations), `PricingCard` component, `FEATURE_PAYMENTS_ENABLED` free-mode gate showing a bare "Free Access" state. Uses `bg-zinc-100` instead of `bg-background`, hardcoded `text-zinc-900` / `text-zinc-600` instead of semantic tokens. No FAQ section. No CTA section below cards. | Replace zinc tokens with semantic tokens; add FAQ section; add CTA banner; ensure free-mode state is styled to full fidelity |
| About | `/about` | **Fully built** — `about/page.tsx` is a single-file page. Has: hero, Philip's story (2-col grid), technology pillars (3-col card grid), CTA section. Uses `bg-zinc-100` page background and `border-zinc-200` borders instead of semantic tokens. Two hardcoded hex colors (`#1535A8`, `#2D9F6F`, `#8896A7`) in contact-area imports but also present in about. Otherwise structurally sound. | Token-align the zinc classes; extract reusable section sub-patterns documented here |
| Contact | `/contact` | **Fully built** — `contact/page.tsx` is a single-file page. Has: hero, contact cards (email + response time), social links, FAQ grid. Hardcoded hex values: `#1535A8` (hover color on email link), `#2D9F6F` (response time text), `#8896A7` (social label). No contact form (email-only pattern, intentional for a solo product). Missing: a full `<form>` element per Flowbite contact-form reference. | Add proper `<form>` with server action; replace hardcoded hex with semantic tokens |

### Key Finding: Component Library Already Exists

`src/components/marketing/` already contains 18+ components. This plan does **not** rebuild from scratch — it documents the target spec for each section, identifies token/structural gaps, and defines the remaining build work for missing or misaligned pieces.

**Existing marketing components:**
- `HeroSection.tsx` + `hero/` subfolder (DashboardPeek, HeroCards)
- `HeroHeadline.tsx`
- `BentoFeatureGrid.tsx`
- `ComparisonSection.tsx`
- `FeatureSectionLayout.tsx`
- `FinalCtaSection.tsx`
- `HowItWorksSection.tsx`
- `LandingPrimitives.tsx` (Starburst, NoiseOverlay, DottedGridOverlay)
- `LogoMarquee.tsx`
- `MarketingFooter.tsx`
- `MarketingNav.tsx`
- `PricingCard.tsx`
- `QuestionsSection.tsx`
- `SocialProofBar.tsx`
- `TestimonialShowcase.tsx`
- `ThreeDLabSection.tsx`
- `AnalyticsSection.tsx`
- `WikiSection.tsx`

---

## 2. Section Library

Reusable section components built once and composed across pages. Where the component already exists, this defines its target spec. Where it is missing, this defines what to build.

### Hero Section

- **Flowbite reference:** `data/blocks/marketing/hero.md` — centered text, announcement badge, h1, subhead, two CTA buttons, logo strip below
- **Status:** EXISTS — `src/components/marketing/HeroSection.tsx`
- **SlateCamp adaptation:**
  - Announcement badge: `bg-primary-50 text-primary` chip, not gray
  - H1: `font-display` (Plus Jakarta Sans), `clamp(2rem, 5vw, 3.25rem)`, `text-foreground`
  - Subhead: Atkinson Hyperlegible (`font-sans`), `text-text-secondary`, max 560px wide
  - Primary CTA: `<Button variant="default">` — `bg-primary text-white hover:bg-primary-700 rounded-sm`
  - Secondary CTA: `<Button variant="outline">` — `border-border text-foreground rounded-sm`
  - Background: `bg-background` with optional `NoiseOverlay` + `DottedGridOverlay` from `LandingPrimitives`
  - Social proof strip below CTAs: `SocialProofBar` component
- **Props:** `ctaHref: string`, `ctaLabel: string`, `isLoggedIn: boolean`
- **Gap:** Audit for any `bg-zinc-*` or hardcoded hex inside subcomponents `DashboardPeek`, `HeroCards`

### Feature Grid (Bento)

- **Flowbite reference:** `data/blocks/marketing/feature.md` — 3-col grid, icon circle + title + body per cell
- **Status:** EXISTS — `src/components/marketing/BentoFeatureGrid.tsx`
- **SlateCamp adaptation:**
  - Icon container: `h-10 w-10 rounded-sm bg-primary-50 text-primary` (Phosphor duotone, size 20)
  - Card: `rounded-md border border-border bg-card shadow-sm` on hover only (`hover:shadow-sm`)
  - Grid: `md:grid-cols-2 lg:grid-cols-3 gap-6`
  - Section heading: `font-display text-foreground`, eyebrow: `text-[13px] font-medium uppercase tracking-widest text-primary`
- **Gap:** Confirm no `bg-zinc-*` inside; confirm Phosphor duotone weight used not fill

### Pricing Cards

- **Flowbite reference:** `data/blocks/marketing/pricing.md` — 3-tier layout, price display, feature list with checkmarks, CTA per card
- **Status:** EXISTS partial — `src/components/marketing/PricingCard.tsx` + `pricing-content.tsx`
- **SlateCamp adaptation:**
  - 3-tier layout: Free / Pro / Team (or Individuals / Students / Organizations tabs)
  - Recommended/featured tier: `border-primary bg-primary-50` accent, `text-primary` badge "Most Popular"
  - Feature list checkmarks: Phosphor `CheckCircle` weight="fill" in `text-success` (not green-500)
  - Price display: `font-display text-[3rem] font-semibold text-foreground`
  - CTA button: `<Button variant="default">` for recommended tier, `<Button variant="outline">` for others
  - Tab switcher: existing `<Tabs>` from `ui/tabs` — already in place
  - Free-mode gate: When `FEATURE_PAYMENTS_ENABLED=false`, show full pricing UI but all CTAs → `/dashboard`; do not render bare placeholder
- **Props:** `tier`, `price`, `features[]`, `isRecommended`, `ctaLabel`, `ctaHref`
- **Gap:** Free-mode state needs full pricing layout, not a bare message; token-align `text-zinc-*` classes

### FAQ Section

- **Flowbite reference:** `data/blocks/marketing/faq.md` — 2-col grid, question-mark icon, h3 per question, paragraph answer
- **Status:** MISSING as standalone — `/contact` has an inline FAQ grid, `/pricing` has no FAQ
- **SlateCamp adaptation:**
  - Uses existing `<Accordion>` from `ui/accordion` — not plain static divs
  - OR: 2-col static grid (matching current contact page pattern) — use static grid when ≤6 Qs, Accordion when >6
  - Card per question: `rounded-md border border-border bg-card p-6 hover:shadow-sm`
  - No border-top separator (surface-first — no decorative borders)
  - Icon: Phosphor `Question` duotone in `text-muted-foreground` size 20
- **Component to create:** `src/components/marketing/FaqSection.tsx`
- **Props:** `questions: Array<{ q: string; a: string }>`, `heading?: string`, `subheading?: string`, `variant?: 'grid' | 'accordion'`

### Testimonials / Social Proof

- **Flowbite reference:** `data/blocks/marketing/testimonials.md` — 2-col card grid, blockquote, avatar, name, role
- **Status:** EXISTS — `src/components/marketing/TestimonialShowcase.tsx`
- **SlateCamp adaptation:**
  - Card: `rounded-md border border-border bg-card p-8`
  - Quote marks: Camp Cobalt SVG (not gray), or Phosphor `Quotes` duotone
  - Avatar: `rounded-full` (exception to rounded cap — avatars are always full-circle)
  - Name: `text-foreground font-semibold text-[15px]`
  - Role: `text-muted-foreground text-[13px]`
  - Grid: `lg:grid-cols-2` with max `max-w-[1200px]`
- **Gap:** Audit for hardcoded hex or gray classes

### CTA Banner

- **Flowbite reference:** `data/blocks/marketing/cta.md` — full-width band, heading, paragraph, 2-button row
- **Status:** EXISTS — `src/components/marketing/FinalCtaSection.tsx`
- **SlateCamp adaptation:**
  - Background: `bg-primary` (Camp Cobalt solid) — no gradients, no images
  - Heading: `text-white font-display clamp(1.5rem, 3vw, 2.25rem)`
  - Subhead: `text-white/70 text-[15px]`
  - Primary button: `bg-white text-primary hover:bg-white/90 rounded-sm` (inverted on dark bg)
  - Secondary button: `border border-white/30 text-white hover:bg-white/10 rounded-sm`
  - Max width: `max-w-[1200px]` centered, `py-20 px-6`
- **Props:** `heading`, `subheading`, `primaryCTA: { label, href }`, `secondaryCTA?: { label, href }`
- **Gap:** Confirm no gradient classes; confirm button uses white inverted pattern

### Contact Form

- **Flowbite reference:** `data/blocks/marketing/contact-form.md` — email, subject, message fields, submit button
- **Status:** MISSING — `/contact` page uses email-link-only pattern; no `<form>` element exists
- **SlateCamp adaptation:**
  - Uses `<Input>` from `ui/input`, `<Textarea>` from `ui/textarea`, `<Label>` from `ui/label`, `<Button>` from `ui/button`
  - `FormField` wrapper pattern from Phase 4 (label + input + error message)
  - Server action in `src/lib/actions/contact.ts` — wraps Resend or email provider, try/catch, `"use server"`
  - Success state: inline success message, not redirect
  - Form layout: single column, `space-y-6`, max-width `max-w-screen-md` centered
- **Component to create:** `src/components/marketing/ContactForm.tsx` (client component — needs `useFormState`)
- **Props:** none (self-contained with server action)

### Footer

- **Flowbite reference:** `data/blocks/marketing/footer.md` — logo + description, multi-column links, copyright
- **Status:** EXISTS — `src/components/marketing/MarketingFooter.tsx`
- **SlateCamp adaptation:**
  - Background: `bg-foreground` (Ink Primary dark) or `bg-zinc-900` — dark footer variant
  - Logo: SlateCamp wordmark/icon in white
  - Link columns: Company, Resources, Legal — `text-white/60 hover:text-white text-[14px]`
  - Copyright: `text-white/40 text-[12px]`
  - Social icons: Phosphor `InstagramLogo`, `TwitterLogo`, `LinkedinLogo` — `text-white/60 hover:text-white`
  - No border between footer and content (background contrast is the separator)
- **Gap:** Confirm link columns exist; confirm no Flowbite-specific classes

---

## 3. Page Compositions

### Landing Page (`/`)

Current composition in `LandingPageContent.tsx` — already complete. This is the **target state reference**, not a build task.

| Section Order | Component | Status | Content |
|--------------|-----------|--------|---------|
| 1 | `MarketingNav` | Built | Logo + nav links + auth CTA |
| 2 | `HeroSection` | Built | "Know Your ALE Readiness Before Exam Day" + primary + secondary CTA |
| 3 | `SocialProofBar` | Built | Stat counters or trust indicators |
| 4 | `LogoMarquee` | Built | Partner/featured logos scroll |
| 5 | `BentoFeatureGrid` | Built | 6 key features (Quiz, Wiki, 3D Lab, Analytics, SRS, Readiness Score) |
| 6 | `QuestionsSection` | Built | Quiz/drill feature deep-dive |
| 7 | `ThreeDLabSection` | Built | 3D Lab feature deep-dive |
| 8 | `AnalyticsSection` | Built | Analytics feature deep-dive |
| 9 | `WikiSection` | Built | Wiki feature deep-dive |
| 10 | `HowItWorksSection` | Built | 3-step process illustration |
| 11 | `ComparisonSection` | Built | SlateCamp vs. generic reviewers |
| 12 | `TestimonialShowcase` | Built | Candidate quotes |
| 13 | `FinalCtaSection` | Built | "Start Your Free Diagnostic" — Camp Cobalt bg |
| 14 | `MarketingFooter` | Built | Links + social + copyright |

**Token audit tasks only** — no new components needed for landing page.

### Pricing Page (`/pricing`)

| Section Order | Component | Status | Content |
|--------------|-----------|--------|---------|
| 1 | `MarketingNav` | Built | activeRoute="/pricing" |
| 2 | Hero (inline) | Partial | "Simple, Transparent Pricing" — needs token alignment |
| 3 | Tab switcher | Built | Individuals / Students & Teachers / Organizations |
| 4 | `PricingCard` ×3 | Built | Free / Pro / Team tiers per tab |
| 5 | `FaqSection` | **MISSING** | ~6 pricing-specific questions |
| 6 | `FinalCtaSection` | **MISSING** | "Start Free Today" CTA banner |
| 7 | `MarketingFooter` | Built | Standard footer |

**Build tasks:** Add FaqSection + FinalCtaSection to pricing page; fix free-mode state fidelity; token-align zinc classes.

### About Page (`/about`)

| Section Order | Component | Status | Content |
|--------------|-----------|--------|---------|
| 1 | `MarketingNav` | Built | activeRoute="/about" |
| 2 | Hero (inline) | Built | "Built by an architect, for architects." |
| 3 | Story section (inline) | Built | 2-col: "The ALE struggle" + "The mission" |
| 4 | Technology pillars (inline) | Built | 3-col card grid: IRT, SRS, Anti-inflation score |
| 5 | CTA section (inline) | Built | Camp Cobalt bg, "Ready to find out where you stand?" |
| 6 | `MarketingFooter` | Built | Standard footer |

**Build tasks:** Token-align `bg-zinc-100`, `border-zinc-200` → `bg-background`, `border-border`; replace 3 hardcoded hex values with semantic tokens; consider extracting technology pillars to `FeatureSectionLayout` if reuse occurs.

### Contact Page (`/contact`)

| Section Order | Component | Status | Content |
|--------------|-----------|--------|---------|
| 1 | `MarketingNav` | Built | activeRoute="/contact" |
| 2 | Hero (inline) | Built | "We're here to help." |
| 3 | Contact cards (inline) | Built | Email + Response time cards |
| 4 | Social links (inline) | Built | Instagram, Twitter, LinkedIn |
| 5 | `ContactForm` | **MISSING** | Name, email, subject, message + server action |
| 6 | FAQ grid (inline) | Built | 4 pricing/product Q&As in 2-col grid |
| 7 | `MarketingFooter` | Built | Standard footer |

**Build tasks:** Create `ContactForm` component + server action; token-align 3 hardcoded hex values; reorder sections so form appears before FAQ.

---

## 4. Token Alignment Audit

All marketing pages use `bg-zinc-100`, `border-zinc-200`, and hardcoded hex values that violate design system rules. These must be replaced before any page is considered "done."

### Hardcoded hex violations found

| File | Violation | Replacement |
|------|-----------|-------------|
| `src/app/contact/page.tsx:74` | `hover:text-[#1535A8]` | `hover:text-primary-700` |
| `src/app/contact/page.tsx:93` | `text-[#2D9F6F]` | `text-success` |
| `src/app/contact/page.tsx:101` | `text-[#8896A7]` | `text-muted-foreground` |
| `src/app/pricing/pricing-content.tsx:53` | `text-zinc-900` | `text-foreground` |
| `src/app/pricing/pricing-content.tsx:58` | `text-zinc-600` | `text-text-secondary` |

### Semantic token replacements

| Old class | New class | Rationale |
|-----------|-----------|-----------|
| `bg-zinc-100` | `bg-background` | Page background token |
| `border-zinc-200` | `border-border` | Border token |
| `bg-zinc-50` | `bg-muted` | Muted surface |
| `text-zinc-900` | `text-foreground` | Primary text |
| `text-zinc-600` | `text-text-secondary` | Secondary text |
| `text-zinc-400` | `text-muted-foreground` | Muted text |

---

## 5. Implementation Steps

### Phase 6.1 — Token Alignment (No new components)

- [ ] **6.1a** Fix `src/app/contact/page.tsx` — replace 3 hardcoded hex values with semantic tokens
- [ ] **6.1b** Fix `src/app/about/page.tsx` — replace `bg-zinc-100`, `border-zinc-200` with `bg-background`, `border-border`
- [ ] **6.1c** Fix `src/app/pricing/pricing-content.tsx` — replace `text-zinc-900`, `text-zinc-600` with `text-foreground`, `text-text-secondary`; fix `bg-zinc-100` in `pricing/page.tsx`
- [ ] **6.1d** Audit `src/components/marketing/` for any remaining `bg-zinc-*`, `text-zinc-*`, or hardcoded hex — grep and fix
- [ ] **6.1e** Verify `bun run type-check` and `bun run lint` pass after all token changes

### Phase 6.2 — Create FaqSection Component

- [ ] **6.2a** Create `src/components/marketing/FaqSection.tsx`
  - Flowbite reference: `data/blocks/marketing/faq.md`
  - Props: `questions: Array<{ q: string; a: string }>`, `heading?: string`, `subheading?: string`, `variant?: 'grid' | 'accordion'`
  - `grid` variant: 2-col `sm:grid-cols-2` static card grid for ≤6 questions (matches contact page pattern)
  - `accordion` variant: wraps `<Accordion>` from `ui/accordion` for >6 questions
  - Cards use `rounded-md border border-border bg-card p-6 hover:shadow-sm transition-shadow duration-150`
  - No flowbite-react imports; uses SlateCamp ui/ primitives only
- [ ] **6.2b** Add FAQ section to `/pricing` page with pricing-specific questions:
  1. "Can I really use SlateCamp for free?" → Yes, diagnostic + core questions free, no account required
  2. "What's included in the Pro plan?" → Full question bank, SRS scheduling, detailed analytics
  3. "Can I cancel anytime?" → Yes, no lock-in, cancel from account settings
  4. "Is there a student discount?" → Educational tier pricing available
  5. "What payment methods do you accept?" → Major cards via LemonSqueezy
  6. "What if I'm not satisfied?" → 7-day refund policy, no questions asked
- [ ] **6.2c** Add Storybook story: `src/components/marketing/FaqSection.stories.tsx`
- [ ] **6.2d** Run `bun run check:storybook` to validate

### Phase 6.3 — Add CTA to Pricing Page

- [ ] **6.3a** Import `FinalCtaSection` (or compose inline) into `pricing/page.tsx` below FAQ section
  - Heading: "Start studying smarter today."
  - Subhead: "Free access, no account required. Upgrade when you're ready."
  - Primary CTA: "Get Your Free Readiness Score" → `/try`
  - Secondary CTA: "Go to Dashboard" (if logged in) or "Sign up free" → `/register`
- [ ] **6.3b** Fix free-mode state: when `FEATURE_PAYMENTS_ENABLED=false`, render full pricing UI with all CTAs pointing to `/dashboard` — not the bare "Free Access" placeholder

### Phase 6.4 — Create ContactForm Component

- [ ] **6.4a** Create `src/lib/actions/contact.ts`
  - `"use server"` directive at top
  - Export `sendContactMessage(formData: FormData): Promise<{ success: boolean; error?: string }>`
  - Wrap in try/catch — never let raw errors propagate to client
  - Initial implementation: log to console + return success (wire up email provider in separate task)
- [ ] **6.4b** Create `src/components/marketing/ContactForm.tsx` (client component — `'use client'`)
  - Uses `<Input>`, `<Textarea>`, `<Label>`, `<Button>` from `ui/`
  - Uses `FormField` wrapper pattern
  - Fields: name, email, subject, message (required)
  - Calls server action via `useActionState` (React 19 pattern, matches codebase React 19.2.4)
  - Success state: inline confirmation message, form reset
  - Error state: inline field-level error messages
  - Flowbite reference layout: `data/blocks/marketing/contact-form.md` — single column, `space-y-6`, `max-w-screen-md`
- [ ] **6.4c** Insert `ContactForm` into `/contact` page above the FAQ section
- [ ] **6.4d** Add Storybook story: `src/components/marketing/ContactForm.stories.tsx`
- [ ] **6.4e** Run `bun run check:storybook` + `bun run type-check`

### Phase 6.5 — Responsive Verification

- [ ] **6.5a** Verify all marketing pages at 375px (mobile), 768px (tablet), 1440px (desktop)
  - Landing: check BentoFeatureGrid collapses correctly on mobile
  - Pricing: check tab switcher wraps gracefully on 375px
  - About: check 2-col story grid stacks on mobile
  - Contact: check ContactForm fields are full-width on mobile
- [ ] **6.5b** Save screenshots to `.ai/plans/screenshots/phase-6/` for each breakpoint

### Phase 6.6 — Dark Mode Verification

- [ ] **6.6a** Enable dark mode and verify all marketing pages render correctly
  - Key risk: hardcoded `bg-zinc-*` classes do not respond to dark mode tokens
  - Confirm `bg-background`, `bg-card`, `border-border` dark variants apply correctly
  - Confirm `text-primary` dark variant (`#5B7FE0`) renders on dark backgrounds with sufficient contrast
- [ ] **6.6b** Verify `FaqSection` and `ContactForm` dark mode states

### Phase 6.7 — Storybook Coverage

- [ ] **6.7a** Confirm all existing `src/components/marketing/*.tsx` components have stories or add them
  - Missing stories: audit with `bun run check:storybook`
  - New stories required for: `FaqSection`, `ContactForm`
- [ ] **6.7b** Run `bun run build-storybook` to confirm zero Storybook build errors

---

## 6. Constraints

- **Camp Cobalt accent everywhere** — never Flowbite's default blue (`#1C64F2`). Always map to `text-primary` / `bg-primary` / `text-primary-700`
- **Atkinson Hyperlegible for body** — `font-sans` default. Use `font-display` (Plus Jakarta Sans) for section headings only
- **Max border-radius 8px** — `rounded-lg` is the ceiling. `rounded-md` (6px) for cards, `rounded-sm` (4px) for buttons/inputs, `rounded-full` only for avatars
- **Surface-first elevation** — cards use `shadow-sm` on hover, never borders as the primary elevation signal. `border border-border` is acceptable as a structural separator, not decoration
- **No flowbite-react imports** — all sections built with SlateCamp `ui/` primitives only
- **No flowbite-icons** — use `@phosphor-icons/react/dist/ssr` exclusively (duotone weight for feature icons, regular for UI icons)
- **No gamification** — no confetti, badges, streaks, or virtual currency anywhere on marketing pages
- **SlideToSubmit identity lock does not apply here** — marketing pages have no quiz components; the lock from `identity_preservation_lock.md` is scoped to quiz/testing flows only
- **Payments disabled** — `FEATURE_PAYMENTS_ENABLED=false` per `.ai/archive/payment_decoupling_plan.md`. Pricing page must render gracefully in free mode without placeholder states
- **Server Components default** — marketing page files (`page.tsx`) remain server components. Only `ContactForm` requires `'use client'` (form state). `PricingContent` is already `'use client'` for tab switching — acceptable
- **No `select('*')` if any Supabase queries are added** — explicit column selects only

---

## 7. Flowbite Reference Index

All references are local files — no network access required.

| Section | Tailwind Pattern | React Block |
|---------|-----------------|-------------|
| Hero | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/hero.md` | `flowbite/flowbite-react-blocks-1.8.0-beta/app/marketing-ui/` |
| Feature grid | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/feature.md` | Same |
| Pricing | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/pricing.md` | Same |
| FAQ | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/faq.md` | Same |
| Testimonials | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/testimonials.md` | Same |
| CTA | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/cta.md` | Same |
| Contact form | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/contact-form.md` | Same |
| Footer | `flowbite/flowbite-mcp-pro-1.0.0/data/blocks/marketing/footer.md` | Same |

**Protocol:** Read the `.md` Tailwind pattern → strip Flowbite classes → apply SlateCamp token mapping from `design_system_migration_plan.md §0` → build with `ui/` primitives. Never import `flowbite-react` components.

---

## 8. Success Criteria

1. **Zero hardcoded hex values** on any marketing page or marketing component — `bun run lint` passes the hex color rule
2. **Zero `bg-zinc-*` / `text-zinc-*`** on marketing pages — all replaced with semantic tokens
3. **`FaqSection` component** exists at `src/components/marketing/FaqSection.tsx` with grid + accordion variants, Storybook story passing
4. **`ContactForm` component** exists at `src/components/marketing/ContactForm.tsx` with server action, Storybook story passing
5. **Pricing page free-mode** renders at full fidelity — pricing cards visible, CTAs route to `/dashboard`
6. **All marketing pages pass** `bun run type-check` and `bun run lint` with zero errors
7. **Responsive** — all four pages verified at 375px, 768px, 1440px
8. **Dark mode** — all four pages render correctly in dark mode with correct token application
9. **Storybook** — `bun run check:storybook` and `bun run build-storybook` pass
