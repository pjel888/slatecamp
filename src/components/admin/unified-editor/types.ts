// ─── Shared Types for Unified Content Editor ─────────────────

export interface ArticleData {
  article_id: string
  title: string
  slug: string
  content: string
  status: string
  ale_tests_you: string | null
  updated_note: string | null
  subject_label: string | null
  difficulty_label: string | null
  reviewed_by: string | null
  reviewer_comments: string | null
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  id: string
  text: string
}

export interface QuestionData {
  question_id: string
  topic_id: string
  text: string
  options: QuestionOption[]
  correct_option_id: string
  rationale: string | null
  explanation: string | null
  code_citation: string | null
  difficulty: number | null
  difficulty_rating: number | null
  discrimination_rating: number | null
  prompt_image_url: string | null
  model_id: string | null
  is_assessment: boolean
  application_context: string | null
  practice_context: string[] | null
  created_at: string
  updated_at: string
}

export interface EIPromptData {
  prompt_id: string
  article_id: string
  node_id: string | null
  insert_after_heading: string
  prompt_text: string
  reveal_text: string
  options: { text: string; is_correct: boolean }[]
  sort_order: number
  is_active: boolean
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  reviewer_notes: string | null
  created_at: string
  updated_at: string
}

export interface TaxonomyNodeInfo {
  node_id: string
  name: string
  ale_id: string | null
  level: number
  parent_id: string | null
  subject_area: string
}

export interface TaxonomyLink {
  node_id: string
  is_primary: boolean
}

export interface QuestionDraft {
  _tempId: string
  topic_id: string
  text: string
  options: QuestionOption[]
  correct_option_id: string
  rationale: string
  explanation: string
  code_citation: string
  difficulty: number
  is_assessment: boolean
  application_context: string
  practice_context: string[]
  prompt_image_url: string
}

export interface EIPromptDraft {
  _tempId: string
  article_id: string
  node_id: string | null
  insert_after_heading: string
  prompt_text: string
  reveal_text: string
  options: { text: string; is_correct: boolean }[]
  sort_order: number
  is_active: boolean
  status: string
}

/** Parsed heading from article MDX content */
export interface ParsedHeading {
  level: 2 | 3
  text: string
  position: number
}

/** Save result for individual items */
export interface SaveItemResult {
  type: 'article' | 'question' | 'ei_prompt'
  id: string
  label: string
  success: boolean
  error?: string
}
