'use server'

import { createClient } from '@/lib/supabase/server'
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

export async function getAuditLogsAction(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
  const supabase = await createClient()
  
  // Check if user is super admin
  const admin = await isSuperAdmin()
  if (!admin) {
    throw new Error('Not authorized to view audit logs')
  }

  let query = supabase
    .from('audit_logs')
    .select('*')
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
    throw new Error(error.message)
  }

  return data || []
}
