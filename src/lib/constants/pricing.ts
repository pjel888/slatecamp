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
    hook: 'Build the habit before exam day.',
    features: [
      'Unlimited access to the Wiki',
      'Quiz (basic feedback quizzing)',
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
    id: 'pro',
    tierName: 'Pro',
    subtitle: 'The "LEA Season Pass"',
    targetAudience: 'Active LEA Reviewees',
    price: '₱499',
    priceSubtext: '/ month',
    hook: 'Everything you need to pass the LEA.',
    features: [
      '100% Ad-Free',
      'Full SRS (Spaced Repetition System)',
      '3D Lab access — interactive visual models',
      'Personal Notes Workspace',
    ],
    highlighted: true,
    ctaLabel: 'Go Pro',
    ctaHref: '/register',
  },
  {
    id: 'prime',
    tierName: 'Prime',
    subtitle: 'The "Readiness Guarantee"',
    targetAudience: 'Serious Reviewees',
    price: '₱999',
    priceSubtext: '/ month',
    hook: 'Data-driven certainty for your licensure.',
    features: [
      'Everything in Pro',
      'F-01 Readiness Score — pass-probability gauge',
      'Timed Quiz — high-pressure exams',
      'AI Tutor (Basic) — 10k monthly tokens',
    ],
    highlighted: false,
    ctaLabel: 'Go Prime',
    ctaHref: '/register',
  },
  {
    id: 'institutional',
    tierName: 'Institutional',
    subtitle: 'The "Professional Edge"',
    targetAudience: 'Licensed Architects & Firms',
    price: '₱1499',
    priceSubtext: '/ month',
    hook: 'Your pocket reference for professional practice.',
    features: [
      'Everything in Prime',
      'Unlimited AI Tutor — ask complex code & spec questions',
      'Advanced Spatial Tools — 3D setback calculators',
    ],
    highlighted: false,
    ctaLabel: 'Go Institutional',
    ctaHref: '/register',
  },
  {
    id: 'enterprise',
    tierName: 'Enterprise',
    subtitle: 'The "Ecosystem Partner"',
    targetAudience: 'Organizations & large teams',
    price: 'Custom',
    priceSubtext: 'Annual Contract',
    hook: 'Full platform access for your organization.',
    features: [
      'Everything in Institutional',
      'Dedicated account management',
      'Custom integrations & API access',
      'Priority support & SLA',
    ],
    highlighted: false,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
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
      'Full Pro access for all enrolled students',
      'Instructor Dashboard — view aggregate batch weak points to adjust live lectures',
    ],
    highlighted: false,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
  {
    id: 'edu-institutional',
    tierName: 'Educational — Institutional',
    subtitle: 'The "Digital Curriculum Partner"',
    targetAudience: 'Premium review centers & academic partners',
    price: 'Custom',
    priceSubtext: 'Volume Pricing + Setup Fee',
    hook: 'Your branded digital testing platform.',
    features: [
      'Everything in Educational — Camp',
      `Co-Branding ("${siteConfig.name} powered by [Your Name]")`,
      'Quiz Builder — instructors inject their own questions & push as Daily Missions',
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
    id: 'enterprise-institutional',
    tierName: 'Enterprise — Institutional',
    subtitle: 'The "Ecosystem & Recruitment Partner"',
    targetAudience: 'Top-tier architectural & engineering firms',
    price: 'Custom',
    priceSubtext: 'Annual Contract',
    hook: 'Direct access to the top 1% of architectural talent.',
    features: [
      'Everything in Enterprise — Pro',
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
