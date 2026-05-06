import 'server-only'

import path from 'node:path'
import { readFile } from 'node:fs/promises'
import type { AdminAiAuditReadinessState, AdminAiAuditSourceVerificationItem } from '@/lib/types/admin-ai-audit-source-verification'

const FIXTURE_PATH = path.join(process.cwd(), '.ai/03_plans/content-editorial-pipeline-2026-05-05/admin-audit-local-fixtures.generated.json')

function normalizeItem(raw: unknown, index: number): AdminAiAuditSourceVerificationItem {
  const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const targetType = String(row.target_type ?? row.targetType ?? 'source_verification') as AdminAiAuditSourceVerificationItem['targetType']
  return {
    id: String(row.id ?? row.source_id ?? row.article_id ?? row.question_id ?? `fixture-${index}`),
    targetType,
    targetId: String(row.target_id ?? row.source_id ?? row.article_id ?? row.question_id ?? `fixture-${index}`),
    title: String(row.title ?? row.label ?? row.source_title ?? row.article_title ?? row.question_text ?? 'Untitled review item'),
    status: 'pending_review',
    sourcePackId: typeof row.source_pack_id === 'string' ? row.source_pack_id : undefined,
    sourceLocator: typeof row.source_locator === 'string' ? row.source_locator : undefined,
    riskLevel: String(row.risk_level ?? row.severity ?? 'medium').toLowerCase().includes('high') ? 'high' : 'medium',
    evidenceHash: typeof row.hash === 'string' ? row.hash : undefined,
    metadata: row,
  }
}

export async function getAdminAiAuditSourceVerificationReadiness(): Promise<AdminAiAuditReadinessState> {
  if (process.env.SLATECAMP_ENABLE_ADMIN_AI_AUDIT_FIXTURES !== 'true') {
    return {
      enabled: false,
      source: 'fixture',
      productionBlocked: true,
      blocker: 'Admin AI audit fixture reads are disabled unless SLATECAMP_ENABLE_ADMIN_AI_AUDIT_FIXTURES=true. Production DB reads remain guarded until Supabase lineage is reconciled.',
      items: [],
    }
  }

  try {
    const parsed = JSON.parse(await readFile(FIXTURE_PATH, 'utf8')) as Record<string, unknown>
    const sections = ['source_items', 'article_items', 'question_items']
    const items = sections.flatMap((key) => Array.isArray(parsed[key]) ? (parsed[key] as unknown[]) : []).map(normalizeItem)
    return { enabled: true, source: 'fixture', productionBlocked: true, blocker: 'Fixture mode only; production Supabase lineage remains blocked.', items }
  } catch (error) {
    return { enabled: false, source: 'fixture', productionBlocked: true, blocker: error instanceof Error ? error.message : 'Fixture load failed.', items: [] }
  }
}
