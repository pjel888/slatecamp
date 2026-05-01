import 'server-only'

import { assertPermission } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  AiAuditArticleOverview,
  AiAuditDashboardSummary,
  AiAuditFindingRow,
  AiAuditItemRow,
  AiAuditQuestionOverview,
  AiAuditRunRow,
  AiChangeProposalRow,
  AiReviewDecisionRow,
  PaginatedResult,
} from '@/types/ai-audit'
import type { Json } from '@/types/supabase'
import type { AiAuditListParams } from '@/lib/admin/ai-audit-utils'

const ARTICLE_COLUMNS = `
  article_id,
  title,
  slug,
  subject_label,
  difficulty_label,
  article_status,
  reviewed_at,
  updated_at,
  content_preview,
  source_count,
  verified_source_count,
  question_count,
  latest_phase,
  latest_status,
  highest_severity,
  findings_count,
  open_findings_count,
  needs_source_check,
  needs_correction,
  needs_human_review,
  last_audited_at,
  content_hash,
  severity_rank,
  metadata
`

const QUESTION_COLUMNS = `
  question_id,
  article_id,
  article_title,
  article_slug,
  topic_id,
  topic_name,
  text,
  correct_option_id,
  question_type,
  code_citation,
  updated_at,
  target_type,
  latest_phase,
  latest_status,
  highest_severity,
  findings_count,
  open_findings_count,
  needs_source_check,
  needs_correction,
  needs_human_review,
  last_audited_at,
  content_hash,
  risk_type,
  severity_rank,
  metadata
`

const FINDING_COLUMNS = `
  id,
  run_id,
  audit_item_id,
  target_type,
  target_id,
  article_id,
  question_id,
  severity,
  status,
  risk_type,
  finding_summary,
  suspect_text,
  ai_rationale_summary,
  recommended_next_step,
  provider,
  model,
  prompt_version,
  created_by,
  created_at,
  resolved_at,
  metadata,
  severity_rank,
  status_rank,
  target_label,
  target_snippet
`

const RUN_COLUMNS = `
  id,
  run_type,
  scope_type,
  phase,
  provider,
  model,
  prompt_version,
  status,
  total_items,
  completed_items,
  flagged_items,
  cost_estimate_usd,
  started_by,
  started_at,
  completed_at,
  notes,
  metadata
`

const PROPOSAL_COLUMNS = `
  id,
  finding_id,
  target_type,
  target_id,
  article_id,
  question_id,
  proposal_type,
  old_content,
  proposed_content,
  diff_summary,
  why_changed,
  source_evidence,
  status,
  provider,
  model,
  prompt_version,
  created_by,
  reviewed_by,
  created_at,
  reviewed_at,
  applied_at,
  metadata
`

const REVIEW_DECISION_COLUMNS = `
  id,
  reviewer_id,
  target_type,
  target_id,
  decision,
  decision_notes,
  previous_status,
  new_status,
  created_at,
  metadata
`

const ITEM_COLUMNS = `
  id,
  run_id,
  target_type,
  target_id,
  article_id,
  question_id,
  phase,
  status,
  content_hash,
  source_hash,
  question_hash,
  started_at,
  completed_at,
  error_message,
  metadata,
  created_at,
  updated_at
`

const EMPTY_SUMMARY: AiAuditDashboardSummary = {
  total_articles: 0,
  total_questions: 0,
  total_design_scenario_questions: 0,
  articles_not_checked: 0,
  tier0_complete: 0,
  tier1_complete: 0,
  needs_source_check: 0,
  likely_or_confirmed_issues: 0,
  open_findings: 0,
  correction_proposed: 0,
  needs_human_review: 0,
  approved: 0,
  published: 0,
  questions_flagged: 0,
  answer_key_risks: 0,
  multiple_answer_risks: 0,
  pending_proposals: 0,
  total_runs: 0,
  articles_with_zero_sources: 0,
  status_not_checked: 0,
  status_passed: 0,
  status_flagged: 0,
  status_needs_source_check: 0,
  status_likely_wrong: 0,
  status_confirmed_wrong: 0,
  status_correction_proposed: 0,
  status_needs_human_review: 0,
  status_approved: 0,
  status_published: 0,
  severity_low: 0,
  severity_medium: 0,
  severity_high: 0,
  severity_critical: 0,
}

const escapeSearchTerm = (term: string) => term.replace(/[,%]/g, ' ').trim()

const requireAiAuditRead = () => assertPermission('admin.content.view')

export async function getAiAuditDashboardData() {
  await requireAiAuditRead()
  const supabase = createAdminClient()

  const [summaryResult, recentFindingsResult, recentRunsResult, pendingProposalsResult, priorityResult] = await Promise.all([
    supabase
      .from('ai_audit_dashboard_summary')
      .select('*')
      .maybeSingle(),
    supabase
      .from('ai_audit_finding_overview')
      .select(FINDING_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('ai_audit_runs')
      .select(RUN_COLUMNS)
      .order('started_at', { ascending: false })
      .limit(8),
    supabase
      .from('ai_change_proposals')
      .select(PROPOSAL_COLUMNS)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('ai_audit_finding_overview')
      .select(FINDING_COLUMNS)
      .in('status', ['open', 'confirmed', 'reopened'])
      .in('severity', ['critical', 'high'])
      .order('created_at', { ascending: true })
      .limit(8),
  ])

  return {
    summary: (summaryResult.data ?? EMPTY_SUMMARY) as AiAuditDashboardSummary,
    recentFindings: (recentFindingsResult.data ?? []) as AiAuditFindingRow[],
    recentRuns: (recentRunsResult.data ?? []) as AiAuditRunRow[],
    pendingProposals: (pendingProposalsResult.data ?? []) as AiChangeProposalRow[],
    highPriorityFindings: (priorityResult.data ?? []) as AiAuditFindingRow[],
    error:
      summaryResult.error?.message ||
      recentFindingsResult.error?.message ||
      recentRunsResult.error?.message ||
      pendingProposalsResult.error?.message ||
      priorityResult.error?.message ||
      null,
  }
}

export async function getAiAuditArticleRows(params: AiAuditListParams): Promise<PaginatedResult<AiAuditArticleOverview>> {
  await requireAiAuditRead()
  const supabase = createAdminClient()
  const to = params.offset + params.pageSize - 1

  let query = supabase
    .from('ai_audit_article_overview')
    .select(ARTICLE_COLUMNS, { count: 'exact' })
    .order('open_findings_count', { ascending: false })
    .order('severity_rank', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(params.offset, to)

  if (params.status) query = query.eq('latest_status', params.status)
  if (params.phase) query = query.eq('latest_phase', params.phase)
  if (params.severity) query = query.eq('highest_severity', params.severity)
  if (params.subject) query = query.eq('subject_label', params.subject)
  if (params.needsHumanReview) query = query.eq('needs_human_review', true)
  if (params.needsSourceCheck) query = query.eq('needs_source_check', true)
  if (params.needsCorrection) query = query.eq('needs_correction', true)
  if (params.neverAudited) query = query.is('last_audited_at', null)
  else if (params.lastAuditedSince) query = query.gte('last_audited_at', params.lastAuditedSince)
  if (params.missingSources) query = query.eq('source_count', 0)
  if (params.hasOpenFindings) query = query.gt('open_findings_count', 0)
  if (params.q) {
    const q = escapeSearchTerm(params.q)
    if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,content_preview.ilike.%${q}%`)
  }

  const { data, count, error } = await query
  if (error) console.error('[AI_AUDIT:Articles] Failed to load article rows:', error.message)

  return {
    rows: (data ?? []) as AiAuditArticleOverview[],
    count: count ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function getAiAuditQuestionRows(params: AiAuditListParams): Promise<PaginatedResult<AiAuditQuestionOverview>> {
  await requireAiAuditRead()
  const supabase = createAdminClient()
  const to = params.offset + params.pageSize - 1

  let query = supabase
    .from('ai_audit_all_question_overview')
    .select(QUESTION_COLUMNS, { count: 'exact' })
    .order('open_findings_count', { ascending: false })
    .order('severity_rank', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(params.offset, to)

  if (params.status) query = query.eq('latest_status', params.status)
  if (params.phase) query = query.eq('latest_phase', params.phase)
  if (params.severity) query = query.eq('highest_severity', params.severity)
  if (params.riskType) query = query.eq('risk_type', params.riskType)
  if (params.targetType) query = query.eq('target_type', params.targetType)
  if (params.articleId) query = query.eq('article_id', params.articleId)
  if (params.needsHumanReview) query = query.eq('needs_human_review', true)
  if (params.needsSourceCheck) query = query.eq('needs_source_check', true)
  if (params.needsCorrection) query = query.eq('needs_correction', true)
  if (params.neverAudited) query = query.is('last_audited_at', null)
  else if (params.lastAuditedSince) query = query.gte('last_audited_at', params.lastAuditedSince)
  if (params.hasOpenFindings) query = query.gt('open_findings_count', 0)
  if (params.missingArticle) query = query.is('article_id', null)
  if (params.missingAnswerKey) query = query.or('correct_option_id.is.null,correct_option_id.eq.')
  if (params.q) {
    const q = escapeSearchTerm(params.q)
    if (q) query = query.or(`text.ilike.%${q}%,article_title.ilike.%${q}%,topic_name.ilike.%${q}%`)
  }

  const { data, count, error } = await query
  if (error) console.error('[AI_AUDIT:Questions] Failed to load question rows:', error.message)

  return {
    rows: (data ?? []) as AiAuditQuestionOverview[],
    count: count ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function getAiAuditFindingRows(params: AiAuditListParams): Promise<PaginatedResult<AiAuditFindingRow>> {
  await requireAiAuditRead()
  const supabase = createAdminClient()
  const to = params.offset + params.pageSize - 1

  let query = supabase
    .from('ai_audit_finding_overview')
    .select(FINDING_COLUMNS, { count: 'exact' })
    .order('status_rank', { ascending: false })
    .order('severity_rank', { ascending: false })
    .order('created_at', { ascending: false })
    .range(params.offset, to)

  if (params.status) query = query.eq('status', params.status)
  if (params.severity) query = query.eq('severity', params.severity)
  if (params.riskType) query = query.eq('risk_type', params.riskType)
  if (params.targetType) query = query.eq('target_type', params.targetType)
  if (params.q) {
    const q = escapeSearchTerm(params.q)
    if (q) query = query.or(`finding_summary.ilike.%${q}%,suspect_text.ilike.%${q}%,recommended_next_step.ilike.%${q}%`)
  }

  const { data, count, error } = await query
  if (error) console.error('[AI_AUDIT:Findings] Failed to load finding rows:', error.message)

  return {
    rows: (data ?? []) as AiAuditFindingRow[],
    count: count ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function getAiAuditRunRows(params: AiAuditListParams): Promise<PaginatedResult<AiAuditRunRow>> {
  await requireAiAuditRead()
  const supabase = createAdminClient()
  const to = params.offset + params.pageSize - 1

  let query = supabase
    .from('ai_audit_runs')
    .select(RUN_COLUMNS, { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(params.offset, to)

  if (params.status) query = query.eq('status', params.status)
  if (params.phase) query = query.eq('phase', params.phase)
  if (params.q) {
    const q = escapeSearchTerm(params.q)
    if (q) query = query.or(`run_type.ilike.%${q}%,scope_type.ilike.%${q}%,provider.ilike.%${q}%,notes.ilike.%${q}%`)
  }

  const { data, count, error } = await query
  if (error) console.error('[AI_AUDIT:Runs] Failed to load run rows:', error.message)

  return {
    rows: (data ?? []) as AiAuditRunRow[],
    count: count ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function getAiAuditProposalRows(params: AiAuditListParams): Promise<PaginatedResult<AiChangeProposalRow>> {
  await requireAiAuditRead()
  const supabase = createAdminClient()
  const to = params.offset + params.pageSize - 1

  let query = supabase
    .from('ai_change_proposals')
    .select(PROPOSAL_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(params.offset, to)

  if (params.status) query = query.eq('status', params.status)
  if (params.targetType) query = query.eq('target_type', params.targetType)
  if (params.q) {
    const q = escapeSearchTerm(params.q)
    if (q) query = query.or(`diff_summary.ilike.%${q}%,why_changed.ilike.%${q}%`)
  }

  const { data, count, error } = await query
  if (error) console.error('[AI_AUDIT:Proposals] Failed to load proposal rows:', error.message)

  return {
    rows: (data ?? []) as AiChangeProposalRow[],
    count: count ?? 0,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function getAiAuditArticleDetail(articleId: string) {
  await requireAiAuditRead()
  const supabase = createAdminClient()

  const [articleResult, sourcesResult, questionsResult, statusResult, findingsResult, proposalsResult, itemsResult] = await Promise.all([
    supabase
      .from('wiki_articles')
      .select('article_id, title, slug, content, subject_label, difficulty_label, status, reviewed_at, reviewer_comments, updated_at')
      .eq('article_id', articleId)
      .maybeSingle(),
    supabase
      .from('wiki_article_sources')
      .select('source_id, article_id, label, url, source_type, description, sort_order, is_verified, created_at, updated_at')
      .eq('article_id', articleId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('questions')
      .select('question_id, text, correct_option_id, question_type, code_citation, updated_at')
      .eq('article_id', articleId)
      .order('updated_at', { ascending: false })
      .limit(50),
    supabase
      .from('ai_audit_status_cache')
      .select('target_type, target_id, article_id, question_id, latest_phase, latest_status, highest_severity, findings_count, open_findings_count, needs_source_check, needs_correction, needs_human_review, last_audited_at, content_hash, metadata')
      .eq('target_type', 'wiki_article')
      .eq('target_id', articleId)
      .maybeSingle(),
    supabase
      .from('ai_audit_finding_overview')
      .select(FINDING_COLUMNS)
      .eq('target_type', 'wiki_article')
      .eq('target_id', articleId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ai_change_proposals')
      .select(PROPOSAL_COLUMNS)
      .eq('target_type', 'wiki_article')
      .eq('target_id', articleId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ai_audit_items')
      .select(ITEM_COLUMNS)
      .eq('target_type', 'wiki_article')
      .eq('target_id', articleId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const reviewTargetIds = [
    articleId,
    ...((findingsResult.data ?? []) as AiAuditFindingRow[]).map((finding) => finding.id),
    ...((proposalsResult.data ?? []) as AiChangeProposalRow[]).map((proposal) => proposal.id),
  ]

  const decisionsResult = await supabase
    .from('ai_review_decisions')
    .select(REVIEW_DECISION_COLUMNS)
    .in('target_id', reviewTargetIds)
    .order('created_at', { ascending: false })
    .limit(100)

  return {
    article: articleResult.data as {
      article_id: string
      title: string
      slug: string
      content: string
      subject_label: string | null
      difficulty_label: string | null
      status: string | null
      reviewed_at: string | null
      reviewer_comments: string | null
      updated_at: string
    } | null,
    sources: (sourcesResult.data ?? []) as Array<Record<string, unknown>>,
    questions: (questionsResult.data ?? []) as Array<Record<string, unknown>>,
    status: statusResult.data,
    findings: (findingsResult.data ?? []) as AiAuditFindingRow[],
    proposals: (proposalsResult.data ?? []) as AiChangeProposalRow[],
    items: (itemsResult.data ?? []) as AiAuditItemRow[],
    decisions: (decisionsResult.data ?? []) as AiReviewDecisionRow[],
    error:
      articleResult.error?.message ||
      sourcesResult.error?.message ||
      questionsResult.error?.message ||
      statusResult.error?.message ||
      findingsResult.error?.message ||
      proposalsResult.error?.message ||
      itemsResult.error?.message ||
      decisionsResult.error?.message ||
      null,
  }
}

export async function getAiAuditQuestionDetail(questionId: string) {
  await requireAiAuditRead()
  const supabase = createAdminClient()

  const normalQuestionResult = await supabase
    .from('questions')
    .select('question_id, article_id, topic_id, text, options, correct_option_id, explanation, rationale, question_type, code_citation, updated_at')
    .eq('question_id', questionId)
    .maybeSingle()

  const designQuestionResult = normalQuestionResult.data
    ? { data: null, error: null }
    : await supabase
      .from('design_scenario_questions')
      .select('question_id, scenario_id, question_number, question_stem, options, correct_answer_index, rationale, solution_steps, question_type, code_citation, created_at')
      .eq('question_id', questionId)
      .maybeSingle()

  const targetType = normalQuestionResult.data ? 'question' : 'design_scenario_question'
  const articleId = normalQuestionResult.data?.article_id ?? null

  const [articleResult, statusResult, findingsResult, proposalsResult, itemsResult] = await Promise.all([
    articleId
      ? supabase
        .from('wiki_articles')
        .select('article_id, title, slug')
        .eq('article_id', articleId)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('ai_audit_status_cache')
      .select('target_type, target_id, article_id, question_id, latest_phase, latest_status, highest_severity, findings_count, open_findings_count, needs_source_check, needs_correction, needs_human_review, last_audited_at, content_hash, metadata')
      .eq('target_type', targetType)
      .eq('target_id', questionId)
      .maybeSingle(),
    supabase
      .from('ai_audit_finding_overview')
      .select(FINDING_COLUMNS)
      .eq('target_type', targetType)
      .eq('target_id', questionId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ai_change_proposals')
      .select(PROPOSAL_COLUMNS)
      .eq('target_type', targetType)
      .eq('target_id', questionId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ai_audit_items')
      .select(ITEM_COLUMNS)
      .eq('target_type', targetType)
      .eq('target_id', questionId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const reviewTargetIds = [
    questionId,
    ...((findingsResult.data ?? []) as AiAuditFindingRow[]).map((finding) => finding.id),
    ...((proposalsResult.data ?? []) as AiChangeProposalRow[]).map((proposal) => proposal.id),
  ]

  const decisionsResult = await supabase
    .from('ai_review_decisions')
    .select(REVIEW_DECISION_COLUMNS)
    .in('target_id', reviewTargetIds)
    .order('created_at', { ascending: false })
    .limit(100)

  return {
    question: normalQuestionResult.data ?? designQuestionResult.data,
    targetType,
    article: articleResult.data,
    status: statusResult.data,
    findings: (findingsResult.data ?? []) as AiAuditFindingRow[],
    proposals: (proposalsResult.data ?? []) as AiChangeProposalRow[],
    items: (itemsResult.data ?? []) as AiAuditItemRow[],
    decisions: (decisionsResult.data ?? []) as AiReviewDecisionRow[],
    error:
      normalQuestionResult.error?.message ||
      designQuestionResult.error?.message ||
      articleResult.error?.message ||
      statusResult.error?.message ||
      findingsResult.error?.message ||
      proposalsResult.error?.message ||
      itemsResult.error?.message ||
      decisionsResult.error?.message ||
      null,
  }
}

export async function getAiAuditFindingDetail(findingId: string) {
  await requireAiAuditRead()
  const supabase = createAdminClient()

  const findingResult = await supabase
    .from('ai_audit_finding_overview')
    .select(FINDING_COLUMNS)
    .eq('id', findingId)
    .maybeSingle()

  const finding = findingResult.data as AiAuditFindingRow | null

  const [statusResult, articleResult, normalQuestionResult, designQuestionResult, runResult, itemResult, proposalsResult] = await Promise.all([
    finding
      ? supabase
        .from('ai_audit_status_cache')
        .select('target_type, target_id, article_id, question_id, latest_phase, latest_status, highest_severity, findings_count, open_findings_count, needs_source_check, needs_correction, needs_human_review, last_audited_at, content_hash, metadata')
        .eq('target_type', finding.target_type)
        .eq('target_id', finding.target_id)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    finding?.target_type === 'wiki_article'
      ? supabase
        .from('wiki_articles')
        .select('article_id, title, slug, subject_label, updated_at')
        .eq('article_id', finding.target_id)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    finding?.target_type === 'question'
      ? supabase
        .from('questions')
        .select('question_id, article_id, text, correct_option_id, question_type, updated_at')
        .eq('question_id', finding.target_id)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    finding?.target_type === 'design_scenario_question'
      ? supabase
        .from('design_scenario_questions')
        .select('question_id, scenario_id, question_stem, correct_answer_index, question_type, created_at')
        .eq('question_id', finding.target_id)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    finding?.run_id
      ? supabase
        .from('ai_audit_runs')
        .select(RUN_COLUMNS)
        .eq('id', finding.run_id)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    finding?.audit_item_id
      ? supabase
        .from('ai_audit_items')
        .select(ITEM_COLUMNS)
        .eq('id', finding.audit_item_id)
        .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    finding
      ? supabase
        .from('ai_change_proposals')
        .select(PROPOSAL_COLUMNS)
        .or(`finding_id.eq.${finding.id},and(target_type.eq.${finding.target_type},target_id.eq.${finding.target_id})`)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ])

  const proposalRows = (proposalsResult.data ?? []) as AiChangeProposalRow[]
  const reviewTargetIds = finding
    ? [finding.id, finding.target_id, ...proposalRows.map((proposal) => proposal.id)]
    : []

  const decisionsResult = reviewTargetIds.length
    ? await supabase
      .from('ai_review_decisions')
      .select(REVIEW_DECISION_COLUMNS)
      .in('target_id', reviewTargetIds)
      .order('created_at', { ascending: false })
      .limit(100)
    : { data: [], error: null }

  return {
    finding,
    status: statusResult.data,
    article: articleResult.data,
    normalQuestion: normalQuestionResult.data,
    designQuestion: designQuestionResult.data,
    run: runResult.data as AiAuditRunRow | null,
    item: itemResult.data as AiAuditItemRow | null,
    proposals: proposalRows,
    decisions: (decisionsResult.data ?? []) as AiReviewDecisionRow[],
    error:
      findingResult.error?.message ||
      statusResult.error?.message ||
      articleResult.error?.message ||
      normalQuestionResult.error?.message ||
      designQuestionResult.error?.message ||
      runResult.error?.message ||
      itemResult.error?.message ||
      proposalsResult.error?.message ||
      decisionsResult.error?.message ||
      null,
  }
}

export async function getAiAuditRunDetail(runId: string) {
  await requireAiAuditRead()
  const supabase = createAdminClient()

  const [runResult, itemsResult, findingsResult, proposalsResult] = await Promise.all([
    supabase
      .from('ai_audit_runs')
      .select(RUN_COLUMNS)
      .eq('id', runId)
      .maybeSingle(),
    supabase
      .from('ai_audit_items')
      .select(ITEM_COLUMNS)
      .eq('run_id', runId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('ai_audit_finding_overview')
      .select(FINDING_COLUMNS)
      .eq('run_id', runId)
      .order('severity_rank', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('ai_change_proposals')
      .select(PROPOSAL_COLUMNS)
      .eq('run_id', runId)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const items = (itemsResult.data ?? []) as AiAuditItemRow[]
  const findings = (findingsResult.data ?? []) as AiAuditFindingRow[]
  const proposals = (proposalsResult.data ?? []) as AiChangeProposalRow[]
  const reviewTargetIds = [
    runId,
    ...items.map((item) => item.id),
    ...findings.map((finding) => finding.id),
    ...proposals.map((proposal) => proposal.id),
  ]

  const decisionsResult = await supabase
    .from('ai_review_decisions')
    .select(REVIEW_DECISION_COLUMNS)
    .in('target_id', reviewTargetIds)
    .order('created_at', { ascending: false })
    .limit(150)

  return {
    run: runResult.data as AiAuditRunRow | null,
    items,
    findings,
    proposals,
    decisions: (decisionsResult.data ?? []) as AiReviewDecisionRow[],
    error:
      runResult.error?.message ||
      itemsResult.error?.message ||
      findingsResult.error?.message ||
      proposalsResult.error?.message ||
      decisionsResult.error?.message ||
      null,
  }
}

export function jsonToDisplay(value: Json | unknown) {
  if (value == null) return '—'
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}
