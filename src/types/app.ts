export type UserTier = "free" | "camp" | "insurance" | "institutional";
export type QuestionType = "mcq" | "true_false" | "identification" | "essay" | "matching" | "sequence" | "sequencing";
export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";
export type ContentStatus = "draft" | "published" | "archived" | "flagged";
export type Profession = "architecture" | "medicine" | "law" | "engineering";
export type NewSessionType = "subject_quick" | "custom_compiled" | "srs_review" | "ai_adaptive" | "retake" | "topic_drill" | "3d_model_quiz" | "weak_areas";
export type SessionStatus = "in_progress" | "completed" | "abandoned";
export type ReferenceType = "book" | "code" | "standard" | "article" | "video" | "website";
export type DifficultyMode = "easy" | "medium" | "hard" | "expert" | "mixed" | "adaptive";
export type Theme = "light" | "dark" | "system";
export type TestMode = "camp" | "storm" | "chill" | "custom" | "blindspot" | "proof_sim" | "endurance";

// New Core Types (v1.0 Master Schema)
export interface Discipline {
  discipline_id: string;
  name: string;
  acronym: string;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyNode {
  node_id: string;
  discipline_id: string;
  parent_id: string | null;
  level: number;
  name: string;
  subject_area: string;
  slug?: string | null;
  is_leaf: boolean;
  created_at: string;
  updated_at: string;
  children?: TaxonomyNode[];
  /** Joined from user_node_mastery — present when fetched with mastery data */
  mastery?: number;
  last_encountered?: string | null;
}

export interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
  rationale?: string | null; // PRD Section 3, Step 7: SME-written rationale per option
}

export interface Question {
  question_id: string;
  topic_id: string;
  subject_id?: string;
  text: string;
  options: Choice[];
  correct_option_id: string;
  correct_answer?: string;
  rationale: string | null; // General rationale
  difficulty: number; // 0.0 to 1.0
  difficulty_rating?: number; // IRT field
  discrimination_rating?: number; // IRT field
  prompt_image_url?: string | null;
  explanation?: string | null;
  code_citation?: string | null;
  model_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserNodeMastery {
  user_id: string;
  topic_id: string;
  total_attempts: number;
  total_correct: number;
  current_mastery_weight: number; // EMA float
  avg_time_ms: number;
  last_encountered: string;
}

export interface WikiArticle {
  article_id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  subscription_id: string;
  user_id: string;
  tier: UserTier;
  status: "active" | "canceled" | "past_due" | "trialing";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  payrex_reference: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGlobalStats {
  user_id: string;
  current_discipline_id: string | null;
  global_readiness_score: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_study_date: string | null;
  updated_at: string;
}

export interface QuizSession {
  session_id: string;
  user_id: string;
  discipline_id: string;
  test_mode: TestMode;
  status: SessionStatus;
  config?: any; // Session configuration (timer, feedback settings, etc.)
  question_ids: string[];
  subject_ids?: string[];
  source_article_id?: string | null;
  current_question_index: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Legacy types kept for backward compatibility where needed
export type SessionType = "practice" | "timed_test" | "review" | "ai_adaptive";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: UserTier;
  profession: Profession;
  exam_target: string | null;
  target_exam_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  ai_tokens_used: number;
  ai_tokens_limit: number;
  daily_streak: number;
  longest_streak: number;
  last_active_at: string;
  preferred_theme: Theme;
  onboarding_completed: boolean;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardExam {
  id: string;
  profession: string;
  specialization: string | null;
  name: string;
  short_name: string;
  country: string;
  description: string | null;
  total_subjects: number | null;
  passing_score_percentage: number | null;
  icon_name: string | null;
  is_active: boolean;
  has_content: boolean;
  sort_order: number;
  created_at: string;
}

export interface ExamProfile {
  id: string;
  user_id: string;
  board_exam_id: string;
  target_exam_date: string | null;
  study_hours_per_day: number;
  is_active: boolean;
  onboarding_completed: boolean;
  daily_streak: number;
  longest_streak: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
  board_exams?: BoardExam;
}

export interface Subject {
  id: string;
  board_exam_id: string;
  name: string;
  short_name: string | null;
  slug: string;
  description: string | null;
  exam_weight_percentage: number;
  estimated_question_count: number | null;
  color: string | null;
  icon_name: string | null;
  has_3d_workspace: boolean;
  sort_order: number;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_topic_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface QuestionReference {
  title: string;
  url?: string | null;
  page?: string | null;
  type: ReferenceType;
}

// Review types
export interface ReviewSession {
  id: string;
  user_id: string;
  exam_profile_id: string;
  session_type: NewSessionType;
  template_id: string | null;
  retake_of_session_id: string | null;
  source_subject_id: string | null;
  source_topic_id: string | null;
  source_3d_model_id: string | null;
  config: SessionConfig;
  name: string | null;
  total_questions: number;
  questions_answered: number;
  questions_correct: number;
  questions_incorrect: number;
  questions_skipped: number;
  score_percentage: number | null;
  total_time_ms: number;
  avg_response_time_ms: number | null;
  subject_scores: SubjectScore[];
  status: SessionStatus;
  started_at: string;
  paused_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SubjectScore {
  subject_id: string;
  subject_name: string;
  total: number;
  correct: number;
  percentage: number;
  avg_time_ms: number;
}

export interface SessionConfig {
  subjects?: { subject_id: string; question_count: number; difficulty?: string }[];
  specific_question_ids?: string[];
  timer_mode?: "none" | "per_question" | "total";
  timer_seconds?: number | null;
  shuffle_questions?: boolean;
  shuffle_choices?: boolean;
  show_immediate_feedback?: boolean;
}

export interface SessionQuestion {
  id: string;
  session_id: string;
  question_id: string;
  question_number: number;
  subject_id: string | null;
  topic_id: string | null;
  selected_answer: string | null;
  is_correct: boolean | null;
  response_time_ms: number | null;
  confidence_level: number | null;
  presented_at: string | null;
  answered_at: string | null;
  is_bookmarked: boolean;
  is_skipped: boolean;
  created_at: string;
  questions?: Question;
}

export interface SessionTemplate {
  id: string;
  user_id: string;
  exam_profile_id: string;
  name: string;
  description: string | null;
  config: SessionConfig;
  total_questions: number;
  is_shared: boolean;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionUserPerformance {
  question_id: string;
  user_id: string;
  exam_profile_id: string;
  subject_id: string | null;
  topic_id: string | null;
  times_seen: number;
  times_correct: number;
  times_incorrect: number;
  times_skipped: number;
  accuracy_percentage: number | null;
  avg_response_time_ms: number | null;
  fastest_response_ms: number | null;
  last_attempt_correct: boolean | null;
  last_attempted_at: string | null;
}

export interface SubjectMastery {
  id: string;
  user_id: string;
  exam_profile_id: string;
  subject_id: string;
  total_attempted: number;
  total_correct: number;
  mastery_score: number;
  theta: number;
  avg_response_time_ms: number;
  last_practiced_at: string | null;
  updated_at: string;
}

export interface DailyUserStats {
  id: string;
  user_id: string;
  exam_profile_id?: string;
  date: string;
  questions_attempted: number;
  questions_correct: number;
  total_study_time_ms: number;
  review_mode_time_ms?: number;
  session_mode_time_ms?: number;
  three_d_time_ms?: number;
  sessions_completed?: number;
  subjects_studied: string[];
  streak_maintained: boolean;
  created_at: string;
}

export interface StudyTimeLog {
  id: string;
  user_id: string;
  exam_profile_id: string;
  mode: "review" | "session" | "3d_library" | "tutor";
  session_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

// Legacy types kept for backward compat
export interface ExamDomain {
  id: string;
  profession: string;
  name: string;
  slug: string;
  description: string | null;
  parent_domain_id: string | null;
  sort_order: number;
  icon_name: string | null;
  created_at: string;
}

export interface QuestionBank {
  id: string;
  creator_id: string | null;
  title: string;
  description: string | null;
  board_exam_id: string | null;
  is_official: boolean;
  is_marketplace: boolean;
  price_cents: number;
  currency: string;
  status: ContentStatus;
  question_count: number;
  average_rating: number;
  total_ratings: number;
  total_purchases: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  /** Present only when joined or in demo; schema has no profession on question_banks */
  profession?: string;
  /** Deprecated; schema uses board_exam_id only */
  exam_domain_id?: string | null;
}

export interface UserResponse {
  id: string;
  user_id: string;
  question_id: string;
  session_id: string | null;
  selected_answer: string;
  is_correct: boolean;
  response_time_ms: number | null;
  confidence_level: number | null;
  created_at: string;
}

export interface BankConfigItem {
  bankId: string;
  bankTitle: string;
  questionCount: number;
}

export interface ReviewSessionConfig {
  id: string;
  user_id: string;
  name: string;
  bank_configs: BankConfigItem[];
  session_type: SessionType;
  total_questions: number;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  user_id: string;
  bank_id: string | null;
  exam_domain_id: string | null;
  config_id: string | null;
  session_config: BankConfigItem[] | null;
  session_type: SessionType;
  total_questions: number;
  correct_answers: number;
  total_time_ms: number;
  score_percentage: number | null;
  difficulty_mode: DifficultyMode;
  completed_at: string | null;
  created_at: string;
}

export interface SrsQueueItem {
  id: string;
  user_id: string;
  question_id: string;
  exam_profile_id?: string;
  next_review_at: string;
  interval_days: number;
  ease_factor: number;
  repetition_count: number;
  lapses: number;
  last_quality: number | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  exam_profile_id?: string;
  filename: string;
  file_path: string;
  file_size_bytes: number | null;
  page_count: number | null;
  status: "processing" | "ready" | "error";
  profession: string | null;
  exam_domain_id: string | null;
  created_at: string;
}

export interface DomainMastery {
  id: string;
  user_id: string;
  exam_domain_id: string;
  total_attempted: number;
  total_correct: number;
  mastery_score: number;
  theta: number;
  last_practiced_at: string | null;
  updated_at: string;
}

export interface QuizConfig {
  mode: SessionType;
  bankConfigs: BankConfigItem[];
  totalQuestions: number;
  difficultyMode: DifficultyMode;
  timedMinutes?: number;
  configId?: string;
}

// =============================================
// PRD Feature Types
// =============================================

// F-01: Readiness Score
export interface ReadinessScoreData {
  score: number;
  previousScore: number | null;
  subScores: {
    accuracy: number;
    coverage: number;
    srsHealth: number;
    recency: number;
    weakArea: number;
  };
  label: string;
  color: string;
}

export type ReadinessLevel = 'needs_work' | 'building_momentum' | 'getting_there' | 'strong' | 'exam_ready';

export interface ReadinessScoreSnapshot {
  id: string;
  exam_profile_id: string;
  score: number;
  sub_scores: Record<string, number>;
  computed_at: string;
  source: 'session_complete' | 'diagnostic' | 'daily_cron' | 'manual';
}

// F-02: Daily Mission
export type MissionType = 'srs_review' | 'weak_area_drill' | 'exploration' | 'quick_session';

export interface DailyMissionData {
  type: MissionType;
  label: string;
  subjectName?: string;
  questionCount: number;
  estimatedMinutes: number;
  sessionConfig: SessionConfig;
  completedToday: boolean;
}

// F-03: Onboarding
export type OnboardingStep = 'exam_selected' | 'date_set' | 'diagnostic_complete' | 'onboarding_completed';

// F-05: Session Insights
export interface SessionInsightData {
  insight: string;
  type: 'improvement' | 'top_performance' | 'streak' | 'coverage' | 'first_session';
}

// F-08: Social Proof
export interface QuestionSocialProof {
  weeklyAttempts: number;
  weeklyAccuracy: number;
}

// F-09: Final Stretch
export type FinalStretchPhase = 'final_approach' | 'countdown' | 'final_week' | 'exam_eve' | null;

// =============================================
// Wiki / Resources Types
// =============================================

export interface WikiCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  children?: WikiCategory[];
}

export interface WikiPage {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  markdown_content: string;
  tags: string[];
  is_free: boolean;
  is_deprecated: boolean;
  deprecated_by: string | null;
  deprecated_note: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  wiki_categories?: WikiCategory;
}

export interface WikiPageLink {
  id: string;
  source_page_id: string;
  target_page_id: string;
  created_at: string;
}

export interface WikiSearchResult {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  tags: string[];
  is_deprecated: boolean;
  is_free: boolean;
  headline: string;
  rank: number;
}

/** Returned by searchWikiPaginated — includes total_count from the RPC window function */
export interface WikiSearchPaginatedResult extends WikiSearchResult {
  total_count: number
}

// Notes — contextually anchored, Tiptap JSONB
export type NoteType = 'standard' | 'quick_capture' | 'cornell' | 'gap_analysis';

export interface Note {
  id: string;
  user_id: string;
  folder_id?: string | null;
  topic_id?: string | null;
  question_id?: string | null;
  session_id?: string | null;
  article_id?: string | null;
  title: string;
  content: Record<string, unknown>;
  note_type: NoteType;
  is_pinned: boolean;
  tags: string[];
  color?: string | null;
  source_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteStub {
  id: string;
  title: string;
  updated_at: string;
  is_pinned: boolean;
  note_type: NoteType;
  topic_id?: string | null;
  question_id?: string | null;
  article_id?: string | null;
  tags: string[];
  color?: string | null;
  snippet?: string;
}

// =============================================
// Multi-Tenant / Organization Types
// =============================================

export type UserType = 'regular' | 'educational' | 'corporate'

export type OrgMemberRole = 'owner' | 'admin' | 'instructor' | 'member'

export interface Organization {
  org_id: string
  name: string
  slug: string
  type: UserType
  logo_url: string | null
  max_seats: number
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  org_id: string
  user_id: string
  role: OrgMemberRole
  joined_at: string
}

export interface FeatureFlagRecord {
  id: string
  key: string
  description: string | null
  enabled: boolean
  target_tier: string[]
  target_roles: string[]
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FinalStretchData {
  isActive: boolean;
  phase: FinalStretchPhase;
  daysRemaining: number | null;
  weakSubjects: Array<{
    subjectId: string;
    subjectName: string;
    accuracy: number;
    suggestedCount: number;
  }>;
}
