import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { getAiAuditProposalRows } from '@/lib/queries/admin-ai-audit'
import { parseAiAuditListParams, labelFromValue } from '@/lib/admin/ai-audit-utils'
import { AuditEmptyState, AuditFilterForm, AuditStatusBadge, PaginationControls, ReviewNoteForm } from '@/components/admin/ai-audit/AiAuditShared'
import { updateProposalStatus } from '@/lib/actions/admin/ai-audit'

export const metadata: Metadata = { title: 'AI Audit Proposals — SlateCamp Admin' }

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const toURLSearchParams = (params: Record<string, string | string[] | undefined>) => {
  const nextParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => nextParams.append(key, entry))
    else if (value) nextParams.set(key, value)
  })
  return nextParams
}

export default async function AiAuditProposalsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseAiAuditListParams(rawParams)
  const result = await getAiAuditProposalRows(params)
  const urlParams = toURLSearchParams(rawParams)
  const returnTo = `/admin/ai-audit/proposals${urlParams.toString() ? `?${urlParams.toString()}` : ''}`

  return (
    <div className="space-y-4">
      <AuditFilterForm action="/admin/ai-audit/proposals" defaults={{ q: params.q, status: params.status, targetType: params.targetType }} showTargetType placeholder="Search proposal diff or rationale" />
      <Card className="overflow-hidden">
        {result.rows.length === 0 ? (
          <AuditEmptyState title="No staged proposals" description="Create proposals from an article, question, or finding detail page. Nothing is applied to live content in this MVP." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Proposal Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Finding</th>
                  <th className="px-4 py-3">Diff Summary</th>
                  <th className="px-4 py-3">Why Changed</th>
                  <th className="px-4 py-3">Evidence</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Reviewed</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.rows.map((proposal) => {
                  const targetHref = proposal.target_type === 'wiki_article'
                    ? `/admin/ai-audit/articles/${proposal.target_id}`
                    : proposal.target_type === 'question' || proposal.target_type === 'design_scenario_question'
                      ? `/admin/ai-audit/questions/${proposal.target_id}`
                      : '/admin/ai-audit'
                  return (
                    <tr key={proposal.id} className="align-top hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link href={targetHref} className="text-xs font-medium text-primary hover:underline">{labelFromValue(proposal.target_type)}</Link>
                        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{proposal.target_id.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{labelFromValue(proposal.proposal_type)}</td>
                      <td className="px-4 py-3"><AuditStatusBadge status={proposal.status} /></td>
                      <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] text-xs text-muted-foreground">{proposal.finding_id?.slice(0, 8) ?? '—'}</td>
                      <td className="max-w-[220px] px-4 py-3"><p className="line-clamp-3 text-sm">{proposal.diff_summary || '—'}</p></td>
                      <td className="max-w-[220px] px-4 py-3"><p className="line-clamp-3 text-xs text-muted-foreground">{proposal.why_changed || '—'}</p></td>
                      <td className="px-4 py-3 font-[family-name:var(--font-dm-mono)] text-xs text-muted-foreground">{Array.isArray(proposal.source_evidence) ? proposal.source_evidence.length : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{proposal.reviewed_at ? new Date(proposal.reviewed_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {(['approved', 'rejected', 'needs_edit'] as const).map((status) => (
                            <form key={status} action={updateProposalStatus}>
                              <input type="hidden" name="proposalId" value={proposal.id} />
                              <input type="hidden" name="status" value={status} />
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <button type="submit" className="text-left text-xs text-muted-foreground hover:text-primary">{labelFromValue(status)}</button>
                            </form>
                          ))}
                          <Link className="text-xs font-medium text-primary hover:underline" href={targetHref}>View target</Link>
                          <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer hover:text-primary">Add note</summary>
                            <div className="mt-2 min-w-[220px]">
                              <ReviewNoteForm reviewTargetType="proposal" reviewTargetId={proposal.id} returnTo={returnTo} />
                            </div>
                          </details>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <PaginationControls basePath="/admin/ai-audit/proposals" searchParams={urlParams} page={result.page} pageSize={result.pageSize} total={result.count} />
      </Card>
    </div>
  )
}
