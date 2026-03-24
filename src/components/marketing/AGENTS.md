<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# marketing

## Purpose

Marketing and landing page components for SlateCamp. Contains hero sections, pricing tiers, testimonials, feature grids, and promotional sections. All components follow the Campfire design system with warm, inviting aesthetics and growth-framed messaging.

## Key Files

| File | Description |
|------|-------------|
| `HeroHeadline.tsx` | Hero headline "Know you'll win." with rough-notation animations (circle, underline, highlight) |
| `HeroSection.tsx` | Main hero section with headline, CTA, mock question card, ALE coverage card, readiness snapshot |
| `PricingCard.tsx` | Pricing tier card component with features, limits, CTA button |
| `TestimonialShowcase.tsx` | 3-column testimonial cards with star ratings (5-star), quotes, names, titles |
| `FloatingTestimonialMarquee.tsx` | Marquee component with floating testimonials (currently unused in HeroSection) |
| `BentoFeatureGrid.tsx` | 3D bento grid showcasing core features (Questions, 3D Lab, Analytics, Wiki) |
| `FeatureSectionLayout.tsx` | Reusable layout for feature sections with left/right image + text combinations |
| `HowItWorksSection.tsx` | Step-by-step flow explaining how SlateCamp works |
| `ComparisonSection.tsx` | Feature comparison table (SlateCamp vs traditional study methods) |
| `QuestionsSection.tsx` | Section showcasing AI-powered question features |
| `ThreeDLabSection.tsx` | Section highlighting 3D Lab spatial computing features (React Three Fiber) |
| `AnalyticsSection.tsx` | Section on Readiness Score and mastery tracking |
| `WikiSection.tsx` | Section on AI Wiki with citation badges |
| `FinalCtaSection.tsx` | Bottom CTA section before footer |
| `MarketingNav.tsx` | Navigation bar with logo, menu items, auth buttons |
| `MarketingFooter.tsx` | Footer with links, social, legal |
| `LogoMarquee.tsx` | Scrolling marquee of supporting institution logos |
| `SocialProofBar.tsx` | Social proof stats (e.g., "1000+ students passed") |
| `LandingPrimitives.tsx` | Reusable SVG/visual primitives (Starburst, NoiseOverlay, DottedGridOverlay, ReadinessDial) |
| `GoogleIcon.tsx` | Google logo icon component |

## For AI Agents

### Working In This Directory

- **Design System**: All colors from Campfire palette (Camp Cobalt #1B3FC4, Camp Orange #E8853A, Emerald #2D9F6F, Warm Red #D64545, Amber #D4951A)
- **Typography**: Inter font, minimum 11px text size, never below
- **Animations**: Use Framer Motion with max 300ms duration, default ease-out
- **Voice**: Growth-framed messaging (not fear-based), specific CTAs, warm and supportive tone
- **Responsive**: Mobile-first, use `md:` and `lg:` breakpoints
- **Cards**: No shadow at rest, `shadow-sm` on hover, `rounded-md` (8px)
- **Testimonials**: Real data only; placeholder marked with "PLACEHOLDER" comment at top of component
- **Pricing**: Features use green check (Emerald), limits use gray X
- **Colors in code**: Use hex values or Tailwind classes from design system, not arbitrary colors

### Dependencies
### Internal

- `LandingPrimitives.tsx` - Shared SVG components and visual utilities
- `@/components/graphics/icons/Icon.tsx` - Icon wrapper (SCIcon)
- `@/lib/constants/pricing` - Pricing tier definitions (PricingTier type)
- `@/lib/utils` - `cn()` utility for class merging
- Framer Motion (`framer-motion`) - Animations on hero cards
- Rough Notation (`rough-notation`) - Hand-drawn annotation effects on headline
- Next.js (`next/font/google`) - Font loading (Instrument Serif for quotes, Geist Sans for headings)
- Phosphor Icons (`@phosphor-icons/react`) - Icon set

<!-- MANUAL: Keep testimonials section updated with real user feedback before launch. Replace placeholder quotes with verified student stories. -->
