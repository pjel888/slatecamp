'use server'

import { isSuperAdmin } from '@/lib/admin/roles'
import { getAuditFeed, type AuditFeed } from './audit-queries'

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

export async function getAuditLogsAction(filters: AuditLogFilters = {}): Promise<AuditFeed> {
  // Check if user is super admin
  const admin = await isSuperAdmin()
  if (!admin) {
    throw new Error('Not authorized to view audit logs')
  }

  return getAuditFeed(filters)
}
