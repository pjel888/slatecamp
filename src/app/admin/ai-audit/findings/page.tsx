import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { getAiAuditFindingRows } from '@/lib/queries/admin-ai-audit'
import { parseAiAuditListParams, labelFromValue } from '@/lib/admin/ai-audit-utils'
import { AuditEmptyState, AuditFilterForm, AuditSeverityBadge, AuditStatusBadge, GlobalManualFindingForm, PaginationControls } from '@/components/admin/ai-audit/AiAuditShared'
import { updateFindingStatus } from '@/lib/actions/admin/ai-audit'

export const metadata: Metadata = { title: 'AI Audit Findings — SlateCamp Admin' }

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const toURLSearchParams = (params: Record<string, string | string[] | undefined>) => {
  const nextParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => nextParams.append(key, entry))
    else if (value) nextParams.set(key, value)
  })
  return nextParams
}

export default async function AiAuditFindingsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseAiAuditListParams(rawParams)
  const result = await getAiAuditFindingRows(params)
  const urlParams = toURLSearchParams(rawParams)
  const returnTo = `/admin/ai-audit/findings${urlParams.toString() ? `?${urlParams.toString()}` : ''}`

  return (
    <div className="space-y-4">
      <GlobalManualFindingForm returnTo={returnTo} />

      <AuditFilterForm
        action="/admin/ai-audit/findings"
        defaults={{ q: params.q, status: params.status, severity: params.severity, riskType: params.riskType, targetType: params.targetType }}
        showTargetType
        showRisk
        placeholder="Search findings, suspect text, or next step"
      />

      <Card className="overflow-hidden">
        {result.rows.length === 0 ? (
          <AuditEmptyState title="No matching findings" description="Manual findings and future AI findings will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk Type</th>
                  <th className="px-4 py-3">Finding</th>
                  <th className="px-4 py-3">Suspect Text</th>
                  <th className="px-4 py-3">Recommended Step</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((finding) => {
                  const targetHref = finding.target_type === 'wiki_article'
                    ? `/admin/ai-audit/articles/${finding.target_id}`
                    : finding.target_type === 'question' || finding.target_type === 'design_scenario_question'
                      ? `/admin/ai-audit/questions/${finding.target_id}`
                      : '/admin/ai-audit'
                  return (
                    <tr key={finding.id} className="align-top hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link href={targetHref} className="line-clamp-2 text-xs font-medium text-primary hover:underline">{finding.target_label || labelFromValue(finding.target_type)}</Link>
                        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{finding.target_id.slice(0, 8)}</p>
                        {finding.target_snippet && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{finding.target_snippet}</p>}
                      </td>
                      <td className="px-4 py-3"><AuditSeverityBadge severity={finding.severity} /></td>
                      <td className="px-4 py-3"><AuditStatusBadge status={finding.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{labelFromValue(finding.risk_type)}</td>
                      <td className="max-w-[260px] px-4 py-3"><p className="font-medium">{finding.finding_summary}</p></td>
                      <td className="max-w-[220px] px-4 py-3 text-xs text-muted-foreground"><p className="line-clamp-3">{finding.suspect_text || '—'}</p></td>
                      <td className="max-w-[220px] px-4 py-3 text-xs text-muted-foreground"><p className="line-clamp-3">{finding.recommended_next_step || '—'}</p></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{finding.provider}{finding.model ? ` / ${finding.model}` : ''}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(finding.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Link className="text-xs font-medium text-primary hover:underline" href={`/admin/ai-audit/findings/${finding.id}`}>View detail</Link>
                          {(['confirmed', 'rejected', 'resolved', 'reopened'] as const).map((status) => (
                            <form key={status} action={updateFindingStatus}>
                              <input type="hidden" name="findingId" value={finding.id} />
                              <input type="hidden" name="status" value={status} />
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <button type="submit" className="text-left text-xs text-muted-foreground hover:text-primary">{labelFromValue(status)}</button>
                            </form>
                          ))}
                          <Link className="text-xs text-muted-foreground hover:text-primary" href={`${targetHref}?finding=${finding.id}`}>Create proposal</Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControls basePath="/admin/ai-audit/findings" searchParams={urlParams} page={result.page} pageSize={result.pageSize} total={result.count} />
      </Card>
    </div>
  )
}
