import { createAdminClient } from '@/lib/supabase/admin'

interface LogAdminActionParams {
  actorId: string
  action: string
  targetUserId?: string
  targetArticleId?: string
  targetQuestionId?: string
  targetAssetId?: string
  targetTaxonomyNodeId?: string
  metadata?: Record<string, unknown>
}

/**
 * Write an audit log entry for admin actions.
 * Maps to the existing audit_logs schema.
 * Gracefully skips logging if the insert fails for non-critical actions.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  const supabase = createAdminClient()

  const eventType = mapActionToEventType(params.action)
  const recordId =
    params.targetUserId ??
    params.targetArticleId ??
    params.targetQuestionId ??
    params.targetAssetId ??
    params.targetTaxonomyNodeId ??
    '00000000-0000-0000-0000-000000000000'

  const tableName = inferTableName(params.action)

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: params.actorId,
    event_type: eventType,
    table_name: tableName,
    record_id: recordId,
    metadata: {
      action: params.action,
      ...params.metadata,
    },
  })

  if (error) {
    // Log to console but don't throw — audit logging should not break user-facing actions
    console.error('Audit log insert failed:', error.message)
  }
}

function mapActionToEventType(action: string): string {
  if (action.includes('.create') || action.includes('.assign')) return 'CREATE'
  if (action.includes('.update') || action.includes('.edit') || action.includes('.publish') || action.includes('.approve')) return 'UPDATE'
  if (action.includes('.delete') || action.includes('.revoke') || action.includes('.archive')) return 'DELETE'
  return 'VIEW'
}

function inferTableName(action: string): string {
  if (action.includes('wiki') || action.includes('article')) return 'wiki_articles'
  if (action.includes('question')) return 'questions'
  if (action.includes('taxonomy')) return 'taxonomy_tree'
  if (action.includes('asset')) return 'models_3d'
  if (action.includes('role')) return 'user_roles'
  if (action.includes('pipeline') || action.includes('status')) return 'wiki_articles'
  return 'admin_actions'
}
