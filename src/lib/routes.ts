import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import {
  SquaresFour,
  ChartBar,
  Cube,
  Exam,
  GearSix,
  Globe,
  Cards,
  FileText,
  Path,
  Users,
} from '@phosphor-icons/react/dist/ssr'

/**
 * SlateCamp Route Constants
 * Single source of truth for all application routes.
 * 
 * RULES:
 * 1. NEVER use a hardcoded string path anywhere in src/
 * 2. ALWAYS import from '@/lib/routes'
 * 3. Dynamic routes use helper functions, not template literals at call sites
 * 4. Keep alphabetically sorted within each namespace
 */

export const ROUTES = {
  // ── Public ─────────────────────────────────────
  home: '/',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  try: '/try',

  // ── Auth ──────────────────────────────────────
  auth: {
    login: '/login',
    signup: '/register',
    register: '/register',
    onboarding: '/onboarding',
    callback: '/auth/callback',
    forgotPassword: '/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // ── Dashboard ────────────────────────────────
  dashboard: {
    root: '/dashboard',
    analytics: '/dashboard/analytics',
    analyticsAdvanced: '/dashboard/analytics/advanced',
    areaC: '/dashboard/area-c',
    assessment: '/dashboard/assessment',
    campfire: '/dashboard/campfire',
    camptrails: '/dashboard/camptrails',
    codeUpdates: '/dashboard/code-updates',
    cramCard: '/dashboard/cram-card',
    daeMode: '/dashboard/dae-mode',
    designProblems: '/dashboard/area-c/design-problems',
    drills: '/dashboard/drills',
    drillsSessions: '/dashboard/drills/sessions',
    flash: '/dashboard/flash',
    library: '/dashboard/library',
    notes: '/dashboard/notes',
    notifications: '/dashboard/notifications',
    pods: '/dashboard/pods',
    professional: '/dashboard/professional',
    resultsDay: '/dashboard/results-day',
    settings: '/dashboard/settings',
    settingsBilling: '/dashboard/settings/billing',
    settingsDeveloper: '/dashboard/settings/developer',
    studio: '/dashboard/studio',
    trails: '/dashboard/trails',
    upgrade: '/dashboard/upgrade',
    wiki: '/dashboard/wiki',
    // Dynamic helpers
    pod: (podId: string) => `/dashboard/pods/${podId}` as const,
    trailToday: (slug: string) => `/dashboard/camptrails/${slug}/today` as const,
  },

  // ── Quiz & Drills (unified engine) ───────────
  quiz: {
    hub: '/dashboard/drills',
    setup: (mode: string) => `/quiz/${mode}/setup` as const,
    session: (mode: string, sessionId: string) => `/quiz/${mode}/session/${sessionId}` as const,
    results: (mode: string, sessionId: string) => `/quiz/${mode}/session/${sessionId}/results` as const,
    review: (mode: string, sessionId: string) => `/quiz/${mode}/session/${sessionId}/review` as const,
    // Legacy mapping
    legacy: {
      setup: (mode: string) => `/quiz/${mode}/setup` as const,
      session: (sessionId: string, mode: string = 'camp') => `/quiz/${mode}/session/${sessionId}` as const,
      results: (sessionId: string, mode: string = 'camp') => `/quiz/${mode}/session/${sessionId}/results` as const,
      simSetup: '/quiz/full_exam/setup',
      simResults: (sessionId: string) => `/quiz/full_exam/session/${sessionId}/results` as const,
    }
  },

  // ── 3D Lab ───────────────────────────────────
  lab: {
    root: '/dashboard/3d-lab',
    module: (moduleId: string) => `/dashboard/3d-lab/${moduleId}` as const,
    test: '/test-3d',
  },

  // ── Wiki ─────────────────────────────────────
  wiki: {
    root: '/dashboard/wiki',
    article: (slug: string) => `/dashboard/wiki/${slug}` as const,
  },

  // ── Calculators & Tools ──────────────────────
  calculators: {
    root: '/tools',
    floorTiles: '/tools/floor-tiles-calculator',
    wallPaint: '/tools/wall-paint-calculator',
    lotPlotter: '/tools/lot-plotter',
    suiteRoot: '/calculators',
    tool: (slug: string) => `/calculators/${slug}` as const,
  },

  // ── Admin ────────────────────────────────────
  admin: {
    root: '/admin',
    login: '/admin/login',
    activity: '/admin/activity',
    assets: '/admin/assets',
    audit: '/admin/audit',
    knowledge: '/admin/knowledge',
    knowledgeQuestions: '/admin/knowledge/questions',
    knowledgeQuestionDesignProblems: '/admin/knowledge/questions/design-problems',
    knowledgeQuestionScenarios: '/admin/knowledge/questions/scenarios',
    pipeline: '/admin/pipeline',
    reviews: '/admin/reviews',
    search: '/admin/search',
    settings: '/admin/settings',
    taxonomy: '/admin/taxonomy',
    threeDModels: '/admin/3d-models',
    wiki: '/admin/wiki',
    // Dynamic helpers
    article: (id: string) => `/admin/knowledge/${id}` as const,
    question: (id: string) => `/admin/knowledge/questions/${id}` as const,
    questionDesignProblem: (id: string) => `/admin/knowledge/questions/design-problems/${id}` as const,
    questionScenario: (id: string) => `/admin/knowledge/questions/scenarios/${id}` as const,
    preview: (id: string) => `/admin/preview/${id}` as const,
  },

  // ── CEO ──────────────────────────────────────
  ceo: {
    root: '/ceo',
    team: '/ceo/team',
    financials: '/ceo/financials',
  },

  // ── Developer ────────────────────────────────
  developer: {
    root: '/developer',
    architecture: '/developer/architecture',
    apiReference: '/developer/api-reference',
    tools: '/developer/tools',
    console: '/developer/tools/console',
    db: '/developer/tools/db',
    logs: '/developer/tools/logs',
    testData: '/developer/tools/test-data',
    status: '/developer/status',
    statusDatabase: '/developer/status/database',
    statusInfrastructure: '/developer/status/infrastructure',
  },

  // ── API Routes ───────────────────────────────
  api: {
    analytics: {
      lab3d: '/api/analytics/3d-lab',
    },
    auth: {
      callback: '/auth/callback',
    },
  },

  // ── External ─────────────────────────────────
  external: {
    supabase: 'https://app.supabase.com',
    docs: 'https://slatecamp.com/docs',
  },
} as const;

// ── Type Utilities ─────────────────────────────
export type StaticRoute = string;
export type AppRoute = StaticRoute;

// ── Middleware Matchers ────────────────────────
export const PUBLIC_ROUTES: string[] = [
  ROUTES.home,
  ROUTES.pricing,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.auth.login,
  ROUTES.auth.register,
  ROUTES.auth.forgotPassword,
  ROUTES.auth.callback,
  ROUTES.lab.test,
  ROUTES.calculators.root,
  ROUTES.calculators.floorTiles,
  ROUTES.calculators.wallPaint,
  ROUTES.calculators.lotPlotter,
  ROUTES.try,
];

export const PROTECTED_ROUTE_PREFIX = ROUTES.dashboard.root;

// ── Sidebar Config ──────

export type NavGroup = 'learn' | 'practice' | 'data'

export interface NavGroupConfig {
  key: NavGroup
  label: string
  order: number
}

export const NAV_GROUPS: NavGroupConfig[] = [
  { key: 'learn', label: 'Learn', order: 1 },
  { key: 'practice', label: 'Practice', order: 2 },
  { key: 'data', label: 'Data', order: 3 },
]

export interface RouteConfig {
  path: string
  title: string
  sidebarLabel?: string
  icon?: PhosphorIcon
  sidebar?: boolean
  group?: NavGroup
}

export const RESULTS_DAY = ROUTES.dashboard.resultsDay

/**
 * Single source of truth for dashboard routes: titles and sidebar metadata.
 */
export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    path: ROUTES.dashboard.root,
    title: 'Dashboard',
    icon: SquaresFour,
  },
  {
    path: ROUTES.dashboard.areaC,
    title: 'Design',
  },
  {
    path: ROUTES.dashboard.wiki,
    title: 'Wiki',
    icon: Globe,
    group: 'learn',
  },
  {
    path: ROUTES.dashboard.drills,
    title: 'Drills',
    sidebarLabel: 'Drills',
    icon: Exam,
    group: 'practice',
  },
  {
    path: ROUTES.dashboard.daeMode,
    title: 'DAE Maintenance Mode',
    sidebarLabel: 'DAE Mode',
    group: 'practice',
  },
  {
    path: ROUTES.dashboard.camptrails,
    title: 'Camp Trail',
    icon: Path,
    group: 'practice',
  },
  {
    path: ROUTES.dashboard.pods,
    title: 'Study Pods',
    sidebarLabel: 'Study Pods',
    icon: Users,
    group: 'practice',
  },
  {
    path: ROUTES.dashboard.flash,
    title: 'LEA Numbers Flash',
    sidebarLabel: 'Flash Cards',
    icon: Cards,
    group: 'learn',
  },
  {
    path: ROUTES.dashboard.notes,
    title: 'Notes',
    icon: FileText,
    group: 'learn',
  },
  {
    path: ROUTES.dashboard.root,
    title: '3D Lab',
    icon: Cube,
    group: 'learn',
  },
  {
    path: ROUTES.dashboard.analytics,
    title: 'Analytics',
    icon: ChartBar,
    group: 'data',
  },
  {
    path: ROUTES.dashboard.cramCard,
    title: 'Cram Card',
    group: 'data',
  },
  {
    path: ROUTES.dashboard.professional,
    title: 'Professional Reference',
    sidebarLabel: 'Professional Reference',
  },
  {
    path: ROUTES.dashboard.studio,
    title: 'Studio Mode',
  },
  {
    path: ROUTES.dashboard.notifications,
    title: 'Notifications',
  },
  {
    path: ROUTES.dashboard.codeUpdates,
    title: 'Code Updates',
    sidebarLabel: 'Code Updates',
  },
  {
    path: ROUTES.dashboard.settings,
    title: 'Account Settings',
    sidebarLabel: 'Settings',
    icon: GearSix,
  },
]

export const STATIC_PAGE_TITLES: Record<string, string> = Object.fromEntries(
  DASHBOARD_ROUTES.map(({ path, title }) => [path, title]),
) as Record<string, string>

const DEFAULT_TITLE = 'Overview'

const DYNAMIC_TITLE_PREFIXES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard/quiz/', title: 'Active Session' },
  { prefix: '/dashboard/drills/', title: 'Drills' },
  { prefix: '/dashboard/library/', title: 'Question Bank' },
  { prefix: '/dashboard/wiki/', title: 'Knowledge Wiki' },
  { prefix: '/dashboard/flash/', title: 'LEA Numbers Flash' },
  { prefix: '/dashboard/pods/', title: 'Study Pods' },
]

export const getPageTitle = (pathname: string): string => {
  const exact = STATIC_PAGE_TITLES[pathname]
  if (exact) return exact

  const dynamicMatch = DYNAMIC_TITLE_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  )
  if (dynamicMatch) return dynamicMatch.title

  if (pathname.startsWith('/dashboard')) {
    return DEFAULT_TITLE
  }

  return DEFAULT_TITLE
}
