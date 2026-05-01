import { describe, expect, test } from 'bun:test'
import {
  deriveAiAuditStatusPatch,
  getAiAuditBadgeVariant,
  getNextAuditAction,
  parseAiAuditListParams,
} from './ai-audit-utils'

describe('admin ai audit utils', () => {
  test('normalizes list params with safe pagination defaults', () => {
    expect(parseAiAuditListParams({ page: '-4', pageSize: '500', status: 'passed', q: '  roof  ' })).toEqual({
      page: 1,
      pageSize: 50,
      offset: 0,
      q: 'roof',
      status: 'passed',
      phase: undefined,
      severity: undefined,
      riskType: undefined,
      targetType: undefined,
      subject: undefined,
      articleId: undefined,
      lastAuditedSince: undefined,
      needsHumanReview: false,
      needsSourceCheck: false,
      needsCorrection: false,
      neverAudited: false,
      missingSources: false,
      hasOpenFindings: false,
      missingArticle: false,
      missingAnswerKey: false,
    })
  })

  test('maps audit statuses to stable badge variants', () => {
    expect(getAiAuditBadgeVariant('not_checked')).toBe('default')
    expect(getAiAuditBadgeVariant('passed')).toBe('success')
    expect(getAiAuditBadgeVariant('needs_source_check')).toBe('warning')
    expect(getAiAuditBadgeVariant('likely_wrong')).toBe('orange')
    expect(getAiAuditBadgeVariant('confirmed_wrong')).toBe('danger')
    expect(getAiAuditBadgeVariant('correction_proposed')).toBe('info')
  })

  test('derives status cache flags from open findings and staged proposals', () => {
    expect(deriveAiAuditStatusPatch({
      targetType: 'question',
      targetId: 'q1',
      articleId: 'a1',
      questionId: 'q1',
      openFindingsCount: 2,
      findingsCount: 3,
      highestSeverity: 'critical',
      openRiskTypes: ['answer_key_mismatch'],
      confirmedHighRiskFindingsCount: 1,
      hasPendingProposal: true,
      statusOverride: null,
      phaseOverride: null,
    })).toEqual({
      target_type: 'question',
      target_id: 'q1',
      article_id: 'a1',
      question_id: 'q1',
      latest_phase: 'tier3_correction_proposal',
      latest_status: 'correction_proposed',
      highest_severity: 'critical',
      findings_count: 3,
      open_findings_count: 2,
      needs_source_check: false,
      needs_correction: true,
      needs_human_review: true,
      last_audited_at: expect.any(String),
      metadata: {
        risk_type: 'answer_key_mismatch',
        open_risk_types: ['answer_key_mismatch'],
      },
    })
  })

  test('derives source and correction flags from risk types', () => {
    const sourcePatch = deriveAiAuditStatusPatch({
      targetType: 'wiki_article',
      targetId: 'a1',
      openFindingsCount: 1,
      findingsCount: 1,
      highestSeverity: 'medium',
      openRiskTypes: ['missing_sources'],
      hasPendingProposal: false,
    })
    expect(sourcePatch.latest_status).toBe('needs_source_check')
    expect(sourcePatch.needs_source_check).toBe(true)

    const correctionPatch = deriveAiAuditStatusPatch({
      targetType: 'question',
      targetId: 'q1',
      questionId: 'q1',
      openFindingsCount: 1,
      findingsCount: 1,
      highestSeverity: 'critical',
      openRiskTypes: ['multiple_correct_answers'],
      confirmedHighRiskFindingsCount: 1,
      hasPendingProposal: false,
    })
    expect(correctionPatch.latest_status).toBe('confirmed_wrong')
    expect(correctionPatch.needs_correction).toBe(true)
    expect(correctionPatch.needs_human_review).toBe(true)
  })

  test('suggests operational next actions from row state', () => {
    expect(getNextAuditAction({ latestStatus: 'not_checked', sourceCount: 1, openFindingsCount: 0 })).toBe('Start review')
    expect(getNextAuditAction({ latestStatus: 'passed', sourceCount: 0, openFindingsCount: 0 })).toBe('Check sources')
    expect(getNextAuditAction({ latestStatus: 'confirmed_wrong', sourceCount: 3, openFindingsCount: 1 })).toBe('Prepare correction')
    expect(getNextAuditAction({ latestStatus: 'approved', sourceCount: 3, openFindingsCount: 0 })).toBe('No action')
  })
})
