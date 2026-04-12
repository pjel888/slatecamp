import { createServiceClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/admin/roles'

export interface AuditLog {
  id: string
  actor_id: string
  event_type: string
  table_name: string
  record_id: string
  metadata: Record<string, unknown>
  content_snapshot: Record<string, unknown>
  created_at: string
}

export interface AuditLogFilters {
  tableName?: string
  eventType?: string
  actorId?: string
  startDate?: string
  endDate?: string
  recordId?: string
  limit?: number
  offset?: number
}

export type AuditFeedMode = 'real' | 'fallback'

export interface AuditFeed {
  logs: AuditLog[]
  mode: AuditFeedMode
}

const buildFallbackAuditRows = async (
  filters: AuditLogFilters,
): Promise<AuditLog[]> => {
  const supabase = await createServiceClient()
  const limit = filters.limit || 50

  const includeTable = (tableName: string) =>
    !filters.tableName || filters.tableName === tableName

  const requests: Promise<AuditLog[]>[] = []

  if (includeTable('wiki_articles')) {
    requests.push(
      supabase
        .from('wiki_articles')
        .select('article_id, title, slug, status, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit)
        .then(({ data }) =>
          (data || []).map((row) => ({
            id: `wiki-${row.article_id}-${row.updated_at}`,
            actor_id: 'fallback',
            event_type: row.created_at === row.updated_at ? 'CREATE' : 'UPDATE',
            table_name: 'wiki_articles',
            record_id: row.article_id,
            metadata: { fallback: true, status: row.status },
            content_snapshot: {
              title: row.title,
              slug: row.slug,
              status: row.status,
            },
            created_at: row.updated_at,
          })),
        ),
    )
  }

  if (includeTable('questions')) {
    requests.push(
      supabase
        .from('questions')
        .select('question_id, text, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit)
        .then(({ data }) =>
          (data || []).map((row) => ({
            id: `question-${row.question_id}-${row.updated_at}`,
            actor_id: 'fallback',
            event_type: row.created_at === row.updated_at ? 'CREATE' : 'UPDATE',
            table_name: 'questions',
            record_id: row.question_id,
            metadata: { fallback: true },
            content_snapshot: {
              stem: row.text,
            },
            created_at: row.updated_at,
          })),
        ),
    )
  }

  if (includeTable('models_3d')) {
    requests.push(
      supabase
        .from('models_3d')
        .select('model_id, name, status, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit)
        .then(({ data }) =>
          (data || []).map((row) => ({
            id: `asset-${row.model_id}-${row.updated_at}`,
            actor_id: 'fallback',
            event_type: row.created_at === row.updated_at ? 'CREATE' : 'UPDATE',
            table_name: 'models_3d',
            record_id: row.model_id,
            metadata: { fallback: true, status: row.status },
            content_snapshot: {
              name: row.name,
              status: row.status,
            },
            created_at: row.updated_at,
          })),
        ),
    )
  }

  if (includeTable('taxonomy_tree')) {
    requests.push(
      supabase
        .from('taxonomy_tree')
        .select('node_id, name, lea_id, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit)
        .then(({ data }) =>
          (data || []).map((row) => ({
            id: `taxonomy-${row.node_id}-${row.updated_at}`,
            actor_id: 'fallback',
            event_type: row.created_at === row.updated_at ? 'CREATE' : 'UPDATE',
            table_name: 'taxonomy_tree',
            record_id: row.node_id,
            metadata: { fallback: true },
            content_snapshot: {
              name: row.name,
              lea_id: row.lea_id,
            },
            created_at: row.updated_at,
          })),
        ),
    )
  }

  const rows = (await Promise.all(requests)).flat()

  const recordId = filters.recordId?.toLowerCase()
  const eventType = filters.eventType?.toUpperCase()

  return rows
    .filter((row) => (!eventType || row.event_type === eventType))
    .filter((row) => (!recordId || row.record_id.toLowerCase().includes(recordId)))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(filters.offset || 0, (filters.offset || 0) + limit)
}

export async function getAuditFeed(filters: AuditLogFilters = {}): Promise<AuditFeed> {
  // Check if user is super admin
  const admin = await isSuperAdmin()
  if (!admin) {
    throw new Error('Not authorized to view audit logs')
  }

  const supabase = await createServiceClient()

  let query = supabase
    .from('audit_logs')
    .select('id, actor_id, event_type, table_name, record_id, metadata, content_snapshot, created_at')
    .order('created_at', { ascending: false })

  if (filters.tableName) {
    query = query.eq('table_name', filters.tableName)
  }
  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType)
  }
  if (filters.actorId) {
    query = query.eq('actor_id', filters.actorId)
  }
  if (filters.recordId) {
    query = query.eq('record_id', filters.recordId)
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  query = query.range(
    filters.offset || 0,
    (filters.limit || 50) + (filters.offset || 0) - 1
  )

  const { data, error } = await query

  if (error) {
    if (error.code === 'PGRST205') {
      return {
        logs: await buildFallbackAuditRows(filters),
        mode: 'fallback',
      }
    }
    throw new Error(error.message)
  }

  return {
    logs: data || [],
    mode: 'real',
  }
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
  return (await getAuditFeed(filters)).logs
}

export async function getAuditLogsByTable(tableName: string, recordId?: string): Promise<AuditLog[]> {
  return getAuditLogs({ tableName, recordId })
}

export async function getAuditLogsByActor(actorId: string): Promise<AuditLog[]> {
  return getAuditLogs({ actorId })
}

export async function getAuditLogCount(filters: AuditLogFilters = {}): Promise<number> {
  const admin = await isSuperAdmin()
  if (!admin) {
    throw new Error('Not authorized to view audit logs')
  }

  const supabase = await createServiceClient()

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })

  if (filters.tableName) {
    query = query.eq('table_name', filters.tableName)
  }
  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType)
  }

  const { count } = await query
  if (count != null) return count
  if (filters.tableName) {
    return (await buildFallbackAuditRows(filters)).length
  }
  return (await buildFallbackAuditRows(filters)).length
}
