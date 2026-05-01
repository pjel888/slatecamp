import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { getAiAuditRunRows } from '@/lib/queries/admin-ai-audit'
import { parseAiAuditListParams, labelFromValue } from '@/lib/admin/ai-audit-utils'
import { AuditEmptyState, AuditFilterForm, AuditStatusBadge, ManualRunForm, PaginationControls, RunStatusForm } from '@/components/admin/ai-audit/AiAuditShared'

export const metadata: Metadata = { title: 'AI Audit Runs — SlateCamp Admin' }

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const toURLSearchParams = (params: Record<string, string | string[] | undefined>) => {
  const nextParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => nextParams.append(key, entry))
    else if (value) nextParams.set(key, value)
  })
  return nextParams
}

export default async function AiAuditRunsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseAiAuditListParams(rawParams)
  const result = await getAiAuditRunRows(params)
  const urlParams = toURLSearchParams(rawParams)
  const returnTo = `/admin/ai-audit/runs${urlParams.toString() ? `?${urlParams.toString()}` : ''}`

  return (
    <div className="space-y-4">
      <ManualRunForm returnTo={returnTo} />
      <AuditFilterForm action="/admin/ai-audit/runs" defaults={{ q: params.q, status: params.status, phase: params.phase }} placeholder="Search run type, scope, provider, or notes" />
      <Card className="overflow-hidden">
        {result.rows.length === 0 ? (
          <AuditEmptyState title="No audit runs logged" description="Manual/admin run records will appear here. This MVP does not start AI jobs." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Run Type</th>
                  <th className="px-4 py-3">Tier / Phase</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Provider / Model</th>
                  <th className="px-4 py-3">Prompt Version</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Started</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((run) => (
                  <tr key={run.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{labelFromValue(run.run_type)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{labelFromValue(run.phase)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{run.scope_type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{run.provider}{run.model ? ` / ${run.model}` : ''}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{run.prompt_version ?? '—'}</td>
                    <td className="px-4 py-3"><AuditStatusBadge status={run.status} /></td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] text-xs">{run.completed_items}/{run.total_items} · {run.flagged_items} flagged</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] text-xs">{run.cost_estimate_usd ? `$${run.cost_estimate_usd}` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(run.started_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{run.completed_at ? new Date(run.completed_at).toLocaleString() : '—'}</td>
                    <td className="min-w-[260px] px-4 py-3">
                      <div className="space-y-2">
                        <Link href={`/admin/ai-audit/runs/${run.id}`} className="text-xs font-medium text-primary hover:underline">View run items</Link>
                        <RunStatusForm runId={run.id} returnTo={returnTo} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControls basePath="/admin/ai-audit/runs" searchParams={urlParams} page={result.page} pageSize={result.pageSize} total={result.count} />
      </Card>
    </div>
  )
}
