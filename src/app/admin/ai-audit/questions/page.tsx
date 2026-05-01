import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { getAiAuditQuestionRows } from '@/lib/queries/admin-ai-audit'
import { parseAiAuditListParams, getNextAuditAction, labelFromValue } from '@/lib/admin/ai-audit-utils'
import { AuditEmptyState, AuditFilterForm, AuditPhaseChips, AuditSeverityBadge, AuditStatusBadge, PaginationControls } from '@/components/admin/ai-audit/AiAuditShared'
import { updateAuditTargetStatus } from '@/lib/actions/admin/ai-audit'

export const metadata: Metadata = { title: 'AI Audit Questions — SlateCamp Admin' }

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const toURLSearchParams = (params: Record<string, string | string[] | undefined>) => {
  const nextParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => nextParams.append(key, entry))
    else if (value) nextParams.set(key, value)
  })
  return nextParams
}

export default async function AiAuditQuestionsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseAiAuditListParams(rawParams)
  const result = await getAiAuditQuestionRows(params)
  const urlParams = toURLSearchParams(rawParams)
  const returnTo = `/admin/ai-audit/questions${urlParams.toString() ? `?${urlParams.toString()}` : ''}`

  return (
    <div className="space-y-4">
      <AuditFilterForm
        action="/admin/ai-audit/questions"
        defaults={{
          q: params.q,
          status: params.status,
          phase: params.phase,
          severity: params.severity,
          riskType: params.riskType,
          targetType: params.targetType,
          lastAuditedSince: params.lastAuditedSince,
          needsHumanReview: params.needsHumanReview ? 'true' : undefined,
          needsSourceCheck: params.needsSourceCheck ? 'true' : undefined,
          needsCorrection: params.needsCorrection ? 'true' : undefined,
          neverAudited: params.neverAudited ? 'true' : undefined,
          hasOpenFindings: params.hasOpenFindings ? 'true' : undefined,
          missingArticle: params.missingArticle ? 'true' : undefined,
          missingAnswerKey: params.missingAnswerKey ? 'true' : undefined,
        }}
        showTargetType
        showRisk
        showQuestionFilters
        showLastAudited
        placeholder="Search stem, linked article, or topic"
      />

      <Card className="overflow-hidden">
        {result.rows.length === 0 ? (
          <AuditEmptyState title="No matching questions" description="Adjust filters or clear them to return to the full question audit list." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1240px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Linked Article / Topic</th>
                  <th className="px-4 py-3">Answer Key</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Risk Type</th>
                  <th className="px-4 py-3">Findings</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Last audited</th>
                  <th className="px-4 py-3">Next action</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((row) => (
                  <tr key={`${row.target_type}-${row.question_id}`} className="align-top hover:bg-muted/30">
                    <td className="max-w-[320px] px-4 py-3">
                      <Link href={`/admin/ai-audit/questions/${row.question_id}`} className="line-clamp-2 font-medium text-primary hover:underline">{row.text}</Link>
                      <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.question_id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{labelFromValue(row.target_type)}</td>
                    <td className="max-w-[220px] px-4 py-3">
                      {row.article_id ? (
                        <Link className="text-xs font-medium text-primary hover:underline" href={`/admin/ai-audit/articles/${row.article_id}`}>{row.article_title ?? 'Linked article'}</Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">No linked article</span>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{row.topic_name ?? row.topic_id ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] text-xs">{row.correct_option_id || '—'}</td>
                    <td className="px-4 py-3"><AuditStatusBadge status={row.latest_status} /></td>
                    <td className="px-4 py-3"><AuditPhaseChips phase={row.latest_phase} status={row.latest_status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{labelFromValue(row.risk_type)}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] tabular-nums">{row.open_findings_count}/{row.findings_count}</td>
                    <td className="px-4 py-3"><AuditSeverityBadge severity={row.highest_severity} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.last_audited_at ? new Date(row.last_audited_at).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3 text-xs">{getNextAuditAction({ latestStatus: row.latest_status, openFindingsCount: row.open_findings_count, needsHumanReview: row.needs_human_review, needsCorrection: row.needs_correction })}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link className="text-xs font-medium text-primary hover:underline" href={`/admin/ai-audit/questions/${row.question_id}`}>View detail</Link>
                        {row.article_id && <Link className="text-xs text-muted-foreground hover:text-primary" href={`/admin/ai-audit/articles/${row.article_id}`}>View article</Link>}
                        <form action={updateAuditTargetStatus}>
                          <input type="hidden" name="targetType" value={row.target_type} />
                          <input type="hidden" name="targetId" value={row.question_id} />
                          {row.article_id && <input type="hidden" name="articleId" value={row.article_id} />}
                          <input type="hidden" name="questionId" value={row.question_id} />
                          <input type="hidden" name="phase" value="human_review" />
                          <input type="hidden" name="status" value="passed" />
                          <input type="hidden" name="decisionNotes" value="Marked manually reviewed from question table." />
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
        <PaginationControls basePath="/admin/ai-audit/questions" searchParams={urlParams} page={result.page} pageSize={result.pageSize} total={result.count} />
      </Card>
    </div>
  )
}
