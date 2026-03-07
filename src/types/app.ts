export type UserTier = "free" | "pro" | "max";
export type QuestionType = "mcq" | "true_false" | "identification" | "essay" | "matching" | "sequence";
export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";
export type ContentStatus = "draft" | "published" | "archived" | "flagged";
export type Profession = "architecture" | "medicine" | "law" | "engineering";
export type SessionType = "practice" | "timed_test" | "review" | "ai_adaptive";
export type DifficultyMode = "easy" | "medium" | "hard" | "mixed" | "adaptive";
export type Theme = "light" | "dark" | "system";

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
  created_at: string;
  updated_at: string;
}

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
  profession: string;
  exam_domain_id: string | null;
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
}

export interface Choice {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  bank_id: string;
  exam_domain_id: string | null;
  creator_id: string | null;
  question_type: QuestionType;
  prompt: string;
  choices: Choice[] | null;
  correct_answer: string;
  is_multi_select: boolean;
  media_url: string | null;
  explanation: string | null;
  explanation_references: string[] | null;
  difficulty: DifficultyLevel;
  difficulty_rating: number;
  discrimination_rating: number;
  has_3d_component: boolean;
  three_d_model_ref: string | null;
  image_urls: string[];
  tags: string[];
  times_answered: number;
  times_correct: number;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
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

export interface TestSession {
  id: string;
  user_id: string;
  bank_id: string | null;
  exam_domain_id: string | null;
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

export interface DailyUserStats {
  id: string;
  user_id: string;
  date: string;
  questions_attempted: number;
  questions_correct: number;
  total_study_time_ms: number;
  domains_studied: string[];
  streak_maintained: boolean;
  created_at: string;
}

export interface QuizConfig {
  mode: SessionType;
  bankId?: string;
  domainId?: string;
  questionCount: number;
  difficultyMode: DifficultyMode;
  timedMinutes?: number;
}
