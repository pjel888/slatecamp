import type {
  AiAuditPhase,
  AiAuditRiskType,
  AiAuditSeverity,
  AiAuditStatus,
  AiAuditTargetType,
} from '@/types/ai-audit'

const ALLOWED_PAGE_SIZES = new Set([25, 50])
const DEFAULT_PAGE_SIZE = 50

export interface AiAuditListParams {
  page: number
  pageSize: number
  offset: number
  q?: string
  status?: string
  phase?: string
  severity?: string
  riskType?: string
  targetType?: string
  subject?: string
  articleId?: string
  lastAuditedSince?: string
  needsHumanReview: boolean
  needsSourceCheck: boolean
  needsCorrection: boolean
  neverAudited: boolean
  missingSources: boolean
  hasOpenFindings: boolean
  missingArticle: boolean
  missingAnswerKey: boolean
}

type SearchParamValue = string | string[] | undefined

type SearchParamRecord = Record<string, SearchParamValue>

const firstValue = (value: SearchParamValue) => Array.isArray(value) ? value[0] : value

const toBoolean = (value: SearchParamValue) => {
  const normalized = firstValue(value)
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

const cleanString = (value: SearchParamValue) => {
  const normalized = firstValue(value)?.trim()
  return normalized ? normalized : undefined
}

export function parseAiAuditListParams(params: SearchParamRecord = {}): AiAuditListParams {
  const rawPage = Number.parseInt(firstValue(params.page) ?? '1', 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const rawPageSize = Number.parseInt(firstValue(params.pageSize) ?? String(DEFAULT_PAGE_SIZE), 10)
  const pageSize = ALLOWED_PAGE_SIZES.has(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    q: cleanString(params.q ?? params.search),
    status: cleanString(params.status),
    phase: cleanString(params.phase),
    severity: cleanString(params.severity),
    riskType: cleanString(params.riskType ?? params.risk_type),
    targetType: cleanString(params.targetType ?? params.target_type),
    subject: cleanString(params.subject),
    articleId: cleanString(params.articleId ?? params.article_id),
    lastAuditedSince: cleanString(params.lastAuditedSince ?? params.last_audited_since),
    needsHumanReview: toBoolean(params.needsHumanReview ?? params.needs_human_review),
    needsSourceCheck: toBoolean(params.needsSourceCheck ?? params.needs_source_check),
    needsCorrection: toBoolean(params.needsCorrection ?? params.needs_correction),
    neverAudited: toBoolean(params.neverAudited ?? params.never_audited),
    missingSources: toBoolean(params.missingSources ?? params.missing_sources),
    hasOpenFindings: toBoolean(params.hasOpenFindings ?? params.open_findings),
    missingArticle: toBoolean(params.missingArticle ?? params.missing_article),
    missingAnswerKey: toBoolean(params.missingAnswerKey ?? params.missing_answer_key),
  }
}

export type AiAuditBadgeVariant = 'default' | 'success' | 'warning' | 'orange' | 'danger' | 'info' | 'primary'

export function getAiAuditBadgeVariant(status: string | null | undefined): AiAuditBadgeVariant {
  if (!status || status === 'not_checked' || status === 'skipped') return 'default'
  if (status === 'passed' || status === 'validated' || status === 'approved' || status === 'published') return 'success'
  if (status === 'needs_source_check' || status === 'needs_human_review' || status === 'flagged') return 'warning'
  if (status === 'likely_wrong' || status === 'correction_proposed') return status === 'correction_proposed' ? 'info' : 'orange'
  if (status === 'confirmed_wrong' || status === 'failed') return 'danger'
  if (status === 'queued' || status === 'running') return 'primary'
  return 'default'
}

export function getSeverityBadgeVariant(severity: string | null | undefined): AiAuditBadgeVariant {
  if (severity === 'critical') return 'danger'
  if (severity === 'high') return 'orange'
  if (severity === 'medium') return 'warning'
  if (severity === 'low') return 'info'
  return 'default'
}

export function labelFromValue(value: string | null | undefined) {
  if (!value) return 'None'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const severityRank: Record<AiAuditSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

const SOURCE_CHECK_RISK_TYPES = new Set<string>([
  'missing_sources',
  'unsupported_claim',
  'needs_source_check',
  'outdated_requirement',
  'source_conflict',
  'weak_sources',
  'blocked_by_missing_context',
])

const CORRECTION_RISK_TYPES = new Set<string>([
  'confirmed_wrong',
  'likely_wrong',
  'contradicted_claim',
  'incorrect_definition',
  'incorrect_date',
  'incorrect_person_or_attribution',
  'incorrect_code_requirement',
  'incorrect_legal_requirement',
  'incorrect_history',
  'needs_correction',
  'answer_key_mismatch',
  'multiple_correct_answers',
  'no_valid_answer',
  'stem_inaccurate',
  'option_inaccurate',
  'rationale_inaccurate',
])

export function pickHighestSeverity(severities: Array<string | null | undefined>): AiAuditSeverity | null {
  return severities.reduce<AiAuditSeverity | null>((highest, severity) => {
    if (!severity || !(severity in severityRank)) return highest
    const typedSeverity = severity as AiAuditSeverity
    if (!highest || severityRank[typedSeverity] > severityRank[highest]) return typedSeverity
    return highest
  }, null)
}

export interface DeriveAiAuditStatusPatchInput {
  targetType: AiAuditTargetType
  targetId: string
  articleId?: string | null
  questionId?: string | null
  openFindingsCount: number
  findingsCount: number
  highestSeverity: AiAuditSeverity | null
  openRiskTypes?: Array<AiAuditRiskType | string | null | undefined>
  confirmedHighRiskFindingsCount?: number
  hasPendingProposal: boolean
  statusOverride?: AiAuditStatus | null
  phaseOverride?: AiAuditPhase | null
}

export interface AiAuditStatusPatch {
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
  last_audited_at: string
  metadata: {
    risk_type: string | null
    open_risk_types: string[]
  }
}

export function deriveAiAuditStatusPatch(input: DeriveAiAuditStatusPatchInput): AiAuditStatusPatch {
  const hasOpenFindings = input.openFindingsCount > 0
  const highRisk = input.highestSeverity === 'high' || input.highestSeverity === 'critical'
  const openRiskTypes = input.openRiskTypes?.filter(Boolean).map(String) ?? []
  const hasSourceRisk = openRiskTypes.some((riskType) => SOURCE_CHECK_RISK_TYPES.has(riskType))
  const hasCorrectionRisk = openRiskTypes.some((riskType) => CORRECTION_RISK_TYPES.has(riskType))
  const hasConfirmedHighRisk = (input.confirmedHighRiskFindingsCount ?? 0) > 0
  const needsSourceCheck = hasSourceRisk || (hasOpenFindings && input.highestSeverity !== 'critical' && !input.hasPendingProposal && !hasCorrectionRisk)
  const needsCorrection = input.hasPendingProposal || highRisk || hasCorrectionRisk
  const needsHumanReview = hasOpenFindings || input.hasPendingProposal || input.statusOverride === 'needs_human_review'

  let latestStatus: AiAuditStatus = 'not_checked'
  let latestPhase: AiAuditPhase = 'not_started'

  if (input.hasPendingProposal) {
    latestStatus = 'correction_proposed'
    latestPhase = 'tier3_correction_proposal'
  } else if (hasConfirmedHighRisk || (hasOpenFindings && input.highestSeverity === 'critical')) {
    latestStatus = 'confirmed_wrong'
    latestPhase = 'human_review'
  } else if (hasOpenFindings && input.highestSeverity === 'high') {
    latestStatus = 'likely_wrong'
    latestPhase = 'human_review'
  } else if (hasOpenFindings && input.highestSeverity === 'medium') {
    latestStatus = needsSourceCheck ? 'needs_source_check' : 'flagged'
    latestPhase = needsSourceCheck ? 'tier2_source_verification' : 'human_review'
  } else if (hasOpenFindings) {
    latestStatus = needsSourceCheck ? 'needs_source_check' : 'flagged'
    latestPhase = needsSourceCheck ? 'tier2_source_verification' : 'human_review'
  } else if (input.findingsCount > 0) {
    latestStatus = 'passed'
    latestPhase = 'human_review'
  }

  if (input.statusOverride) latestStatus = input.statusOverride
  if (input.phaseOverride) latestPhase = input.phaseOverride

  return {
    target_type: input.targetType,
    target_id: input.targetId,
    article_id: input.articleId ?? null,
    question_id: input.questionId ?? null,
    latest_phase: latestPhase,
    latest_status: latestStatus,
    highest_severity: input.highestSeverity,
    findings_count: input.findingsCount,
    open_findings_count: input.openFindingsCount,
    needs_source_check: latestStatus === 'needs_source_check' || needsSourceCheck,
    needs_correction: latestStatus === 'confirmed_wrong' || latestStatus === 'likely_wrong' || latestStatus === 'correction_proposed' || needsCorrection,
    needs_human_review: latestStatus === 'needs_human_review' || latestStatus === 'correction_proposed' || needsHumanReview,
    last_audited_at: new Date().toISOString(),
    metadata: {
      risk_type: openRiskTypes[0] ?? null,
      open_risk_types: openRiskTypes,
    },
  }
}

export function getNextAuditAction({
  latestStatus,
  sourceCount,
  openFindingsCount,
  needsHumanReview,
  needsCorrection,
}: {
  latestStatus: string | null | undefined
  sourceCount?: number | null
  openFindingsCount: number
  needsHumanReview?: boolean | null
  needsCorrection?: boolean | null
}) {
  if (!latestStatus || latestStatus === 'not_checked') return 'Start review'
  if (latestStatus === 'confirmed_wrong' || needsCorrection) return 'Prepare correction'
  if (latestStatus === 'correction_proposed') return 'Review proposal'
  if (sourceCount === 0 || latestStatus === 'needs_source_check') return 'Check sources'
  if (openFindingsCount > 0 || needsHumanReview) return 'Review finding'
  if (latestStatus === 'approved' || latestStatus === 'published') return 'No action'
  if (latestStatus === 'passed' || latestStatus === 'validated') return 'Approve'
  return 'Review status'
}

export function buildPageHref(basePath: string, params: URLSearchParams, page: number) {
  const nextParams = new URLSearchParams(params)
  if (page <= 1) nextParams.delete('page')
  else nextParams.set('page', String(page))
  const query = nextParams.toString()
  return query ? `${basePath}?${query}` : basePath
}
