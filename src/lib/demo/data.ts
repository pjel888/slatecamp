/**
 * Demo mode module.
 *
 * Provides deterministic seed data for no-secret demo-auth flows.
 * This data is intentionally rich enough to support a real drills/quiz happy
 * path plus one real wiki article route.
 */
import { DEMO_USER, getDemoRoleOverride, getDemoTierOverride, getDemoUser } from './config'
import type { UserTier } from '@/types/app'

const uid = DEMO_USER.id
const now = new Date().toISOString()

export const DEMO_DISCIPLINE_ID = '00000000-0000-4000-8000-000000000101'
export const DEMO_SUBJECT_BUILDING_CODE_ID = '00000000-0000-4000-8000-000000000102'
export const DEMO_SUBJECT_STRUCTURES_ID = '00000000-0000-4000-8000-000000000103'
export const DEMO_TOPIC_FOUNDATIONS_ID = '00000000-0000-4000-8000-000000000104'
export const DEMO_TOPIC_LOAD_PATHS_ID = '00000000-0000-4000-8000-000000000105'
export const DEMO_WIKI_ARTICLE_ID = '00000000-0000-4000-8000-000000000106'
export const DEMO_WIKI_ARTICLE_SLUG = 'demo-ale-foundations'

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function demoUuid(index: number) {
  return `00000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`
}

function buildQuestion(
  index: number,
  topicId: string,
  articleId: string,
  subject: string,
) {
  const optionOffset = (index % 4) + 1
  const questionId = demoUuid(200 + index)

  return {
    question_id: questionId,
    article_id: articleId,
    topic_id: topicId,
    text: `${subject} demo question ${index}: which statement best matches the core rule?`,
    options: [
      { id: 'A', text: `Correct ${optionOffset}` },
      { id: 'B', text: `Distractor ${optionOffset}` },
      { id: 'C', text: `Distractor ${optionOffset + 1}` },
      { id: 'D', text: `Distractor ${optionOffset + 2}` },
    ],
    correct_option_id: 'A',
    difficulty: index % 3 === 0 ? 0.35 : index % 3 === 1 ? 0.55 : 0.75,
    question_type: 'mcq',
    rationale: `The correct answer is A because this seeded demo question is designed to keep the quiz flow deterministic.`,
    explanation: `Demo explanation for ${questionId}.`,
    prompt_image_url: null,
    hint_text: `Focus on the core rule for ${subject}.`,
    correct_value: null,
    value_tolerance: null,
    accepted_answers: null,
    created_at: daysAgo(14 - index),
    updated_at: daysAgo(7 - Math.min(index, 6)),
  }
}

export function getDemoProfile(
  tier: UserTier = getDemoTierOverride() ?? 'institutional',
) {
  const demoUser = getDemoUser()
  const demoRole = getDemoRoleOverride()

  return {
    id: uid,
    email: demoUser.email,
    display_name: 'Philip Lewis',
    full_name: 'Philip Lewis',
    avatar_url: null,
    tier,
    profession: 'architecture' as const,
    exam_target: 'LEA 2026',
    target_exam_date: '2026-09-15',
    daily_streak: 14,
    longest_streak: 21,
    last_active_at: now,
    onboarding_completed: true,
    onboarding_completed_at: daysAgo(45),
    is_admin: demoRole ? demoRole !== 'member' : true,
    role: demoRole && demoRole !== 'member' ? demoRole : 'member',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: now,
  }
}

export const DEMO_PROFILE = getDemoProfile()

export const DEMO_DISCIPLINES = [
  {
    discipline_id: DEMO_DISCIPLINE_ID,
    name: 'Architecture Licensure Exam',
    acronym: 'LEA',
    created_at: daysAgo(180),
    updated_at: daysAgo(7),
  },
]

export const DEMO_TAXONOMY = [
  {
    node_id: DEMO_SUBJECT_BUILDING_CODE_ID,
    discipline_id: DEMO_DISCIPLINE_ID,
    parent_id: null,
    level: 1,
    name: 'Building Code',
    subject_area: 'Building Code',
    is_leaf: false,
    is_cross_ref_only: false,
    deprecated_at: null,
    slug: 'building-code',
    sort_order: 1,
    lea_id: 'A1',
    description: 'Building code fundamentals',
    exam_frequency: 'high',
    bloom_level: 'understand',
    difficulty: 1,
    prc_area: 'Area A',
  },
  {
    node_id: DEMO_TOPIC_FOUNDATIONS_ID,
    discipline_id: DEMO_DISCIPLINE_ID,
    parent_id: DEMO_SUBJECT_BUILDING_CODE_ID,
    level: 2,
    name: 'ALE Foundations',
    subject_area: 'Building Code',
    is_leaf: true,
    is_cross_ref_only: false,
    deprecated_at: null,
    slug: DEMO_WIKI_ARTICLE_SLUG,
    sort_order: 1,
    lea_id: 'A1.1',
    description: 'Seeded foundations topic for demo wiki and quiz flows',
    exam_frequency: 'high',
    bloom_level: 'apply',
    difficulty: 1,
    prc_area: 'Area A',
  },
  {
    node_id: DEMO_SUBJECT_STRUCTURES_ID,
    discipline_id: DEMO_DISCIPLINE_ID,
    parent_id: null,
    level: 1,
    name: 'Structures',
    subject_area: 'Structures',
    is_leaf: false,
    is_cross_ref_only: false,
    deprecated_at: null,
    slug: 'structures',
    sort_order: 2,
    lea_id: 'B1',
    description: 'Structures fundamentals',
    exam_frequency: 'medium',
    bloom_level: 'understand',
    difficulty: 2,
    prc_area: 'Area B',
  },
  {
    node_id: DEMO_TOPIC_LOAD_PATHS_ID,
    discipline_id: DEMO_DISCIPLINE_ID,
    parent_id: DEMO_SUBJECT_STRUCTURES_ID,
    level: 2,
    name: 'Load Paths',
    subject_area: 'Structures',
    is_leaf: true,
    is_cross_ref_only: false,
    deprecated_at: null,
    slug: 'load-paths',
    sort_order: 1,
    lea_id: 'B1.1',
    description: 'Seeded structures topic for demo quiz breadth',
    exam_frequency: 'medium',
    bloom_level: 'apply',
    difficulty: 2,
    prc_area: 'Area B',
  },
]

export const DEMO_NODE_MASTERY = [
  {
    user_id: uid,
    topic_id: DEMO_TOPIC_FOUNDATIONS_ID,
    current_mastery_weight: 0.32,
    mastery_weight: 0.32,
    interaction_count: 12,
    total_attempts: 12,
    last_encountered: daysAgo(3),
  },
  {
    user_id: uid,
    topic_id: DEMO_TOPIC_LOAD_PATHS_ID,
    current_mastery_weight: 0.58,
    mastery_weight: 0.58,
    interaction_count: 8,
    total_attempts: 8,
    last_encountered: daysAgo(5),
  },
]

export const DEMO_READINESS_SNAPSHOTS = [
  {
    user_id: uid,
    score: 68,
    created_at: daysAgo(10),
  },
]

export const DEMO_GLOBAL_STATS = [
  {
    user_id: uid,
    global_readiness_score: 72,
    last_study_date: daysAgo(1),
    current_discipline_id: DEMO_DISCIPLINE_ID,
    onboarding_completed_at: daysAgo(45),
  },
]

export const DEMO_NOTE_FOLDERS: unknown[] = []
export const DEMO_NOTES: unknown[] = []
export const DEMO_SUBSCRIPTIONS: unknown[] = []

export const DEMO_WIKI_ARTICLES = [
  {
    article_id: DEMO_WIKI_ARTICLE_ID,
    slug: DEMO_WIKI_ARTICLE_SLUG,
    title: 'Demo ALE Foundations',
    content: [
      '# Demo ALE Foundations',
      '',
      'This seeded article exists so the wiki route has one real published path in demo mode.',
      '',
      '## Core Rule',
      '',
      'Use this article to validate wiki loading, sidebar hydration, and article navigation in the no-secret learning lane.',
    ].join('\n'),
    created_at: daysAgo(30),
    updated_at: daysAgo(2),
    lea_tests_you: 'understand how the no-secret wiki lane resolves a published article',
    updated_note: 'Seeded for demo-auth learning coverage.',
    subject_label: 'Building Code',
    difficulty_label: 'Foundational',
    status: 'published',
  },
]

export const DEMO_WIKI_TAXONOMY = [
  {
    article_id: DEMO_WIKI_ARTICLE_ID,
    node_id: DEMO_SUBJECT_BUILDING_CODE_ID,
    is_primary: false,
    sort_order: 1,
  },
  {
    article_id: DEMO_WIKI_ARTICLE_ID,
    node_id: DEMO_TOPIC_FOUNDATIONS_ID,
    is_primary: true,
    sort_order: 1,
  },
  {
    article_id: DEMO_WIKI_ARTICLE_ID,
    node_id: DEMO_SUBJECT_STRUCTURES_ID,
    is_primary: false,
    sort_order: 2,
  },
  {
    article_id: DEMO_WIKI_ARTICLE_ID,
    node_id: DEMO_TOPIC_LOAD_PATHS_ID,
    is_primary: false,
    sort_order: 2,
  },
]

export const DEMO_USER_QUESTION_STATES: unknown[] = []
export const DEMO_TAXONOMY_CROSS_REFERENCES: unknown[] = []
export const DEMO_USER_INTERACTIONS: unknown[] = []
export const DEMO_QUIZ_SESSIONS: unknown[] = []
export const DEMO_SESSION_PREDICTIONS: unknown[] = []

export const DEMO_QUESTIONS = Array.from({ length: 12 }, (_, index) =>
  index < 6
    ? buildQuestion(
        index + 1,
        DEMO_SUBJECT_BUILDING_CODE_ID,
        DEMO_WIKI_ARTICLE_ID,
        'Building Code',
      )
    : buildQuestion(
        index + 1,
        DEMO_SUBJECT_STRUCTURES_ID,
        DEMO_WIKI_ARTICLE_ID,
        'Structures',
      ),
)

const getBaseDemoTableRows = (table: string): unknown[] => {
  switch (table) {
    case 'disciplines':
      return DEMO_DISCIPLINES
    case 'taxonomy_tree':
      return DEMO_TAXONOMY
    case 'taxonomy_cross_references':
      return DEMO_TAXONOMY_CROSS_REFERENCES
    case 'wiki_articles':
      return DEMO_WIKI_ARTICLES
    case 'wiki_article_taxonomy':
      return DEMO_WIKI_TAXONOMY
    case 'questions':
      return DEMO_QUESTIONS
    case 'user_node_mastery':
      return DEMO_NODE_MASTERY
    case 'user_global_stats':
      return DEMO_GLOBAL_STATS
    case 'readiness_score_snapshots':
      return DEMO_READINESS_SNAPSHOTS
    case 'quiz_sessions':
      return DEMO_QUIZ_SESSIONS
    case 'user_interactions':
      return DEMO_USER_INTERACTIONS
    case 'user_question_states':
      return DEMO_USER_QUESTION_STATES
    case 'session_predictions':
      return DEMO_SESSION_PREDICTIONS
    case 'note_folders':
      return DEMO_NOTE_FOLDERS
    case 'notes':
      return DEMO_NOTES
    case 'user_subscriptions':
      return DEMO_SUBSCRIPTIONS
    case 'models_3d':
      return [
        {
          model_id: 'm-1',
          name: 'Colosseum',
          slug: 'colosseum',
          url: '/models/colosseum.glb',
          thumbnail: '/models/colosseum.png',
          status: 'published',
          metadata: {},
          created_at: now,
        },
      ]
    default:
      return []
  }
}

export function getDemoDataForTable(table: string, tier?: UserTier): unknown[] {
  const demoRole = getDemoRoleOverride()

  switch (table) {
    case 'profiles':
      return deepClone([tier ? getDemoProfile(tier) : getDemoProfile()])
    case 'user_roles':
      return deepClone(
        demoRole && demoRole !== 'member'
          ? [{ user_id: uid, role: demoRole, created_at: now }]
          : [],
      )
    default:
      return deepClone(getBaseDemoTableRows(table))
  }
}
