import { siteConfig } from './site'

export interface PricingTier {
  id: string
  tierName: string
  subtitle: string
  targetAudience: string
  price: string
  originalPrice?: string
  priceSubtext?: string
  hook: string
  features: string[]
  limits?: string[]
  highlighted: boolean
  ctaLabel: string
  ctaHref: string
}

// ─── VIEW 1: FOR INDIVIDUALS / REVIEWERS ─────────────────────────────────────

export const INDIVIDUAL_TIERS: PricingTier[] = [
  {
    id: 'free',
    tierName: 'Free',
    subtitle: 'The Acquisition Engine',
    targetAudience: '1st to 4th-year architecture students',
    price: '₱0',
    priceSubtext: 'Ad-Supported',
    hook: 'Build the habit before the grind.',
    features: [
      'Unlimited access to the Wiki',
      'Review Mode (stress-free doomscroll question feed)',
    ],
    limits: [
      'No analytics',
      'No SRS (Spaced Repetition System)',
      'No 3D Lab',
      'No AI Tutor',
    ],
    highlighted: false,
    ctaLabel: 'Start Free',
    ctaHref: '/register',
  },
  {
    id: 'standard-pro',
    tierName: 'Standard — Pro',
    subtitle: 'The "ALE Season Pass"',
    targetAudience: 'Active Board Exam Reviewees',
    price: '₱800',
    originalPrice: '₱1200',
    priceSubtext: '/ month, billed biannually',
    hook: 'Everything you need to pass the ALE.',
    features: [
      '100% Ad-Free',
      'Sessions Mode & Full SRS algorithmic tracking',
      'F-01 Readiness Score — pass-probability dashboard gauge',
      'Final Stretch Mock Exams — high-frequency drills for D-30 / D-14 / D-7',
      '3D Lab access — interactive visual models',
    ],
    highlighted: true,
    ctaLabel: 'Get the Season Pass',
    ctaHref: '/register',
  },
  {
    id: 'standard-max',
    tierName: 'Standard — Max',
    subtitle: 'The "Practitioner Bundle"',
    targetAudience: 'Licensed Architects & Alumni',
    price: '₱1200',
    originalPrice: '₱1800',
    priceSubtext: '/ month, billed biannually',
    hook: 'Your pocket reference for professional practice.',
    features: [
      'Everything in Pro',
      'Unlimited AI Tutor — ask complex code & spec questions via RAG',
      'Client Mode — interactive Rule 7/8 setback calculators & BP 220 3D visualizers for professional meetings',
    ],
    highlighted: false,
    ctaLabel: 'Get the Bundle',
    ctaHref: '/register',
  },
]

// ─── VIEW 2: FOR STUDENTS / TEACHERS (EDUCATIONAL) ───────────────────────────

export const EDUCATIONAL_TIERS: PricingTier[] = [
  {
    id: 'edu-pro',
    tierName: 'Educational — Pro',
    subtitle: 'The "Cohort License"',
    targetAudience: 'Universities & review center cohorts',
    price: '₱1,440',
    originalPrice: '₱1,800',
    priceSubtext: '/ seat / cycle (Min. 50 seats)',
    hook: "Upgrade your cohort's passing rate.",
    features: [
      'Full Standard-Pro access for all enrolled students',
      'Instructor Dashboard — view aggregate batch weak points to adjust live lectures',
    ],
    highlighted: false,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
  {
    id: 'edu-max',
    tierName: 'Educational — Max',
    subtitle: 'The "Digital Curriculum Partner"',
    targetAudience: 'Premium review centers & academic partners',
    price: 'Custom',
    priceSubtext: 'Volume Pricing + Setup Fee',
    hook: 'Your branded digital testing platform.',
    features: [
      'Everything in Educational-Pro',
      `Co-Branding ("${siteConfig.name} powered by [Your Name]")`,
      'Custom Session Builder — instructors inject their own questions & push as Daily Missions',
    ],
    highlighted: true,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
]

// ─── VIEW 3: FOR ORGANIZATIONS (ENTERPRISE) ──────────────────────────────────

export const ENTERPRISE_TIERS: PricingTier[] = [
  {
    id: 'enterprise-pro',
    tierName: 'Enterprise — Pro',
    subtitle: 'The "Brand Sponsor"',
    targetAudience: 'Construction material suppliers (Boysen, Holcim, etc.)',
    price: 'Custom',
    priceSubtext: 'High-Ticket Monthly Retainer',
    hook: 'Get your materials specified by the next generation of architects.',
    features: [
      'Native, seamless ad placements within the Free tier',
      '3D Lab Product Placement — sponsored plumbing/structural systems with catalog links',
    ],
    highlighted: false,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
  {
    id: 'enterprise-max',
    tierName: 'Enterprise — Max',
    subtitle: 'The "Ecosystem & Recruitment Partner"',
    targetAudience: 'Top-tier architectural & engineering firms',
    price: 'Custom',
    priceSubtext: 'Annual Contract',
    hook: 'Direct access to the top 1% of architectural talent.',
    features: [
      'Everything in Enterprise-Pro',
      'Recruitment Pipeline — opt-in access to contact top-scoring users for job offers',
      'Corporate Training Mode — internal code-compliance & specification tooling',
    ],
    highlighted: true,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
]

// Legacy re-export for any components that still reference ORGANIZATION_TIERS
export const ORGANIZATION_TIERS = [...EDUCATIONAL_TIERS, ...ENTERPRISE_TIERS]
