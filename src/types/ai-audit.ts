import type { Json } from '@/types/supabase'

export const AI_AUDIT_TARGET_TYPES = [
  'wiki_article',
  'question',
  'design_scenario_question',
  'source',
  'other',
] as const

export const AI_AUDIT_PHASES = [
  'not_started',
  'tier0_static_check',
  'tier1_ai_flag_scan',
  'tier2_source_verification',
  'tier3_correction_proposal',
  'tier4_validation',
  'human_review',
  'approved',
  'published',
] as const

export const AI_AUDIT_STATUSES = [
  'not_checked',
  'queued',
  'running',
  'passed',
  'flagged',
  'needs_source_check',
  'likely_wrong',
  'confirmed_wrong',
  'correction_proposed',
  'validated',
  'needs_human_review',
  'approved',
  'published',
  'rejected',
  'skipped',
  'failed',
] as const

export const AI_AUDIT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const

export const AI_AUDIT_FINDING_STATUSES = [
  'open',
  'confirmed',
  'rejected',
  'resolved',
  'superseded',
  'reopened',
] as const

export const AI_AUDIT_RISK_TYPES = [
  'unsupported_claim',
  'contradicted_claim',
  'outdated_requirement',
  'source_conflict',
  'missing_sources',
  'weak_sources',
  'ambiguous_statement',
  'incorrect_definition',
  'incorrect_date',
  'incorrect_person_or_attribution',
  'incorrect_code_requirement',
  'incorrect_legal_requirement',
  'incorrect_history',
  'unclear_wording',
  'answer_key_mismatch',
  'multiple_correct_answers',
  'no_valid_answer',
  'stem_inaccurate',
  'option_inaccurate',
  'rationale_inaccurate',
  'article_question_conflict',
  'unsupported_question',
  'missing_answer_key',
  'missing_options',
  'missing_rationale',
  'needs_source_check',
  'needs_human_review',
  'needs_correction',
  'blocked_by_missing_context',
  'other',
] as const

export const AI_CHANGE_PROPOSAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'needs_edit',
  'applied',
  'superseded',
] as const

export const AI_CHANGE_PROPOSAL_TYPES = [
  'article_edit',
  'question_edit',
  'answer_key_change',
  'source_update',
  'retire_question',
  'status_only',
  'other',
] as const

export const AI_REVIEW_DECISIONS = [
  'approve',
  'reject',
  'confirm',
  'resolve',
  'reopen',
  'mark_reviewed',
  'mark_needs_review',
  'edit',
  'retire',
  'note',
  'status_update',
  'needs_edit',
] as const

export type AiAuditTargetType = (typeof AI_AUDIT_TARGET_TYPES)[number]
export type AiAuditPhase = (typeof AI_AUDIT_PHASES)[number]
export type AiAuditStatus = (typeof AI_AUDIT_STATUSES)[number]
export type AiAuditSeverity = (typeof AI_AUDIT_SEVERITIES)[number]
export type AiAuditFindingStatus = (typeof AI_AUDIT_FINDING_STATUSES)[number]
export type AiAuditRiskType = (typeof AI_AUDIT_RISK_TYPES)[number]
export type AiChangeProposalStatus = (typeof AI_CHANGE_PROPOSAL_STATUSES)[number]
export type AiChangeProposalType = (typeof AI_CHANGE_PROPOSAL_TYPES)[number]
export type AiReviewDecision = (typeof AI_REVIEW_DECISIONS)[number]

export interface AiAuditDashboardSummary {
  total_articles: number
  total_questions: number
  total_design_scenario_questions: number
  articles_not_checked: number
  tier0_complete: number
  tier1_complete: number
  needs_source_check: number
  likely_or_confirmed_issues: number
  open_findings: number
  correction_proposed: number
  needs_human_review: number
  approved: number
  published: number
  questions_flagged: number
  answer_key_risks: number
  multiple_answer_risks: number
  pending_proposals: number
  total_runs: number
  articles_with_zero_sources: number
  status_not_checked: number
  status_passed: number
  status_flagged: number
  status_needs_source_check: number
  status_likely_wrong: number
  status_confirmed_wrong: number
  status_correction_proposed: number
  status_needs_human_review: number
  status_approved: number
  status_published: number
  severity_low: number
  severity_medium: number
  severity_high: number
  severity_critical: number
}

export interface AiAuditStatusCacheRow {
  target_type: AiAuditTargetType
  target_id: string
  article_id: string | null
  question_id: string | null
  latest_phase: AiAuditPhase
  latest_status: AiAuditStatus
  highest_severity: AiAuditSeverity | null
  findings_count: number
  open_findings_count: number
  needs_source_check: boolean
  needs_correction: boolean
  needs_human_review: boolean
  last_audited_at: string | null
  content_hash: string | null
  metadata?: Json
}

export interface AiAuditArticleOverview extends AiAuditStatusCacheRow {
  article_id: string
  title: string
  slug: string
  subject_label: string | null
  difficulty_label: string | null
  article_status: string | null
  reviewed_at: string | null
  updated_at: string
  source_count: number
  verified_source_count: number
  question_count: number
  content_preview: string | null
  severity_rank: number
}

export interface AiAuditQuestionOverview extends AiAuditStatusCacheRow {
  question_id: string
  article_id: string | null
  article_title: string | null
  article_slug: string | null
  topic_id: string | null
  topic_name: string | null
  text: string
  correct_option_id: string | null
  question_type: string | null
  code_citation: string | null
  updated_at: string | null
  target_type: 'question' | 'design_scenario_question'
  risk_type: string | null
  severity_rank: number
}

export interface AiAuditFindingRow {
  id: string
  run_id: string | null
  audit_item_id: string | null
  target_type: AiAuditTargetType
  target_id: string
  article_id: string | null
  question_id: string | null
  severity: AiAuditSeverity
  status: AiAuditFindingStatus
  risk_type: string
  finding_summary: string
  suspect_text: string | null
  ai_rationale_summary: string | null
  recommended_next_step: string | null
  provider: string
  model: string | null
  prompt_version: string | null
  created_by: string | null
  created_at: string
  resolved_at: string | null
  metadata: Json
  severity_rank?: number
  status_rank?: number
  target_label?: string | null
  target_snippet?: string | null
}

export interface AiAuditRunRow {
  id: string
  run_type: string
  scope_type: string
  phase: AiAuditPhase
  provider: string
  model: string | null
  prompt_version: string | null
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  total_items: number
  completed_items: number
  flagged_items: number
  cost_estimate_usd: number | null
  started_by: string | null
  started_at: string
  completed_at: string | null
  notes: string | null
  metadata: Json
}

export interface AiAuditItemRow {
  id: string
  run_id: string | null
  target_type: AiAuditTargetType
  target_id: string
  article_id: string | null
  question_id: string | null
  phase: AiAuditPhase
  status: AiAuditStatus
  content_hash: string | null
  source_hash: string | null
  question_hash: string | null
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface AiChangeProposalRow {
  id: string
  finding_id: string | null
  target_type: AiAuditTargetType
  target_id: string
  article_id: string | null
  question_id: string | null
  proposal_type: AiChangeProposalType
  old_content: Json | null
  proposed_content: Json | null
  diff_summary: string | null
  why_changed: string | null
  source_evidence: Json
  status: AiChangeProposalStatus
  provider: string
  model: string | null
  prompt_version: string | null
  created_by: string | null
  reviewed_by: string | null
  created_at: string
  reviewed_at: string | null
  applied_at: string | null
  metadata: Json
}

export interface AiReviewDecisionRow {
  id: string
  reviewer_id: string | null
  target_type: string
  target_id: string
  decision: AiReviewDecision
  decision_notes: string | null
  previous_status: string | null
  new_status: string | null
  created_at: string
  metadata: Json
}

export interface PaginatedResult<T> {
  rows: T[]
  count: number
  page: number
  pageSize: number
}
