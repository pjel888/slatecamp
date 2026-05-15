import { ROUTES } from '@/lib/routes'
import type { HeaderHeroProps } from '@/components/layout/HeaderHero'

// ---------------------------------------------------------------------------
// Category hero configuration — maps route paths to hero props.
// Single source of truth for what hero appears on each category page.
// ---------------------------------------------------------------------------

export interface CategoryHeroConfig {
  /** Matches the pathname prefix. */
  pathPrefix: string
  /** Hero props. Category/accent/icon set per category convention. */
  hero: HeaderHeroProps
}

/**
 * Learn: Camp Cobalt (primary) + BookOpen icon.
 * Applies to Wiki and Notes pages.
 */
const LEARN_HERO: HeaderHeroProps = {
  subtitle: '',
  category: 'Learn',
  accent: 'primary',
  description: '',
}

/**
 * Explore: Camp Orange + Cube icon.
 * Applies to 3D Lab and interactive tools.
 */
const EXPLORE_HERO: HeaderHeroProps = {
  subtitle: '',
  category: 'Explore',
  accent: 'camp-orange',
  description: '',
}

/**
 * Practice: Emerald + Target icon.
 * Applies to Quiz, Camp Trail, and Flash Cards.
 */
const PRACTICE_HERO: HeaderHeroProps = {
  subtitle: '',
  category: 'Practice',
  accent: 'emerald',
  description: '',
}

/**
 * Data: Amber + ChartBar icon.
 * Applies to Analytics.
 */
const DATA_HERO: HeaderHeroProps = {
  subtitle: '',
  category: 'Data',
  accent: 'warning',
  description: '',
}

/**
 * Master mapping of path prefixes → category hero config.
 * Pages set their own title/description via dedicated overrides below.
 * Order matters: longer prefixes first to avoid greedy matching.
 */
export const CATEGORY_HERO_MAP: CategoryHeroConfig[] = [
  // Learn
  { pathPrefix: ROUTES.dashboard.wiki, hero: LEARN_HERO },
  { pathPrefix: ROUTES.dashboard.notes, hero: LEARN_HERO },
  { pathPrefix: ROUTES.dashboard.codeUpdates, hero: LEARN_HERO },
  // Explore
  { pathPrefix: ROUTES.lab.root, hero: EXPLORE_HERO },
  { pathPrefix: ROUTES.dashboard.studio, hero: EXPLORE_HERO },
  // Practice
  { pathPrefix: ROUTES.dashboard.quiz, hero: PRACTICE_HERO },
  { pathPrefix: ROUTES.dashboard.camptrails, hero: PRACTICE_HERO },
  { pathPrefix: ROUTES.dashboard.flash, hero: PRACTICE_HERO },
  { pathPrefix: ROUTES.dashboard.areaC, hero: PRACTICE_HERO },
  { pathPrefix: ROUTES.dashboard.cramCard, hero: PRACTICE_HERO },
  { pathPrefix: ROUTES.dashboard.daeMode, hero: PRACTICE_HERO },
  // Data
  { pathPrefix: ROUTES.dashboard.analytics, hero: DATA_HERO },
  { pathPrefix: ROUTES.dashboard.professional, hero: DATA_HERO },
  { pathPrefix: ROUTES.dashboard.resultsDay, hero: DATA_HERO },
  { pathPrefix: ROUTES.dashboard.upgrade, hero: DATA_HERO },
  { pathPrefix: ROUTES.dashboard.pods, hero: DATA_HERO },
  { pathPrefix: '/dashboard/exam-outcome', hero: DATA_HERO },
]

// ---------------------------------------------------------------------------
// Per-route title and description overrides.
// The category/accent/icon come from CATEGORY_HERO_MAP above.
// Only title and description vary per page.
// ---------------------------------------------------------------------------

interface HeroOverrides {
  subtitle: string
  description?: string
}

const HERO_OVERRIDES: Record<string, HeroOverrides> = {
  // Learn
  [ROUTES.dashboard.wiki]: {
    subtitle: 'Knowledge Wiki',
    description: 'Authoritative LEA guide mapped to the exam syllabus.',
  },
  [ROUTES.dashboard.notes]: {
    subtitle: 'Notes',
    description: 'Your study notebook linked to articles and quiz questions.',
  },
  [ROUTES.dashboard.codeUpdates]: {
    subtitle: 'Code Updates',
    description: 'Latest building code changes that may appear on the exam.',
  },
  // Explore
  [ROUTES.lab.root]: {
    subtitle: '3D Lab',
    description: 'Explore architectural concepts in interactive 3D.',
  },
  [ROUTES.dashboard.studio]: {
    subtitle: 'Studio Mode',
    description:
      'Your creative workspace for architectural design exploration.',
  },
  // Practice
  [ROUTES.dashboard.quiz]: {
    subtitle: 'Quiz',
    description: 'Guided study, timed practice, and full exam simulation.',
  },
  [ROUTES.dashboard.camptrails]: {
    subtitle: 'Camp Trail',
    description: 'Daily study prescription calibrated to your exam date.',
  },
  [ROUTES.dashboard.flash]: {
    subtitle: 'LEA Numbers Flash',
    description: 'Critical LEA numbers. Tap a category to begin.',
  },
  [ROUTES.dashboard.areaC]: {
    subtitle: 'Design: Development Controls',
    description:
      'Building code calculators and development control references.',
  },
  [ROUTES.dashboard.cramCard]: {
    subtitle: 'Cram Card',
    description: 'Quick-reference flash cards for last-minute exam review.',
  },
  [ROUTES.dashboard.daeMode]: {
    subtitle: 'DAE Maintenance Mode',
    description: 'Stay current with the codes you use every day.',
  },
  // Data
  [ROUTES.dashboard.analytics]: {
    subtitle: 'Analytics',
    description: 'Track progress, identify weak areas, measure LEA readiness.',
  },
  [ROUTES.dashboard.professional]: {
    subtitle: 'Professional Reference',
    description: 'Reference tools for licensed practicing architects.',
  },
  [ROUTES.dashboard.resultsDay]: {
    subtitle: 'Results Day',
    description: 'Your LEA results and next steps.',
  },
  [ROUTES.dashboard.upgrade]: {
    subtitle: 'Upgrade',
    description: 'Unlimited access to all SlateCamp features.',
  },
  [ROUTES.dashboard.pods]: {
    subtitle: 'Study Pods',
    description: 'Join a study pod. Learn with peers, stay accountable.',
  },
  '/dashboard/exam-outcome': {
    subtitle: 'Exam Outcome',
    description: 'Help us improve SlateCamp for the next batch of candidates.',
  },
}

/**
 * Resolve hero config for a given pathname.
 * Returns null if the path is not a category page.
 */
export function getCategoryHero(pathname: string): HeaderHeroProps | null {
  const match = CATEGORY_HERO_MAP.find(
    ({ pathPrefix }) =>
      pathname === pathPrefix || pathname.startsWith(pathPrefix + '/'),
  )
  if (!match) return null

  // Find the most specific override for this path.
  // Check exact match first, then prefix matches (longest first).
  const exactOverride = HERO_OVERRIDES[pathname]
  if (exactOverride) {
    return { ...match.hero, ...exactOverride }
  }

  // For sub-paths (e.g. /dashboard/wiki/some-article), try to find a matching override.
  // Walk upward through prefixes.
  const sortedPrefixes = Object.keys(HERO_OVERRIDES).sort(
    (a, b) => b.length - a.length,
  )
  for (const prefix of sortedPrefixes) {
    if (pathname.startsWith(prefix) || pathname.startsWith(prefix + '/')) {
      return { ...match.hero, ...HERO_OVERRIDES[prefix] }
    }
  }

  return match.hero
}
