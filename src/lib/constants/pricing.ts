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
    tierName: 'Free',
    subtitle: 'Starter Atlas',
    targetAudience: 'Architecture students beginning their LEA review map',
    price: '₱0',
    priceSubtext: '/ month',
    hook: 'Look up the topic, try the basics, and build the habit.',
    features: [
      'Architecture wiki and code explainers',
      'Starter quiz access with basic answer feedback',
      'Selected visual explainers and sample tools',
      'Upgrade when you need schedules, deeper analytics, and 3D Lab access',
    ],
    highlighted: false,
    ctaLabel: 'Start Free',
    ctaHref: '/register',
  },
  {
    id: 'student-pro',
    tierName: 'Pro',
    subtitle: 'Board-Season Workspace',
    targetAudience: 'Graduates and LEA takers who want the full review workspace',
    price: '₱499',
    priceSubtext: '/ month',
    hook: 'Keep notes, visuals, quizzes, and next steps in one calmer place.',
    features: [
      'Everything in Free',
      'Ad-free atlas workspace',
      'Saved review schedule and personal notes',
      '3D Lab access for visual code and planning topics',
      'Progress and weak-topic signals for what to revisit',
    ],
    highlighted: true,
    ctaLabel: 'Go Pro',
    ctaHref: '/register',
  },
  {
    id: 'student-prime',
    tierName: 'Prime',
    subtitle: 'Guided Readiness',
    targetAudience: 'Board exam takers who want deeper diagnostics and guidance',
    price: '₱999',
    priceSubtext: '/ month',
    hook: 'See what is still weak before it surprises you in mock exams.',
    features: [
      'Everything in Pro',
      'Readiness map with subject and weak-topic guidance',
      'Timed Quiz for exam-style pacing',
      'AI Tutor Basic for guided explanations and review prompts',
      'More detailed review signals after practice sessions',
    ],
    highlighted: false,
    ctaLabel: 'Go Prime',
    ctaHref: '/register',
  },
]

// Legacy export for existing consumers / stories.
export const INDIVIDUAL_TIERS = STUDENT_GRADUATE_TIERS

// ─── VIEW 2: PROFESSIONALS ────────────────────────────────────────────────────

export const PROFESSIONAL_TIERS: PricingTier[] = [
  {
    id: 'professional-reference',
    tierName: 'Professional',
    subtitle: 'Practice Reference',
    targetAudience: 'Licensed architects, apprentices, and small studios',
    price: '₱1,499',
    priceSubtext: '/ month',
    hook: 'Use SlateCamp as a field guide for code, specification, and spatial checks.',
    features: [
      'Everything in Prime',
      'Advanced 3D Lab and spatial calculators',
      'Unlimited AI Tutor for code, planning, and specification questions',
      'Professional notes workspace for recurring references',
      'Useful for quick internal refreshers, not a substitute for signed professional judgment',
    ],
    highlighted: true,
    ctaLabel: 'Go Professional',
    ctaHref: '/register',
  },
]

// ─── VIEW 3: INSTITUTIONAL ────────────────────────────────────────────────────

export const INSTITUTIONAL_TIERS: PricingTier[] = [
  {
    id: 'institutional-cohort',
    tierName: 'Institutional',
    subtitle: 'Cohort License',
    targetAudience: 'Architecture schools, review groups, and academic cohorts',
    price: '₱1,440',
    originalPrice: '₱1,800',
    priceSubtext: '/ seat / cycle · min. 50 seats',
    hook: 'Give a whole cohort the same organized map, practice path, and visual tools.',
    features: [
      'Full Pro access for enrolled learners',
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
    tierName: 'Institutional Partner',
    subtitle: 'Digital Curriculum Partner',
    targetAudience: 'Schools and review organizations that need deeper platform support',
    price: 'Custom',
    priceSubtext: 'volume pricing + setup',
    hook: 'Build a structured digital resource layer around your own teaching flow.',
    features: [
      'Everything in Institutional Cohort',
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
    tierName: 'Corporate Partner',
    subtitle: 'Access + Scholarship Seats',
    targetAudience: 'Architecture firms, AEC teams, suppliers, and industry partners',
    price: 'Contact for pricing',
    hook: 'Buy seats for your team and help fund access for future architects.',
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
