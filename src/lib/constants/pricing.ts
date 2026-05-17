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

// ─── VIEW 1: STUDENTS / GRADUATES ─────────────────────────────────────────────

export const STUDENT_GRADUATE_TIERS: PricingTier[] = [
  {
    id: 'student-free',
    tierName: 'Trailhead',
    subtitle: 'Free starter camp',
    targetAudience: 'Architecture students beginning their LEA review trail',
    price: '₱0',
    priceSubtext: '/ month',
    hook: 'Start the map, try the basics, and build the review habit.',
    features: [
      'Architecture wiki and code explainers',
      'Starter quiz access with basic answer feedback',
      'Selected visual explainers and sample tools',
      'Upgrade when you need schedules, deeper analytics, and 3D Lab access',
    ],
    highlighted: false,
    ctaLabel: 'Start at Trailhead',
    ctaHref: '/register',
  },
  {
    id: 'student-pro',
    tierName: 'Basecamp',
    subtitle: 'Board-season workspace',
    targetAudience: 'Graduates and LEA takers who want the full review workspace',
    price: '₱499',
    priceSubtext: '/ month',
    hook: 'Set up camp with notes, visuals, quizzes, and next steps in one calmer place.',
    features: [
      'Everything in Trailhead',
      'Ad-free atlas workspace',
      'Saved review schedule and personal notes',
      '3D Lab access for visual code and planning topics',
      'Progress and weak-topic signals for what to revisit',
    ],
    highlighted: true,
    ctaLabel: 'Enter Basecamp',
    ctaHref: '/register',
  },
  {
    id: 'student-prime',
    tierName: 'Summit Atlas',
    subtitle: 'Guided readiness',
    targetAudience: 'Board exam takers who want deeper diagnostics and guidance',
    price: '₱999',
    priceSubtext: '/ month',
    hook: 'Climb with a clearer map of what is still weak before mock exams expose it.',
    features: [
      'Everything in Basecamp',
      'Readiness map with subject and weak-topic guidance',
      'Timed Quiz for exam-style pacing',
      'AI Tutor Basic for guided explanations and review prompts',
      'More detailed review signals after practice sessions',
    ],
    highlighted: false,
    ctaLabel: 'Open Summit Atlas',
    ctaHref: '/register',
  },

]

export const STUDENT_GRADUATE_ANNUAL_TIERS: PricingTier[] = STUDENT_GRADUATE_TIERS.map((tier) => {
  if (tier.id === 'student-pro') {
    return {
      ...tier,
      id: 'student-pro-annual',
      price: '₱4,990',
      originalPrice: '₱5,988',
      priceSubtext: '/ year',
      hook: 'Set your board-season basecamp for the year and save compared with monthly access.',
      features: [
        ...tier.features,
        'Annual access priced for a full review season',
      ],
    }
  }

  if (tier.id === 'student-prime') {
    return {
      ...tier,
      id: 'student-prime-annual',
      price: '₱9,990',
      originalPrice: '₱11,988',
      priceSubtext: '/ year',
      hook: 'Keep the Summit Atlas open across mock exams, review cycles, and final repair passes.',
      features: [
        ...tier.features,
        'Annual access for longer review arcs and retakers',
      ],
    }
  }

  return {
    ...tier,
    id: 'student-free-annual',
    priceSubtext: 'always free',
    hook: 'Start the map for free, then upgrade when your review season needs a fuller camp.',
  }
})

// Legacy export for existing consumers / stories.
export const INDIVIDUAL_TIERS = STUDENT_GRADUATE_TIERS

// ─── VIEW 2: PROFESSIONALS ────────────────────────────────────────────────────

export const PROFESSIONAL_TIERS: PricingTier[] = [
  {
    id: 'professional-reference',
    tierName: 'Field Atlas',
    subtitle: 'Practice reference',
    targetAudience: 'Licensed architects, apprentices, and small studios',
    price: '₱1,499',
    priceSubtext: '/ month',
    hook: 'Use SlateCamp as a field guide for code, specification, and spatial checks in practice.',
    features: [
      'Everything in Summit Atlas',
      'Advanced 3D Lab and spatial calculators',
      'Unlimited AI Tutor for code, planning, and specification questions',
      'Professional notes workspace for recurring references',
      'Useful for quick internal refreshers, not a substitute for signed professional judgment',
    ],
    highlighted: true,
    ctaLabel: 'Open Field Atlas',
    ctaHref: '/register',
  },

]

export const PROFESSIONAL_ANNUAL_TIERS: PricingTier[] = PROFESSIONAL_TIERS.map((tier) => ({
  ...tier,
  id: 'professional-reference-annual',
  price: '₱14,990',
  originalPrice: '₱17,988',
  priceSubtext: '/ year',
  hook: 'Keep a Field Atlas available for recurring code, specification, and spatial checks all year.',
  features: [
    ...tier.features,
    'Annual practice-reference access for studios and recurring project checks',
  ],
}))

// ─── VIEW 3: INSTITUTIONAL ────────────────────────────────────────────────────

export const INSTITUTIONAL_TIERS: PricingTier[] = [
  {
    id: 'institutional-cohort',
    tierName: 'Campus Basecamp',
    subtitle: 'Cohort license',
    targetAudience: 'Architecture schools, review groups, and academic cohorts',
    price: '₱1,440',
    originalPrice: '₱1,800',
    priceSubtext: '/ seat / cycle · min. 50 seats',
    hook: 'Give a whole cohort the same organized camp map, practice path, and visual tools.',
    features: [
      'Full Basecamp access for enrolled learners',
      'Instructor dashboard for aggregate weak-topic visibility',
      'Cohort onboarding and access coordination',
      'Useful beside studio, lectures, review-center sessions, books, and mentors',
    ],
    highlighted: false,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
  {
    id: 'institutional-partner',
    tierName: 'Atlas Partner',
    subtitle: 'Digital curriculum partner',
    targetAudience: 'Schools and review organizations that need deeper platform support',
    price: 'Custom',
    priceSubtext: 'volume pricing + setup',
    hook: 'Build a structured atlas layer around your own teaching flow.',
    features: [
      'Everything in Campus Basecamp',
      `Co-branding options such as "${siteConfig.name} powered by [Your School]"`,
      'Question Builder for instructor-authored practice and assignments',
      'Custom onboarding, cohort reporting, and support cadence',
    ],
    highlighted: true,
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
  },
]

// Legacy export for existing consumers.
export const EDUCATIONAL_TIERS = INSTITUTIONAL_TIERS

// ─── VIEW 4: CORPORATE ────────────────────────────────────────────────────────

export const CORPORATE_TIERS: PricingTier[] = [
  {
    id: 'corporate-partner',
    tierName: 'Summit Sponsor',
    subtitle: 'Access + scholarship seats',
    targetAudience: 'Architecture firms, AEC teams, suppliers, and industry partners',
    price: 'Contact for pricing',
    hook: 'Equip your team and sponsor the next climbers on the SlateCamp trail.',
    features: [
      'Full SlateCamp access for purchased team or partner seats',
      'For every paid seat bought, SlateCamp grants 1 scholarship seat',
      'Scholarship seats go to partner schools plus students and board exam takers who apply for access',
      'Scholarship recipients receive access to all SlateCamp features during the approved scholarship period',
      'Optional corporate training mode for internal code, specification, and product-learning workflows',
      'Clear consent boundaries for any recruitment, sponsorship, or brand-placement programs',
    ],
    highlighted: true,
    ctaLabel: 'Contact for Pricing',
    ctaHref: '/contact',
  },
]

// Legacy re-export for any components that still reference ORGANIZATION_TIERS
export const ENTERPRISE_TIERS = CORPORATE_TIERS
export const ORGANIZATION_TIERS = [...INSTITUTIONAL_TIERS, ...CORPORATE_TIERS]
