export type AdminAiAuditTargetType = 'source_verification' | 'article_improvement' | 'question_improvement'

export type AdminAiAuditReviewStatus = 'pending_review' | 'approved' | 'rejected' | 'blocked'

export interface AdminAiAuditSourceVerificationItem {
  id: string
  targetType: AdminAiAuditTargetType
  targetId: string
  title: string
  status: AdminAiAuditReviewStatus
  sourcePackId?: string
  sourceLocator?: string
  riskLevel: 'low' | 'medium' | 'high' | 'blocked'
  evidenceHash?: string
  metadata?: Record<string, unknown>
}

export interface AdminAiAuditReadinessState {
  enabled: boolean
  source: 'fixture' | 'staging' | 'production'
  productionBlocked: boolean
  blocker?: string
  items: AdminAiAuditSourceVerificationItem[]
}
