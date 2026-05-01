'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { assertPermission } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/supabase/server'
import {
  deriveAiAuditStatusPatch,
  pickHighestSeverity,
} from '@/lib/admin/ai-audit-utils'
import type {
  AiAuditFindingStatus,
  AiAuditPhase,
  AiAuditSeverity,
  AiAuditStatus,
  AiAuditTargetType,
  AiChangeProposalStatus,
  AiChangeProposalType,
  AiReviewDecision,
} from '@/types/ai-audit'

const CONTENT_REVIEW_PERMISSION = 'admin.content.view' as const
const CONTENT_APPROVE_PERMISSION = 'admin.content.approve' as const

const OPEN_FINDING_STATUSES = new Set(['open', 'confirmed', 'reopened'])
const APPROVED_TARGET_STATUSES = new Set<AiAuditStatus>(['passed', 'validated', 'approved', 'published'])

const toStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const requireString = (formData: FormData, key: string) => {
  const value = toStringValue(formData, key)
  if (!value) throw new Error(`Missing ${key}`)
  return value
}

const parseJsonText = (value: string | null) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return { text: value }
  }
}

const sourceEvidenceFromText = (value: string | null) =>
  value
    ? value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ note: line }))
    : []

const redirectBack = (formData: FormData) => {
  const returnTo = toStringValue(formData, 'returnTo') ?? '/admin/ai-audit'
  redirect(returnTo)
}

const getCurrentUserId = async () => {
  const { data: { user } } = await getUser()
  return user?.id ?? null
}

const refreshTargetStatusCache = async ({
  supabase,
  targetType,
  targetId,
  articleId,
  questionId,
  statusOverride,
  phaseOverride,
  allowOpenFindingOverride = false,
  overrideNotes,
}: {
  supabase: ReturnType<typeof createAdminClient>
  targetType: AiAuditTargetType
  targetId: string
  articleId?: string | null
  questionId?: string | null
  statusOverride?: AiAuditStatus | null
  phaseOverride?: AiAuditPhase | null
  allowOpenFindingOverride?: boolean
  overrideNotes?: string | null
}) => {
  const [findingsResult, proposalsResult, statusResult] = await Promise.all([
    supabase
      .from('ai_audit_findings')
      .select('severity, status, risk_type')
      .eq('target_type', targetType)
      .eq('target_id', targetId),
    supabase
      .from('ai_change_proposals')
      .select('id')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('status', 'pending'),
    supabase
      .from('ai_audit_status_cache')
      .select('metadata')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .maybeSingle(),
  ])

  if (findingsResult.error) throw findingsResult.error
  if (proposalsResult.error) throw proposalsResult.error
  if (statusResult.error) throw statusResult.error

  const findings = (findingsResult.data ?? []) as Array<{
    severity: AiAuditSeverity | null
    status: AiAuditFindingStatus
    risk_type: string | null
  }>
  const openFindings = findings.filter((finding) => OPEN_FINDING_STATUSES.has(finding.status))
  const confirmedHighRiskFindings = openFindings.filter((finding) =>
    finding.status === 'confirmed' && (finding.severity === 'high' || finding.severity === 'critical')
  )
  const hasBlockingOpenFindings = openFindings.length > 0 && statusOverride && APPROVED_TARGET_STATUSES.has(statusOverride)
  const canOverrideOpenFindings = allowOpenFindingOverride && Boolean(overrideNotes?.trim())
  const safeStatusOverride = hasBlockingOpenFindings && !canOverrideOpenFindings
    ? 'needs_human_review'
    : statusOverride
  const safePhaseOverride = hasBlockingOpenFindings && !canOverrideOpenFindings
    ? 'human_review'
    : phaseOverride
  const patch = deriveAiAuditStatusPatch({
    targetType,
    targetId,
    articleId,
    questionId,
    findingsCount: findings.length,
    openFindingsCount: openFindings.length,
    highestSeverity: pickHighestSeverity(openFindings.map((finding) => finding.severity)),
    openRiskTypes: openFindings.map((finding) => finding.risk_type),
    confirmedHighRiskFindingsCount: confirmedHighRiskFindings.length,
    hasPendingProposal: (proposalsResult.data ?? []).length > 0,
    statusOverride: safeStatusOverride,
    phaseOverride: safePhaseOverride,
  })

  const { error } = await supabase
    .from('ai_audit_status_cache')
    .upsert({
      ...patch,
      metadata: {
        ...((statusResult.data?.metadata && typeof statusResult.data.metadata === 'object' && !Array.isArray(statusResult.data.metadata)) ? statusResult.data.metadata : {}),
        ...patch.metadata,
      },
    }, { onConflict: 'target_type,target_id' })

  if (error) throw error
  return patch
}

const insertReviewDecision = async ({
  supabase,
  reviewerId,
  targetType,
  targetId,
  decision,
  notes,
  previousStatus,
  newStatus,
  metadata = {},
}: {
  supabase: ReturnType<typeof createAdminClient>
  reviewerId: string | null
  targetType: 'finding' | 'proposal' | 'audit_item' | 'wiki_article' | 'question' | 'design_scenario_question' | 'run' | 'other'
  targetId: string
  decision: AiReviewDecision
  notes?: string | null
  previousStatus?: string | null
  newStatus?: string | null
  metadata?: Record<string, unknown>
}) => {
  const { error } = await supabase.from('ai_review_decisions').insert({
    reviewer_id: reviewerId,
    target_type: targetType,
    target_id: targetId,
    decision,
    decision_notes: notes ?? null,
    previous_status: previousStatus ?? null,
    new_status: newStatus ?? null,
    metadata,
  })

  if (error) throw error
}

export async function createManualFinding(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const targetType = requireString(formData, 'targetType') as AiAuditTargetType
  const targetId = requireString(formData, 'targetId')
  const articleId = toStringValue(formData, 'articleId')
  const questionId = toStringValue(formData, 'questionId')
  const summary = requireString(formData, 'findingSummary')
  const severity = (toStringValue(formData, 'severity') ?? 'medium') as AiAuditSeverity
  const riskType = toStringValue(formData, 'riskType') ?? 'other'

  const { data, error } = await supabase
    .from('ai_audit_findings')
    .insert({
      target_type: targetType,
      target_id: targetId,
      article_id: articleId,
      question_id: questionId,
      severity,
      status: 'open',
      risk_type: riskType,
      finding_summary: summary,
      suspect_text: toStringValue(formData, 'suspectText'),
      ai_rationale_summary: toStringValue(formData, 'rationaleSummary'),
      recommended_next_step: toStringValue(formData, 'recommendedNextStep'),
      confidence: toStringValue(formData, 'confidence') ?? 'medium',
      provider: 'manual',
      model: null,
      prompt_version: null,
      created_by: reviewerId,
      metadata: {
        notes: toStringValue(formData, 'notes'),
        created_from: 'admin_ai_audit_ui',
      },
    })
    .select('id')
    .single()

  if (error) throw error

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'finding',
    targetId: data.id,
    decision: 'note',
    notes: 'Manual finding created.',
    newStatus: 'open',
    metadata: { target_type: targetType, target_id: targetId },
  })

  await refreshTargetStatusCache({ supabase, targetType, targetId, articleId, questionId })
  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}

export async function updateFindingStatus(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const findingId = requireString(formData, 'findingId')
  const nextStatus = requireString(formData, 'status') as AiAuditFindingStatus

  const { data: finding, error: fetchError } = await supabase
    .from('ai_audit_findings')
    .select('id, target_type, target_id, article_id, question_id, status')
    .eq('id', findingId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('ai_audit_findings')
    .update({
      status: nextStatus,
      resolved_at: nextStatus === 'resolved' || nextStatus === 'rejected' ? new Date().toISOString() : null,
    })
    .eq('id', findingId)

  if (updateError) throw updateError

  const decisionByStatus: Record<string, AiReviewDecision> = {
    confirmed: 'confirm',
    rejected: 'reject',
    resolved: 'resolve',
    reopened: 'reopen',
    open: 'reopen',
  }

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'finding',
    targetId: findingId,
    decision: decisionByStatus[nextStatus] ?? 'status_update',
    notes: toStringValue(formData, 'decisionNotes'),
    previousStatus: finding.status,
    newStatus: nextStatus,
    metadata: { target_type: finding.target_type, target_id: finding.target_id },
  })

  await refreshTargetStatusCache({
    supabase,
    targetType: finding.target_type as AiAuditTargetType,
    targetId: finding.target_id,
    articleId: finding.article_id,
    questionId: finding.question_id,
  })
  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}

export async function createChangeProposal(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const targetType = requireString(formData, 'targetType') as AiAuditTargetType
  const targetId = requireString(formData, 'targetId')
  const articleId = toStringValue(formData, 'articleId')
  const questionId = toStringValue(formData, 'questionId')
  const proposalType = (toStringValue(formData, 'proposalType') ?? 'other') as AiChangeProposalType

  const { data, error } = await supabase
    .from('ai_change_proposals')
    .insert({
      finding_id: toStringValue(formData, 'findingId'),
      target_type: targetType,
      target_id: targetId,
      article_id: articleId,
      question_id: questionId,
      proposal_type: proposalType,
      old_content: parseJsonText(toStringValue(formData, 'oldContent')),
      proposed_content: parseJsonText(toStringValue(formData, 'proposedContent')),
      diff_summary: toStringValue(formData, 'diffSummary'),
      why_changed: toStringValue(formData, 'whyChanged'),
      source_evidence: sourceEvidenceFromText(toStringValue(formData, 'sourceEvidence')),
      status: 'pending',
      provider: 'manual',
      model: null,
      prompt_version: null,
      created_by: reviewerId,
      metadata: { created_from: 'admin_ai_audit_ui' },
    })
    .select('id')
    .single()

  if (error) throw error

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'proposal',
    targetId: data.id,
    decision: 'note',
    notes: 'Manual staged proposal created. It has not been applied to live content.',
    newStatus: 'pending',
    metadata: { target_type: targetType, target_id: targetId },
  })

  await refreshTargetStatusCache({ supabase, targetType, targetId, articleId, questionId })
  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}

export async function updateProposalStatus(formData: FormData) {
  const nextStatus = requireString(formData, 'status') as AiChangeProposalStatus
  await assertPermission(nextStatus === 'approved' ? CONTENT_APPROVE_PERMISSION : CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const proposalId = requireString(formData, 'proposalId')

  const { data: proposal, error: fetchError } = await supabase
    .from('ai_change_proposals')
    .select('id, target_type, target_id, article_id, question_id, status')
    .eq('id', proposalId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('ai_change_proposals')
    .update({
      status: nextStatus,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', proposalId)

  if (updateError) throw updateError

  const decision: AiReviewDecision = nextStatus === 'approved'
    ? 'approve'
    : nextStatus === 'rejected'
      ? 'reject'
      : nextStatus === 'needs_edit'
        ? 'needs_edit'
        : 'status_update'

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'proposal',
    targetId: proposalId,
    decision,
    notes: toStringValue(formData, 'decisionNotes'),
    previousStatus: proposal.status,
    newStatus: nextStatus,
    metadata: {
      target_type: proposal.target_type,
      target_id: proposal.target_id,
      staged_only: true,
    },
  })

  await refreshTargetStatusCache({
    supabase,
    targetType: proposal.target_type as AiAuditTargetType,
    targetId: proposal.target_id,
    articleId: proposal.article_id,
    questionId: proposal.question_id,
    statusOverride: nextStatus === 'approved' ? 'approved' : nextStatus === 'rejected' ? 'rejected' : null,
    phaseOverride: nextStatus === 'approved' ? 'approved' : nextStatus === 'rejected' ? 'human_review' : null,
  })
  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}

export async function updateAuditTargetStatus(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const targetType = requireString(formData, 'targetType') as AiAuditTargetType
  const targetId = requireString(formData, 'targetId')
  const articleId = toStringValue(formData, 'articleId')
  const questionId = toStringValue(formData, 'questionId')
  const latestPhase = (toStringValue(formData, 'phase') ?? 'human_review') as AiAuditPhase
  const latestStatus = (toStringValue(formData, 'status') ?? 'passed') as AiAuditStatus
  const decisionNotes = toStringValue(formData, 'decisionNotes')
  const allowOpenFindingOverride = formData.get('overrideOpenFindings') === 'true'

  const patch = await refreshTargetStatusCache({
    supabase,
    targetType,
    targetId,
    articleId,
    questionId,
    statusOverride: latestStatus,
    phaseOverride: latestPhase,
    allowOpenFindingOverride,
    overrideNotes: decisionNotes,
  })

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: targetType === 'source' || targetType === 'other' ? 'other' : targetType,
    targetId,
    decision: patch.latest_status === 'approved' ? 'approve' : patch.latest_status === 'needs_human_review' ? 'mark_needs_review' : patch.latest_status === 'passed' ? 'mark_reviewed' : 'status_update',
    notes: decisionNotes,
    previousStatus: null,
    newStatus: patch.latest_status,
    metadata: {
      latest_phase: patch.latest_phase,
      requested_phase: latestPhase,
      requested_status: latestStatus,
      override_open_findings: allowOpenFindingOverride,
      staged_only: true,
    },
  })

  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}

export async function addReviewDecisionNote(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const targetType = requireString(formData, 'reviewTargetType') as 'finding' | 'proposal' | 'audit_item' | 'wiki_article' | 'question' | 'design_scenario_question' | 'run' | 'other'
  const targetId = requireString(formData, 'reviewTargetId')

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType,
    targetId,
    decision: 'note',
    notes: requireString(formData, 'decisionNotes'),
  })

  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}

export async function createManualAuditRun(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const runStatus = toStringValue(formData, 'runStatus') ?? 'completed'

  const { data, error } = await supabase
    .from('ai_audit_runs')
    .insert({
      run_type: toStringValue(formData, 'runType') ?? 'manual_review',
      scope_type: toStringValue(formData, 'scopeType') ?? 'manual',
      phase: (toStringValue(formData, 'phase') ?? 'human_review') as AiAuditPhase,
      provider: 'manual',
      model: null,
      prompt_version: null,
      total_items: Number.parseInt(toStringValue(formData, 'totalItems') ?? '0', 10) || 0,
      completed_items: Number.parseInt(toStringValue(formData, 'completedItems') ?? '0', 10) || 0,
      flagged_items: Number.parseInt(toStringValue(formData, 'flaggedItems') ?? '0', 10) || 0,
      started_by: reviewerId,
      status: runStatus,
      completed_at: runStatus === 'queued' || runStatus === 'running' ? null : new Date().toISOString(),
      notes: toStringValue(formData, 'notes'),
      metadata: { created_from: 'admin_ai_audit_ui', no_ai_job_started: true },
    })
    .select('id')
    .single()

  if (error) throw error

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'run',
    targetId: data.id,
    decision: 'note',
    notes: 'Manual/admin audit run record created. No AI job was started.',
    newStatus: runStatus,
    metadata: { no_ai_job_started: true },
  })

  revalidatePath('/admin/ai-audit/runs')
  redirectBack(formData)
}

export async function updateAuditRunStatus(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const runId = requireString(formData, 'runId')
  const nextStatus = requireString(formData, 'runStatus') as 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  const notes = toStringValue(formData, 'decisionNotes')

  const { data: run, error: fetchError } = await supabase
    .from('ai_audit_runs')
    .select('id, status')
    .eq('id', runId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('ai_audit_runs')
    .update({
      status: nextStatus,
      completed_at: nextStatus === 'queued' || nextStatus === 'running' ? null : new Date().toISOString(),
      ...(notes ? { notes } : {}),
    })
    .eq('id', runId)

  if (error) throw error

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'run',
    targetId: runId,
    decision: 'status_update',
    notes,
    previousStatus: run.status,
    newStatus: nextStatus,
    metadata: { no_ai_job_started: true },
  })

  revalidatePath('/admin/ai-audit/runs')
  redirectBack(formData)
}

export async function createManualAuditRunItem(formData: FormData) {
  await assertPermission(CONTENT_REVIEW_PERMISSION)
  const supabase = createAdminClient()
  const reviewerId = await getCurrentUserId()
  const runId = requireString(formData, 'runId')
  const targetType = requireString(formData, 'targetType') as AiAuditTargetType
  const targetId = requireString(formData, 'targetId')
  const articleId = toStringValue(formData, 'articleId')
  const questionId = toStringValue(formData, 'questionId')
  const phase = (toStringValue(formData, 'phase') ?? 'human_review') as AiAuditPhase
  const status = (toStringValue(formData, 'status') ?? 'passed') as AiAuditStatus
  const completed = status !== 'queued' && status !== 'running'

  const { data, error } = await supabase
    .from('ai_audit_items')
    .insert({
      run_id: runId,
      target_type: targetType,
      target_id: targetId,
      article_id: articleId,
      question_id: questionId,
      phase,
      status,
      started_at: new Date().toISOString(),
      completed_at: completed ? new Date().toISOString() : null,
      error_message: toStringValue(formData, 'errorMessage'),
      metadata: {
        notes: toStringValue(formData, 'notes'),
        created_from: 'admin_ai_audit_ui',
        no_ai_job_started: true,
      },
    })
    .select('id')
    .single()

  if (error) throw error

  const patch = await refreshTargetStatusCache({
    supabase,
    targetType,
    targetId,
    articleId,
    questionId,
    statusOverride: status,
    phaseOverride: phase,
    overrideNotes: toStringValue(formData, 'notes'),
  })

  await insertReviewDecision({
    supabase,
    reviewerId,
    targetType: 'audit_item',
    targetId: data.id,
    decision: 'status_update',
    notes: toStringValue(formData, 'notes'),
    previousStatus: null,
    newStatus: patch.latest_status,
    metadata: {
      run_id: runId,
      target_type: targetType,
      target_id: targetId,
      requested_status: status,
      no_ai_job_started: true,
    },
  })

  revalidatePath('/admin/ai-audit/runs')
  revalidatePath('/admin/ai-audit')
  redirectBack(formData)
}
