import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { getAiAuditArticleRows } from '@/lib/queries/admin-ai-audit'
import { parseAiAuditListParams, getNextAuditAction, labelFromValue } from '@/lib/admin/ai-audit-utils'
import { AuditEmptyState, AuditFilterForm, AuditPhaseChips, AuditSeverityBadge, AuditStatusBadge, PaginationControls } from '@/components/admin/ai-audit/AiAuditShared'
import { updateAuditTargetStatus } from '@/lib/actions/admin/ai-audit'

export const metadata: Metadata = { title: 'AI Audit Articles — SlateCamp Admin' }

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const toURLSearchParams = (params: Record<string, string | string[] | undefined>) => {
  const nextParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => nextParams.append(key, entry))
    else if (value) nextParams.set(key, value)
  })
  return nextParams
}

export default async function AiAuditArticlesPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseAiAuditListParams(rawParams)
  const result = await getAiAuditArticleRows(params)
  const urlParams = toURLSearchParams(rawParams)
  const returnTo = `/admin/ai-audit/articles${urlParams.toString() ? `?${urlParams.toString()}` : ''}`

  return (
    <div className="space-y-4">
      <AuditFilterForm
        action="/admin/ai-audit/articles"
        defaults={{
          q: params.q,
          status: params.status,
          phase: params.phase,
          severity: params.severity,
          subject: params.subject,
          lastAuditedSince: params.lastAuditedSince,
          missingSources: params.missingSources ? 'true' : undefined,
          needsHumanReview: params.needsHumanReview ? 'true' : undefined,
          needsSourceCheck: params.needsSourceCheck ? 'true' : undefined,
          needsCorrection: params.needsCorrection ? 'true' : undefined,
          neverAudited: params.neverAudited ? 'true' : undefined,
          hasOpenFindings: params.hasOpenFindings ? 'true' : undefined,
        }}
        showSubject
        showSourceFilters
        showLastAudited
        placeholder="Search title, slug, or preview"
      />

      <Card className="overflow-hidden">
        {result.rows.length === 0 ? (
          <AuditEmptyState title="No matching articles" description="Adjust filters or clear them to return to the full article audit list." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Sources</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Findings</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Last audited</th>
                  <th className="px-4 py-3">Next action</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((row) => (
                  <tr key={row.article_id} className="align-top hover:bg-muted/30">
                    <td className="max-w-[280px] px-4 py-3">
                      <Link href={`/admin/ai-audit/articles/${row.article_id}`} className="font-medium text-primary hover:underline">{row.title}</Link>
                      <p className="mt-1 truncate font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.subject_label ?? '—'}</td>
                    <td className="px-4 py-3"><AuditStatusBadge status={row.latest_status} /></td>
                    <td className="px-4 py-3"><AuditPhaseChips phase={row.latest_phase} status={row.latest_status} /></td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] tabular-nums">{row.source_count} <span className="text-muted-foreground">({row.verified_source_count} verified)</span></td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] tabular-nums">{row.question_count}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] tabular-nums">{row.open_findings_count}/{row.findings_count}</td>
                    <td className="px-4 py-3"><AuditSeverityBadge severity={row.highest_severity} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.last_audited_at ? new Date(row.last_audited_at).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3 text-xs">{getNextAuditAction({ latestStatus: row.latest_status, sourceCount: row.source_count, openFindingsCount: row.open_findings_count, needsHumanReview: row.needs_human_review, needsCorrection: row.needs_correction })}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link className="text-xs font-medium text-primary hover:underline" href={`/admin/ai-audit/articles/${row.article_id}`}>View detail</Link>
                        <Link className="text-xs text-muted-foreground hover:text-primary" href={`/admin/ai-audit/questions?articleId=${row.article_id}`}>Linked questions</Link>
                        <form action={updateAuditTargetStatus}>
                          <input type="hidden" name="targetType" value="wiki_article" />
                          <input type="hidden" name="targetId" value={row.article_id} />
                          <input type="hidden" name="articleId" value={row.article_id} />
                          <input type="hidden" name="phase" value="human_review" />
                          <input type="hidden" name="status" value="passed" />
                          <input type="hidden" name="decisionNotes" value="Marked manually reviewed from article table." />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button type="submit" className="text-left text-xs text-muted-foreground hover:text-primary">Mark reviewed</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControls basePath="/admin/ai-audit/articles" searchParams={urlParams} page={result.page} pageSize={result.pageSize} total={result.count} />
      </Card>

      <p className="text-xs text-muted-foreground">
        Missing status rows are treated as {labelFromValue('not_started')} / {labelFromValue('not_checked')}.
      </p>
    </div>
  )
}
