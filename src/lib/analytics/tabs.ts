import { ROUTES } from '@/lib/routes'

export const ANALYTICS_TAB_IDS = [
  'ready',
  'focus',
  'practice',
  'habits',
] as const

export type AnalyticsTabId = (typeof ANALYTICS_TAB_IDS)[number]

export const ANALYTICS_DETAIL_IDS = [
  'readiness-diagnostics',
  'calibration',
  'exam-outcome',
  'pacing',
  'retention',
  'stamina',
] as const

export type AnalyticsDetailId = (typeof ANALYTICS_DETAIL_IDS)[number]

export interface AnalyticsTabDefinition {
  id: AnalyticsTabId
  label: string
  shortLabel: string
  description: string
}

export interface AnalyticsDetailDefinition {
  id: AnalyticsDetailId
  tabId: AnalyticsTabId
  label: string
  shortLabel: string
  description: string
}

export interface AnalyticsRouteResolution {
  tabId: AnalyticsTabId
  detailId?: AnalyticsDetailId
  canonicalHref: string
  shouldRedirect: boolean
}

export const DEFAULT_ANALYTICS_TAB_ID: AnalyticsTabId = 'ready'

export const ANALYTICS_TABS: AnalyticsTabDefinition[] = [
  {
    id: 'ready',
    label: 'Ready',
    shortLabel: 'Ready',
    description: 'Readiness, mastery risk, and exam urgency.',
  },
  {
    id: 'focus',
    label: 'Focus',
    shortLabel: 'Focus',
    description: 'Weak topics, next recommendations, and mistake patterns.',
  },
  {
    id: 'practice',
    label: 'Practice',
    shortLabel: 'Practice',
    description: 'Recent quiz trend, accuracy, and pacing coaching.',
  },
  {
    id: 'habits',
    label: 'Habits',
    shortLabel: 'Habits',
    description: 'Consistency, practice rhythm, and retention risk.',
  },
]

export const ANALYTICS_DETAILS: AnalyticsDetailDefinition[] = [
  {
    id: 'readiness-diagnostics',
    tabId: 'ready',
    label: 'Readiness diagnostics',
    shortLabel: 'Readiness',
    description: 'Trajectory, IRT, monthly progress, and subject shape.',
  },
  {
    id: 'calibration',
    tabId: 'ready',
    label: 'Calibration',
    shortLabel: 'Calibration',
    description: 'Confidence, judgment, and metacognition diagnostics.',
  },
  {
    id: 'exam-outcome',
    tabId: 'ready',
    label: 'Exam outcome',
    shortLabel: 'Outcome',
    description: 'Report LEA outcome information for calibration learning.',
  },
  {
    id: 'pacing',
    tabId: 'practice',
    label: 'Pacing diagnostics',
    shortLabel: 'Pacing',
    description: 'Pacing, difficulty, and time-spent diagnostics.',
  },
  {
    id: 'retention',
    tabId: 'habits',
    label: 'Retention diagnostics',
    shortLabel: 'Retention',
    description: 'Memory, relearning, reading, and mastery history.',
  },
  {
    id: 'stamina',
    tabId: 'habits',
    label: 'Stamina diagnostics',
    shortLabel: 'Stamina',
    description: 'Stamina, study mode, and multimodal habit diagnostics.',
  },
]

export const ANALYTICS_DETAILS_BY_TAB = ANALYTICS_TABS.reduce(
  (acc, tab) => {
    acc[tab.id] = ANALYTICS_DETAILS.filter((detail) => detail.tabId === tab.id)
    return acc
  },
  {} as Record<AnalyticsTabId, AnalyticsDetailDefinition[]>,
)

const LEGACY_TAB_DESTINATIONS: Record<
  string,
  { tabId: AnalyticsTabId; detailId?: AnalyticsDetailId }
> = {
  readiness: { tabId: 'ready' },
  performance: { tabId: 'practice' },
  topics: { tabId: 'focus' },
  learning: { tabId: 'habits', detailId: 'retention' },
  behavior: { tabId: 'habits' },
  calibration: { tabId: 'ready', detailId: 'calibration' },
}

const firstQueryValue = (value: string | string[] | null | undefined) =>
  Array.isArray(value) ? value[0] : value

export const isAnalyticsTabId = (
  value: string | null | undefined,
): value is AnalyticsTabId =>
  ANALYTICS_TAB_IDS.includes(value as AnalyticsTabId)

const isAnalyticsDetailId = (
  value: string | null | undefined,
): value is AnalyticsDetailId =>
  ANALYTICS_DETAIL_IDS.includes(value as AnalyticsDetailId)

export const isAnalyticsDetailForTab = (
  tabId: AnalyticsTabId,
  detailId: string | null | undefined,
): detailId is AnalyticsDetailId =>
  isAnalyticsDetailId(detailId) &&
  ANALYTICS_DETAILS.some(
    (detail) => detail.id === detailId && detail.tabId === tabId,
  )

export const getAnalyticsTabId = (
  value: string | string[] | null | undefined,
): AnalyticsTabId => {
  const candidate = firstQueryValue(value)

  if (isAnalyticsTabId(candidate)) return candidate

  if (candidate && LEGACY_TAB_DESTINATIONS[candidate]) {
    return LEGACY_TAB_DESTINATIONS[candidate].tabId
  }

  return DEFAULT_ANALYTICS_TAB_ID
}

export const getAnalyticsHref = (
  tabId: AnalyticsTabId,
  detailId?: AnalyticsDetailId,
) => {
  const detailQuery = detailId ? `&detail=${detailId}` : ''
  return `${ROUTES.dashboard.analytics}?tab=${tabId}${detailQuery}`
}

export const getAnalyticsTabHref = (tabId: AnalyticsTabId) =>
  getAnalyticsHref(tabId)

export const getAnalyticsDetailHref = (
  tabId: AnalyticsTabId,
  detailId: AnalyticsDetailId,
) => getAnalyticsHref(tabId, detailId)

export const getAnalyticsTab = (tabId: AnalyticsTabId) =>
  ANALYTICS_TABS.find((tab) => tab.id === tabId) ?? ANALYTICS_TABS[0]

export const getAnalyticsDetail = (detailId: AnalyticsDetailId) =>
  ANALYTICS_DETAILS.find((detail) => detail.id === detailId)

export const resolveAnalyticsRoute = ({
  tab,
  detail,
}: {
  tab: string | string[] | null | undefined
  detail: string | string[] | null | undefined
}): AnalyticsRouteResolution => {
  const requestedTab = firstQueryValue(tab)
  const requestedDetail = firstQueryValue(detail)

  let tabId: AnalyticsTabId = DEFAULT_ANALYTICS_TAB_ID
  let detailId: AnalyticsDetailId | undefined
  let shouldRedirect = false

  if (isAnalyticsTabId(requestedTab)) {
    tabId = requestedTab
  } else if (requestedTab && LEGACY_TAB_DESTINATIONS[requestedTab]) {
    const legacy = LEGACY_TAB_DESTINATIONS[requestedTab]
    tabId = legacy.tabId
    detailId = legacy.detailId
    shouldRedirect = true
  } else if (requestedTab) {
    shouldRedirect = true
  }

  if (!detailId && requestedDetail) {
    if (isAnalyticsDetailForTab(tabId, requestedDetail)) {
      detailId = requestedDetail
    } else {
      shouldRedirect = true
    }
  }

  const canonicalHref = getAnalyticsHref(tabId, detailId)
  const queryMatches =
    requestedTab === tabId &&
    (detailId ? requestedDetail === detailId : !requestedDetail)

  return {
    tabId,
    detailId,
    canonicalHref,
    shouldRedirect:
      shouldRedirect ||
      (!!requestedDetail && !requestedTab) ||
      (!!requestedTab && !queryMatches),
  }
}
