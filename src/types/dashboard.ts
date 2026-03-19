/**
 * Dashboard page types — v2 (UX overhaul)
 * Every interface maps to a specific dashboard component.
 */

// ── HeroCommandBar ──────────────────────────────────────────────────────────

export interface HeroMicroStat {
  value: number
  label: string
  /** Inline description shown directly below the stat — no hover needed */
  description: string
  delta: number | null
  tooltip: string
}

// ── StudyHeatmap ────────────────────────────────────────────────────────────

export interface HeatmapDay {
  date: string
  questionCount: number
  sessionCount: number
}

// ── NextMissionCard ─────────────────────────────────────────────────────────

export type ActionType = 'resume' | 'blindspot' | 'wiki_read' | 'warmup'

export interface RecommendedAction {
  type: ActionType
  title: string
  subtitle: string
  ctaLabel: string
  href: string
  estimatedMinutes: number
  modeTooltip?: string
  progress?: { current: number; total: number }
}

// ── FocusAreasCard ──────────────────────────────────────────────────────────

export type MasteryLabel = 'Exploring' | 'Building' | 'Developing' | 'Strong'

export interface FocusAreaItem {
  topicId: string
  topicName: string
  masteryWeight: number
  masteryLabel: MasteryLabel
}

// ── RecentActivityFeed ──────────────────────────────────────────────────────

export interface ActivityFeedItem {
  sessionId: string
  testMode: string
  modeBadge: string
  modeTooltip: string
  subjectName: string | null
  scorePercent: number | null
  questionCount: number
  status: 'completed' | 'abandoned'
  updatedAt: string
}

// ── WeekAtAGlance ───────────────────────────────────────────────────────────

export interface WeekStat {
  value: number
  label: string
  subLabel: string
  delta: number | null
  tooltip: string
}

// ── ContinueSessionCard / InProgressSession ─────────────────────────────────

export interface InProgressSession {
  sessionId: string
  testMode: string
  currentIndex: number
  totalQuestions: number
  startedAt: string
  updatedAt: string
}

// ── Feature Discovery Cards ─────────────────────────────────────────────────

export interface DailyWikiArticle {
  articleId: string
  title: string
  slug: string
  excerpt: string
}

export interface NotePreview {
  noteId: string
  title: string
  snippet: string
  updatedAt: string
}

// ── SubjectMastery (Radial Heatmap + Progress Bars) ─────────────────────────

export interface TopicRing {
  topicName: string
  mastery: number
  questionsAnswered: number
}

export interface SubjectMastery {
  subject: string
  shortLabel: string
  mastery: number
  questionsAnswered: number
  topics: TopicRing[]
}

// ── Full Dashboard Page Data ────────────────────────────────────────────────

export interface ReadinessMeta {
  ceilingActive?: boolean
  ceilingValue?: number | null
  ceilingReason?: string | null
  greyPenalty?: number
}

export interface DashboardPageData {
  // HeroCommandBar
  userName: string
  readinessScore: number
  previousScore: number | null
  examDate: string | null
  daysUntilExam: number | null
  heroStats: HeroMicroStat[]
  syllabusCoveragePercent: number
  readinessMeta: ReadinessMeta | null

  // NextMissionCard
  action: RecommendedAction

  // FocusAreasCard
  focusAreas: FocusAreaItem[]

  // Subject Mastery (Radar Chart + Progress Bars)
  subjectMastery: SubjectMastery[]

  // StudyHeatmap (data passed through to existing ActivityHeatmap)
  // Uses HeatmapSection which does its own fetch

  // RecentActivityFeed
  recentSessions: ActivityFeedItem[]

  // WeekAtAGlance
  weekStats: WeekStat[]

  // ContinueSession (consolidated into NextMission when applicable)
  inProgressSession: InProgressSession | null

  // Feature Discovery
  dailyArticle: DailyWikiArticle | null
  recentNotes: NotePreview[]
  labModuleCount: number

  // Onboarding State (UX Strategy Section 7 — Daily Launchpad)
  onboardingState: 'needs_assessment' | 'needs_score_reveal' | 'needs_trail' | 'active_trail' | 'ready'
  /** For free users post-reveal: count of score updates since reveal */
  scoreUpdatesSinceReveal: number
  /** Whether user is on free tier */
  isFreeUser: boolean
  /** Active trail info for the trail day card */
  activeTrailDay: {
    dayNumber: number
    title: string
    estimatedMinutes: number
    trailSlug: string
    topGapSubject?: string
  } | null

  // Sprint 2: Streak & SRS
  streak: {
    currentStreak: number
    longestStreak: number
    streakStatus: 'active' | 'at_risk' | 'broken'
  }
  srsReview: {
    itemsDue: number
    subjects: string[]
    estimatedMinutes: number
  }

  // Subject Floor Alert (Task 0.3)
  subjectFloorAlerts: SubjectFloorAlert[]
}

// ── Subject Floor Alert ────────────────────────────────────────────────────
export interface SubjectFloorAlert {
  subject: string
  mastery: number
  floorPct: number
  gap: number
}
