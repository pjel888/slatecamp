import { DEMO_USER } from './config'
import type { UserTier } from '@/types/app'
import { TIER_CAPABILITIES } from '@/lib/dev/dev-mode'

const uid = DEMO_USER.id
const now = new Date().toISOString()

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

/**
 * Build a demo profile for the given tier. Adjusts ai_tokens_limit based
 * on the tier capabilities so local-mode Free/Pro feel realistic.
 */
export function getDemoProfile(tier: UserTier = 'institutional') {
  const caps = TIER_CAPABILITIES[tier]
  return {
    id: uid,
    email: DEMO_USER.email,
    full_name: 'Philip Lewis',
    avatar_url: null,
    tier,
    profession: 'architecture' as const,
    exam_target: 'ALE 2026',
    target_exam_date: '2026-09-15',
    stripe_customer_id: null,
    payrex_customer_id: null,
    stripe_subscription_id: null,
    ai_tokens_used: 247,
    ai_tokens_limit: caps.aiTokens === Infinity ? 999999 : caps.aiTokens,
    daily_streak: 14,
    longest_streak: 21,
    last_active_at: now,
    preferred_theme: 'system',
    onboarding_completed: true,
    is_admin: true,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: now,
  }
}

/** Default demo profile — institutional tier for backward compat */
export const DEMO_PROFILE = getDemoProfile('institutional')

export const DEMO_EXAM_DOMAINS = [
  {
    id: 'dom-1',
    profession: 'architecture',
    name: 'Structural Systems',
    slug: 'structural-systems',
    description: 'Trusses, beams, foundations',
    parent_domain_id: null,
    sort_order: 1,
    icon_name: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dom-2',
    profession: 'architecture',
    name: 'Building Envelope',
    slug: 'building-envelope',
    description: 'Wall sections, curtain walls, waterproofing',
    parent_domain_id: null,
    sort_order: 2,
    icon_name: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dom-3',
    profession: 'architecture',
    name: 'MEP Systems',
    slug: 'mep-systems',
    description: 'Plumbing, HVAC, electrical',
    parent_domain_id: null,
    sort_order: 3,
    icon_name: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dom-4',
    profession: 'architecture',
    name: 'Design History & Theory',
    slug: 'design-history',
    description: 'Architectural history, theory, and criticism',
    parent_domain_id: null,
    sort_order: 4,
    icon_name: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dom-5',
    profession: 'architecture',
    name: 'Building Codes & Standards',
    slug: 'building-codes',
    description: 'NBC, fire code, accessibility',
    parent_domain_id: null,
    sort_order: 5,
    icon_name: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'dom-6',
    profession: 'architecture',
    name: 'Site Planning',
    slug: 'site-planning',
    description: 'Zoning, setbacks, grading',
    parent_domain_id: null,
    sort_order: 6,
    icon_name: null,
    created_at: '2026-01-01T00:00:00Z',
  },
]

export const DEMO_QUESTION_BANKS = [
  {
    id: 'bank-1',
    creator_id: null,
    title: 'ALE Structural Engineering',
    description:
      'Comprehensive structural systems questions for the Architecture Licensure Exam',
    profession: 'architecture',
    exam_domain_id: 'dom-1',
    is_official: true,
    is_marketplace: false,
    price_cents: 0,
    currency: 'PHP',
    status: 'published',
    question_count: 120,
    average_rating: 4.7,
    total_ratings: 89,
    total_purchases: 0,
    tags: ['structural', 'ALE'],
    created_at: '2026-01-10T00:00:00Z',
    updated_at: daysAgo(2),
  },
  {
    id: 'bank-2',
    creator_id: null,
    title: 'Building Materials & Methods',
    description: 'Properties of construction materials and building methods',
    profession: 'architecture',
    exam_domain_id: 'dom-2',
    is_official: true,
    is_marketplace: false,
    price_cents: 0,
    currency: 'PHP',
    status: 'published',
    question_count: 95,
    average_rating: 4.5,
    total_ratings: 64,
    total_purchases: 0,
    tags: ['materials', 'construction'],
    created_at: '2026-01-10T00:00:00Z',
    updated_at: daysAgo(3),
  },
  {
    id: 'bank-3',
    creator_id: null,
    title: 'History of Architecture',
    description: 'From ancient civilizations to modern movements',
    profession: 'architecture',
    exam_domain_id: 'dom-4',
    is_official: true,
    is_marketplace: false,
    price_cents: 0,
    currency: 'PHP',
    status: 'published',
    question_count: 80,
    average_rating: 4.8,
    total_ratings: 102,
    total_purchases: 0,
    tags: ['history', 'theory'],
    created_at: '2026-01-10T00:00:00Z',
    updated_at: daysAgo(1),
  },
  {
    id: 'bank-4',
    creator_id: 'user-other',
    title: 'Philippine Building Code Reviewer',
    description: 'PD 1096 and related IRRs — complete question set',
    profession: 'architecture',
    exam_domain_id: 'dom-5',
    is_official: false,
    is_marketplace: true,
    price_cents: 29900,
    currency: 'PHP',
    status: 'published',
    question_count: 200,
    average_rating: 4.9,
    total_ratings: 156,
    total_purchases: 312,
    tags: ['NBC', 'codes', 'PD 1096'],
    created_at: '2026-02-01T00:00:00Z',
    updated_at: daysAgo(5),
  },
  {
    id: 'bank-5',
    creator_id: 'user-other',
    title: 'Site Planning & Utilities',
    description: 'Comprehensive site planning prep for ALE',
    profession: 'architecture',
    exam_domain_id: 'dom-6',
    is_official: false,
    is_marketplace: true,
    price_cents: 19900,
    currency: 'PHP',
    status: 'published',
    question_count: 75,
    average_rating: 4.3,
    total_ratings: 41,
    total_purchases: 87,
    tags: ['site planning', 'utilities'],
    created_at: '2026-02-10T00:00:00Z',
    updated_at: daysAgo(7),
  },
]

// ── New Schema: Board Exams ──────────────────────────────────────
export const DEMO_BOARD_EXAMS = [
  {
    id: 'be-ale',
    profession: 'Architecture',
    specialization: null,
    name: 'Architecture Licensure Exam',
    short_name: 'ALE',
    country: 'PH',
    description: 'Philippine Architecture Licensure Examination',
    total_subjects: 10,
    passing_score_percentage: 70.0,
    icon_name: 'building-2',
    is_active: true,
    has_content: true,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'be-are',
    profession: 'Architecture',
    specialization: null,
    name: 'Architect Registration Exam',
    short_name: 'ARE 5.0',
    country: 'US',
    description: 'US Architect Registration Exam',
    total_subjects: 6,
    passing_score_percentage: 70.0,
    icon_name: 'building-2',
    is_active: true,
    has_content: false,
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
]

// ── New Schema: Exam Profiles ───────────────────────────────────
export const DEMO_EXAM_PROFILES = [
  {
    id: 'ep-1',
    user_id: uid,
    board_exam_id: 'be-ale',
    target_exam_date: '2026-09-15',
    study_hours_per_day: 3,
    is_active: true,
    onboarding_completed: true,
    daily_streak: 14,
    longest_streak: 21,
    last_active_at: now,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: now,
    board_exams: {
      id: 'be-ale',
      profession: 'Architecture',
      specialization: null,
      name: 'Architecture Licensure Exam',
      short_name: 'ALE',
      country: 'PH',
      description: 'Philippine Architecture Licensure Examination',
      total_subjects: 10,
      passing_score_percentage: 70.0,
      icon_name: 'building-2',
      is_active: true,
      has_content: true,
      sort_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
  },
]

// ── New Schema: Subjects (mapped from old exam_domains) ─────────
export const DEMO_SUBJECTS = [
  {
    id: 'sub-1',
    board_exam_id: 'be-ale',
    name: 'History of Architecture',
    short_name: 'History',
    slug: 'history-of-architecture',
    description:
      'Architectural history from ancient civilizations to contemporary movements',
    exam_weight_percentage: 10,
    estimated_question_count: null,
    color: '#8B7355',
    icon_name: 'landmark',
    has_3d_workspace: false,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-2',
    board_exam_id: 'be-ale',
    name: 'Design and Planning',
    short_name: 'Design',
    slug: 'design-and-planning',
    description:
      'Architectural design principles, space planning, and programming',
    exam_weight_percentage: 12,
    estimated_question_count: null,
    color: '#4A7C59',
    icon_name: 'palette',
    has_3d_workspace: false,
    sort_order: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-3',
    board_exam_id: 'be-ale',
    name: 'Building Technology',
    short_name: 'BuildTech',
    slug: 'building-technology',
    description: 'Construction materials, methods, and building systems',
    exam_weight_percentage: 12,
    estimated_question_count: null,
    color: '#6B8FA3',
    icon_name: 'hard-hat',
    has_3d_workspace: true,
    sort_order: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-4',
    board_exam_id: 'be-ale',
    name: 'Structural Engineering',
    short_name: 'Structures',
    slug: 'structural-engineering',
    description: 'Structural systems, analysis, and design',
    exam_weight_percentage: 12,
    estimated_question_count: null,
    color: '#BF1B1B',
    icon_name: 'triangle',
    has_3d_workspace: true,
    sort_order: 4,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-5',
    board_exam_id: 'be-ale',
    name: 'Utilities',
    short_name: 'Utilities',
    slug: 'utilities',
    description: 'Plumbing, HVAC, electrical, and fire protection systems',
    exam_weight_percentage: 10,
    estimated_question_count: null,
    color: '#1f3055',
    icon_name: 'zap',
    has_3d_workspace: true,
    sort_order: 5,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-6',
    board_exam_id: 'be-ale',
    name: 'Laws and Codes',
    short_name: 'Laws',
    slug: 'laws-and-codes',
    description: 'Building codes, laws, and professional practice',
    exam_weight_percentage: 10,
    estimated_question_count: null,
    color: '#BF7C2A',
    icon_name: 'scale',
    has_3d_workspace: false,
    sort_order: 6,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-7',
    board_exam_id: 'be-ale',
    name: 'Site Planning',
    short_name: 'Site',
    slug: 'site-planning',
    description: 'Zoning, setbacks, grading, and landscape architecture',
    exam_weight_percentage: 8,
    estimated_question_count: null,
    color: '#4A7C59',
    icon_name: 'map',
    has_3d_workspace: false,
    sort_order: 7,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-8',
    board_exam_id: 'be-ale',
    name: 'Professional Practice',
    short_name: 'Practice',
    slug: 'professional-practice',
    description:
      'Contracts, project management, ethics, and professional regulation',
    exam_weight_percentage: 8,
    estimated_question_count: null,
    color: '#86868B',
    icon_name: 'briefcase',
    has_3d_workspace: false,
    sort_order: 8,
    created_at: '2026-01-01T00:00:00Z',
  },
]

// ── New Schema: Subject Mastery ─────────────────────────────────
export const DEMO_SUBJECT_MASTERY = [
  {
    id: 'sm-1',
    user_id: uid,
    exam_profile_id: 'ep-1',
    subject_id: 'sub-1',
    total_attempted: 110,
    total_correct: 97,
    mastery_score: 88,
    theta: 1.8,
    avg_response_time_ms: 12000,
    last_practiced_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: 'sm-2',
    user_id: uid,
    exam_profile_id: 'ep-1',
    subject_id: 'sub-3',
    total_attempted: 60,
    total_correct: 39,
    mastery_score: 65,
    theta: 0.4,
    avg_response_time_ms: 18000,
    last_practiced_at: daysAgo(5),
    updated_at: daysAgo(5),
  },
  {
    id: 'sm-3',
    user_id: uid,
    exam_profile_id: 'ep-1',
    subject_id: 'sub-4',
    total_attempted: 85,
    total_correct: 68,
    mastery_score: 80,
    theta: 1.2,
    avg_response_time_ms: 15000,
    last_practiced_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: 'sm-4',
    user_id: uid,
    exam_profile_id: 'ep-1',
    subject_id: 'sub-5',
    total_attempted: 40,
    total_correct: 30,
    mastery_score: 75,
    theta: 0.8,
    avg_response_time_ms: 14000,
    last_practiced_at: daysAgo(8),
    updated_at: daysAgo(8),
  },
  {
    id: 'sm-5',
    user_id: uid,
    exam_profile_id: 'ep-1',
    subject_id: 'sub-6',
    total_attempted: 55,
    total_correct: 38,
    mastery_score: 69,
    theta: 0.5,
    avg_response_time_ms: 20000,
    last_practiced_at: daysAgo(12),
    updated_at: daysAgo(12),
  },
  {
    id: 'sm-6',
    user_id: uid,
    exam_profile_id: 'ep-1',
    subject_id: 'sub-7',
    total_attempted: 30,
    total_correct: 24,
    mastery_score: 80,
    theta: 1.1,
    avg_response_time_ms: 16000,
    last_practiced_at: daysAgo(15),
    updated_at: daysAgo(15),
  },
]

// ── New Schema: Review Sessions ─────────────────────────────────
export const DEMO_REVIEW_SESSIONS = [
  {
    id: 'rs-1',
    user_id: uid,
    exam_profile_id: 'ep-1',
    session_type: 'subject_quick',
    template_id: null,
    retake_of_session_id: null,
    source_subject_id: 'sub-4',
    source_topic_id: null,
    source_3d_model_id: null,
    config: {
      subjects: [{ subject_id: 'sub-4', question_count: 10 }],
      shuffle_questions: true,
      show_immediate_feedback: true,
    },
    name: 'Structures Quick Start',
    total_questions: 4,
    questions_answered: 4,
    questions_correct: 3,
    questions_incorrect: 1,
    questions_skipped: 0,
    score_percentage: 75,
    total_time_ms: 360000,
    avg_response_time_ms: 90000,
    subject_scores: [],
    status: 'completed',
    started_at: daysAgo(1),
    paused_at: null,
    completed_at: daysAgo(1),
    created_at: daysAgo(1),
  },
  {
    id: 'rs-2',
    user_id: uid,
    exam_profile_id: 'ep-1',
    session_type: 'custom_compiled',
    template_id: null,
    retake_of_session_id: null,
    source_subject_id: null,
    source_topic_id: null,
    source_3d_model_id: null,
    config: {
      subjects: [
        { subject_id: 'sub-1', question_count: 5 },
        { subject_id: 'sub-4', question_count: 5 },
      ],
      shuffle_questions: true,
      show_immediate_feedback: true,
    },
    name: 'History + Structures Mix',
    total_questions: 4,
    questions_answered: 4,
    questions_correct: 3,
    questions_incorrect: 1,
    questions_skipped: 0,
    score_percentage: 75,
    total_time_ms: 480000,
    avg_response_time_ms: 120000,
    subject_scores: [],
    status: 'completed',
    started_at: daysAgo(3),
    paused_at: null,
    completed_at: daysAgo(3),
    created_at: daysAgo(3),
  },
]

// ── New Schema: Study Time Logs ─────────────────────────────────
export const DEMO_STUDY_TIME_LOGS = [
  {
    id: 'stl-1',
    user_id: uid,
    exam_profile_id: 'ep-1',
    mode: 'session',
    session_id: 'rs-1',
    started_at: daysAgo(1),
    ended_at: daysAgo(1),
    duration_ms: 360000,
    created_at: daysAgo(1),
  },
  {
    id: 'stl-2',
    user_id: uid,
    exam_profile_id: 'ep-1',
    mode: 'review',
    session_id: null,
    started_at: daysAgo(0),
    ended_at: null,
    duration_ms: 1200000,
    created_at: daysAgo(0),
  },
]

function makeChoice(id: string, text: string, isCorrect: boolean) {
  return { id, text, is_correct: isCorrect }
}

const Q_BASE = {
  creator_id: null,
  question_type: 'mcq' as const,
  is_multi_select: false,
  is_official: true,
  media_url: null as string | null,
  prompt_image_url: null as string | null,
  explanation_image_url: null as string | null,
  explanation_references: null,
  references: [] as { title: string; page?: string; type: string }[],
  fun_facts: [] as string[],
  mnemonics: null as string | null,
  related_topic_ids: [] as string[],
  has_3d_component: false,
  three_d_model_id: null as string | null,
  three_d_model_ref: null as string | null,
  model_callout_id: null as string | null,
  image_urls: [] as string[],
  global_times_answered: 0,
  global_times_correct: 0,
  global_accuracy_percentage: 0,
  global_avg_response_time_ms: 0,
  status: 'published' as const,
  created_at: '2026-01-10T00:00:00Z',
}

export const DEMO_QUESTIONS = [
  // ── Bank 1: Structural Systems (dom-1) → sub-4 ─────────────────
  {
    ...Q_BASE,
    id: 'q-1',
    bank_id: 'bank-1',
    exam_domain_id: 'dom-1',
    subject_id: 'sub-4',
    topic_id: null,
    sort_order: 1,
    updated_at: daysAgo(1),
    difficulty: 'medium',
    difficulty_rating: 0.55,
    discrimination_rating: 0.7,
    tags: ['truss', 'structural'],
    global_times_answered: 340,
    global_times_correct: 221,
    references: [{ title: 'Structural Analysis', page: '142', type: 'book' }],
    fun_facts: [
      'Warren trusses were patented in 1848 by James Warren and Willoughby Theobald Monzani.',
    ],
    prompt:
      'Which type of truss is characterized by diagonal members that alternate in direction, creating a zigzag pattern?',
    choices: [
      makeChoice('q1-a', 'Pratt Truss', false),
      makeChoice('q1-b', 'Warren Truss', true),
      makeChoice('q1-c', 'Howe Truss', false),
      makeChoice('q1-d', 'Fink Truss', false),
    ],
    correct_answer: 'q1-b',
    explanation:
      'A Warren Truss uses equilateral triangles formed by diagonal members alternating in direction. Unlike Pratt and Howe trusses, it has no vertical members (in its pure form).',
  },
  {
    ...Q_BASE,
    id: 'q-2',
    bank_id: 'bank-1',
    exam_domain_id: 'dom-1',
    sort_order: 2,
    updated_at: daysAgo(1),
    difficulty: 'hard',
    difficulty_rating: 0.72,
    discrimination_rating: 0.8,
    tags: ['concrete', 'post-tension'],
    times_answered: 280,
    times_correct: 145,
    prompt:
      'What is the primary advantage of a post-tensioned concrete slab over a conventionally reinforced slab?',
    choices: [
      makeChoice('q2-a', 'Lower material cost', false),
      makeChoice('q2-b', 'Faster curing time', false),
      makeChoice('q2-c', 'Allows longer spans with thinner sections', true),
      makeChoice('q2-d', 'Easier to demolish', false),
    ],
    correct_answer: 'q2-c',
    explanation:
      'Post-tensioning applies compressive forces to the concrete after it has cured, allowing longer spans with thinner slab sections and reduced deflection.',
  },
  {
    ...Q_BASE,
    id: 'q-6',
    bank_id: 'bank-1',
    exam_domain_id: 'dom-1',
    sort_order: 3,
    updated_at: daysAgo(1),
    difficulty: 'medium',
    difficulty_rating: 0.5,
    discrimination_rating: 0.65,
    tags: ['foundation', 'structural'],
    times_answered: 290,
    times_correct: 174,
    prompt:
      'What type of foundation is most appropriate for a structure built on expansive clay soil?',
    choices: [
      makeChoice('q6-a', 'Spread footing', false),
      makeChoice('q6-b', 'Mat (raft) foundation', true),
      makeChoice('q6-c', 'Strip footing', false),
      makeChoice('q6-d', 'Pad footing', false),
    ],
    correct_answer: 'q6-b',
    explanation:
      'A mat (raft) foundation distributes load over the entire building footprint, reducing differential settlement from expansive clay soils that swell when wet and shrink when dry.',
  },
  {
    ...Q_BASE,
    id: 'q-7',
    bank_id: 'bank-1',
    exam_domain_id: 'dom-1',
    sort_order: 4,
    updated_at: daysAgo(2),
    difficulty: 'easy',
    difficulty_rating: 0.3,
    discrimination_rating: 0.5,
    tags: ['loads', 'structural'],
    times_answered: 420,
    times_correct: 344,
    prompt: 'Live loads differ from dead loads in that live loads are:',
    choices: [
      makeChoice('q7-a', 'Permanent and stationary', false),
      makeChoice('q7-b', 'Always applied horizontally', false),
      makeChoice(
        'q7-c',
        'Variable and can change in magnitude or position',
        true,
      ),
      makeChoice('q7-d', 'Only caused by wind', false),
    ],
    correct_answer: 'q7-c',
    explanation:
      'Live loads are non-permanent forces — occupants, furniture, vehicles, snow. Dead loads are permanent: the weight of the structure and fixed equipment.',
  },

  // ── Bank 2: Building Materials & Methods (dom-2) ────────────────
  {
    ...Q_BASE,
    id: 'q-3',
    bank_id: 'bank-2',
    exam_domain_id: 'dom-2',
    sort_order: 1,
    updated_at: daysAgo(2),
    difficulty: 'hard',
    difficulty_rating: 0.68,
    discrimination_rating: 0.75,
    tags: ['curtain wall', 'envelope'],
    times_answered: 195,
    times_correct: 98,
    prompt:
      'In curtain wall construction, what is the primary function of a pressure-equalized rain screen?',
    choices: [
      makeChoice('q3-a', 'Structural support for wind loads', false),
      makeChoice(
        'q3-b',
        'Preventing water penetration by eliminating pressure differential',
        true,
      ),
      makeChoice('q3-c', 'Thermal insulation', false),
      makeChoice('q3-d', 'Acoustic dampening', false),
    ],
    correct_answer: 'q3-b',
    explanation:
      'A pressure-equalized rain screen works by ensuring the pressure on both sides of the outer cladding is equal, removing the driving force that pushes water through joints.',
  },
  {
    ...Q_BASE,
    id: 'q-8',
    bank_id: 'bank-2',
    exam_domain_id: 'dom-2',
    sort_order: 2,
    updated_at: daysAgo(2),
    difficulty: 'medium',
    difficulty_rating: 0.48,
    discrimination_rating: 0.6,
    tags: ['concrete', 'materials'],
    times_answered: 310,
    times_correct: 186,
    prompt: 'The water-cement ratio in concrete primarily affects:',
    choices: [
      makeChoice('q8-a', 'Color of the finished surface', false),
      makeChoice('q8-b', 'Compressive strength and durability', true),
      makeChoice('q8-c', 'Aggregate size distribution', false),
      makeChoice('q8-d', 'Formwork pressure', false),
    ],
    correct_answer: 'q8-b',
    explanation:
      'A lower water-cement ratio produces stronger, more durable concrete. Excess water creates voids as it evaporates, weakening the hardened concrete matrix.',
  },
  {
    ...Q_BASE,
    id: 'q-9',
    bank_id: 'bank-2',
    exam_domain_id: 'dom-2',
    sort_order: 3,
    updated_at: daysAgo(3),
    difficulty: 'medium',
    difficulty_rating: 0.52,
    discrimination_rating: 0.68,
    tags: ['roofing', 'envelope'],
    times_answered: 255,
    times_correct: 158,
    prompt:
      'Which roofing membrane is a single-ply thermoplastic that can be heat-welded at seams?',
    choices: [
      makeChoice('q9-a', 'EPDM', false),
      makeChoice('q9-b', 'Built-up roofing (BUR)', false),
      makeChoice('q9-c', 'TPO', true),
      makeChoice('q9-d', 'Modified bitumen', false),
    ],
    correct_answer: 'q9-c',
    explanation:
      'TPO (Thermoplastic Polyolefin) is a single-ply membrane that can be heat-welded, creating seamless joints. EPDM is a thermoset rubber joined with adhesive or tape.',
  },
  {
    ...Q_BASE,
    id: 'q-10',
    bank_id: 'bank-2',
    exam_domain_id: 'dom-2',
    sort_order: 4,
    updated_at: daysAgo(4),
    difficulty: 'easy',
    difficulty_rating: 0.28,
    discrimination_rating: 0.45,
    tags: ['steel', 'materials'],
    times_answered: 380,
    times_correct: 323,
    prompt: 'Galvanization protects steel by:',
    choices: [
      makeChoice('q10-a', 'Increasing its tensile strength', false),
      makeChoice(
        'q10-b',
        'Applying a zinc coating that acts as a sacrificial anode',
        true,
      ),
      makeChoice('q10-c', 'Changing its molecular structure', false),
      makeChoice('q10-d', 'Making it non-conductive', false),
    ],
    correct_answer: 'q10-b',
    explanation:
      'Galvanization coats steel with zinc. The zinc corrodes preferentially (sacrificial anode), protecting the underlying steel even if the coating is scratched.',
  },

  // ── Bank 3: History of Architecture (dom-4) ─────────────────────
  {
    ...Q_BASE,
    id: 'q-4',
    bank_id: 'bank-3',
    exam_domain_id: 'dom-4',
    sort_order: 1,
    updated_at: daysAgo(3),
    difficulty: 'easy',
    difficulty_rating: 0.3,
    discrimination_rating: 0.5,
    tags: ['modern', 'Mies'],
    times_answered: 410,
    times_correct: 356,
    prompt:
      'The Farnsworth House (1951) by Mies van der Rohe is an iconic example of which architectural style?',
    choices: [
      makeChoice('q4-a', 'Brutalism', false),
      makeChoice('q4-b', 'Art Deco', false),
      makeChoice('q4-c', 'International Style', true),
      makeChoice('q4-d', 'Deconstructivism', false),
    ],
    correct_answer: 'q4-c',
    explanation:
      "The Farnsworth House exemplifies the International Style with its minimalist steel-and-glass construction, open floor plan, and emphasis on structural clarity — embodying Mies's 'less is more' philosophy.",
  },
  {
    ...Q_BASE,
    id: 'q-5',
    bank_id: 'bank-3',
    exam_domain_id: 'dom-4',
    sort_order: 2,
    updated_at: daysAgo(3),
    difficulty: 'easy',
    difficulty_rating: 0.25,
    discrimination_rating: 0.45,
    tags: ['Greek', 'orders'],
    times_answered: 520,
    times_correct: 468,
    prompt:
      'Which of the classical Greek orders is characterized by its slender, fluted columns and scroll-shaped (volute) capitals?',
    choices: [
      makeChoice('q5-a', 'Doric', false),
      makeChoice('q5-b', 'Ionic', true),
      makeChoice('q5-c', 'Corinthian', false),
      makeChoice('q5-d', 'Tuscan', false),
    ],
    correct_answer: 'q5-b',
    explanation:
      'The Ionic order is identified by its volute (scroll-shaped) capitals and more slender proportions compared to the Doric order. Corinthian features acanthus leaf capitals.',
  },
  {
    ...Q_BASE,
    id: 'q-11',
    bank_id: 'bank-3',
    exam_domain_id: 'dom-4',
    sort_order: 3,
    updated_at: daysAgo(4),
    difficulty: 'medium',
    difficulty_rating: 0.45,
    discrimination_rating: 0.62,
    tags: ['Corbusier', 'modern'],
    times_answered: 350,
    times_correct: 228,
    is_multi_select: true,
    prompt:
      "Which of the following are part of Le Corbusier's 'Five Points of Architecture'? (Select all that apply)",
    choices: [
      makeChoice('q11-a', 'Pilotis (ground-level columns)', true),
      makeChoice('q11-b', 'Free façade', true),
      makeChoice('q11-c', 'Flying buttresses', false),
      makeChoice('q11-d', 'Ribbon windows', true),
    ],
    correct_answer: 'q11-a,q11-b,q11-d',
    explanation:
      "Le Corbusier's Five Points are: pilotis, free plan, free façade, ribbon windows, and roof garden. Flying buttresses are a Gothic structural element.",
  },
  {
    ...Q_BASE,
    id: 'q-12',
    bank_id: 'bank-3',
    exam_domain_id: 'dom-4',
    sort_order: 4,
    updated_at: daysAgo(5),
    difficulty: 'medium',
    difficulty_rating: 0.5,
    discrimination_rating: 0.58,
    tags: ['Gothic', 'medieval'],
    times_answered: 300,
    times_correct: 195,
    prompt:
      'What structural innovation allowed Gothic cathedrals to have thinner walls and larger windows than Romanesque buildings?',
    choices: [
      makeChoice('q12-a', 'Post-and-lintel construction', false),
      makeChoice('q12-b', 'Pointed arches and flying buttresses', true),
      makeChoice('q12-c', 'Reinforced masonry', false),
      makeChoice('q12-d', 'Corbelled arches', false),
    ],
    correct_answer: 'q12-b',
    explanation:
      'Pointed arches directed loads more efficiently downward, while flying buttresses transferred lateral thrust away from walls — allowing thin walls with expansive stained-glass windows.',
  },

  // ── Bank 4: Building Codes (dom-5) ──────────────────────────────
  {
    ...Q_BASE,
    id: 'q-13',
    bank_id: 'bank-4',
    exam_domain_id: 'dom-5',
    sort_order: 1,
    updated_at: daysAgo(5),
    difficulty: 'medium',
    difficulty_rating: 0.55,
    discrimination_rating: 0.65,
    tags: ['NBC', 'fire code'],
    times_answered: 220,
    times_correct: 132,
    is_multi_select: true,
    prompt:
      'Which of the following are required fire safety provisions under PD 1096 for high-rise buildings? (Select all that apply)',
    choices: [
      makeChoice('q13-a', 'Automatic sprinkler system', true),
      makeChoice('q13-b', 'Fire-rated stairwell enclosures', true),
      makeChoice('q13-c', 'Rooftop swimming pool', false),
      makeChoice('q13-d', 'Standpipe and hose system', true),
    ],
    correct_answer: 'q13-a,q13-b,q13-d',
    explanation:
      'PD 1096 requires high-rise buildings to have automatic sprinklers, fire-rated stairwell enclosures for safe egress, and standpipe systems for firefighter access. Rooftop pools are not a fire safety requirement.',
  },
  {
    ...Q_BASE,
    id: 'q-14',
    bank_id: 'bank-4',
    exam_domain_id: 'dom-5',
    sort_order: 2,
    updated_at: daysAgo(6),
    difficulty: 'easy',
    difficulty_rating: 0.32,
    discrimination_rating: 0.48,
    tags: ['accessibility', 'codes'],
    times_answered: 360,
    times_correct: 288,
    prompt:
      'According to BP 344 (Accessibility Law of the Philippines), the minimum clear width of a ramp for wheelchair accessibility is:',
    choices: [
      makeChoice('q14-a', '0.60 m', false),
      makeChoice('q14-b', '0.90 m', false),
      makeChoice('q14-c', '1.20 m', true),
      makeChoice('q14-d', '1.50 m', false),
    ],
    correct_answer: 'q14-c',
    explanation:
      'BP 344 requires a minimum clear ramp width of 1.20 meters to allow wheelchair users comfortable passage, with handrails on both sides.',
  },
  {
    ...Q_BASE,
    id: 'q-15',
    bank_id: 'bank-4',
    exam_domain_id: 'dom-5',
    sort_order: 3,
    updated_at: daysAgo(7),
    difficulty: 'hard',
    difficulty_rating: 0.65,
    discrimination_rating: 0.72,
    tags: ['NBC', 'setback'],
    times_answered: 180,
    times_correct: 90,
    prompt:
      'Under PD 1096, the required percentage of site occupancy (RROW) for a residential building in an R-1 zone is typically:',
    choices: [
      makeChoice('q15-a', '90%', false),
      makeChoice('q15-b', '70%', false),
      makeChoice('q15-c', '80%', true),
      makeChoice('q15-d', '60%', false),
    ],
    correct_answer: 'q15-c',
    explanation:
      'For R-1 (low-density residential) zones, PD 1096 generally allows up to 80% lot occupancy, reserving at least 20% for setbacks, open space, and ventilation.',
  },
  {
    ...Q_BASE,
    id: 'q-16',
    bank_id: 'bank-4',
    exam_domain_id: 'dom-5',
    sort_order: 4,
    updated_at: daysAgo(8),
    difficulty: 'medium',
    difficulty_rating: 0.5,
    discrimination_rating: 0.6,
    tags: ['egress', 'fire code'],
    times_answered: 260,
    times_correct: 156,
    prompt:
      'The maximum travel distance to an exit in a fully sprinklered building (business occupancy) is generally:',
    choices: [
      makeChoice('q16-a', '30 meters', false),
      makeChoice('q16-b', '45 meters', false),
      makeChoice('q16-c', '60 meters', true),
      makeChoice('q16-d', '75 meters', false),
    ],
    correct_answer: 'q16-c',
    explanation:
      'Sprinkler systems extend the allowable travel distance. For business occupancies, the maximum travel distance in a sprinklered building is typically 60 meters (200 feet).',
  },

  // ── Bank 5: Site Planning (dom-6) ───────────────────────────────
  {
    ...Q_BASE,
    id: 'q-17',
    bank_id: 'bank-5',
    exam_domain_id: 'dom-6',
    sort_order: 1,
    updated_at: daysAgo(8),
    difficulty: 'medium',
    difficulty_rating: 0.48,
    discrimination_rating: 0.58,
    tags: ['grading', 'drainage'],
    times_answered: 200,
    times_correct: 120,
    prompt:
      'The minimum slope for surface drainage away from a building foundation is typically:',
    choices: [
      makeChoice('q17-a', '0.5%', false),
      makeChoice('q17-b', '1% (1:100)', false),
      makeChoice('q17-c', '2% (1:50)', true),
      makeChoice('q17-d', '5% (1:20)', false),
    ],
    correct_answer: 'q17-c',
    explanation:
      'A 2% minimum grade (about 2 cm per meter) ensures surface water drains away from the foundation effectively, preventing moisture problems and settlement.',
  },
  {
    ...Q_BASE,
    id: 'q-18',
    bank_id: 'bank-5',
    exam_domain_id: 'dom-6',
    sort_order: 2,
    updated_at: daysAgo(9),
    difficulty: 'easy',
    difficulty_rating: 0.3,
    discrimination_rating: 0.42,
    tags: ['orientation', 'climate'],
    times_answered: 340,
    times_correct: 272,
    prompt:
      'In tropical climates like the Philippines, the ideal long-axis orientation of a building for energy efficiency is:',
    choices: [
      makeChoice('q18-a', 'North-South', true),
      makeChoice('q18-b', 'East-West', false),
      makeChoice('q18-c', 'Northeast-Southwest', false),
      makeChoice('q18-d', 'Orientation has no impact', false),
    ],
    correct_answer: 'q18-a',
    explanation:
      'Orienting the long axis North-South minimizes direct solar heat gain on the east and west facades, which receive intense low-angle sun in tropical latitudes.',
  },
  {
    ...Q_BASE,
    id: 'q-19',
    bank_id: 'bank-5',
    exam_domain_id: 'dom-6',
    sort_order: 3,
    updated_at: daysAgo(10),
    difficulty: 'hard',
    difficulty_rating: 0.62,
    discrimination_rating: 0.7,
    tags: ['zoning', 'FAR'],
    times_answered: 180,
    times_correct: 97,
    prompt:
      'A Floor Area Ratio (FAR) of 4.0 on a 500 sqm lot means the maximum total gross floor area is:',
    choices: [
      makeChoice('q19-a', '500 sqm', false),
      makeChoice('q19-b', '1,000 sqm', false),
      makeChoice('q19-c', '2,000 sqm', true),
      makeChoice('q19-d', '4,000 sqm', false),
    ],
    correct_answer: 'q19-c',
    explanation:
      'FAR is the ratio of total floor area to lot area. FAR 4.0 × 500 sqm lot = 2,000 sqm maximum gross floor area, which can be distributed over multiple storeys.',
  },
  {
    ...Q_BASE,
    id: 'q-20',
    bank_id: 'bank-5',
    exam_domain_id: 'dom-6',
    sort_order: 4,
    updated_at: daysAgo(11),
    difficulty: 'medium',
    difficulty_rating: 0.45,
    discrimination_rating: 0.55,
    tags: ['environment', 'site'],
    times_answered: 230,
    times_correct: 149,
    prompt: 'A percolation test is performed on a building site to determine:',
    choices: [
      makeChoice('q20-a', 'Soil bearing capacity', false),
      makeChoice('q20-b', 'The rate at which water is absorbed by soil', true),
      makeChoice('q20-c', 'Soil pH level', false),
      makeChoice('q20-d', 'Depth to bedrock', false),
    ],
    correct_answer: 'q20-b',
    explanation:
      'A percolation test measures how quickly water drains through soil, which is critical for designing septic systems, drainage fields, and stormwater management.',
  },
]

export const DEMO_TEST_SESSIONS = [
  {
    id: 'sess-1',
    user_id: uid,
    bank_id: 'bank-1',
    exam_domain_id: 'dom-1',
    config_id: null,
    session_config: [
      {
        bankId: 'bank-1',
        bankTitle: 'ALE Structural Engineering',
        questionCount: 20,
      },
    ],
    session_type: 'practice',
    total_questions: 20,
    correct_answers: 16,
    total_time_ms: 840000,
    score_percentage: 80,
    difficulty_mode: 'mixed',
    completed_at: daysAgo(1),
    created_at: daysAgo(1),
  },
  {
    id: 'sess-2',
    user_id: uid,
    bank_id: 'bank-3',
    exam_domain_id: 'dom-4',
    config_id: null,
    session_config: [
      {
        bankId: 'bank-3',
        bankTitle: 'History of Architecture',
        questionCount: 30,
      },
    ],
    session_type: 'timed_test',
    total_questions: 30,
    correct_answers: 24,
    total_time_ms: 1620000,
    score_percentage: 80,
    difficulty_mode: 'mixed',
    completed_at: daysAgo(3),
    created_at: daysAgo(3),
  },
  {
    id: 'sess-3',
    user_id: uid,
    bank_id: null,
    exam_domain_id: null,
    config_id: 'rconfig-1',
    session_config: [
      {
        bankId: 'bank-1',
        bankTitle: 'ALE Structural Engineering',
        questionCount: 10,
      },
      {
        bankId: 'bank-2',
        bankTitle: 'Building Materials & Methods',
        questionCount: 10,
      },
      {
        bankId: 'bank-3',
        bankTitle: 'History of Architecture',
        questionCount: 5,
      },
    ],
    session_type: 'practice',
    total_questions: 25,
    correct_answers: 18,
    total_time_ms: 1500000,
    score_percentage: 72,
    difficulty_mode: 'mixed',
    completed_at: daysAgo(5),
    created_at: daysAgo(5),
  },
  {
    id: 'sess-4',
    user_id: uid,
    bank_id: 'bank-1',
    exam_domain_id: 'dom-1',
    config_id: null,
    session_config: [
      {
        bankId: 'bank-1',
        bankTitle: 'ALE Structural Engineering',
        questionCount: 10,
      },
    ],
    session_type: 'review',
    total_questions: 10,
    correct_answers: 9,
    total_time_ms: 360000,
    score_percentage: 90,
    difficulty_mode: 'mixed',
    completed_at: daysAgo(7),
    created_at: daysAgo(7),
  },
  {
    id: 'sess-5',
    user_id: uid,
    bank_id: 'bank-3',
    exam_domain_id: 'dom-4',
    config_id: null,
    session_config: [
      {
        bankId: 'bank-3',
        bankTitle: 'History of Architecture',
        questionCount: 25,
      },
    ],
    session_type: 'practice',
    total_questions: 25,
    correct_answers: 22,
    total_time_ms: 1200000,
    score_percentage: 88,
    difficulty_mode: 'mixed',
    completed_at: daysAgo(10),
    created_at: daysAgo(10),
  },
]

export const DEMO_SRS_QUEUE = [
  {
    id: 'srs-1',
    user_id: uid,
    question_id: 'q-2',
    next_review_at: daysAgo(0),
    interval_days: 1,
    ease_factor: 2.3,
    repetition_count: 2,
    lapses: 1,
    last_quality: 3,
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
  },
  {
    id: 'srs-2',
    user_id: uid,
    question_id: 'q-3',
    next_review_at: daysAgo(0),
    interval_days: 3,
    ease_factor: 2.5,
    repetition_count: 3,
    lapses: 0,
    last_quality: 4,
    created_at: daysAgo(10),
    updated_at: daysAgo(3),
  },
  {
    id: 'srs-3',
    user_id: uid,
    question_id: 'q-1',
    next_review_at: daysFromNow(2),
    interval_days: 7,
    ease_factor: 2.6,
    repetition_count: 5,
    lapses: 0,
    last_quality: 5,
    created_at: daysAgo(30),
    updated_at: daysAgo(7),
  },
]

export const DEMO_DOMAIN_MASTERY = [
  {
    id: 'dm-1',
    user_id: uid,
    exam_domain_id: 'dom-1',
    total_attempted: 85,
    total_correct: 68,
    mastery_score: 80,
    theta: 1.2,
    last_practiced_at: daysAgo(1),
    updated_at: daysAgo(1),
    exam_domains: { name: 'Structural Systems' },
  },
  {
    id: 'dm-2',
    user_id: uid,
    exam_domain_id: 'dom-2',
    total_attempted: 60,
    total_correct: 39,
    mastery_score: 65,
    theta: 0.4,
    last_practiced_at: daysAgo(5),
    updated_at: daysAgo(5),
    exam_domains: { name: 'Building Envelope' },
  },
  {
    id: 'dm-3',
    user_id: uid,
    exam_domain_id: 'dom-3',
    total_attempted: 40,
    total_correct: 30,
    mastery_score: 75,
    theta: 0.8,
    last_practiced_at: daysAgo(8),
    updated_at: daysAgo(8),
    exam_domains: { name: 'MEP Systems' },
  },
  {
    id: 'dm-4',
    user_id: uid,
    exam_domain_id: 'dom-4',
    total_attempted: 110,
    total_correct: 97,
    mastery_score: 88,
    theta: 1.8,
    last_practiced_at: daysAgo(3),
    updated_at: daysAgo(3),
    exam_domains: { name: 'Design History & Theory' },
  },
  {
    id: 'dm-5',
    user_id: uid,
    exam_domain_id: 'dom-5',
    total_attempted: 55,
    total_correct: 38,
    mastery_score: 69,
    theta: 0.5,
    last_practiced_at: daysAgo(12),
    updated_at: daysAgo(12),
    exam_domains: { name: 'Building Codes & Standards' },
  },
  {
    id: 'dm-6',
    user_id: uid,
    exam_domain_id: 'dom-6',
    total_attempted: 30,
    total_correct: 24,
    mastery_score: 80,
    theta: 1.1,
    last_practiced_at: daysAgo(15),
    updated_at: daysAgo(15),
    exam_domains: { name: 'Site Planning' },
  },
]

function makeDailyStats(
  daysBack: number,
  attempted: number,
  correct: number,
  timeMs: number,
) {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return {
    id: `stats-${daysBack}`,
    user_id: uid,
    date: d.toISOString().split('T')[0],
    questions_attempted: attempted,
    questions_correct: correct,
    total_study_time_ms: timeMs,
    domains_studied: ['dom-1', 'dom-4'],
    streak_maintained: true,
    created_at: d.toISOString(),
  }
}

export const DEMO_DAILY_STATS = [
  makeDailyStats(0, 32, 26, 1920000),
  makeDailyStats(1, 45, 38, 2700000),
  makeDailyStats(2, 28, 22, 1680000),
  makeDailyStats(3, 50, 40, 3000000),
  makeDailyStats(4, 0, 0, 0),
  makeDailyStats(5, 35, 23, 2100000),
  makeDailyStats(6, 42, 35, 2520000),
  makeDailyStats(7, 20, 18, 1200000),
  makeDailyStats(8, 38, 30, 2280000),
  makeDailyStats(9, 25, 20, 1500000),
  makeDailyStats(10, 55, 49, 3300000),
  makeDailyStats(11, 30, 24, 1800000),
  makeDailyStats(12, 40, 32, 2400000),
  makeDailyStats(13, 15, 12, 900000),
  makeDailyStats(14, 48, 41, 2880000),
]

export const DEMO_REVIEW_CONFIGS = [
  {
    id: 'rconfig-1',
    user_id: uid,
    name: 'Full ALE Review',
    bank_configs: [
      {
        bankId: 'bank-1',
        bankTitle: 'ALE Structural Engineering',
        questionCount: 10,
      },
      {
        bankId: 'bank-2',
        bankTitle: 'Building Materials & Methods',
        questionCount: 10,
      },
      {
        bankId: 'bank-3',
        bankTitle: 'History of Architecture',
        questionCount: 5,
      },
    ],
    session_type: 'practice',
    total_questions: 25,
    is_saved: true,
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
  },
  {
    id: 'rconfig-2',
    user_id: uid,
    name: 'Structural Focus — Timed',
    bank_configs: [
      {
        bankId: 'bank-1',
        bankTitle: 'ALE Structural Engineering',
        questionCount: 20,
      },
    ],
    session_type: 'timed_test',
    total_questions: 20,
    is_saved: true,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
]

export const DEMO_USER_RESPONSES = [
  {
    question_id: 'q-2',
    is_correct: false,
    questions: {
      prompt:
        'What is the primary advantage of a post-tensioned concrete slab over a conventionally reinforced slab?',
    },
  },
  {
    question_id: 'q-3',
    is_correct: false,
    questions: {
      prompt:
        'In curtain wall construction, what is the primary function of a pressure-equalized rain screen?',
    },
  },
  {
    question_id: 'q-2',
    is_correct: false,
    questions: {
      prompt:
        'What is the primary advantage of a post-tensioned concrete slab over a conventionally reinforced slab?',
    },
  },
  {
    question_id: 'q-3',
    is_correct: false,
    questions: {
      prompt:
        'In curtain wall construction, what is the primary function of a pressure-equalized rain screen?',
    },
  },
  {
    question_id: 'q-3',
    is_correct: false,
    questions: {
      prompt:
        'In curtain wall construction, what is the primary function of a pressure-equalized rain screen?',
    },
  },
]

export const DEMO_MARKETPLACE_PURCHASES = [{ bank_id: 'bank-4', buyer_id: uid }]

const DOMAIN_TO_SUBJECT: Record<string, string> = {
  'dom-1': 'sub-4', // Structural Systems → Structural Engineering
  'dom-2': 'sub-3', // Building Envelope → Building Technology
  'dom-3': 'sub-5', // MEP Systems → Utilities
  'dom-4': 'sub-1', // Design History → History of Architecture
  'dom-5': 'sub-6', // Building Codes → Laws and Codes
  'dom-6': 'sub-7', // Site Planning → Site Planning
}

function enrichQuestions() {
  return DEMO_QUESTIONS.map((q) => {
    const rec = q as Record<string, unknown>
    return {
      ...q,
      subject_id:
        (rec.subject_id as string) ??
        DOMAIN_TO_SUBJECT[(rec.exam_domain_id as string) ?? ''] ??
        null,
      topic_id: (rec.topic_id as string | null) ?? null,
      references: (rec.references as unknown[]) ?? [],
      fun_facts: (rec.fun_facts as string[]) ?? [],
      mnemonics: (rec.mnemonics as string | null) ?? null,
      related_topic_ids: (rec.related_topic_ids as string[]) ?? [],
      global_times_answered:
        (rec.global_times_answered as number) ??
        (rec.times_answered as number) ??
        0,
      global_times_correct:
        (rec.global_times_correct as number) ??
        (rec.times_correct as number) ??
        0,
    }
  })
}

export function getDemoDataForTable(table: string, tier?: UserTier): unknown[] {
  switch (table) {
    case 'profiles':
      return [tier ? getDemoProfile(tier) : DEMO_PROFILE]
    case 'board_exams':
      return DEMO_BOARD_EXAMS
    case 'exam_profiles':
      return DEMO_EXAM_PROFILES
    case 'subjects':
      return DEMO_SUBJECTS
    case 'subject_mastery':
      return DEMO_SUBJECT_MASTERY
    case 'exam_domains':
      return DEMO_EXAM_DOMAINS
    case 'question_banks':
      return DEMO_QUESTION_BANKS
    case 'questions':
      return enrichQuestions()
    case 'test_sessions':
      return DEMO_TEST_SESSIONS
    case 'review_sessions':
      return DEMO_REVIEW_SESSIONS
    case 'session_questions':
      return []
    case 'session_templates':
      return []
    case 'review_mode_interactions':
      return []
    case 'study_time_logs':
      return DEMO_STUDY_TIME_LOGS
    case 'srs_queue':
      return DEMO_SRS_QUEUE
    case 'domain_mastery':
      return DEMO_DOMAIN_MASTERY
    case 'daily_user_stats':
      return DEMO_DAILY_STATS
    case 'review_session_configs':
      return DEMO_REVIEW_CONFIGS
    case 'user_responses':
      return DEMO_USER_RESPONSES
    case 'marketplace_purchases':
      return DEMO_MARKETPLACE_PURCHASES
    default:
      return []
  }
}
